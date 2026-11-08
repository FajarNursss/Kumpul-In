# Panduan Setup Papan Kanban GitHub Projects & Artefak Scrum: Kumpul-In

> **Mata Kuliah:** Praktikum Rekayasa Perangkat Lunak (Bab 4: Agile & Scrum)  
> **Peran:** Developer (Mahasiswa 3)  
> **Sprint:** Sprint 1 (2 Minggu)  
> **Sprint Goal:** *"Menghasilkan working increment aplikasi Kumpul-In berupa sistem reservasi ruang komunitas dengan katalog terfilter, kalender slot anti-bentrok, otentikasi Sanctum, dan dashboard multi-role."*

---

## 📌 1. Struktur Kolom Papan Kanban (GitHub Projects)

Buat project baru di GitHub dengan template **Kanban (Team Backlog)** dan gunakan kolom berikut:
1. **Product Backlog** (Daftar seluruh kebutuhan proyek)
2. **Sprint Backlog / To Do** (Item yang disepakati untuk dikerjakan pada Sprint 1)
3. **In Progress** (Item yang sedang dalam tahap pengkodean)
4. **In Review / Testing** (Item yang sedang diuji DoD & otomatisasi tes)
5. **Done** (Item yang tuntas tervalidasi terhadap Acceptance Criteria)

---

## 📋 2. Rincian Kartu User Story (Untuk Disalin ke GitHub Issues / Cards)

Setiap User Story di bawah dapat langsung disalin menjadi **Issue / Card** di GitHub Projects:

### 🎫 Card 1: [US-01] Filter & Katalog Ruangan Komunitas
* **Label:** `enhancement`, `frontend`, `backend`, `priority: high`
* **Story Points:** 5
* **User Story:**
  > *Sebagai pengguna komunitas, saya ingin melihat katalog ruangan dan memfilter berdasarkan kategori serta kapasitas, sehingga saya dapat menemukan ruang kerja yang cocok untuk kegiatan saya.*
* **Acceptance Criteria (AC):**
  - [x] Menampilkan daftar ruangan aktif beserta nama, kategori, foto/badge, kapasitas maksimal, dan tarif per jam.
  - [x] Pengguna dapat memfilter berdasarkan kategori: *All*, *Open Desk*, *Meeting Pod*, dan *Event Space*.
  - [x] Pengguna dapat memfilter batas kapasitas minimum (1, 4, 8, 20, 50 orang).
  - [x] Menampilkan status kosong jika filter tidak menghasilkan data.
* **Pull Request / Commit Terkait:** `feat(catalog): implement room list and category filtering`

---

### 🎫 Card 2: [US-02] Kalender Interaktif & Transparansi Ketersediaan Slot
* **Label:** `enhancement`, `backend`, `frontend`, `priority: high`
* **Story Points:** 8
* **User Story:**
  > *Sebagai pengguna, saya ingin melihat ketersediaan slot waktu pada tanggal tertentu secara transparan, sehingga saya tidak memesan jadwal yang sudah terisi oleh orang lain.*
* **Acceptance Criteria (AC):**
  - [x] Menampilkan grid 10 slot operasional (08:00–18:00 WIB).
  - [x] Slot kosong berwarna hijau (*Tersedia*) dan slot terisi berwarna merah (*Terisi / Terkunci*).
  - [x] Slot yang sudah dipesan tidak dapat diklik (*disabled / cursor-not-allowed*).
  - [x] Jika ada pemesanan harian (*Daily Booking*), seluruh slot pada hari tersebut otomatis terkunci penuh.
* **Pull Request / Commit Terkait:** `feat(calendar): implement real-time slot conflict detection`

---

### 🎫 Card 3: [US-03] Reservasi Instan & Penerbitan Kode Booking Otomatis
* **Label:** `core-feature`, `backend`, `priority: high`
* **Story Points:** 5
* **User Story:**
  > *Sebagai pengguna, saya ingin melakukan pemesanan ruangan dan langsung mendapatkan kode booking resmi, sehingga saya memiliki bukti reservasi tanpa harus menunggu persetujuan manual.*
* **Acceptance Criteria (AC):**
  - [x] Backend memvalidasi tabrakan jadwal dengan formula irisan waktu sebelum menyimpan data.
  - [x] Transaksi database bersifat atomik (`DB::transaction`).
  - [x] Otomatis menerbitkan kode booking unik dengan format `CHB-YYYYMMDD-XXXX`.
  - [x] Menampilkan pop-up modal konfirmasi sukses dengan fitur salin kode booking ke clipboard.
* **Pull Request / Commit Terkait:** `feat(booking): instant confirmation and proposal upload`

---

### 🎫 Card 4: [US-04] Reservasi Event Space & Upload Proposal Kegiatan
* **Label:** `enhancement`, `backend`, `frontend`, `priority: medium`
* **Story Points:** 5
* **User Story:**
  > *Sebagai ketua komunitas, saya ingin memesan Grand Hall Event Space dengan opsi durasi harian dan melampirkan proposal PDF, agar pengelola dapat meninjau rincian kegiatan saya.*
* **Acceptance Criteria (AC):**
  - [x] Input unggah file proposal hanya aktif/wajib ketika kategori ruangan adalah *Event Space*.
  - [x] Validasi file di backend: hanya menerima format `.pdf` dengan ukuran maksimal 5 MB.
  - [x] File tersimpan aman di storage server dan dapat diunduh kembali oleh admin maupun pemesan.
* **Pull Request / Commit Terkait:** `feat(booking): instant confirmation and proposal upload`

---

### 🎫 Card 5: [US-05] Pembedaan Peran (Guest, Member, Admin) & Kuota
* **Label:** `security`, `auth`, `priority: medium`
* **Story Points:** 8
* **User Story:**
  > *Sebagai sistem, saya ingin membedakan hak akses dan kuota reservasi antara Guest, Member, dan Administrator, agar pemanfaatan fasilitas hub tertib dan terkelola.*
* **Acceptance Criteria (AC):**
  - [x] Akun Guest dibatasi hanya untuk sewa per jam (*Hourly*) dengan kuota awal 2 reservasi.
  - [x] Akun Member memiliki kuota awal 5 reservasi dan diizinkan memilih sewa harian (*Daily*).
  - [x] Kuota dipotong 1 setiap kali reservasi berhasil dikonfirmasi.
  - [x] Akun Administrator memiliki hak akses ke Dashboard Admin khusus untuk memantau analitik, membatalkan booking (yang mengembalikan kuota user), dan menambah/mengubah ruangan.
  - [x] Disediakan tombol cepat (*1-Click Quick Login*) di modal login dan navbar untuk kebutuhan simulasi praktikum.
* **Pull Request / Commit Terkait:** `feat: integrate brand logo, public landing page, authentication flow, and admin/user dashboard`

---

## 📊 3. Perhitungan Velocity & Burn-Down Sprint 1

* **Total Story Points:** $5 + 8 + 5 + 5 + 8 = 31 \text{ SP}$
* **Durasi Sprint:** 10 Hari Kerja (2 Minggu)
* **Kapasitas Tim (Mahasiswa 3):** $\approx 30 - 35 \text{ SP}$
* **Status Akhir Sprint:** 31 SP **Done** (100% Selesai tepat waktu)

---

## 📝 4. Catatan Sprint Review & Retrospective

### Sprint Review (Demo ke Asisten Lab / Dosen):
* **Working Increment:** Aplikasi berjalan penuh di `http://localhost:5173` (Frontend) dan `http://127.0.0.1:8000` (Backend API).
* **Feedback PO / Penguji:**
  * Alur deteksi bentrok jadwal berjalan mulus secara visual.
  * Penambahan Landing Page dan Dashboard Admin memberikan nilai tambah (*exceed expectation*) dari backlog awal.

### Sprint Retrospective:
* **What went well:**
  * Penggunaan SQLite mempercepat migrasi tanpa dependensi database server lokal yang rumit.
  * Pembuatan komponen modular di React mempermudah integrasi state role switcher.
* **What could be improved:**
  * Pengujian responsivitas mobile perlu diperluas ke berbagai jenis perangkat tablet.
* **Action item untuk Sprint berikutnya:**
  * Menambahkan integrasi payment gateway (Midtrans sandbox) dan notifikasi email/WhatsApp otomatis.

