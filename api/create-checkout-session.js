import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

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
    const { bundle, addOns = [], chartData } = req.body;

    // --- Validate inputs ---
    if (!chartData || !chartData.sun?.sign || !chartData.moon?.sign || !chartData.rising?.sign) {
      return res.status(400).json({ error: "Missing or incomplete chart data" });
    }

    const bundlePriceId = PRICE_MAP[bundle];
    if (!bundlePriceId) {
      return res.status(400).json({ error: `Invalid bundle: ${bundle}` });
    }

    // --- 1. Insert order into Supabase ---
    const { data: order, error: dbError } = await supabase
      .from("orders")
      .insert({
        chart_data: chartData,
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

    // --- 2. Build Stripe line items ---
    const line_items = [{ price: bundlePriceId, quantity: 1 }];

    for (const addOnId of addOns) {
      const addOnPriceId = PRICE_MAP[addOnId];
      if (addOnPriceId) {
        line_items.push({ price: addOnPriceId, quantity: 1 });
      }
    }

    // --- 3. Create Stripe Checkout Session with orderId in metadata ---
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
