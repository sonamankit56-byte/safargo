import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Search, CheckCircle, Tag, Phone } from 'lucide-react';
import { CropListing } from '../../lib/types';

export const BuyerPortal: React.FC = () => {
  const { state, store } = useStore();
  const { currentUser } = useAuth();

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<CropListing | null>(null);
  const [offerPrice, setOfferPrice] = useState(2800);
  const [offerQuantity, setOfferQuantity] = useState(50);
  const [submittedMsg, setSubmittedMsg] = useState(false);

  const filteredCrops = state.cropListings.filter((c) =>
    c.cropName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.variety.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.location.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop) return;

    store.submitBuyerInquiry({
      cropListingId: selectedCrop.id,
      cropName: selectedCrop.cropName,
      buyerId: currentUser.id,
      buyerName: currentUser.fullName,
      buyerPhone: currentUser.phone,
      offeredPricePerQuintal: Number(offerPrice),
      requiredQuantityQuintals: Number(offerQuantity),
      status: 'pending',
    });

    setSubmittedMsg(true);
    setTimeout(() => {
      setSubmittedMsg(false);
      setSelectedCrop(null);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-slate-900">buyer.safargo.in</span>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200">
              Agri Mandi Buyer Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Buyer: <strong>{currentUser.fullName}</strong> • Mandi Trader License: MP-APMC-8812 • Verified Buyer
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search crop or location..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 w-64"
          />
        </div>
      </div>

      {/* Offer Modal */}
      {selectedCrop && (
        <div className="p-6 bg-white rounded-2xl border-2 border-teal-400 shadow-xl space-y-4 text-xs max-w-xl mx-auto">
          <div className="flex justify-between items-center font-bold text-slate-900">
            <span>Make Offer for {selectedCrop.cropName} ({selectedCrop.variety})</span>
            <button onClick={() => setSelectedCrop(null)} className="text-slate-400 hover:text-slate-700">✕</button>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl">
            <div>Farmer: <strong>{selectedCrop.farmerName}</strong> ({selectedCrop.farmerPhone})</div>
            <div>Available: <strong>{selectedCrop.quantityQuintals} Quintals</strong> • Asking Rate: ₹{selectedCrop.expectedPricePerQuintal}/Qtl</div>
          </div>

          {submittedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold">
              Offer sent to farmer directly!
            </div>
          )}

          <form onSubmit={handleInquirySubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Offered Rate (₹/Qtl)</label>
                <input
                  type="number"
                  min={100}
                  required
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Quantity (Qtl)</label>
                <input
                  type="number"
                  min={1}
                  max={selectedCrop.quantityQuintals}
                  required
                  value={offerQuantity}
                  onChange={(e) => setOfferQuantity(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow"
            >
              Submit Purchase Inquiry
            </button>
          </form>
        </div>
      )}

      {/* Crop Listings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCrops.map((crop) => (
          <div key={crop.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-base font-bold text-slate-900">{crop.cropName}</h4>
                <div className="text-xs text-slate-500">{crop.variety}</div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {crop.status.toUpperCase()}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Available:</span>
                <strong>{crop.quantityQuintals} Quintals</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Asking Price:</span>
                <strong className="text-emerald-700">₹{crop.expectedPricePerQuintal} / Qtl</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Farmer:</span>
                <span>{crop.farmerName}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 truncate">
              Location: {crop.location}
            </div>

            <button
              onClick={() => {
                setSelectedCrop(crop);
                setOfferPrice(crop.expectedPricePerQuintal);
                setOfferQuantity(crop.quantityQuintals);
              }}
              className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow"
            >
              Make Direct Purchase Offer
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
