<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('midtrans_transaction_id')->nullable();
            $table->string('payment_type')->nullable();
            $table->enum('status', [
                'pending',
                'success',
                'failed',
                'expired',
                'challenge'
            ])->default('pending');
            $table->decimal('amount', 12, 2);
            $table->string('snap_token')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
