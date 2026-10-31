import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatPeriod } from '@/lib/period'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const iconConfig = {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/icon.png?v=2', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png?v=2', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png?v=2', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: { student: true, mentor: true },
    })

    if (!report) {
      return {
        title: 'Monthly Report',
        description: 'Student Monthly Progress Report at Teman Belajar.',
        icons: iconConfig,
      }
    }

    const studentName = report.student?.name || 'Student'
    const period = formatPeriod(
      report.period_start instanceof Date ? report.period_start.toISOString() : String(report.period_start),
      report.period_end instanceof Date ? report.period_end.toISOString() : String(report.period_end)
    )

    const mentorPart = report.mentor?.name ? ` (${report.mentor.name})` : ''
    const title = `${studentName}${mentorPart} - Monthly Report (${period})`
    const description = `Monthly learning progress report for ${studentName} (${period}) at Teman Belajar.`

    return {
      title,
      description,
      icons: iconConfig,
      openGraph: {
        title,
        description,
        type: 'article',
        images: [
          {
            url: '/og-image.png',
            width: 1200,
            height: 630,
            alt: `Teman Belajar - ${title}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og-image.png'],
      },
    }
  } catch {
    return {
      title: 'Monthly Report',
      description: 'Student Monthly Progress Report at Teman Belajar.',
      icons: iconConfig,
    }
  }
}

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
