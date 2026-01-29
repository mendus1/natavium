import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Reverse mapping: Stripe price ID -> add-on ID
const PRICE_TO_ADDON = {
  [process.env.STRIPE_PRICE_ID_COMPATIBILITY]: 'compatibility',
  [process.env.STRIPE_PRICE_ID_HOUSE]: 'house_deep_dive',
  [process.env.STRIPE_PRICE_ID_TRANSIT]: 'transit_report',
  [process.env.STRIPE_PRICE_ID_VEDIC]: 'vedic_chart',
  [process.env.STRIPE_PRICE_ID_RETURN]: 'solar_return',
};

// Bundle contents (products included for free):
// - Base: Natal only (no add-ons included)
// - Essential: Natal + House Deep Dive + Solar Return
// - Ultimate: Essential + Vedic + Transit + Compatibility
const ESSENTIAL_BUNDLE_INCLUDES = ['house_deep_dive', 'solar_return'];
const ULTIMATE_BUNDLE_INCLUDES = ['house_deep_dive', 'solar_return', 'vedic_chart', 'transit_report', 'compatibility'];

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

    if (!orderId) {
      console.error('Webhook: No orderId in session metadata');
      return res.json({ received: true });
    }

    // Extract purchased add-ons from line items
    let purchasedAddons = [];
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      purchasedAddons = lineItems.data
        .map(item => PRICE_TO_ADDON[item.price?.id])
        .filter(Boolean);
    } catch (lineItemsError) {
      console.error('Failed to fetch line items:', lineItemsError);
    }

    // Apply bundle benefits based on product type
    let bundleIncludes = [];
    if (productType === 'ultimate') {
      bundleIncludes = ULTIMATE_BUNDLE_INCLUDES;
    } else if (productType === 'essential') {
      bundleIncludes = ESSENTIAL_BUNDLE_INCLUDES;
    }

    for (const addon of bundleIncludes) {
      if (!purchasedAddons.includes(addon)) {
        purchasedAddons.push(addon);
      }
    }

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

  res.json({ received: true });
}
