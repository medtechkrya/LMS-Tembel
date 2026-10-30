import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const { name, program, parent_email, status } = body

  const dataToUpdate: any = {}
  if (name !== undefined) {
    if (!name.trim()) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
    dataToUpdate.name = name.trim()
  }
  if (program !== undefined) {
    if (!program.trim()) return NextResponse.json({ error: 'Program cannot be empty' }, { status: 400 })
    dataToUpdate.program = program.trim()
  }
  if (parent_email !== undefined) {
    dataToUpdate.parent_email = parent_email.trim()
  }
  if (status !== undefined) {
    if (status !== 'active' && status !== 'archived') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    dataToUpdate.status = status
  }

  const student = await prisma.student.update({
    where: { id: params.id },
    data: dataToUpdate,
  })
  return NextResponse.json(student)
}
