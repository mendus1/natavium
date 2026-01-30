const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

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
const ANALYSIS_TITLES = {
  natal: '📜 Chapter 1: The Core Analysis',
  house_deep_dive: '🏠 House Deep Dive',
  transit_report: '🔮 Chapter 3: Your Future',
  vedic_chart: '🕉️ Vedic Chart Analysis',
  solar_return: '☀️ Solar Return Analysis',
  compatibility: '💕 Compatibility Analysis',
};

// Build HTML sections for all analyses (email version with proper ordering)
function buildAnalysesSections(analyses) {
  if (!analyses || typeof analyses !== 'object') return '';

  // Order: Chapter 1 (natal/core), Chapter 3 (transits), then additional products
  const order = ['natal', 'transit_report', 'house_deep_dive', 'vedic_chart', 'solar_return', 'compatibility'];
  let sections = '';

  for (const key of order) {
    const analysis = analyses[key];
    if (analysis?.content) {
      const title = ANALYSIS_TITLES[key] || key;
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

  try {
    const { email, chartResult, birthData, analyses } = req.body;

    if (!email || !chartResult || !birthData) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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
      { name: "Sun", data: chartResult.sun, emoji: "☉" },
      { name: "Moon", data: chartResult.moon, emoji: "☽" },
      { name: "Mercury", data: chartResult.mercury, emoji: "☿" },
      { name: "Venus", data: chartResult.venus, emoji: "♀" },
      { name: "Mars", data: chartResult.mars, emoji: "♂" },
      { name: "Jupiter", data: chartResult.jupiter, emoji: "♃" },
      { name: "Saturn", data: chartResult.saturn, emoji: "♄" },
      { name: "Uranus", data: chartResult.uranus, emoji: "♅" },
      { name: "Neptune", data: chartResult.neptune, emoji: "♆" },
      { name: "Pluto", data: chartResult.pluto, emoji: "♇" },
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
      <p style="color: #c4b5fd; font-size: 16px; margin: 0;">Your Natal Chart Results</p>
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
            <div style="color: #fde047; font-size: 18px; font-weight: bold;">☉ ${chartResult.sun?.sign || "—"} Sun</div>
            <div style="color: #c4b5fd; font-size: 12px;">${chartResult.sun?.degree || "—"}° • ${chartResult.sun?.house || "—"}${getHouseSuffix(chartResult.sun?.house)} house • Core Identity</div>
          </div>
          <!-- Moon -->
          <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2)); border-radius: 10px; padding: 12px 14px; border: 1px solid rgba(59, 130, 246, 0.3);">
            <div style="color: #93c5fd; font-size: 18px; font-weight: bold;">☽ ${chartResult.moon?.sign || "—"} Moon</div>
            <div style="color: #c4b5fd; font-size: 12px;">${chartResult.moon?.degree || "—"}° • ${chartResult.moon?.house || "—"}${getHouseSuffix(chartResult.moon?.house)} house • Emotional Core</div>
          </div>
          <!-- Rising -->
          <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2)); border-radius: 10px; padding: 12px 14px; border: 1px solid rgba(236, 72, 153, 0.3);">
            <div style="color: #f9a8d4; font-size: 18px; font-weight: bold;">↑ ${chartResult.rising?.sign || "—"} Rising</div>
            <div style="color: #c4b5fd; font-size: 12px;">${chartResult.rising?.degree || "—"}° Ascendant • How Others See You</div>
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
          <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">With Jupiter transiting through your chart, 2026 brings significant opportunities for growth and expansion. Your <strong style="color: #f9a8d4;">${chartResult.sun?.sign || ""} Sun</strong> will be energized by favorable aspects.</p>
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
      subject: `Your Natal Chart - ${chartResult.sun?.sign || ""} Sun, ${chartResult.moon?.sign || ""} Moon, ${chartResult.rising?.sign || ""} Rising`,
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
