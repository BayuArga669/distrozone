<?php

namespace App\Services;

class ShippingService
{
    /**
     * Shipping rates per kg by region
     */
    private const RATES = [
        // Jabodetabek
        'jakarta' => 24000,
        'jakarta pusat' => 24000,
        'jakarta utara' => 24000,
        'jakarta selatan' => 24000,
        'jakarta barat' => 24000,
        'jakarta timur' => 24000,
        'depok' => 24000,
        'bekasi' => 25000,
        'tangerang' => 25000,
        'tangerang selatan' => 25000,
        'bogor' => 27000,

        // Jawa Barat (default for cities in Jawa Barat)
        'bandung' => 31000,
        'cirebon' => 31000,
        'sukabumi' => 31000,
        'tasikmalaya' => 31000,
        'karawang' => 31000,
        'subang' => 31000,
        'purwakarta' => 31000,
        'cianjur' => 31000,
        'garut' => 31000,
        'sumedang' => 31000,
        'majalengka' => 31000,
        'indramayu' => 31000,
        'kuningan' => 31000,
        'ciamis' => 31000,
        'pangandaran' => 31000,
        'banjar' => 31000,

        // Jawa Tengah
        'semarang' => 39000,
        'solo' => 39000,
        'surakarta' => 39000,
        'pekalongan' => 39000,
        'tegal' => 39000,
        'magelang' => 39000,
        'salatiga' => 39000,
        'purwokerto' => 39000,
        'cilacap' => 39000,
        'kebumen' => 39000,
        'purworejo' => 39000,
        'wonosobo' => 39000,
        'temanggung' => 39000,
        'kendal' => 39000,
        'demak' => 39000,
        'kudus' => 39000,
        'jepara' => 39000,
        'pati' => 39000,
        'rembang' => 39000,
        'blora' => 39000,
        'grobogan' => 39000,
        'sragen' => 39000,
        'karanganyar' => 39000,
        'boyolali' => 39000,
        'klaten' => 39000,
        'sukoharjo' => 39000,
        'wonogiri' => 39000,
        'batang' => 39000,
        'pemalang' => 39000,
        'brebes' => 39000,
        'banjarnegara' => 39000,

        // Jawa Timur
        'surabaya' => 47000,
        'malang' => 47000,
        'sidoarjo' => 47000,
        'gresik' => 47000,
        'mojokerto' => 47000,
        'pasuruan' => 47000,
        'probolinggo' => 47000,
        'lumajang' => 47000,
        'jember' => 47000,
        'banyuwangi' => 47000,
        'bondowoso' => 47000,
        'situbondo' => 47000,
        'kediri' => 47000,
        'blitar' => 47000,
        'tulungagung' => 47000,
        'trenggalek' => 47000,
        'nganjuk' => 47000,
        'madiun' => 47000,
        'magetan' => 47000,
        'ngawi' => 47000,
        'ponorogo' => 47000,
        'pacitan' => 47000,
        'bojonegoro' => 47000,
        'tuban' => 47000,
        'lamongan' => 47000,
        'bangkalan' => 47000,
        'sampang' => 47000,
        'pamekasan' => 47000,
        'sumenep' => 47000,
        'jombang' => 47000,

        // DI Yogyakarta (same rate as Jawa Tengah)
        'yogyakarta' => 39000,
        'sleman' => 39000,
        'bantul' => 39000,
        'gunungkidul' => 39000,
        'kulonprogo' => 39000,
    ];

    /**
     * Province-based rates (fallback)
     */
    private const PROVINCE_RATES = [
        'jawa barat' => 31000,
        'jawa tengah' => 39000,
        'jawa timur' => 47000,
        'dki jakarta' => 24000,
        'banten' => 25000,
        'di yogyakarta' => 39000,
        'daerah istimewa yogyakarta' => 39000,
    ];

    /**
     * Items per kg (3 kaos = 1 kg)
     */
    private const ITEMS_PER_KG = 3;

    /**
     * Calculate shipping cost
     * 
     * @param string $city City name
     * @param string|null $province Province name (optional fallback)
     * @param int $itemCount Number of items in cart
     * @return array
     */
    public function calculateShipping(string $city, ?string $province = null, int $itemCount = 1): array
    {
        $city = strtolower(trim($city));
        $province = $province ? strtolower(trim($province)) : null;

        // Check if city is in our service area
        $ratePerKg = $this->getRateForCity($city, $province);

        if ($ratePerKg === null) {
            return [
                'success' => false,
                'message' => 'Maaf, kami tidak melayani pengiriman ke wilayah di luar Pulau Jawa',
                'shipping_cost' => 0,
                'weight_kg' => 0,
                'rate_per_kg' => 0,
            ];
        }

        // Calculate weight: ceil(itemCount / 3) kg
        // Less than 3 items = 1 kg, 4-6 items = 2 kg, etc.
        $weightKg = ceil($itemCount / self::ITEMS_PER_KG);

        $shippingCost = $weightKg * $ratePerKg;

        return [
            'success' => true,
            'message' => 'Ongkos kirim berhasil dihitung',
            'shipping_cost' => $shippingCost,
            'weight_kg' => $weightKg,
            'rate_per_kg' => $ratePerKg,
            'city' => $city,
        ];
    }

    /**
     * Get shipping rate for a city
     */
    private function getRateForCity(string $city, ?string $province): ?int
    {
        // Direct city match
        if (isset(self::RATES[$city])) {
            return self::RATES[$city];
        }

        // Try partial match for city
        foreach (self::RATES as $key => $rate) {
            if (str_contains($city, $key) || str_contains($key, $city)) {
                return $rate;
            }
        }

        // Province fallback
        if ($province) {
            if (isset(self::PROVINCE_RATES[$province])) {
                return self::PROVINCE_RATES[$province];
            }

            // Try partial match for province
            foreach (self::PROVINCE_RATES as $key => $rate) {
                if (str_contains($province, $key) || str_contains($key, $province)) {
                    return $rate;
                }
            }
        }

        // Not in service area
        return null;
    }

    /**
     * Get all available shipping regions for frontend
     */
    public function getAvailableRegions(): array
    {
        return [
            [
                'name' => 'Jakarta',
                'cities' => ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur'],
                'rate' => 24000,
            ],
            [
                'name' => 'Depok',
                'cities' => ['Depok'],
                'rate' => 24000,
            ],
            [
                'name' => 'Bekasi',
                'cities' => ['Bekasi'],
                'rate' => 25000,
            ],
            [
                'name' => 'Tangerang',
                'cities' => ['Tangerang', 'Tangerang Selatan'],
                'rate' => 25000,
            ],
            [
                'name' => 'Bogor',
                'cities' => ['Bogor'],
                'rate' => 27000,
            ],
            [
                'name' => 'Jawa Barat',
                'cities' => ['Bandung', 'Cirebon', 'Sukabumi', 'Tasikmalaya', 'dll.'],
                'rate' => 31000,
            ],
            [
                'name' => 'Jawa Tengah',
                'cities' => ['Semarang', 'Solo', 'Pekalongan', 'Magelang', 'dll.'],
                'rate' => 39000,
            ],
            [
                'name' => 'Jawa Timur',
                'cities' => ['Surabaya', 'Malang', 'Sidoarjo', 'Kediri', 'dll.'],
                'rate' => 47000,
            ],
        ];
    }
}
