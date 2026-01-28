import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, product_type, purchased_addons, payment_status, chart_data')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Order not yet paid' });
    }

    return res.status(200).json({
      id: order.id,
      productType: order.product_type,
      purchasedAddons: order.purchased_addons || [],
      chartData: order.chart_data,
    });
  } catch (err) {
    console.error('Get order error:', err);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
}
