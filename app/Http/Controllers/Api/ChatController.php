<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\ChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Get or create user's active chat
     */
    public function getOrCreate(Request $request): JsonResponse
    {
        $chat = Chat::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'status' => 'open',
            ],
            [
                'last_message_at' => now(),
            ]
        );

        $chat->load(['messages.sender', 'admin']);

        return response()->json([
            'data' => $chat,
            'unread_count' => $chat->unreadMessagesCount(),
        ]);
    }

    /**
     * Get chat details
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $chat = Chat::with(['messages.sender', 'admin'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        // Mark admin messages as read
        ChatMessage::where('chat_id', $chat->id)
            ->where('sender_type', 'admin')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'data' => $chat,
        ]);
    }

    /**
     * Send a message
     */
    public function sendMessage(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'message' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if (!$request->message && !$request->hasFile('image')) {
            return response()->json(['message' => 'Message or image is required'], 422);
        }

        $chat = Chat::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $cloudinaryUrl = env('CLOUDINARY_URL');

            if ($cloudinaryUrl && str_contains($cloudinaryUrl, 'cloudinary://')) {
                // Upload to Cloudinary
                preg_match('/cloudinary:\/\/([^:]+):([^@]+)@(.+)/', $cloudinaryUrl, $matches);
                if (count($matches) === 4) {
                    \Cloudinary\Configuration\Configuration::instance([
                        'cloud' => [
                            'cloud_name' => $matches[3],
                            'api_key' => $matches[1],
                            'api_secret' => $matches[2]
                        ],
                        'url' => ['secure' => true]
                    ]);

                    $uploadApi = new \Cloudinary\Api\Upload\UploadApi();
                    $result = $uploadApi->upload($file->getRealPath(), [
                        'folder' => 'distrozone/chats',
                        'format' => 'webp',
                        'quality' => 'auto:good',
                        'transformation' => [['width' => 800, 'crop' => 'limit']]
                    ]);
                    $imageUrl = $result['secure_url'];
                }
            } else {
                // Fallback local storage
                $filename = uniqid() . '.webp';
                $file->storeAs('chats', $filename, 'public');
                $imageUrl = '/storage/chats/' . $filename;
            }
        }

        $message = ChatMessage::create([
            'chat_id' => $chat->id,
            'sender_id' => $request->user()->id,
            'sender_type' => 'customer',
            'message' => $request->message ?? '',
            'image' => $imageUrl,
        ]);

        $chat->update(['last_message_at' => now()]);

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $message->load('sender'),
        ], 201);
    }

    /**
     * Get unread messages count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $chat = Chat::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        $count = $chat ? $chat->unreadMessagesCount() : 0;

        return response()->json([
            'unread_count' => $count,
        ]);
    }
}
