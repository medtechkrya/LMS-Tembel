# Database SQL Directory - LMS Teman Belajar

Folder ini berisi file-file SQL untuk setup dan pembaruan database LMS Teman Belajar (MySQL).

## Daftar File

1. **`lms_database.sql`** (Full Backup & Restore)
   - Berisi seluruh skema tabel DDL + data lengkap (24 siswa, 18 mentor dengan PIN unik masing-masing, 133 riwayat sesi, dan 7 laporan).
   - Gunakan file ini jika ingin melakukan **fresh install** atau **restore penuh**.

2. **`schema_only.sql`** (Struktur Tabel Kosong)
   - Hanya berisi skema DDL (`CREATE TABLE`) tanpa data isi.
   - Cocok untuk inisialisasi database kosong baru di staging/production.

3. **`migration_pin.sql`** (Update Skema Mentor PIN Saja)
   - Hanya berisi perintah `ALTER TABLE mentor ADD COLUMN pin ...` dan `UPDATE mentor SET pin = ...` untuk mengisi PIN 18 mentor yang sudah ada.
   - Gunakan file ini jika database Anda sudah ada data dan **hanya ingin menambahkan fitur PIN mentor** tanpa menimpa data siswa/sesi yang sudah berjalan.

---

### Cara Import lewat phpMyAdmin / Hostinger Database:
1. Masuk ke phpMyAdmin / Database Manager.
2. Pilih database `u511063701_tembel_report` (atau nama database Anda).
3. Klik tab **Import**.
4. Pilih file `database/lms_database.sql` (atau `migration_pin.sql` jika hanya migration).
5. Klik **Go / Kirim**.
