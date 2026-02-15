import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { canAccessOrder, fetchOrderForAccessCheck, getClaimTokenFromRequest, getUserFromRequest } from '../lib/auth.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

// Focus context for prompts
function buildFocusContext(birthData) {
  const focus = birthData?.focus;
  if (!focus || focus === 'standard') return '';
  const map = { career: 'Career & Money', love: 'Love & Relationships', growth: 'Self & Growth' };
  const label = map[focus] || focus;
  return `\n\nFOCUS EMPHASIS:\n- Provide a well-rounded analysis with a focus on ${label}. Give this area slightly more depth and practical guidance than other areas.`;
}

// Tone context for prompts
function buildToneContext(birthData) {
  const tone = birthData?.tone;
  if (!tone || tone === 'classic') return '';
  const map = {
    coach: 'motivational and direct, like a supportive life coach\u2014action-oriented, encouraging, and empowering',
    witty: 'clever and witty\u2014use humor, wordplay, and a lighthearted touch while still being insightful and respectful',
  };
  const desc = map[tone];
  if (!desc) return '';
  return `\n\nTONE:\n- Use a respectful but ${desc} tone throughout the analysis.`;
}

// Age context for prompts
function buildAgeContext(birthData) {
  const year = Number(birthData?.birthYear);
  const month = Number(birthData?.birthMonth);
  const day = Number(birthData?.birthDay);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return '';
  if (year < 1900 || year > new Date().getFullYear()) return '';
  if (month < 1 || month > 12) return '';
  if (day < 1 || day > 31) return '';
  const dob = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(dob.getTime())) return '';
  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const m = now.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) age -= 1;
  if (!Number.isFinite(age) || age < 0 || age > 120) return '';
  if (age < 13) return `\n\nAUDIENCE CONTEXT:\n- The recipient is approximately ${age} years old (a child).\n- Keep guidance age-appropriate: avoid adult topics. Focus on family, school, friendships, confidence, and creativity.`;
  if (age < 18) return `\n\nAUDIENCE CONTEXT:\n- The recipient is approximately ${age} years old (a minor).\n- Keep guidance age-appropriate: avoid explicit content or adult-life assumptions.`;
  return `\n\nAUDIENCE CONTEXT:\n- The recipient is approximately ${age} years old (an adult).`;
}

// Build prompts for each analysis type
function buildAnalysisPrompts(chartResult, analysisType, zodiacSystem, birthData) {
  const chartData = formatChartDataForPrompt(chartResult);
  const zodiacContext = getZodiacSystemContext(zodiacSystem);
  const ageContext = buildAgeContext(birthData);
  const focusContext = buildFocusContext(birthData);
  const toneContext = buildToneContext(birthData);

  const baseSystemPrompt = `You are a professional astrology report generator, NOT a chatbot.

CRITICAL RULES:
- The user cannot reply. Do NOT ask for more information.
- Do NOT use phrases like "I hope this helps" or "Let me know if you have questions".
- Write directly to the user in second person.
- Use a definitive, empowering, professional tone.
${zodiacContext}

FORMAT:
- Use clean Markdown: ## for major headers, ### for subsections
- Use **bold** for planet/sign combinations${ageContext}${focusContext}${toneContext}`;

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

  console.log(`[PDF] Calling OpenAI for ${analysisType}, maxTokens: ${maxTokens}`);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  });

  const content = completion.choices[0].message.content;
  const finishReason = completion.choices[0].finish_reason;
  console.log(`[PDF] OpenAI returned ${content?.length || 0} chars, finish_reason: ${finishReason}`);

  return content;
}

// Ensure all purchased analyses exist, generating any missing ones
async function ensureAllAnalyses(orderId) {
  console.log(`[PDF] ensureAllAnalyses called with orderId: ${orderId}`);

  // Validate orderId
  if (!orderId || typeof orderId !== 'string') {
    console.error('[PDF] Invalid orderId:', orderId);
    throw new Error(`Invalid orderId: ${orderId}`);
  }

  // Fetch order from database
  // Note: birth_data may not exist as a separate column - birth info is in chart_data
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('chart_data, purchased_addons, analyses, zodiac_system')
    .eq('id', orderId)
    .single();

  if (orderError) {
    console.error('[PDF] Supabase error fetching order:', JSON.stringify(orderError));
    throw new Error(`Database error for order ${orderId}: ${orderError.message || orderError.code || 'Unknown error'}`);
  }

  if (!order) {
    console.error('[PDF] No order found for id:', orderId);
    throw new Error(`Order not found for id: ${orderId}`);
  }

  console.log('[PDF] Order found, purchased_addons:', order.purchased_addons);
  console.log('[PDF] Existing analyses keys:', Object.keys(order.analyses || {}));

  const chartData = order.chart_data;
  const purchasedAddons = coercePurchasedAddons(order.purchased_addons);
  const existingAnalyses = order.analyses || {};
  const zodiacSystem = order.zodiac_system || 'tropical';
  // Birth data may be in chart_data.meta or as separate fields - try to extract it
  const birthData = chartData?.meta?.birthData || chartData?.birthData || {};

  console.log('[PDF] Zodiac system:', zodiacSystem);
  console.log('[PDF] BirthData:', JSON.stringify(birthData).substring(0, 100));

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

  // Generate missing analyses IN PARALLEL for faster execution
  const newAnalyses = { ...existingAnalyses };

  if (missingAnalyses.length > 0) {
    console.log(`[PDF] Generating ${missingAnalyses.length} analyses in parallel...`);

    const generationPromises = missingAnalyses.map(async (missing) => {
      console.log(`[PDF] Starting generation for: ${missing.key}`);
      try {
        const content = await generateSingleAnalysis(
          activeChart,
          missing.baseType,
          zodiacSystem,
          birthData
        );
        return { key: missing.key, content, success: true };
      } catch (genError) {
        console.error(`[PDF] Failed to generate ${missing.key}:`, genError);
        return { key: missing.key, success: false, error: genError.message };
      }
    });

    const results = await Promise.all(generationPromises);

    for (const result of results) {
      if (result.success) {
        newAnalyses[result.key] = {
          content: result.content,
          generatedAt: new Date().toISOString(),
        };
        console.log(`[PDF] Successfully generated ${result.key}`);
      }
    }
  }

  // Save updated analyses to database if we generated any
  if (missingAnalyses.length > 0) {
    console.log('[PDF] Generated', missingAnalyses.length, 'new analyses, saving...');
    const { error: updateError } = await supabase
      .from('orders')
      .update({ analyses: newAnalyses })
      .eq('id', orderId);

    if (updateError) {
      console.error('[PDF] Failed to save analyses:', updateError);
    } else {
      console.log('[PDF] Analyses saved successfully');
    }
  } else {
    console.log('[PDF] No missing analyses - using existing');
  }

  console.log('[PDF] Returning analyses keys:', Object.keys(newAnalyses));
  for (const key of Object.keys(newAnalyses)) {
    const contentLength = newAnalyses[key]?.content?.length || 0;
    console.log(`[PDF] Analysis ${key}: ${contentLength} chars`);
  }

  return {
    analyses: newAnalyses,
    chartData: chartData,
    activeChart: activeChart,
    zodiacSystem: zodiacSystem,
    birthData: birthData,
  };
}

// Helper function for house suffix
function getHouseSuffix(n) {
  if (!n) return "";
  const num = Number(n);
  if (num % 100 >= 11 && num % 100 <= 13) return "th";
  switch (num % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

// Convert markdown to HTML for PDF (inverted: white bg, dark text for internal pages)
function markdownToHtml(markdown) {
  if (!markdown) return '';
  return markdown
    // Headers (must process in order: h4 before h3 before h2)
    .replace(/^#### (.+)$/gm, '<h4 style="color: #6b21a8; font-size: 16px; font-weight: 600; margin: 20px 0 10px 0;">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 style="color: #7c3aed; font-size: 18px; font-weight: 700; margin: 24px 0 12px 0;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color: #581c87; font-size: 22px; font-weight: 700; margin: 32px 0 16px 0;">$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color: #be185d;">$1</strong>')
    // Bullet points
    .replace(/^- (.+)$/gm, '<li style="color: #374151; margin: 8px 0; margin-left: 20px;">$1</li>')
    // Wrap consecutive list items
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="list-style-type: disc; padding-left: 20px; margin: 12px 0;">$&</ul>')
    // Paragraphs (lines that aren't headers or list items)
    .replace(/^(?!<[hul]|<li)(.+)$/gm, '<p style="color: #374151; line-height: 1.7; margin: 12px 0;">$1</p>')
    // Clean up empty paragraphs
    .replace(/<p[^>]*>\s*<\/p>/g, '');
}

// Analysis type display names and chapter structure
// Now supports prefixed keys like 'tropical_natal', 'sidereal_house_deep_dive'
const ANALYSIS_TITLES = {
  natal: 'Chapter 1: The Core Analysis',
  tropical_natal: 'Chapter 1: The Core Analysis (Tropical)',
  sidereal_natal: 'Chapter 1: The Core Analysis (Sidereal)',
  house_deep_dive: 'House Deep Dive',
  tropical_house_deep_dive: 'House Deep Dive (Tropical)',
  sidereal_house_deep_dive: 'House Deep Dive (Sidereal)',
  transit_report: 'Chapter 3: Your Future — Transits & Forecast',
  tropical_transit_report: 'Transits & Forecast (Tropical)',
  sidereal_transit_report: 'Transits & Forecast (Sidereal)',
  solar_return: 'Solar Return Analysis',
  tropical_solar_return: 'Solar Return (Tropical)',
  sidereal_solar_return: 'Solar Return (Sidereal)',
  compatibility: 'Compatibility Analysis',
  tropical_compatibility: 'Compatibility (Tropical)',
  sidereal_compatibility: 'Compatibility (Sidereal)',
};

// Build HTML sections for all analyses (with proper chapter ordering)
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
    // Skip duplicates (e.g., if both 'natal' and 'tropical_natal' exist)
    const baseKey = key.replace(/^(tropical|sidereal)_/, '');
    if (analysis?.content && !seen.has(baseKey)) {
      seen.add(baseKey);
      const title = ANALYSIS_TITLES[key] || ANALYSIS_TITLES[baseKey] || key;
      const html = markdownToHtml(analysis.content);
      const isChapter = baseKey === 'natal' || baseKey === 'transit_report';

      sections += `
    <div class="section analysis-section">
      ${isChapter
        ? `<div class="chapter-header"><h2>${title}</h2></div>`
        : `<div class="section-title">${title}</div>`
      }
      <div class="analysis-content">
        ${html}
      </div>
    </div>
      `;
    }
  }

  return sections;
}

// Vercel configuration - allow up to 60 seconds for analysis generation
export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Check Supabase configuration
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[PDF] Missing Supabase configuration');
    return res.status(500).json({ error: "Server configuration error: Supabase not configured" });
  }

  let browser = null;

  try {
    const { orderId, chartImage } = req.body;

    console.log(`[PDF] Request received with orderId: ${orderId}, chartImage: ${chartImage ? 'present' : 'absent'}`);

    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    const user = await getUserFromRequest(req);
    const claimToken = getClaimTokenFromRequest(req);
    const { order, error: fetchError } = await fetchOrderForAccessCheck(orderId);
    if (fetchError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!canAccessOrder({ order, user, claimToken })) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Ensure all purchased analyses are generated
    console.log(`[PDF] Ensuring analyses for order: ${orderId}`);
    const orderData = await ensureAllAnalyses(orderId);

    const { analyses, activeChart, chartData: chartResult, zodiacSystem, birthData } = orderData;
    const zodiacLabel = zodiacSystem === 'sidereal' ? 'Sidereal (Fagan-Bradley)' : 'Tropical';

    // Build all analysis sections
    const analysesSectionsHtml = buildAnalysesSections(analyses);

    // --- 1. THE BROWSER SWITCH LOGIC ---
    if (process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
      // PROD: Use lightweight Chromium
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
    } else {
      // LOCAL: Use full Puppeteer (Dynamic Import)
      // This prevents Vercel from trying to bundle the huge local Puppeteer
      const puppeteer = await import('puppeteer');
      browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox'],
      });
    }

    // Format birth date
    const months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const birthDate = `${months[parseInt(birthData.birthMonth, 10) - 1]} ${birthData.birthDay}, ${birthData.birthYear}`;

    // Build planetary placements rows (using activeChart based on zodiac system)
    const planets = [
      { name: "Sun", glyph: "☉", data: activeChart.sun },
      { name: "Moon", glyph: "☽", data: activeChart.moon },
      { name: "Mercury", glyph: "☿", data: activeChart.mercury },
      { name: "Venus", glyph: "♀", data: activeChart.venus },
      { name: "Mars", glyph: "♂", data: activeChart.mars },
      { name: "Jupiter", glyph: "♃", data: activeChart.jupiter },
      { name: "Saturn", glyph: "♄", data: activeChart.saturn },
      { name: "Uranus", glyph: "♅", data: activeChart.uranus },
      { name: "Neptune", glyph: "♆", data: activeChart.neptune },
      { name: "Pluto", glyph: "♇", data: activeChart.pluto },
    ];

    const planetRows = planets
      .filter(p => p.data)
      .map(p => `
        <tr>
          <td>${p.glyph} ${p.name}</td>
          <td>${p.data.sign || "—"}</td>
          <td>${p.data.degree || "—"}°</td>
          <td>${p.data.house ? `${p.data.house}${getHouseSuffix(p.data.house)}` : "—"}</td>
        </tr>
      `).join("");

    // Generate HTML for PDF - Premium cover page (dark) + Professional internal pages (white/dark text)
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Cover Page - Dark Premium Style */
    .cover-page {
      background: linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #be185d 100%);
      color: white;
      min-height: 100vh;
      padding: 60px 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      page-break-after: always;
    }
    .cover-title { font-size: 56px; font-weight: 900; color: #fde047; margin-bottom: 16px; }
    .cover-subtitle { font-size: 24px; color: #c4b5fd; margin-bottom: 32px; }
    .cover-big-three { margin: 40px 0; }
    .cover-sign { font-size: 28px; font-weight: 700; color: #fde047; margin: 12px 0; }
    .cover-sign-label { font-size: 14px; color: #c4b5fd; text-transform: uppercase; letter-spacing: 2px; }
    .cover-birth-info { font-size: 16px; color: #e2e8f0; margin-top: 40px; line-height: 1.8; }
    .cover-chart-id { font-size: 12px; color: #9ca3af; margin-top: 16px; }
    .cover-logo { font-size: 18px; color: #a78bfa; margin-top: auto; padding-top: 40px; }

    /* Internal Pages - White Background, Dark Text (Professional & Print-Friendly) */
    .content-page {
      background: #ffffff;
      color: #1f2937;
      padding: 40px;
    }
    .container { max-width: 800px; margin: 0 auto; }

    .page-header {
      border-bottom: 3px solid #7c3aed;
      padding-bottom: 16px;
      margin-bottom: 32px;
    }
    .page-title { font-size: 28px; font-weight: 700; color: #581c87; }

    .section {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e5e7eb;
    }
    .section:last-child { border-bottom: none; }
    .section-title { font-size: 22px; font-weight: 700; color: #7c3aed; margin-bottom: 20px; }

    /* Chart Image Section */
    .chart-section {
      text-align: center;
      page-break-after: always;
    }
    .chart-section img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border: 2px solid #e5e7eb;
    }

    /* Big Three - Compact Cards */
    .big-three { display: flex; flex-direction: column; gap: 12px; }
    .planet-card {
      padding: 16px 20px;
      border-radius: 12px;
      border-left: 4px solid;
      background: #f9fafb;
    }
    .sun-card { border-color: #f59e0b; background: linear-gradient(90deg, #fef3c7 0%, #f9fafb 100%); }
    .moon-card { border-color: #3b82f6; background: linear-gradient(90deg, #dbeafe 0%, #f9fafb 100%); }
    .rising-card { border-color: #ec4899; background: linear-gradient(90deg, #fce7f3 0%, #f9fafb 100%); }

    .planet-name { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
    .sun-card .planet-name { color: #b45309; }
    .moon-card .planet-name { color: #1d4ed8; }
    .rising-card .planet-name { color: #be185d; }
    .planet-detail { font-size: 13px; color: #6b7280; }

    /* Planetary Placements Table */
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { color: #581c87; font-weight: 600; background: #f3f4f6; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { color: #374151; font-size: 14px; }
    tr:hover { background: #f9fafb; }

    /* Analysis Content Sections */
    .analysis-section {
      page-break-before: always;
    }
    .analysis-content {
      line-height: 1.7;
    }
    .analysis-content h2 { color: #581c87; font-size: 22px; font-weight: 700; margin: 32px 0 16px 0; }
    .analysis-content h3 { color: #7c3aed; font-size: 18px; font-weight: 700; margin: 24px 0 12px 0; }
    .analysis-content h4 { color: #6b21a8; font-size: 16px; font-weight: 600; margin: 20px 0 10px 0; }
    .analysis-content p { color: #374151; margin: 12px 0; }
    .analysis-content strong { color: #be185d; }
    .analysis-content ul { padding-left: 20px; margin: 12px 0; }
    .analysis-content li { color: #374151; margin: 8px 0; }

    /* Chapter Headers */
    .chapter-header {
      background: linear-gradient(90deg, #7c3aed 0%, #be185d 100%);
      color: white;
      padding: 20px 24px;
      border-radius: 12px;
      margin: 32px 0 24px 0;
    }
    .chapter-header h2 { color: white; margin: 0; font-size: 20px; }

    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <!-- COVER PAGE (Dark/Premium) -->
  <div class="cover-page">
    <div class="cover-title"><svg viewBox="0 0 24 24" style="width: 48px; height: 48px; display: inline-block; vertical-align: middle;"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#fde047"/></svg> Natavium <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; display: inline-block; vertical-align: middle;"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#fde047"/></svg></div>
    <div class="cover-subtitle">Your Complete ${zodiacLabel} Chart</div>

    <div class="cover-big-three">
      <div class="cover-sign-label">Sun Sign</div>
      <div class="cover-sign">☉ ${activeChart.sun?.sign || "—"}</div>

      <div class="cover-sign-label">Moon Sign</div>
      <div class="cover-sign">☽ ${activeChart.moon?.sign || "—"}</div>

      <div class="cover-sign-label">Rising Sign</div>
      <div class="cover-sign">↑ ${activeChart.rising?.sign || "—"}</div>
    </div>

    <div class="cover-birth-info">
      ${birthDate}<br/>
      ${birthData.time} • ${birthData.location}
    </div>
    ${chartResult.chartId ? `<div class="cover-chart-id">Chart ID: ${chartResult.chartId}</div>` : ""}

    <div class="cover-logo">natavium.com</div>
  </div>

  <!-- CONTENT PAGES (White/Professional) -->
  <div class="content-page">
    <div class="container">

      <!-- Chart Wheel -->
      ${chartImage ? `
      <div class="section chart-section">
        <div class="section-title">Your Natal Chart Wheel</div>
        <img src="${chartImage}" alt="Natal Chart Wheel" />
      </div>
      ` : ""}

      <!-- Big Three Summary -->
      <div class="section">
        <div class="section-title">Your Big Three</div>
        <div class="big-three">
          <div class="planet-card sun-card">
            <div class="planet-name">☉ ${activeChart.sun?.sign || "—"} Sun</div>
            <div class="planet-detail">${activeChart.sun?.degree || "—"}° in ${activeChart.sun?.house || "—"}${getHouseSuffix(activeChart.sun?.house)} house • Core Identity</div>
          </div>
          <div class="planet-card moon-card">
            <div class="planet-name">☽ ${activeChart.moon?.sign || "—"} Moon</div>
            <div class="planet-detail">${activeChart.moon?.degree || "—"}° in ${activeChart.moon?.house || "—"}${getHouseSuffix(activeChart.moon?.house)} house • Emotional Core</div>
          </div>
          <div class="planet-card rising-card">
            <div class="planet-name">↑ ${activeChart.rising?.sign || "—"} Rising</div>
            <div class="planet-detail">${activeChart.rising?.degree || "—"}° Ascendant • How Others See You</div>
          </div>
        </div>
      </div>

      <!-- Planetary Placements Table -->
      <div class="section">
        <div class="section-title">Planetary Placements</div>
        <table>
          <thead>
            <tr>
              <th>Planet</th>
              <th>Sign</th>
              <th>Degree</th>
              <th>House</th>
            </tr>
          </thead>
          <tbody>
            ${planetRows}
          </tbody>
        </table>
      </div>

      ${analysesSectionsHtml || `
      <div class="section">
        <div class="chapter-header"><h2>Your 2026 Forecast</h2></div>
        <div class="analysis-content">
          <p>With Jupiter transiting through your chart, 2026 brings significant opportunities for growth and expansion. Your <strong>${activeChart.sun?.sign || ""} Sun</strong> will be energized by favorable aspects, encouraging you to step into leadership roles and pursue long-held ambitions.</p>
          <p>Saturn's influence this year asks you to build solid foundations. This is an excellent time for career advancement, particularly in areas that require discipline and long-term planning.</p>
          <p><strong>Key periods:</strong> Spring brings romantic opportunities • Summer favors financial decisions • Fall is ideal for personal development</p>
        </div>
      </div>
      `}

      <div class="footer">
        Generated by Natavium • natavium.com
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await browser.close();
    browser = null;

    // Return PDF as base64 (convert Uint8Array to Buffer first)
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    return res.status(200).json({
      success: true,
      pdf: pdfBase64,
      filename: `natavium-${zodiacSystem}-chart-${activeChart.sun?.sign?.toLowerCase() || "natal"}-${Date.now()}.pdf`
    });

  } catch (err) {
    console.error("PDF generation error:", err);
    if (browser) {
      await browser.close();
    }
    return res.status(500).json({ error: err.message || "PDF generation failed" });
  }
};