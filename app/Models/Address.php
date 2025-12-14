<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'label',
        'recipient_name',
        'phone',
        'address',
        'city',
        'province',
        'postal_code',
        'is_default'
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    /**
     * Get the user that owns the address.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get default address.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Boot method to handle default address logic.
     */
    protected static function boot()
    {
        parent::boot();

        // When creating a new address
        static::creating(function ($address) {
            // If this is the first address for the user, make it default
            $hasAddresses = static::where('user_id', $address->user_id)->exists();
            if (!$hasAddresses) {
                $address->is_default = true;
            }

            // If setting as default, unset other defaults
            if ($address->is_default) {
                static::where('user_id', $address->user_id)
                    ->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
            }
        });

        // When updating an address
        static::updating(function ($address) {
            // If setting as default, unset other defaults
            if ($address->is_default && $address->isDirty('is_default')) {
                static::where('user_id', $address->user_id)
                    ->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
            }
        });

        // Prevent deleting the last default address
        static::deleting(function ($address) {
            if ($address->is_default) {
                $otherAddresses = static::where('user_id', $address->user_id)
                    ->where('id', '!=', $address->id)
                    ->count();

                // If there are other addresses, set the first one as default
                if ($otherAddresses > 0) {
                    static::where('user_id', $address->user_id)
                        ->where('id', '!=', $address->id)
                        ->first()
                        ->update(['is_default' => true]);
                }
            }
        });
    }
}
