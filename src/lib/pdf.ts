import puppeteer from 'puppeteer'
import puppeteerCore from 'puppeteer-core'
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

export function getPdfFilename(studentName: string, periodEnd: Date, mentorName?: string | null): string {
  const firstName = studentName.trim().split(' ')[0]
  const month = periodEnd.toLocaleDateString('en-US', { month: 'long' })
  const mentorPart = mentorName ? `-${mentorName.trim().split(' ')[0]}` : ''
  return `MR-${firstName}-${month}${mentorPart}.pdf`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Converts plain text containing bullet points, numbered lists, or paragraphs
 * into clean, beautifully styled HTML for PDF rendering.
 */
export function formatRichTextToHtml(text: string | null | undefined): string {
  if (!text || !text.trim()) return ''

  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const output: string[] = []
  let listType: 'ul' | 'ol' | null = null

  function closeList() {
    if (listType === 'ul') {
      output.push('</ul>')
      listType = null
    } else if (listType === 'ol') {
      output.push('</ol>')
      listType = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    if (!trimmed) {
      closeList()
      continue
    }

    // Unordered bullet list: - item, * item, • item, ● item, etc.
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/) || trimmed.match(/^[•●○◦▪▫■–—·∙⁃►▸]\s*(.*)$/)
    // Ordered numbered list: 1. item, 1) item, (1) item, etc.
    const olMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/) || trimmed.match(/^\((\d+)\)\s*(.*)$/)

    if (ulMatch) {
      if (listType === 'ol') closeList()
      if (listType !== 'ul') {
        output.push('<ul style="margin:4px 0 6px 18px;padding-left:0;list-style-type:disc;">')
        listType = 'ul'
      }
      const itemText = ulMatch[1] ?? ulMatch[2] ?? ''
      output.push(`<li style="margin-bottom:3px;padding-left:4px;line-height:1.5;">${escapeHtml(itemText)}</li>`)
    } else if (olMatch) {
      if (listType === 'ul') closeList()
      if (listType !== 'ol') {
        output.push('<ol style="margin:4px 0 6px 18px;padding-left:0;list-style-type:decimal;">')
        listType = 'ol'
      }
      const itemText = olMatch[1] ?? olMatch[2] ?? ''
      output.push(`<li style="margin-bottom:3px;padding-left:4px;line-height:1.5;">${escapeHtml(itemText)}</li>`)
    } else {
      closeList()
      output.push(`<p style="margin:0 0 6px 0;line-height:1.55;">${escapeHtml(trimmed)}</p>`)
    }
  }

  closeList()
  return output.join('')
}

async function resolveImageSrc(filePath: string): Promise<string | null> {
  try {
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      const res = await fetch(filePath)
      if (!res.ok) return null
      const buf = Buffer.from(await res.arrayBuffer())
      const ext = filePath.split('.').pop()?.toLowerCase() ?? 'webp'
      const mime = ext === 'jpg' ? 'jpeg' : ext
      return `data:image/${mime};base64,${buf.toString('base64')}`
    }
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

export async function buildReportHtml(report: PdfReportData): Promise<string> {
  const periodHeader = formatPeriodHeader(report.period_start, report.period_end)
  const mentorName = report.mentor?.name || '—'
  const logoSrc = await resolveImageSrc('/Logo-Teman-Belajar.png')
  const logoHtml = logoSrc
    ? `<img src="${logoSrc}" alt="Teman Belajar" style="width:180px;display:block;" />`
    : `<span style="font-size:18px;font-weight:bold;">Teman Belajar</span>`

  const sessionRows = report.sessions
    .map((s, i) => {
      return `<tr style="page-break-inside:avoid;">
      <td style="width:20%;border:1px solid #000;padding:6px;vertical-align:top;">
        Session ${i + 1}<br/><small>${formatSessionDate(s.date)}</small>
      </td>
      <td style="width:30%;border:1px solid #000;padding:6px;vertical-align:top;word-wrap:break-word;overflow-wrap:break-word;word-break:break-word;">
        ${formatRichTextToHtml(s.activity)}
      </td>
      <td style="width:50%;border:1px solid #000;padding:6px;vertical-align:top;word-wrap:break-word;overflow-wrap:break-word;word-break:break-word;">
        ${formatRichTextToHtml(s.observation)}
      </td>
    </tr>`
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
    min-height: 48pt;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
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
    ? `<div class="section-body">${formatRichTextToHtml(report.summary_achievements)}</div>`
    : `<div class="section-body empty">Not yet filled in.</div>`}
</div>
<div class="section" style="margin-bottom:0;border-bottom:none;">
  <div class="section-title" style="border-bottom:none;">2. Journal of Activities</div>
</div>
<table style="width:100%;table-layout:fixed;border-collapse:collapse;border:1px solid #000;margin-top:0;margin-bottom:12pt;">
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
    ? `<div class="section-body">${formatRichTextToHtml(report.summary_general)}</div>`
    : `<div class="section-body empty">Not yet filled in.</div>`}
</div>
<div class="section">
  <div class="section-title">4. Notes for Parents</div>
  ${report.summary_parents
    ? `<div class="section-body">${formatRichTextToHtml(report.summary_parents)}</div>`
    : `<div class="section-body empty">Not yet filled in.</div>`}
</div>
<div class="footer">
  <div>${formatFooterDate(report.period_end)}</div>
  <div>${mentorName}, Team Teman Belajar Krya</div>
</div>
</body>
</html>`
}

export async function generatePdfBuffer(report: PdfReportData): Promise<Buffer> {
  const html = await buildReportHtml(report)
  
  let browser;
  if (process.env.NODE_ENV === 'production') {
    // Gunakan sparticuz + puppeteer-core di server (production/Vercel)
    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: (chromium as any).defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: (chromium as any).headless,
    })
  } else {
    // Gunakan puppeteer standar di localhost/development
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  }

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
