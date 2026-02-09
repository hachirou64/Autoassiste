import { useState } from 'react';
import { 
    CircleDot, 
    Circle, 
    Power,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { 
    StatusDisponibilite, 
    STATUS_LABELS, 
    STATUS_COLORS, 
    STATUS_BG_COLORS 
} from '@/types/depanneur';

interface AvailabilityToggleProps {
    currentStatus: StatusDisponibilite;
    onStatusChange: (newStatus: StatusDisponibilite) => void;
    disabled?: boolean;
    interventionActive?: boolean;
}

export function AvailabilityToggle({ 
    currentStatus, 
    onStatusChange, 
    disabled = false,
    interventionActive = false 
}: AvailabilityToggleProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleStatusChange = (newStatus: StatusDisponibilite) => {
        if (disabled || interventionActive) return;
        
        setIsAnimating(true);
        onStatusChange(newStatus);
        setTimeout(() => setIsAnimating(false), 300);
    };

    const getStatusIcon = (status: StatusDisponibilite) => {
        switch (status) {
            case 'disponible':
                return <Circle className="h-5 w-5 text-green-400" />;
            case 'occupe':
                return <Clock className="h-5 w-5 text-orange-400" />;
            case 'hors_service':
                return <Power className="h-5 w-5 text-red-400" />;
            default:
                return <CircleDot className="h-5 w-5 text-slate-400" />;
        }
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <CircleDot className="h-5 w-5 text-blue-400" />
                        Gestion de la disponibilité
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Mettez à jour votre statut pour recevoir des demandes
                    </p>
                </div>
                
                {/* Indicateur visuel global */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    interventionActive 
                        ? 'bg-orange-500/20 border border-orange-500/30' 
                        : STATUS_BG_COLORS[currentStatus]
                }`}>
                    <span className={`w-3 h-3 rounded-full ${
                        interventionActive ? 'bg-orange-500 animate-pulse' : STATUS_COLORS[currentStatus].replace('text-', 'bg-')
                    }`} />
                    <span className={`text-sm font-medium ${
                        interventionActive ? 'text-orange-400' : STATUS_COLORS[currentStatus]
                    }`}>
                        {interventionActive ? 'En intervention' : STATUS_LABELS[currentStatus]}
                    </span>
                </div>
            </div>

            {/* Message d'avertissement si intervention active */}
            {interventionActive && (
                <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-orange-400">
                                Intervention en cours
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Vous ne pouvez pas modifier votre disponibilité pendant une intervention.
                                Votre statut sera automatiquement mis à jour à la fin de l'intervention.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Options de statut */}
            <div className="grid gap-3 md:grid-cols-3">
                {/* Disponible */}
                <button
                    onClick={() => handleStatusChange('disponible')}
                    disabled={disabled || interventionActive}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                        currentStatus === 'disponible'
                            ? 'bg-green-500/10 border-green-500/50 ring-2 ring-green-500/20'
                            : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500'
                    } ${disabled || interventionActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${isAnimating ? 'scale-95' : ''}
                    `}
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className={`p-3 rounded-full ${
                            currentStatus === 'disponible' ? 'bg-green-500/20' : 'bg-slate-600/30'
                        }`}>
                            <Circle className={`h-8 w-8 ${
                                currentStatus === 'disponible' ? 'text-green-400' : 'text-slate-400'
                            }`} />
                        </div>
                        <div className="text-center">
                            <p className={`font-semibold ${
                                currentStatus === 'disponible' ? 'text-green-400' : 'text-slate-300'
                            }`}>
                                Disponible
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Reçoit les demandes
                            </p>
                        </div>
                    </div>
                    
                    {currentStatus === 'disponible' && (
                        <div className="absolute top-3 right-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        </div>
                    )}
                </button>

                {/* Occupé */}
                <button
                    onClick={() => handleStatusChange('occupe')}
                    disabled={disabled || interventionActive}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                        currentStatus === 'occupe'
                            ? 'bg-orange-500/10 border-orange-500/50 ring-2 ring-orange-500/20'
                            : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500'
                    } ${disabled || interventionActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${isAnimating ? 'scale-95' : ''}
                    `}
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className={`p-3 rounded-full ${
                            currentStatus === 'occupe' ? 'bg-orange-500/20' : 'bg-slate-600/30'
                        }`}>
                            <Clock className={`h-8 w-8 ${
                                currentStatus === 'occupe' ? 'text-orange-400' : 'text-slate-400'
                            }`} />
                        </div>
                        <div className="text-center">
                            <p className={`font-semibold ${
                                currentStatus === 'occupe' ? 'text-orange-400' : 'text-slate-300'
                            }`}>
                                Occupé
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Intervention en cours
                            </p>
                        </div>
                    </div>
                    
                    {currentStatus === 'occupe' && (
                        <div className="absolute top-3 right-3">
                            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                        </div>
                    )}
                </button>

                {/* Hors service */}
                <button
                    onClick={() => handleStatusChange('hors_service')}
                    disabled={disabled || interventionActive}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                        currentStatus === 'hors_service'
                            ? 'bg-red-500/10 border-red-500/50 ring-2 ring-red-500/20'
                            : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500'
                    } ${disabled || interventionActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${isAnimating ? 'scale-95' : ''}
                    `}
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className={`p-3 rounded-full ${
                            currentStatus === 'hors_service' ? 'bg-red-500/20' : 'bg-slate-600/30'
                        }`}>
                            <Power className={`h-8 w-8 ${
                                currentStatus === 'hors_service' ? 'text-red-400' : 'text-slate-400'
                            }`} />
                        </div>
                        <div className="text-center">
                            <p className={`font-semibold ${
                                currentStatus === 'hors_service' ? 'text-red-400' : 'text-slate-300'
                            }`}>
                                Hors service
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Non disponible
                            </p>
                        </div>
                    </div>
                    
                    {currentStatus === 'hors_service' && (
                        <div className="absolute top-3 right-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                        </div>
                    )}
                </button>
            </div>

            {/* Info supplémentaire */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-500/20 rounded">
                        <Clock className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-blue-400">
                            Conseil
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Gardez votre statut à jour pour ne pas manquer d'opportunités. 
                            Les clients préfèrent les dépanneurs disponibles.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

