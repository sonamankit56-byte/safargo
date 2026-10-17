import React, { useState } from 'react';
import { useShopping } from '../../context/ShoppingContext';
import { RatingBadge } from '../common/RatingBadge';
import { ResellerMarginModal } from './ResellerMarginModal';
import { 
  Heart, 
  Share2, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Sparkles, 
  TrendingUp, 
  ShoppingBag, 
  Zap, 
  ChevronRight,
  Store,
  CheckCircle,
  ThumbsUp
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { 
    selectedProduct, 
    addToCart, 
    toggleWishlist, 
    isWishlisted, 
    setCurrentView,
    t 
  } = useShopping();

  if (!selectedProduct) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No product selected</p>
        <button 
          onClick={() => setCurrentView('home')} 
          className="mt-3 px-4 py-2 bg-[#9F2089] text-white rounded-lg text-xs font-bold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(selectedProduct.sizes[0] || 'Free Size');
  const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
  const [appliedMargin, setAppliedMargin] = useState<number | null>(null);
  const [appliedCustomerPrice, setAppliedCustomerPrice] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const wishlisted = isWishlisted(selectedProduct.id);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = () => {
    addToCart(
      selectedProduct, 
      selectedSize, 
      1, 
      Boolean(appliedMargin), 
      appliedCustomerPrice || undefined
    );
    showToast(t('प्रोडक्ट कार्ट में जोड़ा गया!', 'Added to Bag!'));
  };

  const handleBuyNow = () => {
    addToCart(
      selectedProduct, 
      selectedSize, 
      1, 
      Boolean(appliedMargin), 
      appliedCustomerPrice || undefined
    );
    setCurrentView('cart');
  };

  const handleResellSuccess = (customerPrice: number) => {
    const margin = customerPrice - selectedProduct.dealPrice;
    setAppliedMargin(margin);
    setAppliedCustomerPrice(customerPrice);
    addToCart(selectedProduct, selectedSize, 1, true, customerPrice);
    showToast(t(`₹${margin} मार्जिन के साथ कार्ट में जोड़ा गया!`, `Added with ₹${margin} margin!`));
  };

  const handleShareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedProduct.title,
        text: `Check out this ${selectedProduct.title} for just ₹${selectedProduct.dealPrice} on SafarGo Shopping!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast(t('प्रोडक्ट लिंक कॉपी हो गया!', 'Product link copied!'));
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-24 sm:pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Margin Modal */}
      <ResellerMarginModal
        product={selectedProduct}
        selectedSize={selectedSize}
        isOpen={isMarginModalOpen}
        onClose={() => setIsMarginModalOpen(false)}
        onSuccessResell={handleResellSuccess}
      />

      <div className="max-w-4xl mx-auto space-y-2 sm:space-y-3 sm:py-3">
        {/* 1. Image Slider & Badges */}
        <div className="bg-white relative">
          <div className="relative aspect-square max-h-[460px] w-full overflow-hidden bg-gray-50 flex items-center justify-center">
            <img
              src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
              alt={selectedProduct.title}
              className="w-full h-full object-contain"
            />

            {/* Counter Badge */}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
              {activeImageIndex + 1}/{selectedProduct.images.length}
            </div>

            {/* Top Overlay Actions: Wishlist & Share */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                className="p-2 bg-white/90 rounded-full shadow-md text-gray-700 hover:text-[#9F2089] transition-transform active:scale-90"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-[#9F2089] text-[#9F2089]' : ''}`} />
              </button>
              <button
                onClick={handleShareProduct}
                className="p-2 bg-white/90 rounded-full shadow-md text-gray-700 hover:text-[#9F2089] transition-transform active:scale-90"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Thumbnail row */}
          {selectedProduct.images.length > 1 && (
            <div className="p-2 flex gap-2 overflow-x-auto border-t border-gray-100">
              {selectedProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === activeImageIndex ? 'border-[#9F2089]' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Title, Price & Ratings Block */}
        <div className="bg-white p-3.5 sm:p-4 space-y-2">
          {selectedProduct.isMallProduct && (
            <div className="inline-flex items-center gap-1 bg-[#9F2089] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
              <span>SAFARGO MALL VERIFIED BRAND</span>
            </div>
          )}

          <h1 className="text-sm sm:text-base font-semibold text-gray-800 leading-snug">
            {selectedProduct.title}
          </h1>

          {/* Price Container */}
          <div className="flex items-baseline gap-2 pt-1 flex-wrap">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              ₹{selectedProduct.dealPrice}
            </span>
            <span className="text-sm text-gray-400 line-through">
              ₹{selectedProduct.mrp}
            </span>
            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {selectedProduct.discountPercent}% OFF
            </span>
          </div>

          {/* Rating Summary Pill */}
          <div className="pt-1 flex items-center gap-2">
            <RatingBadge 
              rating={selectedProduct.rating} 
              reviewCount={selectedProduct.reviewCount} 
              size="md" 
            />
            <span className="text-xs text-gray-400">
              • {selectedProduct.ratingCount.toLocaleString('en-IN')} {t('ग्राहकों ने रेटिंग दी', 'Ratings')}
            </span>
          </div>

          {/* Free Delivery & COD Strip */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>{t('फ्री डिलीवरी (₹0)', 'Free Delivery (₹0)')}</span>
            </div>
            <div className="text-gray-500 font-medium">
              {t('कैश ऑन डिलीवरी उपलब्ध', 'Cash on Delivery Available')}
            </div>
          </div>
        </div>

        {/* 3. Unique Reseller Cash Margin Card (Meesho USP) */}
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border border-pink-200 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-[#9F2089] text-white rounded-lg shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-gray-900">
                  {t('ग्राहक को बेचकर नकद मार्जिन कमाएं?', 'Selling to a Customer? Add Cash Margin')}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-600 mt-0.5">
                  {appliedMargin ? (
                    <span className="text-emerald-700 font-bold">
                      {t(`मार्जिन सेट: ₹${appliedMargin} (ग्राहक मूल्य: ₹${appliedCustomerPrice})`, `Margin Applied: ₹${appliedMargin} (Customer Price: ₹${appliedCustomerPrice})`)}
                    </span>
                  ) : (
                    t('होलसेल कीमत ₹' + selectedProduct.dealPrice + ' पर अपना मनचाहा मुनाफा जोड़ें। डिलीवरी पर बैंक में पैसा आएगा।', 'Add your custom markup price. SafarGo collects from customer and transfers margin.')
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsMarginModalOpen(true)}
              className="shrink-0 bg-[#9F2089] hover:bg-pink-800 text-white font-bold text-xs px-3 py-2 rounded-lg shadow-sm transition-all"
            >
              {appliedMargin ? t('बदलें', 'Edit Margin') : t('मार्जिन जोड़ें', 'Add Margin')}
            </button>
          </div>
        </div>

        {/* 4. Select Size Container */}
        <div className="bg-white p-3.5 sm:p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
              {t('साइज़ चुनें (Select Size)', 'Select Size')}
            </h3>
            <span className="text-xs text-[#9F2089] font-semibold cursor-pointer hover:underline">
              {t('साइज़ चार्ट', 'Size Chart')}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedProduct.sizes.map((size) => {
              const isSelected = size === selectedSize;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                    isSelected
                      ? 'border-[#9F2089] bg-pink-50 text-[#9F2089] ring-1 ring-[#9F2089]'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Product Specifications & Description */}
        <div className="bg-white p-3.5 sm:p-4 space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
            {t('प्रोडक्ट विवरण (Product Details)', 'Product Specifications')}
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-400 block text-[10px]">{t('फैब्रिक / मटीरियल', 'Fabric / Material')}</span>
              <span className="font-semibold text-gray-800">{selectedProduct.fabricOrMaterial}</span>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-400 block text-[10px]">{t('पैटर्न / डिजाइन', 'Pattern')}</span>
              <span className="font-semibold text-gray-800">{selectedProduct.pattern}</span>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-400 block text-[10px]">{t('रंग (Color)', 'Color')}</span>
              <span className="font-semibold text-gray-800">{selectedProduct.color}</span>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-400 block text-[10px]">{t('रिटर्न पॉलिसी', 'Return Window')}</span>
              <span className="font-semibold text-emerald-700">{selectedProduct.easyReturnsDays} {t('दिन आसान वापसी', 'Days Return')}</span>
            </div>
          </div>

          {Object.entries(selectedProduct.specifications).length > 0 && (
            <div className="pt-2 border-t border-gray-100 space-y-1.5 text-xs">
              {Object.entries(selectedProduct.specifications).map(([key, val]) => (
                <div key={key} className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">{key}</span>
                  <span className="font-semibold text-gray-800">{val}</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-600 leading-relaxed pt-2">
            {selectedProduct.description}
          </p>
        </div>

        {/* 6. Supplier Profile Card */}
        <div className="bg-white p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 text-[#9F2089] flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                  {selectedProduct.supplierName}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span className="font-semibold text-emerald-700">★ {selectedProduct.supplierRating}</span>
                  <span>•</span>
                  <span>{selectedProduct.supplierFollowers.toLocaleString('en-IN')} Followers</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => showToast(t('दुकान का कैटलॉग लोड हो रहा है...', 'Shop catalog loading...'))}
              className="px-3 py-1.5 border border-[#9F2089] text-[#9F2089] rounded-lg text-xs font-bold hover:bg-pink-50 transition-colors"
            >
              {t('दुकान देखें', 'View Shop')}
            </button>
          </div>
        </div>

        {/* 7. Customer Reviews */}
        <div className="bg-white p-3.5 sm:p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
              {t('ग्राहकों के रिव्यू एवं रेटिंग', 'Ratings & Customer Reviews')}
            </h3>
            <span className="text-xs text-gray-500">
              {selectedProduct.reviews.length} {t('रिव्यूज', 'Reviews')}
            </span>
          </div>

          <div className="space-y-3 divide-y divide-gray-100">
            {selectedProduct.reviews.map((rev) => (
              <div key={rev.id} className="pt-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center">
                      {rev.userName[0]}
                    </span>
                    <span className="text-xs font-bold text-gray-800">{rev.userName}</span>
                    <span className="text-[10px] text-gray-400">({rev.userCity})</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{rev.date}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="inline-flex items-center gap-0.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    <span>{rev.rating}</span>
                    <span>★</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3" />
                    <span>{t('वेरीफाइड खरीदार', 'Verified Purchase')}</span>
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-snug">
                  {rev.comment}
                </p>

                <div className="flex items-center gap-1 text-[10px] text-gray-400 pt-0.5">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{rev.helpfulCount} {t('लोगों को यह रिव्यू मददगार लगा', 'found this helpful')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar (Meesho Double CTA) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-2 sm:p-3 shadow-sticky">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 px-3 bg-white border-2 border-[#9F2089] text-[#9F2089] hover:bg-pink-50 font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('कार्ट में जोड़ें', 'Add to Bag')}</span>
          </button>

          {/* Buy Now button */}
          <button
            onClick={handleBuyNow}
            className="flex-1 py-3 px-3 bg-[#9F2089] hover:bg-pink-800 text-white font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-pink-200"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>{t('अभी खरीदें (Buy Now)', 'Buy Now')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
