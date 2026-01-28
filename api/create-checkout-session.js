import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { calculateNatalChartFromLocal } from "../src/ephemeris.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map bundle/add-on IDs to Stripe price env vars
const PRICE_MAP = {
  // Bundles
  base: process.env.STRIPE_PRICE_ID_BASE,
  essential: process.env.STRIPE_PRICE_ID_ESSENTIAL,
  ultimate: process.env.STRIPE_PRICE_ID_ULTIMATE,
  // Add-ons
  compatibility: process.env.STRIPE_PRICE_ID_COMPATIBILITY,
  house_deep_dive: process.env.STRIPE_PRICE_ID_HOUSE,
  transit_report: process.env.STRIPE_PRICE_ID_TRANSIT,
  vedic_chart: process.env.STRIPE_PRICE_ID_VEDIC,
  solar_return: process.env.STRIPE_PRICE_ID_RETURN,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { bundle, addOns = [], birthData } = req.body;

    // --- Validate inputs ---
    if (!birthData) {
      return res.status(400).json({ error: "Missing birth data" });
    }

    const bundlePriceId = PRICE_MAP[bundle];
    if (!bundlePriceId) {
      return res.status(400).json({ error: `Invalid bundle: ${bundle}` });
    }

    // --- 1. Calculate chart on the server ---
    const hour = parseInt(birthData.hour, 10);
    const minute = parseInt(birthData.minute, 10);
    const period = birthData.period;

    let hour24 = hour;
    if (period === "AM") {
      hour24 = hour === 12 ? 0 : hour;
    } else {
      hour24 = hour === 12 ? 12 : hour + 12;
    }

    const chartResult = await calculateNatalChartFromLocal({
      year: parseInt(birthData.birthYear, 10),
      month: parseInt(birthData.birthMonth, 10),
      day: parseInt(birthData.birthDay, 10),
      hour: hour24,
      minute,
      locationString: birthData.location,
    });

    // --- 2. Insert order into Supabase (chart output only, no raw birth data) ---
    const { data: order, error: dbError } = await supabase
      .from("orders")
      .insert({
        chart_data: chartResult,
        product_type: bundle,
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return res.status(500).json({ error: "Failed to create order" });
    }

    const orderId = order.id;

    // --- 3. Build Stripe line items ---
    const line_items = [{ price: bundlePriceId, quantity: 1 }];

    for (const addOnId of addOns) {
      const addOnPriceId = PRICE_MAP[addOnId];
      if (addOnPriceId) {
        line_items.push({ price: addOnPriceId, quantity: 1 });
      }
    }

    // --- 4. Create Stripe Checkout Session with orderId in metadata ---
    const origin =
      process.env.NATAVIUM_BASE_URL ||
      req.headers.origin ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/preview`,
      metadata: {
        orderId,
        productType: bundle,
      },
    });

    return res.status(200).json({ url: session.url, orderId });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: err.message || "Checkout failed" });
  }
}
