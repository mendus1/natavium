const Stripe = require("stripe");

// Server-side only (never expose this key in the browser)
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Use your real domain later; for now we use the request origin
    const origin =
      process.env.NATAVIUM_BASE_URL ||
      req.headers.origin ||
      "http://localhost:3000";

    // If you're using HashRouter, success/cancel URLs should include #/
    // If you're using BrowserRouter, remove the # and use /success etc.
    const successUrl = `${origin}/#/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/#/preview`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // price_123...
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: err.message || "Stripe error" });
  }
};
