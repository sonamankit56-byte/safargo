import React, { useEffect } from 'react';
import { useShopping } from '../../context/ShoppingContext';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Package, 
  MapPin, 
  ArrowRight, 
  ShoppingBag, 
  TrendingUp, 
  MessageCircle,
  Truck
} from 'lucide-react';

export const OrderSuccess: React.FC = () => {
  const { latestOrder, setActiveTrackingOrder, setCurrentView, t } = useShopping();

  useEffect(() => {
    // Fire festive celebration confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if canvas not supported
    }
  }, []);

  if (!latestOrder) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No recent order found</p>
        <button 
          onClick={() => setCurrentView('home')} 
          className="mt-3 px-4 py-2 bg-[#9F2089] text-white rounded-lg text-xs font-bold"
        >
          Go Home
        </button>
      </div>
    );
  }

  const handleTrackOrder = () => {
    setActiveTrackingOrder(latestOrder);
    setCurrentView('order_tracking');
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-16 pt-4">
      <div className="max-w-md mx-auto px-4 space-y-4">
        {/* Celebration Card */}
        <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 shadow-md">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full inline-block mb-1.5">
            {t('ऑर्डर सुरक्षित रूप से कन्फर्म', '100% CONFIRMED')}
          </span>

          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
            {t('बधाई हो! आपका ऑर्डर दर्ज हो गया है', 'Order Placed Successfully!')}
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            {t('ऑर्डर आईडी:', 'Order ID:')} <b className="text-gray-800 font-mono">{latestOrder.orderNumber}</b>
          </p>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-700 font-medium">
            <Truck className="w-4 h-4 text-[#9F2089]" />
            <span>{t('अनुमानित डिलीवरी:', 'Estimated Delivery:')} <b className="text-gray-900">{latestOrder.estimatedDeliveryDate}</b></span>
          </div>
        </div>

        {/* Reseller Earning Congratulations (If Resale) */}
        {latestOrder.isResellerOrder && latestOrder.resellerMarginAmount > 0 && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <span className="text-xs font-bold block">{t('रीसेलर मुनाफा सुरक्षित!', 'Reseller Margin Recorded!')}</span>
                <span className="text-[11px] text-emerald-100">{t('डिलीवरी पर आपके बैंक खाते में जमा होगा', 'Will be transferred to bank on delivery')}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-yellow-300">+₹{latestOrder.resellerMarginAmount}</span>
              <span className="text-[9px] block text-emerald-100 uppercase font-semibold">Margin</span>
            </div>
          </div>
        )}

        {/* Order Details Preview Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-soft space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
            <span className="font-bold text-gray-700">{t('ऑर्डर किया गया सामान', 'Items Ordered')} ({latestOrder.items.length})</span>
            <span className="font-bold text-gray-900">₹{latestOrder.finalPaidAmount}</span>
          </div>

          <div className="space-y-2">
            {latestOrder.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <img
                  src={item.product.images[0]}
                  alt={item.product.title}
                  className="w-12 h-12 rounded-lg object-cover bg-gray-50"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 truncate">{item.product.title}</h4>
                  <p className="text-[11px] text-gray-500">
                    {t('साइज़:', 'Size:')} {item.selectedSize} | {t('मात्रा:', 'Qty:')} {item.quantity}
                  </p>
                </div>
                <span className="font-bold text-gray-900">₹{item.product.dealPrice * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Delivery Address */}
          <div className="pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">{t('डिलीवरी पता', 'Deliver To')}</span>
            <p className="font-semibold text-gray-800 mt-0.5">{latestOrder.deliveryAddress.fullName} ({latestOrder.deliveryAddress.phoneNumber})</p>
            <p className="text-gray-500 text-[11px]">{latestOrder.deliveryAddress.houseNo}, {latestOrder.deliveryAddress.roadNameArea}, {latestOrder.deliveryAddress.city}</p>
          </div>
        </div>

        {/* WhatsApp Notification Alert */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-900">
          <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-[11px]">
            {t('हमने लाइव ट्रैकिंग लिंक आपके मोबाइल नंबर पर व्हाट्सएप द्वारा भेज दिया है।', 'Live order updates & invoice have been sent to your WhatsApp.')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleTrackOrder}
            className="w-full py-3.5 px-4 bg-[#9F2089] hover:bg-pink-800 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>{t('पार्सल ट्रैक करें (Track Package)', 'Track Package')}</span>
          </button>

          <button
            onClick={() => setCurrentView('home')}
            className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition-colors"
          >
            {t('और शॉपिंग करें (Continue Shopping)', 'Continue Shopping')}
          </button>
        </div>
      </div>
    </div>
  );
};
