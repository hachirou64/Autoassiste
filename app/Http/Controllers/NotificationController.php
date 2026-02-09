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
        $utilisateur = Auth::utilisateur();

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

   // Marquer une notification comme lue
    public function markAsRead(Notification $notification)
    {
        // Vérifier que la notification appartient à l'utilisateur
        $utilisateur = Auth::utilisateur();
        
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
        $utilisateur = Auth::utilisateur();

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
        $utilisateur = Auth::utilisateur();

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