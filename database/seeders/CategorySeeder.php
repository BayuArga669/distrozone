<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'T-Shirts',
                'slug' => 't-shirts',
                'description' => 'Koleksi kaos berkualitas tinggi dengan berbagai desain menarik',
                'is_active' => true,
            ],
            [
                'name' => 'Pants',
                'slug' => 'pants',
                'description' => 'Celana panjang dan jogger untuk gaya sehari-hari',
                'is_active' => true,
            ],
            [
                'name' => 'Outerwear',
                'slug' => 'outerwear',
                'description' => 'Jaket dan outer untuk melengkapi penampilanmu',
                'is_active' => true,
            ],
            [
                'name' => 'Accessories',
                'slug' => 'accessories',
                'description' => 'Aksesoris pelengkap gaya streetwear',
                'is_active' => true,
            ],
            [
                'name' => 'Hoodies',
                'slug' => 'hoodies',
                'description' => 'Hoodie nyaman untuk tampilan kasual',
                'is_active' => true,
            ],
            [
                'name' => 'Shorts',
                'slug' => 'shorts',
                'description' => 'Celana pendek untuk aktivitas santai',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
