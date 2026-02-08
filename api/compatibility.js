import { createClient } from '@supabase/supabase-js';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const config = {
  runtime: 'edge',
};

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getHeader(req, name) {
  return req.headers.get(name) || req.headers.get(name.toLowerCase()) || null;
}

function getBearerToken(req) {
  const authHeader = getHeader(req, 'authorization') || getHeader(req, 'Authorization');
  if (!authHeader) return null;
  return authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
}

async function getUserFromRequest(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  const supabaseAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error) return null;
  return data?.user || null;
}

function getClaimTokenFromRequest(req) {
  return getHeader(req, 'X-Claim-Token');
}

async function fetchOrderForAccessCheck(orderId) {
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

function canAccessOrder({ order, user, claimToken }) {
  if (!order) return false;
  if (order.payment_status !== 'paid') return false;
  if (user?.id && order.user_id && order.user_id === user.id) return true;
  if (claimToken && order.claim_token && claimToken === order.claim_token) return true;
  return false;
}

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

Length: 900-1300 words.`;
}

async function getOrderOrFail({ orderId, req }) {
  const user = await getUserFromRequest(req);
  const claimToken = getClaimTokenFromRequest(req);

  const { order, error: fetchError } = await fetchOrderForAccessCheck(orderId);
  if (fetchError || !order) {
    return { ok: false, status: 404, error: 'Order not found' };
  }

  if (!canAccessOrder({ order, user, claimToken })) {
    return { ok: false, status: 403, error: 'Forbidden' };
  }

  return { ok: true, user, claimToken };
}

export default async function handler(req) {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId') || url.searchParams.get('id') || getHeader(req, 'X-Order-Id');
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Missing orderId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const access = await getOrderOrFail({ orderId, req });
    if (!access.ok) {
      return new Response(JSON.stringify({ error: access.error }), {
        status: access.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const { data: report, error } = await supabaseAdmin
        .from('compatibility_reports')
        .select('id, order_id, zodiac_system, partner_birth_data, label, analysis, created_at')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ report: report || null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Get compatibility error:', err);
      return new Response(JSON.stringify({ error: 'Failed to fetch compatibility report' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const url = new URL(req.url);
      const body = await req.json().catch(() => ({}));

      const { partnerBirthData, partnerChartData, label } = body || {};
      const orderId = body?.orderId || url.searchParams.get('orderId') || url.searchParams.get('id') || getHeader(req, 'X-Order-Id');

      if (!orderId || !partnerBirthData || !partnerChartData) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const access = await getOrderOrFail({ orderId, req });
      if (!access.ok) {
        return new Response(JSON.stringify({ error: access.error }), {
          status: access.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const { user } = access;

      const { data: fullOrder, error: fullError } = await supabaseAdmin
        .from('orders')
        .select('id, user_id, purchased_addons, chart_data, zodiac_system, payment_status')
        .eq('id', orderId)
        .single();

      if (fullError || !fullOrder) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const zodiacSystem = fullOrder.zodiac_system || 'tropical';
      const purchasedAddons = fullOrder.purchased_addons || [];
      const hasCompatibility = purchasedAddons.includes(`${zodiacSystem}_compatibility`) || purchasedAddons.includes('compatibility');
      if (!hasCompatibility) {
        return new Response(JSON.stringify({ error: 'Compatibility not purchased for this order' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const subjectChart = fullOrder.chart_data?.[zodiacSystem] || fullOrder.chart_data;
      const partnerChart = partnerChartData?.[zodiacSystem] || partnerChartData;

      if (!subjectChart?.sun?.sign || !partnerChart?.sun?.sign) {
        return new Response(JSON.stringify({ error: 'Invalid chart data' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const existing = await supabaseAdmin
        .from('compatibility_reports')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle();

      if (existing?.data?.id) {
        return new Response(JSON.stringify({ error: 'Compatibility report already exists for this order' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const prompt = buildCompatibilityPrompt({
        zodiacSystem,
        subjectChart,
        partnerChart,
      });

      const result = streamText({
        model: openai('gpt-4o-mini'),
        system: 'You are a helpful assistant.',
        prompt,
        maxTokens: 1600,
        temperature: 0.6,
        onFinish: async ({ text }) => {
          if (!text) return;

          const insertPayload = {
            order_id: orderId,
            user_id: fullOrder.user_id || user?.id || null,
            zodiac_system: zodiacSystem,
            partner_birth_data: partnerBirthData,
            partner_chart_data: partnerChartData,
            label: label || null,
            analysis: {
              content: text,
              generatedAt: new Date().toISOString(),
            },
          };

          await supabaseAdmin
            .from('compatibility_reports')
            .insert(insertPayload);
        },
      });

      return result.toTextStreamResponse();
    } catch (err) {
      console.error('Create compatibility error:', err);
      return new Response(JSON.stringify({ error: err?.message || 'Failed to create compatibility report' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}
