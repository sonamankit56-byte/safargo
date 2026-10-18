import React, { useState } from 'react';
import { useShopping } from '../../context/ShoppingContext';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  Package,
  CheckCircle2
} from 'lucide-react';

export const CartScreen: React.FC = () => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    updateItemSize,
    cartTotalAmount, 
    cartTotalDiscount, 
    isOrderReselling,
    setIsOrderReselling,
    customerCollectAmount,
    setCustomerCollectAmount,
    orderResellerMargin,
    setCurrentView,
    t 
  } = useShopping();

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center text-[#9F2089] mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-black text-gray-800">
          {t('आपकी कार्ट खाली है', 'Your Cart is Empty')}
        </h2>
        <p className="text-xs text-gray-500 mt-1.5 max-w-xs">
          {t('भारत के सबसे कम दामों पर फैशन, गैजेट्स और घरेलू सामान जोड़ें', 'Explore lakhs of products starting at just ₹99 with Free Delivery!')}
        </p>
        <button
          onClick={() => setCurrentView('home')}
          className="mt-5 px-6 py-2.5 bg-[#9F2089] hover:bg-pink-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          {t('शॉपिंग शुरू करें', 'Start Shopping')}
        </button>
      </div>
    );
  }

  const mrpTotal = cart.reduce((acc, item) => acc + (item.product.mrp * item.quantity), 0);

  return (
    <div className="bg-gray-100 min-h-screen pb-28 pt-2">
      <div className="max-w-3xl mx-auto px-3 space-y-3">
        {/* Free Delivery Bar */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-900 font-semibold">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>{t('बधाई हो! इस ऑर्डर पर ₹0 डिलीवरी चार्ज है', 'Congratulations! Free Delivery applied on this order')}</span>
          </div>
          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">FREE</span>
        </div>

        {/* Cart Items List */}
        <div className="space-y-2.5">
          {cart.map((item) => (
            <div 
              key={item.cartItemId}
              className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-soft space-y-3"
            >
              <div className="flex items-start gap-3">
                <img
                  src={item.product.images[0]}
                  alt={item.product.title}
                  className="w-20 h-20 rounded-lg object-cover bg-gray-50 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2">
                      {item.product.title}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      aria-label="Remove item"
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Size & Quantity Selectors */}
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md">
                      <span className="text-gray-500">{t('साइज़:', 'Size:')}</span>
                      <select
                        value={item.selectedSize}
                        onChange={(e) => updateItemSize(item.cartItemId, e.target.value)}
                        className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
                      >
                        {item.product.sizes.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 text-gray-700 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 font-bold text-xs text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 text-gray-700 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Price Row */}
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-gray-900">
                      ₹{item.product.dealPrice * item.quantity}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      ₹{item.product.mrp * item.quantity}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      {item.product.discountPercent}% OFF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 🌟 Iconic Meesho "Reselling the order?" Section 🌟 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-soft space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-100 text-[#9F2089] flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">
                  {t('क्या आप यह ऑर्डर किसी कस्टमर को बेच रहे हैं?', 'Reselling the order?')}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {t('ग्राहक से अपना कैश मार्जिन कमाएं, हम गोपनीय रूप से डिलीवरी करेंगे', 'Selling to a customer? Add your cash margin')}
                </p>
              </div>
            </div>

            {/* Meesho Yes / No Radio Pill */}
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setIsOrderReselling(false)}
                className={`px-3 py-1 rounded-md transition-all ${
                  !isOrderReselling 
                    ? 'bg-white text-gray-900 shadow-xs' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {t('नहीं (No)', 'No')}
              </button>
              <button
                type="button"
                onClick={() => setIsOrderReselling(true)}
                className={`px-3 py-1 rounded-md transition-all ${
                  isOrderReselling 
                    ? 'bg-[#9F2089] text-white shadow-xs' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {t('हाँ (Yes)', 'Yes')}
              </button>
            </div>
          </div>

          {/* Expanded Reseller Margin Box */}
          {isOrderReselling ? (
            <div className="pt-3 border-t border-gray-100 space-y-3 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('कस्टमर से कुल कितना रुपया लेना है? (Cash to collect from customer)', 'Cash to collect from customer (₹)')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    value={customerCollectAmount || ''}
                    onChange={(e) => setCustomerCollectAmount(parseInt(e.target.value, 10) || 0)}
                    placeholder={`कम से कम ₹${cartTotalAmount}`}
                    className="w-full pl-8 pr-4 py-2.5 border-2 border-[#9F2089] rounded-xl text-base font-black focus:outline-none bg-pink-50/20"
                  />
                </div>
              </div>

              {/* Profit Calculation Box */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center justify-between text-emerald-950">
                <div>
                  <span className="text-xs font-bold block">{t('आपकी नकद मार्जिन कमाई (Your Margin):', 'Your Cash Margin:')}</span>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    {t('ऑर्डर डिलीवर होने के बाद सीधे आपके बैंक में जमा होगी', 'Deposited directly to your bank account on Sunday')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600">
                    ₹{orderResellerMargin}
                  </span>
                </div>
              </div>

              {/* Anonymous Packaging Guarantee */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                <Package className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  {t(
                    `सफ़रगो न्यूट्रल पैकेजिंग: पार्सल पर सफ़रगो का कोई नाम या होलसेल बिल (₹${cartTotalAmount}) नहीं होगा। ग्राहक केवल ₹${customerCollectAmount} का बिल देखेगा।`,
                    `100% Anonymous Delivery: No SafarGo branding or wholesale invoice (₹${cartTotalAmount}) will be shown. Courier will collect ₹${customerCollectAmount} from customer.`
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('पर्सनल ऑर्डर: सामान सीधे आपके पते पर सबसे कम होलसेल दाम पर डिलीवर होगा।', 'Personal Purchase: Direct wholesale pricing applied for yourself.')}</span>
            </div>
          )}
        </div>

        {/* Price Breakdown Bill */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-soft space-y-2.5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {t('कीमत का विवरण (Price Details)', 'Price Details')}
          </h3>

          <div className="space-y-1.5 text-xs text-gray-700">
            <div className="flex justify-between">
              <span>{t('कुल MRP कीमत', 'Total Product MRP')}</span>
              <span>₹{mrpTotal}</span>
            </div>

            <div className="flex justify-between text-emerald-600">
              <span>{t('सफ़रगो डिस्काउंट', 'SafarGo Wholesale Discount')}</span>
              <span>-₹{cartTotalDiscount}</span>
            </div>

            <div className="flex justify-between">
              <span>{t('डिलीवरी चार्ज', 'Delivery Charges')}</span>
              <span className="text-emerald-600 font-bold">{t('फ्री (FREE)', 'FREE')}</span>
            </div>

            {isOrderReselling && (
              <>
                <div className="flex justify-between font-bold text-gray-800 pt-1 border-t border-dashed border-gray-200">
                  <span>{t('कस्टमर से लेने वाली रकम (Cash to Collect)', 'Cash to Collect from Customer')}</span>
                  <span>₹{customerCollectAmount}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>{t('आपकी नकद मार्जिन कमाई (Margin to Earn)', 'Your Margin to Earn')}</span>
                  <span>+₹{orderResellerMargin}</span>
                </div>
              </>
            )}

            <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-extrabold text-gray-900">
              <span>{t('कुल ऑर्डर मूल्य (Order Total)', 'Order Total')}</span>
              <span>₹{cartTotalAmount}</span>
            </div>
          </div>

          <div className="p-2 bg-emerald-50 rounded-lg text-[11px] text-emerald-800 font-semibold text-center">
            {t(`आप इस ऑर्डर पर ₹${cartTotalDiscount} की सीधी बचत कर रहे हैं!`, `You are saving ₹${cartTotalDiscount} on this order!`)}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 shadow-sticky">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-gray-500 block uppercase font-bold">
              {isOrderReselling ? t('कस्टमर बिल', 'Customer Price') : t('कुल राशि', 'Order Total')}
            </span>
            <span className="text-lg font-black text-gray-900">
              ₹{isOrderReselling ? customerCollectAmount : cartTotalAmount}
            </span>
          </div>

          <button
            onClick={() => setCurrentView('address_selection')}
            className="flex-1 max-w-xs py-3 px-5 bg-[#9F2089] hover:bg-pink-800 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-pink-200 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>{isOrderReselling ? t('कस्टमर का पता चुनें', 'Deliver to Customer') : t('डिलीवरी पता चुनें', 'Continue to Address')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
