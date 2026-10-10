import React, { useState } from 'react';
import { Booking } from '../../types';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { MessageSquare, Copy, Check, ExternalLink, X, Clock, AlertCircle } from 'lucide-react';

interface BookingSuccessModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({ booking, onClose }) => {
  const { settings } = useData();
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const requestTimeFormatted = new Date(booking.created_at).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
  });
  const deadlineTimeFormatted = new Date(booking.deadline_at).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
  });

  // Exactly formatted WhatsApp Message with advance payment details
  const paymentModeLabel = booking.payment_mode === 'agent_wallet'
    ? 'AGENT WALLET DEDUCTION (PAID)'
    : 'SAFARGO QR / ONLINE ADVANCE';

  const whatsappMessage = `SAFARGO MANUAL BOOKING REQUEST
Booking ID: ${booking.booking_code}
Agent Name: ${booking.agent_name || 'SafarGo Agent'}
Agent ID: ${booking.agent_id}
Customer Name: ${booking.customer_name}
Customer Mobile: ${booking.customer_mobile}
From: ${booking.from_city}
To: ${booking.to_city}
Journey Date: ${booking.journey_date}
Preferred Bus: ${booking.operator_preference || 'Standard/Any'}
Seat Type: ${booking.seat_category.toUpperCase().replace(/_/g, ' ')}
Passengers: ${booking.passenger_count}
Estimated Fare: ₹${booking.total_estimated_amount}
Payment Mode: ${paymentModeLabel}${booking.payment_utr ? `\nPayment UTR: ${booking.payment_utr}` : ''}
Request Time: ${requestTimeFormatted}
Confirmation Deadline: ${deadlineTimeFormatted}
Status: PENDING ADMIN CONFIRMATION
*Note: कृपया 15 मिनट की विंडो में पेमेंट स्क्रीनशॉट भी इसी WhatsApp चैट पर भेजें!*`;


  const cleanPhone = settings.support_whatsapp.replace(/\D/g, '');
  const encodedText = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    success('Message Copied!', 'Paste into WhatsApp to send to SafarGo Support.');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-orange-400 tracking-wider">Request Saved to SafarGo</p>
              <h2 className="text-xl font-black">Booking ID: {booking.booking_code}</h2>
            </div>
          </div>
        </div>

        {/* Action Steps Body */}
        <div className="p-6 space-y-5">
          {/* Instructions Alert with Explicit WhatsApp Active Mandate */}
          <div className="bg-emerald-950 text-white border-2 border-emerald-500 rounded-2xl p-4 text-xs space-y-2 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <p className="font-black text-sm text-emerald-300">
                महत्वपूर्ण: इस 15 मिनट टाइमर में WhatsApp पर एक्टिव रहें!
              </p>
            </div>
            <p className="text-emerald-100 leading-relaxed font-medium">
              SafarGo की टीम आपसे <strong>WhatsApp पर ही ऑपरेटर सीट, बोर्डिंग पॉइंट और टिकट की डिटेल मांगेगी</strong>। कृपया अपना WhatsApp चालू रखें ताकि टिकट समय पर कन्फर्म हो सके।
            </p>
          </div>

          {/* 15 Minute Window Banner */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg text-xs">
            <span className="text-slate-600 flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-blue-600" />
              15-Minute Response Deadline:
            </span>
            <span className="font-semibold text-slate-900">{deadlineTimeFormatted}</span>
          </div>

          {/* Formatted Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Prefilled WhatsApp Message:</span>
              <button
                onClick={handleCopy}
                className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard' : 'Copy Message'}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-48 border border-slate-800">
              {whatsappMessage}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-98"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              Open WhatsApp (Send to +{cleanPhone})
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </button>

            <button
              onClick={handleCopy}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-xs"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Message Copied!' : 'Copy Message Fallback'}
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-400">
            Support WhatsApp: +{settings.support_whatsapp} • Configured in SafarGo Admin Settings
          </p>
        </div>
      </div>
    </div>
  );
};
