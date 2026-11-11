<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Booking;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    /**
     * Display a listing of rooms with optional filters.
     */
    public function index(Request $request)
    {
        $query = Room::where('is_active', true);

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('min_capacity')) {
            $query->where('capacity', '>=', (int) $request->input('min_capacity'));
        }

        $rooms = $query->orderBy('capacity', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $rooms,
        ]);
    }

    /**
     * Get availability slots for a specific room and date.
     */
    public function availability(Request $request, $id)
    {
        $room = Room::findOrFail($id);
        $date = $request->query('date', now()->format('Y-m-d'));

        // Standard operational slots: 08:00 - 18:00
        $standardSlots = [
            ['start' => '08:00:00', 'end' => '09:00:00', 'label' => '08:00 - 09:00'],
            ['start' => '09:00:00', 'end' => '10:00:00', 'label' => '09:00 - 10:00'],
            ['start' => '10:00:00', 'end' => '11:00:00', 'label' => '10:00 - 11:00'],
            ['start' => '11:00:00', 'end' => '12:00:00', 'label' => '11:00 - 12:00'],
            ['start' => '12:00:00', 'end' => '13:00:00', 'label' => '12:00 - 13:00'],
            ['start' => '13:00:00', 'end' => '14:00:00', 'label' => '13:00 - 14:00'],
            ['start' => '14:00:00', 'end' => '15:00:00', 'label' => '14:00 - 15:00'],
            ['start' => '15:00:00', 'end' => '16:00:00', 'label' => '15:00 - 16:00'],
            ['start' => '16:00:00', 'end' => '17:00:00', 'label' => '16:00 - 17:00'],
            ['start' => '17:00:00', 'end' => '18:00:00', 'label' => '17:00 - 18:00'],
        ];

        // Retrieve all active bookings on this room and date (confirmed or pending approval)
        $bookings = Booking::where('room_id', $room->id)
            ->whereDate('booking_date', $date)
            ->whereIn('status', ['confirmed', 'pending'])
            ->get();

        // Check if there is any daily booking on this date
        $dailyBooking = $bookings->firstWhere('duration_type', 'daily');

        $slots = [];
        foreach ($standardSlots as $slot) {
            $isBooked = false;
            $bookingCode = null;

            if ($dailyBooking) {
                // If a daily booking exists, the entire day is locked
                $isBooked = true;
                $bookingCode = $dailyBooking->booking_code;
            } else {
                // Check hourly conflict: (slot.start < booking.end) AND (slot.end > booking.start)
                foreach ($bookings as $b) {
                    $bStart = strlen($b->start_time) === 5 ? $b->start_time . ':00' : $b->start_time;
                    $bEnd = strlen($b->end_time) === 5 ? $b->end_time . ':00' : $b->end_time;
                    if ($slot['start'] < $bEnd && $slot['end'] > $bStart) {
                        $isBooked = true;
                        $bookingCode = $b->booking_code;
                        break;
                    }
                }
            }

            $slots[] = [
                'time' => $slot['label'],
                'start_time' => $slot['start'],
                'end_time' => $slot['end'],
                'is_booked' => $isBooked,
                'booking_code' => $bookingCode,
            ];
        }

        return response()->json([
            'success' => true,
            'date' => $date,
            'room_id' => $room->id,
            'has_daily_booking' => (bool) $dailyBooking,
            'slots' => $slots,
        ]);
    }
}
