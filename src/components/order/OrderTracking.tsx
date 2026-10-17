import React from 'react';
import { useShopping } from '../../context/ShoppingContext';
import { 
  Package, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Download, 
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';

export const OrderTracking: React.FC = () => {
  const { activeTrackingOrder, orders, setCurrentView, t } = useShopping();
  const order = activeTrackingOrder || orders[0];

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Order not found</p>
        <button onClick={() => setCurrentView('orders')} className="mt-3 px-4 py-2 bg-[#9F2089] text-white rounded-lg text-xs font-bold">
          Back to Orders
        </button>
      </div>
    );
  }

  const handleCopyAWB = () => {
    navigator.clipboard.writeText(order.trackingNumber);
    alert('Tracking AWB copied!');
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-20 pt-2">
      <div className="max-w-2xl mx-auto px-3 space-y-3">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-soft">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{t('ऑर्डर आईडी', 'Order ID')}</span>
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900 font-mono">{order.orderNumber}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{t('अनुमानित डिलीवरी', 'Estimated Delivery')}</span>
              <p className="text-xs sm:text-sm font-bold text-emerald-600">{order.estimatedDeliveryDate}</p>
            </div>
          </div>

          {/* Courier & AWB Bar */}
          <div className="mt-3 bg-gray-50 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#9F2089]" />
              <div>
                <span className="font-bold text-gray-800">{order.courierPartner}</span>
                <p className="text-[11px] text-gray-500">AWB: <b className="font-mono">{order.trackingNumber}</b></p>
              </div>
            </div>
            <button
              onClick={handleCopyAWB}
              title="Copy AWB Number"
              className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-[#9F2089] transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Reseller Earning Card (If applicable) */}
        {order.isResellerOrder && order.resellerMarginAmount > 0 && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="text-xs font-bold text-emerald-950">{t('रीसेलर नकद मार्जिन: ₹' + order.resellerMarginAmount, 'Reseller Cash Margin: ₹' + order.resellerMarginAmount)}</h4>
                <p className="text-[11px] text-emerald-700">{t('डिलीवरी पूर्ण होने के बाद रविवार को आपके खाते में जमा होगा', 'Will be transferred to your bank upon delivery')}</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase text-[10px]">
              {order.marginStatus.replace(/_/g, ' ')}
            </span>
          </div>
        )}

        {/* 4-Step Vertical Timeline */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-soft">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            {t('पार्सल ट्रैकिंग टाइमलाइन (Shipment Journey)', 'Live Shipment Tracking')}
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
            {order.trackingSteps.map((step, idx) => {
              const isPast = step.isCompleted;
              const isCurrent = step.isCurrent;

              return (
                <div key={idx} className="relative flex items-start gap-3">
                  {/* Timeline Node Icon */}
                  <div className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isPast 
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-50' 
                      : isCurrent
                      ? 'bg-[#9F2089] text-white ring-4 ring-pink-100 animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Step Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs sm:text-sm font-bold ${
                        isPast || isCurrent ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {t(step.hindiTitle, step.title)}
                      </h4>
                      <span className="text-[11px] text-gray-400 font-medium">{step.timestamp}</span>
                    </div>
                    <p className={`text-xs mt-0.5 leading-relaxed ${
                      isPast || isCurrent ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Address & Order Summary */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-soft space-y-3">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#9F2089] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-gray-800 block">{order.deliveryAddress.fullName}</span>
              <p className="text-gray-500 mt-0.5 leading-relaxed">
                {order.deliveryAddress.houseNo}, {order.deliveryAddress.roadNameArea}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
              </p>
              <p className="text-gray-700 font-semibold mt-1">Phone: +91 {order.deliveryAddress.phoneNumber}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-500">{t('भुगतान मोड:', 'Payment Mode:')} </span>
              <span className="font-bold uppercase text-gray-800">{order.paymentMethod}</span>
            </div>
            <div>
              <span className="text-gray-500">{t('कुल मूल्य:', 'Paid Amount:')} </span>
              <span className="font-extrabold text-[#9F2089]">₹{order.finalPaidAmount}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Invoice & Help */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => alert(`Invoice downloaded for Order #${order.orderNumber}`)}
            className="flex-1 py-3 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{t('चालान डाउनलोड करें (Invoice)', 'Download Invoice')}</span>
          </button>

          <button
            onClick={() => alert('SafarGo 24x7 Customer Care: Contacting WhatsApp support...')}
            className="flex-1 py-3 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-[#9F2089]" />
            <span>{t('सहायता केंद्र (Help)', 'Help & Support')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
