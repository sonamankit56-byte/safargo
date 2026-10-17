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
  ChevronDown
} from 'lucide-react';

export const CartScreen: React.FC = () => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    updateItemSize,
    setItemResaleMargin,
    cartTotalAmount, 
    cartTotalDiscount, 
    cartTotalMargin,
    setCurrentView,
    t 
  } = useShopping();

  const [editingMarginItemId, setEditingMarginItemId] = useState<string | null>(null);
  const [tempCustomerPrice, setTempCustomerPrice] = useState<number>(0);

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

              {/* Reseller Margin Bar per Item */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                {editingMarginItemId === item.cartItemId ? (
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-gray-500 text-[11px] whitespace-nowrap">{t('कस्टमर प्राइस ₹', 'Customer Price ₹')}</span>
                    <input
                      type="number"
                      value={tempCustomerPrice || ''}
                      onChange={(e) => setTempCustomerPrice(parseInt(e.target.value, 10) || 0)}
                      className="w-24 px-2 py-1 text-xs border border-[#9F2089] rounded font-bold"
                    />
                    <button
                      onClick={() => {
                        setItemResaleMargin(item.cartItemId, tempCustomerPrice);
                        setEditingMarginItemId(null);
                      }}
                      className="px-2.5 py-1 bg-[#9F2089] text-white text-[11px] font-bold rounded"
                    >
                      {t('सेव', 'Save')}
                    </button>
                    <button
                      onClick={() => setEditingMarginItemId(null)}
                      className="text-gray-400 text-[11px]"
                    >
                      {t('रद्द', 'Cancel')}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#9F2089]" />
                      <span className="text-gray-600">
                        {item.resellerMargin && item.resellerMargin > 0 ? (
                          <span className="font-bold text-emerald-700">
                            {t(`मार्जिन कमाई: ₹${item.resellerMargin}`, `Cash Margin: ₹${item.resellerMargin}`)}
                          </span>
                        ) : (
                          t('कस्टमर को रीसेल कर रहे हैं?', 'Reselling to customer?')
                        )}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setEditingMarginItemId(item.cartItemId);
                        setTempCustomerPrice(item.customerPrice || Math.round(item.product.dealPrice * 1.5));
                      }}
                      className="text-[#9F2089] font-bold hover:underline"
                    >
                      {item.resellerMargin ? t('मार्जिन बदलें', 'Edit Margin') : t('+ मार्जिन जोड़ें', '+ Add Margin')}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Reseller Overall Summary (If any margin exists) */}
        {cartTotalMargin > 0 && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-3 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <div>
                <span className="text-xs font-bold block">{t('कुल रीसेलर कैश मार्जिन', 'Total Cash Margin to Earn')}</span>
                <span className="text-[10px] text-emerald-100">{t('रविवार को सीधे बैंक/यूपीआई में जमा होगा', 'Deposited Sunday on customer delivery')}</span>
              </div>
            </div>
            <span className="text-xl font-black text-yellow-300">
              ₹{cartTotalMargin}
            </span>
          </div>
        )}

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

            <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-extrabold text-gray-900">
              <span>{t('कुल देय राशि', 'Order Total')}</span>
              <span>₹{cartTotalAmount}</span>
            </div>
          </div>

          <div className="p-2 bg-emerald-50 rounded-lg text-[11px] text-emerald-800 font-semibold text-center">
            {t(`आप इस ऑर्डर पर ₹${cartTotalDiscount} की बचत कर रहे हैं!`, `You are saving ₹${cartTotalDiscount} on this order!`)}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 shadow-sticky">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-gray-500 block uppercase font-bold">{t('कुल राशि', 'Total')}</span>
            <span className="text-lg font-black text-gray-900">₹{cartTotalAmount}</span>
          </div>

          <button
            onClick={() => setCurrentView('address_selection')}
            className="flex-1 max-w-xs py-3 px-5 bg-[#9F2089] hover:bg-pink-800 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-pink-200 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>{t('डिलीवरी पता चुनें', 'Continue to Address')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
