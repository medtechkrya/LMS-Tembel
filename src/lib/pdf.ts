import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import fs from 'fs'
import path from 'path'

export type PdfReportData = {
  student: { name: string; program: string }
  mentor: { name: string } | null
  period_start: Date
  period_end: Date
  summary_achievements: string | null
  summary_general: string | null
  summary_parents: string | null
  sessions: Array<{
    id: string
    date: Date
    activity: string
    observation: string
    photo_path: string | null
  }>
}

function formatPeriodHeader(start: Date, end: Date): string {
  const s = start.toLocaleDateString('en-US', { month: 'long' })
  const e = end.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  return `${s} - ${e}`
}

function formatFooterDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatSessionDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getPdfFilename(studentName: string, periodEnd: Date): string {
  const firstName = studentName.split(' ')[0]
  const month = periodEnd.toLocaleDateString('en-US', { month: 'long' })
  return `MR-${firstName}-${month}.pdf`
}

function fileToBase64(filePath: string): string | null {
  try {
    const absPath = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''))
    if (!fs.existsSync(absPath)) return null
    const buf = fs.readFileSync(absPath)
    const ext = path.extname(absPath).toLowerCase().replace('.', '')
    const mime = ext === 'jpg' ? 'jpeg' : ext
    return `data:image/${mime};base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

export function buildReportHtml(report: PdfReportData): string {
  const periodHeader = formatPeriodHeader(report.period_start, report.period_end)
  const mentorName = report.mentor?.name || '—'
  const logoSrc = fileToBase64('/Logo-Teman-Belajar.png')
  const logoHtml = logoSrc
    ? `<img src="${logoSrc}" alt="Teman Belajar" style="width:180px;display:block;" />`
    : `<span style="font-size:18px;font-weight:bold;">Teman Belajar</span>`

  const sessionRows = report.sessions
    .map((s, i) => {
      const photoSrc = s.photo_path ? fileToBase64(s.photo_path) : null
      const photoHtml = photoSrc
        ? `<br/><img src="${photoSrc}" alt="Session photo" style="max-width:80px;max-height:60px;margin-top:4px;display:block;" />`
        : ''
      return `<tr style="page-break-inside:avoid;"><td style="width:20%;border:1px solid #000;padding:6px;vertical-align:top;">Session ${i + 1}<br/><small>${formatSessionDate(s.date)}</small>${photoHtml}</td><td style="width:30%;border:1px solid #000;padding:6px;vertical-align:top;word-wrap:break-word;">${s.activity}</td><td style="width:50%;border:1px solid #000;padding:6px;vertical-align:top;word-wrap:break-word;">${s.observation}</td></tr>`
    })
    .join('')

  const emptyRow = `<tr><td colspan="3" style="border:1px solid #000;padding:12px 8px;text-align:center;font-style:italic;color:#555;">No sessions recorded in this period.</td></tr>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Monthly Report – ${report.student.name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    color: #000;
    background: #fff;
    padding: 0;
    line-height: 1.55;
  }
  .header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 18pt;
  }
  .header-meta { text-align: right; font-size: 12pt; }
  .report-title {
    font-size: 18pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 14pt;
    letter-spacing: 0.02em;
  }
  .section {
    border: 1px solid #000;
    margin-bottom: 12pt;
    margin-top: 16px;
    page-break-inside: avoid;
  }
  .section-title {
    font-weight: bold;
    font-size: 12pt;
    padding: 6pt 10pt;
    border-bottom: 1px solid #000;
    background: #f5f5f5;
  }
  .section-body {
    padding: 8pt 10pt;
    min-height: 60pt;
    white-space: pre-wrap;
    font-size: 12pt;
    line-height: 1.6;
  }
  .section-body.empty { color: #888; font-style: italic; }
  .footer {
    margin-top: 20pt;
    text-align: right;
    font-size: 12pt;
    line-height: 1.8;
  }
  @page { size: A4; margin: 20mm 20mm 20mm 20mm; }
</style>
</head>
<body>
<div class="header-row">
  <div>${logoHtml}</div>
  <div class="header-meta">
    <div><strong>Mentor's Name</strong> : ${mentorName}</div>
    <div><strong>Period</strong> : ${periodHeader}</div>
    <div><strong>Student's Name</strong> : ${report.student.name}</div>
  </div>
</div>
<div class="report-title">Monthly Report</div>
<div class="section">
  <div class="section-title">1. Learning Achievements This Period</div>
  ${report.summary_achievements
    ? `<div class="section-body">${report.summary_achievements}</div>`
    : `<div class="section-body empty">Not yet filled in.</div>`}
</div>
<div class="section">
  <div class="section-title">2. Journal of Activities</div>
</div>
<table style="width:100%;border-collapse:collapse;border:1px solid #000;margin-top:-1px;margin-bottom:12pt;">
  <thead>
    <tr>
      <th style="width:20%;border:1px solid #000;padding:6px;text-align:left;background:#f0f0f0;">Session</th>
      <th style="width:30%;border:1px solid #000;padding:6px;text-align:left;background:#f0f0f0;">Activity</th>
      <th style="width:50%;border:1px solid #000;padding:6px;text-align:left;background:#f0f0f0;">Observation Results</th>
    </tr>
  </thead>
  <tbody>
    ${report.sessions.length === 0 ? emptyRow : sessionRows}
  </tbody>
</table>
<div class="section">
  <div class="section-title">3. Overall Development Observation</div>
  ${report.summary_general
    ? `<div class="section-body">${report.summary_general}</div>`
    : `<div class="section-body empty">Not yet filled in.</div>`}
</div>
<div class="section">
  <div class="section-title">4. Notes for Parents</div>
  ${report.summary_parents
    ? `<div class="section-body">${report.summary_parents}</div>`
    : `<div class="section-body empty">Not yet filled in.</div>`}
</div>
<div class="footer">
  <div>${formatFooterDate(report.period_end)}</div>
  <div>${mentorName}, Team Teman Belajar Krya</div>
</div>
</body>
</html>`
}

function findChromiumBinPath(): string | undefined {
  const possiblePaths = [
    path.join(process.cwd(), 'node_modules/@sparticuz/chromium/bin'),
    path.join(process.cwd(), '.next/server/node_modules/@sparticuz/chromium/bin'),
    path.join(process.cwd(), '.next/standalone/node_modules/@sparticuz/chromium/bin'),
    '/var/task/node_modules/@sparticuz/chromium/bin',
    '/var/task/.next/server/node_modules/@sparticuz/chromium/bin',
    '/var/task/.next/standalone/node_modules/@sparticuz/chromium/bin',
  ]
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p
  }
  return undefined
}

async function getExecutablePath(): Promise<string> {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_VERSION ||
    process.env.AWS_EXECUTION_ENV
  )

  if (isServerless) {
    const binPath = findChromiumBinPath()
    return await chromium.executablePath(binPath)
  }

  // Local environments detection
  if (process.platform === 'darwin') {
    const macPaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    ]
    for (const p of macPaths) {
      if (fs.existsSync(p)) return p
    }
  } else if (process.platform === 'win32') {
    const winPaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    ]
    for (const p of winPaths) {
      if (fs.existsSync(p)) return p
    }
  } else {
    const linuxPaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
    ]
    for (const p of linuxPaths) {
      if (fs.existsSync(p)) return p
    }
  }

  return await chromium.executablePath()
}

export async function generatePdfBuffer(report: PdfReportData): Promise<Buffer> {
  const html = buildReportHtml(report)
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_VERSION ||
    process.env.AWS_EXECUTION_ENV
  )
  const executablePath = await getExecutablePath()

  const browser = await puppeteer.launch({
    args: isServerless
      ? chromium.args
      : [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
        ],
    executablePath,
    headless: true,
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'domcontentloaded' })
    const pdfUint8 = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    })
    return Buffer.from(pdfUint8)
  } finally {
    await browser.close()
  }
}
