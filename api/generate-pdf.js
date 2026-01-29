import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';

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
const ANALYSIS_TITLES = {
  natal: 'Chapter 1: The Core Analysis',
  house_deep_dive: 'House Deep Dive',
  transit_report: 'Chapter 3: Your Future — Transits & Forecast',
  vedic_chart: 'Vedic Chart Perspective',
  solar_return: 'Solar Return Analysis',
  compatibility: 'Compatibility Analysis',
};

// Build HTML sections for all analyses (with proper chapter ordering)
function buildAnalysesSections(analyses) {
  if (!analyses || typeof analyses !== 'object') return '';

  // Ordered by: Chapter 1 (natal/core), Chapter 2 (planets - from natal), Chapter 3 (transits/forecast)
  // Then additional products: house_deep_dive, vedic_chart, solar_return, compatibility
  const order = ['natal', 'transit_report', 'house_deep_dive', 'vedic_chart', 'solar_return', 'compatibility'];
  let sections = '';

  for (const key of order) {
    const analysis = analyses[key];
    if (analysis?.content) {
      const title = ANALYSIS_TITLES[key] || key;
      const html = markdownToHtml(analysis.content);
      const isChapter = key === 'natal' || key === 'transit_report';

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let browser = null;

  try {
    const { chartResult, birthData, chartImage, analyses } = req.body;

    if (!chartResult || !birthData) {
      return res.status(400).json({ error: "Missing chart or birth data" });
    }

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
    <div class="cover-title">✨ Natavium ✨</div>
    <div class="cover-subtitle">Your Complete Natal Chart</div>

    <div class="cover-big-three">
      <div class="cover-sign-label">Sun Sign</div>
      <div class="cover-sign">☉ ${chartResult.sun?.sign || "—"}</div>

      <div class="cover-sign-label">Moon Sign</div>
      <div class="cover-sign">☽ ${chartResult.moon?.sign || "—"}</div>

      <div class="cover-sign-label">Rising Sign</div>
      <div class="cover-sign">↑ ${chartResult.rising?.sign || "—"}</div>
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
          <p>With Jupiter transiting through your chart, 2026 brings significant opportunities for growth and expansion. Your <strong>${chartResult.sun?.sign || ""} Sun</strong> will be energized by favorable aspects, encouraging you to step into leadership roles and pursue long-held ambitions.</p>
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