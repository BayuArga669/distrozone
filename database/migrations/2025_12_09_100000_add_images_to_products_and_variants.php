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
        // Add images JSON column to products for multiple images
        Schema::table('products', function (Blueprint $table) {
            $table->json('images')->nullable()->after('image');
        });

        // Add image column to product_variants
        Schema::table('product_variants', function (Blueprint $table) {
            $table->string('image')->nullable()->after('color_hex');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('images');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('image');
        });
    }
};
