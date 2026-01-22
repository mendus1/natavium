const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

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

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let browser = null;

  try {
    const { chartResult, birthData } = req.body;

    if (!chartResult || !birthData) {
      return res.status(400).json({ error: "Missing chart or birth data" });
    }

    // Format birth date
    const months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const birthDate = `${months[parseInt(birthData.birthMonth, 10) - 1]} ${birthData.birthDay}, ${birthData.birthYear}`;

    // Build planetary placements rows
    const planets = [
      { name: "Sun", glyph: "☉", data: chartResult.sun },
      { name: "Moon", glyph: "☽", data: chartResult.moon },
      { name: "Mercury", glyph: "☿", data: chartResult.mercury },
      { name: "Venus", glyph: "♀", data: chartResult.venus },
      { name: "Mars", glyph: "♂", data: chartResult.mars },
      { name: "Jupiter", glyph: "♃", data: chartResult.jupiter },
      { name: "Saturn", glyph: "♄", data: chartResult.saturn },
      { name: "Uranus", glyph: "♅", data: chartResult.uranus },
      { name: "Neptune", glyph: "♆", data: chartResult.neptune },
      { name: "Pluto", glyph: "♇", data: chartResult.pluto },
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

    // Generate HTML for PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #be185d 100%);
      color: white;
      min-height: 100vh;
      padding: 40px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 40px; }
    .title { font-size: 48px; font-weight: 900; color: #fde047; margin-bottom: 8px; }
    .subtitle { font-size: 18px; color: #c4b5fd; margin-bottom: 16px; }
    .birth-info { font-size: 14px; color: #e2e8f0; }
    .chart-id { font-size: 12px; color: #9ca3af; margin-top: 8px; }

    .section {
      background: rgba(255,255,255,0.1);
      border-radius: 24px;
      padding: 32px;
      margin-bottom: 24px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .section-title { font-size: 24px; font-weight: 700; margin-bottom: 24px; color: #fde047; }

    .big-three { display: flex; flex-direction: column; gap: 16px; }
    .planet-card {
      padding: 20px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .sun-card { background: linear-gradient(135deg, rgba(234,179,8,0.3), rgba(249,115,22,0.3)); border-color: rgba(234,179,8,0.5); }
    .moon-card { background: linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3)); border-color: rgba(59,130,246,0.5); }
    .rising-card { background: linear-gradient(135deg, rgba(236,72,153,0.3), rgba(139,92,246,0.3)); border-color: rgba(236,72,153,0.5); }

    .planet-name { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .sun-card .planet-name { color: #fde047; }
    .moon-card .planet-name { color: #93c5fd; }
    .rising-card .planet-name { color: #f9a8d4; }
    .planet-detail { font-size: 13px; color: #c4b5fd; }

    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
    th { color: #fde047; font-weight: 600; background: rgba(255,255,255,0.05); }
    td { color: #e2e8f0; }

    .forecast {
      background: linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3));
      border-color: rgba(139,92,246,0.5);
    }
    .forecast p { color: #e2e8f0; line-height: 1.7; margin-bottom: 12px; }
    .forecast p:last-child { margin-bottom: 0; }

    .footer { text-align: center; margin-top: 40px; color: #a78bfa; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">✨ Natavium ✨</div>
      <div class="subtitle">Your Complete Natal Chart</div>
      <div class="birth-info">${birthDate} • ${birthData.time} • ${birthData.location}</div>
      ${chartResult.chartId ? `<div class="chart-id">Chart ID: ${chartResult.chartId}</div>` : ""}
    </div>

    <div class="section">
      <div class="section-title">Your Big Three</div>
      <div class="big-three">
        <div class="planet-card sun-card">
          <div class="planet-name">☉ ${chartResult.sun?.sign || "—"} Sun</div>
          <div class="planet-detail">${chartResult.sun?.degree || "—"}° in ${chartResult.sun?.house || "—"}${getHouseSuffix(chartResult.sun?.house)} house • Core Identity</div>
        </div>
        <div class="planet-card moon-card">
          <div class="planet-name">☽ ${chartResult.moon?.sign || "—"} Moon</div>
          <div class="planet-detail">${chartResult.moon?.degree || "—"}° in ${chartResult.moon?.house || "—"}${getHouseSuffix(chartResult.moon?.house)} house • Emotional Core</div>
        </div>
        <div class="planet-card rising-card">
          <div class="planet-name">↑ ${chartResult.rising?.sign || "—"} Rising</div>
          <div class="planet-detail">${chartResult.rising?.degree || "—"}° Ascendant • How Others See You</div>
        </div>
      </div>
    </div>

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

    <div class="section forecast">
      <div class="section-title">🔮 2026 Forecast</div>
      <p>With Jupiter transiting through your chart, 2026 brings significant opportunities for growth and expansion. Your ${chartResult.sun?.sign || ""} Sun will be energized by favorable aspects, encouraging you to step into leadership roles and pursue long-held ambitions.</p>
      <p>Saturn's influence this year asks you to build solid foundations. This is an excellent time for career advancement, particularly in areas that require discipline and long-term planning.</p>
      <p><strong>Key periods:</strong> Spring brings romantic opportunities • Summer favors financial decisions • Fall is ideal for personal development</p>
    </div>

    <div class="footer">
      Generated by Natavium • natavium.com
    </div>
  </div>
</body>
</html>
    `;

    // Launch browser
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

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

    // Return PDF as base64
    const pdfBase64 = pdfBuffer.toString("base64");

    return res.status(200).json({
      success: true,
      pdf: pdfBase64,
      filename: `natavium-chart-${chartResult.sun?.sign?.toLowerCase() || "natal"}-${Date.now()}.pdf`
    });

  } catch (err) {
    console.error("PDF generation error:", err);
    if (browser) {
      await browser.close();
    }
    return res.status(500).json({ error: err.message || "PDF generation failed" });
  }
};
