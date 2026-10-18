import React, { useState } from 'react';
import { useShopping } from '../../context/ShoppingContext';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  MapPin,
  TrendingUp,
  AlertCircle,
  Package
} from 'lucide-react';
import { PaymentMethod } from '../../types';

export const PaymentScreen: React.FC = () => {
  const { 
    cartTotalAmount, 
    cartTotalDiscount, 
    cartTotalMargin,
    isOrderReselling,
    customerCollectAmount,
    orderResellerMargin,
    activeAddress, 
    setCurrentView, 
    placeOrder,
    t 
  } = useShopping();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cod');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Discount incentive: ₹25 for UPI, ₹20 for Card
  const prepaidDiscount = selectedPayment === 'upi' ? 25 : selectedPayment === 'card' ? 20 : 0;
  const finalPayable = Math.max(0, cartTotalAmount - prepaidDiscount);

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      placeOrder(selectedPayment);
      setIsProcessing(false);
      setCurrentView('order_success');
    }, 1200);
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-28 pt-2">
      <div className="max-w-3xl mx-auto px-3 space-y-3">
        {/* Progress Step Header */}
        <div className="bg-white rounded-xl p-3 border border-gray-200 flex items-center justify-between text-xs font-bold text-gray-500">
          <span className="text-gray-400">1. {t('कार्ट', 'Cart')}</span>
          <span className="text-gray-300">➔</span>
          <span className="text-gray-400">2. {t('पता', 'Address')}</span>
          <span className="text-gray-300">➔</span>
          <span className="text-[#9F2089] flex items-center gap-1 font-extrabold">
            <Lock className="w-4 h-4 text-[#9F2089]" />
            <span>3. {t('सुरक्षित भुगतान (Payment)', 'Payment')}</span>
          </span>
        </div>

        {/* Selected Address Summary Bar */}
        <div className="bg-white rounded-xl p-3 border border-gray-200 flex items-center justify-between text-xs">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#9F2089] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-800 block">
                {isOrderReselling ? t('ग्राहक का डिलीवरी पता:', 'Customer Delivery Address:') : t('डिलीवरी पता:', 'Delivery Address:')} {activeAddress?.fullName}
              </span>
              <p className="text-gray-500 line-clamp-1 text-[11px]">
                {activeAddress?.houseNo}, {activeAddress?.roadNameArea}, {activeAddress?.city} ({activeAddress?.pincode})
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('address_selection')}
            className="text-[#9F2089] font-bold text-xs shrink-0 hover:underline"
          >
            {t('बदलें', 'Change')}
          </button>
        </div>

        {/* Reselling Order Notice Banner (Meesho Signature) */}
        {isOrderReselling ? (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl p-3 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-300" />
                <span className="text-xs font-bold">{t('रीसेलिंग ऑर्डर: कस्टमर से कैश ऑन डिलीवरी लिया जाएगा', 'Reselling Order: Cash to collect from customer')}</span>
              </div>
              <span className="text-base font-black text-yellow-300">₹{customerCollectAmount}</span>
            </div>
            <p className="text-[11px] text-emerald-100">
              {t(
                `डिलीवरी के बाद आपका ₹${orderResellerMargin} का शुद्ध मुनाफा सीधे बैंक खाते में जमा हो जाएगा।`,
                `Your net margin of ₹${orderResellerMargin} will be transferred to your bank on delivery.`
              )}
            </p>
          </div>
        ) : (
          /* Prepaid Savings Incentive Banner (Meesho USP) */
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl p-3 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <div>
                <span className="text-xs font-bold block">{t('UPI भुगतान पर तुरंत ₹25 की अतिरिक्त छूट!', 'Instant ₹25 Extra Discount on UPI Payment!')}</span>
                <span className="text-[10px] text-emerald-100">{t('PhonePe, GPay, Paytm या किसी भी UPI से भुगतान करें', 'Pay via GPay, PhonePe or Paytm to save extra')}</span>
              </div>
            </div>
            <span className="text-xs font-black bg-yellow-400 text-gray-950 px-2 py-0.5 rounded shadow-xs">
              SAVE ₹25
            </span>
          </div>
        )}

        {/* Payment Methods Accordion / Radio Cards */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
            {t('भुगतान का तरीका चुनें (Select Payment Mode)', 'Payment Options')}
          </h3>

          {/* 1. Cash on Delivery */}
          <div 
            onClick={() => setSelectedPayment('cod')}
            className={`bg-white rounded-xl p-3.5 border transition-all cursor-pointer ${
              selectedPayment === 'cod' ? 'border-[#9F2089] ring-2 ring-pink-100' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-pink-50 text-[#9F2089] flex items-center justify-center font-bold">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-gray-900">{t('कैश ऑन डिलीवरी (Cash on Delivery)', 'Cash on Delivery (COD)')}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">₹0 FEE</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {isOrderReselling 
                      ? t(`कूरियर बॉय ग्राहक से ₹${customerCollectAmount} कैश कलेक्ट करेगा`, `Courier will collect ₹${customerCollectAmount} cash from customer`)
                      : t('पार्सल घर पहुंचने पर नकद रुपये दें', 'Pay in cash when parcel reaches your doorstep')}
                  </p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPayment === 'cod' ? 'border-[#9F2089] bg-[#9F2089]' : 'border-gray-300'
              }`}>
                {selectedPayment === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
          </div>

          {/* 2. UPI PhonePe / GPay */}
          <div 
            onClick={() => setSelectedPayment('upi')}
            className={`bg-white rounded-xl p-3.5 border transition-all cursor-pointer ${
              selectedPayment === 'upi' ? 'border-[#9F2089] ring-2 ring-pink-100' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-gray-900">UPI (Google Pay, PhonePe, Paytm)</span>
                    <span className="text-[10px] bg-yellow-100 text-amber-800 px-1.5 py-0.5 rounded font-black">
                      ₹25 OFF
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold">{t('तुरंत ₹25 की छूट प्राप्त करें', 'Instant ₹25 Extra Savings')}</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPayment === 'upi' ? 'border-[#9F2089] bg-[#9F2089]' : 'border-gray-300'
              }`}>
                {selectedPayment === 'upi' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>

            {selectedPayment === 'upi' && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                <label className="block text-[11px] font-bold text-gray-600">{t('UPI ID दर्ज करें (उदा. username@okhdfcbank)', 'Enter UPI ID / VPA')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiIdInput}
                    onChange={(e) => setUpiIdInput(e.target.value)}
                    placeholder="mobileNumber@upi"
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9F2089] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setUpiIdInput('safargo.agent@okaxis')}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Auto Fill
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Debit / Credit Cards */}
          <div 
            onClick={() => setSelectedPayment('card')}
            className={`bg-white rounded-xl p-3.5 border transition-all cursor-pointer ${
              selectedPayment === 'card' ? 'border-[#9F2089] ring-2 ring-pink-100' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-gray-900">{t('डेबिट / क्रेडिट कार्ड', 'Debit / Credit Card')}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-black">₹20 OFF</span>
                  </div>
                  <p className="text-[11px] text-gray-500">Visa, MasterCard, RuPay, Maestro</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPayment === 'card' ? 'border-[#9F2089] bg-[#9F2089]' : 'border-gray-300'
              }`}>
                {selectedPayment === 'card' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
          </div>

          {/* 4. Netbanking */}
          <div 
            onClick={() => setSelectedPayment('netbanking')}
            className={`bg-white rounded-xl p-3.5 border transition-all cursor-pointer ${
              selectedPayment === 'netbanking' ? 'border-[#9F2089] ring-2 ring-pink-100' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-gray-900">{t('नेटबैंकिंग (Net Banking)', 'Net Banking')}</span>
                  <p className="text-[11px] text-gray-500">SBI, HDFC, ICICI, Axis, PNB & All Indian Banks</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPayment === 'netbanking' ? 'border-[#9F2089] bg-[#9F2089]' : 'border-gray-300'
              }`}>
                {selectedPayment === 'netbanking' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
          </div>
        </div>

        {/* Reseller Earning Reassurance */}
        {(isOrderReselling || cartTotalMargin > 0) && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="font-bold block">{t('आपकी नकद मार्जिन कमाई', 'Your Reseller Cash Profit')}</span>
                <span className="text-[11px] text-emerald-700">{t('डिलीवरी के बाद सीधे आपके बैंक में भेजी जाएगी', 'Will be transferred directly on Sunday')}</span>
              </div>
            </div>
            <span className="text-xl font-black text-emerald-700">₹{orderResellerMargin || cartTotalMargin}</span>
          </div>
        )}

        {/* Final Price Summary */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-soft space-y-2 text-xs text-gray-700">
          <h3 className="font-bold text-gray-500 uppercase tracking-wider">{t('भुगतान सारांश (Payment Summary)', 'Order Breakdown')}</h3>
          <div className="flex justify-between">
            <span>{t('प्रोडक्ट मूल्य', 'Product Wholesale Price')}</span>
            <span>₹{cartTotalAmount}</span>
          </div>
          {isOrderReselling && (
            <>
              <div className="flex justify-between text-gray-900 font-bold">
                <span>{t('ग्राहक से नकद वसूली (COD)', 'Cash to Collect from Customer')}</span>
                <span>₹{customerCollectAmount}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>{t('आपका मुनाफा (Bank Margin)', 'Your Bank Margin')}</span>
                <span>+₹{orderResellerMargin}</span>
              </div>
            </>
          )}
          {prepaidDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>{t('ऑनलाइन प्री-पेड छूट', 'Prepaid Instant Discount')}</span>
              <span>-₹{prepaidDiscount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>{t('डिलीवरी चार्ज', 'Delivery Charges')}</span>
            <span className="text-emerald-600 font-bold">{t('फ्री (FREE)', 'FREE')}</span>
          </div>
          <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-black text-gray-900">
            <span>{isOrderReselling ? t('होलसेल कुल देय', 'Wholesale Amount') : t('कुल देय राशि', 'Total Amount Payable')}</span>
            <span className="text-[#9F2089]">₹{finalPayable}</span>
          </div>
        </div>

        {/* 100% Security Guarantee */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 py-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t('100% सुरक्षित भुगतान एवं एन्क्रिप्टेड लेन-देन', '100% Safe & Secure 256-bit Encrypted Checkout')}</span>
        </div>
      </div>

      {/* Sticky Bottom Place Order CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 shadow-sticky">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-gray-500 block uppercase font-bold">
              {isOrderReselling ? t('ग्राहक प्राइस', 'Customer COD') : t('भुगतान राशि', 'Final Amount')}
            </span>
            <span className="text-xl font-black text-[#9F2089]">
              ₹{isOrderReselling ? customerCollectAmount : finalPayable}
            </span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="flex-1 max-w-sm py-3 px-6 bg-[#9F2089] hover:bg-pink-800 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-pink-200 flex items-center justify-center gap-2 active:scale-95"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>{isOrderReselling ? t('रीसेलर ऑर्डर प्लेस करें', 'Place Customer Resell Order') : t('ऑर्डर कन्फर्म करें (Place Order)', 'Place Order')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
