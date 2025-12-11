<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class UploadController extends Controller
{
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // Max 5MB
            'folder' => 'nullable|string|in:products,categories,variants',
        ]);

        $folder = $request->get('folder', 'products');
        $file = $request->file('image');

        try {
            // Check if Cloudinary is configured
            if (config('cloudinary.cloud_url')) {
                // Upload to Cloudinary
                $uploadedFileUrl = Cloudinary::upload($file->getRealPath(), [
                    'folder' => 'distrozone/' . $folder,
                    'format' => 'webp',
                    'quality' => 'auto:good',
                    'fetch_format' => 'auto',
                    'transformation' => [
                        ['width' => 1200, 'crop' => 'limit']
                    ]
                ])->getSecurePath();

                return response()->json([
                    'message' => 'Image uploaded successfully',
                    'url' => $uploadedFileUrl,
                    'path' => $uploadedFileUrl,
                ]);
            } else {
                // Fallback to local storage (for development)
                $filename = Str::random(20) . '.webp';
                $path = $folder . '/' . $filename;

                // Simple store without optimization for fallback
                $file->storeAs($folder, $filename, 'public');
                $url = url(Storage::url($path));

                return response()->json([
                    'message' => 'Image uploaded successfully (local)',
                    'url' => $url,
                    'path' => '/storage/' . $path,
                ]);
            }
        } catch (\Exception $e) {
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
                // Extract public_id from Cloudinary URL
                preg_match('/\/distrozone\/(.+)\.\w+$/', $path, $matches);
                if (isset($matches[1])) {
                    $publicId = 'distrozone/' . $matches[1];
                    Cloudinary::destroy($publicId);
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
            return response()->json([
                'message' => 'Failed to delete: ' . $e->getMessage(),
            ], 500);
        }
    }
}
