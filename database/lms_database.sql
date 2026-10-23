/*
 * LMS Teman Belajar Database Dump
 * Generated: 2026-10-14T03:07:13.961Z
 * Database: u511063701_tembel_report
 */

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Drop tables if existing
DROP TABLE IF EXISTS `session`;
DROP TABLE IF EXISTS `report`;
DROP TABLE IF EXISTS `mentor`;
DROP TABLE IF EXISTS `student`;
DROP TABLE IF EXISTS `_prisma_migrations`;

-- ------------------------------------------------------------
-- Table structure for: _prisma_migrations
-- ------------------------------------------------------------
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Data for table: _prisma_migrations (1 rows)
-- ------------------------------------------------------------
LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
  ('d12ef358-5673-4e5e-9ce7-f4cc61525682', 'a7515b994853235b73d6cc6bcdd6d048b4f826f00725e7b8d7f6f26261bcbff5', '2026-05-29 04:18:08.436', '20260529041803_init_mysql', NULL, NULL, '2026-05-29 04:18:03.552', 1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------------
-- Table structure for: mentor
-- ------------------------------------------------------------
CREATE TABLE `mentor` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'active',
  `core_skill` varchar(191) DEFAULT NULL,
  `country` varchar(191) DEFAULT NULL,
  `language` varchar(191) DEFAULT NULL,
  `photo_path` text DEFAULT NULL,
  `pin` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mentor_pin_key` (`pin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Data for table: mentor (18 rows)
-- ------------------------------------------------------------
LOCK TABLES `mentor` WRITE;
/*!40000 ALTER TABLE `mentor` DISABLE KEYS */;
INSERT INTO `mentor` (`id`, `name`, `status`, `core_skill`, `country`, `language`, `photo_path`, `pin`) VALUES
  ('cmpqfqj8y0000c9x2yxg3bqxj', 'Ryan', 'active', 'IT', 'Indonesia', 'Indonesia, English', 'https://b9ve30jdrhfqxtti.public.blob.vercel-storage.com/uploads/1791550416295-4qk9xj1pzrl.webp', '862335'),
  ('cmpqfqj9x0001c9x2f6ksov18', 'Spartan', 'active', NULL, NULL, NULL, NULL, '765461'),
  ('cmpqfqjeu0003c9x2v07bl5ks', 'Dinda', 'active', NULL, NULL, NULL, NULL, '304932'),
  ('cmpqfqjft0004c9x28tnl4avm', 'Syifa', 'active', NULL, NULL, NULL, NULL, '964539'),
  ('cmpqfqjgx0005c9x25scg1520', 'Sari', 'active', NULL, NULL, NULL, NULL, '544197'),
  ('cmpqfqjia0006c9x22lix0ncv', 'Ms Wahyu', 'active', NULL, NULL, NULL, NULL, '762477'),
  ('cmpqfqjjh0007c9x25200pey0', 'Yaya', 'active', NULL, NULL, NULL, NULL, '426033'),
  ('cmpqfqjkg0008c9x2r00sdmun', 'Fendy', 'active', NULL, NULL, NULL, NULL, '849731'),
  ('cmpqfqjlb0009c9x2chbeyv8o', 'Nanda', 'active', NULL, NULL, NULL, NULL, '228162'),
  ('cmpqfqjma000ac9x2payzidmo', 'John', 'inactive', NULL, NULL, NULL, NULL, '368921'),
  ('cmpqfqjne000bc9x276n8nnf8', 'Arya', 'active', NULL, NULL, NULL, NULL, '859961'),
  ('cmpqfqjod000cc9x2llhv7uj5', 'Dhisa', 'active', NULL, NULL, NULL, NULL, '853948'),
  ('cmpqfqjp9000dc9x2d8h2nnl0', 'Muklis', 'active', NULL, NULL, NULL, NULL, '911653'),
  ('cmt117pf80000wsilqusvslol', 'Friendian', 'active', NULL, NULL, NULL, NULL, '185293'),
  ('cmuxt7gza0001zj786tjzgo72', 'Rifqi', 'active', 'Islamic Prayer', 'Indonesia', 'Indonesia, English', 'https://b9ve30jdrhfqxtti.public.blob.vercel-storage.com/uploads/1791359516302-sn56qweq6kb.webp', '337221'),
  ('cmv0ysidm0000x28fkxjimd2l', 'Katarina', 'active', 'English', 'Indonesia', 'English, Indonesia', NULL, '197089'),
  ('cmv0ytsne0001x28f29s4twnr', 'Berlyanna', 'active', 'English', 'Brunei Darusalam', 'English, Melayu', NULL, '270893'),
  ('cmv3d5rci0001104udr5cyni3', 'Mezza', 'active', 'SD', 'Indonesia', 'Indonesia', NULL, '532307');
/*!40000 ALTER TABLE `mentor` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------------
-- Table structure for: student
-- ------------------------------------------------------------
CREATE TABLE `student` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `parent_email` varchar(191) NOT NULL,
  `program` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Data for table: student (24 rows)
-- ------------------------------------------------------------
LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` (`id`, `name`, `parent_email`, `program`, `status`) VALUES
  ('cmpqfqjq9000ec9x23sck91qk', 'Budi Santoso', 'budi.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqk4c000rc9x2djrs1km7', 'Siti Rahayu', 'siti.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqkdu0012c9x29u8p199v', 'Andi Wijaya', 'andi.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqkj4001bc9x2atwbobc0', 'Roman', 'roman.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqkup001oc9x2te20y8nn', 'Emma', 'emma.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfql1w0021c9x2mmtygz0s', 'Ethan', 'ethan.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfql7g002cc9x26hquyayh', 'Kairos', 'kairos.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqlfc002nc9x2fq9a6zvo', 'Ara', 'ara.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqllt002yc9x2mfj5uhnk', 'Amirtha', 'amirtha.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqlrd0039c9x2rdxcbgha', 'Hilal', 'hilal.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqlyb003kc9x2offya488', 'Franka', 'franka.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqm4s003vc9x217znsg0l', 'Queency', 'queency.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqmb80046c9x2gu9le1nq', 'Zayd', 'zayd.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqmjl004hc9x2gvmzdc0b', 'Samuel', 'samuel.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqmqa004sc9x2qzn15hpo', 'Menik', 'menik.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqmwj0053c9x239g6zbe4', 'Raden', 'raden.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqn6z005ec9x2z27fu6b4', 'Genta', 'genta.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqndg005pc9x22yv6uid6', 'Arthur', 'arthur.parent@example.com', 'Teman Belajar', 'active'),
  ('cmpqfqnj00060c9x2w71pt8x2', 'Cedric', 'ryangabriel1999@gmail.com', 'Teman Belajar', 'active'),
  ('cmpqfqnok006bc9x25apv3urj', 'Aska', 'aska.parent@example.com', 'Teman Belajar', 'active'),
  ('cmtwq83v20000kknpwd5pino4', 'Richard', 'ryangabriel1999@gmail.com', 'Kryacademia', 'active'),
  ('cmuxt5mub0000zj78zv106p7l', 'Rayhan', 'ryangabriel1999@gmail.com', 'Teman Belajar', 'active'),
  ('cmv0yw1pb0002x28fjnijji3o', 'Alyn', 'alyn.parent@example.com', 'Teman Belajar', 'active'),
  ('cmv3d402w0000104ud5fwciip', 'Nathan', 'nathan.parent@example.com', 'Teman Belajar', 'active');
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------------
-- Table structure for: session
-- ------------------------------------------------------------
CREATE TABLE `session` (
  `id` varchar(191) NOT NULL,
  `student_id` varchar(191) NOT NULL,
  `mentor_id` varchar(191) DEFAULT NULL,
  `date` datetime(3) NOT NULL,
  `attendance` varchar(191) NOT NULL,
  `activity` text NOT NULL,
  `observation` text NOT NULL,
  `photo_path` text DEFAULT NULL,
  `next_step` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Session_student_id_fkey` (`student_id`),
  KEY `Session_mentor_id_fkey` (`mentor_id`),
  CONSTRAINT `session_mentor_id_fkey` FOREIGN KEY (`mentor_id`) REFERENCES `mentor` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `session_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Data for table: session (133 rows)
-- ------------------------------------------------------------
LOCK TABLES `session` WRITE;
/*!40000 ALTER TABLE `session` DISABLE KEYS */;
INSERT INTO `session` (`id`, `student_id`, `mentor_id`, `date`, `attendance`, `activity`, `observation`, `photo_path`, `next_step`) VALUES
  ('cmpqfqjrl000gc9x26uklczg1', 'cmpqfqjq9000ec9x23sck91qk', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-03-27 00:00:00.000', 'hadir', 'Latihan soal perkalian dan pembagian bilangan bulat.', 'Siswa menunjukkan pemahaman yang baik terhadap materi perkalian.', NULL, 'Lanjut ke bab pembagian pecahan.'),
  ('cmpqfqjsi000ic9x20ic1s2nj', 'cmpqfqjq9000ec9x23sck91qk', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-03-31 00:00:00.000', 'hadir', 'Membaca teks dan menjawab pertanyaan pemahaman.', 'Perlu lebih banyak latihan pada bagian pemahaman bacaan.', NULL, NULL),
  ('cmpqfqjte000kc9x2ccglibi1', 'cmpqfqjq9000ec9x23sck91qk', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-04-03 00:00:00.000', 'hadir', 'Diskusi konsep dasar sains tentang fotosintesis.', 'Kemajuan sangat pesat minggu ini, siswa aktif bertanya.', NULL, NULL),
  ('cmpqfqjud000mc9x20n3kfvc7', 'cmpqfqjq9000ec9x23sck91qk', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-04-07 00:00:00.000', 'hadir', 'Review materi minggu lalu dan latihan soal ujian.', 'Siswa mampu mengerjakan soal secara mandiri dengan baik.', NULL, NULL),
  ('cmpqfqjvh000oc9x2pgl9ierd', 'cmpqfqjq9000ec9x23sck91qk', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-04-10 00:00:00.000', 'Reschedule', '-', 'Sesi dijadwalkan ulang karena siswa sakit.', NULL, NULL),
  ('cmpqfqk28000qc9x27yxa3vqr', 'cmpqfqjq9000ec9x23sck91qk', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-04-14 00:00:00.000', 'hadir', 'Pengenalan topik baru: geometri dasar.', 'Siswa antusias dengan topik baru, perlu penguatan di bagian sudut.', NULL, NULL),
  ('cmpqfqk8p000tc9x2b7xhi1x9', 'cmpqfqk4c000rc9x2djrs1km7', NULL, '2026-03-28 00:00:00.000', 'hadir', 'Latihan percakapan sehari-hari dalam Bahasa Inggris.', 'Pronunciation sudah meningkat, tapi kosakata perlu diperkaya.', NULL, NULL),
  ('cmpqfqk9n000vc9x2xdbls519', 'cmpqfqk4c000rc9x2djrs1km7', NULL, '2026-04-01 00:00:00.000', 'hadir', 'Membaca teks pendek dan diskusi isi cerita.', 'Siswa memahami isi cerita dengan baik, aktif berdiskusi.', NULL, NULL),
  ('cmpqfqkar000xc9x2o9nsyo31', 'cmpqfqk4c000rc9x2djrs1km7', NULL, '2026-04-04 00:00:00.000', 'Tidak Hadir', '-', 'Siswa tidak hadir tanpa konfirmasi.', NULL, NULL),
  ('cmpqfqkbq000zc9x2gx6asa2b', 'cmpqfqk4c000rc9x2djrs1km7', NULL, '2026-04-08 00:00:00.000', 'hadir', 'Latihan grammar: present tense dan past tense.', 'Masih sering keliru di past tense irregular verbs.', NULL, NULL),
  ('cmpqfqkcu0011c9x2w8k2sxsu', 'cmpqfqk4c000rc9x2djrs1km7', NULL, '2026-04-15 00:00:00.000', 'hadir', 'Menulis paragraf tentang aktivitas sehari-hari.', 'Tulisan sudah runtut, perlu perbaikan di penggunaan article.', NULL, NULL),
  ('cmpqfqkez0014c9x286kmcrvh', 'cmpqfqkdu0012c9x29u8p199v', 'cmpqfqj9x0001c9x2f6ksov18', '2026-03-27 00:00:00.000', 'hadir', 'Percobaan sederhana tentang gaya dan gerak benda.', 'Siswa sangat antusias saat praktik, pemahaman konsep sudah baik.', NULL, NULL),
  ('cmpqfqkfw0016c9x2gwzf0sn2', 'cmpqfqkdu0012c9x29u8p199v', 'cmpqfqj9x0001c9x2f6ksov18', '2026-04-02 00:00:00.000', 'hadir', 'Belajar sistem tata surya dan planet-planet.', 'Siswa mampu menyebutkan semua planet dengan urutan yang benar.', NULL, NULL),
  ('cmpqfqkh00018c9x21ig43lhg', 'cmpqfqkdu0012c9x29u8p199v', 'cmpqfqj9x0001c9x2f6ksov18', '2026-04-09 00:00:00.000', 'hadir', 'Diskusi ekosistem dan rantai makanan.', 'Perlu pendalaman lebih lanjut tentang produsen dan konsumen.', NULL, NULL),
  ('cmpqfqkhz001ac9x2wgjmmvw0', 'cmpqfqkdu0012c9x29u8p199v', 'cmpqfqj9x0001c9x2f6ksov18', '2026-04-16 00:00:00.000', 'hadir', 'Latihan soal persiapan ulangan IPA.', 'Hasil latihan memuaskan, rata-rata skor 80%. Siap untuk ulangan.', NULL, NULL),
  ('cmpqfqkk3001dc9x2n25xcyun', 'cmpqfqkj4001bc9x2atwbobc0', 'cmpqfqjeu0003c9x2v07bl5ks', '2026-03-27 00:00:00.000', 'Present', 'Latihan soal operasi hitung campuran dan urutan operasi matematika.', 'Roman memahami konsep urutan operasi dengan baik. Ia bisa menyelesaikan soal sederhana secara mandiri, namun masih perlu bimbingan untuk soal bertingkat.', NULL, 'Lanjutkan ke soal cerita yang melibatkan operasi hitung campuran.'),
  ('cmpqfqklv001fc9x2k29jhkyq', 'cmpqfqkj4001bc9x2atwbobc0', 'cmpqfqjeu0003c9x2v07bl5ks', '2026-03-31 00:00:00.000', 'Present', 'Belajar konsep pecahan: penjumlahan dan pengurangan pecahan berpenyebut berbeda.', 'Roman menunjukkan kemajuan yang baik. Ia sudah bisa menyamakan penyebut, meskipun masih sesekali keliru dalam penyederhanaan hasil.', NULL, 'Latihan soal pecahan campuran.'),
  ('cmpqfqkmu001hc9x2vn8m2k67', 'cmpqfqkj4001bc9x2atwbobc0', 'cmpqfqjeu0003c9x2v07bl5ks', '2026-04-03 00:00:00.000', 'Reschedule', '-', 'Sesi dijadwalkan ulang atas permintaan orang tua.', NULL, 'Lanjut dari materi pecahan di sesi berikutnya.'),
  ('cmpqfqkpu001jc9x2fwqhk0pd', 'cmpqfqkj4001bc9x2atwbobc0', 'cmpqfqjeu0003c9x2v07bl5ks', '2026-04-07 00:00:00.000', 'Present', 'Pengenalan konsep bilangan negatif dan garis bilangan.', 'Roman awalnya bingung dengan konsep negatif, namun setelah menggunakan garis bilangan sebagai alat bantu, pemahamannya meningkat pesat. Aktif bertanya selama sesi.', NULL, 'Operasi penjumlahan dan pengurangan bilangan negatif.'),
  ('cmpqfqksl001lc9x2proia6o4', 'cmpqfqkj4001bc9x2atwbobc0', 'cmpqfqjeu0003c9x2v07bl5ks', '2026-04-10 00:00:00.000', 'Present', 'Latihan soal persiapan ulangan materi bilangan.', 'Roman mengerjakan 15 soal dengan 12 jawaban benar. Masih perlu penguatan di soal yang melibatkan pecahan dan bilangan negatif sekaligus.', NULL, 'Review soal yang salah sebelum ulangan.'),
  ('cmpqfqktj001nc9x2eugimuy0', 'cmpqfqkj4001bc9x2atwbobc0', 'cmpqfqjeu0003c9x2v07bl5ks', '2026-04-17 00:00:00.000', 'Present', 'Review hasil ulangan dan pembahasan soal yang salah.', 'Roman menunjukkan sikap yang baik dalam menerima koreksi. Ia mau mencoba ulang soal yang salah dengan sabar dan akhirnya memahami kesalahannya.', NULL, 'Mulai materi geometri dasar di sesi berikutnya.'),
  ('cmpqfqkvn001qc9x2501evvhp', 'cmpqfqkup001oc9x2te20y8nn', 'cmpqfqjft0004c9x28tnl4avm', '2026-03-28 00:00:00.000', 'Present', 'Latihan speaking: memperkenalkan diri dan orang lain dalam Bahasa Inggris.', 'Emma sangat percaya diri dalam berbicara. Pronunciation sudah cukup baik untuk levelnya. Ia aktif mencoba kalimat baru meski masih ada grammar yang perlu diperbaiki.', NULL, 'Latihan dialog situasi sehari-hari.'),
  ('cmpqfqkwr001sc9x2hybr2rkc', 'cmpqfqkup001oc9x2te20y8nn', 'cmpqfqjft0004c9x28tnl4avm', '2026-04-01 00:00:00.000', 'Present', 'Reading comprehension: teks pendek tentang kebiasaan baik sehari-hari.', 'Emma mampu menjawab 5 dari 7 pertanyaan dengan benar. Ia memahami ide utama teks dengan baik, namun masih perlu latihan dalam menarik kesimpulan.', NULL, 'Teks dengan level sedikit lebih tinggi.'),
  ('cmpqfqkxq001uc9x2vnq3d4lw', 'cmpqfqkup001oc9x2te20y8nn', 'cmpqfqjft0004c9x28tnl4avm', '2026-04-04 00:00:00.000', 'Present', 'Grammar: penggunaan present continuous tense dalam konteks sehari-hari.', 'Emma cepat menangkap pola kalimat present continuous. Ia bisa membuat kalimat sendiri dengan benar. Sedikit keliru saat menggunakan kata kerja tidak beraturan.', NULL, 'Latihan membedakan simple present dan present continuous.'),
  ('cmpqfqkyu001wc9x2fgd6h6y4', 'cmpqfqkup001oc9x2te20y8nn', 'cmpqfqjft0004c9x28tnl4avm', '2026-04-11 00:00:00.000', 'Tidak Hadir', '-', 'Emma tidak hadir karena sakit. Orang tua sudah mengkonfirmasi.', NULL, NULL),
  ('cmpqfqkzs001yc9x2lp7eskeg', 'cmpqfqkup001oc9x2te20y8nn', 'cmpqfqjft0004c9x28tnl4avm', '2026-04-15 00:00:00.000', 'Present', 'Writing: menulis cerita pendek tentang hari libur menggunakan past tense.', 'Tulisan Emma runtut dan kreatif. Kosakata sudah cukup beragam. Masih perlu perbaikan pada konsistensi penggunaan past tense dan penggunaan conjunction.', NULL, 'Revisi tulisan dan latihan soal past tense.'),
  ('cmpqfql0x0020c9x2ea21dfbq', 'cmpqfqkup001oc9x2te20y8nn', 'cmpqfqjft0004c9x28tnl4avm', '2026-04-22 00:00:00.000', 'Present', 'Review materi semester: grammar, reading, dan vocabulary.', 'Emma menunjukkan perkembangan yang sangat baik. Ia sudah lebih percaya diri dan kosakatanya berkembang pesat. Perlu terus berlatih writing.', NULL, 'Persiapan untuk evaluasi bulanan.'),
  ('cmpqfql2t0023c9x241fxnev0', 'cmpqfql1w0021c9x2mmtygz0s', 'cmpqfqjgx0005c9x25scg1520', '2026-03-27 00:00:00.000', 'Present', 'Percobaan membuat larutan dan campuran dari bahan-bahan dapur.', 'Ethan sangat antusias dengan kegiatan eksperimen. Ia mengikuti langkah percobaan dengan teliti dan bisa membedakan larutan dan campuran dengan benar.', NULL, 'Lanjut ke konsep asam dan basa sederhana.'),
  ('cmpqfql3q0025c9x2islevwez', 'cmpqfql1w0021c9x2mmtygz0s', 'cmpqfqjgx0005c9x25scg1520', '2026-04-02 00:00:00.000', 'Present', 'Belajar sistem pencernaan manusia: organ dan fungsinya.', 'Ethan mampu menyebutkan organ pencernaan secara urut. Ia aktif bertanya tentang proses di lambung dan usus. Pemahaman konsep sudah baik.', NULL, 'Latihan soal sistem pencernaan.'),
  ('cmpqfql4n0027c9x2pf14575u', 'cmpqfql1w0021c9x2mmtygz0s', 'cmpqfqjgx0005c9x25scg1520', '2026-04-09 00:00:00.000', 'Present', 'Diskusi tentang fotosintesis: bahan, proses, dan hasil.', 'Ethan memahami konsep fotosintesis dengan baik setelah dijelaskan dengan diagram. Ia bisa menjelaskan kembali proses dengan kata-katanya sendiri.', NULL, 'Hubungan fotosintesis dengan rantai makanan.'),
  ('cmpqfql5l0029c9x214pu77hx', 'cmpqfql1w0021c9x2mmtygz0s', 'cmpqfqjgx0005c9x25scg1520', '2026-04-16 00:00:00.000', 'Reschedule', '-', 'Sesi dijadwalkan ulang karena mentor berhalangan.', NULL, NULL),
  ('cmpqfql6i002bc9x2evqdebk0', 'cmpqfql1w0021c9x2mmtygz0s', 'cmpqfqjgx0005c9x25scg1520', '2026-04-23 00:00:00.000', 'Present', 'Latihan soal IPA persiapan ujian: campuran, pencernaan, dan fotosintesis.', 'Ethan mengerjakan soal dengan cukup baik. Skor latihan 75%. Masih perlu penguatan di bagian sistem pencernaan, terutama fungsi spesifik tiap organ.', NULL, 'Review soal yang belum tepat sebelum ujian.'),
  ('cmpqfql8d002ec9x29l869iti', 'cmpqfql7g002cc9x26hquyayh', 'cmpqfqjgx0005c9x25scg1520', '2026-03-28 00:00:00.000', 'Present', 'Pengenalan konsep luas dan keliling bangun datar: persegi dan persegi panjang.', 'Kairos memahami rumus dengan cepat. Ia bisa menerapkan rumus luas dan keliling dengan benar pada soal-soal standar.', NULL, 'Lanjut ke bangun segitiga dan lingkaran.'),
  ('cmpqfql9a002gc9x2rtut0hk1', 'cmpqfql7g002cc9x26hquyayh', 'cmpqfqjgx0005c9x25scg1520', '2026-04-04 00:00:00.000', 'Present', 'Latihan soal luas segitiga dan trapesium.', 'Kairos perlu lebih teliti dalam membaca soal. Beberapa kali salah karena tidak memperhatikan satuan. Pemahaman rumus sudah benar.', NULL, 'Latihan soal campuran berbagai bangun datar.'),
  ('cmpqfqla7002ic9x2alqiva74', 'cmpqfql7g002cc9x26hquyayh', 'cmpqfqjgx0005c9x25scg1520', '2026-04-11 00:00:00.000', 'Present', 'Soal cerita yang melibatkan konsep luas dalam konteks nyata.', 'Kairos mulai menunjukkan kemampuan berpikir logis dalam soal cerita. Ia mampu mengidentifikasi informasi yang diperlukan dengan baik.', NULL, 'Pengenalan konsep volume bangun ruang.'),
  ('cmpqfqlcb002kc9x2t3yjz8ig', 'cmpqfql7g002cc9x26hquyayh', 'cmpqfqjgx0005c9x25scg1520', '2026-04-18 00:00:00.000', 'Present', 'Pengenalan volume kubus dan balok.', 'Kairos antusias belajar geometri ruang. Ia sudah bisa menghitung volume kubus, namun masih perlu latihan untuk balok dengan dimensi berbeda.', NULL, 'Latihan soal volume dan konversi satuan.'),
  ('cmpqfqld7002mc9x2qka0dkdu', 'cmpqfql7g002cc9x26hquyayh', 'cmpqfqjgx0005c9x25scg1520', '2026-04-24 00:00:00.000', 'Present', 'Review keseluruhan materi geometri dan latihan soal ujian.', 'Kairos menunjukkan perkembangan yang konsisten. Ia mengerjakan latihan dengan serius dan hasilnya memuaskan. Siap untuk evaluasi.', NULL, 'Evaluasi bulanan materi geometri.'),
  ('cmpqfqlg9002pc9x2811n3f74', 'cmpqfqlfc002nc9x2fq9a6zvo', 'cmpqfqjgx0005c9x25scg1520', '2026-03-29 00:00:00.000', 'Present', 'Latihan menulis karangan deskripsi tentang tempat favorit.', 'Ara memiliki kemampuan ekspresi yang baik secara lisan, namun dalam menulis masih kurang terstruktur. Perlu latihan menyusun kerangka karangan sebelum menulis.', NULL, 'Latihan membuat mind map sebelum menulis.'),
  ('cmpqfqlh5002rc9x2udg1ljcv', 'cmpqfqlfc002nc9x2fq9a6zvo', 'cmpqfqjgx0005c9x25scg1520', '2026-04-05 00:00:00.000', 'Present', 'Belajar jenis-jenis kalimat: kalimat tunggal dan majemuk.', 'Ara sudah bisa membedakan kalimat tunggal dan majemuk dengan baik. Ia aktif membuat contoh kalimatnya sendiri yang kreatif.', NULL, 'Latihan menggunakan konjungsi yang tepat.'),
  ('cmpqfqli2002tc9x2ij2nqtgs', 'cmpqfqlfc002nc9x2fq9a6zvo', 'cmpqfqjgx0005c9x25scg1520', '2026-04-12 00:00:00.000', 'Tidak Hadir', '-', 'Ara tidak hadir. Tidak ada konfirmasi sebelumnya dari orang tua.', NULL, NULL),
  ('cmpqfqlj0002vc9x205o3bs8q', 'cmpqfqlfc002nc9x2fq9a6zvo', 'cmpqfqjgx0005c9x25scg1520', '2026-04-19 00:00:00.000', 'Present', 'Membaca puisi dan menganalisis majas yang digunakan.', 'Ara sangat menikmati kegiatan puisi. Ia mampu mengidentifikasi majas dengan cukup baik. Ekspresi saat membaca puisi juga sudah bagus.', NULL, 'Mencoba menulis puisi sederhana sendiri.'),
  ('cmpqfqlkv002xc9x2xw5yxo3f', 'cmpqfqlfc002nc9x2fq9a6zvo', 'cmpqfqjgx0005c9x25scg1520', '2026-04-23 00:00:00.000', 'Present', 'Latihan soal persiapan ujian Bahasa Indonesia: pilihan ganda dan uraian.', 'Ara mengerjakan dengan cukup baik terutama di bagian pilihan ganda. Bagian uraian masih perlu perbaikan dalam penggunaan ejaan yang benar.', NULL, 'Review EYD dan penulisan kata baku.'),
  ('cmpqfqlmq0030c9x2r9u41xog', 'cmpqfqllt002yc9x2mfj5uhnk', 'cmpqfqj9x0001c9x2f6ksov18', '2026-03-27 00:00:00.000', 'Present', 'Membaca teks narasi dan mengidentifikasi unsur cerita: tokoh, latar, dan alur.', 'Amirtha mampu mengidentifikasi tokoh dan latar dengan tepat. Ia memerlukan bimbingan lebih dalam memahami alur cerita yang kompleks.', NULL, 'Latihan menganalisis alur dengan diagram.'),
  ('cmpqfqlnm0032c9x28k1jy18e', 'cmpqfqllt002yc9x2mfj5uhnk', 'cmpqfqj9x0001c9x2f6ksov18', '2026-04-03 00:00:00.000', 'Present', 'Latihan menulis teks prosedur: cara membuat sesuatu.', 'Amirtha menulis teks prosedur dengan urut dan jelas. Penggunaan kata penghubung antar langkah sudah baik. Ejaan perlu sedikit perbaikan.', NULL, 'Membandingkan teks prosedur dengan teks laporan.'),
  ('cmpqfqlok0034c9x282g69rnr', 'cmpqfqllt002yc9x2mfj5uhnk', 'cmpqfqj9x0001c9x2f6ksov18', '2026-04-10 00:00:00.000', 'Present', 'Diskusi dan latihan soal materi teks eksposisi.', 'Amirtha menunjukkan kemajuan dalam memahami teks eksposisi. Ia sudah bisa membedakan fakta dan opini dengan cukup baik.', NULL, 'Menulis paragraf eksposisi sendiri.'),
  ('cmpqfqlph0036c9x2xqhkjofq', 'cmpqfqllt002yc9x2mfj5uhnk', 'cmpqfqj9x0001c9x2f6ksov18', '2026-04-17 00:00:00.000', 'Present', 'Pengenalan dan latihan menulis surat resmi dan tidak resmi.', 'Amirtha cepat memahami perbedaan format surat resmi dan tidak resmi. Tulisannya rapi dan terstruktur. Perlu memperhatikan penggunaan bahasa yang lebih formal.', NULL, 'Latihan menulis surat lamaran sederhana.'),
  ('cmpqfqlqf0038c9x2egx24lcb', 'cmpqfqllt002yc9x2mfj5uhnk', 'cmpqfqj9x0001c9x2f6ksov18', '2026-04-24 00:00:00.000', 'Reschedule', '-', 'Sesi dijadwalkan ulang karena ada acara keluarga.', NULL, NULL),
  ('cmpqfqlsa003bc9x2ykvyzcae', 'cmpqfqlrd0039c9x2rdxcbgha', 'cmpqfqjia0006c9x22lix0ncv', '2026-03-28 00:00:00.000', 'Present', 'Latihan soal aljabar: menyederhanakan dan mengoperasikan bentuk aljabar.', 'Hilal memahami konsep variabel dengan baik. Ia bisa menyederhanakan bentuk aljabar sederhana, namun masih perlu latihan untuk ekspresi yang lebih kompleks.', NULL, 'Persamaan linear satu variabel.'),
  ('cmpqfqlt7003dc9x2wnvb9fsw', 'cmpqfqlrd0039c9x2rdxcbgha', 'cmpqfqjia0006c9x22lix0ncv', '2026-04-04 00:00:00.000', 'Present', 'Pengenalan persamaan linear satu variabel dan cara menyelesaikannya.', 'Hilal menunjukkan kemampuan yang baik dalam menyelesaikan persamaan linear. Langkah-langkah penyelesaiannya sistematis dan rapi.', NULL, 'Soal cerita persamaan linear dalam konteks nyata.'),
  ('cmpqfqlva003fc9x2aryl5awe', 'cmpqfqlrd0039c9x2rdxcbgha', 'cmpqfqjia0006c9x22lix0ncv', '2026-04-11 00:00:00.000', 'Present', 'Soal cerita yang diselesaikan dengan persamaan linear.', 'Hilal bisa mengidentifikasi variabel dalam soal cerita, namun masih kadang kesulitan dalam memodelkan soal ke dalam persamaan. Perlu lebih banyak latihan.', NULL, 'Latihan pemodelan soal cerita.');
INSERT INTO `session` (`id`, `student_id`, `mentor_id`, `date`, `attendance`, `activity`, `observation`, `photo_path`, `next_step`) VALUES
  ('cmpqfqlw7003hc9x2llzrxy0y', 'cmpqfqlrd0039c9x2rdxcbgha', 'cmpqfqjia0006c9x22lix0ncv', '2026-04-18 00:00:00.000', 'Present', 'Pengenalan pertidaksamaan linear dan penyelesaiannya.', 'Hilal dengan cepat memahami konsep pertidaksamaan setelah dikaitkan dengan persamaan yang sudah dipelajari. Ia mampu menentukan himpunan penyelesaian dengan benar.', NULL, 'Latihan soal gabungan persamaan dan pertidaksamaan.'),
  ('cmpqfqlxc003jc9x2juzcy5xt', 'cmpqfqlrd0039c9x2rdxcbgha', 'cmpqfqjia0006c9x22lix0ncv', '2026-04-22 00:00:00.000', 'Present', 'Review dan latihan soal aljabar menyeluruh untuk persiapan evaluasi.', 'Hilal mengerjakan latihan dengan teliti dan hasilnya sangat baik. Perkembangan dari sesi pertama sangat terlihat. Ia siap menghadapi evaluasi.', NULL, 'Evaluasi materi aljabar.'),
  ('cmpqfqlz8003mc9x2mpam15i4', 'cmpqfqlyb003kc9x2offya488', 'cmpqfqjjh0007c9x25200pey0', '2026-03-29 00:00:00.000', 'Present', 'Latihan listening: mendengarkan percakapan pendek dan menjawab pertanyaan.', 'Franka memiliki kemampuan listening yang cukup baik. Ia bisa menangkap informasi utama dari percakapan. Perlu latihan lebih untuk memahami aksen yang berbeda.', NULL, 'Listening dengan teks yang lebih panjang.'),
  ('cmpqfqm05003oc9x29oxa6r0g', 'cmpqfqlyb003kc9x2offya488', 'cmpqfqjjh0007c9x25200pey0', '2026-04-05 00:00:00.000', 'Present', 'Grammar: modal verbs (can, could, should, must) dan penggunaannya.', 'Franka memahami perbedaan penggunaan modal verb dengan baik. Ia bisa membuat kalimat yang tepat untuk setiap modal. Sangat aktif dalam latihan.', NULL, 'Latihan dalam konteks percakapan.'),
  ('cmpqfqm12003qc9x2r08sis9t', 'cmpqfqlyb003kc9x2offya488', 'cmpqfqjjh0007c9x25200pey0', '2026-04-12 00:00:00.000', 'Present', 'Speaking: bermain peran sebagai dokter dan pasien menggunakan modal verbs.', 'Franka sangat menikmati kegiatan role play. Kepercayaan dirinya dalam berbicara meningkat signifikan. Grammar sudah cukup baik dalam konteks percakapan.', NULL, 'Role play situasi lain: di restoran, di toko.'),
  ('cmpqfqm1z003sc9x2us52pypw', 'cmpqfqlyb003kc9x2offya488', 'cmpqfqjjh0007c9x25200pey0', '2026-04-19 00:00:00.000', 'Tidak Hadir', '-', 'Franka tidak hadir. Sudah ada konfirmasi dari orang tua H-1.', NULL, NULL),
  ('cmpqfqm3u003uc9x2nmxalszg', 'cmpqfqlyb003kc9x2offya488', 'cmpqfqjjh0007c9x25200pey0', '2026-04-23 00:00:00.000', 'Present', 'Writing: menulis email informal kepada teman tentang rencana liburan.', 'Tulisan Franka natural dan komunikatif. Format email sudah benar. Perlu perbaikan kecil di penggunaan tanda baca dan kapitalisasi.', NULL, 'Membandingkan email formal dan informal.'),
  ('cmpqfqm5p003xc9x2vzhxntr2', 'cmpqfqm4s003vc9x217znsg0l', 'cmpqfqjkg0008c9x2r00sdmun', '2026-03-27 00:00:00.000', 'Present', 'Latihan percakapan: membahas hobi dan kegiatan akhir pekan.', 'Queency sangat komunikatif dan percaya diri. Kosakatanya kaya dan penggunaan grammar sudah cukup baik. Sesekali masih ada kekeliruan dalam subject-verb agreement.', NULL, 'Diskusi topik yang lebih kompleks: lingkungan dan teknologi.'),
  ('cmpqfqm6m003zc9x2iju7l1xi', 'cmpqfqm4s003vc9x217znsg0l', 'cmpqfqjkg0008c9x2r00sdmun', '2026-04-02 00:00:00.000', 'Present', 'Reading: artikel tentang kebiasaan sehat dan gaya hidup aktif.', 'Queency mampu membaca dengan lancar dan memahami isi artikel secara keseluruhan. Kemampuan inferensi sudah mulai berkembang.', NULL, 'Latihan menjawab soal inferensi dan main idea.'),
  ('cmpqfqm7j0041c9x2h83m2axk', 'cmpqfqm4s003vc9x217znsg0l', 'cmpqfqjkg0008c9x2r00sdmun', '2026-04-09 00:00:00.000', 'Present', 'Grammar lanjutan: passive voice dalam kalimat present dan past.', 'Queency memahami struktur passive voice dengan cepat. Ia bisa mengubah kalimat aktif ke pasif dengan benar. Masih sesekali lupa dengan perubahan objek menjadi subjek.', NULL, 'Latihan passive voice dalam teks.'),
  ('cmpqfqm940043c9x2mv7hr1gh', 'cmpqfqm4s003vc9x217znsg0l', 'cmpqfqjkg0008c9x2r00sdmun', '2026-04-16 00:00:00.000', 'Present', 'Writing: menulis paragraf argumentatif tentang pentingnya teknologi dalam belajar.', 'Queency menghasilkan paragraf yang terstruktur baik dengan argumen yang logis. Penggunaan transition words sudah tepat. Kesimpulan paragraf perlu diperkuat.', NULL, 'Latihan menulis esai pendek 3 paragraf.'),
  ('cmpqfqma30045c9x28erww3nw', 'cmpqfqm4s003vc9x217znsg0l', 'cmpqfqjkg0008c9x2r00sdmun', '2026-04-23 00:00:00.000', 'Present', 'Evaluasi bulanan: speaking, reading, dan writing.', 'Queency menunjukkan perkembangan yang luar biasa dalam satu bulan ini. Kemampuan speaking dan readingnya menonjol. Writing masih perlu dilatih secara konsisten.', NULL, 'Fokus pada academic writing di periode berikutnya.'),
  ('cmpqfqmc70048c9x2tpajz68a', 'cmpqfqmb80046c9x2gu9le1nq', 'cmpqfqjlb0009c9x2chbeyv8o', '2026-03-28 00:00:00.000', 'Present', 'Belajar konsep energi: bentuk-bentuk energi dan perubahannya.', 'Zayd memahami berbagai bentuk energi dengan baik. Ia bisa memberikan contoh perubahan energi dari kehidupan sehari-hari dengan tepat dan kreatif.', NULL, 'Hukum kekekalan energi dan efisiensi.'),
  ('cmpqfqme9004ac9x2gtcq6l7c', 'cmpqfqmb80046c9x2gu9le1nq', 'cmpqfqjlb0009c9x2chbeyv8o', '2026-04-04 00:00:00.000', 'Present', 'Percobaan sederhana: konversi energi dengan baterai dan lampu LED.', 'Zayd sangat antusias saat melakukan percobaan. Ia mengikuti prosedur dengan hati-hati dan mencatat hasil dengan baik. Analisis hasilnya cukup mendalam.', NULL, 'Latihan soal energi dan daya.'),
  ('cmpqfqmfd004cc9x23s4idxyi', 'cmpqfqmb80046c9x2gu9le1nq', 'cmpqfqjlb0009c9x2chbeyv8o', '2026-04-11 00:00:00.000', 'Reschedule', '-', 'Sesi dijadwalkan ulang atas permintaan orang tua.', NULL, NULL),
  ('cmpqfqmhi004ec9x2w9j8m2n3', 'cmpqfqmb80046c9x2gu9le1nq', 'cmpqfqjlb0009c9x2chbeyv8o', '2026-04-18 00:00:00.000', 'Present', 'Belajar sistem peredaran darah manusia: organ dan proses sirkulasi.', 'Zayd mampu menjelaskan peredaran darah besar dan kecil dengan baik setelah menggunakan diagram. Ia aktif mengajukan pertanyaan yang kritis.', NULL, 'Latihan soal sistem peredaran darah.'),
  ('cmpqfqmim004gc9x2wvg385th', 'cmpqfqmb80046c9x2gu9le1nq', 'cmpqfqjlb0009c9x2chbeyv8o', '2026-04-24 00:00:00.000', 'Present', 'Latihan soal gabungan energi dan sistem peredaran darah.', 'Zayd mengerjakan soal dengan cukup baik. Lebih kuat di bagian energi dibandingkan sistem peredaran darah. Perlu penguatan di bagian fungsi komponen darah.', NULL, 'Review komponen darah sebelum evaluasi.'),
  ('cmpqfqmkq004jc9x2xt7y8ufr', 'cmpqfqmjl004hc9x2gvmzdc0b', 'cmpqfqjma000ac9x2payzidmo', '2026-03-29 00:00:00.000', 'Present', 'Latihan soal statistika dasar: mean, median, dan modus.', 'Samuel mampu menghitung mean dengan benar. Masih perlu bimbingan dalam menentukan median dari data genap dan memahami modus data berkelompok.', NULL, 'Latihan soal statistika dari data tabel.'),
  ('cmpqfqmln004lc9x29rg76688', 'cmpqfqmjl004hc9x2gvmzdc0b', 'cmpqfqjma000ac9x2payzidmo', '2026-04-05 00:00:00.000', 'Present', 'Belajar penyajian data: tabel frekuensi dan histogram.', 'Samuel cukup teliti dalam membaca dan membuat tabel frekuensi. Pembuatan histogram masih perlu latihan, terutama dalam menentukan skala yang tepat.', NULL, 'Latihan membaca diagram lingkaran.'),
  ('cmpqfqmmt004nc9x2flgqwi24', 'cmpqfqmjl004hc9x2gvmzdc0b', 'cmpqfqjma000ac9x2payzidmo', '2026-04-12 00:00:00.000', 'Present', 'Pengenalan konsep peluang: ruang sampel dan kejadian.', 'Samuel antusias dengan topik peluang yang terasa lebih konkret. Ia memahami konsep ruang sampel dengan baik menggunakan diagram pohon.', NULL, 'Peluang kejadian majemuk.'),
  ('cmpqfqmo6004pc9x2i8l0zm6e', 'cmpqfqmjl004hc9x2gvmzdc0b', 'cmpqfqjma000ac9x2payzidmo', '2026-04-19 00:00:00.000', 'Present', 'Latihan soal peluang kejadian sederhana dan majemuk.', 'Samuel menunjukkan kemajuan yang baik. Ia bisa menyelesaikan soal peluang standar, namun masih perlu latihan untuk soal yang melibatkan kombinasi kejadian.', NULL, 'Soal cerita peluang dalam konteks nyata.'),
  ('cmpqfqmp5004rc9x25pwx3pmh', 'cmpqfqmjl004hc9x2gvmzdc0b', 'cmpqfqjma000ac9x2payzidmo', '2026-04-23 00:00:00.000', 'Present', 'Review statistika dan peluang untuk persiapan evaluasi.', 'Samuel mengerjakan latihan soal dengan serius. Hasil keseluruhan sudah memuaskan. Kepercayaan dirinya dalam mengerjakan soal matematika meningkat.', NULL, 'Evaluasi materi statistika dan peluang.'),
  ('cmpqfqmr8004uc9x21usl15x7', 'cmpqfqmqa004sc9x2qzn15hpo', 'cmpqfqjma000ac9x2payzidmo', '2026-03-27 00:00:00.000', 'Present', 'Membaca dan menganalisis teks berita: unsur 5W+1H.', 'Menik mampu mengidentifikasi unsur 5W+1H dengan baik dari teks berita. Ia menunjukkan kemampuan berpikir kritis dalam mengevaluasi informasi.', NULL, 'Menulis berita sederhana dari peristiwa sekitar.'),
  ('cmpqfqmsc004wc9x2fzpiljgq', 'cmpqfqmqa004sc9x2qzn15hpo', 'cmpqfqjma000ac9x2payzidmo', '2026-04-03 00:00:00.000', 'Present', 'Latihan menulis berita singkat berdasarkan gambar dan data yang diberikan.', 'Tulisan berita Menik sudah cukup sistematis dan informatif. Penggunaan bahasa jurnalistik masih perlu ditingkatkan, terutama kalimat yang efektif dan efisien.', NULL, 'Latihan menyunting berita.'),
  ('cmpqfqmta004yc9x2ulv5kjxc', 'cmpqfqmqa004sc9x2qzn15hpo', 'cmpqfqjma000ac9x2payzidmo', '2026-04-10 00:00:00.000', 'Tidak Hadir', '-', 'Menik tidak hadir. Orang tua mengkonfirmasi ada acara keluarga.', NULL, NULL),
  ('cmpqfqmuf0050c9x23apw9eov', 'cmpqfqmqa004sc9x2qzn15hpo', 'cmpqfqjma000ac9x2payzidmo', '2026-04-17 00:00:00.000', 'Present', 'Belajar teks persuasi: ciri-ciri dan cara menyusunnya.', 'Menik dengan cepat memahami tujuan teks persuasi. Ia mampu mengidentifikasi kalimat ajakan dan argumen pendukung dalam contoh teks dengan baik.', NULL, 'Menulis paragraf persuasi tentang tema lingkungan.'),
  ('cmpqfqmve0052c9x2thi5o736', 'cmpqfqmqa004sc9x2qzn15hpo', 'cmpqfqjma000ac9x2payzidmo', '2026-04-24 00:00:00.000', 'Present', 'Latihan soal ujian Bahasa Indonesia: berbagai jenis teks.', 'Menik mengerjakan soal dengan percaya diri dan hasilnya baik. Kemampuan membaca dan memahami berbagai jenis teks sudah berkembang pesat.', NULL, 'Evaluasi bulanan Bahasa Indonesia.'),
  ('cmpqfqmxh0055c9x2m3eu5ed0', 'cmpqfqmwj0053c9x239g6zbe4', 'cmpqfqj9x0001c9x2f6ksov18', '2026-03-28 00:00:00.000', 'Present', 'Belajar konsep zat dan perubahannya: fisika dan kimia.', 'Raden memahami perbedaan perubahan fisika dan kimia dengan baik. Ia memberikan contoh yang tepat dan relevan dari kehidupan sehari-hari.', NULL, 'Percobaan sederhana perubahan zat.'),
  ('cmpqfqmyl0057c9x2jx5d6m0d', 'cmpqfqmwj0053c9x239g6zbe4', 'cmpqfqj9x0001c9x2f6ksov18', '2026-04-04 00:00:00.000', 'Present', 'Percobaan: melarutkan gula dan garam, mengamati perubahan sifat zat.', 'Raden sangat cermat dalam melakukan percobaan. Catatannya rapi dan analisis hasilnya tepat. Ia mampu menghubungkan hasil percobaan dengan teori yang sudah dipelajari.', NULL, 'Konsep kelarutan dan konsentrasi.'),
  ('cmpqfqmzj0059c9x2uyf26fay', 'cmpqfqmwj0053c9x239g6zbe4', 'cmpqfqj9x0001c9x2f6ksov18', '2026-04-11 00:00:00.000', 'Present', 'Belajar listrik statis: muatan listrik dan gaya Coulomb.', 'Raden memerlukan lebih banyak waktu untuk memahami konsep abstrak listrik statis. Penggunaan demonstrasi balon dan rambut membantu pemahamannya. Perlu latihan soal lebih banyak.', NULL, 'Latihan soal listrik statis dan medan listrik.'),
  ('cmpqfqn0h005bc9x2s39we1ab', 'cmpqfqmwj0053c9x239g6zbe4', 'cmpqfqj9x0001c9x2f6ksov18', '2026-04-18 00:00:00.000', 'Present', 'Latihan soal listrik statis dan pengenalan listrik dinamis.', 'Raden menunjukkan perkembangan yang baik setelah latihan intensif. Ia mulai lebih percaya diri dalam mengerjakan soal-soal fisika.', NULL, 'Rangkaian listrik sederhana.'),
  ('cmpqfqn4v005dc9x22u7emspp', 'cmpqfqmwj0053c9x239g6zbe4', 'cmpqfqj9x0001c9x2f6ksov18', '2026-04-22 00:00:00.000', 'Present', 'Membuat rangkaian listrik sederhana dengan baterai, lampu, dan kabel.', 'Raden sangat antusias membuat rangkaian listrik. Ia berhasil membuat rangkaian seri dan paralel dengan tepat. Pemahaman tentang perbedaan kedua rangkaian sudah baik.', NULL, 'Soal hitungan hambatan rangkaian.'),
  ('cmpqfqn8t005gc9x2vwhh5s7o', 'cmpqfqn6z005ec9x2z27fu6b4', 'cmpqfqjne000bc9x276n8nnf8', '2026-03-29 00:00:00.000', 'Present', 'Latihan soal fungsi linear dan grafiknya.', 'Genta memahami konsep fungsi linear dengan baik. Ia bisa menentukan gradien dan titik potong sumbu dengan tepat. Penggambaran grafik masih perlu lebih presisi.', NULL, 'Persamaan garis yang melalui dua titik.'),
  ('cmpqfqn9q005ic9x2lamz5svj', 'cmpqfqn6z005ec9x2z27fu6b4', 'cmpqfqjne000bc9x276n8nnf8', '2026-04-05 00:00:00.000', 'Present', 'Penyelesaian persamaan sistem linear dua variabel (SPLDV) dengan metode substitusi.', 'Genta menguasai metode substitusi dengan baik setelah beberapa kali latihan. Ia teliti dalam proses substitusi. Perlu latihan metode eliminasi sebagai alternatif.', NULL, 'SPLDV metode eliminasi dan grafik.'),
  ('cmpqfqnan005kc9x279xjwezd', 'cmpqfqn6z005ec9x2z27fu6b4', 'cmpqfqjne000bc9x276n8nnf8', '2026-04-12 00:00:00.000', 'Reschedule', '-', 'Sesi dijadwalkan ulang karena Genta ada kegiatan sekolah.', NULL, NULL),
  ('cmpqfqnbl005mc9x2hx093t3s', 'cmpqfqn6z005ec9x2z27fu6b4', 'cmpqfqjne000bc9x276n8nnf8', '2026-04-19 00:00:00.000', 'Present', 'SPLDV metode eliminasi dan perbandingan dua metode.', 'Genta sekarang sudah menguasai kedua metode SPLDV. Ia sudah bisa memilih metode yang lebih efisien sesuai soal yang diberikan. Kemampuan aljabarnya meningkat pesat.', NULL, 'Soal cerita yang diselesaikan dengan SPLDV.'),
  ('cmpqfqnci005oc9x29uoanx8o', 'cmpqfqn6z005ec9x2z27fu6b4', 'cmpqfqjne000bc9x276n8nnf8', '2026-04-23 00:00:00.000', 'Present', 'Soal cerita SPLDV dan review materi fungsi linear untuk evaluasi.', 'Genta mengerjakan soal dengan baik dan sistematis. Perkembangannya dalam satu periode ini sangat positif. Siap untuk evaluasi bulanan.', NULL, 'Evaluasi materi fungsi dan SPLDV.'),
  ('cmpqfqned005rc9x2kwxpo61y', 'cmpqfqndg005pc9x22yv6uid6', 'cmpqfqjod000cc9x2llhv7uj5', '2026-03-27 00:00:00.000', 'Present', 'Tes awal kemampuan: placement test speaking dan writing.', 'Arthur berada di level menengah. Kemampuan speaking-nya lebih kuat dibandingkan writing. Kosakata cukup baik, grammar perlu banyak perbaikan terutama di tenses.', NULL, 'Fokus pada grammar dasar: present dan past tense.'),
  ('cmpqfqnfb005tc9x297h22lhi', 'cmpqfqndg005pc9x22yv6uid6', 'cmpqfqjod000cc9x2llhv7uj5', '2026-04-03 00:00:00.000', 'Present', 'Grammar: review present tense, past tense, dan future tense beserta latihan soal.', 'Arthur menunjukkan kemajuan yang baik setelah latihan intensif tenses. Ia mulai lebih konsisten dalam penggunaan tenses meskipun kadang masih keliru di irregular verbs.', NULL, 'Latihan tenses dalam konteks percakapan.'),
  ('cmpqfqng7005vc9x27725mx4d', 'cmpqfqndg005pc9x22yv6uid6', 'cmpqfqjod000cc9x2llhv7uj5', '2026-04-10 00:00:00.000', 'Present', 'Speaking: diskusi tentang topik film dan musik favorit menggunakan tenses yang tepat.', 'Arthur sangat antusias berbicara tentang topik yang ia sukai. Penggunaan tenses sudah lebih baik dalam konteks natural. Pronunciation perlu sedikit perbaikan.', NULL, 'Latihan pronunciation dan intonasi.'),
  ('cmpqfqnh5005xc9x20ur0tuub', 'cmpqfqndg005pc9x22yv6uid6', 'cmpqfqjod000cc9x2llhv7uj5', '2026-04-17 00:00:00.000', 'Present', 'Writing: menulis recount text tentang pengalaman menarik.', 'Arthur menulis recount text yang menarik dan personal. Penggunaan past tense sudah konsisten. Perlu perbaikan dalam penggunaan time connectives untuk membuat alur lebih jelas.', NULL, 'Revisi tulisan dan latihan recount text lain.'),
  ('cmpqfqni2005zc9x2dxikjy11', 'cmpqfqndg005pc9x22yv6uid6', 'cmpqfqjod000cc9x2llhv7uj5', '2026-04-24 00:00:00.000', 'Present', 'Review dan latihan soal komprehensif menjelang evaluasi bulanan.', 'Arthur mengerjakan latihan dengan penuh semangat. Perkembangannya dalam periode ini sangat signifikan. Ia sudah lebih percaya diri baik dalam speaking maupun writing.', NULL, 'Evaluasi bulanan Bahasa Inggris.'),
  ('cmpqfqnjy0062c9x223ua6p7x', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-03-28 00:00:00.000', 'Present', 'Latihan soal trigonometri dasar: sin, cos, tan dan hubungannya.', 'Cedric memahami definisi trigonometri dengan baik. Ia bisa menentukan nilai sin, cos, tan dari sudut-sudut istimewa. Perlu penguatan dalam penggunaan identitas trigonometri.', NULL, 'Identitas trigonometri dan pembuktian sederhana.'),
  ('cmpqfqnku0064c9x2cb60yf9b', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-04-04 00:00:00.000', 'Present', 'Penerapan trigonometri dalam menghitung tinggi dan jarak.', 'Cedric mampu menerapkan konsep trigonometri dalam soal cerita tentang tinggi bangunan dan sudut elevasi. Ia memahami kapan menggunakan sin, cos, atau tan.', NULL, 'Aturan sinus dan kosinus.'),
  ('cmpqfqnlr0066c9x2v9ccvlkp', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-04-11 00:00:00.000', 'Present', 'Pengenalan aturan sinus dan kosinus untuk segitiga sembarang.', 'Cedric perlu waktu lebih untuk memahami aturan sinus dan kosinus. Latihan dengan banyak contoh soal membantu. Ia mulai bisa mengidentifikasi kapan menggunakan masing-masing aturan.', NULL, 'Latihan soal gabungan aturan sinus dan kosinus.'),
  ('cmpqfqnmp0068c9x2gl6ba1ni', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-04-18 00:00:00.000', 'Reschedule', '-', 'Sesi dijadwalkan ulang.', NULL, NULL),
  ('cmpqfqnnm006ac9x2b1xnkllo', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-04-22 00:00:00.000', 'Present', 'Review trigonometri lengkap dan latihan soal ujian.', 'Cedric mengerjakan latihan soal dengan teliti dan hasilnya memuaskan. Pemahamannya tentang trigonometri sudah komprehensif. Siap untuk evaluasi.', NULL, 'Evaluasi materi trigonometri.'),
  ('cmpqfqnpi006dc9x2aoxfeiwh', 'cmpqfqnok006bc9x25apv3urj', 'cmpqfqjp9000dc9x2d8h2nnl0', '2026-03-29 00:00:00.000', 'Present', 'Diskusi dan latihan membaca puisi kontemporer: interpretasi dan makna.', 'Aska memiliki apresiasi sastra yang baik. Ia mampu menginterpretasikan puisi dengan cara yang unik dan kreatif. Kemampuan menghubungkan puisi dengan pengalaman pribadi sangat baik.', NULL, 'Menulis puisi bebas dengan tema pilihan sendiri.'),
  ('cmpqfqnqe006fc9x22oha045z', 'cmpqfqnok006bc9x25apv3urj', 'cmpqfqjp9000dc9x2d8h2nnl0', '2026-04-05 00:00:00.000', 'Present', 'Latihan menulis cerpen pendek dengan memperhatikan unsur intrinsik.', 'Aska menghasilkan cerpen yang menarik dengan karakter yang kuat. Alur cerita sudah baik. Perlu perhatian lebih pada konsistensi latar dan detail deskripsi.', NULL, 'Revisi cerpen dan latihan dialog antar tokoh.'),
  ('cmpqfqnrb006hc9x2r81fsdru', 'cmpqfqnok006bc9x25apv3urj', 'cmpqfqjp9000dc9x2d8h2nnl0', '2026-04-12 00:00:00.000', 'Present', 'Belajar teks ulasan: cara menganalisis dan menulis resensi.', 'Aska mampu menulis resensi yang kritis dan berimbang. Ia bisa mengidentifikasi kelebihan dan kekurangan karya dengan argumen yang logis.', NULL, 'Menulis resensi film atau buku yang sedang dibaca.');
INSERT INTO `session` (`id`, `student_id`, `mentor_id`, `date`, `attendance`, `activity`, `observation`, `photo_path`, `next_step`) VALUES
  ('cmpqfqns9006jc9x24leuk50h', 'cmpqfqnok006bc9x25apv3urj', 'cmpqfqjp9000dc9x2d8h2nnl0', '2026-04-19 00:00:00.000', 'Present', 'Latihan soal Bahasa Indonesia: sastra dan kebahasaan.', 'Aska lebih kuat di bagian sastra dibandingkan kebahasaan. Soal tentang ejaan dan tata bahasa masih perlu penguatan. Kemampuan analisis sastranya menonjol.', NULL, 'Penguatan EYD dan tata bahasa baku.'),
  ('cmpqfqnt6006lc9x28a2t55dd', 'cmpqfqnok006bc9x25apv3urj', 'cmpqfqjp9000dc9x2d8h2nnl0', '2026-04-23 00:00:00.000', 'Present', 'Review komprehensif dan evaluasi kemampuan menulis kreatif.', 'Aska adalah siswa yang sangat kreatif dan ekspresif dalam berbahasa Indonesia. Perkembangannya sangat positif terutama di bidang sastra. Perlu melanjutkan penguatan di aspek kebahasaan formal.', NULL, 'Persiapan evaluasi akhir periode.'),
  ('cmpqfqnve006mc9x2j4og2aqj', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-05-28 00:00:00.000', 'Present', 'Pengenalan materi baru: limit fungsi dan konsep dasarnya.', 'Cedric memahami konsep limit secara intuitif dengan baik. Ia bisa menentukan limit fungsi sederhana menggunakan substitusi langsung.', NULL, NULL),
  ('cmpqfqnve006nc9x20g339flk', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-06-04 00:00:00.000', 'Present', 'Latihan limit fungsi dengan metode faktorisasi.', 'Cedric menguasai teknik faktorisasi untuk limit dengan baik. Penyelesaiannya sistematis dan rapi.', NULL, NULL),
  ('cmpqfqnve006oc9x2zvvl60as', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-06-07 00:00:00.000', 'Reschedule', '-', 'Sesi dijadwalkan ulang atas permintaan siswa.', NULL, NULL),
  ('cmpqfqnve006pc9x285phtrjb', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-06-11 00:00:00.000', 'Present', 'Pengenalan turunan fungsi dan hubungannya dengan limit.', 'Cedric cepat memahami konsep turunan sebagai limit. Ia bisa menurunkan fungsi polinomial sederhana dengan benar.', NULL, NULL),
  ('cmpqfqnve006qc9x2zob0a7eg', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-06-18 00:00:00.000', 'Present', 'Latihan soal turunan dan aplikasinya dalam mencari gradien garis singgung.', 'Cedric mampu menerapkan turunan dalam konteks geometri. Pemahamannya tentang gradien garis singgung sudah solid.', NULL, NULL),
  ('cmpqfqo15006rc9x2d039nn3p', 'cmpqfqllt002yc9x2mfj5uhnk', 'cmpqfqj9x0001c9x2f6ksov18', '2026-05-29 00:00:00.000', 'Present', 'Menulis paragraf eksposisi tentang dampak media sosial.', 'Amirtha menghasilkan paragraf yang terstruktur dengan argumen yang logis. Penggunaan kalimat topik sudah tepat.', NULL, NULL),
  ('cmpqfqo15006sc9x2odydpt1d', 'cmpqfqllt002yc9x2mfj5uhnk', 'cmpqfqj9x0001c9x2f6ksov18', '2026-06-05 00:00:00.000', 'Present', 'Latihan menulis surat lamaran kerja sederhana.', 'Amirtha memahami format surat lamaran dengan baik. Penggunaan bahasa formal sudah meningkat dari periode sebelumnya.', NULL, NULL),
  ('cmpqfqo15006tc9x2kz1zi2s2', 'cmpqfqllt002yc9x2mfj5uhnk', 'cmpqfqj9x0001c9x2f6ksov18', '2026-06-12 00:00:00.000', 'Tidak Hadir', '-', 'Amirtha tidak hadir. Orang tua mengkonfirmasi ada keperluan mendadak.', NULL, NULL),
  ('cmpqfqo15006uc9x2ibskudjv', 'cmpqfqllt002yc9x2mfj5uhnk', 'cmpqfqj9x0001c9x2f6ksov18', '2026-06-19 00:00:00.000', 'Present', 'Analisis teks argumentasi: identifikasi klaim dan bukti.', 'Amirtha mampu mengidentifikasi klaim utama dan bukti pendukung dengan baik. Kemampuan berpikir kritisnya berkembang.', NULL, NULL),
  ('cmpqfqo15006vc9x26m1p1zfa', 'cmpqfqllt002yc9x2mfj5uhnk', 'cmpqfqj9x0001c9x2f6ksov18', '2026-06-24 00:00:00.000', 'Present', 'Review dan evaluasi bulanan materi teks Bahasa Indonesia.', 'Amirtha menunjukkan perkembangan yang konsisten. Kemampuan menulis teks formal sudah jauh meningkat dibanding periode sebelumnya.', NULL, NULL),
  ('cmpqfqo8y006wc9x2nxb075bl', 'cmpqfqmwj0053c9x239g6zbe4', 'cmpqfqj9x0001c9x2f6ksov18', '2026-05-28 00:00:00.000', 'Present', 'Pendalaman rangkaian listrik: hukum Ohm dan hambatan.', 'Raden sudah lebih percaya diri dengan materi listrik. Ia mampu menghitung hambatan rangkaian seri dan paralel dengan benar.', NULL, NULL),
  ('cmpqfqo8y006xc9x2y9ttfmg6', 'cmpqfqmwj0053c9x239g6zbe4', 'cmpqfqj9x0001c9x2f6ksov18', '2026-06-04 00:00:00.000', 'Present', 'Belajar kemagnetan: sifat magnet dan medan magnet.', 'Raden sangat tertarik dengan topik kemagnetan. Ia aktif bertanya dan mampu menjelaskan konsep medan magnet dengan kata-katanya sendiri.', NULL, NULL),
  ('cmpqfqo8y006yc9x2lq6stmg3', 'cmpqfqmwj0053c9x239g6zbe4', 'cmpqfqj9x0001c9x2f6ksov18', '2026-06-11 00:00:00.000', 'Present', 'Percobaan sederhana: membuat elektromagnet dari kawat dan baterai.', 'Raden berhasil membuat elektromagnet yang berfungsi dengan baik. Ia mencatat hasil percobaan secara sistematis dan menganalisis faktor yang mempengaruhi kekuatan magnet.', NULL, NULL),
  ('cmpqfqo8y006zc9x2lvs8mnc6', 'cmpqfqmwj0053c9x239g6zbe4', 'cmpqfqj9x0001c9x2f6ksov18', '2026-06-18 00:00:00.000', 'Reschedule', '-', 'Sesi dijadwalkan ulang karena mentor berhalangan.', NULL, NULL),
  ('cmpqfqo8y0070c9x25bzama42', 'cmpqfqmwj0053c9x239g6zbe4', 'cmpqfqj9x0001c9x2f6ksov18', '2026-06-24 00:00:00.000', 'Present', 'Latihan soal listrik dan kemagnetan untuk persiapan evaluasi.', 'Raden mengerjakan soal dengan teliti. Pemahaman konsep listrik dan kemagnetan sudah komprehensif. Perkembangannya sangat positif.', NULL, NULL),
  ('cmse6khw70001tcd0vu1ko59e', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-08-01 00:00:00.000', 'Present', 'Planning dan brainstorming untuk IKC', 'Cedric melakukan brainstroming dengan baik. Dia berhasil mendapatkan ide untuk dibuat project 3dnya', NULL, NULL),
  ('cmsy75zqo000110z60q9qtq69', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-08-08 00:00:00.000', 'Present', 'Blender project baru', 'Cedric membuat project baru di Blender. Dia memilih senjata dari karakter game kesukaannya', NULL, NULL),
  ('cmsy7hx700001digkgm282dy6', 'cmpqfqn6z005ec9x2z27fu6b4', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-08-04 00:00:00.000', 'Present', 'Latihan membaca dan memahami surat pendek.', 'Siswa mengikuti sesi dengan baik dan cukup aktif merespons arahan mentor. Pelafalan beberapa bagian masih perlu diperbaiki dan akan dilanjutkan pada sesi berikutnya.', NULL, NULL),
  ('cmsy7qja300012g7eejvd2xp0', 'cmpqfqn6z005ec9x2z27fu6b4', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-08-12 00:00:00.000', 'Present', 'Mengulang materi yang sudah dipelajari pada sesi sebelumnya.', 'Siswa menunjukkan perkembangan yang baik dalam membaca. Masih membutuhkan sedikit bantuan saat menemukan bagian yang belum familiar.', NULL, NULL),
  ('cmsy7r2tn0003digk4mqtpp73', 'cmpqfqn6z005ec9x2z27fu6b4', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-08-14 00:00:00.000', 'Present', 'Latihan membaca dengan memperhatikan pelafalan dan tajwid.', 'Siswa cukup fokus selama sesi dan mampu mengikuti instruksi dengan baik. Kepercayaan diri dalam membaca mulai meningkat.', NULL, NULL),
  ('cmsy7rmzr00032g7ehup8s6e9', 'cmpqfqn6z005ec9x2z27fu6b4', 'cmpqfqj9x0001c9x2f6ksov18', '2026-08-17 00:00:00.000', 'Present', 'Membaca surat secara bergantian bersama mentor.', 'Siswa dapat menyelesaikan latihan dengan baik. Beberapa kesalahan dalam pelafalan masih ditemukan, tetapi siswa mampu memperbaikinya setelah diberikan arahan.', NULL, NULL),
  ('cmsy7sbxm0005digkywgjli33', 'cmpqfqn6z005ec9x2z27fu6b4', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-08-18 00:00:00.000', 'Present', 'Latihan menghafal dan menyetorkan surat yang sudah dipelajari.', 'Siswa terlihat antusias mengikuti kegiatan dan mampu mengingat sebagian besar materi sebelumnya. Perlu latihan mandiri agar kemampuan membaca semakin lancar.', NULL, NULL),
  ('cmuxrr9yg0001fwqlu49b7vqs', 'cmpqfqlfc002nc9x2fq9a6zvo', 'cmpqfqjgx0005c9x25scg1520', '2026-10-07 00:00:00.000', 'Present', 'Belajar menghitung 1-100', 'Hari ini belajar dengan baik, sempat ada kendala koneksi tapi semua aman', NULL, NULL),
  ('cmuxsyxxn0001z7ruwsgnfv4h', 'cmpqfqlfc002nc9x2fq9a6zvo', 'cmpqfqjgx0005c9x25scg1520', '2026-10-07 00:00:00.000', 'Present', 'tes', 'tes', 'https://b9ve30jdrhfqxtti.public.blob.vercel-storage.com/uploads/1791359116685-7nf57rkarzm.webp', NULL),
  ('cmuxtawm40003zj781fqsbhts', 'cmuxt5mub0000zj78zv106p7l', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-10-07 00:00:00.000', 'Present', 'tes', 'tes', NULL, NULL),
  ('cmuxtbi560001woxm3bpz6a6p', 'cmuxt5mub0000zj78zv106p7l', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-10-08 00:00:00.000', 'Present', 'tes2', 'tes2', NULL, NULL),
  ('cmv0z2dzj0001pggpxfjtb7kv', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-10-09 00:00:00.000', 'Present', 'testetstestestetsetstestetstestestetsetstestetsetstese', 'testetsetsetstestestetsetstestestetsetstestetsetstestestetsetstestestetsetsteste', 'https://b9ve30jdrhfqxtti.public.blob.vercel-storage.com/uploads/1791550752291-vdk43v23mx8.webp', NULL),
  ('cmv0z3cd20004x28fnqxfq7yu', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-10-06 00:00:00.000', 'Present', 'asasasddssasddsddasa', 'sddddddsdsdsdssdsdssssds', NULL, NULL),
  ('cmv0z3xbw0006x28f0fj7sw8k', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-10-09 00:00:00.000', 'Reschedule', 'etset stetsetstestetste stetstestetset tstetsetste', 'stetsetstestetsetstestetse tsetstetstestetsetstestetse tsetstetsteste', 'https://b9ve30jdrhfqxtti.public.blob.vercel-storage.com/uploads/1791550826515-fahxvi6a63d.webp', NULL),
  ('cmv382zwn00014ozury4ajcg7', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-10-11 00:00:00.000', 'Present', 'Blender session', 'Cedric membuat pedang dari salah satu anime kesukaannya. Hasilnya sangat baik dan rapi. Bisa diimprove lebih kedepannya', NULL, NULL),
  ('cmv3tbj1r0001vj2sla0ipl39', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-10-11 00:00:00.000', 'Present', 'Membuat background 3d di Blender', 'Hari ini Cedric belajar dengan sangat baik. Dia membuat background dengan Blender.', 'https://b9ve30jdrhfqxtti.public.blob.vercel-storage.com/uploads/1791722471802-hdi5m17pqe5.webp', NULL);
/*!40000 ALTER TABLE `session` ENABLE KEYS */;
UNLOCK TABLES;

-- ------------------------------------------------------------
-- Table structure for: report
-- ------------------------------------------------------------
CREATE TABLE `report` (
  `id` varchar(191) NOT NULL,
  `student_id` varchar(191) NOT NULL,
  `mentor_id` varchar(191) DEFAULT NULL,
  `period_start` datetime(3) NOT NULL,
  `period_end` datetime(3) NOT NULL,
  `summary_achievements` text DEFAULT NULL,
  `summary_general` text DEFAULT NULL,
  `summary_parents` text DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'draft',
  PRIMARY KEY (`id`),
  KEY `Report_student_id_fkey` (`student_id`),
  KEY `Report_mentor_id_fkey` (`mentor_id`),
  CONSTRAINT `report_mentor_id_fkey` FOREIGN KEY (`mentor_id`) REFERENCES `mentor` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `report_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Data for table: report (7 rows)
-- ------------------------------------------------------------
LOCK TABLES `report` WRITE;
/*!40000 ALTER TABLE `report` DISABLE KEYS */;
INSERT INTO `report` (`id`, `student_id`, `mentor_id`, `period_start`, `period_end`, `summary_achievements`, `summary_general`, `summary_parents`, `status`) VALUES
  ('cmpqfsuet0001qwr2ku3sz3mv', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-05-25 17:00:00.000', '2026-06-25 16:59:59.000', 'Pada periode ini Cedric berfokus penuh pada persiapan ICIA. Ia melakukan\nbeberapa sesi brainstorming untuk mematangkan konsep, memperbaiki desain\nposter dan banner, serta melakukan revisi pada model 3D agar lebih optimal\nuntuk proses pencetakan. Cedric juga menyiapkan berbagai kebutuhan\npendukung lainnya untuk memastikan semua aspek presentasi dan proyeknya\nsiap. Secara keseluruhan, Cedric menunjukkan keseriusan dan tanggung jawab\ndalam mempersiapkan proyeknya.\n', 'edric menunjukkan fokus dan tanggung jawab yang baik selama periode\npersiapan ICIA. Ia mampu mengelola berbagai aspek proyek, mulai dari ide, visual,\nhingga teknis produksi. Kemampuan revisi dan penyempurnaan juga terlihat dari\nbagaimana Cedric memperbaiki desain poster, banner, dan model 3D.  ', '● Cedric tidak hadir pada 1 sesi.\n● Ia menunjukkan kesiapan yang baik dalam menghadapi ICIA.\n● Kemampuan revisi dan penyempurnaan proyek semakin berkembang\n● Ada beberapa waktu di mana koneksi internetnya jelek sehingharus offcam dan beberapa kali terlempar dari google meet.\n', 'sent'),
  ('cmsy76hjz000310z6434u1y2z', 'cmpqfqnj00060c9x2w71pt8x2', NULL, '2026-07-26 00:00:00.000', '2026-08-25 23:59:59.000', 'Pada periode ini Cedric mengikuti sesi literasi dengan membahas buku\nMetamorphosis dan Wuthering Heights, serta melakukan eksplorasi ide untuk\nproyek ICIA melalui beberapa sesi brainstorming. Ia mulai mengembangkan\nkonsep dan menerapkannya dalam bentuk awal menggunakan Blender. Cedric\nmenunjukkan pemahaman yang baik saat diskusi dan mampu menyampaikan\nide-idenya, meskipun progres proyek masih perlu didukung dengan kehadiran\nyang lebih konsisten.\n', 'Cedric menunjukkan perkembangan yang baik dalam memahami materi literasi\ndan mampu mengaitkannya dengan pemikiran pribadi. Dalam proses\nbrainstorming, ia dapat menghasilkan ide yang cukup jelas dan terarah untuk\nproyek ICIA. Ia juga sudah mulai menerapkan ide tersebut ke dalam bentuk model\n3D di Blender. ', '● Ia menunjukkan kemampuan berpikir kritis dalam sesi literasi.\n● Sudah berhasil melalui tahap brainstorming dan mulai masuk tahapproduksi proyek ICIA.\n● Ada beberapa waktu di mana koneksi internetnya jelek sehingga terpaksaharus offcam dan beberapa kali terlempar dari google meet. ', 'done'),
  ('cmsy7skjz00052g7esunrlple', 'cmpqfqn6z005ec9x2z27fu6b4', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-07-26 00:00:00.000', '2026-08-25 23:59:59.000', 'Siswa menunjukkan perkembangan yang baik dalam kemampuan membaca dan memahami surat pendek. Siswa mulai lebih percaya diri dalam membaca secara mandiri dan mampu mengikuti arahan mentor dengan baik.', 'Secara keseluruhan, siswa menunjukkan perkembangan positif selama periode pembelajaran. Siswa cukup aktif mengikuti sesi dan mampu menerima arahan serta memperbaiki kesalahan setelah diberikan feedback. Kelancaran dan ketepatan dalam membaca masih perlu dilatih secara konsisten.', 'Disarankan untuk melanjutkan latihan membaca secara rutin di rumah selama beberapa menit setiap hari. Orang tua dapat membantu dengan memberikan kesempatan kepada siswa untuk membaca secara mandiri dan memberikan apresiasi atas perkembangan yang sudah dicapai.', 'done'),
  ('cmugx3mok0001vx2tq4ngs1fl', 'cmtwq83v20000kknpwd5pino4', NULL, '2026-08-25 17:00:00.000', '2026-09-25 16:59:59.999', NULL, NULL, NULL, 'draft'),
  ('cmuxtc0ei0003woxmfhv75ko9', 'cmuxt5mub0000zj78zv106p7l', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-09-26 00:00:00.000', '2026-10-25 23:59:59.999', 'tes 1', 'tes 3', 'tes 4', 'sent'),
  ('cmv0z4k4m0003pggpaz4mhu1h', 'cmpqfqnj00060c9x2w71pt8x2', 'cmpqfqj8y0000c9x2yxg3bqxj', '2026-09-26 00:00:00.000', '2026-10-25 23:59:59.999', 'etstestetsetstete stetstestetsets tet stetsetstestetst stets tstetstetsetstest etstestetste ste tste stetsetstest etsetstes', 'stetsetstestets ttsetstetsetst tsetstetststetsets tst tst st tstetsetstestetsetstetsets te tts tetstestetsetstestetse tstetst', 'testetsetste tset stetset st ets tste ts test ts tst testestetsed', 'sent'),
  ('cmv3tfibf0003vj2sijcymple', 'cmpqfqlfc002nc9x2fq9a6zvo', 'cmpqfqjgx0005c9x25scg1520', '2026-09-26 00:00:00.000', '2026-10-25 23:59:59.999', 'test', 'test', 'test', 'done');
/*!40000 ALTER TABLE `report` ENABLE KEYS */;
UNLOCK TABLES;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
