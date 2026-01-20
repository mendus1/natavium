const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Map bundle/add-on IDs to environment variable names
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

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { bundle, addOns = [] } = req.body;

    // Build line items array
    const line_items = [];

    // Add bundle
    const bundlePriceId = PRICE_MAP[bundle];
    if (!bundlePriceId) {
      return res.status(400).json({ error: `Invalid bundle: ${bundle}` });
    }
    line_items.push({
      price: bundlePriceId,
      quantity: 1,
    });

    // Add selected add-ons
    for (const addOnId of addOns) {
      const addOnPriceId = PRICE_MAP[addOnId];
      if (addOnPriceId) {
        line_items.push({
          price: addOnPriceId,
          quantity: 1,
        });
      }
    }

    const origin =
      process.env.NATAVIUM_BASE_URL ||
      req.headers.origin ||
      "http://localhost:3000";

    const successUrl = `${origin}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/preview`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: err.message || "Stripe error" });
  }
};
