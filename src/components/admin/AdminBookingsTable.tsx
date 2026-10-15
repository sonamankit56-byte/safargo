import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Booking, BookingStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { CountdownTimer } from '../common/CountdownTimer';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  MapPin,
  RefreshCw,
  Download
} from 'lucide-react';

interface AdminBookingsTableProps {
  onOpenBooking: (bookingId: string) => void;
}

export const AdminBookingsTable: React.FC<AdminBookingsTableProps> = ({ onOpenBooking }) => {
  const { bookings, confirmBooking } = useData();
  const { allProfiles } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [journeyDateFilter, setJourneyDateFilter] = useState<string>('');

  const agentsList = useMemo(() => {
    return allProfiles.filter((p) => p.role === 'agent');
  }, [allProfiles]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        b.booking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customer_mobile.includes(searchTerm) ||
        b.from_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.to_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.ticket_pnr && b.ticket_pnr.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.agent_name && b.agent_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchAgent = agentFilter === 'all' || b.agent_id === agentFilter;
      const matchDate = !journeyDateFilter || b.journey_date === journeyDateFilter;

      return matchSearch && matchStatus && matchAgent && matchDate;
    });
  }, [bookings, searchTerm, statusFilter, agentFilter, journeyDateFilter]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            बुकिंग प्रबंधन तालिका (Booking Management Desk)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            सभी एजेंट रिक्वेस्ट्स, ऑपरेटर चेकिंग, 15 मिनट रिस्पॉन्स टाइमर एवं पीएनआर प्रबंधन
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">कुल रिकॉर्ड्स</span>
          <span className="text-sm font-bold text-slate-900">{filteredBookings.length} Bookings</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, Customer, Mobile, PNR..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Statuses (सभी स्थितियाँ)</option>
              <option value="booking_request">Booking Request (Pending)</option>
              <option value="awaiting_operator_confirmation">Awaiting Operator Confirmation</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
              <option value="cancellation_requested">Cancellation Requested</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Agent Filter */}
          <div>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Agents (सभी एजेंट)</option>
              {agentsList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.full_name} ({a.shop_name || a.city})
                </option>
              ))}
            </select>
          </div>

          {/* Journey Date Filter */}
          <div>
            <input
              type="date"
              value={journeyDateFilter}
              onChange={(e) => setJourneyDateFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Filter by Journey Date"
            />
          </div>
        </div>

        {journeyDateFilter && (
          <div className="flex justify-end">
            <button
              onClick={() => setJourneyDateFilter('')}
              className="text-xs text-orange-600 hover:underline font-semibold"
            >
              Clear Date Filter
            </button>
          </div>
        )}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            कोई बुकिंग रिकॉर्ड नहीं मिला।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-300 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Status & Countdown</th>
                  <th className="p-4">Agent</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Journey Date</th>
                  <th className="p-4">Seat Category</th>
                  <th className="p-4">Fare</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <span className="font-mono font-bold text-slate-900 block">{b.booking_code}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <StatusBadge status={b.status} size="sm" />
                        <div>
                          <CountdownTimer deadlineAt={b.deadline_at} status={b.status} compact />
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-800 block">{b.agent_name || 'Agent'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">+91 {b.agent_mobile || 'N/A'}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-900 block">{b.customer_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">+91 {b.customer_mobile}</span>
                      <span className="text-[10px] text-slate-400 block">{b.passenger_count} passenger(s)</span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">
                        {b.from_city} → {b.to_city}
                      </span>
                      <span className="text-[10px] text-slate-500 block">B: {b.boarding_point}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-800 block">{b.journey_date}</span>
                      <span className="text-[10px] text-slate-400 block">{b.departure_time_pref}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold uppercase text-orange-600 block">
                        {b.seat_category.replace(/_/g, ' ')}
                      </span>
                      {b.confirmed_seats ? (
                        <span className="text-[10px] font-bold text-emerald-700 block">
                          Seats: {b.confirmed_seats}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block">Unassigned</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="font-black text-slate-900 block">
                        ₹{b.actual_fare || b.total_estimated_amount}
                      </span>
                      {b.ticket_pnr && (
                        <span className="text-[10px] font-mono text-emerald-700 font-bold block">
                          PNR: {b.ticket_pnr}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(b.status === 'booking_request' || b.status === 'awaiting_operator_confirmation') && (
                          <button
                            onClick={async () => {
                              const autoPnr = `SFG-${Math.floor(100000 + Math.random() * 900000)}`;
                              await confirmBooking(b.id, {
                                actual_fare: b.actual_fare || b.total_estimated_amount,
                                confirmed_seats: b.confirmed_seats || b.seat_category || 'Confirmed Seat',
                                actual_operator: b.operator_preference || 'Verified Bus Operator',
                                actual_boarding_point: b.boarding_point || `${b.from_city} Stand`,
                                actual_drop_point: b.drop_point || `${b.to_city} Stand`,
                                ticket_pnr: autoPnr,
                                admin_notes: '1-Click Quick Confirm from Admin Bookings Table',
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1 text-xs cursor-pointer active:scale-95 shadow-sm"
                            title="तुरंत PNR बनाकर टिकट जारी करें"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>⚡ 1-क्लिक</span>
                          </button>
                        )}
                        <button
                          onClick={() => onOpenBooking(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-orange-600 text-white font-bold transition flex items-center gap-1.5 text-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
