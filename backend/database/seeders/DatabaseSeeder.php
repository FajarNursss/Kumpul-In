<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Room;
use App\Models\Booking;
use App\Models\RoomInventory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database for campus facilities booking.
     */
    public function run(): void
    {
        // 1. Seed Users (Civitas Kampus: Admin & Mahasiswa)
        $admin = User::updateOrCreate(
            ['email' => 'admin@kumpulin.test'],
            [
                'name' => 'Biro Sarana Kampus (Admin)',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'booking_quota' => 999,
            ]
        );

        $mahasiswa = User::updateOrCreate(
            ['email' => 'mahasiswa@kumpulin.test'],
            [
                'name' => 'Budi Santoso (Mahasiswa)',
                'password' => Hash::make('password'),
                'role' => 'mahasiswa',
                'booking_quota' => 5,
            ]
        );

        // Keep member user as alias so any legacy test passes
        $member = User::updateOrCreate(
            ['email' => 'member@kumpulin.test'],
            [
                'name' => 'Siti Rahma (Mahasiswa/Member)',
                'password' => Hash::make('password'),
                'role' => 'member',
                'booking_quota' => 5,
            ]
        );

        // 2. Seed Campus Rooms (Aula, Perpustakaan, Meeting Room, Ruang Belajar)
        $rooms = [
            // Kategori: Ruang Belajar
            [
                'name' => 'Ruang Belajar Mandiri Gedung A',
                'category' => 'Ruang Belajar',
                'capacity' => 1,
                'price_per_hour' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'Smart Classroom Kolaborasi Gedung B',
                'category' => 'Ruang Belajar',
                'capacity' => 30,
                'price_per_hour' => 0,
                'is_active' => true,
            ],
            // Kategori: Perpustakaan
            [
                'name' => 'Ruang Diskusi Perpustakaan Lt. 2',
                'category' => 'Perpustakaan',
                'capacity' => 8,
                'price_per_hour' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'Bilik Riset & Multimedia Perpustakaan',
                'category' => 'Perpustakaan',
                'capacity' => 4,
                'price_per_hour' => 0,
                'is_active' => true,
            ],
            // Kategori: Meeting Room
            [
                'name' => 'Meeting Room Senat & Dosen Lt. 2',
                'category' => 'Meeting Room',
                'capacity' => 16,
                'price_per_hour' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'Ruang Rapat Ormawa & BEM Kampus',
                'category' => 'Meeting Room',
                'capacity' => 12,
                'price_per_hour' => 0,
                'is_active' => true,
            ],
            // Kategori: Aula
            [
                'name' => 'Aula Utama Graha Nusantara Kampus',
                'category' => 'Aula',
                'capacity' => 300,
                'price_per_hour' => 0,
                'is_active' => true,
            ],
            [
                'name' => 'Aula Gedung Rektorat Lt. 3',
                'category' => 'Aula',
                'capacity' => 80,
                'price_per_hour' => 0,
                'is_active' => true,
            ],
        ];

        foreach ($rooms as $roomData) {
            $createdRoom = Room::updateOrCreate(['name' => $roomData['name']], $roomData);

            // Seed inventory equipment for each room category if empty
            if ($createdRoom->inventories()->count() === 0) {
                if ($createdRoom->category === 'Aula') {
                    $createdRoom->inventories()->createMany([
                        ['item_name' => 'Sound System Line Array 5000W', 'quantity' => 1, 'condition' => 'good', 'notes' => 'Mixer Digital 16 Channel'],
                        ['item_name' => 'Wireless Microphone Shure Beta', 'quantity' => 4, 'condition' => 'good', 'notes' => 'Baterai cadangan tersedia di meja kontrol'],
                        ['item_name' => 'Laser Projector 10.000 Lumens', 'quantity' => 2, 'condition' => 'good', 'notes' => 'Koneksi HDMI & Wireless Screen'],
                        ['item_name' => 'Podium Utama Resmi Kayu Jati', 'quantity' => 1, 'condition' => 'good', 'notes' => 'Logo universitas kuningan'],
                        ['item_name' => 'Kursi Tamu VIP Beludru Merah', 'quantity' => 50, 'condition' => 'good', 'notes' => 'Baris depan area VIP'],
                    ]);
                } elseif ($createdRoom->category === 'Perpustakaan') {
                    $createdRoom->inventories()->createMany([
                        ['item_name' => 'Smart TV Samsung 55" UHD', 'quantity' => 1, 'condition' => 'good', 'notes' => 'Mendukung casting laptop mahasiswa'],
                        ['item_name' => 'Magnetic Whiteboard 2x1 Meter', 'quantity' => 1, 'condition' => 'good', 'notes' => 'Lengkap 4 spidol dan penghapus'],
                        ['item_name' => 'Stopkontak Meja Modular 4 Lubang', 'quantity' => 4, 'condition' => 'good', 'notes' => 'Terintegrasi di tiap meja diskusi'],
                        ['item_name' => 'Kabel HDMI 4K High Speed 3 Meter', 'quantity' => 2, 'condition' => 'good', 'notes' => 'Kabel cadangan di laci staf'],
                    ]);
                } elseif ($createdRoom->category === 'Meeting Room') {
                    $createdRoom->inventories()->createMany([
                        ['item_name' => 'Conference Camera PTZ 4K Zoom', 'quantity' => 1, 'condition' => 'good', 'notes' => 'Kompatibel Zoom/Google Meet'],
                        ['item_name' => 'Microphone Goose-neck Meja Rapat', 'quantity' => 8, 'condition' => 'good', 'notes' => 'Dilengkapi tombol mute personal'],
                        ['item_name' => 'Smart TV Display 65" LG Commercial', 'quantity' => 1, 'condition' => 'good', 'notes' => 'HDMI 1 & 2 terpasang'],
                        ['item_name' => 'Glass Whiteboard Premium 2.4 Meter', 'quantity' => 1, 'condition' => 'good', 'notes' => 'Spidol kaca non-permanent'],
                    ]);
                } elseif ($createdRoom->category === 'Ruang Belajar') {
                    $createdRoom->inventories()->createMany([
                        ['item_name' => 'Interactive Smart Board 75"', 'quantity' => 1, 'condition' => 'good', 'notes' => 'Stylus pen 2 buah'],
                        ['item_name' => 'Meja Belajar Sekat Partisi Akustik', 'quantity' => $createdRoom->capacity, 'condition' => 'good', 'notes' => 'Ergonomis untuk fokus belajar'],
                        ['item_name' => 'Lampu Belajar LED Meja Personal', 'quantity' => $createdRoom->capacity, 'condition' => 'good', 'notes' => '3 tingkat kecerahan'],
                        ['item_name' => 'Air Conditioner Daikin Inverter 2 PK', 'quantity' => 2, 'condition' => 'good', 'notes' => 'Suhu optimal 22°C'],
                    ]);
                }
            }
        }

        // 3. Seed an initial sample booking for testing conflict visualization
        $targetRoom = Room::where('name', 'Meeting Room Senat & Dosen Lt. 2')->first();
        if ($targetRoom && $mahasiswa) {
            Booking::updateOrCreate(
                ['booking_code' => 'KMP-INIT-001'],
                [
                    'user_id' => $mahasiswa->id,
                    'room_id' => $targetRoom->id,
                    'booking_date' => now()->format('Y-m-d'),
                    'start_time' => '10:00:00',
                    'end_time' => '11:00:00',
                    'duration_type' => 'hourly',
                    'status' => 'confirmed',
                    'checkin_token' => 'CHK-INIT-' . Str::random(12),
                ]
            );
        }
    }
}
