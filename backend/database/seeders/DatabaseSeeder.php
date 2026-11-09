<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Room;
use App\Models\Booking;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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
            Room::updateOrCreate(['name' => $roomData['name']], $roomData);
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
                ]
            );
        }
    }
}
