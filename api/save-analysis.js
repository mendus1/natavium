import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin (Service Role)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { orderId, analysisType, content } = req.body;

  if (!orderId || !analysisType || !content) {
    return res.status(400).json({ error: 'Missing data' });
  }

  try {
    // 1. Fetch current data to ensure we don't overwrite other tabs
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('analyses')
      .eq('id', orderId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Merge new content with existing
    const existingAnalyses = currentOrder.analyses || {};
    const updatedAnalyses = {
      ...existingAnalyses,
      [analysisType]: content
    };

    // 3. Save back to DB
    const { error: updateError } = await supabase
      .from('orders')
      .update({ analyses: updatedAnalyses })
      .eq('id', orderId);

    if (updateError) throw updateError;

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Save Error:', error);
    res.status(500).json({ error: error.message });
  }
}