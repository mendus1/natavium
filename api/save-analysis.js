import { createClient } from '@supabase/supabase-js';
import { canAccessOrder, fetchOrderForAccessCheck, getClaimTokenFromRequest, getUserFromRequest } from './_auth.js';

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
    const user = await getUserFromRequest(req);
    const claimToken = getClaimTokenFromRequest(req);

    const { order, error: fetchAccessError } = await fetchOrderForAccessCheck(orderId);
    if (fetchAccessError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!canAccessOrder({ order, user, claimToken })) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 1. Fetch current data to ensure we don't overwrite other tabs
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('analyses, zodiac_system')
      .eq('id', orderId)
      .single();

    if (fetchError) throw fetchError;

    const zodiacSystem = currentOrder.zodiac_system || 'tropical';

    // Build the prefixed key (e.g., 'sidereal_natal' instead of just 'natal')
    // If the analysisType is already prefixed, use it as-is
    const isPrefixed = analysisType.startsWith('tropical_') || analysisType.startsWith('sidereal_');
    const analysisKey = isPrefixed ? analysisType : `${zodiacSystem}_${analysisType}`;

    // 2. Merge new content with existing
    // Store in consistent format: { content: "...", generatedAt: "..." }
    const existingAnalyses = currentOrder.analyses || {};
    const updatedAnalyses = {
      ...existingAnalyses,
      [analysisKey]: {
        content: content,
        generatedAt: new Date().toISOString(),
      }
    };

    console.log(`[save-analysis] Saving ${analysisKey} (${content.length} chars) for order ${orderId}`);

    // 3. Save back to DB
    const { error: updateError } = await supabase
      .from('orders')
      .update({ analyses: updatedAnalyses })
      .eq('id', orderId);

    if (updateError) throw updateError;

    res.status(200).json({ success: true, analysisKey });

  } catch (error) {
    console.error('Save Error:', error);
    res.status(500).json({ error: error.message });
  }
}