// api/generate-teaser.js
// Lightweight teaser generation for free preview - runs on chart load
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chartResult, zodiacSystem = 'tropical' } = req.body;

    // Validate required data
    if (!chartResult) {
      return res.status(400).json({ error: 'No chart data provided' });
    }

    // Support both dual format { tropical, sidereal, meta } and old flat format
    const activeChart = chartResult[zodiacSystem] || chartResult;
    const zodiacLabel = zodiacSystem === 'sidereal' ? 'Sidereal (Fagan-Bradley)' : 'Tropical';

    if (!activeChart.sun?.sign || !activeChart.moon?.sign || !activeChart.rising?.sign) {
      return res.status(400).json({ error: 'Incomplete chart data: missing Sun, Moon, or Rising' });
    }

    const systemPrompt = `You are an expert astrologer writing a compelling teaser for a natal chart reading.
Your goal is to hook the reader with specific, intriguing insights that make them want to learn more.
Be specific to the placements - avoid generic statements.
Write in second person ("You...").
Keep it mystical but grounded.
This chart uses the ${zodiacLabel} zodiac system.`;

    const userPrompt = `Write a short, compelling teaser (3 paragraphs, ~150 words total) for someone with:
- Sun in ${activeChart.sun.sign} (${activeChart.sun.house}${getHouseSuffix(activeChart.sun.house)} house)
- Moon in ${activeChart.moon.sign} (${activeChart.moon.house}${getHouseSuffix(activeChart.moon.house)} house)
- Rising in ${activeChart.rising.sign}

Focus on:
1. Their core identity and what drives them (Sun)
2. Their emotional nature and inner world (Moon)
3. How others perceive them and first impressions (Rising)

End with an intriguing hint about what the full reading reveals (to encourage purchase).
Do NOT use markdown formatting - just plain text with paragraph breaks.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 400,
      temperature: 0.8,
    });

    const teaser = completion.choices[0].message.content;

    res.status(200).json({ teaser });

  } catch (error) {
    console.error('Teaser generation error:', error);

    if (error.code === 'rate_limit_exceeded') {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    }

    res.status(500).json({ error: 'Failed to generate teaser' });
  }
}

function getHouseSuffix(n) {
  const num = Number(n);
  if (num % 100 >= 11 && num % 100 <= 13) return 'th';
  switch (num % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
