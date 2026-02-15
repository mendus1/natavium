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

function formatSubjectLabel({ relationship, initials, fallback }) {
  const rel = relationship ? String(relationship) : '';
  const init = initials ? String(initials) : '';
  const left = rel ? rel.replace(/_/g, ' ') : '';
  const title = left ? left.charAt(0).toUpperCase() + left.slice(1) : '';
  const combined = [title, init].filter(Boolean).join(' • ');
  return combined || fallback;
}

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

function computeAgeYears(birthData) {
  const year = Number(birthData?.birthYear);
  const month = Number(birthData?.birthMonth);
  const day = Number(birthData?.birthDay);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;

  const dob = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(dob.getTime())) return null;

  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const m = now.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) age -= 1;
  if (!Number.isFinite(age) || age < 0 || age > 120) return null;
  return age;
}

function buildAudienceContextForCompatibility({ subjectBirthData, partnerBirthData }) {
  const a = computeAgeYears(subjectBirthData);
  const b = computeAgeYears(partnerBirthData);
  if (!Number.isFinite(a) && !Number.isFinite(b)) return '';

  const lines = [];
  if (Number.isFinite(a)) lines.push(`- Person A is approximately ${a} years old.`);
  if (Number.isFinite(b)) lines.push(`- Person B is approximately ${b} years old.`);

  const anyUnder13 = [a, b].some((x) => Number.isFinite(x) && x < 13);
  const anyMinor = [a, b].some((x) => Number.isFinite(x) && x < 18);

  if (anyUnder13) {
    lines.push('- At least one person is a child. Keep guidance age-appropriate and strictly avoid adult topics (romance/sex/marriage). Focus on family, school, friendships, emotional regulation, confidence, and healthy boundaries.');
  } else if (anyMinor) {
    lines.push('- At least one person is a minor. Keep guidance age-appropriate and avoid explicit content or adult-life assumptions.');
  } else {
    lines.push('- Both people appear to be adults.');
  }

  return `\n\nAUDIENCE CONTEXT:\n${lines.join('\n')}`;
}

function buildRelationshipContext(relationshipType) {
  const type = String(relationshipType || '').trim();
  if (!type) return '';

  const map = {
    romantic: 'ROMANTIC / DATING / PARTNERSHIP',
    friends: 'FRIENDS',
    family: 'FAMILY',
    coworker: 'COWORKERS / PROFESSIONAL',
    other: 'OTHER',
  };
  const label = map[type] || type.toUpperCase();
  return `\n\nRELATIONSHIP CONTEXT:\n- The intended relationship type is: ${label}.\n- Tailor examples, advice, boundaries, and "growth work" to this context (e.g., friendship dynamics vs romantic attachment).`;
}

function buildToneContext(tone) {
  if (!tone || tone === 'classic') return '';

  const map = {
    coach: 'motivational and direct, like a supportive life coach\u2014action-oriented, encouraging, and empowering',
    witty: 'clever and witty\u2014use humor, wordplay, and a lighthearted touch while still being insightful and respectful',
  };
  const desc = map[tone];
  if (!desc) return '';
  return `\n\nTONE:\n- Use a respectful but ${desc} tone throughout the analysis.`;
}

function buildCompatibilityPrompt({ zodiacSystem, subjectChart, partnerChart, subjectTitle, partnerTitle, relationshipType, audienceContext, tone }) {
  const systemLine = zodiacSystem === 'sidereal'
    ? 'ZODIAC SYSTEM: SIDEREAL (Fagan-Bradley ayanamsa)'
    : 'ZODIAC SYSTEM: TROPICAL (Western)';

  return `You are an expert relationship astrologer specializing in synastry.

Your task is to produce a detailed compatibility analysis between **two** people using the two sets of chart placements below.

${systemLine}
${audienceContext || ''}${buildRelationshipContext(relationshipType)}

IMPORTANT:
- Treat the first chart as **Person A** and the second chart as **Person B**.
- Perform *synastry* (A-to-B and B-to-A), not two separate natal readings.
- You are given sign + degree + house for each body. Use the **degrees** to estimate inter-aspects.
- Use these aspect orbs as a guideline (approximate is fine):
  - Conjunction / Opposition: up to 8°
  - Trine / Square: up to 6°
  - Sextile: up to 4°
- Focus primarily on Sun/Moon/Asc, Venus/Mars, Mercury, Saturn. Outer planets are secondary.
- Avoid fatalistic language. Keep it practical and supportive.${buildToneContext(tone)}

${formatChartForPrompt(subjectChart, subjectTitle || 'Person A (Chart A)')}
${formatChartForPrompt(partnerChart, partnerTitle || 'Person B (Chart B)')}

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

async function fetchFullOrder(orderId) {
  const { data: fullOrder, error } = await supabaseAdmin
    .from('orders')
    .select('id, user_id, purchased_addons, chart_data, zodiac_system, payment_status, analyses')
    .eq('id', orderId)
    .single();

  if (error || !fullOrder) {
    return { order: null, error: error || new Error('Order not found') };
  }

  return { order: fullOrder, error: null };
}

function getCompatibilityAnalysisFromOrder({ fullOrder, zodiacSystem }) {
  const analyses = fullOrder?.analyses || {};
  const prefixedKey = `${zodiacSystem}_compatibility`;
  return analyses[prefixedKey] || analyses.compatibility || null;
}

function getCompatibilityRunsRemaining({ fullOrder, zodiacSystem, hasCompatibility }) {
  const meta = fullOrder?.chart_data?.meta || {};
  const raw = meta?.compatibilityRunsRemaining;
  const parsed = Number(raw);
  if (Number.isFinite(parsed)) return Math.max(0, parsed);

  // Backwards-compat: older orders only ever allowed one run.
  // If compatibility is present but credits were never initialized, treat it as 1.
  if (hasCompatibility) {
    const existingAnalysis = getCompatibilityAnalysisFromOrder({ fullOrder, zodiacSystem });
    return existingAnalysis?.content ? 0 : 1;
  }
  return 0;
}

function getCompatibilityComparisons({ fullOrder }) {
  const arr = fullOrder?.chart_data?.meta?.compatibilityComparisons;
  if (!Array.isArray(arr)) return [];
  return arr.filter(item => item && typeof item === 'object');
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
      const { order: fullOrder, error: fullError } = await fetchFullOrder(orderId);
      if (fullError || !fullOrder) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const zodiacSystem = fullOrder.zodiac_system || 'tropical';
      const analysis = getCompatibilityAnalysisFromOrder({ fullOrder, zodiacSystem });
      const partnerBirthData = fullOrder?.chart_data?.meta?.partnerBirthData || null;
      const purchasedAddons = coercePurchasedAddons(fullOrder.purchased_addons);
      const hasCompatibility = purchasedAddons.includes(`${zodiacSystem}_compatibility`) || purchasedAddons.includes('compatibility');
      const runsRemaining = getCompatibilityRunsRemaining({ fullOrder, zodiacSystem, hasCompatibility });
      const comparisons = getCompatibilityComparisons({ fullOrder });

      const report = analysis
        ? {
          order_id: orderId,
          zodiac_system: zodiacSystem,
          partner_birth_data: partnerBirthData,
          analysis,
        }
        : null;

      return new Response(JSON.stringify({ report, runsRemaining, comparisons }), {
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

      const { partnerBirthData, partnerChartData, label, relationshipType, tone } = body || {};
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

      const { order: fullOrder, error: fullError } = await fetchFullOrder(orderId);
      if (fullError || !fullOrder) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const zodiacSystem = fullOrder.zodiac_system || 'tropical';
      const purchasedAddons = coercePurchasedAddons(fullOrder.purchased_addons);
      const hasCompatibility = purchasedAddons.includes(`${zodiacSystem}_compatibility`) || purchasedAddons.includes('compatibility');
      if (!hasCompatibility) {
        return new Response(JSON.stringify({ error: 'Compatibility not purchased for this order' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const runsRemaining = getCompatibilityRunsRemaining({ fullOrder, zodiacSystem, hasCompatibility });
      if (runsRemaining <= 0) {
        return new Response(JSON.stringify({ error: 'No compatibility runs remaining for this order.' }), {
          status: 402,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Multi-run: we allow multiple comparisons; the latest remains stored under analyses[`${zodiacSystem}_compatibility`].

      const subjectChart = fullOrder.chart_data?.[zodiacSystem] || fullOrder.chart_data;
      const partnerChart = partnerChartData?.[zodiacSystem] || partnerChartData;

      if (!subjectChart?.sun?.sign || !partnerChart?.sun?.sign) {
        return new Response(JSON.stringify({ error: 'Invalid chart data' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const subjectBirthData = fullOrder.chart_data?.meta?.birthData || {};
      const audienceContext = buildAudienceContextForCompatibility({ subjectBirthData, partnerBirthData });
      const subjectTitle = formatSubjectLabel({
        relationship: subjectBirthData?.subjectRelationship,
        initials: subjectBirthData?.subjectInitials,
        fallback: 'Person A (Chart A)',
      });

      const partnerTitle = formatSubjectLabel({
        relationship: partnerBirthData?.subjectRelationship,
        initials: partnerBirthData?.subjectInitials,
        fallback: 'Person B (Chart B)',
      });

      const prompt = buildCompatibilityPrompt({
        zodiacSystem,
        subjectChart,
        partnerChart,
        subjectTitle,
        partnerTitle,
        relationshipType,
        audienceContext,
        tone,
      });

      const result = streamText({
        model: openai('gpt-4o-mini'),
        system: 'You are a helpful assistant.',
        prompt,
        maxTokens: 1600,
        temperature: 0.6,
        onFinish: async ({ text }) => {
          if (!text) return;

          const analysisKey = `${zodiacSystem}_compatibility`;
          const nextAnalysis = {
            content: text,
            generatedAt: new Date().toISOString(),
            label: label || null,
          };

          const existingAnalyses = fullOrder?.analyses || {};
          const updatedAnalyses = {
            ...existingAnalyses,
            [analysisKey]: nextAnalysis,
          };

          const existingChartData = fullOrder?.chart_data || {};
          const existingMeta = existingChartData?.meta || {};
          const existingComparisons = Array.isArray(existingMeta?.compatibilityComparisons)
            ? existingMeta.compatibilityComparisons.filter(item => item && typeof item === 'object')
            : [];

          const currentRuns = getCompatibilityRunsRemaining({
            fullOrder,
            zodiacSystem,
            hasCompatibility: true,
          });
          const nextRuns = Math.max(0, currentRuns - 1);

          const comparisonId = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
          const nextComparison = {
            id: comparisonId,
            createdAt: new Date().toISOString(),
            zodiacSystem,
            label: label || null,
            relationshipType: relationshipType || null,
            partnerBirthData,
            partnerChartData,
            analysis: nextAnalysis,
          };

          const updatedChartData = {
            ...existingChartData,
            meta: {
              ...existingMeta,
              partnerBirthData,
              partnerChartData,
              compatibilityRelationshipType: relationshipType || null,
              compatibilityRunsRemaining: nextRuns,
              compatibilityComparisons: [...existingComparisons, nextComparison],
            },
          };

          await supabaseAdmin
            .from('orders')
            .update({ analyses: updatedAnalyses, chart_data: updatedChartData, user_id: fullOrder.user_id || user?.id || null })
            .eq('id', orderId);

          // Persist to compatibility_reports table for analytics / history
          try {
            await supabaseAdmin.from('compatibility_reports').insert({
              order_id: orderId,
              user_id: fullOrder.user_id || user?.id || null,
              comparison_id: comparisonId,
              zodiac_system: zodiacSystem,
              relationship_type: relationshipType || null,
              comparison_birth_data: partnerBirthData || null,
              comparison_chart_data: partnerChartData || null,
              label: label || null,
              analysis: text,
            });
          } catch (reportErr) {
            console.error('Failed to insert compatibility_reports row:', reportErr);
          }
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
