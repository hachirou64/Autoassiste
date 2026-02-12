/**
 * Composant modal pour afficher les erreurs de session
 * Ce composant est séparé du hook car il contient du JSX
 */

interface SessionErrorModalProps {
    isOpen: boolean;
    error: string | null;
    onRetry?: () => void;
    onRedirect?: (path: string) => void;
}

export function SessionErrorModal({
    isOpen,
    error,
    onRetry,
    onRedirect,
}: SessionErrorModalProps) {
    if (!isOpen || !error) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Erreur de Session</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="flex gap-3">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
                        >
                            Réessayer
                        </button>
                    )}
                    {onRedirect && (
                        <button
                            onClick={() => onRedirect('/login')}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 rounded-lg transition"
                        >
                            Retour à la connexion
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
