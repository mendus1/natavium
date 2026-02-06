import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map add-on IDs to Stripe price env vars
// Supports both prefixed (tropical_compatibility) and unprefixed (compatibility) keys
const ADDON_PRICE_MAP = {
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
  // Legacy (backwards compat)
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
    const { orderId, addOns = [] } = req.body;

    // Validate inputs
    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    if (!addOns.length) {
      return res.status(400).json({ error: "No add-ons selected" });
    }

    // Verify order exists and is paid
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, payment_status, purchased_addons, zodiac_system")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.payment_status !== "paid") {
      return res.status(400).json({ error: "Original order not yet paid" });
    }

    const zodiacSystem = order.zodiac_system || 'tropical';

    // Filter out already purchased add-ons (check both prefixed and unprefixed)
    const existingAddons = order.purchased_addons || [];
    const newAddOns = addOns.filter((addon) => {
      const prefixed = `${zodiacSystem}_${addon}`;
      const alreadyOwned = existingAddons.includes(addon) || existingAddons.includes(prefixed);
      const hasPrice = ADDON_PRICE_MAP[prefixed] || ADDON_PRICE_MAP[addon];
      return !alreadyOwned && hasPrice;
    });

    if (!newAddOns.length) {
      return res.status(400).json({ error: "All selected add-ons already purchased" });
    }

    // Build Stripe line items (prefer prefixed price IDs)
    const line_items = newAddOns
      .map((addOnId) => {
        const prefixed = `${zodiacSystem}_${addOnId}`;
        const priceId = ADDON_PRICE_MAP[prefixed] || ADDON_PRICE_MAP[addOnId];
        return priceId ? { price: priceId, quantity: 1 } : null;
      })
      .filter(Boolean);

    if (!line_items.length) {
      return res.status(400).json({ error: "No valid add-ons found" });
    }

    // Create Stripe Checkout Session
    const origin =
      process.env.NATAVIUM_BASE_URL ||
      req.headers.origin ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${origin}/chart?addon_success=true`,
      cancel_url: `${origin}/chart`,
      metadata: {
        orderId,
        isAddonPurchase: "true",
        addOns: newAddOns.join(","),
        zodiacSystem,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Add-on checkout error:", err);
    return res.status(500).json({ error: err.message || "Checkout failed" });
  }
}
