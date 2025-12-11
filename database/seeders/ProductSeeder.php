<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // T-Shirts
            [
                'category_slug' => 't-shirts',
                'name' => 'Urban Oversized Tee',
                'description' => 'Kaos oversized dengan bahan katun premium 24s. Nyaman dipakai sehari-hari dengan potongan modern.',
                'price' => 149000,
                'stock' => 50,
                'color' => '#cbd5e1',
                'is_featured' => true,
            ],
            [
                'category_slug' => 't-shirts',
                'name' => 'Basic White Tee',
                'description' => 'Kaos putih basic yang wajib ada di lemari. Bahan katun combed 30s.',
                'price' => 99000,
                'stock' => 100,
                'color' => '#f8fafc',
                'is_featured' => false,
            ],
            [
                'category_slug' => 't-shirts',
                'name' => 'Graphic Street Tee',
                'description' => 'Kaos dengan desain grafis streetwear eksklusif. Limited edition.',
                'price' => 179000,
                'stock' => 30,
                'color' => '#1e293b',
                'is_featured' => true,
            ],
            // Pants
            [
                'category_slug' => 'pants',
                'name' => 'Cargo Joggers',
                'description' => 'Celana jogger dengan kantong cargo fungsional. Bahan twill stretch.',
                'price' => 299000,
                'stock' => 40,
                'color' => '#94a3b8',
                'is_featured' => true,
            ],
            [
                'category_slug' => 'pants',
                'name' => 'Slim Chino Pants',
                'description' => 'Celana chino slim fit untuk tampilan semi-formal.',
                'price' => 279000,
                'stock' => 35,
                'color' => '#78716c',
                'is_featured' => false,
            ],
            // Outerwear
            [
                'category_slug' => 'outerwear',
                'name' => 'Tech Runner Jacket',
                'description' => 'Jaket runner dengan bahan tech fabric water-resistant. Ringan dan breathable.',
                'price' => 499000,
                'stock' => 25,
                'color' => '#64748b',
                'is_featured' => true,
            ],
            [
                'category_slug' => 'outerwear',
                'name' => 'Denim Jacket',
                'description' => 'Jaket denim klasik dengan wash vintage. Timeless piece.',
                'price' => 549000,
                'stock' => 20,
                'color' => '#1e293b',
                'is_featured' => false,
            ],
            // Accessories
            [
                'category_slug' => 'accessories',
                'name' => 'Street Bucket Hat',
                'description' => 'Topi bucket dengan bordir logo eksklusif. One size fits most.',
                'price' => 89000,
                'stock' => 60,
                'color' => '#475569',
                'is_featured' => true,
            ],
            [
                'category_slug' => 'accessories',
                'name' => 'Canvas Tote Bag',
                'description' => 'Tote bag kanvas tebal dengan print minimalis.',
                'price' => 129000,
                'stock' => 45,
                'color' => '#e2e8f0',
                'is_featured' => false,
            ],
            // Hoodies
            [
                'category_slug' => 'hoodies',
                'name' => 'Graphic Hoodie',
                'description' => 'Hoodie dengan desain grafis statement. Bahan fleece premium 280gsm.',
                'price' => 349000,
                'stock' => 30,
                'color' => '#334155',
                'is_featured' => true,
            ],
            [
                'category_slug' => 'hoodies',
                'name' => 'Oversized Zip Hoodie',
                'description' => 'Hoodie zip dengan potongan oversized. Super comfy.',
                'price' => 389000,
                'stock' => 25,
                'color' => '#0f172a',
                'is_featured' => false,
            ],
            // Shorts
            [
                'category_slug' => 'shorts',
                'name' => 'Chino Shorts',
                'description' => 'Celana pendek chino untuk cuaca panas. Casual dan versatile.',
                'price' => 199000,
                'stock' => 45,
                'color' => '#e2e8f0',
                'is_featured' => false,
            ],
        ];

        foreach ($products as $productData) {
            $category = Category::where('slug', $productData['category_slug'])->first();

            if ($category) {
                Product::create([
                    'category_id' => $category->id,
                    'name' => $productData['name'],
                    'slug' => Str::slug($productData['name']),
                    'description' => $productData['description'],
                    'price' => $productData['price'],
                    'stock' => $productData['stock'],
                    'color' => $productData['color'],
                    'is_active' => true,
                    'is_featured' => $productData['is_featured'],
                ]);
            }
        }
    }
}

