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
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users
        $member = User::updateOrCreate(
            ['email' => 'member@kumpulin.test'],
            [
                'name' => 'Budi Santoso (Member)',
                'password' => Hash::make('password'),
                'role' => 'member',
                'booking_quota' => 5,
            ]
        );

        $guest = User::updateOrCreate(
            ['email' => 'guest@kumpulin.test'],
            [
                'name' => 'Siti Rahma (Guest)',
                'password' => Hash::make('password'),
                'role' => 'guest',
                'booking_quota' => 2,
            ]
        );

        // 2. Seed Rooms
        $rooms = [
            [
                'name' => 'Open Desk Focus A',
                'category' => 'Open Desk',
                'capacity' => 1,
                'price_per_hour' => 15000,
                'is_active' => true,
            ],
            [
                'name' => 'Open Desk Collab B',
                'category' => 'Open Desk',
                'capacity' => 2,
                'price_per_hour' => 25000,
                'is_active' => true,
            ],
            [
                'name' => 'Meeting Pod Alpha',
                'category' => 'Meeting Pod',
                'capacity' => 4,
                'price_per_hour' => 50000,
                'is_active' => true,
            ],
            [
                'name' => 'Meeting Pod Executive',
                'category' => 'Meeting Pod',
                'capacity' => 8,
                'price_per_hour' => 90000,
                'is_active' => true,
            ],
            [
                'name' => 'Grand Hall Event Space',
                'category' => 'Event Space',
                'capacity' => 50,
                'price_per_hour' => 350000,
                'is_active' => true,
            ],
        ];

        foreach ($rooms as $roomData) {
            Room::updateOrCreate(['name' => $roomData['name']], $roomData);
        }

        // 3. Seed an initial sample booking for testing conflict visualization
        $meetingPod = Room::where('name', 'Meeting Pod Alpha')->first();
        if ($meetingPod && $member) {
            Booking::updateOrCreate(
                ['booking_code' => 'CHB-INIT-001'],
                [
                    'user_id' => $member->id,
                    'room_id' => $meetingPod->id,
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
