<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // Récupérer les notifications pour l'utilisateur connecté
    public function index()
    {
        $utilisateur = Auth::user();

        // Récupérer les notifications selon le type d'utilisateur
        if ($utilisateur->isClient()) {
            $notifications = Notification::where('id_client', $utilisateur->client->id)
                                        ->with('demande')
                                        ->orderBy('createdAt', 'desc')
                                        ->paginate(20);
        } elseif ($utilisateur->isDepanneur()) {
            $notifications = Notification::where('id_depanneur', $utilisateur->depanneur->id)
                                        ->with('demande')
                                        ->orderBy('createdAt', 'desc')
                                        ->paginate(20);
        } else {
            $notifications = collect(); // Admin n'a pas de notifications pour l'instant
        }

        return view('notifications.index', compact('notifications'));
    }

    // API: Récupérer les notifications pour le client (JSON)
    public function indexApi()
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $notifications = Notification::where('id_client', $utilisateur->client->id)
            ->orderBy('createdAt', 'desc')
            ->limit(20)
            ->get()
            ->map(fn($n) => [
                'id' => $n->id,
                'type' => $n->type,
                'titre' => $n->titre,
                'message' => $n->message,
                'isRead' => (bool) $n->isRead,
                'createdAt' => $n->createdAt->toIsoString(),
                'demande_id' => $n->id_demande,
            ]);

        return response()->json(['notifications' => $notifications]);
    }

    // API: Marquer une notification comme lue (JSON)
    public function markAsReadApi(Notification $notification)
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        // Vérifier que la notification appartient au client
        if ($utilisateur->isClient() && $notification->id_client !== $utilisateur->client->id) {
            return response()->json(['error' => 'Action non autorisée'], 403);
        }

        if ($utilisateur->isDepanneur() && $notification->id_depanneur !== $utilisateur->depanneur->id) {
            return response()->json(['error' => 'Action non autorisée'], 403);
        }

        $notification->update(['isRead' => true]);

        return response()->json(['success' => true, 'message' => 'Notification marquée comme lue']);
    }

    // API: Marquer toutes les notifications comme lues (JSON)
    public function markAllAsReadApi()
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if ($utilisateur->isClient()) {
            Notification::where('id_client', $utilisateur->client->id)
                ->where('isRead', false)
                ->update(['isRead' => true]);
        } elseif ($utilisateur->isDepanneur()) {
            Notification::where('id_depanneur', $utilisateur->depanneur->id)
                ->where('isRead', false)
                ->update(['isRead' => true]);
        }

        return response()->json(['success' => true, 'message' => 'Toutes les notifications ont été marquées comme lues']);
    }

    // API: Nombre de notifications non lues (JSON)
    public function unreadCountApi()
    {
        $utilisateur = Auth::user();

        if (!$utilisateur) {
            return response()->json(['count' => 0]);
        }

        if ($utilisateur->isClient()) {
            $count = Notification::where('id_client', $utilisateur->client->id)
                ->where('isRead', false)
                ->count();
        } elseif ($utilisateur->isDepanneur()) {
            $count = Notification::where('id_depanneur', $utilisateur->depanneur->id)
                ->where('isRead', false)
                ->count();
        } else {
            $count = 0;
        }

        return response()->json(['count' => $count]);
    }

   // Marquer une notification comme lue (web)
    public function markAsRead(Notification $notification)
    {
        // Vérifier que la notification appartient à l'utilisateur
        $utilisateur = Auth::user();
        
        if (($utilisateur->isClient() && $notification->id_client !== $utilisateur->client->id) ||
            ($utilisateur->isDepanneur() && $notification->id_depanneur !== $utilisateur->depanneur->id)) {
            abort(403, 'Action non autorisée.');
        }

        $notification->marquerCommeLue();

        return back()->with('success', 'Notification marquée comme lue.');
    }
// Marquer toutes les notifications comme lues
    public function markAllAsRead()
    {
        $utilisateur = Auth::user();

        if ($utilisateur->isClient()) {
            Notification::where('id_client', $utilisateur->client->id)
                       ->where('isRead', false)
                       ->update(['isRead' => true]);
        } elseif ($utilisateur->isDepanneur()) {
            Notification::where('id_depanneur', $utilisateur->depanneur->id)
                       ->where('isRead', false)
                       ->update(['isRead' => true]);
        }

        return back()->with('success', 'Toutes les notifications ont été marquées comme lues.');
    }

    // Supprimer une notification
    public function destroy(Notification $notification)
    {
        $utilisateur = Auth::user();
        
        if (($utilisateur->isClient() && $notification->id_client !== $utilisateur->client->id) ||
            ($utilisateur->isDepanneur() && $notification->id_depanneur !== $utilisateur->depanneur->id)) {
            abort(403, 'Action non autorisée.');
        }

        $notification->delete();

        return back()->with('success', 'Notification supprimée.');
    }

    // Obtenir le nombre de notifications non lues pour l'utilisateur connecté
    public function unreadCount()
    {
        $utilisateur = Auth::user();

        if ($utilisateur->isClient()) {
            $count = Notification::where('id_client', $utilisateur->client->id)
                                ->where('isRead', false)
                                ->count();
        } elseif ($utilisateur->isDepanneur()) {
            $count = Notification::where('id_depanneur', $utilisateur->depanneur->id)
                                ->where('isRead', false)
                                ->count();
        } else {
            $count = 0;
        }

        return response()->json(['count' => $count]);
    }
}
