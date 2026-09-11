import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const students = await prisma.student.findMany({
    select: { id: true, name: true, program: true, parent_email: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(students)
}

export async function POST(req: NextRequest) {
  const { name, program, parent_email } = await req.json()
  if (!name?.trim() || !program?.trim()) {
    return NextResponse.json({ error: 'name and program are required' }, { status: 400 })
  }
  const student = await prisma.student.create({
    data: { name: name.trim(), program: program.trim(), parent_email: (parent_email ?? '').trim() },
  })
  return NextResponse.json(student, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await prisma.student.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
