import React from 'react';
import { useShopping } from './context/ShoppingContext';
import { MeeshoHeader } from './components/common/MeeshoHeader';
import { BottomNavBar } from './components/common/BottomNavBar';
import { CategoryChips } from './components/home/CategoryChips';
import { PromoCarousel } from './components/home/PromoCarousel';
import { DealStoreRibbon } from './components/home/DealStoreRibbon';
import { ProductFeed } from './components/home/ProductFeed';
import { CategoryHub } from './components/categories/CategoryHub';
import { SafarGoMall } from './components/mall/SafarGoMall';
import { ProductDetail } from './components/product/ProductDetail';
import { CartScreen } from './components/cart/CartScreen';
import { AddressScreen } from './components/checkout/AddressScreen';
import { PaymentScreen } from './components/checkout/PaymentScreen';
import { OrderSuccess } from './components/order/OrderSuccess';
import { OrdersList } from './components/order/OrdersList';
import { OrderTracking } from './components/order/OrderTracking';
import { ResellDesk } from './components/reseller/ResellDesk';
import { AccountScreen } from './components/account/AccountScreen';
import { WishlistScreen } from './components/account/WishlistScreen';
import { SearchModal } from './components/search/SearchModal';
import { Sparkles, Truck, ShieldCheck } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView, t } = useShopping();

  // If in full screen search modal, render directly
  if (currentView === 'search_modal') {
    return <SearchModal />;
  }

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'product_detail': return t('प्रोडक्ट विवरण', 'Product Details');
      case 'cart': return t('शॉपिंग कार्ट / बैग', 'Shopping Bag');
      case 'address_selection': return t('डिलीवरी पता चुनें', 'Delivery Address');
      case 'payment': return t('सुरक्षित भुगतान', 'Select Payment');
      case 'order_success': return t('ऑर्डर कन्फर्मेशन', 'Order Confirmed');
      case 'order_tracking': return t('पार्सल लाइव ट्रैकिंग', 'Live Order Tracking');
      case 'wishlist': return t('मेरी विशलिस्ट', 'My Wishlist');
      case 'resell_desk': return t('सफ़रगो रीसेलिंग हब', 'Resell & Earn Desk');
      default: return undefined;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] text-gray-900 flex flex-col justify-between selection:bg-pink-100 selection:text-pink-900">
      <div>
        {/* Top Announcement Ticker */}
        <div className="bg-gradient-to-r from-[#9F2089] via-[#82156E] to-[#0A2885] text-white py-1 px-3 text-[11px] font-semibold text-center flex items-center justify-center gap-2 overflow-hidden shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
          <span>{t('🎉 महा बचत सेल लाइव • सभी ऑर्डर्स पर 100% फ्री डिलीवरी + ₹0 कैश ऑन डिलीवरी शुल्क!', '🎉 Maha Bachat Sale Live • 100% Free Delivery on Every Order + ₹0 COD Fee!')}</span>
        </div>

        {/* Top Header */}
        <MeeshoHeader 
          title={getHeaderTitle()} 
          showBack={['product_detail', 'cart', 'address_selection', 'payment', 'order_tracking', 'wishlist'].includes(currentView)} 
        />

        {/* Main Content Router */}
        <main className="w-full">
          {currentView === 'home' && (
            <div>
              <CategoryChips />
              <PromoCarousel />
              <DealStoreRibbon />
              <ProductFeed />
            </div>
          )}

          {currentView === 'categories' && <CategoryHub />}
          {currentView === 'mall' && <SafarGoMall />}
          {currentView === 'orders' && <OrdersList />}
          {currentView === 'account' && <AccountScreen />}
          {currentView === 'product_detail' && <ProductDetail />}
          {currentView === 'cart' && <CartScreen />}
          {currentView === 'address_selection' && <AddressScreen />}
          {currentView === 'payment' && <PaymentScreen />}
          {currentView === 'order_success' && <OrderSuccess />}
          {currentView === 'order_tracking' && <OrderTracking />}
          {currentView === 'resell_desk' && <ResellDesk />}
          {currentView === 'wishlist' && <WishlistScreen />}
        </main>
      </div>

      {/* Persistent Bottom Nav Bar on Mobile */}
      <BottomNavBar />
    </div>
  );
};

export default MainLayout;
