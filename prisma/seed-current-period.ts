import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fetching existing students and mentors...')
  
  // Get all mentors
  const mentors = await prisma.mentor.findMany()
  if (mentors.length === 0) return

  // Get all students
  const students = await prisma.student.findMany()
  if (students.length === 0) return

  // Determine current period
  const now = new Date()
  let startDate: Date
  
  if (now.getDate() >= 26) {
    startDate = new Date(now.getFullYear(), now.getMonth(), 26)
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 26)
  }

  console.log(`Adding extensive dummy sessions for ${students.length} students...`)

  const activities = [
    'Belajar HTML dan CSS dasar.',
    'Mengenal struktur data Array dan Object di JavaScript.',
    'Membuat aplikasi To-Do List sederhana.',
    'Mempelajari konsep React Components dan Props.',
    'Latihan menggunakan Tailwind CSS untuk styling.',
    'Eksplorasi API menggunakan Fetch dan Async/Await.',
    'Debugging error di console dan memahami Call Stack.',
    'Membangun mini project portofolio pribadi.',
    'Latihan logic perulangan (For/While loop).',
    'Pengenalan database dasar dan tabel relasi.'
  ]

  const observations = [
    'Siswa sangat responsif dan dapat mengikuti materi dengan cepat.',
    'Siswa masih bingung di beberapa bagian, perlu pengulangan materi di pertemuan berikutnya.',
    'Fokus siswa sangat baik hari ini, berhasil menyelesaikan semua challenge.',
    'Ada sedikit kendala jaringan, tapi siswa tetap berusaha menyimak.',
    'Siswa cukup aktif bertanya hal-hal di luar materi pokok, sangat kritis.',
    'Tugas mandiri berhasil diselesaikan sebelum waktu habis.',
    'Perlu dorongan lebih agar siswa berani mencoba kode sendiri.',
    'Kemampuan problem-solving siswa meningkat pesat.'
  ]

  const attendances = ['Present', 'Present', 'Present', 'Present', 'Absent', 'Reschedule']

  let totalAdded = 0

  for (const student of students) {
    // Pick a random mentor for this student
    const mentor = mentors[Math.floor(Math.random() * mentors.length)]
    
    // Add 4 to 6 sessions per student
    const sessionCount = Math.floor(Math.random() * 3) + 4
    
    for (let i = 0; i < sessionCount; i++) {
      // Spread dates across the period (1 to 28 days after start date)
      const date = new Date(startDate)
      date.setDate(date.getDate() + (i * 4) + Math.floor(Math.random() * 3))
      
      // Stop if date goes beyond today
      if (date > now) {
         // Cap it to today so we don't have future sessions if we don't want to, 
         // but wait, future sessions in the period are fine for dummy data. Let's just keep them within period.
         if (date.getDate() >= 26 && date.getMonth() === now.getMonth() + (now.getDate() >= 26 ? 1 : 0)) {
           continue; // beyond end period
         }
      }

      await prisma.session.create({
        data: {
          student_id: student.id,
          mentor_id: mentor.id,
          date: date,
          attendance: attendances[Math.floor(Math.random() * attendances.length)],
          activity: activities[Math.floor(Math.random() * activities.length)],
          observation: observations[Math.floor(Math.random() * observations.length)],
          photo_path: null,
        }
      })
      totalAdded++
    }
  }

  console.log(`✅ ${totalAdded} more dummy sessions added across ${students.length} students!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })