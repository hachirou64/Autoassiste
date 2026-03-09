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
    
    const [loading, setLoading] = useState(false);
    const [interventionData, setInterventionData] = useState<InterventionInfo | null>(intervention || null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorSubmit, setErrorSubmit] = useState<string | null>(null);

    // Les données de l'intervention sont maintenant passées via les props du serveur
    // Plus besoin de faire un appel API séparé

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

    // Afficher un message si l'intervention a déjà été évaluée
    if (alreadyEvaluated && interventionData) {
        return (
            <AppHeaderLayout>
                <Head title="Évaluation déjà soumise - GoAssist" />
                <div className="min-h-screen bg-white p-4 lg:p-8">
                    <div className="max-w-xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.visit('/client/dashboard')}
                                className="text-slate-600 hover:text-slate-900"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-2xl font-bold text-slate-900">Évaluation déjà soumise</h1>
                        </div>

                        {/* Informations de l'intervention */}
                        <Card className="bg-slate-50 border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-slate-900">{interventionData.codeDemande}</CardTitle>
                                <CardDescription className="text-slate-600">
                                    {interventionData.typePanne} - {interventionData.depanneur?.etablissement_name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {new Date(interventionData.date).toLocaleDateString('fr-FR')}
                                    </div>
                                    {interventionData.depanneur && (
                                        <div className="flex items-center gap-1">
                                            <Wrench className="h-4 w-4" />
                                            {interventionData.depanneur.fullName}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-green-700 font-medium">
                                        Vous avez déjà évalué cette intervention
                                    </p>
                                    <p className="text-green-600 text-sm mt-1">
                                        Merci pour votre retour!
                                    </p>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                                    onClick={() => router.visit('/client/dashboard')}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Retour au dashboard
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppHeaderLayout>
        );
    }

    if (loading) {
        return (
            <AppHeaderLayout>
                <Head title="Évaluation - GoAssist" />
                <div className="min-h-screen bg-white p-4 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-slate-600">Chargement...</p>
                    </div>
                </div>
            </AppHeaderLayout>
        );
    }

    if (!interventionData) {
        return (
            <AppHeaderLayout>
                <Head title="Erreur - GoAssist" />
                <div className="min-h-screen bg-white p-4 flex items-center justify-center">
                    <Card className="bg-slate-50 border-slate-200 max-w-md">
                        <CardContent className="p-8 text-center">
                            <p className="text-red-500 mb-4">{error || 'Intervention non trouvée'}</p>
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
                <div className="min-h-screen bg-white p-4 flex items-center justify-center">
                    <Card className="bg-green-50 border-green-200 max-w-md">
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-green-700 mb-2">Merci pour votre évaluation!</h2>
                            <p className="text-green-600 mb-4">
                                Votre feedback nous aide à améliorer notre service.
                            </p>
                            <Loader2 className="h-5 w-5 animate-spin text-green-500 mx-auto" />
                        </CardContent>
                    </Card>
                </div>
            </AppHeaderLayout>
        );
    }

    return (
        <AppHeaderLayout>
            <Head title={`Évaluer ${interventionData.codeDemande} - GoAssist`} />

            <div className="min-h-screen bg-white p-4 lg:p-8">
                <div className="max-w-xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit('/client/dashboard')}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold text-slate-900">Évaluer l'intervention</h1>
                    </div>

                    {/* Informations de l'intervention */}
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-slate-900">{interventionData.codeDemande}</CardTitle>
                            <CardDescription className="text-slate-600">
                                {interventionData.typePanne} - {interventionData.depanneur.etablissement_name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
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
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-slate-900">Votre note</CardTitle>
                            <CardDescription className="text-slate-600">
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

                                {/* Commentaire */}
                                <div className="space-y-2">
                                    <Label htmlFor="comment" className="text-slate-700">
                                        Commentaire (optionnel)
                                    </Label>
                                    <Textarea
                                        id="comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Partagez votre expérience..."
                                        className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 min-h-[100px]"
                                        maxLength={500}
                                    />
                                    <p className="text-slate-400 text-xs text-right">
                                        {comment.length}/500
                                    </p>
                                </div>

                                {/* Erreur */}
                                {errorSubmit && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-600 text-sm">{errorSubmit}</p>
                                    </div>
                                )}

                                {/* Boutons */}
                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
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

