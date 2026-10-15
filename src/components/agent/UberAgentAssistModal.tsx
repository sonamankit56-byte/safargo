import React, { useState } from 'react';
import {
  buildUberRideUrl,
  POPULAR_TRANSIT_STATIONS,
  searchTransitLocations,
  TransitLocation,
} from '../../lib/uberService';
import {
  X,
  Car,
  Navigation,
  MapPin,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Phone,
  User,
} from 'lucide-react';

interface UberAgentAssistModalProps {
  onClose: () => void;
  defaultDestination?: string;
}

export const UberAgentAssistModal: React.FC<UberAgentAssistModalProps> = ({
  onClose,
  defaultDestination = '',
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationSearch, setDestinationSearch] = useState(defaultDestination);
  const [selectedDestination, setSelectedDestination] = useState<TransitLocation | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const matchedLocations = searchTransitLocations(destinationSearch);

  const finalDropoffAddress =
    selectedDestination?.standName ||
    (destinationSearch.trim() ? destinationSearch.trim() : 'Bhopal ISBT Stand');

  const uberUrl = buildUberRideUrl({
    pickupAddress: pickupAddress.trim() || undefined,
    dropoffAddress: finalDropoffAddress,
    dropoffNickname: selectedDestination ? `${selectedDestination.city} स्टैंड` : undefined,
  });

  const whatsappMessage = `नमस्ते ${customerName || 'यात्री'}, आपकी SafarGo + Uber राइड सहायता लिंक तैयार है:
📍 ड्रॉप: ${finalDropoffAddress}
🚗 कैब/ऑटो बुक करने के लिए इस लिंक पर क्लिक करें:
${uberUrl}

SafarGo • "अब हर सफर होगा आसान"`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(uberUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-slate-700 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-black border border-slate-700 flex items-center justify-center font-black text-white text-sm">
              Uber
            </div>
            <div>
              <h3 className="text-base font-black flex items-center gap-1.5 text-white">
                <span>Uber लोकल राइड सहायता डेस्क</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  GO Special
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                ग्राहक को बस स्टैंड या घर तक पहुँचाने हेतु ऑटो/कैब असिस्ट
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              यात्री का नाम (Optional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="उदा. राहुल शर्मा"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              यात्री मोबाइल (WhatsApp हेतु)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="tel"
                maxLength={10}
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="10-अंकों का मोबाइल"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="text-xs space-y-1">
          <label className="block font-bold text-slate-300">
            पिकअप स्थान (Pickup Point)
          </label>
          <div className="relative">
            <Navigation className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="खाली छोड़ें तो यात्री का वर्तमान GPS स्थान लेगा"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-400"
            />
          </div>
          <span className="text-[10px] text-slate-500">
            *यदि खाली छोड़ेंगे, तो Uber ऐप ग्राहक की लाइव लोकेशन से ऑटो पिकअप करेगी।
          </span>
        </div>

        {/* Destination Location Autocomplete */}
        <div className="text-xs space-y-1.5">
          <label className="block font-bold text-slate-300">
            गंतव्य बस स्टैंड / शहर / रेलवे स्टेशन (Dropoff Hub)
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
            <input
              type="text"
              value={destinationSearch}
              onChange={(e) => {
                setDestinationSearch(e.target.value);
                setSelectedDestination(null);
              }}
              placeholder="खोजें: भोपाल ISBT, सिरोंज, विदिशा, इंदौर..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-amber-400"
            />
          </div>

          {/* Quick Hub Badges */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] text-slate-400 block font-semibold">
              त्वरित चयन (1-क्लिक बस स्टैंड):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
              {matchedLocations.slice(0, 8).map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedDestination(loc);
                    setDestinationSearch(`${loc.standName}, ${loc.city}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                    selectedDestination?.standName === loc.standName
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{loc.city}:</span>
                  <span className="opacity-90">{loc.standName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview & Actions */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">तैयार Uber ड्रॉप पॉइंट:</span>
            <strong className="text-amber-300 font-mono text-right truncate max-w-[200px]">
              {finalDropoffAddress}
            </strong>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <a
              href={uberUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow transition active:scale-95"
            >
              <Car className="w-4 h-4" />
              <span>Uber में खोलें</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {customerMobile.length === 10 ? (
              <a
                href={`https://wa.me/91${customerMobile}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow transition active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp पर लिंक भेजें</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition active:scale-95 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'लिंक कॉपी हो गया!' : 'राइड लिंक कॉपी करें'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
