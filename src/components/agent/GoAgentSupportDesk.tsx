import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SupportTicket, TicketCategory, TicketPriority } from '../../types';
import {
  LifeBuoy,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  MessageSquare,
  FileText,
  HelpCircle,
  Info,
  Calendar,
  User,
  Phone,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';

export const GoAgentSupportDesk: React.FC = () => {
  const { agentSupportTickets, createSupportTicket, replyToSupportTicket } = useData();
  const { currentUser } = useAuth();
  const { success, error, warning } = useToast();

  const [activeTab, setActiveTab] = useState<'create' | 'pending' | 'closed' | 'policy_about'>('pending');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Form State for New Ticket
  const [category, setCategory] = useState<TicketCategory>('ticket_booking_issue');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [relatedBookingCode, setRelatedBookingCode] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reply State
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Filtered tickets
  const pendingTickets = agentSupportTickets.filter(
    (t) => t.status === 'pending' || t.status === 'open'
  );
  const closedTickets = agentSupportTickets.filter(
    (t) => t.status === 'resolved' || t.status === 'closed'
  );

  const selectedTicket = agentSupportTickets.find((t) => t.id === selectedTicketId) || null;

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      error('कृपया विषय और विवरण दोनों भरें', 'सपोर्ट टिकट दर्ज करने हेतु दोनों फ़ील्ड अनिवार्य हैं।');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createSupportTicket({
        category,
        priority,
        subject: subject.trim(),
        description: description.trim(),
        related_booking_code: relatedBookingCode.trim() || undefined,
        screenshot_url: screenshotUrl.trim() || undefined,
      });

      if (created) {
        setSubject('');
        setDescription('');
        setRelatedBookingCode('');
        setScreenshotUrl('');
        setSelectedTicketId(created.id);
        setActiveTab('pending');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const calculateRemainingSla = (deadlineAt: string) => {
    const diffMs = new Date(deadlineAt).getTime() - Date.now();
    if (diffMs <= 0) return { text: 'SLA अवधि समाप्त (शीघ्र हल अपेक्षित)', urgent: true };
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      text: `${hours} घंटे ${mins} मिनट शेष`,
      urgent: hours < 4,
    };
  };

  return (
    <div className="space-y-6">
      {/* 24-HOUR SLA GUARANTEE TOP BANNER - Jio Royal Blue */}
      <div className="bg-[#0A2885] rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <LifeBuoy className="w-48 h-48" />
        </div>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-blue-100">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            24 घंटे में गारंटीकृत समाधान (24-Hour SLA)
          </div>
          <h2 className="text-xl sm:text-2xl font-black leading-tight">
            GO Agent हेल्पडेस्क व टिकट सपोर्ट सिस्टम
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 font-medium">
            बुकिंग, 3-मिनट ऐड मनी, फ्लैट ₹20 इंस्टेंट कमीशन या 100% रिफंड संबंधी किसी भी समस्या का 24 घंटे में समाधान सुनिश्चित किया जाएगा।
          </p>
        </div>
      </div>

      {/* NAVIGATION TABS - Jio Rounded-Full Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-full border border-slate-200 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => {
            setActiveTab('pending');
            setSelectedTicketId(null);
          }}
          className={`px-4 py-2 rounded-full font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'pending'
              ? 'bg-[#0A2885] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>लंबित टिकट (Pending)</span>
          {pendingTickets.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'pending' ? 'bg-[#FF6500] text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {pendingTickets.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('create');
            setSelectedTicketId(null);
          }}
          className={`px-4 py-2 rounded-full font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'create'
              ? 'bg-[#0A2885] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>नया टिकट बनाएं</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('closed');
            setSelectedTicketId(null);
          }}
          className={`px-4 py-2 rounded-full font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'closed'
              ? 'bg-[#0A2885] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>हल हुए टिकट (Closed)</span>
          {closedTickets.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'closed' ? 'bg-[#FF6500] text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {closedTickets.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('policy_about');
            setSelectedTicketId(null);
          }}
          className={`px-4 py-2 rounded-full font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'policy_about'
              ? 'bg-[#0A2885] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>रिफंड नीति एवं SafarGo</span>
        </button>
      </div>

      {/* TAB 1: CREATE NEW TICKET */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateTicket} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-orange-600" />
              नया सहायता टिकट दर्ज करें
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              अपनी समस्या का विवरण दें। हमारी तकनीकी व ऑपरेशन्स टीम 24 घंटे के अंदर निवारण करेगी।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">समस्या की श्रेणी (Category) *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:border-[#0A2885] focus:bg-white outline-none bg-[#F5F7FB]"
              >
                <option value="ticket_booking_issue">🚌 बस टिकट बुकिंग / PNR समस्या</option>
                <option value="wallet_add_money">⚡ वॉलेट ऐड मनी / 3-मिनट सत्यापन समस्या</option>
                <option value="instant_commission_issue">💰 ₹20 इंस्टेंट कमीशन क्रेडिट समस्या</option>
                <option value="refund_guarantee">🛡️ 100% रिफंड गारंटी दावा</option>
                <option value="technical_issue">⚙️ तकनीकी समस्या / ऐप एरर</option>
                <option value="other">📝 अन्य सहायता</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">प्राथमिकता (Priority) *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:border-[#0A2885] focus:bg-white outline-none bg-[#F5F7FB]"
              >
                <option value="normal">🟢 सामान्य (Normal)</option>
                <option value="high">🟡 उच्च (High - यात्रा आज ही है)</option>
                <option value="urgent">🔴 अति आवश्यक (Urgent - तुरंत सहायता)</option>
              </select>
            </div>
          </div>

          {/* Related Booking Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              संबंधित बुकिंग ID / UTR नंबर (यदि कोई हो)
            </label>
            <input
              type="text"
              placeholder="उदा. SFG-20261014-992 या 12-अंकों का बैंक UTR"
              value={relatedBookingCode}
              onChange={(e) => setRelatedBookingCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:border-[#0A2885] focus:bg-white outline-none uppercase font-mono bg-[#F5F7FB]"
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">विषय (Subject) *</label>
            <input
              type="text"
              placeholder="उदा. टिकट कन्फर्म होने पर ₹20 कमीशन नहीं जुड़ा / 3-मिनट में ऐड मनी नहीं हुआ"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:border-[#0A2885] focus:bg-white outline-none bg-[#F5F7FB]"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">विस्तृत विवरण (Description) *</label>
            <textarea
              rows={4}
              placeholder="कृपया स्पष्ट शब्दों में अपनी समस्या लिखें (समय, यात्री नाम, बस रूट इत्यादि)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:border-[#0A2885] focus:bg-white outline-none resize-none bg-[#F5F7FB]"
            />
          </div>

          {/* Screenshot Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">स्क्रीनशॉट या प्रमाण लिंक (वैकल्पिक)</label>
            <input
              type="text"
              placeholder="स्क्रीनशॉट इमेज URL या विवरण"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:border-[#0A2885] focus:bg-white outline-none bg-[#F5F7FB]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#FF6500] hover:bg-[#E05900] text-white font-bold text-sm rounded-full shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'टिकट दर्ज हो रहा है...' : 'सपोर्ट टिकट सबमिट करें (24-घंटे समाधान)'}</span>
          </button>
        </form>
      )}

      {/* TAB 2: PENDING TICKETS & TICKET CHAT */}
      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ticket List */}
          <div className={`${selectedTicket ? 'hidden lg:block lg:col-span-5' : 'col-span-12'} space-y-3`}>
            {pendingTickets.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-black text-slate-900 text-sm">कोई लंबित टिकट नहीं है!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  आपकी सभी पूर्व समस्याएं सुलझाई जा चुकी हैं। नया टिकट दर्ज करने के लिए ऊपर दिए बटन पर क्लिक करें।
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-orange-700 transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>नया टिकट बनाएं</span>
                </button>
              </div>
            ) : (
              pendingTickets.map((t) => {
                const sla = calculateRemainingSla(t.sla_deadline_at);
                const isSelected = selectedTicketId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-orange-50/50 border-orange-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">
                        #{t.ticket_code}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          sla.urgent
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        ⏱️ {sla.text}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 line-clamp-1">{t.subject}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{t.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>{new Date(t.created_at).toLocaleDateString('hi-IN')}</span>
                      <span className="font-bold text-orange-600 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {t.messages.length} संदेश
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Ticket Chat & Details View */}
          {selectedTicket && (
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[580px]">
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">
                      #{selectedTicket.ticket_code}
                    </span>
                    <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      लंबित (Pending Review)
                    </span>
                  </div>
                  <h3 className="font-black text-xs sm:text-sm text-slate-900 line-clamp-1">
                    {selectedTicket.subject}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTicketId(null)}
                  className="lg:hidden px-2.5 py-1 text-xs font-bold bg-slate-200 rounded-lg text-slate-700"
                >
                  बंद करें
                </button>
              </div>

              {/* SLA Guarantee Pill */}
              <div className="bg-amber-50 px-4 py-2 border-b border-amber-200/80 flex items-center justify-between text-[11px] font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  SafarGo 24-घंटे समाधान गारंटी
                </span>
                <span className="text-orange-700">
                  {calculateRemainingSla(selectedTicket.sla_deadline_at).text}
                </span>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {selectedTicket.messages.map((m) => {
                  const isAgent = m.sender_role === 'agent';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                        <span className="font-bold text-slate-600">{m.sender_name}</span>
                        <span>•</span>
                        <span>{new Date(m.created_at).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                          isAgent
                            ? 'bg-[#0A2885] text-white rounded-tr-xs shadow-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.message}</p>
                        {m.attachment_url && (
                          <div className="mt-2 pt-2 border-t border-white/20 text-[10px]">
                            <a
                              href={m.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              className="underline flex items-center gap-1 text-blue-200 hover:text-white"
                            >
                              <ExternalLink className="w-3 h-3" />
                              संलग्न प्रमाण देखें
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="अपना जवाब या अतिरिक्त जानकारी लिखें..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-xs focus:border-[#0A2885] outline-none bg-[#F5F7FB]"
                />
                <button
                  type="submit"
                  disabled={isReplying || !replyMessage.trim()}
                  className="p-2.5 bg-[#0A2885] hover:bg-[#071E66] text-white rounded-full shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CLOSED / RESOLVED TICKETS */}
      {activeTab === 'closed' && (
        <div className="space-y-3">
          {closedTickets.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2 shadow-xs">
              <Info className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-black text-slate-900 text-sm">कोई हल हुआ टिकट आर्काइव में नहीं है</h4>
              <p className="text-xs text-slate-500">
                जब भी आपका कोई टिकट एडमिन टीम द्वारा हल कर दिया जाएगा, वह यहाँ सुरक्षित रहेगा।
              </p>
            </div>
          ) : (
            closedTickets.map((t) => (
              <div key={t.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      #{t.ticket_code}
                    </span>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      हल हुआ (Resolved)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    हल दिनांक: {t.resolved_at ? new Date(t.resolved_at).toLocaleDateString('hi-IN') : 'सफलतापूर्वक बंद'}
                  </span>
                </div>

                <h4 className="text-sm font-black text-slate-900">{t.subject}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>

                {t.resolution_notes && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 text-xs">
                    <span className="font-black text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      समाधान विवरण ({t.resolved_by || 'सुपर एडमिन'}):
                    </span>
                    <p className="text-emerald-800 font-medium">{t.resolution_notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: REFUND POLICY & ABOUT SAFARGO */}
      {activeTab === 'policy_about' && (
        <div className="space-y-6">
          {/* 100% Refund Policy */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                🛡️
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  SafarGo 100% रिफंड गारंटी नीति (100% Refund Policy)
                </h3>
                <p className="text-xs text-slate-500">
                  ग्रामीण एजेंटों व यात्रियों के भरोसे के लिए पारदर्शी व त्वरित रिफंड प्रणाली
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <span className="text-xs font-black text-emerald-900 block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ऑपरेटर रद्दीकरण पर 100% रिफंड
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  यदि बस ऑपरेटर द्वारा बस रद्द की जाती है या बस 2 घंटे से अधिक लेट होती है, तो यात्री/एजेंट को पूरी 100% राशि वापस Go Wallet या मूल बैंक खाते में मिलेगी।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                <span className="text-xs font-black text-amber-900 block flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  15-मिनट ऑपरेटर टाइमआउट
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  बुकिंग अनुरोध सबमिट होने के बाद यदि बस ऑपरेटर 15 मिनट के अंदर पुष्टि नहीं करता, तो बुकिंग स्वतः निरस्त होकर वॉलेट कटौती तुरंत रिफंड हो जाती है।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1.5">
                <span className="text-xs font-black text-blue-900 block flex items-center gap-1.5">
                  <LifeBuoy className="w-4 h-4 text-blue-600" />
                  24-घंटे प्रत्यक्ष रिफंड डेस्क
                </span>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  रिफंड संबंधी किसी भी संशय के लिए टिकट दर्ज करें — हमारी वित्त टीम 24 घंटे में UTR बैंक रेफरेंस के साथ समाधान प्रदान करती है।
                </p>
              </div>
            </div>
          </div>

          {/* About SafarGo Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
                ⭐
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  SafarGo के बारे में (About SafarGo Express)
                </h3>
                <p className="text-xs text-slate-500">
                  भारत का प्रमुख ग्रामीण डिजिटल बस टिकटिंग एवं कनेक्टेड ट्रैवल नेटवर्क
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>SafarGo Express</strong> मध्य प्रदेश व भारत के सभी प्रमुख ग्रामीण क्षेत्रों (सिरोंज, कुरवाई, लटेरी, चंदेरी, विदिशा, भोपाल, इंदौर) को सीधे देश के बड़े ऑपरेटर नेटवर्क से जोड़ता है।
              </p>
              <p>
                हमारा विज़न प्रत्येक CSC एवं ग्राम कियोस्क एजेंट को एक सशक्त, विश्वसनीय और त्वरित टिकटिंग पार्टनर बनाना है, जहाँ एजेंटों को हर कन्फर्म टिकट पर <strong>फ्लैट ₹20 इंस्टेंट कमीशन</strong> मिलता है और <strong>3-मिनट में स्वचालित ऐड मनी</strong> की सुविधा मिलती है।
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-600" />
                  कस्टमर सपोर्ट हेल्पलाइन: 9826012345 (24x7 WhatsApp सपोर्ट)
                </span>
                <span className="text-slate-500">
                  Email: support@safargo.in
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
