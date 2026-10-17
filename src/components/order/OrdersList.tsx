import React, { useState } from 'react';
import { useShopping } from '../../context/ShoppingContext';
import { Package, Truck, ChevronRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Order } from '../../types';

export const OrdersList: React.FC = () => {
  const { orders, setActiveTrackingOrder, setCurrentView, t } = useShopping();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'delivered'>('all');

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'active') {
      return order.trackingStatus !== 'delivered' && order.trackingStatus !== 'cancelled';
    }
    if (activeTab === 'delivered') {
      return order.trackingStatus === 'delivered';
    }
    return true;
  });

  const handleTrack = (order: Order) => {
    setActiveTrackingOrder(order);
    setCurrentView('order_tracking');
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-24 pt-2">
      <div className="max-w-3xl mx-auto px-3 space-y-3">
        {/* Filter Tabs */}
        <div className="bg-white rounded-xl p-1.5 border border-gray-200 flex text-xs font-bold shadow-soft">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 text-center rounded-lg transition-colors ${
              activeTab === 'all' ? 'bg-[#9F2089] text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('सभी ऑर्डर्स', 'All Orders')} ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 text-center rounded-lg transition-colors ${
              activeTab === 'active' ? 'bg-[#9F2089] text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('रास्ते में (Active)', 'In Transit')}
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`flex-1 py-2 text-center rounded-lg transition-colors ${
              activeTab === 'delivered' ? 'bg-[#9F2089] text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('डिलीवर हो चुके', 'Delivered')}
          </button>
        </div>

        {/* Order Cards */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const firstItem = order.items[0];
              const isDelivered = order.trackingStatus === 'delivered';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 border border-gray-200 shadow-soft space-y-3"
                >
                  {/* Order Top Bar */}
                  <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
                    <div>
                      <span className="font-mono font-bold text-gray-800">{order.orderNumber}</span>
                      <span className="text-gray-400 text-[10px] block">{order.createdAt}</span>
                    </div>

                    <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      isDelivered 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isDelivered ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span className="capitalize">{order.trackingStatus.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  {/* Order Item Preview */}
                  {firstItem && (
                    <div className="flex items-start gap-3">
                      <img
                        src={firstItem.product.images[0]}
                        alt={firstItem.product.title}
                        className="w-16 h-16 rounded-xl object-cover bg-gray-50 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-1">
                          {firstItem.product.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {t('साइज़:', 'Size:')} {firstItem.selectedSize} | {t('मात्रा:', 'Qty:')} {firstItem.quantity}
                          {order.items.length > 1 && ` (+${order.items.length - 1} more items)`}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">
                            {t('कुल:', 'Total:')} ₹{order.finalPaidAmount}
                          </span>
                          {order.isResellerOrder && (
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              Margin: ₹{order.resellerMarginAmount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Status Bar */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Truck className="w-4 h-4 text-[#9F2089]" />
                      <span className="text-[11px]">
                        {isDelivered 
                          ? t('सफलतापूर्वक डिलीवर हो चुका है', 'Delivered successfully') 
                          : `${t('डिलीवरी अपेक्षित:', 'Expected:')} ${order.estimatedDeliveryDate}`}
                      </span>
                    </div>

                    <button
                      onClick={() => handleTrack(order)}
                      className="px-3 py-1.5 bg-[#9F2089] hover:bg-pink-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 transition-colors"
                    >
                      <span>{t('ट्रैक करें', 'Track')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-800">{t('कोई ऑर्डर नहीं मिला', 'No Orders Found')}</h3>
            <p className="text-xs text-gray-500 mt-1">{t('आपने अभी तक कोई ऑर्डर नहीं दिया है', 'You have not placed any orders yet')}</p>
            <button
              onClick={() => setCurrentView('home')}
              className="mt-4 px-4 py-2 bg-[#9F2089] text-white text-xs font-bold rounded-lg"
            >
              {t('शॉपिंग करें', 'Start Shopping')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
