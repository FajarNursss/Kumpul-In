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
        $response = $this->getJson('/api/rooms?category=Meeting Pod');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    public function test_can_check_room_availability_including_seeded_booking()
    {
        $meetingPod = Room::where('name', 'Meeting Pod Alpha')->first();
        $today = now()->format('Y-m-d');

        $response = $this->getJson("/api/rooms/{$meetingPod->id}/availability?date={$today}");
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
        $response = $this->postJson('/api/auth/quick-login', ['role' => 'member']);
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'role', 'booking_quota'],
                    'token',
                ]
            ]);
    }

    public function test_member_can_create_hourly_booking_and_quota_decrements()
    {
        $member = User::where('role', 'member')->first();
        $room = Room::where('name', 'Meeting Pod Alpha')->first();
        $initialQuota = $member->booking_quota;

        $response = $this->actingAs($member, 'sanctum')->postJson('/api/bookings', [
            'room_id' => $room->id,
            'booking_date' => now()->addDay()->format('Y-m-d'),
            'duration_type' => 'hourly',
            'start_time' => '13:00',
            'end_time' => '14:00',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.remaining_quota', $initialQuota - 1);

        $this->assertEquals($initialQuota - 1, $member->fresh()->booking_quota);
    }

    public function test_conflict_detection_prevents_double_booking()
    {
        $member = User::where('role', 'member')->first();
        $room = Room::where('name', 'Meeting Pod Alpha')->first();
        $date = now()->addDays(2)->format('Y-m-d');

        // First booking: 14:00 - 16:00
        Booking::create([
            'booking_code' => 'CHB-TEST-001',
            'user_id' => $member->id,
            'room_id' => $room->id,
            'booking_date' => $date,
            'start_time' => '14:00:00',
            'end_time' => '16:00:00',
            'duration_type' => 'hourly',
            'status' => 'confirmed',
        ]);

        // Attempt overlapping booking: 15:00 - 17:00
        $response = $this->actingAs($member, 'sanctum')->postJson('/api/bookings', [
            'room_id' => $room->id,
            'booking_date' => $date,
            'duration_type' => 'hourly',
            'start_time' => '15:00',
            'end_time' => '17:00',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_guest_cannot_book_daily()
    {
        $guest = User::where('role', 'guest')->first();
        $room = Room::where('name', 'Grand Hall Event Space')->first();

        $response = $this->actingAs($guest, 'sanctum')->postJson('/api/bookings', [
            'room_id' => $room->id,
            'booking_date' => now()->addDays(3)->format('Y-m-d'),
            'duration_type' => 'daily',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_member_can_book_daily_with_proposal_for_event_space()
    {
        Storage::fake('public');
        $member = User::where('role', 'member')->first();
        $room = Room::where('name', 'Grand Hall Event Space')->first();
        $date = now()->addDays(4)->format('Y-m-d');

        $file = UploadedFile::fake()->create('event_proposal.pdf', 500, 'application/pdf');

        $response = $this->actingAs($member, 'sanctum')->postJson('/api/bookings', [
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
            'name' => 'Ahmad Baru',
            'email' => 'ahmad@kumpulin.test',
            'password' => 'secret123',
            'role' => 'member',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'member')
            ->assertJsonPath('data.user.booking_quota', 5);

        $this->assertDatabaseHas('users', ['email' => 'ahmad@kumpulin.test']);
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

    public function test_non_admin_cannot_access_admin_stats()
    {
        $guest = User::where('role', 'guest')->first();

        $response = $this->actingAs($guest, 'sanctum')->getJson('/api/admin/stats');
        $response->assertStatus(403);
    }
}

