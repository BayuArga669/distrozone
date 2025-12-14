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
        'cost_price',
        'stock',
        'image',
        'images',
        'color',
        'gender',
        'is_active',
        'is_featured',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
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

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('is_approved', true);
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
        return 'Rp ' . number_format((float) $this->price, 0, ',', '.');
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

    /**
     * Get average rating from approved reviews
     */
    public function getAverageRatingAttribute(): float
    {
        return round($this->approvedReviews()->avg('rating') ?? 0, 1);
    }

    /**
     * Get total count of approved reviews
     */
    public function getTotalReviewsAttribute(): int
    {
        return $this->approvedReviews()->count();
    }

    /**
     * Get rating distribution (count of each star rating)
     */
    public function getRatingDistributionAttribute(): array
    {
        $distribution = [];
        for ($i = 5; $i >= 1; $i--) {
            $distribution[$i] = $this->approvedReviews()->where('rating', $i)->count();
        }
        return $distribution;
    }

    /**
     * Get percentage distribution of ratings
     */
    public function getRatingPercentagesAttribute(): array
    {
        $total = $this->total_reviews;
        if ($total === 0) {
            return [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];
        }

        $percentages = [];
        foreach ($this->rating_distribution as $rating => $count) {
            $percentages[$rating] = round(($count / $total) * 100);
        }
        return $percentages;
    }
}

