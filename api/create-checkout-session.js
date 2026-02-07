import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map bundle/add-on IDs to Stripe price env vars
// Products are prefixed with zodiac system: tropical_ or sidereal_
const PRICE_MAP = {
  // Tropical bundles
  tropical_base: process.env.STRIPE_PRICE_ID_BASE_TROP || process.env.STRIPE_PRICE_ID_BASE,
  tropical_essential: process.env.STRIPE_PRICE_ID_ESSENTIAL_TROP || process.env.STRIPE_PRICE_ID_ESSENTIAL,
  tropical_ultimate: process.env.STRIPE_PRICE_ID_ULTIMATE_TROP || process.env.STRIPE_PRICE_ID_ULTIMATE,
  // Sidereal bundles
  sidereal_base: process.env.STRIPE_PRICE_ID_BASE_SIDE || process.env.STRIPE_PRICE_ID_BASE,
  sidereal_essential: process.env.STRIPE_PRICE_ID_ESSENTIAL_SIDE || process.env.STRIPE_PRICE_ID_ESSENTIAL,
  sidereal_ultimate: process.env.STRIPE_PRICE_ID_ULTIMATE_SIDE || process.env.STRIPE_PRICE_ID_ULTIMATE,
  // Tropical add-ons
  tropical_compatibility: process.env.STRIPE_PRICE_ID_COMPATIBILITY_TROP || process.env.STRIPE_PRICE_ID_COMPATIBILITY,
  tropical_house_deep_dive: process.env.STRIPE_PRICE_ID_HOUSE_TROP || process.env.STRIPE_PRICE_ID_HOUSE,
  tropical_transit_report: process.env.STRIPE_PRICE_ID_TRANSIT_TROP || process.env.STRIPE_PRICE_ID_TRANSIT,
  tropical_solar_return: process.env.STRIPE_PRICE_ID_RETURN_TROP || process.env.STRIPE_PRICE_ID_RETURN,
  // Sidereal add-ons
  sidereal_compatibility: process.env.STRIPE_PRICE_ID_COMPATIBILITY_SIDE || process.env.STRIPE_PRICE_ID_COMPATIBILITY,
  sidereal_house_deep_dive: process.env.STRIPE_PRICE_ID_HOUSE_SIDE || process.env.STRIPE_PRICE_ID_HOUSE,
  sidereal_transit_report: process.env.STRIPE_PRICE_ID_TRANSIT_SIDE || process.env.STRIPE_PRICE_ID_TRANSIT,
  sidereal_solar_return: process.env.STRIPE_PRICE_ID_RETURN_SIDE || process.env.STRIPE_PRICE_ID_RETURN,
  // Legacy (backwards compat) - map to tropical
  base: process.env.STRIPE_PRICE_ID_BASE,
  essential: process.env.STRIPE_PRICE_ID_ESSENTIAL,
  ultimate: process.env.STRIPE_PRICE_ID_ULTIMATE,
  compatibility: process.env.STRIPE_PRICE_ID_COMPATIBILITY,
  house_deep_dive: process.env.STRIPE_PRICE_ID_HOUSE,
  transit_report: process.env.STRIPE_PRICE_ID_TRANSIT,
  solar_return: process.env.STRIPE_PRICE_ID_RETURN,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { bundle, addOns = [], chartData, birthData, zodiacSystem = 'tropical' } = req.body;

    // --- Validate inputs ---
    // Support both old flat format and new { tropical, sidereal, meta } format
    const activeChart = chartData?.tropical ? chartData[zodiacSystem] : chartData;
    if (!activeChart || !activeChart.sun?.sign || !activeChart.moon?.sign || !activeChart.rising?.sign) {
      return res.status(400).json({ error: "Missing or incomplete chart data" });
    }

    // Prefix bundle with zodiac system
    const prefixedBundle = `${zodiacSystem}_${bundle}`;
    const bundlePriceId = PRICE_MAP[prefixedBundle] || PRICE_MAP[bundle];
    if (!bundlePriceId) {
      return res.status(400).json({ error: `Invalid bundle: ${bundle}` });
    }

    // --- 1. Insert order into Supabase ---
    // Store birthData in chart_data.meta for later retrieval
    const chartDataWithBirth = {
      ...chartData,
      meta: {
        ...(chartData?.meta || {}),
        birthData: birthData || {},
      },
    };

    const claimToken = crypto.randomBytes(24).toString('hex');

    const { data: order, error: dbError } = await supabase
      .from("orders")
      .insert({
        chart_data: chartDataWithBirth,
        product_type: prefixedBundle,
        zodiac_system: zodiacSystem,
        payment_status: "pending",
        claim_token: claimToken,
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

    // Prefix add-ons with zodiac system
    for (const addOnId of addOns) {
      const prefixedAddOnId = `${zodiacSystem}_${addOnId}`;
      const addOnPriceId = PRICE_MAP[prefixedAddOnId] || PRICE_MAP[addOnId];
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
        productType: prefixedBundle,
        zodiacSystem,
        claimToken,
      },
    });

    return res.status(200).json({ url: session.url, orderId, claimToken });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: err.message || "Checkout failed" });
  }
}
