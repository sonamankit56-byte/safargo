import React from 'react';
import { Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Printer,
  Share2,
  X,
  Bus,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

interface PrintTicketModalProps {
  booking: Booking;
  onClose: () => void;
}

export const PrintTicketModal: React.FC<PrintTicketModalProps> = ({ booking, onClose }) => {
  const { currentUser } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  const handleShareToCustomer = () => {
    const cleanPhone = booking.customer_mobile.replace(/\D/g, '');
    const message = `*SAFARGO ई-टिकट कन्फर्मेशन (E-TICKET)*
--------------------------------
*बुकिंग आईडी:* ${booking.booking_code}
*PNR नंबर:* ${booking.ticket_pnr || 'ऑपरेटर से कन्फर्म'}
*बस ऑपरेटर:* ${booking.actual_operator || booking.operator_preference}
*यात्री का नाम:* ${booking.customer_name} (${booking.passenger_count} यात्री)
*कन्फर्म सीट:* ${booking.confirmed_seats || 'Allotted by Operator'}
*श्रेणी:* ${booking.seat_category.toUpperCase().replace(/_/g, ' ')}
--------------------------------
*रूट:* ${booking.from_city} ➔ ${booking.to_city}
*यात्रा तारीख:* ${booking.journey_date}
*बोर्डिंग पॉइंट:* ${booking.actual_boarding_point || booking.boarding_point}
*ड्रॉप पॉइंट:* ${booking.actual_drop_point || booking.drop_point}
*कुल किराया:* ₹${booking.actual_fare || booking.total_estimated_amount}
--------------------------------
*जारीकर्ता एजेंट:* ${booking.agent_name || currentUser?.full_name || 'अधिकृत SafarGo केंद्र'}
*हेल्पलाइन:* 919876543210
*सफ़ारगो - अब हर सफर होगा आसान*
कृपया बस समय से 15 मिनट पूर्व बोर्डिंग पॉइंट पर पहुंचें। आधार कार्ड साथ रखें।`;

    window.open(`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="print:hidden p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-sm">कस्टमर ई-टिकट पर्ची (Printable Ticket)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              प्रिंट करें (Ctrl+P)
            </button>
            <button
              onClick={handleShareToCustomer}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp भेजें
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 font-sans print:p-2 print:text-black">
          
          {/* Ticket Header */}
          <div className="flex items-start justify-between border-b-2 border-dashed border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-md">
                <Bus className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">Safar<span className="text-orange-500">Go</span></span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                    E-TICKET
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">"अब हर सफर होगा आसान"</p>
                <p className="text-[10px] text-slate-400">अधिकृत ग्रामीण बस बुकिंग सेवा</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-semibold block uppercase">PNR नंबर</span>
              <span className="text-lg font-black text-emerald-700 font-mono tracking-wider block">
                {booking.ticket_pnr || 'HT-CONFIRMED'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">
                ID: {booking.booking_code}
              </span>
            </div>
          </div>

          {/* Journey Route Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl flex items-center justify-between print:bg-slate-100 print:text-black">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">प्रस्थान (Source)</span>
              <span className="text-lg font-black text-white print:text-black">{booking.from_city}</span>
            </div>
            <div className="flex flex-col items-center px-4">
              <Bus className="w-5 h-5 text-orange-400" />
              <div className="w-16 h-0.5 bg-orange-500 my-1" />
              <span className="text-[10px] text-slate-300 font-medium">डायरेक्ट बस</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">गंतव्य (Destination)</span>
              <span className="text-lg font-black text-white print:text-black">{booking.to_city}</span>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">यात्रा तारीख</span>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{booking.journey_date}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">बस ऑपरेटर</span>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate block">
                {booking.actual_operator || booking.operator_preference}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">कन्फर्म सीट</span>
              <span className="font-black text-emerald-700 text-xs sm:text-sm font-mono block">
                {booking.confirmed_seats || 'Allotted'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">सीट श्रेणी</span>
              <span className="font-bold text-slate-900 uppercase text-xs">
                {booking.seat_category.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Passenger & Boarding Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <User className="w-3.5 h-3.5 text-orange-500" />
                यात्री विवरण (Passengers)
              </span>
              <p className="text-slate-800 font-semibold">{booking.customer_name}</p>
              <p className="text-slate-500 text-[11px]">मोबाइल: {booking.customer_mobile}</p>
              {booking.passenger_details && booking.passenger_details.length > 0 && (
                <div className="pt-1 text-[11px] text-slate-600 border-t border-slate-100 mt-1">
                  {booking.passenger_details.map((p, i) => (
                    <span key={i} className="inline-block mr-2">
                      • {p.name} ({p.age}y/{p.gender})
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                बोर्डिंग व ड्रॉप पॉइंट
              </span>
              <p className="text-slate-800">
                <strong>बोर्डिंग:</strong> {booking.actual_boarding_point || booking.boarding_point}
              </p>
              <p className="text-slate-800">
                <strong>ड्रॉप:</strong> {booking.actual_drop_point || booking.drop_point}
              </p>
              <p className="text-[10px] text-rose-600 font-bold">
                * कृपया बस प्रस्थान से 15-20 मिनट पूर्व बोर्डिंग पॉइंट पर पहुंचें
              </p>
            </div>
          </div>

          {/* Fare and Agent Watermark */}
          <div className="border-t-2 border-dashed border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">जारीकर्ता केंद्र (Issued by Agent)</span>
              <span className="font-bold text-slate-900">
                {booking.agent_name || currentUser?.full_name} ({currentUser?.shop_name || 'CSC Point'})
              </span>
              <span className="text-[10px] text-slate-500 block">
                संपर्क: {booking.agent_mobile || currentUser?.mobile}
              </span>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">कुल भुगतान किराया</span>
              <span className="text-2xl font-black text-slate-900">
                ₹{booking.actual_fare || booking.total_estimated_amount}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                ✓ Paid & Verified
              </span>
            </div>
          </div>

          {/* Footer Guidelines */}
          <div className="p-3 bg-slate-50 rounded-xl text-[10px] text-slate-500 leading-relaxed border border-slate-100 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>यात्री निर्देश:</strong> यात्रा के समय एक मूल सरकारी पहचान पत्र (आधार/वोटर कार्ड) साथ रखें। आपातकाल या बस लोकेशन के लिए SafarGo हेल्पलाइन <strong>919876543210</strong> पर संपर्क करें।
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
