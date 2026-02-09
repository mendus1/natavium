import { getUserFromRequest, supabaseAdmin } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = user.id;
    const userEmail = typeof user.email === 'string' ? user.email.trim() : null;

    const baseSelect = 'id, product_type, purchased_addons, payment_status, zodiac_system, created_at, user_id, customer_email, chart_data';

    const { data: claimedOrders, error: claimedError } = await supabaseAdmin
      .from('orders')
      .select(baseSelect)
      .eq('user_id', userId)
      .eq('payment_status', 'paid')
      .order('id', { ascending: false });

    if (claimedError) {
      return res.status(500).json({ error: claimedError.message });
    }

    let emailOrders = [];
    if (userEmail) {
      const { data: unclaimedOrders, error: unclaimedError } = await supabaseAdmin
        .from('orders')
        .select(baseSelect)
        .is('user_id', null)
        .ilike('customer_email', userEmail)
        .eq('payment_status', 'paid')
        .order('id', { ascending: false });

      if (unclaimedError) {
        return res.status(500).json({ error: unclaimedError.message });
      }

      emailOrders = unclaimedOrders || [];
    }

    const byId = new Map();
    [...(claimedOrders || []), ...emailOrders].forEach((o) => {
      if (o?.id) byId.set(o.id, o);
    });

    const orders = Array.from(byId.values()).sort((a, b) => {
      const aId = String(a?.id || '');
      const bId = String(b?.id || '');
      return bId.localeCompare(aId);
    });

    return res.status(200).json({ orders });
  } catch (err) {
    console.error('List orders error:', err);
    return res.status(500).json({ error: 'Failed to list orders' });
  }
}
