import { canAccessOrder, fetchOrderForAccessCheck, getClaimTokenFromRequest, getUserFromRequest, supabaseAdmin } from '../lib/auth.js';

 function coercePurchasedAddons(value) {
   if (Array.isArray(value)) {
     const filtered = value.filter(v => typeof v === 'string');
     const looksLikeCharArrayJson =
       filtered.length > 10 &&
       filtered.every(v => v.length === 1) &&
       filtered.includes('[');

     if (looksLikeCharArrayJson) {
       return coercePurchasedAddons(filtered.join(''));
     }

     return filtered.map(v => v.trim()).filter(Boolean);
   }

   if (typeof value === 'string') {
     const trimmed = value.trim();
     if (!trimmed) return [];

     if (trimmed.startsWith('[')) {
       try {
         const parsed = JSON.parse(trimmed);
         return Array.isArray(parsed) ? parsed.filter(v => typeof v === 'string' && v.trim()) : [];
       } catch (e) {
         return [];
       }
     }

     return trimmed
       .split(',')
       .map(s => s.trim())
       .filter(Boolean);
   }

   return [];
 }

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    const user = await getUserFromRequest(req);
    const claimToken = getClaimTokenFromRequest(req);

    const { order, error: fetchError } = await fetchOrderForAccessCheck(id);
    if (fetchError || !order) {
      console.error('Supabase query error:', fetchError);
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!canAccessOrder({ order, user, claimToken })) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data: fullOrder, error: fullError } = await supabaseAdmin
      .from('orders')
      .select('id, product_type, purchased_addons, payment_status, chart_data, zodiac_system, analyses')
      .eq('id', id)
      .single();

    if (fullError || !fullOrder) {
      console.error('Supabase query error:', fullError);
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json({
      id: fullOrder.id,
      productType: fullOrder.product_type,
      purchasedAddons: coercePurchasedAddons(fullOrder.purchased_addons),
      chartData: fullOrder.chart_data,
      zodiacSystem: fullOrder.zodiac_system || 'tropical',
      analyses: fullOrder.analyses || {},
    });
  } catch (err) {
    console.error('Get order error:', err);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
}
