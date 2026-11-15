<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->text('rejection_reason')->nullable()->after('status');
            $table->timestamp('checked_in_at')->nullable()->after('rejection_reason');
            $table->string('checkin_token', 64)->nullable()->after('checked_in_at')->index();
            $table->string('recurring_group_id', 64)->nullable()->after('checkin_token')->index();
            $table->timestamp('rescheduled_at')->nullable()->after('recurring_group_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['checkin_token']);
            $table->dropIndex(['recurring_group_id']);
            $table->dropColumn([
                'rejection_reason',
                'checked_in_at',
                'checkin_token',
                'recurring_group_id',
                'rescheduled_at',
            ]);
        });
    }
};
