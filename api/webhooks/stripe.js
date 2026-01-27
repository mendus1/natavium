import Stripe from 'stripe';
import { buffer } from 'micro';

// 1. Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 2. Critical: Disable Vercel's default body parser
// We need the raw stream to verify the signature
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
    // 3. Get the raw body buffer
    const buf = await buffer(req);
    
    // 4. Get the signature from the headers
    const sig = req.headers['stripe-signature'];

    // 5. Verify the event came from Stripe (and not a hacker)
    // process.env.STRIPE_WEBHOOK_SECRET comes from your Dashboard
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);

  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 6. Handle the specific event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // THIS IS WHERE THE MAGIC HAPPENS
    console.log('💰 Payment Successful!');
    console.log('User Email:', session.customer_details.email);
    console.log('Product ID:', session.metadata.productId); // Assuming you passed this in metadata
    
    // TODO (When we add Database):
    // await db.users.update({ email: session.customer_details.email, hasPaid: true })
    // TODO (Optional): Send email receipt via Resend/SendGrid
  }

  // 7. Return 200 OK to Stripe immediately
  res.json({ received: true });
}