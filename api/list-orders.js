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

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, product_type, purchased_addons, payment_status, zodiac_system, created_at, user_id, customer_email')
      .or(
        [
          `user_id.eq.${userId}`,
          userEmail ? `and(user_id.is.null,customer_email.eq.${userEmail})` : null,
        ].filter(Boolean).join(',')
      )
      .order('id', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ orders: orders || [] });
  } catch (err) {
    console.error('List orders error:', err);
    return res.status(500).json({ error: 'Failed to list orders' });
  }
}
