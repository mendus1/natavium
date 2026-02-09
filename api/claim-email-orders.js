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
  } catch (err) {
    console.error('Claim email orders error:', err);
    return res.status(500).json({ error: 'Failed to claim orders' });
  }
}
