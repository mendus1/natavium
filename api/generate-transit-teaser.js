// api/generate-transit-teaser.js
// Lightweight transit teaser generation for free preview - runs on chart load
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

    const currentDate = new Date().toISOString().split('T')[0];

    const systemPrompt = `You are an expert transit astrologer writing a compelling teaser for a personalized transit report.
Your goal is to hook the reader with specific, timely insights about current planetary movements affecting their chart.
Be specific to the placements - avoid generic statements.
Write in second person ("You...").
Keep it mystical but grounded and timely.
This chart uses the ${zodiacLabel} zodiac system.
Today's date is ${currentDate}.`;

    const userPrompt = `Write a short, compelling transit teaser (2 paragraphs, ~120 words total) for someone with:
- Sun in ${activeChart.sun.sign} (${activeChart.sun.house}${getHouseSuffix(activeChart.sun.house)} house)
- Moon in ${activeChart.moon.sign} (${activeChart.moon.house}${getHouseSuffix(activeChart.moon.house)} house)
- Rising in ${activeChart.rising.sign}
- Saturn in ${activeChart.saturn?.sign || 'Unknown'} (${activeChart.saturn?.house || '?'}${getHouseSuffix(activeChart.saturn?.house)} house)
- Jupiter in ${activeChart.jupiter?.sign || 'Unknown'} (${activeChart.jupiter?.house || '?'}${getHouseSuffix(activeChart.jupiter?.house)} house)

Focus on:
1. The most significant current transit affecting their chart right now
2. A brief hint at upcoming shifts in the next few months

End with an intriguing hint about what the full transit report reveals (to encourage purchase).
Do NOT use markdown formatting - just plain text with paragraph breaks.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const teaser = completion.choices[0].message.content;

    res.status(200).json({ teaser });

  } catch (error) {
    console.error('Transit teaser generation error:', error);

    if (error.code === 'rate_limit_exceeded') {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    }

    res.status(500).json({ error: 'Failed to generate transit teaser' });
  }
}

function getHouseSuffix(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return 'th';
  if (num % 100 >= 11 && num % 100 <= 13) return 'th';
  switch (num % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
