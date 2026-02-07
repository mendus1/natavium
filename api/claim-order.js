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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { orderId, claimToken } = req.body || {};

    if (!orderId || !claimToken) {
      return res.status(400).json({ error: 'Missing orderId or claimToken' });
    }

    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, claim_token, payment_status')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Order not yet paid' });
    }

    if (!order.claim_token || order.claim_token !== claimToken) {
      return res.status(403).json({ error: 'Invalid claim token' });
    }

    if (order.user_id && order.user_id !== user.id) {
      return res.status(409).json({ error: 'Order already claimed by another user' });
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ user_id: user.id })
      .eq('id', orderId);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Claim order error:', err);
    return res.status(500).json({ error: 'Failed to claim order' });
  }
}
