import React, { useState } from 'react';
import { Product } from '../../types';
import { useShopping } from '../../context/ShoppingContext';
import { 
  X, 
  Sparkles, 
  Banknote, 
  ShieldCheck, 
  Package, 
  TrendingUp,
  AlertCircle 
} from 'lucide-react';

interface ResellerMarginModalProps {
  product: Product;
  selectedSize: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccessResell: (customerPrice: number) => void;
}

export const ResellerMarginModal: React.FC<ResellerMarginModalProps> = ({
  product,
  selectedSize,
  isOpen,
  onClose,
  onSuccessResell
}) => {
  const { t } = useShopping();
  
  // Default customer price suggestion: ~50% markup
  const defaultCustomerPrice = Math.round(product.dealPrice * 1.5);
  const [customerPrice, setCustomerPrice] = useState<number>(defaultCustomerPrice);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const margin = customerPrice - product.dealPrice;
  const isMarginValid = margin >= 0;

  const handlePriceChange = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setCustomerPrice(0);
      setErrorMsg(t('कृपया सही मूल्य भरें', 'Please enter a valid price'));
      return;
    }

    setCustomerPrice(num);
    if (num < product.dealPrice) {
      setErrorMsg(t(`ग्राहक का मूल्य होलसेल कीमत (₹${product.dealPrice}) से अधिक होना चाहिए`, `Customer price must be at least wholesale price ₹${product.dealPrice}`));
    } else {
      setErrorMsg('');
    }
  };

  const handleConfirm = () => {
    if (!isMarginValid || customerPrice < product.dealPrice) {
      setErrorMsg(t(`कृपया कम से कम ₹${product.dealPrice} का मूल्य दर्ज करें`, `Please enter at least ₹${product.dealPrice}`));
      return;
    }
    onSuccessResell(customerPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#9F2089] to-pink-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {t('रीसेलिंग मार्जिन कैलकुलेटर', 'Reseller Cash Margin Calculator')}
              </h3>
              <p className="text-[11px] text-pink-100">
                {t('ग्राहक को बेचें और बिना किसी पूंजी के कमाएं', 'Zero Investment • Earn Cash Profit on Delivery')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Product Mini Bar */}
          <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
            <img 
              src={product.images[0]} 
              alt={product.title} 
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-gray-800 truncate">
                {product.title}
              </h4>
              <div className="flex items-center gap-2 text-xs mt-0.5">
                <span className="text-gray-500">{t('साइज़:', 'Size:')} <b className="text-gray-800">{selectedSize}</b></span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">{t('होलसेल दाम:', 'Wholesale:')} <b className="text-[#9F2089]">₹{product.dealPrice}</b></span>
              </div>
            </div>
          </div>

          {/* Pricing Input Section */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('आप ग्राहक से कितना रुपया लेंगे? (Final Customer Price)', 'Target Price Charged to Customer (₹)')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-base">₹</span>
                <input
                  type="number"
                  value={customerPrice || ''}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2.5 text-lg font-black rounded-xl border ${
                    errorMsg ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#9F2089]'
                  } focus:outline-none transition-all`}
                  placeholder={`Min ₹${product.dealPrice}`}
                />
              </div>
              {errorMsg && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </p>
              )}
            </div>

            {/* Quick Margin Suggestions Buttons */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 text-[11px] font-medium">{t('क्विक मार्जिन:', 'Quick Add:')}</span>
              {[100, 150, 200, 300].map((extra) => (
                <button
                  key={extra}
                  type="button"
                  onClick={() => {
                    setCustomerPrice(product.dealPrice + extra);
                    setErrorMsg('');
                  }}
                  className="px-2.5 py-1 bg-pink-50 border border-pink-200 text-[#9F2089] rounded-lg font-bold hover:bg-pink-100 transition-colors"
                >
                  +₹{extra}
                </button>
              ))}
            </div>

            {/* Profit Margin Box */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              margin > 0 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                : 'bg-gray-100 border-gray-200 text-gray-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">
                    {t('आपकी सीधी नकद कमाई (Your Margin)', 'Your Direct Cash Margin')}
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    {t('कस्टमर डिलीवरी के बाद हर रविवार बैंक में क्रेडिट', 'Credited directly to your Bank Account on Sunday')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600">
                    ₹{Math.max(0, margin)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Neutral Packaging Guarantee (Meesho Secret Sauce) */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Package className="w-4 h-4 text-amber-700" />
              <span>{t('सफ़रगो न्यूट्रल पैकेजिंग गारंटी', 'SafarGo 100% Anonymous Delivery')}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              {t(
                'पार्सल पर सफ़रगो का कोई नाम या होलसेल बिल नहीं होगा। ग्राहक को डिलीवरी बॉय सिर्फ ₹' + customerPrice + ' का बिल देगा। ग्राहक को लगेगा पार्सल सीधे आपकी दुकान से आया है!',
                'No SafarGo branding or wholesale prices will appear on the box. Courier will collect ₹' + customerPrice + ' and deliver seamlessly under your name.'
              )}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 border border-gray-300 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-100 text-xs transition-colors"
          >
            {t('रद्द करें', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isMarginValid || customerPrice < product.dealPrice}
            className="flex-2 py-2.5 px-4 bg-[#9F2089] hover:bg-pink-800 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Banknote className="w-4 h-4" />
            <span>{t(`₹${Math.max(0, margin)} मार्जिन के साथ जोड़ें`, `Confirm ₹${Math.max(0, margin)} Margin`)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
