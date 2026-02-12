import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

interface EvaluationFormProps {
    demande_id: number;
    depanneur_name: string;
    onSubmit?: (rating: number, comment: string) => void;
    isLoading?: boolean;
}

export function EvaluationForm({
    demande_id,
    depanneur_name,
    onSubmit,
    isLoading = false,
}: EvaluationFormProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Veuillez sélectionner une note');
            return;
        }

        try {
            const response = await fetch(`/api/demandes/${demande_id}/evaluate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    rating,
                    comment,
                }),
            });

            if (response.ok) {
                onSubmit?.(rating, comment);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'évaluation:', error);
        }
    };

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white">Évaluez votre expérience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Dépanneur */}
                <div>
                    <p className="text-slate-400 text-sm mb-2">Vous avez été dépanné par:</p>
                    <p className="text-white font-semibold">{depanneur_name}</p>
                </div>

                {/* Rating */}
                <div>
                    <p className="text-slate-300 text-sm mb-4">Votre avis:</p>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="transition-transform hover:scale-125"
                            >
                                <Star
                                    className={`h-8 w-8 transition-colors ${
                                        star <= (hoveredRating || rating)
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-slate-600'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-amber-400 text-sm mt-2">
                            {rating === 5 && 'Excellent !'}
                            {rating === 4 && 'Très bien'}
                            {rating === 3 && 'Satisfait'}
                            {rating === 2 && 'Peut mieux faire'}
                            {rating === 1 && 'Insatisfait'}
                        </p>
                    )}
                </div>

                {/* Comment */}
                <div>
                    <p className="text-slate-300 text-sm mb-2">Commentaire (optionnel):</p>
                    <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Partagez votre expérience..."
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        rows={3}
                        maxLength={500}
                    />
                    <p className="text-xs text-slate-500 mt-1">{comment.length}/500</p>
                </div>

                {/* Submit Button */}
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading || rating === 0}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold"
                >
                    {isLoading ? 'Envoi...' : 'Envoyer l\'évaluation'}
                </Button>
            </CardContent>
        </Card>
    );
}
