import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
    ArrowLeft, Loader2, Star, CheckCircle, Wrench, Clock
} from 'lucide-react';
import type { SharedData } from '@/types';

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

interface EvaluationPageProps {
    interventionId: number;
    intervention?: InterventionInfo;
    alreadyEvaluated?: boolean;
    error?: string;
}

export default function EvaluationPage() {
    const { interventionId, intervention, alreadyEvaluated, error } = usePage<SharedData & EvaluationPageProps>().props;
    
    const [loading, setLoading] = useState(!intervention);
    const [interventionData, setInterventionData] = useState<InterventionInfo | null>(intervention || null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorSubmit, setErrorSubmit] = useState<string | null>(null);

    // Charger les données de l'intervention si pas fournies
    useEffect(() => {
        if (!interventionData && !alreadyEvaluated) {
            fetchInterventionData();
        }
    }, [interventionId]);

    const fetchInterventionData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/client/intervention/${interventionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            const result = await response.json();

            if (result.success && result.intervention) {
                setInterventionData(result.intervention);
            } else {
                setInterventionData(null);
            }
        } catch (err) {
            console.error('Erreur:', err);
            setInterventionData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (rating === 0) {
            setErrorSubmit('Veuillez sélectionner une note');
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
                // Rediriger vers le dashboard après 2 secondes
                setTimeout(() => {
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

    if (alreadyEvaluated || (interventionData && interventionData.id && false)) {
        // This case is handled by checking if the intervention was already evaluated
    }

    if (loading) {
        return (
            <AppHeaderLayout>
                <Head title="Évaluation - GoAssist" />
                <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-slate-400">Chargement...</p>
                    </div>
                </div>
            </AppHeaderLayout>
        );
    }

    if (!interventionData) {
        return (
            <AppHeaderLayout>
                <Head title="Erreur - GoAssist" />
                <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
                    <Card className="bg-slate-800/50 border-slate-700 max-w-md">
                        <CardContent className="p-8 text-center">
                            <p className="text-red-400 mb-4">{error || 'Intervention non trouvée'}</p>
                            <Button onClick={() => router.visit('/client/dashboard')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Retour au dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AppHeaderLayout>
        );
    }

    if (success) {
        return (
            <AppHeaderLayout>
                <Head title="Merci pour votre évaluation - GoAssist" />
                <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
                    <Card className="bg-green-500/10 border-green-500/30 max-w-md">
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-green-400 mb-2">Merci pour votre évaluation!</h2>
                            <p className="text-green-300 mb-4">
                                Votre feedback nous aide à améliorer notre service.
                            </p>
                            <Loader2 className="h-5 w-5 animate-spin text-green-400 mx-auto" />
                        </CardContent>
                    </Card>
                </div>
            </AppHeaderLayout>
        );
    }

    return (
        <AppHeaderLayout>
            <Head title={`Évaluer ${interventionData.codeDemande} - GoAssist`} />

            <div className="min-h-screen bg-slate-950 p-4 lg:p-8">
                <div className="max-w-xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit('/client/dashboard')}
                            className="text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold text-white">Évaluer l'intervention</h1>
                    </div>

                    {/* Informations de l'intervention */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">{interventionData.codeDemande}</CardTitle>
                            <CardDescription className="text-slate-400">
                                {interventionData.typePanne} - {interventionData.depanneur.etablissement_name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {new Date(interventionData.date).toLocaleDateString('fr-FR')}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Wrench className="h-4 w-4" />
                                    {interventionData.depanneur.fullName}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Formulaire d'évaluation */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Votre note</CardTitle>
                            <CardDescription className="text-slate-400">
                                Comment avez-vous trouvé le service ?
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Étoiles */}
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`h-12 w-12 ${
                                                    star <= rating
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-slate-600 hover:text-yellow-200'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-center text-slate-400 text-sm">
                                    {rating === 1 && 'Très insatisfait'}
                                    {rating === 2 && 'Insatisfait'}
                                    {rating === 3 && 'Neutre'}
                                    {rating === 4 && 'Satisfait'}
                                    {rating === 5 && 'Très satisfait'}
                                    {rating === 0 && 'Cliquez pour noter'}
                                </p>

                                {/* Commentaire */}
                                <div className="space-y-2">
                                    <Label htmlFor="comment" className="text-slate-300">
                                        Commentaire (optionnel)
                                    </Label>
                                    <Textarea
                                        id="comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Partagez votre expérience..."
                                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
                                        maxLength={500}
                                    />
                                    <p className="text-slate-500 text-xs text-right">
                                        {comment.length}/500
                                    </p>
                                </div>

                                {/* Erreur */}
                                {errorSubmit && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                        <p className="text-red-400 text-sm">{errorSubmit}</p>
                                    </div>
                                )}

                                {/* Boutons */}
                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                                        onClick={() => router.visit('/client/dashboard')}
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppHeaderLayout>
    );
}

