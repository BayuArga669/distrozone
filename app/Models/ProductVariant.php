<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'color',
        'color_hex',
        'image',
        'size',
        'stock',
        'price_adjustment',
        'sku',
        'is_active',
    ];

    protected $casts = [
        'stock' => 'integer',
        'price_adjustment' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the product that owns this variant
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the final price (base price + adjustment)
     */
    public function getFinalPriceAttribute(): float
    {
        return $this->product->price + $this->price_adjustment;
    }

    /**
     * Check if variant is in stock
     */
    public function isInStock(): bool
    {
        return $this->stock > 0 && $this->is_active;
    }

    /**
     * Get formatted price adjustment
     */
    public function getPriceAdjustmentFormattedAttribute(): string
    {
        if ($this->price_adjustment > 0) {
            return '+Rp ' . number_format($this->price_adjustment, 0, ',', '.');
        } elseif ($this->price_adjustment < 0) {
            return '-Rp ' . number_format(abs($this->price_adjustment), 0, ',', '.');
        }
        return '';
    }

    /**
     * Scope for active variants
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for in-stock variants
     */
    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }
}
