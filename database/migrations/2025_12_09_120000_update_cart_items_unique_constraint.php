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
        // First, drop any existing duplicate entries (keep the first one)
        DB::statement('
            DELETE c1 FROM cart_items c1
            INNER JOIN cart_items c2 
            WHERE c1.id > c2.id 
            AND c1.cart_id = c2.cart_id 
            AND c1.product_id = c2.product_id
        ');

        Schema::table('cart_items', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['cart_id']);
            $table->dropForeign(['product_id']);

            // Drop the old unique constraint
            $table->dropUnique('cart_items_cart_id_product_id_unique');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            // Add new unique constraint including variant_id
            $table->unique(['cart_id', 'product_id', 'variant_id'], 'cart_items_cart_product_variant_unique');

            // Re-add foreign keys
            $table->foreign('cart_id')->references('id')->on('carts')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['cart_id']);
            $table->dropForeign(['product_id']);

            // Drop the new constraint
            $table->dropUnique('cart_items_cart_product_variant_unique');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            // Restore the old constraint
            $table->unique(['cart_id', 'product_id'], 'cart_items_cart_id_product_id_unique');

            // Re-add foreign keys
            $table->foreign('cart_id')->references('id')->on('carts')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }
};
