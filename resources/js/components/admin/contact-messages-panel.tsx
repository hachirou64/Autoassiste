import React, { useState } from 'react';
import { 
    MessageSquare, Mail, Clock, CheckCircle, Send, 
    Trash2, Eye, Reply, Search, Filter, RefreshCw,
    ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { ContactMessage, PaginationParams } from '@/types';

interface ContactMessagesPanelProps {
    messages: ContactMessage[];
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    pendingCount: number;
    isLoading?: boolean;
    onPageChange?: (page: number) => void;
    onSearch?: (query: string) => void;
    onStatusFilter?: (status: string) => void;
    onMarkAsRead?: (id: number) => Promise<any>;
    onReply?: (id: number, response: string) => Promise<any>;
    onDelete?: (id: number) => Promise<any>;
    onRefresh?: () => void;
}

const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    read: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    replied: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const statusLabels = {
    pending: 'En attente',
    read: 'Lu',
    replied: 'Répondu',
};

export function ContactMessagesPanel({
    messages,
    pagination,
    pendingCount,
    isLoading = false,
    onPageChange,
    onSearch,
    onStatusFilter,
    onMarkAsRead,
    onReply,
    onDelete,
    onRefresh,
}: ContactMessagesPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(searchQuery);
    };

    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        onStatusFilter?.(status);
    };

    const handleViewMessage = async (message: ContactMessage) => {
        setSelectedMessage(message);
        // Marquer comme lu automatiquement
        if (message.status === 'pending' && onMarkAsRead) {
            setActionLoading(message.id);
            try {
                await onMarkAsRead(message.id);
            } catch (error) {
                console.error('Erreur lors du marquage:', error);
            } finally {
                setActionLoading(null);
            }
        }
    };

    const handleReply = async () => {
        if (!selectedMessage || !replyText.trim()) return;
        
        setIsReplying(true);
        try {
            await onReply?.(selectedMessage.id, replyText);
            setShowReplyModal(false);
            setReplyText('');
            setSelectedMessage(prev => prev ? { ...prev, status: 'replied', admin_response: replyText } : null);
        } catch (error) {
            console.error('Erreur lors de la réponse:', error);
            alert('Erreur lors de l\'envoi de la réponse');
        } finally {
            setIsReplying(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;
        
        setActionLoading(id);
        try {
            await onDelete?.(id);
            if (selectedMessage?.id === id) {
                setSelectedMessage(null);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/30">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">En attente</p>
                            <p className="text-2xl font-bold text-white">{pendingCount}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Eye className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Lus</p>
                            <p className="text-2xl font-bold text-white">
                                {messages.filter(m => m.status === 'read').length}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Respondus</p>
                            <p className="text-2xl font-bold text-white">
                                {messages.filter(m => m.status === 'replied').length}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4 bg-slate-800/50 border-slate-700/50">
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Rechercher par nom, email ou sujet..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-700/50 border-slate-600"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            <Search className="w-4 h-4 mr-2" />
                            Rechercher
                        </Button>
                    </form>
                    
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="pending">En attente</option>
                            <option value="read">Lu</option>
                            <option value="replied">Répondu</option>
                        </select>
                        
                        <Button variant="outline" onClick={onRefresh}>
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Messages List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Messages Table */}
                <Card className="p-4 bg-slate-800/50 border-slate-700/50 max-h-[600px] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-semibold text-white">
                            Messages ({pagination.total})
                        </h3>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                            <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                            <p>Aucun message</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    onClick={() => handleViewMessage(message)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                                        selectedMessage?.id === message.id
                                            ? 'bg-amber-500/20 border border-amber-500/30'
                                            : 'bg-slate-700/30 border border-transparent hover:bg-slate-700/50'
                                    } ${message.status === 'pending' ? 'border-l-4 border-l-yellow-500' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-white truncate">{message.name}</p>
                                                <Badge className={statusColors[message.status]}>
                                                    {statusLabels[message.status]}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-400 truncate">{message.email}</p>
                                            <p className="text-sm text-slate-300 truncate mt-1">
                                                {message.subject || message.message.substring(0, 50)}...
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs text-slate-500">
                                                {new Date(message.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                            {actionLoading === message.id && (
                                                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.current_page === 1}
                                onClick={() => onPageChange?.(pagination.current_page - 1)}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm text-slate-400">
                                Page {pagination.current_page} / {pagination.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => onPageChange?.(pagination.current_page + 1)}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Message Detail */}
                <Card className="p-4 bg-slate-800/50 border-slate-700/50">
                    {selectedMessage ? (
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {selectedMessage.subject || 'Sans objet'}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <a 
                                            href={`mailto:${selectedMessage.email}`}
                                            className="text-sm text-amber-400 hover:underline"
                                        >
                                            {selectedMessage.email}
                                        </a>
                                    </div>
                                </div>
                                <Badge className={statusColors[selectedMessage.status]}>
                                    {statusLabels[selectedMessage.status]}
                                </Badge>
                            </div>

                            <div className="p-4 bg-slate-700/30 rounded-lg">
                                <p className="text-sm text-slate-400 mb-2">
                                    De: <span className="text-white">{selectedMessage.name}</span>
                                </p>
                                <p className="text-white whitespace-pre-wrap">{selectedMessage.message}</p>
                                <p className="text-xs text-slate-500 mt-4">
                                    Reçu le {new Date(selectedMessage.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            {/* Admin Response */}
                            {selectedMessage.admin_response && (
                                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Reply className="w-4 h-4 text-green-400" />
                                        <span className="text-sm font-medium text-green-400">Votre réponse:</span>
                                    </div>
                                    <p className="text-white whitespace-pre-wrap">{selectedMessage.admin_response}</p>
                                    {selectedMessage.replied_at && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            Répondu le {new Date(selectedMessage.replied_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                                {selectedMessage.status !== 'replied' && (
                                    <Button
                                        onClick={() => setShowReplyModal(true)}
                                        className="flex-1 bg-amber-500 hover:bg-amber-600"
                                    >
                                        <Reply className="w-4 h-4 mr-2" />
                                        Répondre
                                    </Button>
                                )}
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(selectedMessage.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Eye className="w-16 h-16 mb-4 opacity-30" />
                            <p>Sélectionnez un message pour voir les détails</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Reply Modal */}
            {showReplyModal && selectedMessage && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 max-w-lg w-full mx-4 border border-slate-700/50">
                        <h3 className="text-xl font-bold text-white mb-4">
                            Répondre à {selectedMessage.name}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Email</label>
                                <Input
                                    value={selectedMessage.email}
                                    disabled
                                    className="bg-slate-700/50 border-slate-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Message original</label>
                                <div className="p-3 bg-slate-700/30 rounded-lg text-sm text-slate-300 max-h-32 overflow-y-auto">
                                    {selectedMessage.message}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Votre réponse</label>
                                <Textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Tapez votre réponse..."
                                    rows={5}
                                    className="bg-slate-700/50 border-slate-600"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowReplyModal(false);
                                    setReplyText('');
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleReply}
                                disabled={isReplying || !replyText.trim()}
                                className="bg-amber-500 hover:bg-amber-600"
                            >
                                {isReplying ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Envoi...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Envoyer
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ContactMessagesPanel;

