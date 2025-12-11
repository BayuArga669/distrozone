<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify the status ENUM to include new values
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'unpaid', 'paid', 'expired', 'processing', 'shipped', 'completed', 'cancelled') DEFAULT 'unpaid'");

        // Update existing 'pending' orders to 'unpaid'
        DB::statement("UPDATE orders SET status = 'unpaid' WHERE status = 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert 'unpaid' back to 'pending'
        DB::statement("UPDATE orders SET status = 'pending' WHERE status = 'unpaid'");

        // Revert the ENUM
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'processing', 'paid', 'shipped', 'completed', 'cancelled') DEFAULT 'pending'");
    }
};
