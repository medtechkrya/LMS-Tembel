import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePdfBuffer, getPdfFilename } from '@/lib/pdf'
import nodemailer from 'nodemailer'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: { student: true, mentor: true },
    })
    
    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    if (report.status !== 'done' && report.status !== 'sent') return NextResponse.json({ error: 'Report must be marked as done before sending' }, { status: 400 })
    if (!report.student.parent_email) return NextResponse.json({ error: 'Student does not have a parent email configured' }, { status: 400 })

    const sessions = await prisma.session.findMany({
      where: {
        student_id: report.student_id,
        date: { gte: report.period_start, lte: report.period_end },
      },
      orderBy: { date: 'asc' },
    })

    // 1. Generate PDF
    const pdfBuffer = await generatePdfBuffer({ ...report, sessions })
    const filename = getPdfFilename(report.student.name, report.period_end)

    // 2. Setup Nodemailer Transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // 3. Send Email
    const periodStr = `${report.period_start.toLocaleDateString('en-US', { month: 'short' })} - ${report.period_end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    
    const appreciations = [
      `We sincerely appreciate your continued support and trust in our learning program.`,
      `Thank you for your continuous support in ${report.student.name}'s learning journey.`,
      `We are very proud of ${report.student.name}'s effort and progress this month, and we thank you for your ongoing support.`,
      `Your encouragement at home plays a huge part in ${report.student.name}'s success. Thank you for partnering with us!`,
      `We truly value your trust in Teman Belajar and are excited to see ${report.student.name} continue to grow.`
    ]
    const randomAppreciation = appreciations[Math.floor(Math.random() * appreciations.length)]

    const senderAddress = process.env.SMTP_USER || 'temanbelajar@krya.global'
    const info = await transporter.sendMail({
      from: {
        name: 'Teman Belajar',
        address: senderAddress,
      },
      to: report.student.parent_email,
      subject: `Teman Belajar Krya Monthly Report - ${report.student.name} - ${periodStr}`,
      text: `Dear ${report.student.name} Parent,\n\nPlease find attached the monthly report for ${report.student.name} for the period of ${periodStr}.\n\n${randomAppreciation}\n\nIf you have any questions, feel free to contact us.\n\nBest regards,\nTeman Belajar Team`,
      html: `
        <div style="font-family: sans-serif; color: #2C1A0E; max-w: 600px; margin: 0 auto; line-height: 1.6;">
          <h2 style="color: #F5A623;">Monthly Report</h2>
          <p>Dear ${report.student.name} Parent,</p>
          <p>Please find attached the monthly report for <strong>${report.student.name}</strong> for the period of <strong>${periodStr}</strong>.</p>
          <p>${randomAppreciation}</p>
          <p>If you have any questions, feel free to contact us.</p>
          <br/>
          <p>Best regards,<br/><strong>Teman Belajar Team</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: filename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    })

    // 4. Get Preview URL (only works for Ethereal)
    const previewUrl = nodemailer.getTestMessageUrl(info)

    // 5. Update Status
    const updated = await prisma.report.update({
      where: { id: report.id },
      data: { status: 'sent' },
      include: { student: true, mentor: true },
    })

    return NextResponse.json({ 
      ok: true, 
      report: updated, 
      previewUrl: previewUrl || null 
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to send email' }, { status: 500 })
  }
}
