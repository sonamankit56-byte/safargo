import React from 'react';
import { Booking } from '../types';
import { Bus, MapPin, Calendar, Clock, QrCode, Printer, CheckCircle2, ShieldCheck, Phone } from 'lucide-react';

interface Props {
  booking: Booking;
}

export const TicketCard: React.FC<Props> = ({ booking }) => {
  const handlePrint = () => {
    window.print();
  };

  const isCancelled = booking.status === 'cancelled';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-3xl mx-auto print:border-none print:shadow-none">
      {/* Top Banner */}
      <div className={`p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isCancelled
          ? 'bg-gradient-to-r from-slate-700 to-slate-800'
          : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <Bus className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">SAFAR GO E-TICKET</div>
            <p className="text-xs text-red-100 font-medium">Valid for Official Intercity Travel</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-left sm:text-right bg-white/10 px-3.5 py-1.5 rounded-xl backdrop-blur-xs">
            <div className="text-[10px] text-red-200 font-bold uppercase tracking-wider">PNR NUMBER</div>
            <div className="text-lg font-black tracking-wider text-white font-mono">{booking.pnr}</div>
          </div>
          <button
            onClick={handlePrint}
            title="Print Ticket"
            className="p-2.5 rounded-xl bg-white text-slate-800 hover:bg-slate-100 transition-colors shadow-sm cursor-pointer print:hidden shrink-0"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Ticket Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Status indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {isCancelled ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700">
                BOOKING CANCELLED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> CONFIRMED TICKET
              </span>
            )}
            <span className="text-xs text-slate-400">
              Booked on {new Date(booking.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Total Paid: </span>
            <span className="text-xl font-black text-slate-900">₹{booking.totalAmount}</span>
          </div>
        </div>

        {/* Route & Operator Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Bus Operator</div>
            <div className="text-base font-extrabold text-slate-900">{booking.bus.operator.name}</div>
            <p className="text-xs text-slate-500">{booking.bus.operator.busType}</p>
          </div>
          <div className="sm:text-right">
            <div className="text-xs font-bold text-slate-400 uppercase">Reserved Seats</div>
            <div className="text-lg font-black text-red-600">
              {booking.selectedSeats.map(s => s.number).join(', ')}
            </div>
            <p className="text-xs text-slate-500">
              {booking.selectedSeats.length} {booking.selectedSeats.length === 1 ? 'Passenger' : 'Passengers'}
            </p>
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-2">
          {/* Pickup */}
          <div className="md:col-span-5 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4" /> Boarding Point
            </div>
            <div className="text-lg font-black text-slate-900">{booking.boardingPoint.time}</div>
            <div className="text-sm font-bold text-slate-800">{booking.boardingPoint.location}</div>
            <div className="text-xs text-slate-500">{booking.boardingPoint.landmark}</div>
            <div className="text-xs font-semibold text-slate-400">
              Date: {new Date(booking.journeyDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {/* Duration center */}
          <div className="md:col-span-2 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400">{booking.bus.duration}</span>
            <div className="w-full h-0.5 bg-slate-300 relative my-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-600 absolute -top-1 left-0" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 absolute -top-1 right-0" />
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono">NON-STOP</span>
          </div>

          {/* Dropping */}
          <div className="md:col-span-5 text-left md:text-right space-y-1">
            <div className="flex items-center md:justify-end gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4" /> Dropping Point
            </div>
            <div className="text-lg font-black text-slate-900">{booking.droppingPoint.time}</div>
            <div className="text-sm font-bold text-slate-800">{booking.droppingPoint.location}</div>
            <div className="text-xs text-slate-500">{booking.droppingPoint.landmark}</div>
            <div className="text-xs font-semibold text-slate-400">Destination: {booking.bus.toCity}</div>
          </div>
        </div>

        {/* Passenger Information Table */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Passenger Details
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Seat</th>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Age</th>
                  <th className="py-2.5 px-4">Gender</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {booking.passengers.map((p, idx) => (
                  <tr key={idx} className="font-medium text-slate-700">
                    <td className="py-2.5 px-4 font-black text-red-600">{p.seatNumber}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{p.name || 'Primary Passenger'}</td>
                    <td className="py-2.5 px-4">{p.age} yrs</td>
                    <td className="py-2.5 px-4 uppercase text-[11px] font-semibold">{p.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QR Code & Contact Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-dashed border-slate-200">
          <div className="flex items-center gap-3 text-left">
            {/* SVG QR Code Simulation */}
            <div className="w-16 h-16 bg-slate-900 rounded-xl p-2 text-white flex items-center justify-center shrink-0">
              <QrCode className="w-12 h-12" />
            </div>
            <div className="text-xs text-slate-500">
              <p className="font-bold text-slate-800">Scan at Bus Boarding</p>
              <p>Contact: {booking.contactPhone}</p>
              <p>Email: {booking.contactEmail}</p>
            </div>
          </div>

          <div className="text-xs text-slate-400 text-left sm:text-right">
            <p className="flex items-center sm:justify-end gap-1 text-slate-600 font-semibold">
              <Phone className="w-3.5 h-3.5 text-red-600" /> Helpline: 1800-SAFAR-GO
            </p>
            <p>Please carry a valid government photo ID.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
