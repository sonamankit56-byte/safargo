import React, { useState } from 'react';
import { Booking, RefundStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../common/StatusBadge';
import { CountdownTimer } from '../common/CountdownTimer';
import {
  X,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Phone,
  MessageSquare,
  AlertTriangle,
  FileText,
  User,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Copy,
  ExternalLink,
  ShieldCheck,
  Wallet,
  QrCode,
  Image as ImageIcon,
  Check
} from 'lucide-react';

interface AdminBookingReviewModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const AdminBookingReviewModal: React.FC<AdminBookingReviewModalProps> = ({ booking, onClose }) => {
  const { confirmBooking, rejectBooking, reopenBooking, processCancellation, settings } = useData();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'review' | 'whatsapp'>('review');

  // Verification Inputs
  const [actualFare, setActualFare] = useState<number>(booking?.actual_fare || booking?.total_estimated_amount || 0);
  const [confirmedSeats, setConfirmedSeats] = useState<string>(booking?.confirmed_seats || '');
  const [actualOperator, setActualOperator] = useState<string>(booking?.actual_operator || booking?.operator_preference || '');
  const [actualBoarding, setActualBoarding] = useState<string>(booking?.actual_boarding_point || booking?.boarding_point || '');
  const [actualDrop, setActualDrop] = useState<string>(booking?.actual_drop_point || booking?.drop_point || '');
  const [ticketPnr, setTicketPnr] = useState<string>(booking?.ticket_pnr || '');
  const [ticketDocUrl, setTicketDocUrl] = useState<string>(booking?.ticket_doc_url || '');
  const [adminNotes, setAdminNotes] = useState<string>(booking?.admin_notes || '');

  // Payment receipt preview & UTR copy state
  const [viewingPaymentReceipt, setViewingPaymentReceipt] = useState<string | null>(null);
  const [copiedPaymentUtr, setCopiedPaymentUtr] = useState(false);

  // Reject state
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Cancellation & Refund state
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [refundStatus, setRefundStatus] = useState<RefundStatus>('approved');
  const [refundAmount, setRefundAmount] = useState<number>(booking?.total_estimated_amount || 0);
  const [reverseComm, setReverseComm] = useState<boolean>(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  if (!booking) return null;

  // WhatsApp Confirmation Template per prompt section 18
  const whatsappConfirmationMessage = `*SAFARGO BOOKING CONFIRMATION*
━━━━━━━━━━━━━━━━━━━━
Booking ID: ${booking.booking_code}
Customer Name: ${booking.customer_name}
From / To: ${booking.from_city} ➔ ${booking.to_city}
Journey Date: ${booking.journey_date}
Operator: ${actualOperator || booking.actual_operator || 'Operator Confirmation Pending'}
Confirmed Seats: ${confirmedSeats || booking.confirmed_seats || 'Allotted at Boarding'}
Boarding Point: ${actualBoarding || booking.actual_boarding_point || booking.boarding_point}
Drop Point: ${actualDrop || booking.actual_drop_point || booking.drop_point}
Actual Fare: ₹${actualFare || booking.actual_fare || booking.total_estimated_amount}
Ticket/PNR: ${ticketPnr || booking.ticket_pnr || 'Issued at boarding'}
━━━━━━━━━━━━━━━━━━━━
SafarGo Support: +${settings.support_whatsapp}
"अब हर सफर होगा आसान"`;

  const cleanCustomerPhone = booking.customer_mobile.replace(/\D/g, '');
  const customerWhatsappUrl = `https://wa.me/91${cleanCustomerPhone}?text=${encodeURIComponent(whatsappConfirmationMessage)}`;

  const handleCopyWhatsapp = () => {
    navigator.clipboard.writeText(whatsappConfirmationMessage);
    setCopiedWhatsapp(true);
    success('Copied Confirmation Message', 'Ready to send to customer or agent.');
    setTimeout(() => setCopiedWhatsapp(false), 3000);
  };

  const handleConfirm = async () => {
    if (!ticketPnr.trim() && !confirmedSeats.trim()) {
      error('Operator Verification Missing', 'Please enter Confirmed Seats or Operator PNR before confirming.');
      return;
    }

    if (actualFare <= 0) {
      error('Invalid Fare', 'Confirmed fare must be greater than zero.');
      return;
    }

    setIsProcessing(true);
    try {
      const ok = await confirmBooking(booking.id, {
        actual_fare: actualFare,
        confirmed_seats: confirmedSeats.trim(),
        actual_operator: actualOperator.trim() || 'Verified Bus Operator',
        actual_boarding_point: actualBoarding.trim(),
        actual_drop_point: actualDrop.trim(),
        ticket_pnr: ticketPnr.trim(),
        ticket_doc_url: ticketDocUrl.trim() || undefined,
        admin_notes: adminNotes.trim() || undefined,
      });
      if (ok) {
        setActiveTab('whatsapp');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      error('Reason Required', 'Please enter a rejection reason.');
      return;
    }
    setIsProcessing(true);
    try {
      const ok = await rejectBooking(booking.id, rejectionReason.trim());
      if (ok) onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReopen = async () => {
    setIsProcessing(true);
    try {
      const ok = await reopenBooking(booking.id);
      if (ok) onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessCancel = async () => {
    setIsProcessing(true);
    try {
      const ok = await processCancellation(booking.id, refundStatus, refundAmount, reverseComm);
      if (ok) onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-scaleUp">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-orange-400 tracking-wider">
                Admin Booking Verification Desk
              </span>
              <StatusBadge status={booking.status} size="sm" />
            </div>
            <h2 className="text-xl font-black">
              {booking.booking_code} • {booking.customer_name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <CountdownTimer deadlineAt={booking.deadline_at} status={booking.status} />
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'review' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verification & Ticket Entry
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'whatsapp' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            WhatsApp Confirmation Message
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {activeTab === 'whatsapp' ? (
            /* WhatsApp Confirmation View */
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-emerald-900 text-sm">
                    SafarGo Booking Confirmation Message Ready
                  </p>
                  <p className="text-emerald-800">
                    Send verified ticket details directly to customer via WhatsApp or copy message.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Customer Mobile: +91 {booking.customer_mobile}</span>
                  <button
                    onClick={handleCopyWhatsapp}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedWhatsapp ? 'Copied!' : 'Copy Confirmation'}
                  </button>
                </div>

                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs leading-relaxed border border-slate-800 whitespace-pre-wrap">
                  {whatsappConfirmationMessage}
                </pre>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href={customerWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition text-center"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  Open WhatsApp to Customer (+91 {booking.customer_mobile})
                </a>
                <button
                  onClick={handleCopyWhatsapp}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  {copiedWhatsapp ? 'Copied!' : 'Copy Message'}
                </button>
              </div>
            </div>
          ) : (
            /* Review & Verification Tab */
            <>
              {/* Agent & Customer Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Agent Details</span>
                  <p className="font-bold text-slate-900 text-sm">{booking.agent_name || 'Agent'}</p>
                  <p className="text-slate-500 font-mono">Mobile: {booking.agent_mobile || 'N/A'}</p>
                  <p className="text-slate-400">Agent ID: {booking.agent_id}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Customer Details</span>
                  <p className="font-bold text-slate-900 text-sm">{booking.customer_name}</p>
                  <p className="text-slate-500 font-mono">Mobile: +91 {booking.customer_mobile}</p>
                  <p className="text-slate-400">
                    Passengers: {booking.passenger_count} • Seat Type: {booking.seat_category.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              {/* Journey Details Summary */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-orange-600">
                  Requested Journey Information
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 block">From City:</span>
                    <span className="font-bold text-slate-800">{booking.from_city}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">To City:</span>
                    <span className="font-bold text-slate-800">{booking.to_city}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Journey Date:</span>
                    <span className="font-bold text-slate-800">{booking.journey_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Departure Pref:</span>
                    <span className="font-bold text-slate-800">{booking.departure_time_pref}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Boarding Point:</span>
                    <span className="font-semibold text-slate-700">{booking.boarding_point}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Drop Point:</span>
                    <span className="font-semibold text-slate-700">{booking.drop_point}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Operator Pref:</span>
                    <span className="font-semibold text-slate-700">{booking.operator_preference || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Estimated Total:</span>
                    <span className="font-black text-slate-900 text-sm">₹{booking.total_estimated_amount}</span>
                  </div>
                </div>

                {booking.passenger_details && booking.passenger_details.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block mb-1">Passenger Names:</span>
                    <div className="flex flex-wrap gap-2">
                      {booking.passenger_details.map((p, idx) => (
                        <span key={p.id || idx} className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                          {p.name} ({p.age}y, {p.gender})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {booking.agent_notes && (
                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900">
                    <strong>Agent Note: </strong> {booking.agent_notes}
                  </div>
                )}
              </div>

              {/* Advance Payment Verification Card */}
              <div className="p-4 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 rounded-2xl border-2 border-emerald-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {booking.payment_mode === 'agent_wallet' ? (
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <Wallet className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <QrCode className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        अग्रिम ऑनलाइन भुगतान विवरण (Advance Payment Verification)
                      </h3>
                      <span className="text-[10px] text-slate-500 font-medium">
                        सफ़ारगो नियम: टिकट कन्फर्मेशन से पूर्व अग्रिम भुगतान अनिवार्य
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      booking.payment_status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {booking.payment_status === 'paid' ? 'PAID (भुगतान प्राप्त)' : 'VERIFICATION PENDING'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">भुगतान माध्यम (Mode)</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5 text-xs">
                      {booking.payment_mode === 'agent_wallet' ? (
                        <>
                          <Wallet className="w-3.5 h-3.5 text-blue-600" />
                          <span>एजेंट प्रीपेड वॉलेट</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                          <span>SafarGo QR / UPI</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {booking.payment_mode === 'agent_wallet'
                        ? 'किराया एजेंट वॉलेट से पूर्व-डेबिट'
                        : `UPI ID: ${settings.safargo_upi_id}`}
                    </span>
                  </div>

                  <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">बैंक UTR / ट्रांजैक्शन ID</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {booking.payment_utr || 'N/A'}
                      </span>
                      {booking.payment_utr && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(booking.payment_utr || '');
                            setCopiedPaymentUtr(true);
                            success('UTR Copied', 'बैंक स्टेटमेंट में चेक करने हेतु कॉपी किया गया।');
                            setTimeout(() => setCopiedPaymentUtr(false), 2500);
                          }}
                          className="text-emerald-700 hover:text-emerald-900 p-1 rounded"
                          title="Copy UTR"
                        >
                          {copiedPaymentUtr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      कुल देय: ₹{booking.actual_fare || booking.total_estimated_amount}
                    </span>
                  </div>

                  <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 flex flex-col justify-between">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">पेमेंट स्क्रीनशॉट</span>
                    <div className="mt-1">
                      {booking.payment_screenshot_url ? (
                        <button
                          type="button"
                          onClick={() => setViewingPaymentReceipt(booking.payment_screenshot_url || null)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs transition"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>रसीद देखें (Receipt)</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-medium">
                          {booking.payment_mode === 'agent_wallet' ? 'वॉलेट ऑटो-कट (रसीद अप्रत्यक्ष)' : 'स्क्रीनशॉट संलग्न नहीं'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-100/60 border border-emerald-200 text-emerald-900 flex items-center justify-between text-[11px]">
                  <span>
                    💬 <strong>WhatsApp नियम:</strong> SafarGo QR भुगतान होने पर एजेंट को 15 मिनट विंडो के अंदर WhatsApp पर भी स्क्रीनशॉट भेजना अनिवार्य है।
                  </span>
                  <a
                    href={`https://wa.me/91${booking.customer_mobile.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline text-emerald-800 hover:text-emerald-950 ml-2 shrink-0"
                  >
                    चैट देखें
                  </a>
                </div>
              </div>

              {/* Operator Verification Inputs (Admin fills this when calling operator) */}
              <div className="p-5 bg-blue-50/50 rounded-2xl border-2 border-blue-200 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Bus Operator Verification & Ticket Entry (एडमिन सत्यापन)
                  </h3>
                </div>
                <p className="text-slate-500 text-[11px]">
                  बस ऑपरेटर से सीट चेक करने के बाद वास्तविक विवरण दर्ज करें। कन्फर्म करने पर एजेंट को ₹{settings.commission_rate.toFixed(2)} कमीशन स्वतः क्रेडिट होगा।
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Confirmed Seats (सीट नंबर) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={confirmedSeats}
                      onChange={(e) => setConfirmedSeats(e.target.value)}
                      placeholder="e.g. 14-U, 15-U (Upper Berth)"
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Ticket PNR / Reference <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ticketPnr}
                      onChange={(e) => setTicketPnr(e.target.value)}
                      placeholder="e.g. HT-987410"
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Actual Confirmed Fare (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={actualFare}
                      onChange={(e) => setActualFare(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Actual Bus Operator Name
                    </label>
                    <input
                      type="text"
                      value={actualOperator}
                      onChange={(e) => setActualOperator(e.target.value)}
                      placeholder="e.g. Hans Travels Pvt Ltd"
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Actual Boarding Point & Time
                    </label>
                    <input
                      type="text"
                      value={actualBoarding}
                      onChange={(e) => setActualBoarding(e.target.value)}
                      placeholder="e.g. Alambagh Stand (21:30)"
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Actual Drop Point & Time
                    </label>
                    <input
                      type="text"
                      value={actualDrop}
                      onChange={(e) => setActualDrop(e.target.value)}
                      placeholder="e.g. Kashmere Gate (06:00)"
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Ticket Document / PDF URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={ticketDocUrl}
                      onChange={(e) => setTicketDocUrl(e.target.value)}
                      placeholder="https://operator.com/tickets/HT-987410.pdf"
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Internal Admin Notes
                    </label>
                    <input
                      type="text"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Verified with operator dispatch desk on phone"
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Rejection Form Input */}
              {showRejectInput && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-3">
                  <h4 className="font-bold text-rose-900">रिफ्यूज / रिजेक्ट कारण दर्ज करें (Rejection Reason)</h4>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Bus fully booked by operator / Route unavailable for specified date..."
                    className="w-full p-2 rounded-xl border border-rose-300 bg-white outline-none text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowRejectInput(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}

              {/* Cancellation & Refund Processing Form */}
              {showCancelInput && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl space-y-3">
                  <h4 className="font-bold text-purple-900">कैनसिलेशन एवं रिफंड प्रक्रिया (Refund & Cancellation Desk)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-purple-900 mb-1">Refund Status</label>
                      <select
                        value={refundStatus}
                        onChange={(e) => setRefundStatus(e.target.value as RefundStatus)}
                        className="w-full p-2 rounded-xl border border-purple-300 bg-white font-medium"
                      >
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-purple-900 mb-1">Refund Amount (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-purple-300 bg-white font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="reverseComm"
                        checked={reverseComm}
                        onChange={(e) => setReverseComm(e.target.checked)}
                        className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                      />
                      <label htmlFor="reverseComm" className="font-semibold text-purple-900">
                        Reverse Agent Commission (₹{settings.commission_rate.toFixed(2)})
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowCancelInput(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProcessCancel}
                      disabled={isProcessing}
                      className="px-4 py-1.5 rounded-lg bg-purple-700 text-white font-bold hover:bg-purple-800 transition"
                    >
                      Finalize Cancellation
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Modal Action Bar */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {booking.status === 'expired' && (
              <button
                onClick={handleReopen}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reopen Request (15m Timer)
              </button>
            )}

            {booking.status !== 'rejected' && booking.status !== 'confirmed' && (
              <button
                onClick={() => setShowRejectInput(!showRejectInput)}
                className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-semibold transition"
              >
                Reject Request
              </button>
            )}

            {(booking.status === 'confirmed' || booking.status === 'cancellation_requested') && (
              <button
                onClick={() => setShowCancelInput(!showCancelInput)}
                className="px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold transition"
              >
                Process Cancellation / Refund
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-semibold transition"
            >
              Close
            </button>

            {booking.status !== 'confirmed' && booking.status !== 'rejected' && (
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isProcessing ? 'Confirming...' : `Confirm Ticket (+ ₹${settings.commission_rate.toFixed(2)} Comm)`}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Payment Receipt Image Preview Modal */}
      {viewingPaymentReceipt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white">
              <span className="font-bold text-sm">ग्राहक / एजेंट भुगतान रसीद (Payment Receipt Screenshot)</span>
              <button
                onClick={() => setViewingPaymentReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-auto bg-slate-950">
              <img
                src={viewingPaymentReceipt}
                alt="Payment Receipt Screenshot"
                className="max-h-[65vh] w-auto object-contain rounded-lg border border-slate-800 shadow-md"
              />
            </div>
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingPaymentReceipt(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
