// api/generate-analysis.js
// Using Vercel AI SDK with streaming for long reports
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const config = {
  runtime: 'edge',
};

// Product tier configurations for natal chart analysis
const PRODUCT_CONFIG = {
  base: {
    model: 'gpt-4o-mini',
    maxTokens: 800,
    sections: ['bigThree', 'planets', 'houses'],
    includeTransits: false,
    includeCompatibility: false,
  },
  essential: {
    model: 'gpt-4o-mini',
    maxTokens: 1000,
    sections: ['bigThree', 'planets', 'houses', 'aspects', 'themes', 'transits'],
    includeTransits: true,
    includeCompatibility: false,
  },
  ultimate: {
    model: 'gpt-4o-mini',
    maxTokens: 1000,
    sections: ['bigThree', 'planets', 'houses', 'aspects', 'themes', 'transits', 'vedic'],
    includeTransits: true,
    includeCompatibility: true,
  },
};

// Configurations for add-on analysis types (without zodiac prefix)
const ADDON_CONFIG = {
  natal: {
    model: 'gpt-4o-mini',
    maxTokens: 1000,
  },
  house_deep_dive: {
    model: 'gpt-4o-mini',
    maxTokens: 1500,
  },
  transit_report: {
    model: 'gpt-4o-mini',
    maxTokens: 1200,
  },
  solar_return: {
    model: 'gpt-4o-mini',
    maxTokens: 1500,
  },
};

// Helper to parse zodiac system and base analysis type from prefixed analysisType
// e.g., 'tropical_natal' -> { zodiacSystem: 'tropical', baseType: 'natal' }
function parseAnalysisType(analysisType) {
  if (!analysisType) {
    return { zodiacSystem: 'tropical', baseType: 'natal' };
  }

  if (analysisType.startsWith('tropical_')) {
    return { zodiacSystem: 'tropical', baseType: analysisType.replace('tropical_', '') };
  }

  if (analysisType.startsWith('sidereal_')) {
    return { zodiacSystem: 'sidereal', baseType: analysisType.replace('sidereal_', '') };
  }

  // Legacy unprefixed -> assume tropical
  return { zodiacSystem: 'tropical', baseType: analysisType };
}

// Get zodiac system description for prompts
function getZodiacSystemContext(zodiacSystem) {
  if (zodiacSystem === 'sidereal') {
    return `
ZODIAC SYSTEM: SIDEREAL (Fagan-Bradley ayanamsa)
- This chart uses the SIDEREAL zodiac, which is based on the fixed stars.
- Positions are approximately 24° earlier than the tropical zodiac.
- Interpret placements using the sidereal zodiac tradition.
- Focus on the observable constellations rather than seasonal divisions.`;
  }
  return `
ZODIAC SYSTEM: TROPICAL (Western)
- This chart uses the TROPICAL zodiac, the standard in Western astrology.
- Positions are based on the vernal equinox (0° Aries = spring equinox).
- Interpret placements using traditional Western psychological astrology.`;
}

// Build the prompt based on product tier
function buildPrompt(chartResult, productType) {
  const config = PRODUCT_CONFIG[productType] || PRODUCT_CONFIG.base;

  // Helper to format degree with minutes, e.g., "24° 15'"
  const formatDegree = (planet) => {
    const deg = planet?.degree ?? '?';
    const min = planet?.minutes ?? 0;
    return `${deg}° ${String(min).padStart(2, '0')}'`;
  };

  // Base chart data (always included) - with degrees and arc-minutes for precision
  let chartDataSection = `
## Birth Chart Data
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
- **Pluto:** ${chartResult.pluto?.sign || 'Unknown'} (${formatDegree(chartResult.pluto)}) in House ${chartResult.pluto?.house || '?'}
`;

  // Add aspects if available and tier includes them
  if (config.sections.includes('aspects') && chartResult.aspects) {
    chartDataSection += `\n## Major Aspects\n`;
    chartResult.aspects.forEach(aspect => {
      chartDataSection += `- ${aspect.planet1} ${aspect.aspect} ${aspect.planet2} (${aspect.orb}° orb)\n`;
    });
  }

  // Build analysis request based on tier
  let analysisRequest = '';

  if (productType === 'base') {
    analysisRequest = `
Please provide a natal chart analysis structured in chapters:

## Chapter 1: The Core

### Introduction
A brief overview of this unique birth chart and what makes this person's cosmic blueprint special.

### Sun Sign Analysis
- Core identity and ego expression with the Sun in ${chartResult.sun?.sign || 'their sign'}
- How this manifests in daily life and long-term goals

### Moon Sign Analysis
- Emotional nature and inner self with the Moon in ${chartResult.moon?.sign || 'their sign'}
- What provides emotional security and comfort

### Rising Sign Analysis
- How they present to the world with ${chartResult.rising?.sign || 'their'} Rising
- First impressions and natural approach to new situations

### The Big Three Dynamic
- How these three energies interact and create this unique personality
- Potential internal tensions or harmonies between them

## Chapter 2: The Planets

### Personal Planets (Mercury, Venus, Mars)
- Brief interpretation of each planet's sign placement
- How these shape communication, love style, and drive

### House Emphasis
- Which life areas are most emphasized based on planetary placements

Keep the analysis grounded and specific to these placements. Avoid generic statements.
Total length: approximately 800-1000 words.
`;
  } else if (productType === 'essential') {
    analysisRequest = `
Please provide a comprehensive natal chart analysis structured in chapters:

## Chapter 1: The Core

### Introduction
An overview of this unique birth chart—the themes, gifts, and growth areas that define this cosmic blueprint.

### Sun Sign Deep Dive
- Detailed analysis of core identity with the Sun in ${chartResult.sun?.sign || 'their sign'}
- The house placement and what life area is illuminated
- How this solar energy expresses in personality and purpose

### Moon Sign Deep Dive
- Detailed analysis of emotional nature with the Moon in ${chartResult.moon?.sign || 'their sign'}
- The house placement and emotional life domain
- Inner needs, instincts, and what feels like "home"

### Rising Sign Deep Dive
- How ${chartResult.rising?.sign || 'their'} Rising shapes outer presentation
- The mask and the authentic self
- Natural approach to life and new situations

### The Big Three Integration
- How Sun, Moon, and Rising create a unique personality matrix
- Internal tensions that may arise and how to work with them
- The gifts that emerge when these energies align

## Chapter 2: The Planets

### Personal Planets
#### Mercury: The Mind
- Communication style, learning approach, and mental patterns

#### Venus: Love & Values
- Relationship style, aesthetic preferences, and what brings pleasure

#### Mars: Drive & Action
- How this person pursues goals, handles conflict, and expresses passion

### Social Planets
#### Jupiter: Growth & Expansion
- Where luck and opportunity flow, philosophical outlook

#### Saturn: Structure & Lessons
- Life's key challenges, areas requiring discipline and mastery

### Outer Planets
- Uranus, Neptune, Pluto: Generational themes and deeper transformative currents

### Key Aspects
- Major planetary interactions and what they reveal about inner dynamics

## Chapter 3: The Future

### 2026 Transit Forecast
- Major planetary transits affecting this chart in 2026
- Key periods of opportunity and challenge
- Areas of life most activated
- Timing recommendations for important decisions

Total length: approximately 3000-3500 words.
`;
  } else if (productType === 'ultimate') {
    analysisRequest = `
Please provide an elite-level natal chart analysis structured in chapters:

## Chapter 1: The Core

### Introduction
A comprehensive overview of this birth chart—the soul's intentions, key life themes, and the unique cosmic signature that defines this incarnation.

### Sun Sign Deep Dive
- Comprehensive analysis of core identity with the Sun in ${chartResult.sun?.sign || 'their sign'}
- House placement significance and life purpose themes
- Shadow aspects of this solar placement
- How to fully embody this Sun sign's highest expression

### Moon Sign Deep Dive
- Emotional landscape with the Moon in ${chartResult.moon?.sign || 'their sign'}
- House placement and the emotional home base
- Childhood imprints and nurturing needs
- The inner child and how to care for emotional well-being

### Rising Sign Deep Dive
- ${chartResult.rising?.sign || 'Their'} Rising and the persona presented to the world
- How others perceive this person vs. their inner experience
- The Ascendant as life path and approach to challenges
- Physical and energetic qualities associated with this Rising

### The Big Three Matrix
- Psychological integration of Sun, Moon, and Rising
- The tensions and gifts created by this combination
- Shadow work opportunities in the Big Three dynamic
- Living authentically with this core energy pattern

## Chapter 2: The Planets

### Personal Planets
#### Mercury: Mind & Communication
- In-depth analysis of mental patterns and communication style
- Learning approach and information processing
- How this Mercury placement affects relationships and work

#### Venus: Love, Beauty & Values
- Relationship patterns and attachment style
- Aesthetic sensibilities and creative expression
- What this person values and attracts

#### Mars: Action, Desire & Will
- How passion and anger are expressed
- Pursuit style and competitive nature
- Sexual energy and physical vitality

### Social Planets
#### Jupiter: Expansion & Wisdom
- Where growth and good fortune flow naturally
- Philosophical outlook and belief systems
- Teaching and mentoring themes

#### Saturn: Mastery & Karma
- Life's major lessons and tests
- Career and authority themes
- The path to maturity and mastery

### Outer Planets
#### Uranus: Revolution & Awakening
- Where liberation and innovation are needed

#### Neptune: Dreams & Transcendence
- Spiritual gifts and illusions to overcome

#### Pluto: Power & Transformation
- Deep psychological patterns and transformation themes

### Aspect Patterns
- Major aspects and their psychological significance
- Any grand trines, T-squares, or other configurations
- How aspects modify and combine planetary energies

### Life Themes & Soul Purpose
- Karmic patterns and soul evolution themes
- The chart's overall message and life direction

## Chapter 3: The Future

### 2026 Transit Forecast (Detailed)
- Month-by-month overview of major transits
- Saturn transits: lessons and restructuring
- Jupiter transits: opportunities and expansion
- Outer planet transits: deeper transformation cycles
- Eclipse impacts if relevant
- Recommended timing for major decisions
- Key dates and periods to watch

Total length: approximately 4500-5500 words.
`;
  }

  return { chartDataSection, analysisRequest };
}

// Format chart data for prompts (with degrees and arc-minutes for precision)
function formatChartData(chartResult) {
  // Helper to format degree with minutes, e.g., "24° 15'"
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

// Build prompts for add-on analysis types
function buildAddonPrompt(chartResult, analysisType, birthData) {
  const chartData = formatChartData(chartResult);

  switch (analysisType) {
    case 'house_deep_dive':
      return {
        systemPrompt: `You are a professional astrology report generator specializing in house analysis, NOT a chatbot.

CRITICAL RULES:
- The user cannot reply. Do NOT ask for more information or offer to explain further.
- Do NOT use phrases like "I hope this helps", "Let me know if you have questions", or "Feel free to ask".
- Write directly to the user (e.g., "Your 1st house..."). Use a definitive, empowering tone.

EXPERTISE:
- Expert in Western astrology using the Placidus house system
- Detailed and specific to the exact placements given
- Practical, offering concrete life guidance for each house
- If a cusp or planet is at a critical degree (0° or 29°), mention its significance

Format your response in clean Markdown with ## for each house.`,
        userPrompt: `## Birth Chart Data
${chartData}

Please provide a detailed analysis of all 12 houses in this natal chart.

For each house, explain:
1. **The Sign on the Cusp** - What energy governs this life area
2. **Any Planets Present** - How they influence matters of this house
3. **The House Ruler** - Where the ruling planet is placed and how it connects back
4. **Practical Guidance** - How to work with this house energy in daily life

Structure:
## 1st House - Self & Identity
[analysis]

## 2nd House - Resources & Values
[analysis]

...continue through all 12 houses...

Total length: approximately 2500-3000 words.`
      };

    case 'transit_report':
      const currentDate = new Date().toISOString().split('T')[0];
      return {
        systemPrompt: `You are a professional astrology report generator specializing in planetary transits, NOT a chatbot.

CRITICAL RULES:
- The user cannot reply. Do NOT ask for more information or offer to explain further.
- Do NOT use phrases like "I hope this helps", "Let me know if you have questions", or "Feel free to ask".
- Write directly to the user (e.g., "Saturn is currently transiting your..."). Use a definitive, empowering tone.

EXPERTISE:
- Expert transit astrologer tracking current planetary movements and their effects on natal charts
- Timely and relevant to current planetary positions
- Practical, offering guidance for navigating transit energies
- Balanced between challenges and opportunities
- Specific about timing and duration of influences

Format your response in clean Markdown.`,
        userPrompt: `## Birth Chart Data
${chartData}

## Current Date: ${currentDate}

Please provide a transit report covering the next 3 months.

Include:

### Current Major Transits
- Saturn's current position and aspects to natal planets
- Jupiter's current position and aspects to natal planets
- Any outer planet (Uranus, Neptune, Pluto) transits within 2° orb

### Month-by-Month Overview
For each of the next 3 months:
- Key transit activations
- Best timing for important decisions
- Areas requiring caution or patience
- Opportunities to leverage

### Key Themes
- Overall energy of this transit period
- Major life areas being activated
- Growth opportunities and challenges

Total length: approximately 1500-2000 words.`
      };

    case 'solar_return':
      // Calculate next birthday based on birth data
      const birthMonth = birthData?.birthMonth || 1;
      const birthDay = birthData?.birthDay || 1;
      const now = new Date();
      let nextBirthdayYear = now.getFullYear();
      const thisYearBirthday = new Date(nextBirthdayYear, birthMonth - 1, birthDay);
      if (now > thisYearBirthday) {
        nextBirthdayYear++;
      }

      return {
        systemPrompt: `You are a professional astrology report generator specializing in solar return charts, NOT a chatbot.

CRITICAL RULES:
- The user cannot reply. Do NOT ask for more information or offer to explain further.
- Do NOT use phrases like "I hope this helps", "Let me know if you have questions", or "Feel free to ask".
- Write directly to the user (e.g., "Your solar return for this year..."). Use a definitive, empowering tone.

EXPERTISE:
- Expert in solar return charts and predictive techniques
- Forward-looking and empowering
- Specific about themes and timing for the year ahead
- Practical with actionable guidance
- Balanced between opportunities and challenges

Format your response in clean Markdown.`,
        userPrompt: `## Natal Chart Data
${chartData}

## Solar Return Year: ${nextBirthdayYear}

Please provide a solar return analysis for the upcoming birthday year.

Include:

### Solar Return Overview
- General themes and energy of the year ahead
- How this year's solar return interacts with the natal chart

### Key Areas of Focus
Based on where planets fall in the solar return:
- Career and public life themes
- Relationship dynamics
- Personal growth opportunities
- Financial themes

### Quarterly Breakdown
- **Birthday to 3 months:** Initial themes and energy
- **3-6 months:** Development and challenges
- **6-9 months:** Culmination points
- **9-12 months:** Integration and preparation for next cycle

### Recommendations
- Best months for major decisions
- Areas requiring patience or caution
- How to maximize this year's potential

Total length: approximately 1500-2000 words.`
      };

    default:
      throw new Error(`Unknown analysis type: ${analysisType}`);
  }
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { chartResult, productType = 'base', analysisType = 'natal', birthData } = await req.json();

    // Parse zodiac system from prefixed analysisType (e.g., 'tropical_natal' -> 'tropical')
    const { zodiacSystem, baseType } = parseAnalysisType(analysisType);
    const zodiacContext = getZodiacSystemContext(zodiacSystem);

    // Validate required data
    if (!chartResult) {
      return new Response(JSON.stringify({ error: 'No chart data provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract the correct chart data based on zodiac system
    // Supports both old flat format and new { tropical, sidereal, meta } format
    const activeChart = chartResult[zodiacSystem] || chartResult;

    if (!activeChart.sun?.sign || !activeChart.moon?.sign || !activeChart.rising?.sign) {
      return new Response(JSON.stringify({ error: 'Incomplete chart data: missing Sun, Moon, or Rising' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt, userPrompt, model, maxTokens;

    // Handle add-on analysis types (non-natal)
    if (baseType !== 'natal' && ADDON_CONFIG[baseType]) {
      const addonConfig = ADDON_CONFIG[baseType];
      const prompts = buildAddonPrompt(activeChart, baseType, birthData);

      systemPrompt = prompts.systemPrompt + '\n' + zodiacContext;
      userPrompt = prompts.userPrompt;
      model = addonConfig.model;
      maxTokens = addonConfig.maxTokens;
    } else {
      // Handle natal chart analysis (tier-based logic)
      // Extract base bundle type from prefixed productType (e.g., 'tropical_essential' -> 'essential')
      const baseBundleType = productType?.replace(/^(tropical|sidereal)_/, '') || productType;
      const validProductTypes = ['base', 'essential', 'ultimate'];
      const tier = validProductTypes.includes(baseBundleType) ? baseBundleType : 'base';
      const config = PRODUCT_CONFIG[tier];

      const { chartDataSection, analysisRequest } = buildPrompt(activeChart, tier);

      systemPrompt = `You are a professional astrology report generator, NOT a chatbot.

CRITICAL RULES:
- The user cannot reply to this message. Do NOT ask for more information.
- Do NOT use conversational fillers like "I hope this helps", "Let me know if you have questions", "Feel free to ask", or "I'd be happy to explain more".
- Do NOT start with greetings like "Hello!" or "Hi there!".
- Write directly to the user in second person (e.g., "Your Sun is...", "You have...").
- Use a definitive, empowering, professional tone throughout.
${zodiacContext}

ASTROLOGICAL EXPERTISE:
- You are an expert astrologer with deep knowledge of the Placidus house system, planetary aspects, and psychological astrology.
- If a planet is at a critical degree (0° or 29°), mention the astrological significance of that degree using the precise minutes provided.
- Be insightful and specific to the exact placements given—avoid vague "Barnum statements" that could apply to anyone.
- Acknowledge tensions and challenges as growth opportunities.

FORMAT:
- Use clean Markdown: ## for major headers, ### for subsections, #### for sub-subsections
- Use **bold** for planet/sign combinations
- Use bullet points for lists where appropriate`;

      userPrompt = `${chartDataSection}\n\n${analysisRequest}`;
      model = config.model;
      maxTokens = config.maxTokens;
    }

    // Use Vercel AI SDK for streaming
    const result = streamText({
      model: openai(model),
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: maxTokens,
      temperature: 0.7,
    });

    // Return streaming response
    return result.toTextStreamResponse();

  } catch (error) {
    console.error('OpenAI API Error:', error);

    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return new Response(JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (error.code === 'rate_limit_exceeded') {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment and try again.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to generate analysis. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
