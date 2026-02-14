// api/claim-order.js
// Supports action: 'claim' (default) - claim single order by ID/token
//                  'claim-email' - claim all unclaimed orders matching user email
import { getUserFromRequest, supabaseAdmin } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action = 'claim', orderId, claimToken } = req.body || {};

    // --- claim-email: bulk claim all unclaimed orders by email ---
    if (action === 'claim-email') {
      const userEmail = typeof user.email === 'string' ? user.email.trim() : null;
      if (!userEmail) {
        return res.status(400).json({ error: 'User email not available' });
      }

      const { data: unclaimed, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('id')
        .is('user_id', null)
        .eq('payment_status', 'paid')
        .ilike('customer_email', userEmail)
        .order('id', { ascending: false });

      if (fetchError) {
        return res.status(500).json({ error: fetchError.message });
      }

      const orderIds = (unclaimed || []).map((o) => o?.id).filter(Boolean);
      if (orderIds.length === 0) {
        return res.status(200).json({ success: true, claimedCount: 0 });
      }

      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ user_id: user.id })
        .in('id', orderIds)
        .is('user_id', null);

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }

      return res.status(200).json({ success: true, claimedCount: orderIds.length });
    }

    // --- claim: single order by ID ---
    if (!orderId) {
      return res.status(400).json({ error: 'Missing orderId' });
    }

    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, claim_token, payment_status, customer_email')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Order not yet paid' });
    }

    const canClaimViaToken = Boolean(claimToken && order.claim_token && order.claim_token === claimToken);
    const userEmail = typeof user?.email === 'string' ? user.email.trim().toLowerCase() : null;
    const orderEmail = typeof order?.customer_email === 'string' ? order.customer_email.trim().toLowerCase() : null;
    const canClaimViaEmail = Boolean(userEmail && orderEmail && userEmail === orderEmail);

    if (!canClaimViaToken && !canClaimViaEmail) {
      if (claimToken) {
        return res.status(403).json({ error: 'Invalid claim token' });
      }
      return res.status(403).json({ error: 'Order email does not match signed-in user' });
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
