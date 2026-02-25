<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * Store a new contact message
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $contactMessage = ContactMessage::create([
            'name' => $request->name,
            'email' => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
            'status' => ContactMessage::STATUS_PENDING,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Message envoyé avec succès!',
            'data' => $contactMessage,
        ], 201);
    }

    /**
     * Get all contact messages (admin only)
     */
    public function index(): JsonResponse
    {
        $messages = ContactMessage::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    /**
     * Get pending messages count (admin only)
     */
    public function pendingCount(): JsonResponse
    {
        $count = ContactMessage::pending()->count();

        return response()->json([
            'success' => true,
            'count' => $count,
        ]);
    }

    /**
     * Mark a message as read (admin only)
     */
    public function markAsRead(int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Message marqué comme lu',
            'data' => $message,
        ]);
    }

    /**
     * Reply to a contact message (admin only)
     */
    public function reply(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'response' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $message = ContactMessage::findOrFail($id);
        $message->reply($request->response);

        // Here you could also send an email to the user with the response
        // Mail::to($message->email)->send(new ContactReply($message));

        return response()->json([
            'success' => true,
            'message' => 'Réponse envoyée avec succès!',
            'data' => $message,
        ]);
    }

    /**
     * Delete a contact message (admin only)
     */
    public function destroy(int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message supprimé avec succès!',
        ]);
    }
}

