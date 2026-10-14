import React, { useState } from 'react';
import { Booking } from '../../types';
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
  QrCode,
  Copy,
  Check,
  Sparkles,
  Award
} from 'lucide-react';

interface LiveTicketGreenCardProps {
  booking: Booking;
  onClose?: () => void;
  isModal?: boolean;
}

export const LiveTicketGreenCard: React.FC<LiveTicketGreenCardProps> = ({
  booking,
  onClose,
  isModal = true,
}) => {
  const [copiedPnr, setCopiedPnr] = useState(false);

  const cleanFare = Number(booking.actual_fare ?? booking.total_estimated_amount ?? (booking as any).total_fare ?? 0);
  const pnr = booking.ticket_pnr || `PNR-${booking.booking_code.slice(-6)}`;
  const operator = booking.actual_operator || booking.operator_preference || 'SafarGo Super Express';
  const fromCity = booking.from_city || (booking as any).source || 'Sironj';
  const toCity = booking.to_city || (booking as any).destination || 'Bhopal';
  const seats = booking.confirmed_seats || `${booking.seat_count || 1} Seat(s)`;

  // QR verification url
  const verifyUrl = `https://safargo.in/verify-ticket?pnr=${encodeURIComponent(pnr)}&code=${booking.booking_code}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verifyUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPnr = () => {
    navigator.clipboard.writeText(pnr);
    setCopiedPnr(true);
    setTimeout(() => setCopiedPnr(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const cleanPhone = (booking.customer_mobile || '').replace(/\D/g, '');
    const message = `*🟢 SAFARGO LIVE TICKET GREEN CARD (ई-टिकट)*
--------------------------------
*बुकिंग आईडी:* ${booking.booking_code}
*कन्फर्म PNR:* ${pnr}
*बस ऑपरेटर:* ${operator}
*रूट:* ${fromCity} ➔ ${toCity}
*यात्रा दिनांक:* ${booking.journey_date}
*कन्फर्म सीट:* ${seats}
*यात्री का नाम:* ${booking.customer_name}
*बोर्डिंग पॉइंट:* ${booking.actual_boarding_point || booking.boarding_point || 'मुख्य बस स्टैंड'}
*कुल किराया:* ₹${cleanFare}
*स्थिति:* ✅ LIVE CONFIRMED TICKET
--------------------------------
सफ़ारगो हेल्पलाइन: +91 919876543210
कृपया यात्रा के समय आधार कार्ड साथ रखें। शुभ यात्रा!`;

    window.open(
      `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const cardContent = (
    <div className="bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-500 rounded-3xl text-white shadow-[0_0_35px_rgba(16,185,129,0.35)] overflow-hidden font-sans max-w-xl w-full">
      
      {/* Green Card Hologram Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-slate-950 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-slate-950 text-emerald-400 flex items-center justify-center font-black shadow-lg">
            <Bus className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-wider uppercase text-slate-950">
                SAFARGO GREEN CARD
              </span>
              <span className="bg-slate-950 text-emerald-300 text-[9px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                LIVE TICKET
              </span>
            </div>
            <p className="text-[10px] font-bold text-emerald-950">
              आधिकारिक डिजिटल ई-टिकट एवं बोर्डिंग पास (M.P. Transport Network)
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="print:hidden p-1.5 rounded-xl bg-slate-950/40 hover:bg-slate-950 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6 space-y-5 text-xs">
        
        {/* PNR Banner */}
        <div className="p-4 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500/60 flex items-center justify-between gap-3 shadow-inner">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
              कन्फर्म PNR नंबर (Official PNR)
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300 tracking-wide">
              {pnr}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyPnr}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold flex items-center gap-1 transition"
          >
            {copiedPnr ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPnr ? 'कॉपी हुआ' : 'कॉपी PNR'}</span>
          </button>
        </div>

        {/* Route Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-white">{fromCity}</span>
              <span className="text-emerald-400 font-bold">➔</span>
              <span className="text-base sm:text-lg font-black text-white">{toCity}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              कन्फर्म सीट: {seats}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">बस ऑपरेटर:</span>
              <strong className="text-white font-bold">{operator}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">यात्रा दिनांक:</span>
              <strong className="text-emerald-300 font-bold">{booking.journey_date}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">प्रस्थान समय:</span>
              <strong className="text-white font-bold">{booking.departure_time_pref || 'Regular'}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1">
            <div className="flex items-start gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>बोर्डिंग पॉइंट:</strong> {booking.actual_boarding_point || booking.boarding_point || 'मुख्य बस स्टैंड'}
              </span>
            </div>
            {booking.actual_drop_point && (
              <div className="flex items-start gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong>ड्रॉप पॉइंट:</strong> {booking.actual_drop_point}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Passenger & Fare Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Passenger Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">यात्री विवरण (Lead Passenger)</span>
            <div className="text-sm font-black text-white">{booking.customer_name}</div>
            <div className="text-[11px] text-slate-300 font-mono">+91 {booking.customer_mobile}</div>
            <div className="text-[10px] text-emerald-400 font-bold">
              श्रेणी: {(booking.seat_category || 'regular').toUpperCase()}
            </div>
          </div>

          {/* Fare & Commission Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">कुल भुगतान</span>
              <span className="text-base font-black text-white font-mono">
                ₹{cleanFare.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-[10px]">
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                GO एजेंट कमीशन:
              </span>
              <strong className="text-emerald-400 font-black">+₹20.00 कैश</strong>
            </div>

            <span className="text-[9px] text-slate-400 block text-right">
              भुगतान: Go Wallet / Instant
            </span>
          </div>

        </div>

        {/* QR Code Barcode Verification */}
        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              बस कंडक्टर लाइव वेरिफिकेशन
            </span>
            <p className="text-[10px] text-slate-400 leading-snug">
              बस में चढ़ते समय यह QR कोड या PNR दिखाएं। आईडी कार्ड (आधार) साथ रखना अनिवार्य है।
            </p>
            <span className="text-[9px] font-mono text-slate-500 block">
              Booking Ref: {booking.booking_code}
            </span>
          </div>

          <div className="w-20 h-20 bg-white p-1 rounded-xl shrink-0 shadow-md">
            <img src={qrUrl} alt="Verify QR" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="print:hidden pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp पर ग्राहक को भेजें</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-black text-xs transition flex items-center justify-center gap-2 border border-slate-700 shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>ई-टिकट प्रिंट करें (Ctrl+P)</span>
          </button>
        </div>

      </div>

    </div>
  );

  if (!isModal) {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      {cardContent}
    </div>
  );
};
