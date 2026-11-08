# Master Development Plan: Kumpul-In (Sistem Reservasi Community Hub)
**Peran:** Developer (Mahasiswa 3)  
**Mata Kuliah:** Praktikum Rekayasa Perangkat Lunak (Bab 4: Agile & Scrum)  
**Durasi:** Simulasi 1 Sprint (2 Minggu)  
**Target:** Repositori Kode, Working Increment, Papan Kanban GitHub Projects, Video Demo (2–3 Menit)

---

## 1. Ringkasan Proyek & Pemetaan User Story

Sistem dirancang untuk mengatasi 3 kendala utama pengguna (*pain points*):
1. **Jadwal Bentrok & Penumpukan:** Ketiadaan status ketersediaan *real-time*.
2. **Kategori Ruangan Tidak Jelas:** Kebingungan membedakan *Open Desk*, *Meeting Pod*, dan *Event Space*.
3. **Pemesanan Manual Lambat:** Prosedur manual yang memakan waktu.

### Pemetaan User Story ke Modul Teknis
| ID Backlog | Prioritas | User Story & Fitur | Modul Teknis |
| :--- | :--- | :--- | :--- |
| **US-01** | Tinggi | Filter & katalog ruangan berdasarkan kategori & kapasitas | `RoomCatalogModule` (Filter tab, Room Cards, Badges) |
| **US-02** | Tinggi | Kalender interaktif & transparansi ketersediaan slot waktu | `ScheduleCalendarModule` (Time slots grid, Real-time lock check) |
| **US-03** | Tinggi | Reservasi instan & penerbitan kode booking otomatis | `BookingEngineModule` (Conflict validation, Code generator) |
| **US-04** | Sedang | Reservasi Event Space, opsi sewa per jam/harian & upload proposal | `EventBookingModule` (File upload `.pdf`, Duration toggle) |
| **US-05** | Sedang | Pembedaan peran Guest vs Member (kuota & tarif khusus) | `AuthRoleModule` (Role middleware, Quota decrement guard) |

---

## 2. Arsitektur Sistem & Spesifikasi Tech Stack

* **Arsitektur:** *Decoupled Client-Server* (Frontend SPA + Backend RESTful API).
* **Backend:** Laravel 11.x
  * PHP 8.2+
  * Database: MySQL 8.x / SQLite (Development)
  * Otentikasi: Laravel Sanctum (Token-based)
* **Frontend:** React 19 (Vite)
  * CSS Framework: Tailwind CSS v3.4 (+ `@tailwindcss/forms`)
  * State & HTTP: React Hook state / Axios
  * Icons: `lucide-react`
* **Standar Definition of Done (DoD):**
  * Bebas error fatal/syntax di branch `main`.
  * Fitur tervalidasi terhadap seluruh *Acceptance Criteria* PO.
  * Responsif di perangkat desktop/laptop ($\ge 1024\text{px}$) dan mobile ($\le 480\text{px}$).
  * Dokumentasi kode program bersih (komentar fungsi penting).

---

## 3. Skema Basis Data Relasional

### Diagram Relasi Entitas (ERD) Ringkas
```
[ users ] (1) <--- (N) [ bookings ] (N) ---> (1) [ rooms ]
```

### Definisi DDL Migrasi Database

```sql
-- 1. TABEL PENGGUNA (users)
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('guest', 'member') DEFAULT 'guest',
    booking_quota INT UNSIGNED DEFAULT 3,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- 2. TABEL RUANGAN (rooms)
CREATE TABLE rooms (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('Meeting Pod', 'Open Desk', 'Event Space') NOT NULL,
    capacity INT UNSIGNED NOT NULL,
    price_per_hour DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- 3. TABEL PEMESANAN (bookings)
CREATE TABLE bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(30) UNIQUE NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    room_id BIGINT UNSIGNED NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_type ENUM('hourly', 'daily') DEFAULT 'hourly',
    proposal_path VARCHAR(255) NULL,
    status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);
```

---

## 4. Desain Kontrak REST API (Backend)

Base URL: `http://localhost:8000/api`

### 4.1. Katalog Ruangan (US-01)
* **Endpoint:** `GET /rooms`
* **Query Params:** `category` (`Meeting Pod` | `Open Desk` | `Event Space`), `min_capacity` (integer).
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Meeting Pod A",
      "category": "Meeting Pod",
      "capacity": 4,
      "price_per_hour": 50000,
      "is_active": true
    }
  ]
}
```

### 4.2. Pengecekan Slot Kalender (US-02)
* **Endpoint:** `GET /rooms/{id}/availability`
* **Query Params:** `date=YYYY-MM-DD`
* **Response (200 OK):**
```json
{
  "success": true,
  "date": "2026-11-10",
  "room_id": 1,
  "slots": [
    { "time": "09:00 - 10:00", "is_booked": false },
    { "time": "10:00 - 11:00", "is_booked": true, "booking_code": "CHB-***" },
    { "time": "11:00 - 12:00", "is_booked": false }
  ]
}
```

### 4.3. Pembuatan Reservasi Instan (US-03, US-04, US-05)
* **Endpoint:** `POST /bookings`
* **Headers:** `Content-Type: multipart/form-data`
* **Payload:**
  * `user_id`: Integer
  * `room_id`: Integer
  * `booking_date`: String (`YYYY-MM-DD`)
  * `start_time`: String (`09:00:00`)
  * `end_time`: String (`11:00:00`)
  * `duration_type`: String (`hourly` | `daily`)
  * `proposal_file`: File PDF (Wajib jika category = `Event Space`)
* **Aturan Validasi Backend:**
  1. Slot conflict check: Tidak boleh ada booking aktif di ruang dan interval jam yang bersinggungan.
  2. Role check: Akun `guest` tidak boleh memilih `duration_type = daily`.
  3. Quota check: `user.booking_quota` harus $> 0$.
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "Reservasi berhasil dikonfirmasi secara instan.",
  "data": {
    "booking_code": "CHB-20261110-8491",
    "room_name": "Meeting Pod A",
    "schedule": "2026-11-10 09:00 - 11:00",
    "status": "confirmed"
  }
}
```

---

## 5. Rencana Arsitektur Frontend (React + Tailwind)

### Hierarki Komponen
```
src/
├── components/
│   ├── Navbar.jsx              // Switcher role simulasi (Guest vs Member), Quota badge
│   ├── RoomCatalog/
│   │   ├── CategoryFilter.jsx  // Tab filter: All, Open Desk, Meeting Pod, Event Space
│   │   ├── RoomCard.jsx        // Card info ruangan, badge kapasitas, tombol "Pilih Slot"
│   │   └── RoomList.jsx        // Container grid responsif (grid-cols-1 md:grid-cols-3)
│   ├── BookingCalendar/
│   │   ├── DateSelector.jsx    // Input date picker
│   │   ├── SlotGrid.jsx        // Grid slot jam (Warna Hijau = Tersedia, Merah = Terisi)
│   │   └── SlotItem.jsx        // Interactive button slot
│   └── BookingModal/
│       ├── BookingForm.jsx     // Form konfirmasi reservasi
│       ├── ProposalUpload.jsx  // Input uploader PDF untuk Event Space
│       └── SuccessModal.jsx    // Pop-up bukti reservasi instan & Booking Code
├── services/
│   └── api.js                  // Axios client & request helpers
├── App.jsx                     // State orchestrator utama
└── index.css                   // Tailwind directives
```

---

## 6. Rencana Eksekusi Langkah Demi Langkah (Step-by-Step)

### Fase 1: Setup Lingkungan & Scaffolding
1. **Backend Initialization:**
   * Masuk direktori backend: `cd backend`.
   * Perbaiki konfigurasi policy Composer: `composer config policy.advisories.block false`.
   * Jalankan instalasi: `composer install`.
   * Buat key: `php artisan key:generate`.
   * Aktifkan route API: `php artisan install:api`.
2. **Frontend Initialization:**
   * Masuk direktori frontend: `cd ../frontend`.
   * Install dependensi: `npm.cmd install`.
   * Pasang Tailwind & Icon: `npm.cmd install -D tailwindcss@^3.4 postcss autoprefixer @tailwindcss/forms lucide-react axios`.
   * Inisialisasi config: `npx.cmd tailwindcss init -p`.
3. **Konfigurasi CORS:**
   * Buka `backend/config/cors.php`, pastikan `allowed_origins` memuat `['http://localhost:5173']`.

### Fase 2: Implementasi Backend (Laravel 11)
1. **Migrations & Seeders:**
   * Buat file migrasi tabel `rooms` dan `bookings`.
   * Buat `DatabaseSeeder.php` dengan data awal:
     * 2 Open Desk (Kapasitas 1-2 orang)
     * 2 Meeting Pod (Kapasitas 4-8 orang)
     * 1 Event Space (Kapasitas 50 orang)
     * 2 Akun Pengguna: 1 Member (Kuota: 5), 1 Guest (Kuota: 2)
   * Jalankan: `php artisan migrate:fresh --seed`.
2. **Business Logic & Controller:**
   * Buat `app/Http/Controllers/Api/RoomController.php` untuk katalog dan filter.
   * Buat `app/Http/Controllers/Api/BookingController.php` dengan algoritma validasi bentrok:
     $$\text{Conflict} \iff (start_{\text{baru}} < end_{\text{terdaftar}}) \land (end_{\text{baru}} > start_{\text{terdaftar}})$$
   * Terapkan auto-generator kode reservasi: `CHB-YYYYMMDD-XXXX`.
   * Tambahkan storage symlink untuk file proposal: `php artisan storage:link`.

### Fase 3: Implementasi Frontend (React + Tailwind)
1. **Komponen Katalog (US-01):**
   * Buat state kategori aktif dan filter data dinamis.
2. **Komponen Slot Kalender (US-02):**
   * Buat grid jam kerja 08:00–18:00 WIB.
   * Hubungkan status keterisian slot dengan styling warna kontras:
     * Hijau (`bg-emerald-600 hover:bg-emerald-700`): Tersedia.
     * Merah (`bg-rose-600 cursor-not-allowed opacity-75`): Terisi / Terkunci.
3. **Komponen Reservasi & Modal (US-03 & US-04):**
   * Buat modal form pop-up saat slot diklik.
   * Tampilkan input file `.pdf` hanya jika ruangan bertipe `Event Space`.
   * Tampilkan kode booking setelah respons API 201 berhasil diterima.
4. **Simulasi Role & Quota (US-05):**
   * Tambahkan dropdown profil sederhana di Navbar untuk berganti konteks antara *Guest User* dan *Member User* guna membuktikan pembatasan kuota dan sewa harian.

### Fase 4: Pengujian DoD & Sinkronisasi Git
1. Uji skenario tabrakan jadwal (*double booking*) pada jam yang sama; pastikan sistem menolak dengan pesan error yang jelas.
2. Uji responsivitas layout pada resolusi mobile viewport (375px–414px).
3. Lakukan commit terstruktur per fitur di Git:
   * `feat: setup database migrations and initial seeders`
   * `feat(catalog): implement room list and category filtering`
   * `feat(calendar): implement real-time slot conflict detection`
   * `feat(booking): instant confirmation and proposal upload`
4. Pastikan kartu di papan GitHub Projects dipindahkan dari *To Do* ke *In Progress* hingga *Done*.

### Fase 5: Persiapan Skenario Video Demo (Maks. 2.5 Menit)
* **00:00 – 00:30:** Perkenalan modul katalog ruangan dan demonstrasi filter kategori (US-01).
* **00:30 – 01:15:** Pemilihan slot waktu kosong pada kalender interaktif dan pembuatan reservasi instan hingga kode booking muncul (US-02, US-03).
* **01:15 – 01:50:** Verifikasi bentrok jadwal: tunjukkan bahwa slot yang baru dipesan langsung berubah merah/terkunci dan tidak dapat dipilih lagi (US-02).
* **01:50 – 02:30:** Pemesanan Event Space dengan durasi harian dan upload file proposal PDF menggunakan akun Member (US-04, US-05).