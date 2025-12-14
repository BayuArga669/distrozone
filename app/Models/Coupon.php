<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order',
        'max_uses',
        'used_count',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order' => 'decimal:2',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Check if coupon is valid for use
     */
    public function isValid(): bool
    {
        // Check if active
        if (!$this->is_active) {
            return false;
        }

        // Check if expired
        if ($this->expires_at && Carbon::now()->isAfter($this->expires_at)) {
            return false;
        }

        // Check usage limit
        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return false;
        }

        return true;
    }

    /**
     * Check if coupon can be applied to order amount
     */
    public function canBeUsed(float $orderAmount): bool
    {
        if (!$this->isValid()) {
            return false;
        }

        // Check minimum order requirement
        if ($orderAmount < $this->min_order) {
            return false;
        }

        return true;
    }

    /**
     * Calculate discount amount for given order total
     */
    public function calculateDiscount(float $orderAmount): float
    {
        if (!$this->canBeUsed($orderAmount)) {
            return 0;
        }

        if ($this->type === 'percentage') {
            $discount = ($orderAmount * $this->value) / 100;
            // Ensure discount doesn't exceed order amount
            return min($discount, $orderAmount);
        }

        // Fixed amount
        return min($this->value, $orderAmount);
    }

    /**
     * Increment usage count
     */
    public function incrementUsage(): void
    {
        $this->increment('used_count');
    }

    /**
     * Get relationship to orders
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
