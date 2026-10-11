import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { PartnerShop, PartnerShopItem, AgentCallLog } from '../../types';
import { MP_NETWORK_CITIES, SHOP_SUBSCRIPTION_PLANS } from '../../lib/mockData';
import {
  Users,
  Award,
  CheckCircle2,
  PhoneCall,
  Store,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  FileCheck,
  Plus,
  Search,
  Package,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Bike,
  Check,
  X,
  Gift,
  HelpCircle,
  Eye,
  CreditCard
} from 'lucide-react';

export const PromoterDashboard: React.FC = () => {
  const { currentUser, allProfiles, approveAgent, rejectAgent, approveAgentKyc, rejectAgentKyc } = useAuth();
  const {
    bookings,
    promoterApplications,
    partnerShops,
    addPartnerShop,
    addPartnerShopItem,
    togglePartnerShopItemStock,
    agentCallLogs,
    logAgentCall,
    quickDeliveryOrders,
  } = useData();
  const { success, error, info, warning } = useToast();

  const [activeTab, setActiveTab] = useState<'target' | 'agent_manager' | 'shops' | 'calling' | 'deliveries'>('target');

  // New Shop Modal State
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [shopMobile, setShopMobile] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopCity, setShopCity] = useState(currentUser?.city || 'Sironj');
  const [shopCategory, setShopCategory] = useState<'kirana' | 'medical' | 'dairy' | 'bakery' | 'hardware' | 'general_store'>('kirana');
  const [selectedPlanId, setSelectedPlanId] = useState('plan-bronze');

  // Add Item to Shop Modal State
  const [selectedShopForCatalog, setSelectedShopForCatalog] = useState<PartnerShop | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemUnit, setItemUnit] = useState('1 पीस / 1 Packet');
  const [itemCategory, setItemCategory] = useState('');

  // Call Log Modal State
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callAgentId, setCallAgentId] = useState('');
  const [callPurpose, setCallPurpose] = useState<'booking_activity' | 'delivery_coordination' | 'kyc_help' | 'general_audit'>('booking_activity');
  const [callBookingHealth, setCallBookingHealth] = useState<'high_active' | 'active_1_2' | 'zero_bookings' | 'issue_reported'>('high_active');
  const [callDeliveryReadiness, setCallDeliveryReadiness] = useState<'active_ready' | 'bike_ready' | 'offline' | 'needs_training'>('active_ready');
  const [callNotes, setCallNotes] = useState('');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Promoter Info
  const promoterCode = currentUser?.promoter_code || currentUser?.referral_code || 'PRM-MP-01';
  const slotNo = currentUser?.promoter_slot_no || 1;
  const salary = currentUser?.promoter_salary || 15000;

  // Promoter Application record (to check fee refund eligibility)
  const promoterApp = promoterApplications.find(
    (a) => a.assigned_slot === slotNo || a.promoter_code === promoterCode || a.mobile === currentUser?.mobile
  );

  // Agents associated with this promoter
  const networkAgents = allProfiles.filter(
    (p) =>
      p.role === 'agent' &&
      (p.promoter_code === promoterCode ||
        p.promoter_assigned_id === currentUser?.id ||
        p.referred_by_code === promoterCode ||
        p.city === currentUser?.city)
  );

  // Compute Verified Agents (Compulsory: >= 3 confirmed bus bookings!)
  const agentsWithBookingCounts = networkAgents.map((agent) => {
    const confirmedCount = bookings.filter(
      (b) => b.agent_id === agent.id && b.status === 'confirmed'
    ).length;
    return {
      agent,
      confirmedCount,
      isVerifiedQualityTarget: confirmedCount >= 3,
    };
  });

  const verifiedAgentsCount = agentsWithBookingCounts.filter((item) => item.isVerifiedQualityTarget).length;
  // Model 1: 500 verified agents (≥3 bookings each)
  const targetGoalModel1 = 500;
  const progressPctModel1 = Math.min(100, Math.round((verifiedAgentsCount / targetGoalModel1) * 100));

  // Partner shops onboarded by this promoter
  const myShops = partnerShops.filter(
    (s) => s.promoter_id === currentUser?.id || s.promoter_name === currentUser?.full_name || s.city === currentUser?.city
  );

  // Model 2: 125 Agents + 20 Shopkeeper Subscriptions (Gold Package ₹699/mo)
  const targetAgentsModel2 = 125;
  const targetShopsModel2 = 20;
  const goldShopsCount = myShops.filter((s) => s.subscription_plan_name.includes('गोल्ड') || s.monthly_fee >= 699).length;
  const goldProgressPct = Math.min(100, Math.round((goldShopsCount / targetShopsModel2) * 100));
  const model2AgentsProgressPct = Math.min(100, Math.round((verifiedAgentsCount / targetAgentsModel2) * 100));

  // Target Evaluation: Model 1 (500 agents) OR Model 2 (125 agents + 20 subscriptions)
  const isModel1Achieved = verifiedAgentsCount >= targetGoalModel1;
  const isModel2Achieved = verifiedAgentsCount >= targetAgentsModel2 && (goldShopsCount >= targetShopsModel2 || myShops.length >= targetShopsModel2);
  const isMixedAchieved = isModel1Achieved || isModel2Achieved;

  // Handle Add Partner Shop
  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !ownerName.trim() || !shopMobile.trim()) {
      error('Missing Information', 'कृपया दुकान का नाम, मालिक का नाम और मोबाइल नंबर भरें।');
      return;
    }

    const plan = SHOP_SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SHOP_SUBSCRIPTION_PLANS[0];
    const now = new Date();
    const expiry = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);

    const ok = await addPartnerShop({
      shop_name: shopName.trim(),
      owner_name: ownerName.trim(),
      mobile: shopMobile.trim(),
      address: shopAddress.trim(),
      city: shopCity,
      district: currentUser?.district || 'Vidisha',
      category: shopCategory,
      subscription_plan_name: plan.name,
      monthly_fee: plan.price,
      subscription_status: 'active',
      subscription_start: now.toISOString().slice(0, 10),
      subscription_end: expiry.toISOString().slice(0, 10),
      promoter_id: currentUser?.id || 'usr-promoter-01',
      promoter_name: currentUser?.full_name || 'Promoter Partner',
      catalog_items: [],
    });

    if (ok) {
      setIsAddShopModalOpen(false);
      setShopName('');
      setOwnerName('');
      setShopMobile('');
      setShopAddress('');
    }
  };

  // Handle Add Item to Shop
  const handleAddItemToShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopForCatalog || !itemName.trim() || !itemPrice) return;

    await addPartnerShopItem(selectedShopForCatalog.id, {
      name: itemName.trim(),
      price: Number(itemPrice),
      unit: itemUnit.trim() || '1 पीस',
      in_stock: true,
      category: itemCategory.trim() || undefined,
    });

    setItemName('');
    setItemPrice('');
    setSelectedShopForCatalog(null);
  };

  // Handle Submit Call Log
  const handleSaveCallLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetAgent = networkAgents.find((a) => a.id === callAgentId);
    if (!targetAgent) {
      error('Select Agent', 'कृपया एजेंट का चयन करें।');
      return;
    }

    await logAgentCall({
      promoter_id: currentUser?.id || 'usr-promoter-01',
      promoter_name: currentUser?.full_name || 'Promoter Partner',
      agent_id: targetAgent.id,
      agent_name: targetAgent.full_name,
      agent_mobile: targetAgent.mobile,
      call_purpose: callPurpose,
      bus_booking_health: callBookingHealth,
      delivery_readiness: callDeliveryReadiness,
      notes: callNotes.trim(),
    });

    setIsCallModalOpen(false);
    setCallNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Promoter Hero Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
                <Award className="w-4 h-4" />
                प्रमोटर पार्टनर (स्लॉट #{slotNo})
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-slate-300 border border-white/10">
                कोड: {promoterCode}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                कार्यक्षेत्र: {currentUser?.city}, {currentUser?.district} (MP)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              नमस्ते, {currentUser?.full_name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              सफ़ारगो प्रमोटर पार्टनर पोर्टल - 500 एजेंट नेटवर्क (3 बुकिंग शर्त), लोकल दुकान सब्सक्रिप्शन पैकेज, एजेंट कॉलिंग ऑडिट एवं सुपर एडमिन एजेंट मैनेजमेंट डेस्क।
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
              <div className="text-[11px] text-slate-300">फिक्स्ड मासिक वेतन</div>
              <div className="text-xl sm:text-2xl font-black text-amber-400">₹{salary.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-300 font-semibold">प्रति माह सीधे बैंक में</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
              <div className="text-[11px] text-slate-300">मॉडल 1 लक्ष्य (500 एजेंट)</div>
              <div className="text-xl sm:text-2xl font-black text-white">{verifiedAgentsCount} / {targetGoalModel1}</div>
              <div className="text-[10px] text-amber-300 font-semibold">{progressPctModel1}% लक्ष्य पूर्ण</div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-emerald-500/20 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-500/30 text-center">
              <div className="text-[11px] text-emerald-200">100% फीस रिफंड</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">₹648 वापस</div>
              <div className="text-[10px] text-emerald-200">
                {promoterApp?.fee_refunded_at ? '✓ रिफंड प्राप्त' : isMixedAchieved ? '🎉 रिफंड योग्य!' : '3 माह में लक्ष्य पर'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Promoter Dual-Track Target Rule Banner (Model 1: 500 Agents OR Model 2: 125 Agents + 20 Subscriptions) */}
      <div className="bg-gradient-to-r from-amber-50 via-indigo-50 to-emerald-50 border-2 border-indigo-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm font-black">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white">
                  प्रमोटर लक्ष्य नियम (Model 1 & Model 2)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ₹15,000 फिक्स्ड वेतन + 100% फीस रिफंड (₹648)
                </span>
                {isMixedAchieved && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white animate-pulse">
                    🎉 लक्ष्य पूर्ण (Target Achieved)
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                500 एजेंट नहीं भी जुड़े तो भी कोई बात नहीं: मॉडल 2 (125 एजेंट + 20 गोल्ड सब्सक्रिप्शन) से लक्ष्य पूरा करें!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                सफ़ारगो प्रमोटर पार्टनर के लिए 2 आसान रास्ते हैं: <br />
                • <strong>मॉडल 1</strong>: 500 एजेंट जोड़ना (प्रति एजेंट ≥3 कन्फर्म बस बुकिंग अनिवार्य)। <br />
                • <strong>मॉडल 2</strong>: केवल <strong>125 एजेंट जोड़ना</strong> + <strong>20 स्थानीय दुकानदारों को सबसे महंगा गोल्ड सब्सक्रिप्शन (₹699/माह)</strong> बेचना। <br />
                दोनों में से किसी भी एक मॉडल को पूरा करने पर <strong>₹15,000 फिक्स्ड वेतन</strong> व <strong>₹648 फीस रिफंड</strong> 100% सुरक्षित मिलेगा!
              </p>
            </div>
          </div>

          {/* Dual Track Status Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
            {/* Model 1: 500 Agents */}
            <div className="w-full sm:w-36 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">मॉडल 1: 500 एजेंट</div>
              <div className="text-base font-black text-indigo-700">{verifiedAgentsCount} / 500</div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.max(4, progressPctModel1)}%` }} />
              </div>
              <div className="text-[9px] text-slate-400 mt-1">≥3 बुकिंग प्रति एजेंट</div>
            </div>

            {/* Model 2 Part A: 125 Agents */}
            <div className="w-full sm:w-36 bg-white p-3 rounded-2xl border border-indigo-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">मॉडल 2: 125 एजेंट</div>
              <div className="text-base font-black text-purple-700">{verifiedAgentsCount} / 125</div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${Math.max(4, model2AgentsProgressPct)}%` }} />
              </div>
              <div className="text-[9px] text-slate-400 mt-1">{model2AgentsProgressPct}% पूर्ण</div>
            </div>

            {/* Model 2 Part B: 20 Gold Shops */}
            <div className="w-full sm:w-36 bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">मॉडल 2: 20 सब्सक्रिप्शन</div>
              <div className="text-base font-black text-amber-600">{goldShopsCount} / 20</div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.max(4, goldProgressPct)}%` }} />
              </div>
              <div className="text-[9px] text-slate-400 mt-1">गोल्ड पैकेज ₹699/माह</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('target')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'target'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>500 एजेंट टारगेट व लिस्ट ({networkAgents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('agent_manager')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'agent_manager'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>एजेंट मैनेजमेंट डेस्क (Approval & KYC)</span>
        </button>

        <button
          onClick={() => setActiveTab('shops')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'shops'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>लोकल दुकान सब्सक्रिप्शन व कैटलॉग ({myShops.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calling')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'calling'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>दैनिक एजेंट कॉलिंग व ऑडिट ({agentCallLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deliveries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'deliveries'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>15-मिनट डिलीवरी निगरानी ({quickDeliveryOrders.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: 500 AGENT TARGET & VERIFIED STATUS                */}
      {/* ======================================================== */}
      {activeTab === 'target' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                आपके नेटवर्क के एजेंट (कुल {networkAgents.length} | सत्यापित {verifiedAgentsCount})
              </h3>
              <p className="text-xs text-slate-500">
                हर एजेंट के सामने बुकिंग संख्या और 3-बुकिंग क्वालिटी वेरिफिकेशन बैज प्रदर्शित है।
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="एजेंट नाम या मोबाइल से खोजें..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {agentsWithBookingCounts
                .filter(({ agent }) => {
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase().trim();
                  return agent.full_name.toLowerCase().includes(q) || agent.mobile.includes(q);
                })
                .map(({ agent, confirmedCount, isVerifiedQualityTarget }) => (
                  <div key={agent.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{agent.full_name}</span>
                        {isVerifiedQualityTarget ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            सत्यापित लक्ष्य (Target Verified)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {3 - confirmedCount} बुकिंग्स और शेष
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">({agent.shop_name || 'जन सेवा केंद्र'})</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="font-mono text-slate-600">{agent.mobile}</span>
                        <span>{agent.city}, {agent.district}</span>
                        <span>रेफरल कोड: <strong className="font-mono text-indigo-600">{agent.referral_code}</strong></span>
                        <span>KYC: <strong className={agent.kyc_status === 'verified' ? 'text-emerald-600' : 'text-amber-600'}>{agent.kyc_status || 'not_submitted'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900">
                          {confirmedCount} कंफर्म सीटें
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {isVerifiedQualityTarget ? '✓ 500 टारगेट में काउंटेड' : '⚠️ अभी काउंट नहीं हुआ'}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setCallAgentId(agent.id);
                          setIsCallModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 flex items-center gap-1 transition"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>कॉल लॉग</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: AGENT MANAGEMENT DESK (APPROVAL & KYC)            */}
      {/* ======================================================== */}
      {activeTab === 'agent_manager' && (
        <div className="space-y-6">
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-indigo-950">
                सुपर एडमिन अधिकृत एजेंट मैनेजमेंट डेस्क
              </h3>
              <p className="text-xs text-indigo-800 leading-relaxed mt-0.5">
                प्रमोटर पार्टनर को सुपर एडमिन के अंतर्गत अपने क्षेत्र के एजेंटों के नए रजिस्ट्रेशन को अप्रूव करने तथा उनके आधार/पैन KYC दस्तावेजों की समीक्षा करके सीधे सत्यापित करने का पूरा अधिकार प्राप्त है।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Pending Agent Registrations */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  एजेंट रजिस्ट्रेशन अप्रूवल
                </h4>
                <span className="text-[11px] font-bold text-slate-500">
                  लंबित: {networkAgents.filter((a) => a.agent_status === 'pending_approval').length}
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {networkAgents.filter((a) => a.agent_status === 'pending_approval').length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    कोई नया एजेंट आवेदन लंबित नहीं है
                  </div>
                ) : (
                  networkAgents
                    .filter((a) => a.agent_status === 'pending_approval')
                    .map((agent) => (
                      <div key={agent.id} className="p-4 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 text-xs">{agent.full_name}</div>
                          <div className="text-[11px] text-slate-500">{agent.shop_name} • {agent.city}</div>
                          <div className="text-[10px] font-mono text-slate-400">{agent.mobile}</div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => approveAgent(agent.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                          >
                            स्वीकृत करें
                          </button>
                          <button
                            onClick={() => rejectAgent(agent.id)}
                            className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition"
                          >
                            अस्वीकार
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* 2. Pending Agent KYC Submissions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  एजेंट आधार / पैन KYC सत्यापन
                </h4>
                <span className="text-[11px] font-bold text-slate-500">
                  लंबित: {networkAgents.filter((a) => a.kyc_status === 'pending').length}
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {networkAgents.filter((a) => a.kyc_status === 'pending').length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    कोई KYC वेरिफिकेशन लंबित नहीं है
                  </div>
                ) : (
                  networkAgents
                    .filter((a) => a.kyc_status === 'pending')
                    .map((agent) => (
                      <div key={agent.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-slate-900 text-xs">{agent.full_name}</div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            KYC समीक्षा हेतु
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div>
                            <span className="text-slate-400">आधार:</span>{' '}
                            <strong className="font-mono">{agent.aadhaar_number || 'दर्ज नहीं'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">पैन:</span>{' '}
                            <strong className="font-mono">{agent.pan_number || 'दर्ज नहीं'}</strong>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400">बैंक:</span>{' '}
                            <strong>{agent.bank_name || 'HDFC Bank'}</strong> - A/C: <span className="font-mono">{agent.bank_account_number || '••••'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => rejectAgentKyc(agent.id, 'दस्तावेज़ स्पष्ट नहीं हैं')}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
                          >
                            अस्वीकार करें
                          </button>
                          <button
                            onClick={() => approveAgentKyc(agent.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            KYC वेरिफाई करें
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: LOCAL DUKANDAR SUBSCRIPTIONS & CATALOG            */}
      {/* ======================================================== */}
      {activeTab === 'shops' && (
        <div className="space-y-6">
          {/* Subscription Packages Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SHOP_SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800">
                    {plan.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">30 दिन वैधता</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{plan.name}</h4>
                <div className="text-2xl font-black text-indigo-600 my-2">
                  ₹{plan.price} <span className="text-xs font-normal text-slate-500">/माह</span>
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{plan.description}</p>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                आपकी जोड़ी गई पार्टनर दुकानें ({myShops.length})
              </h3>
              <p className="text-xs text-slate-500">
                15-मिनट डिलीवरी हेतु लोकल दुकानों का सामान यहाँ लिस्ट करें।
              </p>
            </div>

            <button
              onClick={() => setIsAddShopModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ नई लोकल दुकान जोड़ें (Onboard Shop)</span>
            </button>
          </div>

          {/* Shops List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myShops.length === 0 ? (
              <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
                <Store className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium">अभी कोई लोकल दुकान नहीं जोड़ी गई है</p>
                <p className="text-xs text-slate-400 mt-1">ऊपर दिए गए बटन से किराना, मेडिकल या डेयरी स्टोर को जोड़ें।</p>
              </div>
            ) : (
              myShops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{shop.shop_name}</h4>
                        <div className="text-xs text-slate-500 mt-0.5">मालिक: {shop.owner_name}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                        {shop.subscription_plan_name}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{shop.address}, {shop.city}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                        <span>{shop.mobile}</span>
                      </div>
                    </div>

                    {/* Catalog Summary */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                        <span>कैटलॉग सामान ({shop.catalog_items?.length || 0})</span>
                        <button
                          onClick={() => setSelectedShopForCatalog(shop)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" />
                          सामान जोड़ें
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {shop.catalog_items?.length === 0 ? (
                          <div className="text-[11px] text-slate-400 italic">कोई सामान लिस्ट नहीं है</div>
                        ) : (
                          shop.catalog_items?.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100 last:border-0">
                              <span className="text-slate-800 truncate max-w-[140px]">{item.name}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-indigo-700">₹{item.price}</span>
                                <button
                                  onClick={() => togglePartnerShopItemStock(shop.id, item.id)}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    item.in_stock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {item.in_stock ? 'उपलब्ध' : 'स्टॉक खत्म'}
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>वैधता: {shop.subscription_end}</span>
                    <span className="font-bold text-emerald-600">₹{shop.monthly_fee} /माह</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: DAILY AGENT CALLING & FIELD AUDIT TRACKER         */}
      {/* ======================================================== */}
      {activeTab === 'calling' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                दैनिक एजेंट कॉलिंग व फील्ड ऑडिट लॉग ({agentCallLogs.length})
              </h3>
              <p className="text-xs text-slate-500">
                प्रमोटर का काम प्रतिदिन एजेंटों से संपर्क करके बस बुकिंग एवं 15-मिनट डिलीवरी की स्थिति दर्ज करना है।
              </p>
            </div>

            <button
              onClick={() => setIsCallModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition shrink-0"
            >
              <PhoneCall className="w-4 h-4" />
              <span>+ नई एजेंट कॉल लॉग करें (Check-in)</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {agentCallLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <PhoneCall className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium">कोई कॉल लॉग दर्ज नहीं है</p>
                </div>
              ) : (
                agentCallLogs.map((log) => (
                  <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{log.agent_name}</span>
                        <span className="font-mono text-xs text-slate-500">({log.agent_mobile})</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          {log.call_purpose === 'booking_activity' && 'बस बुकिंग फॉलोअप'}
                          {log.call_purpose === 'delivery_coordination' && '15-मिनट डिलीवरी ट्रेनिंग'}
                          {log.call_purpose === 'kyc_help' && 'KYC डॉक्यूमेंट सहायता'}
                          {log.call_purpose === 'general_audit' && 'सामान्य ऑडिट'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-slate-600">
                          बस बुकिंग स्थिति:{' '}
                          <strong className={log.bus_booking_health === 'high_active' ? 'text-emerald-600' : 'text-amber-600'}>
                            {log.bus_booking_health === 'high_active' && 'दैनिक सक्रिय (2+ बुकिंग्स)'}
                            {log.bus_booking_health === 'active_1_2' && 'मध्यम सक्रिय (1-2 बुकिंग्स)'}
                            {log.bus_booking_health === 'zero_bookings' && 'शून्य बुकिंग्स'}
                            {log.bus_booking_health === 'issue_reported' && 'समस्या रिपोर्टेड'}
                          </strong>
                        </span>

                        <span className="flex items-center gap-1 text-slate-600">
                          डिलीवरी रेडीनेस:{' '}
                          <strong className="text-indigo-600">
                            {log.delivery_readiness === 'active_ready' && 'पूर्णतः तैयार (ऑन-ड्यूटी)'}
                            {log.delivery_readiness === 'bike_ready' && 'बाइक रेडी'}
                            {log.delivery_readiness === 'needs_training' && 'ट्रेनिंग आवश्यक'}
                            {log.delivery_readiness === 'offline' && 'ऑफलाइन'}
                          </strong>
                        </span>
                      </div>

                      {log.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-2xl">
                          <strong>ऑडिट नोट्स:</strong> {log.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-xs text-slate-400 shrink-0">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(log.created_at).toLocaleDateString('hi-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: 15-MINUTE DELIVERY OVERSIGHT                      */}
      {/* ======================================================== */}
      {activeTab === 'deliveries' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                15-मिनट क्विक डिलीवरी ऑर्डर्स ({quickDeliveryOrders.length})
              </h3>
              <p className="text-xs text-slate-500">
                किराना, मेडिकल व जनरल सामान की स्थानीय 15-मिनट डिलीवरी स्थिति
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickDeliveryOrders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-700">{ord.order_code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ord.status === 'delivered' && '✓ डिलीवर संपन्न'}
                    {ord.status === 'out_for_delivery' && '⚡ 15-मिनट रास्ते में'}
                    {ord.status === 'photo_price_uploaded' && 'बिल फोटो भेजी'}
                    {ord.status === 'placed' && 'ऑर्डर सबमिटेड'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong>ग्राहक:</strong> {ord.customer_name} ({ord.customer_mobile})</div>
                  <div><strong>पता:</strong> {ord.customer_address}, {ord.city}</div>
                  <div><strong>सामान:</strong> {ord.items_description}</div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">दूरी:</span> <strong>{ord.distance_km} KM</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">शुल्क:</span> <strong className="text-indigo-600">₹{ord.delivery_fee}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">एजेंट कमाई:</span> <strong className="text-emerald-600">+₹{ord.agent_payout}</strong>
                  </div>
                </div>

                {ord.agent_name && (
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>डिलीवरी पार्टनर: <strong>{ord.agent_name}</strong></span>
                    <span className="font-mono">{ord.agent_mobile}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD PARTNER SHOP */}
      {isAddShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 my-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-600" />
                नई लोकल दुकान जोड़ें (Onboard Partner Shop)
              </h3>
              <button onClick={() => setIsAddShopModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShop} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">दुकान का नाम *</label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="उदा. श्री राम किराना एवं जनरल स्टोर्स"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">मालिक का नाम *</label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="उदा. कैलाश चंद गुप्ता"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">मोबाइल नंबर *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={shopMobile}
                    onChange={(e) => setShopMobile(e.target.value)}
                    placeholder="10-अंकों का नंबर"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">शहर / कस्बा *</label>
                  <select
                    value={shopCity}
                    onChange={(e) => setShopCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                  >
                    {MP_NETWORK_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">दुकान श्रेणी *</label>
                  <select
                    value={shopCategory}
                    onChange={(e) => setShopCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                  >
                    <option value="kirana">किराना एवं प्रोविजन</option>
                    <option value="medical">मेडिकल एवं दवाइयां</option>
                    <option value="dairy">डेयरी एवं दूध उत्पाद</option>
                    <option value="bakery">बेकरी एवं स्नैक्स</option>
                    <option value="general_store">जनरल स्टोर्स</option>
                    <option value="hardware">हार्डवेयर एवं इलेक्ट्रिक</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">दुकान का पता *</label>
                  <input
                    type="text"
                    required
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    placeholder="उदा. पुराना बस स्टैंड, मेन मार्केट, सिरोंज"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">मंथली सब्सक्रिप्शन पैकेज *</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-bold text-indigo-700"
                  >
                    {SHOP_SUBSCRIPTION_PLANS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ₹{p.price}/माह ({p.features[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddShopModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  दुकान ऑनबोर्ड करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD ITEM TO SHOP CATALOG */}
      {selectedShopForCatalog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-bold text-slate-900">
                सामान जोड़ें - {selectedShopForCatalog.shop_name}
              </h3>
              <button onClick={() => setSelectedShopForCatalog(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItemToShop} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">सामान का नाम *</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="उदा. आशीर्वाद आटा 5kg"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">कीमत (₹) *</label>
                  <input
                    type="number"
                    required
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="उदा. 210"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">मात्रा / यूनिट</label>
                  <input
                    type="text"
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    placeholder="उदा. 5kg, 1 लीटर, 1 पत्ता"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedShopForCatalog(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  कैटलॉग में जोड़ें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LOG AGENT CALL */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-indigo-600" />
                दैनिक एजेंट कॉल ऑडिट दर्ज करें
              </h3>
              <button onClick={() => setIsCallModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCallLog} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">एजेंट चुनें *</label>
                <select
                  required
                  value={callAgentId}
                  onChange={(e) => setCallAgentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-medium"
                >
                  <option value="">-- एजेंट चुनें --</option>
                  {networkAgents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name} ({a.shop_name || a.city}) - {a.mobile}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">कॉल का उद्देश्य *</label>
                <select
                  value={callPurpose}
                  onChange={(e) => setCallPurpose(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                >
                  <option value="booking_activity">बस बुकिंग एक्टिविटी चेक (3 बुकिंग लक्ष्य)</option>
                  <option value="delivery_coordination">15-मिनट डिलीवरी तत्परता व ट्रेनिंग</option>
                  <option value="kyc_help">KYC व बैंक खाता मार्गदर्शन</option>
                  <option value="general_audit">सामान्य ऑडिट व कुशलक्षेम</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">बस बुकिंग गतिविधि स्थिति *</label>
                <select
                  value={callBookingHealth}
                  onChange={(e) => setCallBookingHealth(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                >
                  <option value="high_active">उच्च सक्रिय (दैनिक 2+ बुकिंग्स)</option>
                  <option value="active_1_2">सक्रिय (हफ्ते में 1-2 बुकिंग्स)</option>
                  <option value="zero_bookings">शून्य बुकिंग्स (सपोर्ट आवश्यक)</option>
                  <option value="issue_reported">समस्या दर्ज कराई</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">15-मिनट डिलीवरी रेडीनेस *</label>
                <select
                  value={callDeliveryReadiness}
                  onChange={(e) => setCallDeliveryReadiness(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                >
                  <option value="active_ready">पूर्णतः सक्रिय व बाइक तैयार</option>
                  <option value="bike_ready">बाइक है, पिकअप के लिए तैयार</option>
                  <option value="needs_training">ट्रेनिंग व ऐप समझना बाकी</option>
                  <option value="offline">वर्तमान में ऑफलाइन</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">कॉल नोट्स व बातचीत विवरण</label>
                <textarea
                  rows={2}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="एजेंट ने क्या बताया? क्या मदद चाहिए..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCallModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  कॉल लॉग सेव करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
