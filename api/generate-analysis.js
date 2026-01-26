// api/generate-analysis.js
// Using Edge Runtime for 30-second timeout (vs 10s for serverless)
import OpenAI from 'openai';

export const config = {
  runtime: 'edge',
};

// Product tier configurations
// TODO: Switch essential/ultimate to 'gpt-4o' once OpenAI quota is set up
// TODO: Increase maxTokens for production (currently reduced to avoid serverless timeouts)
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

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { chartResult, productType = 'base' } = await req.json();

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

    // Validate product type
    const validProductTypes = ['base', 'essential', 'ultimate'];
    const tier = validProductTypes.includes(productType) ? productType : 'base';
    const config = PRODUCT_CONFIG[tier];

    // Build the prompt
    const { chartDataSection, analysisRequest } = buildPrompt(chartResult, tier);

    const systemPrompt = `You are an expert Western astrologer with deep knowledge of the Placidus house system, planetary aspects, and psychological astrology.

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

    const userPrompt = `${chartDataSection}\n\n${analysisRequest}`;

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: config.maxTokens,
      temperature: 0.7,
    });

    const analysisText = completion.choices[0].message.content;

    // Return the analysis
    return new Response(JSON.stringify({
      analysis: analysisText,
      productType: tier,
      model: config.model,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

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
