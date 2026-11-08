# Kumpul-In: Sistem Reservasi Community Hub Real-Time

> **Praktikum Rekayasa Perangkat Lunak (Bab 4: Agile & Scrum)**  
> **Peran:** Developer (Mahasiswa 3)  
> **Durasi:** Simulasi 1 Sprint (2 Minggu)  
> **Target Luaran:** Repositori Kode, Working Increment, Papan Kanban GitHub Projects, Video Demo (2–3 Menit)

---

## 📌 1. Ringkasan Proyek

**Kumpul-In** adalah aplikasi reservasi ruang kerja komunal (*Community Hub*) berbasis *Decoupled Client-Server* (SPA Frontend + RESTful API Backend) yang memecahkan 3 kendala utama pengguna:
1. **Jadwal Bentrok & Penumpukan:** Transparansi kalender slot waktu dengan deteksi tabrakan jadwal (*real-time collision detection*).
2. **Kategori Ruangan Tidak Jelas:** Pengelompokan terstruktur antara *Open Desk*, *Meeting Pod*, dan *Event Space* beserta kapasitas dan tarif sewa.
3. **Pemesanan Manual Lambat:** Sistem reservasi otomatis dengan penerbitan kode booking instan (`CHB-YYYYMMDD-XXXX`).

---

## 🛠️ 2. Arsitektur & Spesifikasi Tech Stack

* **Backend:** [Laravel 11.x](https://laravel.com)
  * PHP 8.2+
  * Database: SQLite (Development & Testing) / MySQL 8.x
  * Otentikasi: Laravel Sanctum (Token-Based Bearer)
* **Frontend:** [React 19 (Vite)](https://vitejs.dev)
  * Styling: Tailwind CSS v3.4 + `@tailwindcss/forms`
  * Icons: `lucide-react`
  * HTTP Client: `axios` (dengan request interceptor token Sanctum)

---

## 📋 3. Pemetaan User Story (Agile Sprint Backlog)

| ID Backlog | Prioritas | User Story & Fitur | Modul Teknis | Status DoD |
| :--- | :--- | :--- | :--- | :---: |
| **US-01** | Tinggi | Filter & katalog ruangan berdasarkan kategori & kapasitas | `RoomCatalogModule` (`CategoryFilter`, `RoomCard`, `RoomList`) | **Done** |
| **US-02** | Tinggi | Kalender interaktif & transparansi ketersediaan slot waktu | `ScheduleCalendarModule` (`DateSelector`, `SlotGrid`, `SlotItem`) | **Done** |
| **US-03** | Tinggi | Reservasi instan & penerbitan kode booking otomatis | `BookingEngineModule` (`BookingController@store`, `SuccessModal`) | **Done** |
| **US-04** | Sedang | Reservasi Event Space, opsi sewa per jam/harian & upload proposal | `EventBookingModule` (`ProposalUpload`, mode harian 08:00–18:00) | **Done** |
| **US-05** | Sedang | Pembedaan peran Guest vs Member (kuota & tarif khusus) | `AuthRoleModule` (Sanctum Auth, role switcher, quota decrement) | **Done** |

---

## 🗄️ 4. Skema Basis Data (Database Schema)

```
[ users ] (1) <--- (N) [ bookings ] (N) ---> (1) [ rooms ]
```

### 1. Tabel `users`
* `id`: BIGINT (PK)
* `name`: VARCHAR(100)
* `email`: VARCHAR(100) (Unique)
* `password`: VARCHAR(255)
* `role`: ENUM (`'guest'`, `'member'`)
* `booking_quota`: INT UNSIGNED (Default: 3, Member: 5, Guest: 2)
* `timestamps`

### 2. Tabel `rooms`
* `id`: BIGINT (PK)
* `name`: VARCHAR(100)
* `category`: ENUM (`'Meeting Pod'`, `'Open Desk'`, `'Event Space'`)
* `capacity`: INT UNSIGNED
* `price_per_hour`: DECIMAL(10, 2)
* `is_active`: BOOLEAN (Default: true)
* `timestamps`

### 3. Tabel `bookings`
* `id`: BIGINT (PK)
* `booking_code`: VARCHAR(30) (Unique, Format: `CHB-YYYYMMDD-XXXX`)
* `user_id`: BIGINT (FK -> `users.id`)
* `room_id`: BIGINT (FK -> `rooms.id`)
* `booking_date`: DATE
* `start_time`: TIME
* `end_time`: TIME
* `duration_type`: ENUM (`'hourly'`, `'daily'`)
* `proposal_path`: VARCHAR(255) (Nullable, Wajib jika `category == 'Event Space'`)
* `status`: ENUM (`'confirmed'`, `'cancelled'`)
* `timestamps`

---

## 🔌 5. Kontrak REST API (Endpoints)

Base URL: `http://localhost:8000/api`

| Metode | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/quick-login` | Publik | Switch & login simulasi cepat peran `guest` atau `member` (Sanctum Token) |
| `GET` | `/auth/me` | Sanctum | Mendapatkan data profil dan sisa kuota pengguna saat ini |
| `GET` | `/rooms` | Publik | Katalog ruangan dengan query param `category` dan `min_capacity` |
| `GET` | `/rooms/{id}/availability` | Publik | Cek status ketersediaan slot (08:00 - 18:00) pada tanggal tertentu |
| `POST` | `/bookings` | Sanctum | Membuat reservasi baru (cek bentrok, potong kuota, upload proposal) |
| `GET` | `/bookings` | Sanctum | Daftar seluruh reservasi milik pengguna aktif |
| `GET` | `/bookings/proposal/{code}` | Publik | Unduh file proposal PDF yang diunggah pengguna |

---

## ⚡ 6. Panduan Menjalankan Sistem Secara Lokal

### Prasyarat
* PHP $\ge 8.2$ dan Composer
* Node.js $\ge 18$ dan npm

### Langkah 1: Menjalankan Backend API
```powershell
# Masuk ke direktori backend
cd backend

# Setup environment & database SQLite
copy .env.example .env     # (jika belum ada .env)
php artisan key:generate
php artisan migrate:fresh --seed

# Jalankan server API
php artisan serve
# Backend aktif pada: http://127.0.0.1:8000
```

### Langkah 2: Menjalankan Frontend Client
Buka terminal baru:
```powershell
# Masuk ke direktori frontend
cd frontend

# Jalankan vite development server
npm.cmd run dev
# Frontend aktif pada: http://localhost:5173
```

---

## 🧪 7. Menjalankan Tes Otomatis (PHPUnit)

Untuk membuktikan seluruh Acceptance Criteria dan Definition of Done:
```powershell
cd backend
php artisan test --filter=KumpulinApiTest
```

Hasil Pengujian:
```text
PASS  Tests\Feature\KumpulinApiTest
✓ can list rooms with filters (US-01)
✓ can check room availability including seeded booking (US-02)
✓ quick login returns token (US-05)
✓ member can create hourly booking and quota decrements (US-03, US-05)
✓ conflict detection prevents double booking (US-02)
✓ guest cannot book daily (US-05)
✓ member can book daily with proposal for event space (US-02, US-04)

Tests: 7 passed (39 assertions)
```

---

## 🎬 8. Panduan & Naskah Rekaman Video Demo (Durasi: 2.5 Menit)

Gunakan file `sample_proposal_event.pdf` yang sudah disediakan di root folder untuk pengujian upload proposal.

| Durasi | Fokus User Story | Aksi Demo | Narasi Rekomendasi |
| :--- | :--- | :--- | :--- |
| **00:00 – 00:30** | **US-01 (Katalog & Filter)** | Buka `http://localhost:5173`. Klik tab filter kategori (*Open Desk*, *Meeting Pod*, *Event Space*), dan ubah dropdown batas kapasitas minimum. | *"Halo semua, berikut demonstrasi sistem reservasi Kumpul-In. Di halaman utama, pengguna dapat memfilter ruangan berdasarkan kategori maupun kapasitas."* |
| **00:30 – 01:15** | **US-02 & US-03 (Kalender & Reservasi Instan)** | Pilih salah satu ruangan (misal: *Meeting Pod Alpha*). Klik tanggal hari ini atau besok. Klik salah satu slot hijau kosong (misal: *13:00 - 14:00*). Form pop-up terbuka, klik **Konfirmasi Reservasi**. Pop-up kode booking muncul, klik ikon salin kode. | *"Pada bagian kalender, pengguna dapat melihat transparansi ketersediaan slot. Slot hijau menandakan waktu tersedia. Ketika diklik, modal konfirmasi muncul dan reservasi instan berhasil dengan kode booking resmi."* |
| **01:15 – 01:50** | **US-02 (Verifikasi Anti Double Booking)** | Tutup modal bukti. Perhatikan bahwa slot yang baru saja dipesan kini **otomatis berubah warna merah (Terisi)** dan terkunci tidak dapat diklik lagi. Sisa kuota di navbar berkurang 1. | *"Setelah pemesanan berhasil, slot waktu tersebut langsung terkunci secara real-time untuk mencegah jadwal bentrok (double booking), dan kuota pengguna berkurang."* |
| **01:50 – 02:30** | **US-04 & US-05 (Event Space & Daily Booking)** | 1. Beralih ke peran **Guest** di navbar, pilih *Grand Hall Event Space*, pilih mode *Sewa Harian (Daily)* -> muncul peringatan Guest tidak diizinkan.<br>2. Beralih kembali ke peran **Member** -> mode harian terbuka.<br>3. Buka form booking, upload file `sample_proposal_event.pdf`, lalu klik konfirmasi.<br>4. Tunjukkan seluruh slot pada tanggal tersebut kini terkunci penuh karena booking harian. | *"Untuk Event Space dan sewa harian, hanya akun Member yang dapat melakukannya dengan syarat melampirkan proposal kegiatan berformat PDF. Seluruh hari akan otomatis terkunci. Terima kasih."* |

---

## 👥 Akun Simulasi Pengguna (Seeder)

| Peran | Email | Password | Kuota Awal | Hak Akses Khusus |
| :--- | :--- | :--- | :---: | :--- |
| **Member** | `member@kumpulin.test` | `password` | 5 slot | Sewa per jam & sewa harian (*Daily*), upload proposal |
| **Guest** | `guest@kumpulin.test` | `password` | 2 slot | Hanya sewa per jam (*Hourly*) |

*(Catatan: Anda dapat berganti peran secara langsung hanya dengan 1 klik pada tombol switcher di Navbar).*
