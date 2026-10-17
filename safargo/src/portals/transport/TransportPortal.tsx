import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Truck, CheckCircle2, Clock, MapPin, Calendar } from 'lucide-react';

export const TransportPortal: React.FC = () => {
  const { state, store } = useStore();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'requests' | 'active_trips'>('requests');

  const pendingRequests = state.transportRequests.filter((t) => t.status === 'requested');
  const myAssignedTrips = state.transportRequests.filter((t) => t.status !== 'requested');

  const handleAcceptRequest = (requestId: string) => {
    const req = state.transportRequests.find((t) => t.id === requestId);
    if (!req) return;

    req.status = 'assigned';
    req.transporterId = currentUser.id;
    req.transporterName = currentUser.fullName;
    req.vehicleNumber = 'MP-09-AB-1234';
    req.fareAgreed = req.weightQuintals * 145; // standard rate

    store.logAudit(currentUser.id, currentUser.fullName, 'transporter', 'ACCEPT_TRANSPORT', 'transport', req.id, `Accepted transport for ${req.cropType}`);
    store.save();
  };

  const handleUpdateStatus = (requestId: string, nextStatus: any) => {
    const req = state.transportRequests.find((t) => t.id === requestId);
    if (!req) return;

    req.status = nextStatus;
    store.logAudit(currentUser.id, currentUser.fullName, 'transporter', 'UPDATE_TRANSPORT_STATUS', 'transport', req.id, `Status updated to ${nextStatus}`);
    store.save();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-slate-900">transport.safargo.in</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold border border-cyan-200 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              Kisan Logistics Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Transporter: <strong>{currentUser.fullName}</strong> • Fleet: 16 Tonne Truck (MP-09-AB-1234) • Verified Carrier
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'requests' ? 'bg-cyan-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Available Rural Loads ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('active_trips')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'active_trips' ? 'bg-cyan-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Active Deliveries ({myAssignedTrips.length})
          </button>
        </div>
      </div>

      {/* TAB 1: AVAILABLE LOAD REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Open Rural-to-Mandi Transport Requests</h3>
          {pendingRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div key={req.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{req.cropType} Transport</h4>
                      <div className="text-slate-500">Weight: <strong>{req.weightQuintals} Quintals</strong></div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                      OPEN LOAD
                    </span>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-3 rounded-xl text-slate-700">
                    <div>Pickup: <strong>{req.pickupLocation}</strong></div>
                    <div>Destination: <strong>{req.deliveryLocation}</strong></div>
                    <div>Requested by: {req.requesterName} ({req.requesterPhone})</div>
                  </div>

                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="w-full py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl shadow"
                  >
                    Accept Trip & Assign Fleet
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No open transport requests available in your service area.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE TRIPS */}
      {activeTab === 'active_trips' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900">Your Fleet Trips</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Cargo</th>
                  <th className="p-3">Weight</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Agreed Freight</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myAssignedTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td className="p-3 font-semibold text-slate-900">{trip.cropType}</td>
                    <td className="p-3">{trip.weightQuintals} Qtl</td>
                    <td className="p-3">{trip.pickupLocation} → {trip.deliveryLocation}</td>
                    <td className="p-3 font-bold text-emerald-700">₹{trip.fareAgreed || 14500}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold text-[10px]">
                        {trip.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {trip.status === 'assigned' && (
                        <button
                          onClick={() => handleUpdateStatus(trip.id, 'in_transit')}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded"
                        >
                          Mark In-Transit
                        </button>
                      )}
                      {trip.status === 'in_transit' && (
                        <button
                          onClick={() => handleUpdateStatus(trip.id, 'delivered')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
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
