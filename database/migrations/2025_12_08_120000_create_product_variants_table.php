<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('color'); // e.g., "Hijau", "Merah"
            $table->string('color_hex')->nullable(); // e.g., "#00ff00"
            $table->string('size')->nullable(); // e.g., "M", "L", "XL"
            $table->integer('stock')->default(0);
            $table->decimal('price_adjustment', 12, 2)->default(0); // e.g., +10000 for XL
            $table->string('sku')->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Unique constraint: each color+size combo per product should be unique
            $table->unique(['product_id', 'color', 'size'], 'product_variant_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
