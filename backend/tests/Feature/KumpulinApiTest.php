<?php

namespace Tests\Feature;

use App\Models\Room;
use App\Models\User;
use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KumpulinApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_list_rooms_with_filters()
    {
        $response = $this->getJson('/api/rooms?category=Meeting Room');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    public function test_can_check_room_availability_including_seeded_booking()
    {
        $room = Room::where('name', 'Meeting Room Senat & Dosen Lt. 2')->first();
        $today = now()->format('Y-m-d');

        $response = $this->getJson("/api/rooms/{$room->id}/availability?date={$today}");
        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        // Check that 10:00 - 11:00 is booked from the seeder
        $slots = $response->json('slots');
        $slot10to11 = collect($slots)->firstWhere('time', '10:00 - 11:00');
        $this->assertNotNull($slot10to11);
        $this->assertTrue($slot10to11['is_booked']);
    }

    public function test_quick_login_returns_token()
    {
        $response = $this->postJson('/api/auth/quick-login', ['role' => 'mahasiswa']);
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'role', 'booking_quota'],
                    'token',
                ]
            ]);
    }

    public function test_mahasiswa_can_create_hourly_booking_and_quota_decrements()
    {
        $mahasiswa = User::where('role', 'mahasiswa')->first();
        $room = Room::where('name', 'Meeting Room Senat & Dosen Lt. 2')->first();
        $initialQuota = $mahasiswa->booking_quota;

        $response = $this->actingAs($mahasiswa, 'sanctum')->postJson('/api/bookings', [
            'room_id' => $room->id,
            'booking_date' => now()->addDay()->format('Y-m-d'),
            'duration_type' => 'hourly',
            'start_time' => '13:00',
            'end_time' => '14:00',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.remaining_quota', $initialQuota - 1);

        $this->assertEquals($initialQuota - 1, $mahasiswa->fresh()->booking_quota);
    }

    public function test_conflict_detection_prevents_double_booking()
    {
        $mahasiswa = User::where('role', 'mahasiswa')->first();
        $room = Room::where('name', 'Meeting Room Senat & Dosen Lt. 2')->first();
        $date = now()->addDays(2)->format('Y-m-d');

        // First booking: 14:00 - 16:00
        Booking::create([
            'booking_code' => 'KMP-TEST-001',
            'user_id' => $mahasiswa->id,
            'room_id' => $room->id,
            'booking_date' => $date,
            'start_time' => '14:00:00',
            'end_time' => '16:00:00',
            'duration_type' => 'hourly',
            'status' => 'confirmed',
        ]);

        // Attempt overlapping booking: 15:00 - 17:00
        $response = $this->actingAs($mahasiswa, 'sanctum')->postJson('/api/bookings', [
            'room_id' => $room->id,
            'booking_date' => $date,
            'duration_type' => 'hourly',
            'start_time' => '15:00',
            'end_time' => '17:00',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_aula_booking_requires_proposal_file()
    {
        $mahasiswa = User::where('role', 'mahasiswa')->first();
        $room = Room::where('name', 'Aula Utama Graha Nusantara Kampus')->first();

        // Attempt booking Aula without proposal
        $response = $this->actingAs($mahasiswa, 'sanctum')->postJson('/api/bookings', [
            'room_id' => $room->id,
            'booking_date' => now()->addDays(3)->format('Y-m-d'),
            'duration_type' => 'daily',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_mahasiswa_can_book_daily_with_proposal_for_aula()
    {
        Storage::fake('public');
        $mahasiswa = User::where('role', 'mahasiswa')->first();
        $room = Room::where('name', 'Aula Utama Graha Nusantara Kampus')->first();
        $date = now()->addDays(4)->format('Y-m-d');

        $file = UploadedFile::fake()->create('proposal_kegiatan.pdf', 500, 'application/pdf');

        $response = $this->actingAs($mahasiswa, 'sanctum')->postJson('/api/bookings', [
            'room_id' => $room->id,
            'booking_date' => $date,
            'duration_type' => 'daily',
            'proposal_file' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        // Verify that on this date, room availability shows has_daily_booking = true and all slots are locked
        $availabilityResponse = $this->getJson("/api/rooms/{$room->id}/availability?date={$date}");
        $availabilityResponse->assertStatus(200)
            ->assertJsonPath('has_daily_booking', true);

        $slots = $availabilityResponse->json('slots');
        foreach ($slots as $slot) {
            $this->assertTrue($slot['is_booked']);
        }
    }

    public function test_user_can_register_new_account()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Ahmad Mahasiswa Baru',
            'email' => 'ahmad@kampus.test',
            'password' => 'secret123',
            'role' => 'mahasiswa',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'mahasiswa')
            ->assertJsonPath('data.user.booking_quota', 5);

        $this->assertDatabaseHas('users', ['email' => 'ahmad@kampus.test']);
    }

    public function test_admin_can_access_dashboard_stats_and_manage_bookings()
    {
        $admin = User::where('role', 'admin')->first();
        $this->assertNotNull($admin);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/stats');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'total_users',
                    'total_rooms',
                    'active_rooms',
                    'total_bookings',
                    'confirmed_bookings',
                    'today_bookings',
                ]
            ]);
    }

    public function test_user_can_cancel_own_booking_and_recover_quota()
    {
        $mahasiswa = User::where('role', 'mahasiswa')->first();
        $room = Room::first();
        $initialQuota = $mahasiswa->booking_quota;

        $booking = Booking::create([
            'booking_code' => 'KMP-CANCEL-001',
            'user_id' => $mahasiswa->id,
            'room_id' => $room->id,
            'booking_date' => now()->addDays(3)->format('Y-m-d'),
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
            'duration_type' => 'hourly',
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($mahasiswa, 'sanctum')->patchJson("/api/bookings/{$booking->id}/cancel");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.booking.status', 'cancelled')
            ->assertJsonPath('data.remaining_quota', $initialQuota + 1);

        $this->assertEquals('cancelled', $booking->fresh()->status);
        $this->assertEquals($initialQuota + 1, $mahasiswa->fresh()->booking_quota);
    }

    public function test_registration_fails_if_password_confirmation_mismatches()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Budi Santoso',
            'email' => 'budi.mismatch@kampus.test',
            'password' => 'secret123',
            'password_confirmation' => 'different456',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_non_admin_cannot_access_admin_stats()
    {
        $mahasiswa = User::where('role', 'mahasiswa')->first();

        $response = $this->actingAs($mahasiswa, 'sanctum')->getJson('/api/admin/stats');
        $response->assertStatus(403);
    }

    public function test_admin_cannot_book_rooms()
    {
        $admin = User::where('role', 'admin')->first();
        $room = Room::first();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/bookings', [
            'room_id' => $room->id,
            'booking_date' => now()->addDay()->format('Y-m-d'),
            'duration_type' => 'hourly',
            'start_time' => '14:00',
            'end_time' => '15:00',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_admin_can_manage_users_crud()
    {
        $admin = User::where('role', 'admin')->first();

        // 1. List users
        $listRes = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/users');
        $listRes->assertStatus(200)
            ->assertJsonPath('success', true);

        // 2. Create user
        $createRes = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/users', [
            'name' => 'Fulan Mahasiswa',
            'email' => 'fulan@kumpulin.test',
            'password' => 'secret123',
            'role' => 'mahasiswa',
            'booking_quota' => 5,
        ]);
        $createRes->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'fulan@kumpulin.test');

        $userId = $createRes->json('data.id');

        // 3. Update user
        $updateRes = $this->actingAs($admin, 'sanctum')->patchJson("/api/admin/users/{$userId}", [
            'name' => 'Fulan Mahasiswa Update',
            'booking_quota' => 7,
        ]);
        $updateRes->assertStatus(200)
            ->assertJsonPath('data.name', 'Fulan Mahasiswa Update')
            ->assertJsonPath('data.booking_quota', 7);

        // 4. Delete user
        $deleteRes = $this->actingAs($admin, 'sanctum')->deleteJson("/api/admin/users/{$userId}");
        $deleteRes->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertNull(User::find($userId));
    }

    public function test_admin_cannot_delete_self()
    {
        $admin = User::where('role', 'admin')->first();

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/admin/users/{$admin->id}");
        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }
}
