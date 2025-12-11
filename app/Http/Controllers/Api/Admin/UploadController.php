<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class UploadController extends Controller
{
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // Max 5MB before compression
            'folder' => 'nullable|string|in:products,categories,variants',
        ]);

        $folder = $request->get('folder', 'products');
        $file = $request->file('image');

        // Generate unique filename with .webp extension
        $filename = Str::random(20) . '.webp';

        // Create image manager with GD driver
        $manager = new ImageManager(new Driver());

        // Read and optimize image
        $image = $manager->read($file->getRealPath());

        // Resize if too large (max 1200px width, maintain aspect ratio)
        if ($image->width() > 1200) {
            $image->scale(width: 1200);
        }

        // Convert to WebP and compress (quality 80%)
        $encodedImage = $image->toWebp(quality: 80);

        // Store the optimized image
        $path = $folder . '/' . $filename;
        Storage::disk('public')->put($path, $encodedImage);

        // Generate full URL with domain
        $url = url(Storage::url($path));

        return response()->json([
            'message' => 'Image uploaded and optimized successfully',
            'url' => $url,
            'path' => $path,
        ]);
    }

    public function deleteImage(Request $request): JsonResponse
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->path;

        // Remove leading /storage/ if present
        $path = str_replace('/storage/', '', $path);

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            return response()->json(['message' => 'Image deleted successfully']);
        }

        return response()->json(['message' => 'Image not found'], 404);
    }
}
