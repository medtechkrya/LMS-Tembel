import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatPeriod } from '@/lib/period'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  try {
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: { student: true },
    })

    if (!report) {
      return {
        title: 'Monthly Report',
        description: 'Student Monthly Progress Report at Teman Belajar.',
      }
    }

    const studentName = report.student?.name || 'Student'
    const period = formatPeriod(
      report.period_start instanceof Date ? report.period_start.toISOString() : String(report.period_start),
      report.period_end instanceof Date ? report.period_end.toISOString() : String(report.period_end)
    )

    const title = `${studentName} - Monthly Report (${period})`
    const description = `Monthly learning progress report for ${studentName} (${period}) at Teman Belajar.`

    return {
      title,
      description,
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
    }
  }
}

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
