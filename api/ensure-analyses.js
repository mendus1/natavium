// api/ensure-analyses.js
// Ensures all purchased analyses are generated before email/PDF delivery
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Map purchased addon IDs to analysis types that need generation
// e.g., 'tropical_natal' addon needs 'tropical_natal' analysis
const ADDON_TO_ANALYSIS = {
  natal: 'natal',
  house_deep_dive: 'house_deep_dive',
  transit_report: 'transit_report',
  solar_return: 'solar_return',
  compatibility: 'compatibility',
};

// Get zodiac system description for prompts
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
function formatChartData(chartResult) {
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
function buildPrompts(chartResult, analysisType, zodiacSystem, birthData) {
  const chartData = formatChartData(chartResult);
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

// Generate a single analysis using OpenAI (non-streaming)
async function generateAnalysis(chartResult, analysisType, zodiacSystem, birthData) {
  const { systemPrompt, userPrompt, maxTokens } = buildPrompts(chartResult, analysisType, zodiacSystem, birthData);

  console.log(`[ensure-analyses] Calling OpenAI for ${analysisType}, maxTokens: ${maxTokens}`);

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
  console.log(`[ensure-analyses] OpenAI returned ${content?.length || 0} chars, finish_reason: ${finishReason}`);

  return content;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, birthData } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Missing orderId' });
    }

    // Fetch order from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('chart_data, purchased_addons, analyses, zodiac_system')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const chartData = order.chart_data;
    const purchasedAddons = order.purchased_addons || [];
    const existingAnalyses = order.analyses || {};
    const zodiacSystem = order.zodiac_system || 'tropical';
    // Birth data may be in chart_data.meta or as separate fields - try to extract it
    const birthData = chartData?.meta?.birthData || chartData?.birthData || {};

    // Extract the active chart based on zodiac system
    const activeChart = chartData[zodiacSystem] || chartData;

    if (!activeChart?.sun?.sign) {
      return res.status(400).json({ error: 'Invalid chart data in order' });
    }

    // Determine which analyses need to be generated
    const missingAnalyses = [];

    for (const addon of purchasedAddons) {
      // Extract base type from prefixed addon (e.g., 'tropical_natal' -> 'natal')
      const baseType = addon.replace(/^(tropical|sidereal)_/, '');

      // Check if this addon maps to an analysis type
      if (ADDON_TO_ANALYSIS[baseType]) {
        const analysisKey = addon; // Use the full prefixed key (e.g., 'tropical_natal')

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
      console.log(`[ensure-analyses] Generating ${missingAnalyses.length} analyses in parallel...`);

      const generationPromises = missingAnalyses.map(async (missing) => {
        console.log(`[ensure-analyses] Starting generation for: ${missing.key}`);
        try {
          const content = await generateAnalysis(
            activeChart,
            missing.baseType,
            zodiacSystem,
            birthData
          );
          return { key: missing.key, content, success: true };
        } catch (genError) {
          console.error(`[ensure-analyses] Failed to generate ${missing.key}:`, genError);
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
          console.log(`[ensure-analyses] Successfully generated ${result.key}`);
        }
      }
    }

    // Save updated analyses to database if we generated any
    if (missingAnalyses.length > 0) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ analyses: newAnalyses })
        .eq('id', orderId);

      if (updateError) {
        console.error('Failed to save analyses:', updateError);
      }
    }

    return res.status(200).json({
      success: true,
      analyses: newAnalyses,
      generated: missingAnalyses.map(m => m.key),
      chartData: chartData,
      zodiacSystem: zodiacSystem,
    });

  } catch (error) {
    console.error('Ensure analyses error:', error);
    return res.status(500).json({ error: error.message || 'Failed to ensure analyses' });
  }
}
