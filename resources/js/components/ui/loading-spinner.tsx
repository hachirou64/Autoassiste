import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
};

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 p-8">
            <Loader2 className={`${sizeClasses[size]} text-blue-500 animate-spin`} />
            {text && (
                <p className="text-slate-400 text-sm animate-pulse">{text}</p>
            )}
        </div>
    );
}

export function LoadingPage({ text = 'Chargement...' }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
            <p className="mt-4 text-slate-400 text-lg animate-pulse">{text}</p>
        </div>
    );
}

export function LoadingCard() {
    return (
        <div className="bg-slate-800/50 border-slate-700 rounded-lg p-6 animate-pulse">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-700 rounded-lg" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-1/3" />
                    <div className="h-6 bg-slate-700 rounded w-1/2" />
                </div>
            </div>
        </div>
    );
}

export function LoadingGrid({ count = 4 }: { count?: number }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <LoadingCard key={i} />
            ))}
        </div>
    );
}

