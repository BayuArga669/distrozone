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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, boolean, json
            $table->string('group')->default('general'); // general, midtrans, etc
            $table->timestamps();
        });

        // Insert default Midtrans settings
        $settings = [
            ['key' => 'midtrans_server_key', 'value' => '', 'type' => 'string', 'group' => 'midtrans'],
            ['key' => 'midtrans_client_key', 'value' => '', 'type' => 'string', 'group' => 'midtrans'],
            ['key' => 'midtrans_is_production', 'value' => 'false', 'type' => 'boolean', 'group' => 'midtrans'],
            ['key' => 'midtrans_is_sanitized', 'value' => 'true', 'type' => 'boolean', 'group' => 'midtrans'],
            ['key' => 'midtrans_is_3ds', 'value' => 'true', 'type' => 'boolean', 'group' => 'midtrans'],
        ];

        foreach ($settings as $setting) {
            \DB::table('settings')->insert(array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
