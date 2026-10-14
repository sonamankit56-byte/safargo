import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SupportTicket, TicketCategory } from '../../types';
import {
  LifeBuoy,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  MessageSquare,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  User,
  Phone
} from 'lucide-react';

export const AdminSupportDesk: React.FC = () => {
  const { supportTickets, replyToSupportTicket, resolveSupportTicket, closeSupportTicket } = useData();
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reply State
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Resolve Modal State
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const filteredTickets = supportTickets.filter((t) => {
    if (statusFilter === 'pending' && t.status !== 'pending' && t.status !== 'open') return false;
    if (statusFilter === 'resolved' && t.status !== 'resolved' && t.status !== 'closed') return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        t.ticket_code.toLowerCase().includes(q) ||
        t.agent_name.toLowerCase().includes(q) ||
        t.agent_mobile.includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.related_booking_code && t.related_booking_code.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const selectedTicket = supportTickets.find((t) => t.id === selectedTicketId) || null;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setIsReplying(true);
    try {
      const ok = await replyToSupportTicket(selectedTicket.id, replyMessage.trim());
      if (ok) {
        setReplyMessage('');
      }
    } finally {
      setIsReplying(false);
    }
  };

  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !resolutionNotes.trim()) {
      error('विवरण अनिवार्य', 'कृपया समाधान का विवरण दर्ज करें।');
      return;
    }

    setIsResolving(true);
    try {
      const ok = await resolveSupportTicket(selectedTicket.id, resolutionNotes.trim());
      if (ok) {
        setIsResolveModalOpen(false);
        setResolutionNotes('');
      }
    } finally {
      setIsResolving(false);
    }
  };

  const calculateSla = (deadlineAt: string) => {
    const diffMs = new Date(deadlineAt).getTime() - Date.now();
    if (diffMs <= 0) return { text: 'SLA ओवरड्यू', urgent: true };
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      text: `${hours}h ${mins}m शेष`,
      urgent: hours < 4,
    };
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <LifeBuoy className="w-6 h-6 text-red-500" />
            <span>GO Agent सहायता एवं टिकट डेस्क (24-Hour SLA)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            एजेंटों द्वारा दर्ज की गई समस्याओं का 24 घंटे के अंदर त्वरित समाधान एवं लाइव संचार
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl transition ${
              statusFilter === 'pending'
                ? 'bg-red-600 text-white shadow-xs font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            लंबित ({supportTickets.filter((t) => t.status === 'pending' || t.status === 'open').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1.5 rounded-xl transition ${
              statusFilter === 'resolved'
                ? 'bg-red-600 text-white shadow-xs font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            हल हुए ({supportTickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              statusFilter === 'all'
                ? 'bg-red-600 text-white shadow-xs font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            सभी ({supportTickets.length})
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tickets List */}
        <div className={`${selectedTicket ? 'hidden lg:block lg:col-span-5' : 'col-span-12'} space-y-3`}>
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="खोजें (एजेंट नाम, मोबाइल, टिकट ID)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-red-500 outline-none"
            />
          </div>

          {filteredTickets.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
              कोई सपोर्ट टिकट नहीं मिला।
            </div>
          ) : (
            filteredTickets.map((t) => {
              const sla = calculateSla(t.sla_deadline_at);
              const isSelected = selectedTicketId === t.id;
              const isResolved = t.status === 'resolved' || t.status === 'closed';

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-red-950/40 border-red-500 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-black text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30">
                      #{t.ticket_code}
                    </span>
                    {isResolved ? (
                      <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> हल हुआ
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          sla.urgent
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/50 animate-pulse'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        }`}
                      >
                        ⏱️ {sla.text}
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-black text-white line-clamp-1">{t.subject}</div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="font-bold text-slate-300">{t.agent_name}</span>
                    <span className="font-mono text-slate-500">+91 {t.agent_mobile}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Ticket Thread */}
        {selectedTicket && (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-xl">
            {/* Thread Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40">
                    #{selectedTicket.ticket_code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {selectedTicket.agent_name} (+91 {selectedTicket.agent_mobile})
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-white mt-1 line-clamp-1">
                  {selectedTicket.subject}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <button
                    type="button"
                    onClick={() => setIsResolveModalOpen(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>हल करें (Resolve)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedTicketId(null)}
                  className="lg:hidden p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SLA Header */}
            <div className="bg-amber-950/40 px-4 py-2 border-b border-amber-500/30 flex items-center justify-between text-[11px] font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                SLA समय सीमा (24 घंटे गारंटी)
              </span>
              <span>{calculateSla(selectedTicket.sla_deadline_at).text}</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/50">
              {selectedTicket.messages.map((m) => {
                const isAdmin = m.sender_role === 'admin';
                return (
                  <div key={m.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                      <span className="font-bold text-slate-300">{m.sender_name}</span>
                      <span>•</span>
                      <span>{new Date(m.created_at).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isAdmin
                          ? 'bg-red-600 text-white rounded-tr-xs shadow-md'
                          : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleSendReply} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="एजेंट को आधिकारिक जवाब भेजें..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-red-500 outline-none"
              />
              <button
                type="submit"
                disabled={isReplying || !replyMessage.trim()}
                className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* RESOLVE TICKET MODAL */}
      {isResolveModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>सपोर्ट टिकट हल करें (#{selectedTicket.ticket_code})</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveTicket} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">समाधान का विवरण (Resolution Notes) *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="उदा. बैंक UTR वेरीफाई करके वॉलेट में ₹500 क्रेडिट कर दिए गए हैं / बस ऑपरेटर से सीट कंफर्म कर दी गई है।"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isResolving}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isResolving ? 'हल हो रहा है...' : 'समाधान संपन्न करें (Mark Resolved)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
