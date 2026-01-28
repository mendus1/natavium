// api/generate-analysis.js
// Using Vercel AI SDK with streaming for long reports
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const config = {
  runtime: 'edge',
};

// Product tier configurations for natal chart analysis
// TODO: Switch essential/ultimate to 'gpt-4o' once OpenAI quota is set up
// TODO: Increase maxTokens for production (currently reduced for testing)
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
    maxTokens: 1500,
    sections: ['bigThree', 'planets', 'houses', 'aspects', 'themes', 'transits'],
    includeTransits: true,
    includeCompatibility: false,
  },
  ultimate: {
    model: 'gpt-4o-mini',
    maxTokens: 2000,
    sections: ['bigThree', 'planets', 'houses', 'aspects', 'themes', 'transits', 'vedic'],
    includeTransits: true,
    includeCompatibility: true,
  },
};

// Configurations for add-on analysis types
const ADDON_CONFIG = {
  house_deep_dive: {
    model: 'gpt-4o-mini',
    maxTokens: 1500,
  },
  transit_report: {
    model: 'gpt-4o-mini',
    maxTokens: 1200,
  },
  vedic_chart: {
    model: 'gpt-4o-mini',
    maxTokens: 1500,
  },
  solar_return: {
    model: 'gpt-4o-mini',
    maxTokens: 1500,
  },
};

// Build the prompt based on product tier
function buildPrompt(chartResult, productType) {
  const config = PRODUCT_CONFIG[productType] || PRODUCT_CONFIG.base;

  // Base chart data (always included)
  let chartDataSection = `
## Birth Chart Data
- **Sun:** ${chartResult.sun?.sign || 'Unknown'} in House ${chartResult.sun?.house || '?'}
- **Moon:** ${chartResult.moon?.sign || 'Unknown'} in House ${chartResult.moon?.house || '?'}
- **Ascendant (Rising):** ${chartResult.rising?.sign || 'Unknown'}
- **Mercury:** ${chartResult.mercury?.sign || 'Unknown'} in House ${chartResult.mercury?.house || '?'}
- **Venus:** ${chartResult.venus?.sign || 'Unknown'} in House ${chartResult.venus?.house || '?'}
- **Mars:** ${chartResult.mars?.sign || 'Unknown'} in House ${chartResult.mars?.house || '?'}
- **Jupiter:** ${chartResult.jupiter?.sign || 'Unknown'} in House ${chartResult.jupiter?.house || '?'}
- **Saturn:** ${chartResult.saturn?.sign || 'Unknown'} in House ${chartResult.saturn?.house || '?'}
- **Uranus:** ${chartResult.uranus?.sign || 'Unknown'} in House ${chartResult.uranus?.house || '?'}
- **Neptune:** ${chartResult.neptune?.sign || 'Unknown'} in House ${chartResult.neptune?.house || '?'}
- **Pluto:** ${chartResult.pluto?.sign || 'Unknown'} in House ${chartResult.pluto?.house || '?'}
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
Please provide a natal chart analysis including:

1. **The Big Three Analysis** (Sun, Moon, Rising)
   - Core identity and ego expression (Sun)
   - Emotional nature and inner self (Moon)
   - How they present to the world (Rising)
   - How these three energies interact and potentially create internal tensions or harmony

2. **Planetary Placements Overview**
   - Brief interpretation of each planet's sign placement
   - Focus on the personal planets (Mercury, Venus, Mars)

3. **House Emphasis**
   - Which life areas are most emphasized based on planetary placements

Keep the analysis grounded and specific to these placements. Avoid generic statements.
Total length: approximately 800-1000 words.
`;
  } else if (productType === 'essential') {
    analysisRequest = `
Please provide a comprehensive natal chart analysis including:

1. **The Big Three Deep Dive** (Sun, Moon, Rising)
   - Detailed analysis of core identity, emotional nature, and outer presentation
   - How these three create a unique personality matrix
   - Potential internal conflicts or harmonies between these energies

2. **All Planetary Placements**
   - Detailed interpretation of each planet's sign and house placement
   - Personal planets (Mercury, Venus, Mars): communication, love, drive
   - Social planets (Jupiter, Saturn): growth, limitations, life lessons
   - Generational planets (Uranus, Neptune, Pluto): deeper transformative themes

3. **Major Aspects Analysis**
   - How planets interact with each other
   - Key strengths and challenges indicated by aspects

4. **Key Life Themes & Patterns**
   - Recurring themes across the chart
   - Soul purpose indicators
   - Karmic patterns if evident

5. **Strengths & Challenges Breakdown**
   - Natural talents and gifts
   - Areas requiring conscious development

6. **2026 Transit Forecast**
   - Major planetary transits affecting this chart in 2026
   - Key periods of opportunity and challenge
   - Areas of life most activated

Total length: approximately 3000-3500 words.
`;
  } else if (productType === 'ultimate') {
    analysisRequest = `
Please provide an elite-level natal chart analysis including:

1. **The Big Three Deep Dive** (Sun, Moon, Rising)
   - Comprehensive analysis of the personality matrix
   - Psychological integration of these three energies
   - Shadow aspects and growth edges

2. **Complete Planetary Analysis**
   - In-depth interpretation of all planetary placements
   - Personal, social, and generational planet meanings
   - Retrograde planets if any (note: check if data indicates retrogrades)

3. **Aspect Pattern Analysis**
   - All major aspects and their psychological meaning
   - Any grand trines, T-squares, or other configurations
   - How aspects modify planetary expression

4. **Life Themes & Soul Purpose**
   - North Node/South Node interpretation if available
   - Karmic patterns and past-life indicators
   - Soul evolution themes

5. **Strengths, Challenges & Shadow Work**
   - Natural gifts and how to maximize them
   - Challenge areas as growth opportunities
   - Shadow integration work suggested

6. **2026 Transit Forecast (Detailed)**
   - Month-by-month overview of major transits
   - Saturn, Jupiter, and outer planet transits
   - Eclipse impacts if relevant
   - Recommended timing for major decisions

7. **Vedic/Sidereal Perspective**
   - How the chart shifts in Vedic astrology (approximately 23° earlier)
   - Key differences in interpretation
   - Vedic insights that complement the Western reading

Total length: approximately 4500-5500 words.
`;
  }

  return { chartDataSection, analysisRequest };
}

// Format chart data for prompts
function formatChartData(chartResult) {
  return `
- **Sun:** ${chartResult.sun?.sign || 'Unknown'} in House ${chartResult.sun?.house || '?'}
- **Moon:** ${chartResult.moon?.sign || 'Unknown'} in House ${chartResult.moon?.house || '?'}
- **Ascendant (Rising):** ${chartResult.rising?.sign || 'Unknown'}
- **Mercury:** ${chartResult.mercury?.sign || 'Unknown'} in House ${chartResult.mercury?.house || '?'}
- **Venus:** ${chartResult.venus?.sign || 'Unknown'} in House ${chartResult.venus?.house || '?'}
- **Mars:** ${chartResult.mars?.sign || 'Unknown'} in House ${chartResult.mars?.house || '?'}
- **Jupiter:** ${chartResult.jupiter?.sign || 'Unknown'} in House ${chartResult.jupiter?.house || '?'}
- **Saturn:** ${chartResult.saturn?.sign || 'Unknown'} in House ${chartResult.saturn?.house || '?'}
- **Uranus:** ${chartResult.uranus?.sign || 'Unknown'} in House ${chartResult.uranus?.house || '?'}
- **Neptune:** ${chartResult.neptune?.sign || 'Unknown'} in House ${chartResult.neptune?.house || '?'}
- **Pluto:** ${chartResult.pluto?.sign || 'Unknown'} in House ${chartResult.pluto?.house || '?'}`;
}

// Build prompts for add-on analysis types
function buildAddonPrompt(chartResult, analysisType, birthData) {
  const chartData = formatChartData(chartResult);

  switch (analysisType) {
    case 'house_deep_dive':
      return {
        systemPrompt: `You are an expert Western astrologer specializing in house analysis using the Placidus house system.

Your interpretation style is:
- Detailed and specific to the exact placements given
- Practical, offering concrete life guidance for each house
- Acknowledging how planets in houses modify expression
- Understanding house rulers and their placements

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
        systemPrompt: `You are an expert transit astrologer who tracks current planetary movements and their effects on natal charts.

Your interpretation style is:
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

    case 'vedic_chart':
      return {
        systemPrompt: `You are an expert Jyotish (Vedic) astrologer with deep knowledge of the sidereal zodiac, Nakshatras, and traditional Hindu astrology.

Your interpretation style is:
- Grounded in authentic Vedic tradition
- Clear about the differences from Western tropical astrology
- Incorporating Nakshatra wisdom
- Respectful of the spiritual dimensions of Jyotish

Format your response in clean Markdown.`,
        userPrompt: `## Western/Tropical Birth Chart Data
${chartData}

Please provide a Vedic astrology perspective on this chart.

**Important:** Convert all positions to sidereal using Lahiri ayanamsa (subtract approximately 24° from tropical positions for 2024-2026 births, or calculate based on birth year).

Include:

### Vedic Placements
- Sidereal Sun sign (Rashi) and interpretation
- Sidereal Moon sign - crucial in Vedic astrology
- Sidereal Ascendant (Lagna)
- Key planetary differences from Western interpretation

### Moon's Nakshatra
- Which of the 27 Nakshatras the Moon occupies
- The deity, symbol, and qualities of this Nakshatra
- How it influences emotional nature and life path

### Key Vedic Insights
- Yogas (planetary combinations) if evident
- Strength of key planets (dig bala, own sign, exaltation)
- Areas where Vedic and Western perspectives align or differ

### Spiritual Dimensions
- Dharma indicators
- Karmic patterns suggested by the chart

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
        systemPrompt: `You are an expert astrologer specializing in solar return charts and predictive techniques.

Your interpretation style is:
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

    // Validate required data
    if (!chartResult) {
      return new Response(JSON.stringify({ error: 'No chart data provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!chartResult.sun?.sign || !chartResult.moon?.sign || !chartResult.rising?.sign) {
      return new Response(JSON.stringify({ error: 'Incomplete chart data: missing Sun, Moon, or Rising' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt, userPrompt, model, maxTokens;

    // Handle add-on analysis types
    if (analysisType !== 'natal' && ADDON_CONFIG[analysisType]) {
      const addonConfig = ADDON_CONFIG[analysisType];
      const prompts = buildAddonPrompt(chartResult, analysisType, birthData);

      systemPrompt = prompts.systemPrompt;
      userPrompt = prompts.userPrompt;
      model = addonConfig.model;
      maxTokens = addonConfig.maxTokens;
    } else {
      // Handle natal chart analysis (existing tier-based logic)
      const validProductTypes = ['base', 'essential', 'ultimate'];
      const tier = validProductTypes.includes(productType) ? productType : 'base';
      const config = PRODUCT_CONFIG[tier];

      const { chartDataSection, analysisRequest } = buildPrompt(chartResult, tier);

      systemPrompt = `You are an expert Western astrologer with deep knowledge of the Placidus house system, planetary aspects, and psychological astrology.

Your interpretation style is:
- Insightful and specific to the exact placements given
- Empowering without being unrealistic
- Psychologically grounded while honoring astrological tradition
- Avoiding vague "Barnum statements" that could apply to anyone
- Acknowledging tensions and challenges as growth opportunities

Format your response in clean Markdown:
- Use ## for major section headers
- Use ### for subsections
- Use **bold** for planet/sign combinations
- Use bullet points for lists
- Include a brief intro and conclusion`;

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
