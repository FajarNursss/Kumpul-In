<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_code',
        'user_id',
        'room_id',
        'booking_date',
        'start_time',
        'end_time',
        'duration_type',
        'proposal_path',
        'status',
        'rejection_reason',
        'checked_in_at',
        'checkin_token',
        'recurring_group_id',
        'rescheduled_at',
    ];

    protected function casts(): array
    {
        return [
            'booking_date' => 'date:Y-m-d',
            'checked_in_at' => 'datetime',
            'rescheduled_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}

