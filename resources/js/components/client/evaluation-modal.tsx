import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
    ArrowLeft, Loader2, Star, CheckCircle, Wrench, Clock
} from 'lucide-react';

interface InterventionInfo {
    id: number;
    codeDemande: string;
    typePanne: string;
    date: string;
    depanneur: {
        fullName: string;
        etablissement_name: string;
    };
}

interface EvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
    interventionId?: number;
    intervention?: InterventionInfo;
    alreadyEvaluated?: boolean;
}

export function EvaluationModal({ isOpen, onClose, interventionId, intervention, alreadyEvaluated }: EvaluationModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorSubmit, setErrorSubmit] = useState<string | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setComment('');
            setSuccess(false);
            setErrorSubmit(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (rating === 0) {
            setErrorSubmit('Veuillez sélectionner une note');
            return;
        }

        if (!interventionId) {
            setErrorSubmit('ID de intervention manquant');
            return;
        }

        setSubmitting(true);
        setErrorSubmit(null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            const response = await fetch(`/api/demandes/${interventionId}/evaluate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify({
                    rating,
                    comment,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(true);
                // Fermer après 2 secondes
                setTimeout(() => {
                    onClose();
                    router.visit('/client/dashboard');
                }, 2000);
            } else {
                setErrorSubmit(result.message || 'Erreur lors de l\'envoi de l\'évaluation');
            }
        } catch (err) {
            console.error('Erreur:', err);
            setErrorSubmit('Erreur de connexion. Veuillez réessayer.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!success) {
            setRating(0);
            setComment('');
            setSuccess(false);
            setErrorSubmit(null);
        }
        onClose();
    };

    // Si déjà évalué
    if (alreadyEvaluated && intervention) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-lg bg-white text-slate-900 border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            Évaluation déjà soumise
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                            Merci pour votre retour!
                        </DialogDescription>
                    </DialogHeader>

                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-slate-900">{intervention.codeDemande}</CardTitle>
                            <CardDescription className="text-slate-600">
                                {intervention.typePanne} - {intervention.depanneur?.etablissement_name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {new Date(intervention.date).toLocaleDateString('fr-FR')}
                                </div>
                                {intervention.depanneur && (
                                    <div className="flex items-center gap-1">
                                        <Wrench className="h-4 w-4" />
                                        {intervention.depanneur.fullName}
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <p className="text-green-700 font-medium">
                                    Vous avez déjà évalué cette intervention
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
                                onClick={handleClose}
                            >
                                Fermer
                            </Button>
                        </CardContent>
                    </Card>
                </DialogContent>
            </Dialog>
        );
    }

    // Loading state (no intervention data)
    if (!intervention) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-lg bg-white text-slate-900 border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            Évaluation
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <span className="ml-2 text-slate-600">Chargement...</span>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Success state
    if (success) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md bg-white text-slate-900 border-slate-200">
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-green-700 mb-2">Merci pour votre évaluation!</h2>
                        <p className="text-green-600 mb-4">
                            Votre feedback nous aide à améliorer notre service.
                        </p>
                        <Loader2 className="h-5 w-5 animate-spin text-green-500 mx-auto" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white text-slate-900 border-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900">
                        Évaluer l'intervention
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                        Comment avez-vous trouvé le service ?
                    </DialogDescription>
                </DialogHeader>

                {/* Intervention Info */}
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-slate-900">{intervention.codeDemande}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(intervention.date).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="flex items-center gap-1">
                                <Wrench className="h-4 w-4" />
                                {intervention.depanneur.fullName}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rating Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Stars */}
                    <div className="flex justify-center gap-2 py-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`h-10 w-10 ${
                                        star <= rating
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-slate-300 hover:text-yellow-200'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-slate-600 text-sm">
                        {rating === 1 && 'Très insatisfait'}
                        {rating === 2 && 'Insatisfait'}
                        {rating === 3 && 'Neutre'}
                        {rating === 4 && 'Satisfait'}
                        {rating === 5 && 'Très satisfait'}
                        {rating === 0 && 'Cliquez pour noter'}
                    </p>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="comment" className="text-slate-700">
                            Commentaire (optionnel)
                        </Label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Partagez votre expérience..."
                            className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 min-h-[80px]"
                            maxLength={500}
                        />
                        <p className="text-slate-400 text-xs text-right">
                            {comment.length}/500
                        </p>
                    </div>

                    {/* Error */}
                    {errorSubmit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{errorSubmit}</p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                            onClick={handleClose}
                            disabled={submitting}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                            disabled={submitting || rating === 0}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Envoi...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Envoyer
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

