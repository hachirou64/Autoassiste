import { AlertCircle, AlertTriangle, Info, CheckCircle, Bell, X } from 'lucide-react';
import type { AdminAlert } from '@/types';

interface AlertsPanelProps {
    alerts: AdminAlert[];
    onDismiss?: (alertId: number) => void;
    onAction?: (action: string) => void;
}

export function AlertsPanel({ alerts, onDismiss, onAction }: AlertsPanelProps) {
    const getAlertIcon = (type: AdminAlert['type']) => {
        switch (type) {
            case 'danger':
                return <AlertCircle className="h-5 w-5 text-red-400" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-amber-400" />;
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-400" />;
            default:
                return <Info className="h-5 w-5 text-blue-400" />;
        }
    };

    const getAlertBg = (type: AdminAlert['type']) => {
        switch (type) {
            case 'danger':
                return 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20';
            case 'warning':
                return 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20';
            case 'success':
                return 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20';
            default:
                return 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20';
        }
    };

    if (alerts.length === 0) {
        return (
            <div className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Bell className="h-5 w-5 text-slate-400" />
                    <h3 className="text-lg font-semibold text-white">Notifications</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                        <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                    <p className="text-slate-300 font-medium">Aucune alerte pour le moment</p>
                    <p className="text-sm text-slate-500 mt-1">Tout est en ordre</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-white">Alertes système</h3>
                <span className="ml-auto bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg shadow-red-500/20">
                    {alerts.length}
                </span>
            </div>
            <div className="space-y-3">
                {alerts.map((alert, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] cursor-pointer ${getAlertBg(alert.type)}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                {getAlertIcon(alert.type)}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-white">{alert.title}</h4>
                                <p className="text-sm text-slate-400 mt-1">{alert.message}</p>
                                <button
                                    onClick={() => onAction?.(alert.action)}
                                    className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-flex items-center gap-1 transition-colors"
                                >
                                    Voir les détails 
                                    <span className="text-lg leading-none">→</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-slate-800/50 text-white text-xs px-2 py-1 rounded-full">
                                    {alert.count}
                                </span>
                                {onDismiss && (
                                    <button 
                                        onClick={() => onDismiss(index)}
                                        className="text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

