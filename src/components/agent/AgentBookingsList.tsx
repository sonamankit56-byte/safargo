import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Booking, BookingStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { CountdownTimer } from '../common/CountdownTimer';
import { BookingSuccessModal } from './BookingSuccessModal';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  AlertTriangle,
  FileText,
  MapPin,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X,
  Printer,
  Download
} from 'lucide-react';
import { PrintTicketModal } from '../common/PrintTicketModal';

export const AgentBookingsList: React.FC = () => {
  const { agentBookings, requestCancellation, settings } = useData();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBookingForWhatsApp, setSelectedBookingForWhatsApp] = useState<Booking | null>(null);
  const [printModalBooking, setPrintModalBooking] = useState<Booking | null>(null);

  // Cancellation Modal state
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const filteredBookings = useMemo(() => {
    return agentBookings.filter((b) => {
      const matchSearch =
        b.booking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customer_mobile.includes(searchTerm) ||
        b.from_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.to_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.ticket_pnr && b.ticket_pnr.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = selectedStatus === 'all' || b.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [agentBookings, searchTerm, selectedStatus]);

  const handleOpenCancelModal = (b: Booking) => {
    setCancelModalBooking(b);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    if (!cancelReason.trim()) {
      error('Reason Required', 'Please provide a reason for cancelling this booking.');
      return;
    }

    setIsSubmittingCancel(true);
    try {
      await requestCancellation(cancelModalBooking.id, cancelReason.trim());
      setCancelModalBooking(null);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleExportBookingsCsv = () => {
    if (agentBookings.length === 0) return;
    const headers = ['Booking ID', 'Customer Name', 'Customer Mobile', 'Passengers', 'From', 'To', 'Journey Date', 'Seats', 'Total Fare', 'Status', 'PNR', 'Booking Date'];
    const rows = agentBookings.map((b) => [
      b.booking_code,
      `"${b.customer_name.replace(/"/g, '""')}"`,
      b.customer_mobile,
      b.passenger_count,
      b.from_city,
      b.to_city,
      b.journey_date,
      `"${b.confirmed_seats || b.seat_category}"`,
      b.actual_fare || b.total_estimated_amount,
      b.status,
      b.ticket_pnr || '',
      new Date(b.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SafarGo_Bookings_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">मेरी बस बुकिंग्स (My Bookings)</h1>
          <p className="text-xs text-slate-500 mt-1">
            सभी मैनुअल बुकिंग रिक्वेस्ट, रिस्पॉन्स टाइमर एवं ऑपरेटर पीएनआर स्टेटस
          </p>
        </div>
        <div className="flex items-center gap-3">
          {agentBookings.length > 0 && (
            <button
              onClick={handleExportBookingsCsv}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>बुकिंग रिपोर्ट (CSV)</span>
            </button>
          )}
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-orange-800">
            <CheckCircle2 className="w-4 h-4 text-orange-600" />
            <span>Eligible Commission: ₹{settings.commission_rate.toFixed(2)} per confirmed seat</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Booking ID, Customer, Mobile, Route, PNR..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {[
            { id: 'all', label: 'All' },
            { id: 'booking_request', label: 'Pending' },
            { id: 'awaiting_operator_confirmation', label: 'Awaiting Operator' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'expired', label: 'Expired' },
            { id: 'cancellation_requested', label: 'Cancel Requested' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedStatus === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List Cards */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">कोई बुकिंग नहीं मिली</p>
          <p className="text-xs text-slate-400 mt-1">
            अपने खोज शब्दों या फ़िल्टर को बदलें, अथवा नया टिकट बुक करें।
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                
                {/* ID & Route & Status */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                      {b.booking_code}
                    </span>
                    <StatusBadge status={b.status} size="sm" />
                    <span className="text-xs text-slate-400">
                      Req: {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>{b.from_city}</span>
                    <span className="text-slate-400">→</span>
                    <span>{b.to_city}</span>
                  </h3>
                </div>

                {/* Right Badges: Timer & Commission */}
                <div className="flex items-center gap-3">
                  <CountdownTimer deadlineAt={b.deadline_at} status={b.status} />

                  {b.status === 'confirmed' ? (
                    <div className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-right">
                      <span className="text-[10px] text-emerald-700 uppercase font-bold block">Commission</span>
                      <span className="text-sm font-black text-emerald-700">+₹{settings.commission_rate.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Est. Commission</span>
                      <span className="text-sm font-semibold text-slate-600">₹{settings.commission_rate.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Customer (ग्राहक)</span>
                  <span className="font-bold text-slate-800 text-sm">{b.customer_name}</span>
                  <span className="text-slate-500 block font-mono">+91 {b.customer_mobile}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Journey Date & Time</span>
                  <span className="font-semibold text-slate-800">{b.journey_date}</span>
                  <span className="text-slate-500 block">{b.departure_time_pref}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Seats & Category</span>
                  <span className="font-semibold text-slate-800">{b.passenger_count} Passenger(s)</span>
                  <span className="text-orange-600 block uppercase font-medium">
                    {b.seat_category.replace(/_/g, ' ')}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Estimated Amount</span>
                  <span className="font-black text-slate-900 text-base">₹{b.total_estimated_amount}</span>
                  <span className="text-slate-500 block">Boarding: {b.boarding_point}</span>
                </div>
              </div>

              {/* Operator Confirmed Ticket Box (If Confirmed) */}
              {b.status === 'confirmed' && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 mb-3 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-900">
                        ऑपरेटर द्वारा टिकट जारी (Verified by Operator): {b.actual_operator || 'Bus Operator'}
                      </p>
                      <p className="text-emerald-800">
                        कन्फर्म सीटें: <strong>{b.confirmed_seats || 'Allotted'}</strong> • Actual Fare: ₹{b.actual_fare || b.total_estimated_amount}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.ticket_pnr && (
                      <span className="bg-white font-mono font-bold text-emerald-800 px-2.5 py-1 rounded border border-emerald-300">
                        PNR: {b.ticket_pnr}
                      </span>
                    )}
                    <button
                      onClick={() => setPrintModalBooking(b)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      प्रिंट टिकट पर्ची
                    </button>
                    {b.ticket_doc_url && (
                      <a
                        href={b.ticket_doc_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition"
                      >
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection or Expiry Note */}
              {b.rejection_reason && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-3 text-xs text-rose-800 flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">कारण (Reason): </span>
                    <span>{b.rejection_reason}</span>
                  </div>
                </div>
              )}

              {/* Cancellation Reason Note */}
              {b.cancellation_reason && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-3 text-xs text-purple-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Cancellation Request Reason: </span>
                    <span>{b.cancellation_reason}</span>
                    <span className="block mt-0.5 font-medium text-purple-700">
                      Refund Status: {b.refund_status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-slate-500">
                  {b.passenger_details && b.passenger_details.length > 0 && (
                    <span>
                      यात्री नाम: {b.passenger_details.map((p) => p.name).filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Resend WhatsApp button */}
                  <button
                    onClick={() => setSelectedBookingForWhatsApp(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    SafarGo WhatsApp Support
                  </button>

                  {/* Cancel Button if active */}
                  {b.status !== 'cancelled' && b.status !== 'cancellation_requested' && (
                    <button
                      onClick={() => handleOpenCancelModal(b)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold transition"
                    >
                      Request Cancellation
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp Resend Modal */}
      {selectedBookingForWhatsApp && (
        <BookingSuccessModal
          booking={selectedBookingForWhatsApp}
          onClose={() => setSelectedBookingForWhatsApp(null)}
        />
      )}

      {/* Cancellation Request Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">बुकिंग रद्द करने का अनुरोध</h2>
              <button
                onClick={() => setCancelModalBooking(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <p className="text-slate-600">
                Booking ID: <strong>{cancelModalBooking.booking_code}</strong> ({cancelModalBooking.customer_name})
              </p>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900">
                <p className="font-semibold mb-1">कृपया ध्यान दें (Cancellation Policy):</p>
                <p>
                  रद्द करने का अनुरोध ऑपरेटर के कैंसिलेशन नियमों और रिफंड शर्तों के अधीन है। यदि बुकिंग पहले से कन्फर्म थी, तो एडमिन द्वारा कैंसिलेशन पूरा होने पर संबंधित कमीशन रिवर्स किया जा सकता है।
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  रद्द करने का कारण (Reason for Cancellation) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Customer change of travel plans / Passenger unwell..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                वापस जाएं (Cancel)
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isSubmittingCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition disabled:opacity-50"
              >
                {isSubmittingCancel ? 'Submitting...' : 'अनुरोध सबमिट करें (Submit Request)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable E-Ticket Slip Modal */}
      {printModalBooking && (
        <PrintTicketModal
          booking={printModalBooking}
          onClose={() => setPrintModalBooking(null)}
        />
      )}
    </div>
  );
};
