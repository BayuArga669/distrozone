<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\ChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * List all chats
     */
    public function index(Request $request): JsonResponse
    {
        $query = Chat::with(['user', 'latestMessage', 'admin'])
            ->withCount([
                'messages as unread_count' => function ($q) {
                    $q->where('sender_type', 'customer')->where('is_read', false);
                }
            ])
            ->orderBy('last_message_at', 'desc');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $chats = $query->get();

        return response()->json([
            'data' => $chats,
        ]);
    }

    /**
     * Get chat details
     */
    public function show(int $id): JsonResponse
    {
        $chat = Chat::with(['user', 'messages.sender', 'admin'])->findOrFail($id);

        // Mark customer messages as read
        ChatMessage::where('chat_id', $chat->id)
            ->where('sender_type', 'customer')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'data' => $chat,
        ]);
    }

    /**
     * Reply to chat
     */
    public function reply(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'message' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if (!$request->message && !$request->hasFile('image')) {
            return response()->json(['message' => 'Message or image is required'], 422);
        }

        $chat = Chat::findOrFail($id);

        // Set admin_id if not set
        if (!$chat->admin_id) {
            $chat->update(['admin_id' => $request->user()->id]);
        }

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
            'sender_type' => 'admin',
            'message' => $request->message ?? '',
            'image' => $imageUrl,
        ]);

        $chat->update(['last_message_at' => now()]);

        return response()->json([
            'message' => 'Reply sent successfully',
            'data' => $message->load('sender'),
        ], 201);
    }

    /**
     * Close chat
     */
    public function close(int $id): JsonResponse
    {
        $chat = Chat::findOrFail($id);
        $chat->update(['status' => 'closed']);

        return response()->json([
            'message' => 'Chat closed successfully',
        ]);
    }

    /**
     * Get unread chats count
     */
    public function unreadCount(): JsonResponse
    {
        $count = Chat::where('status', 'open')
            ->whereHas('messages', function ($q) {
                $q->where('sender_type', 'customer')
                    ->where('is_read', false);
            })
            ->count();

        return response()->json([
            'unread_count' => $count,
        ]);
    }
}
