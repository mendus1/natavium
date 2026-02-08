import { createClient } from '@supabase/supabase-js';
import { canAccessOrder, fetchOrderForAccessCheck, getClaimTokenFromRequest, getUserFromRequest } from './_auth.js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { orderId } = req.query;
  if (!orderId) {
    return res.status(400).json({ error: 'Missing orderId' });
  }

  try {
    const user = await getUserFromRequest(req);
    const claimToken = getClaimTokenFromRequest(req);

    const { order, error: fetchError } = await fetchOrderForAccessCheck(orderId);
    if (fetchError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!canAccessOrder({ order, user, claimToken })) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data: report, error } = await supabaseAdmin
      .from('compatibility_reports')
      .select('id, order_id, zodiac_system, partner_birth_data, label, analysis, created_at')
      .eq('order_id', orderId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ report: report || null });
  } catch (err) {
    console.error('Get compatibility error:', err);
    return res.status(500).json({ error: 'Failed to fetch compatibility report' });
  }
}
