import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { name, program, parent_email } = await req.json()
  if (!name?.trim() || !program?.trim()) {
    return NextResponse.json({ error: 'Name and program are required' }, { status: 400 })
  }
  const student = await prisma.student.update({
    where: { id: params.id },
    data: { name: name.trim(), program: program.trim(), parent_email: parent_email?.trim() ?? '' },
  })
  return NextResponse.json(student)
}
