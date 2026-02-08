import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { canAccessOrder, fetchOrderForAccessCheck, getClaimTokenFromRequest, getUserFromRequest } from '../lib/auth.js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function formatDegree(planet) {
  const deg = planet?.degree ?? '?';
  const min = planet?.minutes ?? 0;
  return `${deg}° ${String(min).padStart(2, '0')}'`;
}

function formatChartForPrompt(chartResult, title) {
  if (!chartResult?.sun?.sign) {
    return `${title}: (missing chart)`;
  }

  return `## ${title}
- Sun: ${chartResult.sun.sign} (${formatDegree(chartResult.sun)}) House ${chartResult.sun.house ?? '?'}
- Moon: ${chartResult.moon.sign} (${formatDegree(chartResult.moon)}) House ${chartResult.moon.house ?? '?'}
- Rising: ${chartResult.rising.sign} (${formatDegree(chartResult.rising)})
- Mercury: ${chartResult.mercury.sign} (${formatDegree(chartResult.mercury)}) House ${chartResult.mercury.house ?? '?'}
- Venus: ${chartResult.venus.sign} (${formatDegree(chartResult.venus)}) House ${chartResult.venus.house ?? '?'}
- Mars: ${chartResult.mars.sign} (${formatDegree(chartResult.mars)}) House ${chartResult.mars.house ?? '?'}
- Jupiter: ${chartResult.jupiter.sign} (${formatDegree(chartResult.jupiter)}) House ${chartResult.jupiter.house ?? '?'}
- Saturn: ${chartResult.saturn.sign} (${formatDegree(chartResult.saturn)}) House ${chartResult.saturn.house ?? '?'}
- Uranus: ${chartResult.uranus.sign} (${formatDegree(chartResult.uranus)}) House ${chartResult.uranus.house ?? '?'}
- Neptune: ${chartResult.neptune.sign} (${formatDegree(chartResult.neptune)}) House ${chartResult.neptune.house ?? '?'}
- Pluto: ${chartResult.pluto.sign} (${formatDegree(chartResult.pluto)}) House ${chartResult.pluto.house ?? '?'}
`;
}

function buildCompatibilityPrompt({ zodiacSystem, subjectChart, partnerChart }) {
  const systemLine = zodiacSystem === 'sidereal'
    ? 'ZODIAC SYSTEM: SIDEREAL (Fagan-Bradley ayanamsa)'
    : 'ZODIAC SYSTEM: TROPICAL (Western)';

  return `You are an expert relationship astrologer specializing in synastry.

Your task is to produce a detailed compatibility analysis between **two** people using the two sets of chart placements below.

${systemLine}

IMPORTANT:
- Treat the first chart as **Person A** and the second chart as **Person B**.
- Perform *synastry* (A-to-B and B-to-A), not two separate natal readings.
- You are given sign + degree + house for each body. Use the **degrees** to estimate inter-aspects.
- Use these aspect orbs as a guideline (approximate is fine):
  - Conjunction / Opposition: up to 8°
  - Trine / Square: up to 6°
  - Sextile: up to 4°
- Focus primarily on Sun/Moon/Asc, Venus/Mars, Mercury, Saturn. Outer planets are secondary.
- Avoid fatalistic language. Keep it practical and supportive.

${formatChartForPrompt(subjectChart, 'Person A (Chart A)')}
${formatChartForPrompt(partnerChart, 'Person B (Chart B)')}

Write the compatibility report structured as chapters:

## Chapter 1: Relationship Overview
Summarize the core dynamic, chemistry, and the “why this works / why this is challenging” in plain language.

## Chapter 2: Emotional Bond (Moon)
Discuss emotional needs, attachment style, soothing patterns, and emotional triggers between A and B.

## Chapter 3: Attraction & Intimacy (Venus/Mars)
Describe romantic style, desire, pacing, affection, and polarity. Call out 2-4 likely strongest Venus/Mars links.

## Chapter 4: Communication (Mercury)
How they talk, repair conflict, understand each other, and where misunderstandings happen.

## Chapter 5: Commitment & Longevity (Saturn)
Discuss stabilizing factors, responsibilities, and how to build something real together.

## Chapter 6: Friction Points & Growth Work
Name the top 3 challenges and give actionable “what to do instead” advice.

## Chapter 7: Practical Playbook
Give:
- 3 Green Flags to lean into
- 3 Red Flags to watch
- 5 concrete habits/rituals that make this relationship thrive

Length: 1500-2200 words.`;
}

async function getOrderOrFail({ orderId, req, res }) {
  const user = await getUserFromRequest(req);
  const claimToken = getClaimTokenFromRequest(req);

  const { order, error: fetchError } = await fetchOrderForAccessCheck(orderId);
  if (fetchError || !order) {
    res.status(404).json({ error: 'Order not found' });
    return null;
  }

  if (!canAccessOrder({ order, user, claimToken })) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }

  return { user, claimToken };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { orderId } = req.query;
    if (!orderId) return res.status(400).json({ error: 'Missing orderId' });

    try {
      const access = await getOrderOrFail({ orderId, req, res });
      if (!access) return;

      const { data: report, error } = await supabaseAdmin
        .from('compatibility_reports')
        .select('id, order_id, zodiac_system, partner_birth_data, label, analysis, created_at')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ report: report || null });
    } catch (err) {
      console.error('Get compatibility error:', err);
      return res.status(500).json({ error: 'Failed to fetch compatibility report' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { orderId, partnerBirthData, partnerChartData, label } = req.body || {};

      if (!orderId || !partnerBirthData || !partnerChartData) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const access = await getOrderOrFail({ orderId, req, res });
      if (!access) return;
      const { user } = access;

      const { data: fullOrder, error: fullError } = await supabaseAdmin
        .from('orders')
        .select('id, user_id, purchased_addons, chart_data, zodiac_system, payment_status')
        .eq('id', orderId)
        .single();

      if (fullError || !fullOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const zodiacSystem = fullOrder.zodiac_system || 'tropical';
      const purchasedAddons = fullOrder.purchased_addons || [];

      const hasCompatibility = purchasedAddons.includes(`${zodiacSystem}_compatibility`) || purchasedAddons.includes('compatibility');
      if (!hasCompatibility) {
        return res.status(403).json({ error: 'Compatibility not purchased for this order' });
      }

      const subjectChart = fullOrder.chart_data?.[zodiacSystem] || fullOrder.chart_data;
      const partnerChart = partnerChartData?.[zodiacSystem] || partnerChartData;

      if (!subjectChart?.sun?.sign || !partnerChart?.sun?.sign) {
        return res.status(400).json({ error: 'Invalid chart data' });
      }

      const existing = await supabaseAdmin
        .from('compatibility_reports')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle();

      if (existing?.data?.id) {
        return res.status(409).json({ error: 'Compatibility report already exists for this order' });
      }

      const prompt = buildCompatibilityPrompt({
        zodiacSystem,
        subjectChart,
        partnerChart,
      });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2600,
        temperature: 0.7,
      });

      const content = completion.choices?.[0]?.message?.content || '';
      if (!content) {
        return res.status(500).json({ error: 'Failed to generate compatibility report' });
      }

      const insertPayload = {
        order_id: orderId,
        user_id: fullOrder.user_id || user?.id || null,
        zodiac_system: zodiacSystem,
        partner_birth_data: partnerBirthData,
        partner_chart_data: partnerChartData,
        label: label || null,
        analysis: {
          content,
          generatedAt: new Date().toISOString(),
        },
      };

      const { data: report, error: insertError } = await supabaseAdmin
        .from('compatibility_reports')
        .insert(insertPayload)
        .select('id, order_id, zodiac_system, partner_birth_data, label, analysis, created_at')
        .single();

      if (insertError) {
        return res.status(500).json({ error: insertError.message });
      }

      return res.status(200).json({ report });
    } catch (err) {
      console.error('Create compatibility error:', err);
      return res.status(500).json({ error: err.message || 'Failed to create compatibility report' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
