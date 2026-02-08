import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getUserFromRequest(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
  if (!token) return null;

  const supabaseAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error) return null;
  return data?.user || null;
}

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
    const userEmail = user.email;

    const baseSelect = 'id, product_type, purchased_addons, payment_status, zodiac_system, created_at, user_id, customer_email';

    const { data: claimedOrders, error: claimedError } = await supabaseAdmin
      .from('orders')
      .select(baseSelect)
      .eq('user_id', userId)
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
        .eq('customer_email', userEmail)
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
