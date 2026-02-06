const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");
const OpenAI = require("openai").default;

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Map purchased addon IDs to analysis types
const ADDON_TO_ANALYSIS = {
  natal: 'natal',
  house_deep_dive: 'house_deep_dive',
  transit_report: 'transit_report',
  solar_return: 'solar_return',
  compatibility: 'compatibility',
};

// Get zodiac system context for prompts
function getZodiacSystemContext(zodiacSystem) {
  if (zodiacSystem === 'sidereal') {
    return `
ZODIAC SYSTEM: SIDEREAL (Fagan-Bradley ayanamsa)
- This chart uses the SIDEREAL zodiac, which is based on the fixed stars.
- Positions are approximately 24° earlier than the tropical zodiac.
- Interpret placements using the sidereal zodiac tradition.`;
  }
  return `
ZODIAC SYSTEM: TROPICAL (Western)
- This chart uses the TROPICAL zodiac, the standard in Western astrology.
- Positions are based on the vernal equinox (0° Aries = spring equinox).`;
}

// Format chart data for prompts
function formatChartDataForPrompt(chartResult) {
  const formatDegree = (planet) => {
    const deg = planet?.degree ?? '?';
    const min = planet?.minutes ?? 0;
    return `${deg}° ${String(min).padStart(2, '0')}'`;
  };

  return `
- **Sun:** ${chartResult.sun?.sign || 'Unknown'} (${formatDegree(chartResult.sun)}) in House ${chartResult.sun?.house || '?'}
- **Moon:** ${chartResult.moon?.sign || 'Unknown'} (${formatDegree(chartResult.moon)}) in House ${chartResult.moon?.house || '?'}
- **Ascendant (Rising):** ${chartResult.rising?.sign || 'Unknown'} (${formatDegree(chartResult.rising)})
- **Mercury:** ${chartResult.mercury?.sign || 'Unknown'} (${formatDegree(chartResult.mercury)}) in House ${chartResult.mercury?.house || '?'}
- **Venus:** ${chartResult.venus?.sign || 'Unknown'} (${formatDegree(chartResult.venus)}) in House ${chartResult.venus?.house || '?'}
- **Mars:** ${chartResult.mars?.sign || 'Unknown'} (${formatDegree(chartResult.mars)}) in House ${chartResult.mars?.house || '?'}
- **Jupiter:** ${chartResult.jupiter?.sign || 'Unknown'} (${formatDegree(chartResult.jupiter)}) in House ${chartResult.jupiter?.house || '?'}
- **Saturn:** ${chartResult.saturn?.sign || 'Unknown'} (${formatDegree(chartResult.saturn)}) in House ${chartResult.saturn?.house || '?'}
- **Uranus:** ${chartResult.uranus?.sign || 'Unknown'} (${formatDegree(chartResult.uranus)}) in House ${chartResult.uranus?.house || '?'}
- **Neptune:** ${chartResult.neptune?.sign || 'Unknown'} (${formatDegree(chartResult.neptune)}) in House ${chartResult.neptune?.house || '?'}
- **Pluto:** ${chartResult.pluto?.sign || 'Unknown'} (${formatDegree(chartResult.pluto)}) in House ${chartResult.pluto?.house || '?'}`;
}

// Build prompts for each analysis type
function buildAnalysisPrompts(chartResult, analysisType, zodiacSystem, birthData) {
  const chartData = formatChartDataForPrompt(chartResult);
  const zodiacContext = getZodiacSystemContext(zodiacSystem);

  const baseSystemPrompt = `You are a professional astrology report generator, NOT a chatbot.

CRITICAL RULES:
- The user cannot reply. Do NOT ask for more information.
- Do NOT use phrases like "I hope this helps" or "Let me know if you have questions".
- Write directly to the user in second person.
- Use a definitive, empowering, professional tone.
${zodiacContext}

FORMAT:
- Use clean Markdown: ## for major headers, ### for subsections
- Use **bold** for planet/sign combinations`;

  switch (analysisType) {
    case 'natal':
      return {
        systemPrompt: baseSystemPrompt,
        userPrompt: `## Birth Chart Data
${chartData}

Please provide a comprehensive natal chart analysis structured in chapters:

## Chapter 1: The Core

### Introduction
An overview of this unique birth chart—the themes, gifts, and growth areas.

### Sun Sign Deep Dive
- Detailed analysis of core identity with the Sun in ${chartResult.sun?.sign || 'their sign'}
- The house placement and what life area is illuminated

### Moon Sign Deep Dive
- Detailed analysis of emotional nature with the Moon in ${chartResult.moon?.sign || 'their sign'}
- Inner needs, instincts, and what feels like "home"

### Rising Sign Deep Dive
- How ${chartResult.rising?.sign || 'their'} Rising shapes outer presentation
- Natural approach to life and new situations

### The Big Three Integration
- How Sun, Moon, and Rising create a unique personality matrix

## Chapter 2: The Planets

### Personal Planets (Mercury, Venus, Mars)
- Communication style, relationship patterns, and drive

### Social Planets (Jupiter, Saturn)
- Growth opportunities and life lessons

### Outer Planets
- Generational themes and deeper transformation

## Chapter 3: The Future

### 2026 Transit Forecast
- Major planetary transits affecting this chart
- Key periods of opportunity and challenge
- Timing recommendations

Total length: approximately 3000-3500 words.`,
        maxTokens: 4000,
      };

    case 'house_deep_dive':
      return {
        systemPrompt: baseSystemPrompt + '\n\nEXPERTISE: Expert in the Placidus house system with detailed, practical guidance for each house.',
        userPrompt: `## Birth Chart Data
${chartData}

Please provide a detailed analysis of all 12 houses in this natal chart.

For each house, explain:
1. **The Sign on the Cusp** - What energy governs this life area
2. **Any Planets Present** - How they influence matters of this house
3. **The House Ruler** - Where the ruling planet is placed
4. **Practical Guidance** - How to work with this house energy

Structure:
## 1st House - Self & Identity
[analysis]

## 2nd House - Resources & Values
[analysis]

...continue through all 12 houses...

Total length: approximately 2500-3000 words.`,
        maxTokens: 3500,
      };

    case 'transit_report':
      const currentDate = new Date().toISOString().split('T')[0];
      return {
        systemPrompt: baseSystemPrompt + '\n\nEXPERTISE: Expert transit astrologer with timely, practical guidance.',
        userPrompt: `## Birth Chart Data
${chartData}

## Current Date: ${currentDate}

Please provide a transit report covering the next 3 months.

Include:

### Current Major Transits
- Saturn, Jupiter positions and aspects to natal planets
- Any outer planet transits within 2° orb

### Month-by-Month Overview
For each of the next 3 months:
- Key transit activations
- Best timing for important decisions
- Areas requiring caution or patience

### Key Themes
- Overall energy of this transit period
- Major life areas being activated

Total length: approximately 1500-2000 words.`,
        maxTokens: 2500,
      };

    case 'solar_return':
      const birthMonth = birthData?.birthMonth || 1;
      const birthDay = birthData?.birthDay || 1;
      const now = new Date();
      let nextBirthdayYear = now.getFullYear();
      const thisYearBirthday = new Date(nextBirthdayYear, birthMonth - 1, birthDay);
      if (now > thisYearBirthday) {
        nextBirthdayYear++;
      }

      return {
        systemPrompt: baseSystemPrompt + '\n\nEXPERTISE: Expert in solar return charts and predictive techniques.',
        userPrompt: `## Natal Chart Data
${chartData}

## Solar Return Year: ${nextBirthdayYear}

Please provide a solar return analysis for the upcoming birthday year.

Include:

### Solar Return Overview
- General themes and energy of the year ahead

### Key Areas of Focus
- Career and public life themes
- Relationship dynamics
- Personal growth opportunities

### Quarterly Breakdown
- **Birthday to 3 months:** Initial themes
- **3-6 months:** Development and challenges
- **6-9 months:** Culmination points
- **9-12 months:** Integration

### Recommendations
- Best months for major decisions
- How to maximize this year's potential

Total length: approximately 1500-2000 words.`,
        maxTokens: 2500,
      };

    case 'compatibility':
      return {
        systemPrompt: baseSystemPrompt + '\n\nEXPERTISE: Expert in synastry and relationship astrology.',
        userPrompt: `## Birth Chart Data
${chartData}

Please provide a compatibility self-awareness report based on this natal chart.

Include:

### Your Relationship Style
- Venus placement and love language
- Mars placement and attraction patterns
- Moon placement and emotional needs in partnership

### What You Seek in Partners
- 7th house analysis (partnerships)
- Descendant sign and ideal partner qualities

### Relationship Strengths
- Natural gifts you bring to relationships
- How your placements support connection

### Growth Areas
- Potential blind spots in relationships
- How to work with challenging aspects

### Compatibility Indicators
- Signs and placements most harmonious with yours
- What to look for in a compatible partner

Total length: approximately 1500-2000 words.`,
        maxTokens: 2500,
      };

    default:
      throw new Error(`Unknown analysis type: ${analysisType}`);
  }
}

// Generate a single analysis using OpenAI
async function generateSingleAnalysis(chartResult, analysisType, zodiacSystem, birthData) {
  const { systemPrompt, userPrompt, maxTokens } = buildAnalysisPrompts(chartResult, analysisType, zodiacSystem, birthData);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

// Ensure all purchased analyses exist, generating any missing ones
async function ensureAllAnalyses(orderId) {
  console.log(`[Email] ensureAllAnalyses called with orderId: ${orderId}`);

  // Validate orderId
  if (!orderId || typeof orderId !== 'string') {
    console.error('[Email] Invalid orderId:', orderId);
    throw new Error(`Invalid orderId: ${orderId}`);
  }

  // Fetch order from database
  // Note: birth_data may not exist as a separate column - birth info is in chart_data
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('chart_data, purchased_addons, analyses, zodiac_system, customer_email')
    .eq('id', orderId)
    .single();

  if (orderError) {
    console.error('[Email] Supabase error fetching order:', JSON.stringify(orderError));
    throw new Error(`Database error for order ${orderId}: ${orderError.message || orderError.code || 'Unknown error'}`);
  }

  if (!order) {
    console.error('[Email] No order found for id:', orderId);
    throw new Error(`Order not found for id: ${orderId}`);
  }

  console.log('[Email] Order found, purchased_addons:', order.purchased_addons);

  const chartData = order.chart_data;
  const purchasedAddons = order.purchased_addons || [];
  const existingAnalyses = order.analyses || {};
  const zodiacSystem = order.zodiac_system || 'tropical';
  // Birth data may be in chart_data.meta or as separate fields - try to extract it
  const birthData = chartData?.meta?.birthData || chartData?.birthData || {};

  // Extract the active chart based on zodiac system
  const activeChart = chartData[zodiacSystem] || chartData;

  if (!activeChart?.sun?.sign) {
    throw new Error('Invalid chart data in order');
  }

  // Determine which analyses need to be generated
  const missingAnalyses = [];

  for (const addon of purchasedAddons) {
    // Extract base type from prefixed addon (e.g., 'tropical_natal' -> 'natal')
    const baseType = addon.replace(/^(tropical|sidereal)_/, '');

    // Check if this addon maps to an analysis type
    if (ADDON_TO_ANALYSIS[baseType]) {
      const analysisKey = addon; // Use the full prefixed key

      // Check if analysis already exists
      if (!existingAnalyses[analysisKey]?.content) {
        missingAnalyses.push({
          key: analysisKey,
          baseType: baseType,
        });
      }
    }
  }

  // Generate missing analyses
  const newAnalyses = { ...existingAnalyses };

  for (const missing of missingAnalyses) {
    console.log(`[Email] Generating missing analysis: ${missing.key}`);

    try {
      const content = await generateSingleAnalysis(
        activeChart,
        missing.baseType,
        zodiacSystem,
        birthData
      );

      newAnalyses[missing.key] = {
        content,
        generatedAt: new Date().toISOString(),
      };
    } catch (genError) {
      console.error(`[Email] Failed to generate ${missing.key}:`, genError);
      // Continue with other analyses even if one fails
    }
  }

  // Save updated analyses to database if we generated any
  if (missingAnalyses.length > 0) {
    const { error: updateError } = await supabase
      .from('orders')
      .update({ analyses: newAnalyses })
      .eq('id', orderId);

    if (updateError) {
      console.error('[Email] Failed to save analyses:', updateError);
    }
  }

  return {
    analyses: newAnalyses,
    chartData: chartData,
    activeChart: activeChart,
    zodiacSystem: zodiacSystem,
    birthData: birthData,
    email: order.customer_email,
  };
}

// Convert markdown to HTML for email
function markdownToHtml(markdown) {
  if (!markdown) return '';
  return markdown
    // Headers (must process in order: h4 before h3 before h2)
    .replace(/^#### (.+)$/gm, '<h4 style="color: #c4b5fd; font-size: 14px; font-weight: 600; margin: 16px 0 8px 0;">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 style="color: #fde047; font-size: 16px; margin: 20px 0 10px 0;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color: #fde047; font-size: 18px; margin: 24px 0 12px 0;">$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color: #f9a8d4;">$1</strong>')
    // Bullet points
    .replace(/^- (.+)$/gm, '<li style="color: #e2e8f0; margin: 6px 0;">$1</li>')
    // Wrap consecutive list items
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="list-style-type: disc; padding-left: 20px; margin: 10px 0;">$&</ul>')
    // Paragraphs (lines that aren't headers or list items)
    .replace(/^(?!<[hul]|<li)(.+)$/gm, '<p style="color: #e2e8f0; line-height: 1.6; margin: 10px 0; font-size: 14px;">$1</p>')
    // Clean up empty paragraphs
    .replace(/<p[^>]*>\s*<\/p>/g, '');
}

// Analysis type display names (with chapter structure)
// Supports both prefixed (tropical_natal) and unprefixed (natal) keys
const ANALYSIS_TITLES = {
  natal: '📜 Chapter 1: The Core Analysis',
  tropical_natal: '📜 Chapter 1: The Core Analysis (Tropical)',
  sidereal_natal: '📜 Chapter 1: The Core Analysis (Sidereal)',
  house_deep_dive: '🏠 House Deep Dive',
  tropical_house_deep_dive: '🏠 House Deep Dive (Tropical)',
  sidereal_house_deep_dive: '🏠 House Deep Dive (Sidereal)',
  transit_report: '🔮 Chapter 3: Your Future',
  tropical_transit_report: '🔮 Transits & Forecast (Tropical)',
  sidereal_transit_report: '🔮 Transits & Forecast (Sidereal)',
  solar_return: '☀️ Solar Return Analysis',
  tropical_solar_return: '☀️ Solar Return (Tropical)',
  sidereal_solar_return: '☀️ Solar Return (Sidereal)',
  compatibility: '💕 Compatibility Analysis',
  tropical_compatibility: '💕 Compatibility (Tropical)',
  sidereal_compatibility: '💕 Compatibility (Sidereal)',
};

// Build HTML sections for all analyses (email version with proper ordering)
function buildAnalysesSections(analyses) {
  if (!analyses || typeof analyses !== 'object') return '';

  // Build ordered list of keys to check (both prefixed and unprefixed)
  const baseOrder = ['natal', 'transit_report', 'house_deep_dive', 'solar_return', 'compatibility'];
  const prefixes = ['tropical_', 'sidereal_', ''];
  const order = [];
  for (const base of baseOrder) {
    for (const prefix of prefixes) {
      order.push(`${prefix}${base}`);
    }
  }
  let sections = '';
  const seen = new Set();

  for (const key of order) {
    const analysis = analyses[key];
    const baseKey = key.replace(/^(tropical|sidereal)_/, '');
    if (analysis?.content && !seen.has(baseKey)) {
      seen.add(baseKey);
      const title = ANALYSIS_TITLES[key] || ANALYSIS_TITLES[baseKey] || key;
      const html = markdownToHtml(analysis.content);
      const isChapter = key === 'natal' || key === 'transit_report';

      sections += `
      <!-- ${title} -->
      <div style="margin-bottom: 24px;">
        <h2 style="color: ${isChapter ? '#fde047' : '#c4b5fd'}; font-size: ${isChapter ? '20px' : '18px'}; margin: 0 0 16px 0; ${isChapter ? 'border-bottom: 2px solid rgba(253, 224, 71, 0.3); padding-bottom: 8px;' : ''}">${title}</h2>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(139, 92, 246, 0.3);">
          ${html}
        </div>
      </div>
      `;
    }
  }

  return sections;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Check Supabase configuration
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[Email] Missing Supabase configuration');
    return res.status(500).json({ error: "Server configuration error: Supabase not configured" });
  }

  try {
    const { orderId, email: requestEmail } = req.body;

    console.log(`[Email] Request received with orderId: ${orderId}, email: ${requestEmail || 'not provided'}`);

    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    // Ensure all purchased analyses are generated
    console.log(`[Email] Ensuring analyses for order: ${orderId}`);
    const orderData = await ensureAllAnalyses(orderId);

    const { analyses, activeChart, zodiacSystem, birthData } = orderData;
    const email = requestEmail || orderData.email;

    if (!email) {
      return res.status(400).json({ error: "No email address found" });
    }

    const zodiacLabel = zodiacSystem === 'sidereal' ? 'Sidereal (Fagan-Bradley)' : 'Tropical';

    // Build all analysis sections
    const analysesSectionsHtml = buildAnalysesSections(analyses);

    // Format birth details
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const birthDate = `${months[parseInt(birthData.birthMonth, 10) - 1]} ${birthData.birthDay}, ${birthData.birthYear}`;

    // Build planetary placements table rows
    const planets = [
      { name: "Sun", data: activeChart.sun, emoji: "☉" },
      { name: "Moon", data: activeChart.moon, emoji: "☽" },
      { name: "Mercury", data: activeChart.mercury, emoji: "☿" },
      { name: "Venus", data: activeChart.venus, emoji: "♀" },
      { name: "Mars", data: activeChart.mars, emoji: "♂" },
      { name: "Jupiter", data: activeChart.jupiter, emoji: "♃" },
      { name: "Saturn", data: activeChart.saturn, emoji: "♄" },
      { name: "Uranus", data: activeChart.uranus, emoji: "♅" },
      { name: "Neptune", data: activeChart.neptune, emoji: "♆" },
      { name: "Pluto", data: activeChart.pluto, emoji: "♇" },
    ];

    const planetRows = planets
      .filter((p) => p.data)
      .map(
        (p) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${p.emoji} ${p.name}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${p.data.sign || "—"}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${p.data.degree || "—"}°</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${p.data.house ? `${p.data.house}${getHouseSuffix(p.data.house)}` : "—"}</td>
        </tr>
      `
      )
      .join("");

    // Build the email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Natal Chart from Natavium</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #1e1b4b;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #fde047; font-size: 32px; margin: 0 0 8px 0;"><svg viewBox="0 0 24 24" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle;"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#fde047"/></svg> Natavium <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle;"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#fde047"/></svg></h1>
      <p style="color: #c4b5fd; font-size: 16px; margin: 0;">Your ${zodiacLabel} Natal Chart Results</p>
    </div>

    <!-- Main Card -->
    <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2)); border-radius: 24px; padding: 32px; border: 1px solid rgba(255, 255, 255, 0.2);">

      <!-- Birth Details -->
      <div style="background: rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
        <h2 style="color: #fde047; font-size: 18px; margin: 0 0 12px 0;">Birth Details</h2>
        <table style="width: 100%; color: #e2e8f0; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0;"><strong>Date:</strong></td>
            <td style="padding: 4px 0;">${birthDate}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Time:</strong></td>
            <td style="padding: 4px 0;">${birthData.time || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Location:</strong></td>
            <td style="padding: 4px 0;">${birthData.location || "—"}</td>
          </tr>
        </table>
      </div>

      <!-- Big Three (Compact) -->
      <div style="margin-bottom: 20px;">
        <h2 style="color: #fde047; font-size: 18px; margin: 0 0 12px 0;">Your Big Three</h2>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- Sun -->
          <div style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(249, 115, 22, 0.2)); border-radius: 10px; padding: 12px 14px; border: 1px solid rgba(234, 179, 8, 0.3);">
            <div style="color: #fde047; font-size: 18px; font-weight: bold;">☉ ${activeChart.sun?.sign || "—"} Sun</div>
            <div style="color: #c4b5fd; font-size: 12px;">${activeChart.sun?.degree || "—"}° • ${activeChart.sun?.house || "—"}${getHouseSuffix(activeChart.sun?.house)} house • Core Identity</div>
          </div>
          <!-- Moon -->
          <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2)); border-radius: 10px; padding: 12px 14px; border: 1px solid rgba(59, 130, 246, 0.3);">
            <div style="color: #93c5fd; font-size: 18px; font-weight: bold;">☽ ${activeChart.moon?.sign || "—"} Moon</div>
            <div style="color: #c4b5fd; font-size: 12px;">${activeChart.moon?.degree || "—"}° • ${activeChart.moon?.house || "—"}${getHouseSuffix(activeChart.moon?.house)} house • Emotional Core</div>
          </div>
          <!-- Rising -->
          <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2)); border-radius: 10px; padding: 12px 14px; border: 1px solid rgba(236, 72, 153, 0.3);">
            <div style="color: #f9a8d4; font-size: 18px; font-weight: bold;">↑ ${activeChart.rising?.sign || "—"} Rising</div>
            <div style="color: #c4b5fd; font-size: 12px;">${activeChart.rising?.degree || "—"}° Ascendant • How Others See You</div>
          </div>
        </div>
      </div>

      <!-- Planetary Placements (before analyses) -->
      <div style="margin-bottom: 24px;">
        <h2 style="color: #fde047; font-size: 18px; margin: 0 0 16px 0;">Planetary Placements</h2>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; color: #e2e8f0; font-size: 14px;">
            <thead>
              <tr style="background: rgba(255, 255, 255, 0.1);">
                <th style="padding: 12px; text-align: left; color: #fde047;">Planet</th>
                <th style="padding: 12px; text-align: left; color: #fde047;">Sign</th>
                <th style="padding: 12px; text-align: left; color: #fde047;">Degree</th>
                <th style="padding: 12px; text-align: left; color: #fde047;">House</th>
              </tr>
            </thead>
            <tbody>
              ${planetRows}
            </tbody>
          </table>
        </div>
      </div>

      ${analysesSectionsHtml || `
      <!-- Default Forecast (if no analyses) -->
      <div style="margin-bottom: 24px;">
        <h2 style="color: #fde047; font-size: 18px; margin: 0 0 16px 0; border-bottom: 2px solid rgba(253, 224, 71, 0.3); padding-bottom: 8px;">🔮 Your 2026 Forecast</h2>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 16px; border: 1px solid rgba(139, 92, 246, 0.3);">
          <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">With Jupiter transiting through your chart, 2026 brings significant opportunities for growth and expansion. Your <strong style="color: #f9a8d4;">${activeChart.sun?.sign || ""} Sun</strong> will be energized by favorable aspects.</p>
          <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">Saturn's influence this year asks you to build solid foundations. This is an excellent time for career advancement and long-term planning.</p>
          <p style="color: #c4b5fd; font-size: 13px; line-height: 1.6; margin: 0;"><strong>Key periods:</strong> Spring brings romantic opportunities • Summer favors financial decisions • Fall is ideal for personal development</p>
        </div>
      </div>
      `}

    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #a78bfa; font-size: 14px; margin: 0 0 16px 0;">
        View your full chart anytime at Natavium
      </p>
      <a href="https://natavium.com" style="display: inline-block; background: linear-gradient(135deg, #fde047, #f97316); color: #1e1b4b; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: bold; font-size: 14px;">
        Visit Natavium
      </a>
      <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
        This email was sent from Natavium. You received this because you requested your chart results.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: "Natavium <onboarding@resend.dev>",
      to: [email],
      subject: `Your ${zodiacLabel} Natal Chart - ${activeChart.sun?.sign || ""} Sun, ${activeChart.moon?.sign || ""} Moon, ${activeChart.rising?.sign || ""} Rising`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: error.message || "Failed to send email" });
    }

    return res.status(200).json({ success: true, messageId: data?.id });
  } catch (err) {
    console.error("Email send error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};

// Helper function for house suffix
function getHouseSuffix(n) {
  if (!n) return "";
  const num = Number(n);
  if (num % 100 >= 11 && num % 100 <= 13) return "th";
  switch (num % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
