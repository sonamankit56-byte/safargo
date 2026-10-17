import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Sprout, PlusCircle, CheckCircle, Truck, Phone, MapPin, Tag } from 'lucide-react';

export const KisanPortal: React.FC = () => {
  const { state, store } = useStore();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'listings' | 'new_listing' | 'inquiries' | 'transport'>('listings');

  // New listing form state
  const [cropName, setCropName] = useState('Wheat (Sharbati)');
  const [variety, setVariety] = useState('Golden C-306');
  const [quantity, setQuantity] = useState(100);
  const [price, setPrice] = useState(2850);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('Pipariya Mandi Yard, MP');
  const [pickupReq, setPickupReq] = useState('Warehouse pickup or direct Mandi transport available.');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New transport request state
  const [trpCrop, setTrpCrop] = useState('Wheat');
  const [trpWeight, setTrpWeight] = useState(80);
  const [trpOrigin, setTrpOrigin] = useState('Pipariya Farmgate');
  const [trpDest, setTrpDest] = useState('Indore APMC Mandi');
  const [trpSuccess, setTrpSuccess] = useState<string | null>(null);

  const handleAddListing = (e: React.FormEvent) => {
    e.preventDefault();
    store.addCropListing({
      farmerId: 'farm-001',
      farmerName: currentUser.fullName,
      farmerPhone: currentUser.phone,
      cropName,
      variety,
      quantityQuintals: Number(quantity),
      expectedPricePerQuintal: Number(price),
      harvestDate,
      location,
      status: 'available',
      pickupRequirements: pickupReq,
    });

    setSuccessMsg(`Crop listing for ${cropName} (${quantity} Qtl) successfully published!`);
    setTimeout(() => {
      setSuccessMsg(null);
      setActiveTab('listings');
    }, 1500);
  };

  const handleTransportRequest = (e: React.FormEvent) => {
    e.preventDefault();
    store.createTransportRequest({
      requesterType: 'farmer',
      requesterName: currentUser.fullName,
      requesterPhone: currentUser.phone,
      cropType: trpCrop,
      weightQuintals: Number(trpWeight),
      pickupLocation: trpOrigin,
      deliveryLocation: trpDest,
      preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      status: 'requested',
    });

    setTrpSuccess('Transport request broadcasted to verified rural transporters!');
    setTimeout(() => {
      setTrpSuccess(null);
      setActiveTab('transport');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-slate-900">kisan.safargo.in</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5" />
              किसान सेवा पोर्टल
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Farmer: <strong>{currentUser.fullName}</strong> • Land: 12.5 Acres (Hoshangabad, MP) • Verified Kisan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'listings' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            My Harvest Listings ({state.cropListings.length})
          </button>
          <button
            onClick={() => setActiveTab('new_listing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'new_listing' ? 'bg-safargo-orange text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            + List Harvest Crop
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'inquiries' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Buyer Inquiries ({state.buyerInquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('transport')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'transport' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Mandi Transport ({state.transportRequests.length})
          </button>
        </div>
      </div>

      {/* TAB 1: LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Your Active Crop Listings</h3>
            <button
              onClick={() => setActiveTab('new_listing')}
              className="px-3 py-1.5 bg-safargo-orange text-white font-bold text-xs rounded-lg"
            >
              + Add New Crop
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.cropListings.map((c) => (
              <div key={c.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{c.cropName}</h4>
                    <span className="text-xs text-slate-500 font-medium">Variety: {c.variety}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {c.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 block">Available Quantity:</span>
                    <strong className="text-slate-900 font-bold">{c.quantityQuintals} Quintals</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Expected Price:</span>
                    <strong className="text-emerald-700 font-bold">₹{c.expectedPricePerQuintal} / Qtl</strong>
                  </div>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="text-slate-400">Location:</span> {c.location}
                </div>
                <div className="text-[11px] text-slate-500">
                  {c.pickupRequirements}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: NEW LISTING FORM */}
      {activeTab === 'new_listing' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-safargo-orange" />
            <h3 className="text-base font-bold text-slate-900">List Harvest Crop for Mandi Buyers</h3>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleAddListing} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Crop Name</label>
              <input
                type="text"
                required
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Variety / Grade</label>
              <input
                type="text"
                required
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity (Quintals)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expected Rate (₹/Quintal)</label>
                <input
                  type="number"
                  min={100}
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mandi / Warehouse Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pickup Requirements</label>
              <textarea
                rows={2}
                value={pickupReq}
                onChange={(e) => setPickupReq(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
            >
              Publish Listing to Buyer Network
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900">Buyer Inquiries & Price Offers</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Crop</th>
                  <th className="p-3">Buyer Name</th>
                  <th className="p-3">Offered Rate</th>
                  <th className="p-3">Quantity Needed</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.buyerInquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td className="p-3 font-semibold text-slate-900">{inq.cropName}</td>
                    <td className="p-3">{inq.buyerName} ({inq.buyerPhone})</td>
                    <td className="p-3 font-bold text-emerald-700">₹{inq.offeredPricePerQuintal} / Qtl</td>
                    <td className="p-3">{inq.requiredQuantityQuintals} Qtl</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        {inq.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TRANSPORT LOGISTICS */}
      {activeTab === 'transport' && (
        <div className="space-y-6">
          <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-safargo-navy" />
              <h3 className="text-base font-bold text-slate-900">Request Truck / Vehicle Transport to Mandi</h3>
            </div>

            {trpSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold">
                {trpSuccess}
              </div>
            )}

            <form onSubmit={handleTransportRequest} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Crop to Transport</label>
                <input
                  type="text"
                  required
                  value={trpCrop}
                  onChange={(e) => setTrpCrop(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Weight (Quintals)</label>
                <input
                  type="number"
                  min={10}
                  value={trpWeight}
                  onChange={(e) => setTrpWeight(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pickup Village / Farmgate</label>
                  <input
                    type="text"
                    required
                    value={trpOrigin}
                    onChange={(e) => setTrpOrigin(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Mandi</label>
                  <input
                    type="text"
                    required
                    value={trpDest}
                    onChange={(e) => setTrpDest(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-safargo-navy hover:bg-slate-800 text-white font-bold rounded-lg shadow"
              >
                Submit Transport Request to Transporters
              </button>
            </form>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-900">Your Mandi Trips & Status</h4>
            <div className="divide-y divide-slate-100">
              {state.transportRequests.map((t) => (
                <div key={t.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900">{t.cropType} ({t.weightQuintals} Qtl)</div>
                    <div className="text-slate-500">{t.pickupLocation} → {t.deliveryLocation}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                      {t.status.toUpperCase()}
                    </span>
                    {t.fareAgreed && <div className="text-emerald-700 font-bold mt-0.5">₹{t.fareAgreed}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
