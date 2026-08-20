import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function upsertMentor(name: string): Promise<string> {
  const existing = await prisma.mentor.findFirst({ where: { name } })
  if (existing) return existing.id
  const created = await prisma.mentor.create({ data: { name } })
  return created.id
}

async function upsertStudent(
  name: string,
  program: string,
  parent_email: string
): Promise<string> {
  const existing = await prisma.student.findFirst({ where: { name } })
  if (existing) return existing.id
  const created = await prisma.student.create({ data: { name, program, parent_email } })
  return created.id
}

interface SessionData {
  date: string
  attendance: string
  activity: string
  observation: string
  next_step?: string
}

async function seedSessions(
  studentId: string,
  mentorId: string,
  sessions: SessionData[]
) {
  const existing = await prisma.session.findFirst({ where: { student_id: studentId } })
  if (existing) {
    console.log(`  → sessions already exist, skipping`)
    return
  }
  for (const s of sessions) {
    await prisma.session.create({
      data: {
        student_id: studentId,
        mentor_id: mentorId,
        date: new Date(s.date),
        attendance: s.attendance,
        activity: s.activity,
        observation: s.observation,
        next_step: s.next_step ?? null,
      },
    })
  }
  console.log(`  → ${sessions.length} sessions created`)
}

async function main() {
  console.log('Starting seed...\n')

  // ── MENTORS ────────────────────────────────────────────────────────────
  const mentorNames = [
    'Ryan', 'Spartan', 'Dian',
    'Dinda', 'Syifa', 'Sari', 'Ms Wahyu', 'Yaya',
    'Fendy', 'Nanda', 'John', 'Arya', 'Dhisa', 'Muklis',
  ]
  const mentorIds: Record<string, string> = {}
  for (const name of mentorNames) {
    mentorIds[name] = await upsertMentor(name)
    console.log(`Mentor: ${name}`)
  }

  // ── LEGACY STUDENTS (original seed) ───────────────────────────────────
  console.log('\nLegacy students...')

  const budiId = await upsertStudent('Budi Santoso', 'Matematika Dasar', 'budi.parent@example.com')
  console.log('Student: Budi Santoso')
  await seedSessions(budiId, mentorIds['Ryan'], [
    { date: '2026-03-27', attendance: 'hadir', activity: 'Latihan soal perkalian dan pembagian bilangan bulat.', observation: 'Siswa menunjukkan pemahaman yang baik terhadap materi perkalian.', next_step: 'Lanjut ke bab pembagian pecahan.' },
    { date: '2026-03-31', attendance: 'hadir', activity: 'Membaca teks dan menjawab pertanyaan pemahaman.', observation: 'Perlu lebih banyak latihan pada bagian pemahaman bacaan.' },
    { date: '2026-04-03', attendance: 'hadir', activity: 'Diskusi konsep dasar sains tentang fotosintesis.', observation: 'Kemajuan sangat pesat minggu ini, siswa aktif bertanya.' },
    { date: '2026-04-07', attendance: 'hadir', activity: 'Review materi minggu lalu dan latihan soal ujian.', observation: 'Siswa mampu mengerjakan soal secara mandiri dengan baik.' },
    { date: '2026-04-10', attendance: 'Reschedule', activity: '-', observation: 'Sesi dijadwalkan ulang karena siswa sakit.' },
    { date: '2026-04-14', attendance: 'hadir', activity: 'Pengenalan topik baru: geometri dasar.', observation: 'Siswa antusias dengan topik baru, perlu penguatan di bagian sudut.' },
  ])

  const sitiId = await upsertStudent('Siti Rahayu', 'Bahasa Inggris', 'siti.parent@example.com')
  console.log('Student: Siti Rahayu')
  await seedSessions(sitiId, mentorIds['Dian'], [
    { date: '2026-03-28', attendance: 'hadir', activity: 'Latihan percakapan sehari-hari dalam Bahasa Inggris.', observation: 'Pronunciation sudah meningkat, tapi kosakata perlu diperkaya.' },
    { date: '2026-04-01', attendance: 'hadir', activity: 'Membaca teks pendek dan diskusi isi cerita.', observation: 'Siswa memahami isi cerita dengan baik, aktif berdiskusi.' },
    { date: '2026-04-04', attendance: 'Tidak Hadir', activity: '-', observation: 'Siswa tidak hadir tanpa konfirmasi.' },
    { date: '2026-04-08', attendance: 'hadir', activity: 'Latihan grammar: present tense dan past tense.', observation: 'Masih sering keliru di past tense irregular verbs.' },
    { date: '2026-04-15', attendance: 'hadir', activity: 'Menulis paragraf tentang aktivitas sehari-hari.', observation: 'Tulisan sudah runtut, perlu perbaikan di penggunaan article.' },
  ])

  const andiId = await upsertStudent('Andi Wijaya', 'IPA Terpadu', 'andi.parent@example.com')
  console.log('Student: Andi Wijaya')
  await seedSessions(andiId, mentorIds['Spartan'], [
    { date: '2026-03-27', attendance: 'hadir', activity: 'Percobaan sederhana tentang gaya dan gerak benda.', observation: 'Siswa sangat antusias saat praktik, pemahaman konsep sudah baik.' },
    { date: '2026-04-02', attendance: 'hadir', activity: 'Belajar sistem tata surya dan planet-planet.', observation: 'Siswa mampu menyebutkan semua planet dengan urutan yang benar.' },
    { date: '2026-04-09', attendance: 'hadir', activity: 'Diskusi ekosistem dan rantai makanan.', observation: 'Perlu pendalaman lebih lanjut tentang produsen dan konsumen.' },
    { date: '2026-04-16', attendance: 'hadir', activity: 'Latihan soal persiapan ulangan IPA.', observation: 'Hasil latihan memuaskan, rata-rata skor 80%. Siap untuk ulangan.' },
  ])

  // ── NEW STUDENTS ────────────────────────────────────────────────────────
  console.log('\nNew students...')

  // Roman → Dinda (Matematika)
  const romanId = await upsertStudent('Roman', 'Matematika', 'roman.parent@example.com')
  console.log('Student: Roman')
  await seedSessions(romanId, mentorIds['Dinda'], [
    { date: '2026-03-27', attendance: 'Present', activity: 'Latihan soal operasi hitung campuran dan urutan operasi matematika.', observation: 'Roman memahami konsep urutan operasi dengan baik. Ia bisa menyelesaikan soal sederhana secara mandiri, namun masih perlu bimbingan untuk soal bertingkat.', next_step: 'Lanjutkan ke soal cerita yang melibatkan operasi hitung campuran.' },
    { date: '2026-03-31', attendance: 'Present', activity: 'Belajar konsep pecahan: penjumlahan dan pengurangan pecahan berpenyebut berbeda.', observation: 'Roman menunjukkan kemajuan yang baik. Ia sudah bisa menyamakan penyebut, meskipun masih sesekali keliru dalam penyederhanaan hasil.', next_step: 'Latihan soal pecahan campuran.' },
    { date: '2026-04-03', attendance: 'Reschedule', activity: '-', observation: 'Sesi dijadwalkan ulang atas permintaan orang tua.', next_step: 'Lanjut dari materi pecahan di sesi berikutnya.' },
    { date: '2026-04-07', attendance: 'Present', activity: 'Pengenalan konsep bilangan negatif dan garis bilangan.', observation: 'Roman awalnya bingung dengan konsep negatif, namun setelah menggunakan garis bilangan sebagai alat bantu, pemahamannya meningkat pesat. Aktif bertanya selama sesi.', next_step: 'Operasi penjumlahan dan pengurangan bilangan negatif.' },
    { date: '2026-04-10', attendance: 'Present', activity: 'Latihan soal persiapan ulangan materi bilangan.', observation: 'Roman mengerjakan 15 soal dengan 12 jawaban benar. Masih perlu penguatan di soal yang melibatkan pecahan dan bilangan negatif sekaligus.', next_step: 'Review soal yang salah sebelum ulangan.' },
    { date: '2026-04-17', attendance: 'Present', activity: 'Review hasil ulangan dan pembahasan soal yang salah.', observation: 'Roman menunjukkan sikap yang baik dalam menerima koreksi. Ia mau mencoba ulang soal yang salah dengan sabar dan akhirnya memahami kesalahannya.', next_step: 'Mulai materi geometri dasar di sesi berikutnya.' },
  ])

  // Emma → Syifa (Bahasa Inggris)
  const emmaId = await upsertStudent('Emma', 'Bahasa Inggris', 'emma.parent@example.com')
  console.log('Student: Emma')
  await seedSessions(emmaId, mentorIds['Syifa'], [
    { date: '2026-03-28', attendance: 'Present', activity: 'Latihan speaking: memperkenalkan diri dan orang lain dalam Bahasa Inggris.', observation: 'Emma sangat percaya diri dalam berbicara. Pronunciation sudah cukup baik untuk levelnya. Ia aktif mencoba kalimat baru meski masih ada grammar yang perlu diperbaiki.', next_step: 'Latihan dialog situasi sehari-hari.' },
    { date: '2026-04-01', attendance: 'Present', activity: 'Reading comprehension: teks pendek tentang kebiasaan baik sehari-hari.', observation: 'Emma mampu menjawab 5 dari 7 pertanyaan dengan benar. Ia memahami ide utama teks dengan baik, namun masih perlu latihan dalam menarik kesimpulan.', next_step: 'Teks dengan level sedikit lebih tinggi.' },
    { date: '2026-04-04', attendance: 'Present', activity: 'Grammar: penggunaan present continuous tense dalam konteks sehari-hari.', observation: 'Emma cepat menangkap pola kalimat present continuous. Ia bisa membuat kalimat sendiri dengan benar. Sedikit keliru saat menggunakan kata kerja tidak beraturan.', next_step: 'Latihan membedakan simple present dan present continuous.' },
    { date: '2026-04-11', attendance: 'Tidak Hadir', activity: '-', observation: 'Emma tidak hadir karena sakit. Orang tua sudah mengkonfirmasi.' },
    { date: '2026-04-15', attendance: 'Present', activity: 'Writing: menulis cerita pendek tentang hari libur menggunakan past tense.', observation: 'Tulisan Emma runtut dan kreatif. Kosakata sudah cukup beragam. Masih perlu perbaikan pada konsistensi penggunaan past tense dan penggunaan conjunction.', next_step: 'Revisi tulisan dan latihan soal past tense.' },
    { date: '2026-04-22', attendance: 'Present', activity: 'Review materi semester: grammar, reading, dan vocabulary.', observation: 'Emma menunjukkan perkembangan yang sangat baik. Ia sudah lebih percaya diri dan kosakatanya berkembang pesat. Perlu terus berlatih writing.', next_step: 'Persiapan untuk evaluasi bulanan.' },
  ])

  // Ethan → Sari (IPA)
  const ethanId = await upsertStudent('Ethan', 'IPA dan Sains', 'ethan.parent@example.com')
  console.log('Student: Ethan')
  await seedSessions(ethanId, mentorIds['Sari'], [
    { date: '2026-03-27', attendance: 'Present', activity: 'Percobaan membuat larutan dan campuran dari bahan-bahan dapur.', observation: 'Ethan sangat antusias dengan kegiatan eksperimen. Ia mengikuti langkah percobaan dengan teliti dan bisa membedakan larutan dan campuran dengan benar.', next_step: 'Lanjut ke konsep asam dan basa sederhana.' },
    { date: '2026-04-02', attendance: 'Present', activity: 'Belajar sistem pencernaan manusia: organ dan fungsinya.', observation: 'Ethan mampu menyebutkan organ pencernaan secara urut. Ia aktif bertanya tentang proses di lambung dan usus. Pemahaman konsep sudah baik.', next_step: 'Latihan soal sistem pencernaan.' },
    { date: '2026-04-09', attendance: 'Present', activity: 'Diskusi tentang fotosintesis: bahan, proses, dan hasil.', observation: 'Ethan memahami konsep fotosintesis dengan baik setelah dijelaskan dengan diagram. Ia bisa menjelaskan kembali proses dengan kata-katanya sendiri.', next_step: 'Hubungan fotosintesis dengan rantai makanan.' },
    { date: '2026-04-16', attendance: 'Reschedule', activity: '-', observation: 'Sesi dijadwalkan ulang karena mentor berhalangan.' },
    { date: '2026-04-23', attendance: 'Present', activity: 'Latihan soal IPA persiapan ujian: campuran, pencernaan, dan fotosintesis.', observation: 'Ethan mengerjakan soal dengan cukup baik. Skor latihan 75%. Masih perlu penguatan di bagian sistem pencernaan, terutama fungsi spesifik tiap organ.', next_step: 'Review soal yang belum tepat sebelum ujian.' },
  ])

  // Kairos → Sari (Matematika)
  const kairosId = await upsertStudent('Kairos', 'Matematika', 'kairos.parent@example.com')
  console.log('Student: Kairos')
  await seedSessions(kairosId, mentorIds['Sari'], [
    { date: '2026-03-28', attendance: 'Present', activity: 'Pengenalan konsep luas dan keliling bangun datar: persegi dan persegi panjang.', observation: 'Kairos memahami rumus dengan cepat. Ia bisa menerapkan rumus luas dan keliling dengan benar pada soal-soal standar.', next_step: 'Lanjut ke bangun segitiga dan lingkaran.' },
    { date: '2026-04-04', attendance: 'Present', activity: 'Latihan soal luas segitiga dan trapesium.', observation: 'Kairos perlu lebih teliti dalam membaca soal. Beberapa kali salah karena tidak memperhatikan satuan. Pemahaman rumus sudah benar.', next_step: 'Latihan soal campuran berbagai bangun datar.' },
    { date: '2026-04-11', attendance: 'Present', activity: 'Soal cerita yang melibatkan konsep luas dalam konteks nyata.', observation: 'Kairos mulai menunjukkan kemampuan berpikir logis dalam soal cerita. Ia mampu mengidentifikasi informasi yang diperlukan dengan baik.', next_step: 'Pengenalan konsep volume bangun ruang.' },
    { date: '2026-04-18', attendance: 'Present', activity: 'Pengenalan volume kubus dan balok.', observation: 'Kairos antusias belajar geometri ruang. Ia sudah bisa menghitung volume kubus, namun masih perlu latihan untuk balok dengan dimensi berbeda.', next_step: 'Latihan soal volume dan konversi satuan.' },
    { date: '2026-04-24', attendance: 'Present', activity: 'Review keseluruhan materi geometri dan latihan soal ujian.', observation: 'Kairos menunjukkan perkembangan yang konsisten. Ia mengerjakan latihan dengan serius dan hasilnya memuaskan. Siap untuk evaluasi.', next_step: 'Evaluasi bulanan materi geometri.' },
  ])

  // Ara → Sari (Bahasa Indonesia)
  const araId = await upsertStudent('Ara', 'Bahasa Indonesia', 'ara.parent@example.com')
  console.log('Student: Ara')
  await seedSessions(araId, mentorIds['Sari'], [
    { date: '2026-03-29', attendance: 'Present', activity: 'Latihan menulis karangan deskripsi tentang tempat favorit.', observation: 'Ara memiliki kemampuan ekspresi yang baik secara lisan, namun dalam menulis masih kurang terstruktur. Perlu latihan menyusun kerangka karangan sebelum menulis.', next_step: 'Latihan membuat mind map sebelum menulis.' },
    { date: '2026-04-05', attendance: 'Present', activity: 'Belajar jenis-jenis kalimat: kalimat tunggal dan majemuk.', observation: 'Ara sudah bisa membedakan kalimat tunggal dan majemuk dengan baik. Ia aktif membuat contoh kalimatnya sendiri yang kreatif.', next_step: 'Latihan menggunakan konjungsi yang tepat.' },
    { date: '2026-04-12', attendance: 'Tidak Hadir', activity: '-', observation: 'Ara tidak hadir. Tidak ada konfirmasi sebelumnya dari orang tua.' },
    { date: '2026-04-19', attendance: 'Present', activity: 'Membaca puisi dan menganalisis majas yang digunakan.', observation: 'Ara sangat menikmati kegiatan puisi. Ia mampu mengidentifikasi majas dengan cukup baik. Ekspresi saat membaca puisi juga sudah bagus.', next_step: 'Mencoba menulis puisi sederhana sendiri.' },
    { date: '2026-04-23', attendance: 'Present', activity: 'Latihan soal persiapan ujian Bahasa Indonesia: pilihan ganda dan uraian.', observation: 'Ara mengerjakan dengan cukup baik terutama di bagian pilihan ganda. Bagian uraian masih perlu perbaikan dalam penggunaan ejaan yang benar.', next_step: 'Review EYD dan penulisan kata baku.' },
  ])

  // Amirtha → Spartan (Bahasa Indonesia)
  const amirthaId = await upsertStudent('Amirtha', 'Bahasa Indonesia', 'amirtha.parent@example.com')
  console.log('Student: Amirtha')
  await seedSessions(amirthaId, mentorIds['Spartan'], [
    { date: '2026-03-27', attendance: 'Present', activity: 'Membaca teks narasi dan mengidentifikasi unsur cerita: tokoh, latar, dan alur.', observation: 'Amirtha mampu mengidentifikasi tokoh dan latar dengan tepat. Ia memerlukan bimbingan lebih dalam memahami alur cerita yang kompleks.', next_step: 'Latihan menganalisis alur dengan diagram.' },
    { date: '2026-04-03', attendance: 'Present', activity: 'Latihan menulis teks prosedur: cara membuat sesuatu.', observation: 'Amirtha menulis teks prosedur dengan urut dan jelas. Penggunaan kata penghubung antar langkah sudah baik. Ejaan perlu sedikit perbaikan.', next_step: 'Membandingkan teks prosedur dengan teks laporan.' },
    { date: '2026-04-10', attendance: 'Present', activity: 'Diskusi dan latihan soal materi teks eksposisi.', observation: 'Amirtha menunjukkan kemajuan dalam memahami teks eksposisi. Ia sudah bisa membedakan fakta dan opini dengan cukup baik.', next_step: 'Menulis paragraf eksposisi sendiri.' },
    { date: '2026-04-17', attendance: 'Present', activity: 'Pengenalan dan latihan menulis surat resmi dan tidak resmi.', observation: 'Amirtha cepat memahami perbedaan format surat resmi dan tidak resmi. Tulisannya rapi dan terstruktur. Perlu memperhatikan penggunaan bahasa yang lebih formal.', next_step: 'Latihan menulis surat lamaran sederhana.' },
    { date: '2026-04-24', attendance: 'Reschedule', activity: '-', observation: 'Sesi dijadwalkan ulang karena ada acara keluarga.' },
  ])

  // Hilal → Ms Wahyu (Matematika)
  const hilalId = await upsertStudent('Hilal', 'Matematika', 'hilal.parent@example.com')
  console.log('Student: Hilal')
  await seedSessions(hilalId, mentorIds['Ms Wahyu'], [
    { date: '2026-03-28', attendance: 'Present', activity: 'Latihan soal aljabar: menyederhanakan dan mengoperasikan bentuk aljabar.', observation: 'Hilal memahami konsep variabel dengan baik. Ia bisa menyederhanakan bentuk aljabar sederhana, namun masih perlu latihan untuk ekspresi yang lebih kompleks.', next_step: 'Persamaan linear satu variabel.' },
    { date: '2026-04-04', attendance: 'Present', activity: 'Pengenalan persamaan linear satu variabel dan cara menyelesaikannya.', observation: 'Hilal menunjukkan kemampuan yang baik dalam menyelesaikan persamaan linear. Langkah-langkah penyelesaiannya sistematis dan rapi.', next_step: 'Soal cerita persamaan linear dalam konteks nyata.' },
    { date: '2026-04-11', attendance: 'Present', activity: 'Soal cerita yang diselesaikan dengan persamaan linear.', observation: 'Hilal bisa mengidentifikasi variabel dalam soal cerita, namun masih kadang kesulitan dalam memodelkan soal ke dalam persamaan. Perlu lebih banyak latihan.', next_step: 'Latihan pemodelan soal cerita.' },
    { date: '2026-04-18', attendance: 'Present', activity: 'Pengenalan pertidaksamaan linear dan penyelesaiannya.', observation: 'Hilal dengan cepat memahami konsep pertidaksamaan setelah dikaitkan dengan persamaan yang sudah dipelajari. Ia mampu menentukan himpunan penyelesaian dengan benar.', next_step: 'Latihan soal gabungan persamaan dan pertidaksamaan.' },
    { date: '2026-04-22', attendance: 'Present', activity: 'Review dan latihan soal aljabar menyeluruh untuk persiapan evaluasi.', observation: 'Hilal mengerjakan latihan dengan teliti dan hasilnya sangat baik. Perkembangan dari sesi pertama sangat terlihat. Ia siap menghadapi evaluasi.', next_step: 'Evaluasi materi aljabar.' },
  ])

  // Franka → Yaya (Bahasa Inggris)
  const frankaId = await upsertStudent('Franka', 'Bahasa Inggris', 'franka.parent@example.com')
  console.log('Student: Franka')
  await seedSessions(frankaId, mentorIds['Yaya'], [
    { date: '2026-03-29', attendance: 'Present', activity: 'Latihan listening: mendengarkan percakapan pendek dan menjawab pertanyaan.', observation: 'Franka memiliki kemampuan listening yang cukup baik. Ia bisa menangkap informasi utama dari percakapan. Perlu latihan lebih untuk memahami aksen yang berbeda.', next_step: 'Listening dengan teks yang lebih panjang.' },
    { date: '2026-04-05', attendance: 'Present', activity: 'Grammar: modal verbs (can, could, should, must) dan penggunaannya.', observation: 'Franka memahami perbedaan penggunaan modal verb dengan baik. Ia bisa membuat kalimat yang tepat untuk setiap modal. Sangat aktif dalam latihan.', next_step: 'Latihan dalam konteks percakapan.' },
    { date: '2026-04-12', attendance: 'Present', activity: 'Speaking: bermain peran sebagai dokter dan pasien menggunakan modal verbs.', observation: 'Franka sangat menikmati kegiatan role play. Kepercayaan dirinya dalam berbicara meningkat signifikan. Grammar sudah cukup baik dalam konteks percakapan.', next_step: 'Role play situasi lain: di restoran, di toko.' },
    { date: '2026-04-19', attendance: 'Tidak Hadir', activity: '-', observation: 'Franka tidak hadir. Sudah ada konfirmasi dari orang tua H-1.' },
    { date: '2026-04-23', attendance: 'Present', activity: 'Writing: menulis email informal kepada teman tentang rencana liburan.', observation: 'Tulisan Franka natural dan komunikatif. Format email sudah benar. Perlu perbaikan kecil di penggunaan tanda baca dan kapitalisasi.', next_step: 'Membandingkan email formal dan informal.' },
  ])

  // Queency → Fendy (Bahasa Inggris)
  const queencyId = await upsertStudent('Queency', 'Bahasa Inggris', 'queency.parent@example.com')
  console.log('Student: Queency')
  await seedSessions(queencyId, mentorIds['Fendy'], [
    { date: '2026-03-27', attendance: 'Present', activity: 'Latihan percakapan: membahas hobi dan kegiatan akhir pekan.', observation: 'Queency sangat komunikatif dan percaya diri. Kosakatanya kaya dan penggunaan grammar sudah cukup baik. Sesekali masih ada kekeliruan dalam subject-verb agreement.', next_step: 'Diskusi topik yang lebih kompleks: lingkungan dan teknologi.' },
    { date: '2026-04-02', attendance: 'Present', activity: 'Reading: artikel tentang kebiasaan sehat dan gaya hidup aktif.', observation: 'Queency mampu membaca dengan lancar dan memahami isi artikel secara keseluruhan. Kemampuan inferensi sudah mulai berkembang.', next_step: 'Latihan menjawab soal inferensi dan main idea.' },
    { date: '2026-04-09', attendance: 'Present', activity: 'Grammar lanjutan: passive voice dalam kalimat present dan past.', observation: 'Queency memahami struktur passive voice dengan cepat. Ia bisa mengubah kalimat aktif ke pasif dengan benar. Masih sesekali lupa dengan perubahan objek menjadi subjek.', next_step: 'Latihan passive voice dalam teks.' },
    { date: '2026-04-16', attendance: 'Present', activity: 'Writing: menulis paragraf argumentatif tentang pentingnya teknologi dalam belajar.', observation: 'Queency menghasilkan paragraf yang terstruktur baik dengan argumen yang logis. Penggunaan transition words sudah tepat. Kesimpulan paragraf perlu diperkuat.', next_step: 'Latihan menulis esai pendek 3 paragraf.' },
    { date: '2026-04-23', attendance: 'Present', activity: 'Evaluasi bulanan: speaking, reading, dan writing.', observation: 'Queency menunjukkan perkembangan yang luar biasa dalam satu bulan ini. Kemampuan speaking dan readingnya menonjol. Writing masih perlu dilatih secara konsisten.', next_step: 'Fokus pada academic writing di periode berikutnya.' },
  ])

  // Zayd → Nanda (IPA)
  const zaydId = await upsertStudent('Zayd', 'IPA Terpadu', 'zayd.parent@example.com')
  console.log('Student: Zayd')
  await seedSessions(zaydId, mentorIds['Nanda'], [
    { date: '2026-03-28', attendance: 'Present', activity: 'Belajar konsep energi: bentuk-bentuk energi dan perubahannya.', observation: 'Zayd memahami berbagai bentuk energi dengan baik. Ia bisa memberikan contoh perubahan energi dari kehidupan sehari-hari dengan tepat dan kreatif.', next_step: 'Hukum kekekalan energi dan efisiensi.' },
    { date: '2026-04-04', attendance: 'Present', activity: 'Percobaan sederhana: konversi energi dengan baterai dan lampu LED.', observation: 'Zayd sangat antusias saat melakukan percobaan. Ia mengikuti prosedur dengan hati-hati dan mencatat hasil dengan baik. Analisis hasilnya cukup mendalam.', next_step: 'Latihan soal energi dan daya.' },
    { date: '2026-04-11', attendance: 'Reschedule', activity: '-', observation: 'Sesi dijadwalkan ulang atas permintaan orang tua.' },
    { date: '2026-04-18', attendance: 'Present', activity: 'Belajar sistem peredaran darah manusia: organ dan proses sirkulasi.', observation: 'Zayd mampu menjelaskan peredaran darah besar dan kecil dengan baik setelah menggunakan diagram. Ia aktif mengajukan pertanyaan yang kritis.', next_step: 'Latihan soal sistem peredaran darah.' },
    { date: '2026-04-24', attendance: 'Present', activity: 'Latihan soal gabungan energi dan sistem peredaran darah.', observation: 'Zayd mengerjakan soal dengan cukup baik. Lebih kuat di bagian energi dibandingkan sistem peredaran darah. Perlu penguatan di bagian fungsi komponen darah.', next_step: 'Review komponen darah sebelum evaluasi.' },
  ])

  // Samuel → John (Matematika)
  const samuelId = await upsertStudent('Samuel', 'Matematika', 'samuel.parent@example.com')
  console.log('Student: Samuel')
  await seedSessions(samuelId, mentorIds['John'], [
    { date: '2026-03-29', attendance: 'Present', activity: 'Latihan soal statistika dasar: mean, median, dan modus.', observation: 'Samuel mampu menghitung mean dengan benar. Masih perlu bimbingan dalam menentukan median dari data genap dan memahami modus data berkelompok.', next_step: 'Latihan soal statistika dari data tabel.' },
    { date: '2026-04-05', attendance: 'Present', activity: 'Belajar penyajian data: tabel frekuensi dan histogram.', observation: 'Samuel cukup teliti dalam membaca dan membuat tabel frekuensi. Pembuatan histogram masih perlu latihan, terutama dalam menentukan skala yang tepat.', next_step: 'Latihan membaca diagram lingkaran.' },
    { date: '2026-04-12', attendance: 'Present', activity: 'Pengenalan konsep peluang: ruang sampel dan kejadian.', observation: 'Samuel antusias dengan topik peluang yang terasa lebih konkret. Ia memahami konsep ruang sampel dengan baik menggunakan diagram pohon.', next_step: 'Peluang kejadian majemuk.' },
    { date: '2026-04-19', attendance: 'Present', activity: 'Latihan soal peluang kejadian sederhana dan majemuk.', observation: 'Samuel menunjukkan kemajuan yang baik. Ia bisa menyelesaikan soal peluang standar, namun masih perlu latihan untuk soal yang melibatkan kombinasi kejadian.', next_step: 'Soal cerita peluang dalam konteks nyata.' },
    { date: '2026-04-23', attendance: 'Present', activity: 'Review statistika dan peluang untuk persiapan evaluasi.', observation: 'Samuel mengerjakan latihan soal dengan serius. Hasil keseluruhan sudah memuaskan. Kepercayaan dirinya dalam mengerjakan soal matematika meningkat.', next_step: 'Evaluasi materi statistika dan peluang.' },
  ])

  // Menik → John (Bahasa Indonesia)
  const menikId = await upsertStudent('Menik', 'Bahasa Indonesia', 'menik.parent@example.com')
  console.log('Student: Menik')
  await seedSessions(menikId, mentorIds['John'], [
    { date: '2026-03-27', attendance: 'Present', activity: 'Membaca dan menganalisis teks berita: unsur 5W+1H.', observation: 'Menik mampu mengidentifikasi unsur 5W+1H dengan baik dari teks berita. Ia menunjukkan kemampuan berpikir kritis dalam mengevaluasi informasi.', next_step: 'Menulis berita sederhana dari peristiwa sekitar.' },
    { date: '2026-04-03', attendance: 'Present', activity: 'Latihan menulis berita singkat berdasarkan gambar dan data yang diberikan.', observation: 'Tulisan berita Menik sudah cukup sistematis dan informatif. Penggunaan bahasa jurnalistik masih perlu ditingkatkan, terutama kalimat yang efektif dan efisien.', next_step: 'Latihan menyunting berita.' },
    { date: '2026-04-10', attendance: 'Tidak Hadir', activity: '-', observation: 'Menik tidak hadir. Orang tua mengkonfirmasi ada acara keluarga.' },
    { date: '2026-04-17', attendance: 'Present', activity: 'Belajar teks persuasi: ciri-ciri dan cara menyusunnya.', observation: 'Menik dengan cepat memahami tujuan teks persuasi. Ia mampu mengidentifikasi kalimat ajakan dan argumen pendukung dalam contoh teks dengan baik.', next_step: 'Menulis paragraf persuasi tentang tema lingkungan.' },
    { date: '2026-04-24', attendance: 'Present', activity: 'Latihan soal ujian Bahasa Indonesia: berbagai jenis teks.', observation: 'Menik mengerjakan soal dengan percaya diri dan hasilnya baik. Kemampuan membaca dan memahami berbagai jenis teks sudah berkembang pesat.', next_step: 'Evaluasi bulanan Bahasa Indonesia.' },
  ])

  // Raden → Spartan (IPA)
  const radenId = await upsertStudent('Raden', 'IPA Terpadu', 'raden.parent@example.com')
  console.log('Student: Raden')
  await seedSessions(radenId, mentorIds['Spartan'], [
    { date: '2026-03-28', attendance: 'Present', activity: 'Belajar konsep zat dan perubahannya: fisika dan kimia.', observation: 'Raden memahami perbedaan perubahan fisika dan kimia dengan baik. Ia memberikan contoh yang tepat dan relevan dari kehidupan sehari-hari.', next_step: 'Percobaan sederhana perubahan zat.' },
    { date: '2026-04-04', attendance: 'Present', activity: 'Percobaan: melarutkan gula dan garam, mengamati perubahan sifat zat.', observation: 'Raden sangat cermat dalam melakukan percobaan. Catatannya rapi dan analisis hasilnya tepat. Ia mampu menghubungkan hasil percobaan dengan teori yang sudah dipelajari.', next_step: 'Konsep kelarutan dan konsentrasi.' },
    { date: '2026-04-11', attendance: 'Present', activity: 'Belajar listrik statis: muatan listrik dan gaya Coulomb.', observation: 'Raden memerlukan lebih banyak waktu untuk memahami konsep abstrak listrik statis. Penggunaan demonstrasi balon dan rambut membantu pemahamannya. Perlu latihan soal lebih banyak.', next_step: 'Latihan soal listrik statis dan medan listrik.' },
    { date: '2026-04-18', attendance: 'Present', activity: 'Latihan soal listrik statis dan pengenalan listrik dinamis.', observation: 'Raden menunjukkan perkembangan yang baik setelah latihan intensif. Ia mulai lebih percaya diri dalam mengerjakan soal-soal fisika.', next_step: 'Rangkaian listrik sederhana.' },
    { date: '2026-04-22', attendance: 'Present', activity: 'Membuat rangkaian listrik sederhana dengan baterai, lampu, dan kabel.', observation: 'Raden sangat antusias membuat rangkaian listrik. Ia berhasil membuat rangkaian seri dan paralel dengan tepat. Pemahaman tentang perbedaan kedua rangkaian sudah baik.', next_step: 'Soal hitungan hambatan rangkaian.' },
  ])

  // Genta → Arya (Matematika)
  const gentaId = await upsertStudent('Genta', 'Matematika', 'genta.parent@example.com')
  console.log('Student: Genta')
  await seedSessions(gentaId, mentorIds['Arya'], [
    { date: '2026-03-29', attendance: 'Present', activity: 'Latihan soal fungsi linear dan grafiknya.', observation: 'Genta memahami konsep fungsi linear dengan baik. Ia bisa menentukan gradien dan titik potong sumbu dengan tepat. Penggambaran grafik masih perlu lebih presisi.', next_step: 'Persamaan garis yang melalui dua titik.' },
    { date: '2026-04-05', attendance: 'Present', activity: 'Penyelesaian persamaan sistem linear dua variabel (SPLDV) dengan metode substitusi.', observation: 'Genta menguasai metode substitusi dengan baik setelah beberapa kali latihan. Ia teliti dalam proses substitusi. Perlu latihan metode eliminasi sebagai alternatif.', next_step: 'SPLDV metode eliminasi dan grafik.' },
    { date: '2026-04-12', attendance: 'Reschedule', activity: '-', observation: 'Sesi dijadwalkan ulang karena Genta ada kegiatan sekolah.' },
    { date: '2026-04-19', attendance: 'Present', activity: 'SPLDV metode eliminasi dan perbandingan dua metode.', observation: 'Genta sekarang sudah menguasai kedua metode SPLDV. Ia sudah bisa memilih metode yang lebih efisien sesuai soal yang diberikan. Kemampuan aljabarnya meningkat pesat.', next_step: 'Soal cerita yang diselesaikan dengan SPLDV.' },
    { date: '2026-04-23', attendance: 'Present', activity: 'Soal cerita SPLDV dan review materi fungsi linear untuk evaluasi.', observation: 'Genta mengerjakan soal dengan baik dan sistematis. Perkembangannya dalam satu periode ini sangat positif. Siap untuk evaluasi bulanan.', next_step: 'Evaluasi materi fungsi dan SPLDV.' },
  ])

  // Arthur → Dhisa (Bahasa Inggris)
  const arthurId = await upsertStudent('Arthur', 'Bahasa Inggris', 'arthur.parent@example.com')
  console.log('Student: Arthur')
  await seedSessions(arthurId, mentorIds['Dhisa'], [
    { date: '2026-03-27', attendance: 'Present', activity: 'Tes awal kemampuan: placement test speaking dan writing.', observation: 'Arthur berada di level menengah. Kemampuan speaking-nya lebih kuat dibandingkan writing. Kosakata cukup baik, grammar perlu banyak perbaikan terutama di tenses.', next_step: 'Fokus pada grammar dasar: present dan past tense.' },
    { date: '2026-04-03', attendance: 'Present', activity: 'Grammar: review present tense, past tense, dan future tense beserta latihan soal.', observation: 'Arthur menunjukkan kemajuan yang baik setelah latihan intensif tenses. Ia mulai lebih konsisten dalam penggunaan tenses meskipun kadang masih keliru di irregular verbs.', next_step: 'Latihan tenses dalam konteks percakapan.' },
    { date: '2026-04-10', attendance: 'Present', activity: 'Speaking: diskusi tentang topik film dan musik favorit menggunakan tenses yang tepat.', observation: 'Arthur sangat antusias berbicara tentang topik yang ia sukai. Penggunaan tenses sudah lebih baik dalam konteks natural. Pronunciation perlu sedikit perbaikan.', next_step: 'Latihan pronunciation dan intonasi.' },
    { date: '2026-04-17', attendance: 'Present', activity: 'Writing: menulis recount text tentang pengalaman menarik.', observation: 'Arthur menulis recount text yang menarik dan personal. Penggunaan past tense sudah konsisten. Perlu perbaikan dalam penggunaan time connectives untuk membuat alur lebih jelas.', next_step: 'Revisi tulisan dan latihan recount text lain.' },
    { date: '2026-04-24', attendance: 'Present', activity: 'Review dan latihan soal komprehensif menjelang evaluasi bulanan.', observation: 'Arthur mengerjakan latihan dengan penuh semangat. Perkembangannya dalam periode ini sangat signifikan. Ia sudah lebih percaya diri baik dalam speaking maupun writing.', next_step: 'Evaluasi bulanan Bahasa Inggris.' },
  ])

  // Cedric → Ryan (Matematika)
  const cedricId = await upsertStudent('Cedric', 'Matematika', 'cedric.parent@example.com')
  console.log('Student: Cedric')
  await seedSessions(cedricId, mentorIds['Ryan'], [
    { date: '2026-03-28', attendance: 'Present', activity: 'Latihan soal trigonometri dasar: sin, cos, tan dan hubungannya.', observation: 'Cedric memahami definisi trigonometri dengan baik. Ia bisa menentukan nilai sin, cos, tan dari sudut-sudut istimewa. Perlu penguatan dalam penggunaan identitas trigonometri.', next_step: 'Identitas trigonometri dan pembuktian sederhana.' },
    { date: '2026-04-04', attendance: 'Present', activity: 'Penerapan trigonometri dalam menghitung tinggi dan jarak.', observation: 'Cedric mampu menerapkan konsep trigonometri dalam soal cerita tentang tinggi bangunan dan sudut elevasi. Ia memahami kapan menggunakan sin, cos, atau tan.', next_step: 'Aturan sinus dan kosinus.' },
    { date: '2026-04-11', attendance: 'Present', activity: 'Pengenalan aturan sinus dan kosinus untuk segitiga sembarang.', observation: 'Cedric perlu waktu lebih untuk memahami aturan sinus dan kosinus. Latihan dengan banyak contoh soal membantu. Ia mulai bisa mengidentifikasi kapan menggunakan masing-masing aturan.', next_step: 'Latihan soal gabungan aturan sinus dan kosinus.' },
    { date: '2026-04-18', attendance: 'Reschedule', activity: '-', observation: 'Sesi dijadwalkan ulang.' },
    { date: '2026-04-22', attendance: 'Present', activity: 'Review trigonometri lengkap dan latihan soal ujian.', observation: 'Cedric mengerjakan latihan soal dengan teliti dan hasilnya memuaskan. Pemahamannya tentang trigonometri sudah komprehensif. Siap untuk evaluasi.', next_step: 'Evaluasi materi trigonometri.' },
  ])

  // Aska → Muklis (Bahasa Indonesia)
  const askaId = await upsertStudent('Aska', 'Bahasa Indonesia', 'aska.parent@example.com')
  console.log('Student: Aska')
  await seedSessions(askaId, mentorIds['Muklis'], [
    { date: '2026-03-29', attendance: 'Present', activity: 'Diskusi dan latihan membaca puisi kontemporer: interpretasi dan makna.', observation: 'Aska memiliki apresiasi sastra yang baik. Ia mampu menginterpretasikan puisi dengan cara yang unik dan kreatif. Kemampuan menghubungkan puisi dengan pengalaman pribadi sangat baik.', next_step: 'Menulis puisi bebas dengan tema pilihan sendiri.' },
    { date: '2026-04-05', attendance: 'Present', activity: 'Latihan menulis cerpen pendek dengan memperhatikan unsur intrinsik.', observation: 'Aska menghasilkan cerpen yang menarik dengan karakter yang kuat. Alur cerita sudah baik. Perlu perhatian lebih pada konsistensi latar dan detail deskripsi.', next_step: 'Revisi cerpen dan latihan dialog antar tokoh.' },
    { date: '2026-04-12', attendance: 'Present', activity: 'Belajar teks ulasan: cara menganalisis dan menulis resensi.', observation: 'Aska mampu menulis resensi yang kritis dan berimbang. Ia bisa mengidentifikasi kelebihan dan kekurangan karya dengan argumen yang logis.', next_step: 'Menulis resensi film atau buku yang sedang dibaca.' },
    { date: '2026-04-19', attendance: 'Present', activity: 'Latihan soal Bahasa Indonesia: sastra dan kebahasaan.', observation: 'Aska lebih kuat di bagian sastra dibandingkan kebahasaan. Soal tentang ejaan dan tata bahasa masih perlu penguatan. Kemampuan analisis sastranya menonjol.', next_step: 'Penguatan EYD dan tata bahasa baku.' },
    { date: '2026-04-23', attendance: 'Present', activity: 'Review komprehensif dan evaluasi kemampuan menulis kreatif.', observation: 'Aska adalah siswa yang sangat kreatif dan ekspresif dalam berbahasa Indonesia. Perkembangannya sangat positif terutama di bidang sastra. Perlu melanjutkan penguatan di aspek kebahasaan formal.', next_step: 'Persiapan evaluasi akhir periode.' },
  ])
// ── MAY-JUNE 2026 PERIOD (26 May – 25 Jun) ────────────────────────────
  console.log('\nMay-June 2026 period sessions...')

  // Cedric → Ryan (Matematika)
  const cedricMayId = await prisma.student.findFirst({ where: { name: 'Cedric' } })
  const ryanMayId = await prisma.mentor.findFirst({ where: { name: 'Ryan' } })
  if (cedricMayId && ryanMayId) {
    const cedricMaySessions = await prisma.session.findFirst({
      where: { student_id: cedricMayId.id, date: { gte: new Date('2026-05-26') } }
    })
    if (!cedricMaySessions) {
      await prisma.session.createMany({ data: [
        { student_id: cedricMayId.id, mentor_id: ryanMayId.id, date: new Date('2026-05-28'), attendance: 'Present', activity: 'Pengenalan materi baru: limit fungsi dan konsep dasarnya.', observation: 'Cedric memahami konsep limit secara intuitif dengan baik. Ia bisa menentukan limit fungsi sederhana menggunakan substitusi langsung.' },
        { student_id: cedricMayId.id, mentor_id: ryanMayId.id, date: new Date('2026-06-04'), attendance: 'Present', activity: 'Latihan limit fungsi dengan metode faktorisasi.', observation: 'Cedric menguasai teknik faktorisasi untuk limit dengan baik. Penyelesaiannya sistematis dan rapi.' },
        { student_id: cedricMayId.id, mentor_id: ryanMayId.id, date: new Date('2026-06-07'), attendance: 'Reschedule', activity: '-', observation: 'Sesi dijadwalkan ulang atas permintaan siswa.' },
        { student_id: cedricMayId.id, mentor_id: ryanMayId.id, date: new Date('2026-06-11'), attendance: 'Present', activity: 'Pengenalan turunan fungsi dan hubungannya dengan limit.', observation: 'Cedric cepat memahami konsep turunan sebagai limit. Ia bisa menurunkan fungsi polinomial sederhana dengan benar.' },
        { student_id: cedricMayId.id, mentor_id: ryanMayId.id, date: new Date('2026-06-18'), attendance: 'Present', activity: 'Latihan soal turunan dan aplikasinya dalam mencari gradien garis singgung.', observation: 'Cedric mampu menerapkan turunan dalam konteks geometri. Pemahamannya tentang gradien garis singgung sudah solid.' },
      ]})
      console.log('  → Cedric May-June sessions created')
    } else {
      console.log('  → Cedric May-June sessions already exist, skipping')
    }
  }

  // Amirtha → Spartan (Bahasa Indonesia)
  const amirthaMayId = await prisma.student.findFirst({ where: { name: 'Amirtha' } })
  const spartanMayId = await prisma.mentor.findFirst({ where: { name: 'Spartan' } })
  if (amirthaMayId && spartanMayId) {
    const amirthaMaySessions = await prisma.session.findFirst({
      where: { student_id: amirthaMayId.id, date: { gte: new Date('2026-05-26') } }
    })
    if (!amirthaMaySessions) {
      await prisma.session.createMany({ data: [
        { student_id: amirthaMayId.id, mentor_id: spartanMayId.id, date: new Date('2026-05-29'), attendance: 'Present', activity: 'Menulis paragraf eksposisi tentang dampak media sosial.', observation: 'Amirtha menghasilkan paragraf yang terstruktur dengan argumen yang logis. Penggunaan kalimat topik sudah tepat.' },
        { student_id: amirthaMayId.id, mentor_id: spartanMayId.id, date: new Date('2026-06-05'), attendance: 'Present', activity: 'Latihan menulis surat lamaran kerja sederhana.', observation: 'Amirtha memahami format surat lamaran dengan baik. Penggunaan bahasa formal sudah meningkat dari periode sebelumnya.' },
        { student_id: amirthaMayId.id, mentor_id: spartanMayId.id, date: new Date('2026-06-12'), attendance: 'Tidak Hadir', activity: '-', observation: 'Amirtha tidak hadir. Orang tua mengkonfirmasi ada keperluan mendadak.' },
        { student_id: amirthaMayId.id, mentor_id: spartanMayId.id, date: new Date('2026-06-19'), attendance: 'Present', activity: 'Analisis teks argumentasi: identifikasi klaim dan bukti.', observation: 'Amirtha mampu mengidentifikasi klaim utama dan bukti pendukung dengan baik. Kemampuan berpikir kritisnya berkembang.' },
        { student_id: amirthaMayId.id, mentor_id: spartanMayId.id, date: new Date('2026-06-24'), attendance: 'Present', activity: 'Review dan evaluasi bulanan materi teks Bahasa Indonesia.', observation: 'Amirtha menunjukkan perkembangan yang konsisten. Kemampuan menulis teks formal sudah jauh meningkat dibanding periode sebelumnya.' },
      ]})
      console.log('  → Amirtha May-June sessions created')
    } else {
      console.log('  → Amirtha May-June sessions already exist, skipping')
    }
  }

  // Raden → Spartan (IPA)
  const radenMayId = await prisma.student.findFirst({ where: { name: 'Raden' } })
  if (radenMayId && spartanMayId) {
    const radenMaySessions = await prisma.session.findFirst({
      where: { student_id: radenMayId.id, date: { gte: new Date('2026-05-26') } }
    })
    if (!radenMaySessions) {
      await prisma.session.createMany({ data: [
        { student_id: radenMayId.id, mentor_id: spartanMayId.id, date: new Date('2026-05-28'), attendance: 'Present', activity: 'Pendalaman rangkaian listrik: hukum Ohm dan hambatan.', observation: 'Raden sudah lebih percaya diri dengan materi listrik. Ia mampu menghitung hambatan rangkaian seri dan paralel dengan benar.' },
        { student_id: radenMayId.id, mentor_id: spartanMayId.id, date: new Date('2026-06-04'), attendance: 'Present', activity: 'Belajar kemagnetan: sifat magnet dan medan magnet.', observation: 'Raden sangat tertarik dengan topik kemagnetan. Ia aktif bertanya dan mampu menjelaskan konsep medan magnet dengan kata-katanya sendiri.' },
        { student_id: radenMayId.id, mentor_id: spartanMayId.id, date: new Date('2026-06-11'), attendance: 'Present', activity: 'Percobaan sederhana: membuat elektromagnet dari kawat dan baterai.', observation: 'Raden berhasil membuat elektromagnet yang berfungsi dengan baik. Ia mencatat hasil percobaan secara sistematis dan menganalisis faktor yang mempengaruhi kekuatan magnet.' },
        { student_id: radenMayId.id, mentor_id: spartanMayId.id, date: new Date('2026-06-18'), attendance: 'Reschedule', activity: '-', observation: 'Sesi dijadwalkan ulang karena mentor berhalangan.' },
        { student_id: radenMayId.id, mentor_id: spartanMayId.id, date: new Date('2026-06-24'), attendance: 'Present', activity: 'Latihan soal listrik dan kemagnetan untuk persiapan evaluasi.', observation: 'Raden mengerjakan soal dengan teliti. Pemahaman konsep listrik dan kemagnetan sudah komprehensif. Perkembangannya sangat positif.' },
      ]})
      console.log('  → Raden May-June sessions created')
    } else {
      console.log('  → Raden May-June sessions already exist, skipping')
    }
  }
  console.log('\nSeed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
