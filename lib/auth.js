import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getUserFromRequest(req) {
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

export function getClaimTokenFromRequest(req) {
  return (
    req.headers['x-claim-token'] ||
    req.headers['X-Claim-Token'] ||
    req.query?.claimToken ||
    req.body?.claimToken ||
    null
  );
}

export async function fetchOrderForAccessCheck(orderId) {
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, user_id, claim_token, payment_status')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return { order: null, error: error || new Error('Order not found') };
  }

  return { order, error: null };
}

export function canAccessOrder({ order, user, claimToken }) {
  if (!order) return false;
  if (order.payment_status !== 'paid') return false;

  if (user?.id && order.user_id && order.user_id === user.id) return true;

  if (claimToken && order.claim_token && claimToken === order.claim_token) return true;

  return false;
}
