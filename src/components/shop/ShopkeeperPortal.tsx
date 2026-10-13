import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { PartnerShop, PartnerShopItem } from '../../types';
import { SHOP_SUBSCRIPTION_PLANS } from '../../lib/mockData';
import { GoWalletHub, Go3DLogoBadge } from '../wallet/GoWalletHub';
import {
  Store,
  Package,
  Bike,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Sparkles,
  Award,
  Phone,
  Clock,
  MapPin,
  TrendingUp,
  Tag,
  DollarSign,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

interface ShopkeeperPortalProps {
  onNavigate?: (tab: string) => void;
}

export const ShopkeeperPortal: React.FC<ShopkeeperPortalProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const {
    partnerShops,
    updatePartnerShop,
    addPartnerShopItem,
    togglePartnerShopItemStock,
    quickDeliveryOrders,
    agentWalletBalance,
  } = useData();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'go_wallet' | 'catalog' | 'orders' | 'subscription'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Item Modal
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('1 पीस / 1 Packet');
  const [newItemCategory, setNewItemCategory] = useState('');

  // Find this shopkeeper's shop
  const userMobileClean = currentUser?.mobile ? currentUser.mobile.replace(/\D/g, '') : '';
  const userFullNameClean = currentUser?.full_name ? currentUser.full_name.toLowerCase() : '';
  const myShop = (partnerShops || []).find(
    (s) =>
      (currentUser?.shop_id && s.id === currentUser.shop_id) ||
      (currentUser?.id && s.user_id === currentUser.id) ||
      (userMobileClean && s.mobile.replace(/\D/g, '') === userMobileClean) ||
      (userFullNameClean && (s.owner_name || '').toLowerCase() === userFullNameClean)
  ) || ((partnerShops && partnerShops[0]) ? partnerShops[0] : null);

  // Orders picking up from this shop
  const myShopOrders = quickDeliveryOrders.filter(
    (o) => o.partner_shop_id === myShop?.id || (myShop && o.partner_shop_name === myShop.shop_name)
  );

  const activeOrdersCount = myShopOrders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  const catalogItems = myShop?.catalog_items || [];
  const inStockCount = catalogItems.filter((i) => i.in_stock).length;

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShop) return;
    if (!newItemName.trim() || !newItemPrice) {
      error('Fields Required', 'कृपया सामान का नाम और मूल्य दर्ज करें।');
      return;
    }

    const ok = await addPartnerShopItem(myShop.id, {
      name: newItemName.trim(),
      price: Number(newItemPrice),
      unit: newItemUnit.trim() || '1 पीस',
      in_stock: true,
      category: newItemCategory.trim() || undefined,
    });

    if (ok) {
      setIsAddItemModalOpen(false);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemCategory('');
      success('Item Added', 'सामान आपके दुकान कैटलॉग में जुड़ गया है।');
    }
  };

  const handleUpgradeToGold = async () => {
    if (!myShop) return;
    const goldPlan = SHOP_SUBSCRIPTION_PLANS.find((p) => p.name.includes('गोल्ड') || p.price === 699) || SHOP_SUBSCRIPTION_PLANS[2];
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const ok = await updatePartnerShop(myShop.id, {
      subscription_plan_name: goldPlan.name,
      monthly_fee: goldPlan.price,
      subscription_status: 'active',
      subscription_start: now.toISOString().slice(0, 10),
      subscription_end: expiry.toISOString().slice(0, 10),
    });

    if (ok) {
      success('Upgraded to Gold!', 'आपकी दुकान सफलतापूर्वक ₹699 गोल्ड प्रीमियम पैकेज में अपग्रेड हो गई है।');
    }
  };

  const filteredCatalog = catalogItems.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.category && i.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* 1. Shopkeeper Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-sm">
                <Store className="w-4 h-4" />
                सफ़ारगो मर्चेंट पार्टनर (Shopkeeper Portal)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                {myShop?.subscription_plan_name || 'गोल्ड मर्चेंट'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-200">
                {myShop?.city}, {myShop?.district} (MP)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black">
              {myShop?.shop_name || 'आपकी दुकान'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              दुकानदार: <strong>{myShop?.owner_name || currentUser?.full_name}</strong> (+91 {myShop?.mobile}) | पता: {myShop?.address}
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-300 pt-1">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                संबद्ध प्रमोटर पार्टनर: <strong>{myShop?.promoter_name || 'Dharmendra Yadav'}</strong> (फील्ड सपोर्ट व ऑनबोर्डिंग)
              </span>
            </div>
          </div>

          {/* Quick CTA */}
          <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>नया सामान जोड़ें (Add Item)</span>
            </button>
            <button
              onClick={handleUpgradeToGold}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>गोल्ड पैकेज अपग्रेड (₹699)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1.5 DUKANDAR 3D GO WALLET QUICK BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white border-2 border-amber-400/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Go3DLogoBadge size="md" showWalletText={true} exclusive={true} />
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              दुकानदार Go Wallet बैलेंस:{' '}
              <span className="text-emerald-400 font-mono">
                ₹{(agentWalletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              क्विक कॉमर्स में बिके आपके सामान का पैसा सीधे यहाँ जुड़ता है • बैंक/UPI निकासी • SafarGo #1 Top Ad Boost • बस बुकिंग
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('go_wallet')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow transition cursor-pointer"
          >
            🚀 Go Wallet, बैंक निकासी, Top Ad व Transactions खोलें ➔
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate('new-booking')}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow transition cursor-pointer"
            >
              🚌 Go Wallet से बस टिकट बुक करें
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">कैटलॉग में कुल सामान</div>
            <div className="text-2xl font-black text-slate-900">{catalogItems.length}</div>
            <div className="text-[11px] text-emerald-600 font-bold">{inStockCount} उपलब्ध (In Stock)</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">लाइव डिलीवरी ऑर्डर्स</div>
            <div className="text-2xl font-black text-slate-900">{myShopOrders.length}</div>
            <div className="text-[11px] text-indigo-600 font-bold">{activeOrdersCount} सक्रिय ऑर्डर्स</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">सक्रिय सब्सक्रिप्शन</div>
            <div className="text-sm font-black text-slate-900 truncate max-w-[120px]">
              {myShop?.subscription_plan_name || 'गोल्ड'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">₹{myShop?.monthly_fee}/माह</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">वैधता समाप्ति</div>
            <div className="text-sm font-mono font-bold text-slate-900">
              {myShop?.subscription_end || '2026-11-30'}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold">स्थिति: सक्रिय (Active)</div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>दुकान विवरण एवं लाइव ऑर्डर</span>
        </button>

        <button
          onClick={() => setActiveTab('go_wallet')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-black border-b-2 transition cursor-pointer ${
            activeTab === 'go_wallet'
              ? 'border-amber-500 text-amber-700 bg-amber-50/70 rounded-t-xl'
              : 'border-transparent text-indigo-700 hover:text-indigo-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>👑 3D Go Wallet (बिक्री आय, बैंक निकासी, Top Ad & Transactions)</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'catalog'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>सामान कैटलॉग व स्टॉक ({catalogItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>सफ़ारगो रनर पिकअप ऑर्डर्स ({myShopOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'subscription'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>सब्सक्रिप्शन पैकेज प्रबंधन</span>
        </button>
      </div>

      {/* TAB: 3D GO WALLET HUB FOR DUKANDAR */}
      {activeTab === 'go_wallet' && <GoWalletHub onNavigate={onNavigate} />}

      {/* ========================================================== */}
      {/* TAB 1: OVERVIEW & LIVE ORDERS                               */}
      {/* ========================================================== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Runner Pickups */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Bike className="w-5 h-5 text-emerald-600" />
                    <span>दुकान से लाइव पिकअप (सफ़ारगो रनर)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    एजेंट आपकी दुकान पर आकर सामान लेगा और 5 मिनट में बिल फोटो अपलोड करेगा।
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {activeOrdersCount} एक्टिव
                </span>
              </div>

              {myShopOrders.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-500 text-xs">
                  अभी आपकी दुकान से कोई लाइव ऑर्डर सक्रिय नहीं है। जब ग्राहक सफ़ारगो 15-मिनट डिलीवरी से सामान मंगाएगा तो ऑर्डर यहां दिखेगा।
                </div>
              ) : (
                <div className="space-y-3">
                  {myShopOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded border">
                          {ord.order_code}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        सामान: {ord.items_description}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <div>ग्राहक: <strong>{ord.customer_name}</strong> ({ord.city})</div>
                        <div>रनर: <strong>{ord.agent_name || 'असाइनमेंट जारी'}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Catalog Preview */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    आपकी दुकान का कैटलॉग (शीर्ष 5 सामान)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ग्राहक इन सामानों को 1-क्लिक में कार्ट में जोड़ सकते हैं।
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  पूरा कैटलॉग देखें →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {catalogItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-slate-800 block">{item.name}</strong>
                      <span className="text-[10px] text-slate-400">{item.unit} | {item.category || 'सामान्य'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-900">₹{item.price}</span>
                      <button
                        onClick={() => {
                          if (myShop) togglePartnerShopItemStock(myShop.id, item.id);
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          item.in_stock
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.in_stock ? 'स्टॉक में है' : 'खत्म'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Subscription & Promoter */}
          <div className="space-y-6">
            
            {/* Active Subscription Box */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                  एक्टिव पैकेज
                </span>
                <Sparkles className="w-5 h-5 text-yellow-200" />
              </div>

              <div>
                <h4 className="text-xl font-black">
                  {myShop?.subscription_plan_name || 'गोल्ड मर्चेंट'}
                </h4>
                <p className="text-xs text-amber-100 mt-1">
                  मासिक शुल्क: ₹{myShop?.monthly_fee}/माह | वैधता: {myShop?.subscription_end}
                </p>
              </div>

              <div className="bg-black/20 rounded-2xl p-3 text-xs space-y-1.5 backdrop-blur-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-yellow-300" />
                  <span>SafarGo ऐप पर लोकल दुकान की लिस्टिंग</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-yellow-300" />
                  <span>15-मिनट डिलीवरी रनर द्वारा डायरेक्ट पिकअप</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-yellow-300" />
                  <span>प्रमोटर पार्टनर द्वारा ऑन-ग्राउंड प्रचार</span>
                </div>
              </div>

              <button
                onClick={handleUpgradeToGold}
                className="w-full py-3 bg-white text-slate-900 font-black rounded-xl text-xs shadow hover:bg-amber-50 transition"
              >
                गोल्ड पैकेज अपग्रेड (₹699/माह)
              </button>
            </div>

            {/* Promoter Partner Assistance */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                आपके अधिकृत प्रमोटर पार्टनर
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  {myShop?.promoter_name?.[0] || 'D'}
                </div>
                <div>
                  <h5 className="text-sm font-black text-slate-900">
                    {myShop?.promoter_name || 'Dharmendra Yadav'}
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    सफ़ारगो फील्ड टेरिटरी मैनेजर
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                <p className="text-slate-600">
                  प्रमोटर पार्टनर आपकी दुकान का कैटलॉग अपडेट करने, ऑनलाइन प्रचार करने एवं एजेंट समन्वय में मदद करेंगे।
                </p>
              </div>

              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(`नमस्ते सफ़ारगो प्रमोटर पार्टनर, मेरी दुकान (${myShop?.shop_name}) के संबंध में सहायता चाहिए।`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Phone className="w-4 h-4" />
                <span>प्रमोटर से WhatsApp संपर्क करें</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: CATALOG MANAGEMENT                                   */}
      {/* ========================================================== */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                सामान कैटलॉग व स्टॉक प्रबंधन ({catalogItems.length})
              </h3>
              <p className="text-xs text-slate-500">
                दुकान में सामान खत्म होने पर 'उपलब्ध' बटन पर क्लिक करके टॉगल करें।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="सामान खोजें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => setIsAddItemModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>नया सामान जोड़ें</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b">
                <tr>
                  <th className="p-3">सामान का नाम</th>
                  <th className="p-3">इकाई (Unit)</th>
                  <th className="p-3">श्रेणी (Category)</th>
                  <th className="p-3">मूल्य (Price)</th>
                  <th className="p-3">स्टॉक स्थिति</th>
                  <th className="p-3 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCatalog.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{item.name}</td>
                    <td className="p-3 text-slate-600">{item.unit}</td>
                    <td className="p-3 text-slate-500">{item.category || 'किराना'}</td>
                    <td className="p-3 font-mono font-black text-slate-900">₹{item.price}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.in_stock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.in_stock ? 'उपलब्ध (In Stock)' : 'समाप्त (Out of Stock)'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          if (myShop) togglePartnerShopItemStock(myShop.id, item.id);
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]"
                      >
                        {item.in_stock ? 'स्टॉक से हटाएं' : 'स्टॉक में डालें'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: RUNNER ORDERS                                        */}
      {/* ========================================================== */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900">
            सफ़ारगो एजेंट पिकअप ऑर्डर्स ({myShopOrders.length})
          </h3>
          <div className="space-y-3">
            {myShopOrders.map((ord) => (
              <div key={ord.id} className="p-4 border rounded-2xl bg-slate-50 text-xs space-y-2">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{ord.order_code}</span>
                  <span className="text-emerald-600">{ord.status}</span>
                </div>
                <div>सामान: {ord.items_description}</div>
                <div className="text-slate-500">ग्राहक: {ord.customer_name} ({ord.customer_address})</div>
                <div className="text-slate-500">डिलीवरी रनर: {ord.agent_name || 'असाइन किया जा रहा है'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 4: SUBSCRIPTION PACKAGES                                */}
      {/* ========================================================== */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-3xl p-6 space-y-2">
            <h3 className="text-lg font-black text-amber-950">
              स्थानीय दुकानदार सब्सक्रिप्शन पैकेज (Local Dukandar Package)
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
              सफ़ारगो प्रमोटर पार्टनर द्वारा स्थानीय दुकानों का ऑनलाइन प्रचार किया जाता है। सबसे लोकप्रिय <strong>गोल्ड पैकेज (₹699/माह)</strong> लेने पर आपकी दुकान को सफ़ारगो नेटवर्क में उच्चतम प्राथमिकता और असीमित ऑनलाइन लिस्टिंग मिलती है।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SHOP_SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrent = myShop?.subscription_plan_name === plan.name;
              const isGold = plan.name.includes('गोल्ड') || plan.price === 699;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl p-6 border-2 transition relative flex flex-col justify-between ${
                    isGold
                      ? 'border-amber-400 shadow-lg'
                      : isCurrent
                      ? 'border-emerald-500 shadow-sm'
                      : 'border-slate-200'
                  }`}
                >
                  {isGold && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 px-3 py-0.5 rounded-full text-[10px] font-black uppercase">
                      ⭐ सर्वाधिक लोकप्रिय (Most Popular)
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-slate-900">{plan.name}</h4>
                      <p className="text-xs text-slate-500">{plan.description}</p>
                    </div>

                    <div className="text-3xl font-black text-slate-900">
                      ₹{plan.price}
                      <span className="text-xs font-normal text-slate-400"> / माह</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleUpgradeToGold}
                    disabled={isCurrent}
                    className={`mt-6 w-full py-3 rounded-xl font-black text-xs transition ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : isGold
                        ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isCurrent ? 'वर्तमान सक्रिय पैकेज' : `यह पैकेज चुनें (₹${plan.price})`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-slate-900">
                नया सामान कैटलॉग में जोड़ें
              </h4>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  सामान का नाम (Item Name) *
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="उदा. आशीर्वाद आटा 5kg / अमूल दूध 1L"
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    विक्रय मूल्य (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="उदा. 120"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    इकाई (Unit)
                  </label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="उदा. 1 Packet / 1 Litre"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  श्रेणी (Category)
                </label>
                <input
                  type="text"
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  placeholder="उदा. किराना / डेयरी / दवाई"
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="w-1/3 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow"
                >
                  कैटलॉग में सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
