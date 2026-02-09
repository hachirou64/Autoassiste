import { AlertCircle, AlertTriangle, Info, CheckCircle, Bell } from 'lucide-react';
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
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getAlertBg = (type: AdminAlert['type']) => {
        switch (type) {
            case 'danger':
                return 'bg-red-500/10 border-red-500/20';
            case 'warning':
                return 'bg-amber-500/10 border-amber-500/20';
            case 'success':
                return 'bg-green-500/10 border-green-500/20';
            default:
                return 'bg-blue-500/10 border-blue-500/20';
        }
    };

    if (alerts.length === 0) {
        return (
            <div className="bg-slate-800/50 border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Bell className="h-5 w-5 text-slate-400" />
                    <h3 className="text-lg font-semibold text-white">Notifications</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <CheckCircle className="h-12 w-12 mb-2 text-green-500" />
                    <p>Aucunes alertes pour le moment</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-white">Alertes systeme</h3>
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {alerts.length}
                </span>
            </div>
            <div className="space-y-3">
                {alerts.map((alert, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border ${getAlertBg(alert.type)}`}
                    >
                        <div className="flex items-start gap-3">
                            {getAlertIcon(alert.type)}
                            <div className="flex-1">
                                <h4 className="font-medium text-white">{alert.title}</h4>
                                <p className="text-sm text-slate-400 mt-1">{alert.message}</p>
                                <button
                                    onClick={() => onAction?.(alert.action)}
                                    className="text-sm text-amber-400 hover:text-amber-300 mt-2"
                                >
                                    Voir les details →
                                </button>
                            </div>
                            <span className="bg-slate-700 text-white text-xs px-2 py-1 rounded-full">
                                {alert.count}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

