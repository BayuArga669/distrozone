<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'image',
        'images',
        'color',
        'is_active',
        'is_featured',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'images' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function getPriceFormattedAttribute(): string
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get total stock from all variants
     */
    public function getTotalStockAttribute(): int
    {
        if ($this->variants()->exists()) {
            return $this->variants()->active()->sum('stock');
        }
        return $this->stock ?? 0;
    }

    /**
     * Get all available colors from variants
     */
    public function getAvailableColorsAttribute(): array
    {
        return $this->variants()
            ->active()
            ->select('color', 'color_hex')
            ->distinct()
            ->get()
            ->map(fn($v) => ['name' => $v->color, 'hex' => $v->color_hex])
            ->toArray();
    }

    /**
     * Get available sizes for a specific color
     */
    public function getSizesForColor(string $color): array
    {
        return $this->variants()
            ->active()
            ->where('color', $color)
            ->select('size', 'stock', 'price_adjustment')
            ->get()
            ->toArray();
    }

    /**
     * Check if product has variants
     */
    public function hasVariants(): bool
    {
        return $this->variants()->exists();
    }
}

