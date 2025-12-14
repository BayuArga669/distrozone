<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class UploadController extends Controller
{
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // Max 5MB
            'folder' => 'nullable|string|in:products,categories,variants,posts',
        ]);

        $folder = $request->get('folder', 'products');
        $file = $request->file('image');

        try {
            $cloudinaryUrl = env('CLOUDINARY_URL');

            // Check if Cloudinary is configured
            if ($cloudinaryUrl && str_contains($cloudinaryUrl, 'cloudinary://')) {
                // Parse CLOUDINARY_URL
                // Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
                preg_match('/cloudinary:\/\/([^:]+):([^@]+)@(.+)/', $cloudinaryUrl, $matches);

                if (count($matches) !== 4) {
                    throw new \Exception('Invalid CLOUDINARY_URL format');
                }

                $apiKey = $matches[1];
                $apiSecret = $matches[2];
                $cloudName = $matches[3];

                // Configure Cloudinary
                \Cloudinary\Configuration\Configuration::instance([
                    'cloud' => [
                        'cloud_name' => $cloudName,
                        'api_key' => $apiKey,
                        'api_secret' => $apiSecret
                    ],
                    'url' => [
                        'secure' => true
                    ]
                ]);

                // Upload to Cloudinary
                $uploadApi = new \Cloudinary\Api\Upload\UploadApi();
                $result = $uploadApi->upload($file->getRealPath(), [
                    'folder' => 'distrozone/' . $folder,
                    'format' => 'webp',
                    'quality' => 'auto:good',
                    'transformation' => [
                        ['width' => 1200, 'crop' => 'limit']
                    ]
                ]);

                $secureUrl = $result['secure_url'];

                return response()->json([
                    'message' => 'Image uploaded successfully',
                    'url' => $secureUrl,
                    'path' => $secureUrl,
                ]);
            } else {
                // Fallback to local storage (for development)
                $filename = Str::random(20) . '.' . $file->getClientOriginalExtension();
                $path = $folder . '/' . $filename;

                $file->storeAs($folder, $filename, 'public');
                $url = url(Storage::url($path));

                return response()->json([
                    'message' => 'Image uploaded successfully (local)',
                    'url' => $url,
                    'path' => '/storage/' . $path,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Upload error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to upload: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function deleteImage(Request $request): JsonResponse
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->path;

        try {
            // Check if it's a Cloudinary URL
            if (str_contains($path, 'cloudinary.com')) {
                $cloudinaryUrl = env('CLOUDINARY_URL');

                if ($cloudinaryUrl) {
                    preg_match('/cloudinary:\/\/([^:]+):([^@]+)@(.+)/', $cloudinaryUrl, $matches);

                    if (count($matches) === 4) {
                        \Cloudinary\Configuration\Configuration::instance([
                            'cloud' => [
                                'cloud_name' => $matches[3],
                                'api_key' => $matches[1],
                                'api_secret' => $matches[2]
                            ]
                        ]);

                        // Extract public_id from URL
                        preg_match('/\/distrozone\/[^\/]+\/([^\.]+)/', $path, $urlMatches);
                        if (isset($urlMatches[1])) {
                            $publicId = 'distrozone/' . $folder . '/' . $urlMatches[1];
                            $uploadApi = new \Cloudinary\Api\Upload\UploadApi();
                            $uploadApi->destroy($publicId);
                        }
                    }
                }
                return response()->json(['message' => 'Image deleted successfully']);
            }

            // Fallback: Local storage delete
            $path = str_replace('/storage/', '', $path);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
                return response()->json(['message' => 'Image deleted successfully']);
            }

            return response()->json(['message' => 'Image not found'], 404);
        } catch (\Exception $e) {
            Log::error('Delete error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete: ' . $e->getMessage(),
            ], 500);
        }
    }
}
