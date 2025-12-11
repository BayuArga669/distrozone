<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index(['is_active', 'is_featured']);
            $table->index(['category_id', 'is_active']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->index('is_active');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['is_active', 'is_featured']);
            $table->dropIndex(['category_id', 'is_active']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'status']);
        });
    }
};
