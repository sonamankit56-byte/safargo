import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, Send, CheckCircle, MessageSquare, PhoneCall, AlertCircle } from 'lucide-react';
import { SupportTicket } from '../../lib/types';

export const HelpPortal: React.FC = () => {
  const { state, store } = useStore();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'faqs' | 'new_ticket' | 'my_tickets'>('faqs');

  // Form state
  const [category, setCategory] = useState<'booking' | 'payment' | 'cancellation' | 'agent' | 'general' | 'agriculture'>('booking');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [bookingRefInput, setBookingRefInput] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    const t = store.createSupportTicket({
      userId: currentUser.id,
      customerName: currentUser.fullName,
      customerPhone: currentUser.phone,
      bookingRef: bookingRefInput.trim() || undefined,
      category,
      subject,
      description,
      status: 'open',
      priority: 'medium',
    });

    setSubmittedTicket(t);
    setSubject('');
    setDescription('');
    setBookingRefInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-slate-900">help.safargo.in</span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Customer Support Center
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            24x7 Assistance Desk, Booking Resolution, and Official Support Inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'faqs' ? 'bg-sky-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Knowledge Base & FAQs
          </button>
          <button
            onClick={() => setActiveTab('new_ticket')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'new_ticket' ? 'bg-safargo-orange text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            + Submit Support Ticket
          </button>
          <button
            onClick={() => setActiveTab('my_tickets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'my_tickets' ? 'bg-sky-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            My Tickets ({state.supportTickets.length})
          </button>
        </div>
      </div>

      {/* WhatsApp Fast Desk Banner */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-emerald-900">
          <PhoneCall className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="text-xs">
            <strong>Need instant assistance on a running timer?</strong> Our WhatsApp operations desk provides active booking assistance during travel hours.
          </div>
        </div>
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow whitespace-nowrap"
        >
          WhatsApp Support
        </a>
      </div>

      {/* FAQS TAB */}
      {activeTab === 'faqs' && (
        <div className="max-w-3xl mx-auto space-y-4 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Why does my booking status show "Pending Review"?</h4>
            <p className="text-slate-600 leading-relaxed">
              SafarGo uses a verified manual booking model to ensure passenger satisfaction. We directly contact the authorized bus operator to verify seat availability before issuing a genuine PNR.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">How long does booking confirmation take?</h4>
            <p className="text-slate-600 leading-relaxed">
              Our operations target is 15 minutes. If an operator takes longer to answer during late night or peak hours, our desk will actively coordinate and update your request.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">How do I cancel my ticket and claim a refund?</h4>
            <p className="text-slate-600 leading-relaxed">
              Navigate to the "Cancel Booking" tab in book.safargo.in or file a cancellation ticket here. We calculate refunds strictly based on operator cancellation cutoff hours.
            </p>
          </div>
        </div>
      )}

      {/* NEW TICKET TAB */}
      {activeTab === 'new_ticket' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-safargo-orange" />
            <h3 className="text-base font-bold text-slate-900">File an Official Support Ticket</h3>
          </div>

          {submittedTicket && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 space-y-1">
              <div className="font-bold">Ticket Registered Successfully!</div>
              <div>Ticket Reference: <strong className="font-mono">{submittedTicket.ticketRef}</strong></div>
              <div className="text-[11px] text-emerald-600">Assigned to customer care desk for review.</div>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              >
                <option value="booking">Bus Booking Assistance</option>
                <option value="payment">Payment & Receipt Verification</option>
                <option value="cancellation">Cancellation & Refund Query</option>
                <option value="agent">Agent Network Support</option>
                <option value="agriculture">Kisan Mandi & Transport</option>
                <option value="general">General Support</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Related Booking Reference (Optional)</label>
              <input
                type="text"
                placeholder="e.g. SFG-2026-847291"
                value={bookingRefInput}
                onChange={(e) => setBookingRefInput(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 font-mono uppercase text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject / Summary</label>
              <input
                type="text"
                required
                placeholder="Brief summary of your query"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
              <textarea
                required
                rows={4}
                placeholder="Describe your issue with relevant details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-safargo-navy hover:bg-slate-800 text-white font-bold rounded-xl shadow"
            >
              Submit Ticket to Helpdesk
            </button>
          </form>
        </div>
      )}

      {/* MY TICKETS TAB */}
      {activeTab === 'my_tickets' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900">Your Support Tickets</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Ticket Ref</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Resolution Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.supportTickets.map((t) => (
                  <tr key={t.id}>
                    <td className="p-3 font-mono font-bold text-safargo-navy">{t.ticketRef}</td>
                    <td className="p-3 capitalize">{t.category}</td>
                    <td className="p-3 font-medium text-slate-900">{t.subject}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{t.resolutionNotes || 'In review by operations.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
