import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Reverse mapping: Stripe price ID -> add-on ID (base IDs without zodiac prefix)
// The zodiac prefix is applied based on the order's zodiac_system
const PRICE_TO_ADDON = {
  // Tropical-specific price IDs
  [process.env.STRIPE_PRICE_ID_TROPICAL_COMPATIBILITY]: 'compatibility',
  [process.env.STRIPE_PRICE_ID_TROPICAL_HOUSE]: 'house_deep_dive',
  [process.env.STRIPE_PRICE_ID_TROPICAL_TRANSIT]: 'transit_report',
  [process.env.STRIPE_PRICE_ID_TROPICAL_SOLAR_RETURN]: 'solar_return',
  // Sidereal-specific price IDs
  [process.env.STRIPE_PRICE_ID_SIDEREAL_COMPATIBILITY]: 'compatibility',
  [process.env.STRIPE_PRICE_ID_SIDEREAL_HOUSE]: 'house_deep_dive',
  [process.env.STRIPE_PRICE_ID_SIDEREAL_TRANSIT]: 'transit_report',
  [process.env.STRIPE_PRICE_ID_SIDEREAL_SOLAR_RETURN]: 'solar_return',
  // Legacy (backwards compat)
  [process.env.STRIPE_PRICE_ID_COMPATIBILITY]: 'compatibility',
  [process.env.STRIPE_PRICE_ID_HOUSE]: 'house_deep_dive',
  [process.env.STRIPE_PRICE_ID_TRANSIT]: 'transit_report',
  [process.env.STRIPE_PRICE_ID_RETURN]: 'solar_return',
};

// Bundle contents (products included for free)
// Base add-on IDs - will be prefixed with zodiac system
const BASE_ESSENTIAL_INCLUDES = ['natal', 'house_deep_dive', 'solar_return'];
const BASE_ULTIMATE_INCLUDES = ['natal', 'house_deep_dive', 'solar_return', 'transit_report', 'compatibility'];

// Helper to prefix add-ons with zodiac system
function prefixAddons(addons, zodiacSystem) {
  return addons.map(addon => `${zodiacSystem}_${addon}`);
}

// Disable Vercel's default body parser — we need the raw buffer for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  let event;

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    const productType = session.metadata?.productType;
    const zodiacSystem = session.metadata?.zodiacSystem || 'tropical';
    const isAddonPurchase = session.metadata?.isAddonPurchase === 'true';

    if (!orderId) {
      console.error('Webhook: No orderId in session metadata');
      return res.json({ received: true });
    }

    // Extract purchased add-ons from line items (base IDs)
    let newAddons = [];
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      newAddons = lineItems.data
        .map(item => PRICE_TO_ADDON[item.price?.id])
        .filter(Boolean);
    } catch (lineItemsError) {
      console.error('Failed to fetch line items:', lineItemsError);
    }

    // Prefix new add-ons with zodiac system
    const prefixedNewAddons = prefixAddons(newAddons, zodiacSystem);

    if (isAddonPurchase) {
      // Add-on purchase: merge with existing add-ons
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('purchased_addons')
        .eq('id', orderId)
        .single();

      const existingAddons = existingOrder?.purchased_addons || [];
      const mergedAddons = [...new Set([...existingAddons, ...prefixedNewAddons])];

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          purchased_addons: mergedAddons,
        })
        .eq('id', orderId);

      if (updateError) {
        console.error(`Supabase update error for add-on purchase ${orderId}:`, updateError);
      } else {
        console.log(`Order ${orderId} updated with new add-ons: ${prefixedNewAddons.join(', ')}`);
      }
    } else {
      // Initial order: apply bundle benefits
      // Extract base bundle type from prefixed productType (e.g., 'tropical_essential' -> 'essential')
      const baseBundleType = productType?.replace(/^(tropical|sidereal)_/, '') || productType;

      // Determine which add-ons are included in the bundle
      let bundleIncludes = [];
      if (baseBundleType === 'ultimate') {
        bundleIncludes = prefixAddons(BASE_ULTIMATE_INCLUDES, zodiacSystem);
      } else if (baseBundleType === 'essential') {
        bundleIncludes = prefixAddons(BASE_ESSENTIAL_INCLUDES, zodiacSystem);
      } else {
        // Base bundle: just natal
        bundleIncludes = prefixAddons(['natal'], zodiacSystem);
      }

      // Combine purchased add-ons with bundle includes
      const purchasedAddons = [...new Set([...prefixedNewAddons, ...bundleIncludes])];

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          stripe_session_id: session.id,
          customer_email: session.customer_details?.email || null,
          purchased_addons: purchasedAddons,
        })
        .eq('id', orderId);

      if (updateError) {
        console.error(`Supabase update error for order ${orderId}:`, updateError);
      } else {
        console.log(`Order ${orderId} marked as paid with add-ons: ${purchasedAddons.join(', ') || 'none'}`);
      }
    }
  }

  res.json({ received: true });
}
