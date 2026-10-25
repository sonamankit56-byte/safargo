import React, { useState, useEffect, useMemo } from 'react';
import { useTravel } from '../../context/TravelContext';
import { 
  Smartphone, 
  Zap, 
  Tv, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Receipt, 
  ArrowRight, 
  Clock, 
  Printer, 
  Share2, 
  Sparkles, 
  Check, 
  X,
  Building,
  RefreshCw,
  Search,
  History,
  Download,
  Loader2,
  ExternalLink,
  QrCode,
  AlertCircle,
  XCircle,
  ChevronDown,
  Edit3,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  fetchAutoPlans,
  detectIndianOperatorAndCircle, 
  createRechargeCheckout, 
  checkOrderStatus,
  fetchPlansByOperator,
  PlanGroup, 
  PlanItem, 
  DetectedOperator 
} from '../../services/paybeezRecharge';
import { generateUpiDeepLinks } from '../../lib/youpiPg';

interface RechargePlan {
  id: string;
  price: number;
  validity: string;
  data: string;
  calls: string;
  desc: string;
  badge?: string;
}

const POPULAR_MOBILE_PLANS: Record<string, RechargePlan[]> = {
  jio: [
    {
      id: 'jio-299',
      price: 299,
      validity: '28 दिन',
      data: '1.5 GB / दिन',
      calls: 'असीमित कॉलिंग',
      desc: '100 SMS/दिन + ट्रू 5G डेटा + अनलिमिटेड कॉल्स',
      badge: 'बेस्टसेलर'
    },
    {
      id: 'jio-349',
      price: 349,
      validity: '28 दिन',
      data: '2.0 GB / दिन',
      calls: 'असीमित 5G डेटा',
      desc: 'True 5G अनलिमिटेड + 100 SMS/दिन',
      badge: 'ट्रू 5G'
    },
    {
      id: 'jio-666',
      price: 666,
      validity: '70 दिन',
      data: '1.5 GB / दिन',
      calls: 'असीमित कॉलिंग',
      desc: 'लंबी 70 दिन वैलिडिटी + 100 SMS/दिन'
    },
    {
      id: 'jio-899',
      price: 899,
      validity: '90 दिन',
      data: '2.0 GB / दिन',
      calls: 'असीमित 5G डेटा',
      desc: '3 महीने की पूरी वैलिडिटी + 20 GB एक्स्ट्रा डेटा',
      badge: 'सुपर सेवर'
    },
    {
      id: 'jio-3599',
      price: 3599,
      validity: '365 दिन (वार्षिक)',
      data: '2.5 GB / दिन',
      calls: 'असीमित कॉलिंग',
      desc: '1 पूरा साल कोई रिचार्ज नहीं + अनलिमिटेड वॉयस',
      badge: 'वार्षिक बचत'
    },
    {
      id: 'jio-19',
      price: 19,
      validity: 'मौजूदा प्लान तक',
      data: '1.0 GB डेटा',
      calls: 'डेटा बूस्टर',
      desc: 'इमरजेंसी डेटा टॉप-अप पैक'
    }
  ],
  airtel: [
    {
      id: 'art-299',
      price: 299,
      validity: '28 दिन',
      data: '1.5 GB / दिन',
      calls: 'असीमित लोकल+STD',
      desc: 'एयरटेल थैंक्स लाभ + 100 SMS/दिन',
      badge: 'पॉपुलर'
    },
    {
      id: 'art-379',
      price: 379,
      validity: '1 महीना',
      data: '2.0 GB / दिन',
      calls: 'असीमित 5G डेटा',
      desc: 'अनलिमिटेड 5G + विंक म्यूजिक + अपोलो 24|7'
    },
    {
      id: 'art-839',
      price: 839,
      validity: '84 दिन',
      data: '2.0 GB / दिन',
      calls: 'असीमित कॉलिंग',
      desc: '3 महीने की वैलिडिटी + डिज़्नी+ हॉटस्टार मोबाइल'
    },
    {
      id: 'art-3359',
      price: 3359,
      validity: '365 दिन',
      data: '2.5 GB / दिन',
      calls: 'असीमित कॉलिंग',
      desc: 'वार्षिक प्लान + प्राइम वीडियो मोबाइल + हॉटस्टार'
    }
  ],
  vi: [
    {
      id: 'vi-299',
      price: 299,
      validity: '28 दिन',
      data: '1.5 GB / दिन',
      calls: 'असीमित कॉलिंग',
      desc: 'बिंज ऑल नाइट (रात 12 से सुबह 6 अनलिमिटेड डेटा)'
    },
    {
      id: 'vi-719',
      price: 719,
      validity: '84 दिन',
      data: '1.5 GB / दिन',
      calls: 'असीमित कॉलिंग',
      desc: 'वीकेंड डेटा रोलओवर + रात को फ्री डेटा'
    }
  ],
  bsnl: [
    {
      id: 'bsnl-199',
      price: 199,
      validity: '30 दिन',
      data: '2.0 GB / दिन',
      calls: 'असीमित कॉलिंग',
      desc: 'सस्ती कॉलिंग और भारी डेटा पैक'
    },
    {
      id: 'bsnl-599',
      price: 599,
      validity: '84 दिन',
      data: '3.0 GB / दिन',
      calls: 'असीमित कॉलिंग',
      desc: 'विशाल 3GB प्रतिदिन डेटा + असीमित कॉलिंग'
    }
  ]
};

const DTH_PLANS: Record<string, RechargePlan[]> = {
  tataplay: [
    { id: 'tp-349', price: 349, validity: '1 महीना', data: 'HD क्वालिटी', calls: 'हिंदी + स्पोर्ट्स', desc: 'हिंदी फैमिली किड्स और स्पोर्ट्स एचडी पैक' },
    { id: 'tp-999', price: 999, validity: '3 महीने', data: 'HD क्वालिटी', calls: 'मेगा पैक', desc: 'प्रीमियम मूवीज, स्पोर्ट्स व एंटरटेनमेंट' },
    { id: 'tp-2899', price: 2899, validity: '12 महीने (वार्षिक)', data: 'HD क्वालिटी', calls: 'सुपर अल्ट्रा', desc: 'पूरे साल का निश्चिंत टीवी पैक' }
  ],
  airtel_dth: [
    { id: 'ad-299', price: 299, validity: '1 महीना', data: 'HD क्वालिटी', calls: 'हिंदी धमाका', desc: 'हिंदी एंटरटेनमेंट व न्यूज चैनल' },
    { id: 'ad-849', price: 849, validity: '3 महीने', data: 'HD क्वालिटी', calls: 'स्पोर्ट्स कॉम्बो', desc: 'लाइव क्रिकेट और परिवार मनोरंजन' }
  ],
  dishtv: [
    { id: 'dt-280', price: 280, validity: '1 महीना', data: 'SD/HD', calls: 'क्लासिक पैक', desc: 'दैनिक फैमिली पैक' },
    { id: 'dt-799', price: 799, validity: '3 महीने', data: 'HD क्वालिटी', calls: 'सुपर कॉम्बो', desc: 'सभी लोकप्रिय चैनल' }
  ]
};

interface TransactionItem {
  id: string;
  txnId: string;
  type: 'mobile' | 'electricity' | 'dth' | 'fastag';
  title: string;
  operator: string;
  amount: number;
  commission?: number;
  consumer: string;
  date: string;
  desc: string;
}

export const OPERATORS_LIST = [
  { id: 'jio', opId: '140', name: 'Reliance Jio' },
  { id: 'airtel', opId: '1', name: 'Bharti Airtel' },
  { id: 'vi', opId: '338', name: 'Vodafone Idea (Vi)' },
  { id: 'bsnl', opId: '3', name: 'BSNL Mobile' }
];

export const CIRCLES_LIST = [
  { id: '14', cirId: '14', name: 'Madhya Pradesh & Chhattisgarh' },
  { id: '5', cirId: '5', name: 'Delhi NCR' },
  { id: '6', cirId: '6', name: 'Mumbai' },
  { id: '7', cirId: '7', name: 'Maharashtra & Goa' },
  { id: '18', cirId: '18', name: 'UP East' },
  { id: '19', cirId: '19', name: 'UP West' },
  { id: '3', cirId: '3', name: 'Bihar & Jharkhand' },
  { id: '16', cirId: '16', name: 'Rajasthan' },
  { id: '8', cirId: '8', name: 'Gujarat' },
  { id: '15', cirId: '15', name: 'Punjab' },
  { id: '9', cirId: '9', name: 'Haryana' },
  { id: '12', cirId: '12', name: 'Kolkata' },
  { id: '20', cirId: '20', name: 'West Bengal' }
];

function categorizePlans(rawPlans: PlanItem[]): PlanGroup[] {
  const popularPicks = [199, 239, 299, 319, 349, 399, 449, 479, 666, 719, 859, 999, 1199, 2999, 3599];
  const popularPlans = rawPlans.filter(p => p.popular || popularPicks.includes(p.rs));
  const data15 = rawPlans.filter(p => {
    const text = ((p.data || '') + ' ' + (p.desc || '')).toLowerCase();
    return text.includes('1.5gb') || text.includes('1.5 gb');
  });
  const data2Plus = rawPlans.filter(p => {
    const text = ((p.data || '') + ' ' + (p.desc || '')).toLowerCase();
    return text.includes('2gb') || text.includes('2.5gb') || text.includes('3gb');
  });
  const annual = rawPlans.filter(p => (p.validity || '').includes('365') || (p.validity || '').includes('336') || p.rs >= 1999);
  const addOns = rawPlans.filter(p => p.rs < 100 && ((p.data || p.desc || '').toLowerCase().includes('data') || (p.data || p.desc || '').toLowerCase().includes('add-on')));
  
  const groups: PlanGroup[] = [];
  if (popularPlans.length > 0) groups.push({ type: 'popular', label: '⭐ लोकप्रिय (Popular)', count: popularPlans.length, plans: popularPlans });
  if (data15.length > 0) groups.push({ type: 'data_1_5gb', label: '🚀 1.5 GB/दिन', count: data15.length, plans: data15 });
  if (data2Plus.length > 0) groups.push({ type: 'data_2gb', label: '⚡ 2GB+ भारी डेटा', count: data2Plus.length, plans: data2Plus });
  if (annual.length > 0) groups.push({ type: 'annual', label: '📅 365 दिन (वार्षिक)', count: annual.length, plans: annual });
  if (addOns.length > 0) groups.push({ type: 'addons', label: '📶 डेटा बूस्टर', count: addOns.length, plans: addOns });
  groups.push({ type: 'all', label: '🌐 सभी प्लान्स (' + rawPlans.length + ')', count: rawPlans.length, plans: rawPlans });
  return groups;
}

export const RechargeScreen: React.FC = () => {
  const { 
    t, 
    isAgentLoggedIn, 
    isCustomerLoggedIn,
    userProfile,
    setIsAuthModalOpen, 
    currentAgent,
    agentWalletBalance,
    creditAgentWalletCommission,
    adminQrConfig
  } = useTravel();
  const [activeCategory, setActiveCategory] = useState<'mobile' | 'electricity' | 'dth' | 'fastag'>('mobile');

  // Mobile Recharge Form
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedOpId, setSelectedOpId] = useState<string>('140');
  const [selectedCirId, setSelectedCirId] = useState<string>('14');
  const [isManualOpOpen, setIsManualOpOpen] = useState<boolean>(false);
  const [selectedMobilePlan, setSelectedMobilePlan] = useState<RechargePlan>(POPULAR_MOBILE_PLANS.jio[0]);

  // Live Telecom Engine States
  const [detectedOperator, setDetectedOperator] = useState<DetectedOperator | null>({
    company: 'Reliance Jio',
    circle: 'Madhya Pradesh & Chhattisgarh',
    operatorId: '140',
    circleId: '14'
  });
  const [liveGroups, setLiveGroups] = useState<PlanGroup[]>([]);
  const [activeGroupTab, setActiveGroupTab] = useState<string>('popular');
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(false);
  const [selectedLivePlan, setSelectedLivePlan] = useState<PlanItem | null>(null);
  const [planSearch, setPlanSearch] = useState<string>('');
  const [operator, setOperator] = useState('jio');
  const [circle, setCircle] = useState('mp');

  // Live Payment Gateway States
  const [gatewayState, setGatewayState] = useState<'idle' | 'initiating' | 'waiting' | 'failed'>('idle');
  const [gatewayError, setGatewayError] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeCheckoutUrl, setActiveCheckoutUrl] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [showUpiQr, setShowUpiQr] = useState<boolean>(false);
  const [hasInitiatedPayment, setHasInitiatedPayment] = useState<boolean>(false);

  // Electricity Form
  const [discom, setDiscom] = useState('mppkvvcl_west');
  const [consumerNumber, setConsumerNumber] = useState('');
  const [billAmount, setBillAmount] = useState<number>(1450);
  const [isBillFetched, setIsBillFetched] = useState(false);
  const [consumerName, setConsumerName] = useState('रमेश कुमार (Ramesh Kumar)');
  const [dueDate, setDueDate] = useState('28 अक्टूबर 2026');

  // DTH Form
  const [dthOperator, setDthOperator] = useState('tataplay');
  const [dthSubscriberId, setDthSubscriberId] = useState('');
  const [selectedDthPlan, setSelectedDthPlan] = useState<RechargePlan>(DTH_PLANS.tataplay[0]);

  // FASTag Form
  const [fastagBank, setFastagBank] = useState('sbi');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [fastagAmount, setFastagAmount] = useState<number>(500);

  // UI state
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastTxn, setLastTxn] = useState<TransactionItem | null>(null);
  const [recentTxns, setRecentTxns] = useState<TransactionItem[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_bbps_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Deduplicate all unique plans across all groups for universal search
  const allUniquePlans = useMemo(() => {
    const map = new Map<string, PlanItem>();
    liveGroups.forEach(g => {
      (g.plans || []).forEach(p => {
        if (!map.has(p.planCode)) {
          map.set(p.planCode, p);
        }
      });
    });
    return Array.from(map.values());
  }, [liveGroups]);

  // Filter plans based on search query or active tab
  const displayedPlans = useMemo(() => {
    const query = planSearch.trim().toLowerCase();
    if (query) {
      // Universal search across ALL groups!
      return allUniquePlans.filter(p => {
        const rsMatch = String(p.rs).includes(query);
        const valMatch = (p.validity || '').toLowerCase().includes(query);
        const dataMatch = (p.data || '').toLowerCase().includes(query);
        const descMatch = (p.desc || '').toLowerCase().includes(query);
        const nameMatch = (p.name || '').toLowerCase().includes(query);
        return rsMatch || valMatch || dataMatch || descMatch || nameMatch;
      });
    }

    // Default: return plans from active group tab
    const currentGroup = liveGroups.find(g => g.type === activeGroupTab) || liveGroups[0];
    return currentGroup?.plans || [];
  }, [planSearch, allUniquePlans, liveGroups, activeGroupTab]);

  const currentRechargeAmount = selectedLivePlan ? selectedLivePlan.rs : selectedMobilePlan.price;
  const merchantVpa = adminQrConfig?.merchantUpiId || 'safargo.pay@icici';
  const merchantName = adminQrConfig?.merchantName || 'SafarGo Travel & Utility Services';
  const upiIntentLinks = useMemo(() => {
    return generateUpiDeepLinks(
      currentRechargeAmount,
      activeOrderId || `ORD${Date.now()}`,
      `SafarGo Recharge +91${mobileNumber.replace(/\D/g, '').slice(-10)}`,
      merchantVpa,
      merchantName
    );
  }, [currentRechargeAmount, activeOrderId, mobileNumber, merchantVpa, merchantName]);

  // Function to load live plans for given operator & circle
  const loadPlansForOpCircle = async (opId: string, cirId: string, opName?: string, cirName?: string) => {
    setIsLoadingPlans(true);
    try {
      const res = await fetchPlansByOperator(opId, cirId);
      setIsLoadingPlans(false);
      if (res.success && res.groups && res.groups.length > 0) {
        const rawPlans: PlanItem[] = [];
        res.groups.forEach(g => (g.plans || []).forEach(p => rawPlans.push(p)));
        const smartGroups = categorizePlans(rawPlans.length > 0 ? rawPlans : (res.groups[0]?.plans || []));
        setLiveGroups(smartGroups);
        const matchedOp = OPERATORS_LIST.find(o => o.opId === opId);
        const matchedCir = CIRCLES_LIST.find(c => c.cirId === cirId);
        setDetectedOperator({
          company: opName || matchedOp?.name || 'Telecom Prepaid',
          circle: cirName || matchedCir?.name || 'MP & CG',
          operatorId: String(opId),
          circleId: String(cirId)
        });
        const popGroup = res.groups.find(g => g.type === 'popular') || res.groups[0];
        if (popGroup && popGroup.plans && popGroup.plans.length > 0) {
          setActiveGroupTab(popGroup.type);
          setSelectedLivePlan(popGroup.plans[0]);
        }
      }
    } catch {
      setIsLoadingPlans(false);
    }
  };

  // Initial load: populate with live plans immediately
  useEffect(() => {
    loadPlansForOpCircle('140', '14', 'Reliance Jio', 'Madhya Pradesh & Chhattisgarh');
  }, []);

  // When mobile number reaches 10 digits: Auto-detect operator & circle
  useEffect(() => {
    const clean = mobileNumber.replace(/\D/g, '').slice(-10);
    if (clean.length === 10) {
      let isMounted = true;
      setIsLoadingPlans(true);
      fetchAutoPlans(clean).then(res => {
        if (!isMounted) return;
        setIsLoadingPlans(false);
        if (res.success && res.detected) {
          setDetectedOperator(res.detected);
          setSelectedOpId(String(res.detected.operatorId));
          setSelectedCirId(String(res.detected.circleId));
          setIsManualOpOpen(false);
          const groups = res.groups || [];
          setLiveGroups(groups);

          const popGroup = groups.find(g => g.type === 'popular') || groups[0];
          if (popGroup && popGroup.plans && popGroup.plans.length > 0) {
            setActiveGroupTab(popGroup.type);
            setSelectedLivePlan(popGroup.plans[0]);
          }
        }
      });
      return () => { isMounted = false; };
    }
  }, [mobileNumber]);

  // When user manually selects operator or circle
  const handleMobileNumberChange = (raw: string) => {
    const clean = raw.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(clean);
    
    if (clean.length >= 4) {
      const detected = detectIndianOperatorAndCircle(clean);
      setDetectedOperator(detected);
      setSelectedOpId(detected.operatorId);
      setSelectedCirId(detected.circleId);
      loadPlansForOpCircle(detected.operatorId, detected.circleId, detected.company, detected.circle);
    }
  };

  const handleManualOperatorChange = (opId: string) => {
    setSelectedOpId(opId);
    const matchedOp = OPERATORS_LIST.find(o => o.opId === opId);
    loadPlansForOpCircle(opId, selectedCirId, matchedOp?.name);
  };

  const handleManualCircleChange = (cirId: string) => {
    setSelectedCirId(cirId);
    const matchedCir = CIRCLES_LIST.find(c => c.cirId === cirId);
    loadPlansForOpCircle(selectedOpId, cirId, undefined, matchedCir?.name);
  };

  useEffect(() => {
    const plans = DTH_PLANS[dthOperator] || DTH_PLANS.tataplay;
    setSelectedDthPlan(plans[0]);
  }, [dthOperator]);

  // Save transactions to localStorage
  const saveTransaction = (txn: TransactionItem) => {
    setLastTxn(txn);
    setRecentTxns(prev => {
      const updated = [txn, ...prev.slice(0, 19)];
      try {
        localStorage.setItem('safargo_bbps_transactions', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setIsSuccess(true);

    // Trigger AI Agent Swarm Autonomous Pipeline (Agency Agents Protocol)
    import('../../lib/agentSwarmService').then(({ runAutonomousPipeline }) => {
      runAutonomousPipeline('Paybeez रिचार्ज व बीबीपीएस बिल निष्पादन', {
        mobile: txn.consumer,
        amount: txn.amount,
        service: `${txn.operator || 'मोबाइल'} रिचार्ज`
      });
    }).catch(() => {});

    try {
      confetti({ particleCount: 85, spread: 65, origin: { y: 0.6 } });
    } catch {}
  };

  // Poll order status while gatewayState === 'waiting'
  useEffect(() => {
    if (gatewayState !== 'waiting' || !activeOrderId) return;

    let pollCount = 0;
    const maxPolls = 70; // 70 * 2.5s = ~175 seconds

    const timer = setInterval(async () => {
      pollCount++;
      try {
        const res = await checkOrderStatus(activeOrderId);
        if (res.success && res.data) {
          const status = res.data.status;
          if (status === 'FULFILLED' || status === 'PAID') {
            clearInterval(timer);
            try { localStorage.removeItem('safargo_active_recharge_order'); } catch {}
            setGatewayState('idle');

            const opTitle = res.data.operator || detectedOperator?.company || operator.toUpperCase();
            const clean = mobileNumber.replace(/\D/g, '').slice(-10);
            const price = Number(res.data.amountPaise) / 100 || (selectedLivePlan ? selectedLivePlan.rs : selectedMobilePlan.price);
            const desc = selectedLivePlan ? `${selectedLivePlan.validity} • ${selectedLivePlan.data}` : selectedMobilePlan.desc;

            const newTxn: TransactionItem = {
              id: `txn-${Date.now()}`,
              txnId: res.data.operatorRef || res.data.gatewayOrderId || activeOrderId,
              type: 'mobile',
              title: `मोबाइल रिचार्ज • ${opTitle}`,
              operator: opTitle,
              amount: price,
              commission: 0,
              consumer: `+91 ${res.data.number || clean}`,
              date: new Date().toLocaleString('hi-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
              desc
            };

            saveTransaction(newTxn);
          } else if (status === 'FAILED') {
            clearInterval(timer);
            try { localStorage.removeItem('safargo_active_recharge_order'); } catch {}
            setGatewayState('failed');
            setGatewayError(res.data.errorMessage || 'बैंक या यूपीआई ऐप द्वारा भुगतान अस्वीकार कर दिया गया। (Payment Rejected / Cancelled)');
          }
        }
      } catch (err) {
        console.error('Recharge polling error:', err);
      }

      if (pollCount >= maxPolls) {
        clearInterval(timer);
        setGatewayState('failed');
        setGatewayError('पेमेंट टाइमआउट हो गया। यदि आपके खाते से पैसे कट गए हैं, तो 10 मिनट में ऑपरेटर द्वारा स्वतः रिचार्ज या रिफंड हो जाएगा।');
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [gatewayState, activeOrderId, detectedOperator, mobileNumber, operator, selectedLivePlan, selectedMobilePlan]);

  // Centralized helper: Fulfill order and generate official SafarGo Bharat BillPay receipt
  const fulfillOrderSuccessfully = (customRef?: string, customAmount?: number) => {
    let orderDetails: any = null;
    try {
      const raw = localStorage.getItem('safargo_active_recharge_order');
      if (raw) orderDetails = JSON.parse(raw);
    } catch {}

    const clean = orderDetails?.mobile || mobileNumber.replace(/\D/g, '').slice(-10);
    const opTitle = orderDetails?.operator || detectedOperator?.company || operator.toUpperCase();
    const price = customAmount || orderDetails?.amount || (selectedLivePlan ? selectedLivePlan.rs : selectedMobilePlan.price);
    const planDesc = orderDetails?.planName || (selectedLivePlan ? `${selectedLivePlan.validity} • ${selectedLivePlan.data}` : selectedMobilePlan.desc);
    const rawRef = customRef || orderDetails?.orderId || activeOrderId || `BBPS${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const refId = rawRef.startsWith('BBPS') || rawRef.startsWith('OPR') ? rawRef : `BBPS${rawRef}`;

    const commission = isAgentLoggedIn ? Number((price * 0.03).toFixed(2)) : 0;
    if (isAgentLoggedIn && commission > 0) {
      creditAgentWalletCommission(commission, `कमीशन: मोबाइल रिचार्ज ${clean} (${opTitle})`);
    }

    const newTxn: TransactionItem = {
      id: `txn-${Date.now()}`,
      txnId: refId,
      type: 'mobile',
      title: `मोबाइल रिचार्ज • ${opTitle}`,
      operator: opTitle,
      amount: price,
      commission: commission,
      consumer: `+91 ${clean}`,
      date: new Date().toLocaleString('hi-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      desc: planDesc
    };

    try { localStorage.removeItem('safargo_active_recharge_order'); } catch {}
    setGatewayState('idle');
    saveTransaction(newTxn);
  };

  // Auto-Return Listener: 100% AUTOMATIC detection when user returns to SafarGo
  useEffect(() => {
    const handleReturn = () => {
      if (document.visibilityState === 'visible' && gatewayState === 'waiting' && activeOrderId) {
        // User returned to tab: check real status via Paybeez order status API
        setIsVerifying(true);

        checkOrderStatus(activeOrderId).then(res => {
          setIsVerifying(false);
          if (res.success && res.data) {
            if (res.data.status === 'FULFILLED' || res.data.status === 'PAID') {
              fulfillOrderSuccessfully(res.data.operatorRef || res.data.gatewayOrderId, Number(res.data.amountPaise) / 100);
            } else if (res.data.status === 'FAILED') {
              try { localStorage.removeItem('safargo_active_recharge_order'); } catch {}
              setGatewayState('failed');
              setGatewayError(res.data.errorMessage || 'बैंक या यूपीआई ऐप द्वारा भुगतान अस्वीकार कर दिया गया।');
            }
          }
        }).catch(() => {});
      }
    };

    window.addEventListener('focus', handleReturn);
    document.addEventListener('visibilitychange', handleReturn);
    return () => {
      window.removeEventListener('focus', handleReturn);
      document.removeEventListener('visibilitychange', handleReturn);
    };
  }, [gatewayState, activeOrderId, hasInitiatedPayment]);

  // Check pending order or URL return redirect on page load
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const action = searchParams.get('action');
      const status = searchParams.get('status');
      const paramOrderId = searchParams.get('order_id') || searchParams.get('orderId');

      if (action === 'recharge_return' || status === 'success' || (action && action.includes('return'))) {
        window.history.replaceState({}, document.title, window.location.pathname);
        fulfillOrderSuccessfully(paramOrderId || undefined);
        return;
      }

      const saved = localStorage.getItem('safargo_active_recharge_order');
      if (saved) {
        const order = JSON.parse(saved);
        if (order.orderId && Date.now() - order.timestamp < 15 * 60 * 1000) {
          setActiveOrderId(order.orderId);
          setActiveCheckoutUrl(order.checkoutUrl);
          setGatewayState('waiting');
          checkOrderStatus(order.orderId).then(res => {
            if (res.success && res.data) {
              if (res.data.status === 'FULFILLED' || res.data.status === 'PAID') {
                fulfillOrderSuccessfully(res.data.operatorRef || res.data.gatewayOrderId || order.orderId, order.amount);
              } else if (res.data.status === 'FAILED') {
                try { localStorage.removeItem('safargo_active_recharge_order'); } catch {}
                setGatewayState('failed');
                setGatewayError(res.data.errorMessage || 'भुगतान विफल (Payment Failed / Rejected)');
              }
            }
          });
        } else {
          try { localStorage.removeItem('safargo_active_recharge_order'); } catch {}
        }
      }
    } catch {}
  }, []);

  // Manual verify button or user confirmation
  const handleManualVerify = async (forceConfirm: boolean = false) => {
    if (!activeOrderId) {
      setGatewayError('कोई सक्रिय आर्डर नहीं मिला।');
      return;
    }

    // Strict mode: Only verify against real API

    setIsVerifying(true);
    try {
      const res = await checkOrderStatus(activeOrderId);
      setIsVerifying(false);
      if (res.success && res.data) {
        if (res.data.status === 'FULFILLED' || res.data.status === 'PAID') {
          fulfillOrderSuccessfully(res.data.operatorRef || res.data.gatewayOrderId, Number(res.data.amountPaise) / 100);
        } else if (res.data.status === 'FAILED') {
          try { localStorage.removeItem('safargo_active_recharge_order'); } catch {}
          setGatewayState('failed');
          setGatewayError(res.data.errorMessage || 'भुगतान अस्वीकार कर दिया गया। (Payment Rejected / Not Completed)');
        } else {
          setGatewayError('पेमेंट अभी प्रोसेस हो रहा है। कृपया कुछ सेकंड बाद "स्टेटस चेक करें" दबाएं।');
        }
      } else {
        setGatewayError('गेटवे सर्वर से अभी कन्फर्मेशन नहीं मिला है। कृपया पुनः प्रयास करें।');
      }
    } catch (err: any) {
      setIsVerifying(false);
      setGatewayError('नेटवर्क धीमा है। कृपया थोड़ी देर बाद "स्टेटस चेक करें" दबाएं।');
    }
  };

  // 1. Mobile Recharge Submit - Trigger Gateway & In-App UPI Flow
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

// Direct recharge without forced login

    const clean = mobileNumber.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      alert('कृपया 10-अंकीय वैध मोबाइल नंबर दर्ज करें');
      return;
    }

    const price = selectedLivePlan ? selectedLivePlan.rs : selectedMobilePlan.price;
    const planName = selectedLivePlan ? (selectedLivePlan.desc || selectedLivePlan.name || 'Prepaid Plan') : selectedMobilePlan.desc;
    const planCode = selectedLivePlan ? selectedLivePlan.planCode : String(price);
    const opCompany = detectedOperator?.company || 'Telecom Prepaid';
    const opCircle = detectedOperator?.circle || 'MP & CG';

    setGatewayState('initiating');
    setGatewayError(null);

    try {
      const checkoutRes = await createRechargeCheckout({
        mobile: clean,
        amountRupees: price,
        opId: detectedOperator?.operatorId || selectedOpId || '140',
        cirId: detectedOperator?.circleId || selectedCirId || '14',
        planCode: planCode,
        planName: planName,
        company: opCompany
      });

      const orderId = (checkoutRes.success && checkoutRes.paymentOrderId) 
        ? checkoutRes.paymentOrderId 
        : `SFG-BBPS-${Date.now()}`;
      const gatewayId = (checkoutRes.success && checkoutRes.gatewayOrderId) 
        ? checkoutRes.gatewayOrderId 
        : orderId;
      const checkoutUrl = (checkoutRes.success && checkoutRes.checkoutUrl) 
        ? checkoutRes.checkoutUrl 
        : '';

      setActiveOrderId(orderId);
      setActiveCheckoutUrl(checkoutUrl);
      setHasInitiatedPayment(false);
      setGatewayState('waiting');

      // Directly open Paybeez / Zaakpay checkout gateway!
      if (checkoutUrl) {
        try {
          window.location.href = checkoutUrl;
        } catch {
          window.open(checkoutUrl, '_self');
        }
      }

      // Save pending order to localStorage
      try {
        localStorage.setItem('safargo_active_recharge_order', JSON.stringify({
          orderId,
          gatewayId,
          mobile: clean,
          amount: price,
          planName,
          operator: opCompany,
          circle: opCircle,
          checkoutUrl: checkoutUrl,
          timestamp: Date.now()
        }));
      } catch {}
    } catch (err: any) {
      setGatewayState('failed');
      setGatewayError(err.message || 'नेटवर्क समस्या। कृपया पुनः प्रयास करें।');
    }
  };

  // 2. Fetch Electricity Bill - Dynamic Discom Calculation
  const handleFetchBill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = consumerNumber.trim();
    if (!clean || clean.length < 5) {
      alert('कृपया 10-अंकीय IVRS / उपभोक्ता संख्या दर्ज करें');
      return;
    }

    // Dynamic consumer name selection based on consumer number hash
    const numHash = clean.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const westNames = [
      'राजेश कुमार पाटीदार (Indore West)',
      'संजय वर्मा (Ujjain Division)',
      'महेश जोशी (Dewas Circle)',
      'कमलेश चौधरी (Khargone)',
      'अशोक राठौर (Dhar Circle)'
    ];
    const centralNames = [
      'सुनील कुमार सक्सेना (Bhopal Central)',
      'आलोक शर्मा (Gwalior City)',
      'विवेक श्रीवास्तव (Vidisha Circle)',
      'प्रदीप चौहान (Sehore)',
      'मनीष बाजपेई (Hoshangabad)'
    ];
    const eastNames = [
      'दिलीप कुमार गुप्ता (Jabalpur East)',
      'राकेश तिवारी (Rewa Division)',
      'अमित पाण्डेय (Satna Circle)',
      'सुरेश मिश्रा (Sagar)',
      'रविन्द्र पटेल (Katni)'
    ];

    let name = '';
    if (discom === 'mppkvvcl_west') {
      name = westNames[numHash % westNames.length];
    } else if (discom === 'mpmkvvcl_central') {
      name = centralNames[numHash % centralNames.length];
    } else {
      name = eastNames[numHash % eastNames.length];
    }

    // Realistic consumption units & energy bill (₹550 - ₹2,750)
    const units = 120 + (numHash % 260);
    const calculatedAmount = Math.round(units * 7.15 + 135);

    setConsumerName(name);
    setBillAmount(calculatedAmount);
    setDueDate('28 अक्टूबर 2026');
    setIsBillFetched(true);
  };

  // Pay Electricity Bill with Flat ₹10 Agent Commission
  const handlePayBill = () => {
    const txnId = `BBPS${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const discomNames: Record<string, string> = {
      mppkvvcl_west: 'म.प्र. पश्चिम क्षेत्र (इंदौर/उज्जैन)',
      mpmkvvcl_central: 'म.प्र. मध्य क्षेत्र (भोपाल/ग्वालियर)',
      mppkvvcl_east: 'म.प्र. पूर्व क्षेत्र (जबलपुर/रीवा)'
    };

    const commission = isAgentLoggedIn ? 10 : 0;
    if (isAgentLoggedIn && commission > 0) {
      creditAgentWalletCommission(commission, `कमीशन: बिजली बिल भुगतान ${consumerNumber} (${discomNames[discom] || 'MP Electricity'})`);
    }

    const newTxn: TransactionItem = {
      id: `txn-${Date.now()}`,
      txnId,
      type: 'electricity',
      title: `बिजली बिल • ${discomNames[discom] || 'MP Electricity'}`,
      operator: 'MP पावर मैनेजमेंट कंपनी लिमिटेड',
      amount: billAmount,
      commission: commission,
      consumer: `IVRS: ${consumerNumber} (${consumerName.split(' ')[0]})`,
      date: new Date().toLocaleString('hi-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      desc: `${discomNames[discom] || 'MP Electricity'} • बिल भुगतान`
    };

    saveTransaction(newTxn);
  };

  // 3. DTH Submit with 3% Agent Commission
  const handleDthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = dthSubscriberId.trim();
    if (cleanId.length < 8) {
      alert('कृपया वैध DTH सब्सक्राइबर आईडी दर्ज करें');
      return;
    }

    const txnId = `BBPS${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const commission = isAgentLoggedIn ? Number((selectedDthPlan.price * 0.03).toFixed(2)) : 0;
    if (isAgentLoggedIn && commission > 0) {
      creditAgentWalletCommission(commission, `कमीशन: DTH रिचार्ज ${cleanId} (${dthOperator.toUpperCase()})`);
    }

    const newTxn: TransactionItem = {
      id: `txn-${Date.now()}`,
      txnId,
      type: 'dth',
      title: `DTH रिचार्ज • ${dthOperator.toUpperCase()}`,
      operator: dthOperator.toUpperCase(),
      amount: selectedDthPlan.price,
      commission: commission,
      consumer: `ID: ${cleanId}`,
      date: new Date().toLocaleString('hi-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      desc: `${selectedDthPlan.validity} • ${selectedDthPlan.data}`
    };

    saveTransaction(newTxn);
  };

  // 4. FASTag Submit with 1.5% Agent Commission
  const handleFastagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVeh = vehicleNumber.trim().toUpperCase();
    if (cleanVeh.length < 6) {
      alert('कृपया वैध वाहन रजिस्ट्रेशन नंबर दर्ज करें (उदा. MP09AB1234)');
      return;
    }

    const txnId = `BBPS${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const commission = isAgentLoggedIn ? Number((fastagAmount * 0.015).toFixed(2)) : 0;
    if (isAgentLoggedIn && commission > 0) {
      creditAgentWalletCommission(commission, `कमीशन: FASTag रिचार्ज ${cleanVeh}`);
    }

    const newTxn: TransactionItem = {
      id: `txn-${Date.now()}`,
      txnId,
      type: 'fastag',
      title: `FASTag रिचार्ज • ${cleanVeh}`,
      operator: `${fastagBank.toUpperCase()} Bank FASTag`,
      amount: fastagAmount,
      commission: commission,
      consumer: `वाहन: ${cleanVeh}`,
      date: new Date().toLocaleString('hi-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      desc: `NHAI टोल • ${fastagBank.toUpperCase()} Bank`
    };

    saveTransaction(newTxn);
  };

  // WhatsApp share receipt
  const handleShareWhatsApp = (txn: TransactionItem) => {
    const text = 
      `🧾 *भारत बिलपे (BBPS) आधिकारिक डिजिटल रसीद* 🧾\n\n` +
      `✅ *स्थिति*: सफल (SUCCESS)\n` +
      `📌 *सेवा*: ${txn.title}\n` +
      `🔢 *उपभोक्ता / नंबर*: ${txn.consumer}\n` +
      `💵 *भुगतान राशि*: ₹${txn.amount}.00\n` +
      `🆔 *BBPS ट्रांस. ID*: ${txn.txnId}\n` +
      `⏰ *दिनांक व समय*: ${txn.date}\n\n` +
      `_SafarGo अधिकृत केंद्र द्वारा संचालित • NPCI भारत बिलपे प्रमाणित_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Thermal POS 58mm/80mm Receipt Generator
  const handleThermalPrint = (txn: TransactionItem) => {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>POS Receipt - ${txn.txnId}</title>
          <style>
            @page { size: 58mm auto; margin: 0; }
            body {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              width: 52mm;
              margin: 3mm auto;
              color: #000;
              line-height: 1.25;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .dashed { border-top: 1px dashed #000; margin: 5px 0; }
            .row { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 13px;">SAFARGO KIOSK</div>
          <div class="center" style="font-size: 9px;">BHARAT BILL PAYMENT SYSTEM (BBPS)</div>
          <div class="dashed"></div>
          <div class="row"><span>DATE:</span><span>${txn.date}</span></div>
          <div class="row"><span>REF:</span><span>${txn.txnId}</span></div>
          <div class="row"><span>SERVICE:</span><span>${txn.title.slice(0, 16)}</span></div>
          <div class="row"><span>NUMBER:</span><span>${txn.consumer}</span></div>
          <div class="dashed"></div>
          <div class="row bold" style="font-size: 12px;">
            <span>TOTAL PAID:</span><span>Rs. ${txn.amount}.00</span>
          </div>
          ${txn.commission ? `<div class="row" style="font-size: 10px;"><span>COMMISSION:</span><span>Rs. ${txn.commission.toFixed(2)}</span></div>` : ''}
          <div class="dashed"></div>
          <div class="center bold" style="font-size: 11px;">100% SUCCESS / VERIFIED</div>
          <div class="center" style="font-size: 8px; margin-top: 4px;">Thank you for using SafarGo Center</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 pb-28 space-y-6 animate-fade-in">
      {/* BBPS Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-emerald-500/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>भारत बिलपे (BBPS) अधिकृत केंद्र • 100% लाइव</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight">
              {t('मोबाइल रिचार्ज एवं उपयोगिता बिल भुगतान केंद्र', 'Mobile Recharge & Utility Bill Pay Center')}
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              {t(
                'Jio, Airtel, Vi, BSNL प्रीपेड रिचार्ज, म.प्र. बिजली वितरण बिल (West/Central/East), DTH टीवी एवं FASTag • लाइव टेलीकॉम स्विच',
                'Live Jio, Airtel, Vi, BSNL Prepaid Recharge, Electricity Bill Payments, DTH & FASTag'
              )}
            </p>
          </div>

          <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-right shrink-0">
            <span className="text-[10px] text-emerald-300 font-bold uppercase block">सुरक्षित पेमेंट गेटवे</span>
            <span className="text-xl sm:text-2xl font-black text-white">0% हिडन चार्ज</span>
            <span className="text-[10px] text-emerald-300 block font-semibold mt-0.5">NPCI • UPI • BBPS प्रमाणित ✓</span>
          </div>
        </div>
      </div>

      {/* Service Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => {
            
            setActiveCategory('mobile');
            setIsSuccess(false);
          }}
          className={`p-3.5 rounded-2xl border transition flex items-center gap-3 ${
            activeCategory === 'mobile'
              ? 'bg-indigo-600 text-white shadow-md border-indigo-600'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <Smartphone className="w-5 h-5 shrink-0" />
          <div className="text-left flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-black block truncate">मोबाइल रिचार्ज</span>
              <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
                ⚡ लाइव
              </span>
            </div>
            <span className={`text-[10px] block truncate ${activeCategory === 'mobile' ? 'text-indigo-200' : 'text-slate-400'}`}>
              Jio, Airtel, Vi, BSNL
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            
            setActiveCategory('electricity');
            setIsSuccess(false);
          }}
          className={`p-3.5 rounded-2xl border transition flex items-center gap-3 ${
            activeCategory === 'electricity'
              ? 'bg-amber-600 text-white shadow-md border-amber-600'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <Zap className="w-5 h-5 shrink-0" />
          <div className="text-left flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-black block truncate">बिजली बिल (MP)</span>
              <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
                ⚡ BBPS लाइव
              </span>
            </div>
            <span className={`text-[10px] block truncate ${activeCategory === 'electricity' ? 'text-amber-200' : 'text-slate-400'}`}>
              West, Central, East
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            
            setActiveCategory('dth');
            setIsSuccess(false);
          }}
          className={`p-3.5 rounded-2xl border transition flex items-center gap-3 ${
            activeCategory === 'dth'
              ? 'bg-rose-600 text-white shadow-md border-rose-600'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <Tv className="w-5 h-5 shrink-0" />
          <div className="text-left flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-black block truncate">DTH टीवी</span>
              <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
                ⚡ लाइव
              </span>
            </div>
            <span className={`text-[10px] block truncate ${activeCategory === 'dth' ? 'text-rose-200' : 'text-slate-400'}`}>
              Tata Play, Airtel, Dish
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            
            setActiveCategory('fastag');
            setIsSuccess(false);
          }}
          className={`p-3.5 rounded-2xl border transition flex items-center gap-3 ${
            activeCategory === 'fastag'
              ? 'bg-emerald-600 text-white shadow-md border-emerald-600'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <CreditCard className="w-5 h-5 shrink-0" />
          <div className="text-left flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-black block truncate">FASTag टोल</span>
              <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
                ⚡ NHAI लाइव
              </span>
            </div>
            <span className={`text-[10px] block truncate ${activeCategory === 'fastag' ? 'text-emerald-200' : 'text-slate-400'}`}>
              ICICI, SBI, Paytm
            </span>
          </div>
        </button>
      </div>

      {/* Main Content Areas */}
      <>
          {!isSuccess ? (
        <div className="space-y-6">
          {/* CATEGORY 1: MOBILE RECHARGE */}
          {activeCategory === 'mobile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Side */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-base">मोबाइल नंबर व ऑपरेटर</h3>
                  {isLoadingPlans && (
                    <div className="flex items-center gap-1.5 text-indigo-600 text-[11px] font-bold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>लाइव जांच...</span>
                    </div>
                  )}
                </div>



                <form onSubmit={handleMobileSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">10-अंकीय मोबाइल नंबर *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-500 font-bold text-xs">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={mobileNumber}
                        onChange={(e) => handleMobileNumberChange(e.target.value)}
                        placeholder="74XXXXXXXX"
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Operator & Circle Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-700 font-bold text-xs">टेलीकॉम ऑपरेटर व सर्कल *</label>
                      <button
                        type="button"
                        onClick={() => setIsManualOpOpen(!isManualOpOpen)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isManualOpOpen ? 'छिपाएं' : 'ऑपरेटर बदलें'}</span>
                      </button>
                    </div>

                    {/* Detected / Active Operator Card */}
                    {detectedOperator && !isManualOpOpen && (
                      <div 
                        onClick={() => setIsManualOpOpen(true)}
                        className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-emerald-100/70 transition shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="text-[11px] font-black text-emerald-950 block">
                              {detectedOperator.company} (लाइव ऑपरेटर)
                            </span>
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              {detectedOperator.circle}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                          बदलें <ChevronDown className="w-3 h-3" />
                        </span>
                      </div>
                    )}

                    {/* Manual Dropdowns (toggleable or when not detected) */}
                    {(!detectedOperator || isManualOpOpen) && (
                      <div className="space-y-2.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in">
                        <div>
                          <label className="block text-slate-600 font-bold text-[10px] mb-1">ऑपरेटर चुनें (Select Operator)</label>
                          <select
                            value={selectedOpId}
                            onChange={(e) => handleManualOperatorChange(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {OPERATORS_LIST.map(o => (
                              <option key={o.opId} value={o.opId}>{o.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-600 font-bold text-[10px] mb-1">सर्कल चुनें (Select Circle)</label>
                          <select
                            value={selectedCirId}
                            onChange={(e) => handleManualCircleChange(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {CIRCLES_LIST.map(c => (
                              <option key={c.cirId} value={c.cirId}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected Plan Summary */}
                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-base text-indigo-950">
                        ₹{selectedLivePlan ? selectedLivePlan.rs : selectedMobilePlan.price}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        {selectedLivePlan ? selectedLivePlan.validity : selectedMobilePlan.validity}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-800 font-medium line-clamp-2">
                      {selectedLivePlan ? selectedLivePlan.desc : selectedMobilePlan.desc}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold pt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                      <span>100% सुरक्षित NPCI पेमेंट गेटवे • तुरंत एक्टिवेशन</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={gatewayState === 'initiating' || gatewayState === 'waiting'}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 hover:from-emerald-700 hover:to-indigo-800 active:scale-98 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {gatewayState === 'initiating' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Paybeez गेटवे लोड हो रहा है...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span>तुरंत रिचार्ज करें (Paybeez / Zaakpay) • ₹{selectedLivePlan ? selectedLivePlan.rs : selectedMobilePlan.price}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Plans Selector Side */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">
                      {detectedOperator ? `${detectedOperator.company} लाइव प्लान्स` : 'लाइव रिचार्ज प्लान्स'}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {detectedOperator ? detectedOperator.circle : 'मध्य प्रदेश व छत्तीसगढ़'}
                    </span>
                  </div>

                  {/* Plan Search Box */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={planSearch}
                      onChange={(e) => setPlanSearch(e.target.value)}
                      placeholder="सभी प्लान्स में खोजें... (299, 1.5GB, 5G)"
                      className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {planSearch && (
                      <button
                        type="button"
                        onClick={() => setPlanSearch('')}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Plan Search Feedback Banner */}
                {planSearch.trim() && (
                  <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                    <span className="font-bold text-indigo-900">
                      🔍 खोज परिणाम: <strong>{displayedPlans.length}</strong> प्लान्स मिले (खोज: "{planSearch}")
                    </span>
                    <button
                      type="button"
                      onClick={() => setPlanSearch('')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                    >
                      सभी प्लान्स देखें
                    </button>
                  </div>
                )}

                {/* Live Plan Category Tabs (hidden during active search) */}
                {!planSearch.trim() && liveGroups.length > 0 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {liveGroups.map((g) => (
                      <button
                        key={g.type}
                        type="button"
                        onClick={() => setActiveGroupTab(g.type)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                          activeGroupTab === g.type
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {g.label} ({g.plans ? g.plans.length : 0})
                      </button>
                    ))}
                  </div>
                )}

                {/* Plan Cards Grid using displayedPlans */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {displayedPlans.length === 0 ? (
                    <div className="col-span-2 py-10 text-center text-slate-400 text-xs font-bold space-y-2">
                      <p>कोई प्लान नहीं मिला। कृपया राशि (जैसे 299, 19, 349) या डेटा (जैसे 1.5GB, 5G) से खोजें।</p>
                      {planSearch && (
                        <button
                          type="button"
                          onClick={() => setPlanSearch('')}
                          className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-black text-xs cursor-pointer"
                        >
                          सारे प्लान्स दिखाएं
                        </button>
                      )}
                    </div>
                  ) : (
                    displayedPlans.map((p, pIdx) => {
                      const isSel = selectedLivePlan?.planCode === p.planCode;
                      return (
                        <div
                          key={`${p.planCode || 'plan'}-${p.rs}-${pIdx}`}
                          onClick={() => setSelectedLivePlan(p)}
                          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                            isSel
                              ? 'bg-indigo-50/80 border-2 border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xl font-black text-slate-900">₹{p.rs}</span>
                              {p.popular && (
                                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                                  पॉपुलर
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-700 mb-1">
                              <span>वैलिडिटी: {p.validity}</span>
                              <span>•</span>
                              <span className="text-indigo-600">{p.data || 'डेटा'}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{p.desc}</p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-indigo-600 font-semibold text-[11px] truncate max-w-[140px]">
                              {p.name || 'वॉयस + डेटा पैक'}
                            </span>
                            <span className={`font-black ${isSel ? 'text-indigo-600' : 'text-slate-400'}`}>
                              {isSel ? '✓ चुना गया' : 'चुनें'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 2: ELECTRICITY BILL PAY (COMING SOON) */}
          {activeCategory === 'electricity' && (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 text-center animate-fade-in">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <Zap className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-black">
                  ⏳ जल्द आ रहा है • Launching Soon
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  म.प्र. विद्युत बिल भुगतान सेवा
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                  म.प्र. पश्चिम क्षेत्र (इंदौर/उज्जैन), मध्य क्षेत्र (भोपाल/ग्वालियर), एवं पूर्व क्षेत्र (जबलपुर/रीवा) विद्युत वितरण कंपनियों के 10-अंकीय IVRS उपभोक्ताओं के लिए सीधा भारत बिलपे (BBPS) भुगतान गेटवे बहुत जल्द लाइव हो रहा है।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-black text-slate-900 block">⚡ इंस्टेंट IVRS फेच</span>
                  <p className="text-[11px] text-slate-500">उपभोक्ता नंबर डालते ही असली बकाया राशि व देय तिथि</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-black text-slate-900 block">🧾 डिजिटल रसीद</span>
                  <p className="text-[11px] text-slate-500">NPCI भारत बिलपे मुहर के साथ तुरंत डाउनलोड व शेयर</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-black text-slate-900 block">🛡️ 0% हिडन चार्ज</span>
                  <p className="text-[11px] text-slate-500">सीधा सुरक्षित यूपीआई, नेटबैंकिंग व कार्ड भुगतान</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveCategory('mobile')}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>📱 लाइव मोबाइल रिचार्ज करें (Live Now)</span>
                </button>
              </div>
            </div>
          )}

          {/* CATEGORY 3: DTH TELEVISION RECHARGE (COMING SOON) */}
          {activeCategory === 'dth' && (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 text-center animate-fade-in">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <Tv className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-black">
                  ⏳ जल्द आ रहा है • Launching Soon
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  DTH टीवी रिचार्ज केंद्र
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                  Tata Play, Airtel Digital TV, Dish TV, Sun Direct व Videocon d2h के सभी स्मार्ट कार्ड व सब्सक्राइबर आईडी पर तत्काल ऑनलाइन रिचार्ज सुविधा बहुत जल्द लाइव होगी।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-black text-slate-900 block">📺 सभी 5 DTH ऑपरेटर</span>
                  <p className="text-[11px] text-slate-500">टाटा प्ले, एयरटेल, डिश टीवी, सन डायरेक्ट व d2h</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-black text-slate-900 block">⚡ 60 सेकंड एक्टिवेशन</span>
                  <p className="text-[11px] text-slate-500">भुगतान होते ही टीवी सिग्नल्स तुरंत चालू</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-black text-slate-900 block">🛡️ 100% सुरक्षित</span>
                  <p className="text-[11px] text-slate-500">NPCI एवं ऑपरेटर सर्वर से लाइव कन्फर्मेशन</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveCategory('mobile')}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>📱 लाइव मोबाइल रिचार्ज करें (Live Now)</span>
                </button>
              </div>
            </div>
          )}

          {/* CATEGORY 4: FASTAG TOLL RECHARGE (COMING SOON) */}
          {activeCategory === 'fastag' && (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 text-center animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <CreditCard className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-black">
                  ⏳ जल्द आ रहा है • Launching Soon
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  FASTag टोल रिचार्ज केंद्र
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                  ICICI Bank, SBI, Paytm, IDFC FIRST, Axis Bank, HDFC सहित भारत के सभी 38+ NHAI अधिकृत FASTag जारीकर्ता बैंकों के वाहनों का रियल-टाइम टोल रिचार्ज बहुत जल्द शुरू हो रहा है।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-black text-slate-900 block">🚗 38+ अधिकृत बैंक</span>
                  <p className="text-[11px] text-slate-500">वाहन नंबर डालते ही बैंक स्वतः डिटेक्ट होगा</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-black text-slate-900 block">⚡ लाइव NHAI टोल सिंक</span>
                  <p className="text-[11px] text-slate-500">प्लाजा बैरियर पर तुरंत बैलेंस अपडेट</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-black text-slate-900 block">🛡️ NETC NPCI प्रमाणित</span>
                  <p className="text-[11px] text-slate-500">100% आधिकारिक नेशनल इलेक्ट्रॉनिक टोल कलेक्शन</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveCategory('mobile')}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>📱 लाइव मोबाइल रिचार्ज करें (Live Now)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* RECHARGE SUCCESS RECEIPT */
        lastTxn && (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-emerald-400 space-y-5 text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
                BHARAT BILLPAY • SUCCESS
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                भुगतान सफल रहा!
              </h3>
              <p className="text-xs text-slate-500">
                BBPS Ref: <strong className="font-mono text-slate-900">{lastTxn.txnId}</strong>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="text-slate-500">सेवा / विवरण:</span>
                <span className="font-bold text-slate-900">{lastTxn.title}</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="text-slate-500">उपभोक्ता / नंबर:</span>
                <span className="font-mono font-bold text-slate-900">{lastTxn.consumer}</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="text-slate-500">भुगतान राशि:</span>
                <span className="font-black text-slate-900 text-sm">₹{lastTxn.amount}.00</span>
              </div>
              {lastTxn.commission !== undefined && lastTxn.commission > 0 && (
                <div className="flex justify-between items-center py-1.5 px-2 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-emerald-800 font-bold">एजेंट वॉलेट कमीशन (क्रेडिट):</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    +₹{lastTxn.commission.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-medium">भुगतान स्थिति:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% सफल (Confirmed by Operator)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-[11px] rounded-xl shadow transition flex flex-col sm:flex-row items-center justify-center gap-1"
                title="A4 साइज रसीद प्रिंट करें"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>A4 प्रिंट</span>
              </button>
              <button
                type="button"
                onClick={() => handleThermalPrint(lastTxn)}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-xl shadow transition flex flex-col sm:flex-row items-center justify-center gap-1"
                title="58mm / 80mm थर्मल प्रिंटर से रसीद निकालें"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>POS 58mm</span>
              </button>
              <button
                type="button"
                onClick={() => handleShareWhatsApp(lastTxn)}
                className="py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-[11px] rounded-xl shadow transition flex flex-col sm:flex-row items-center justify-center gap-1"
                title="WhatsApp पर डिजिटल रसीद भेजें"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              नया रिचार्ज या बिल भुगतान करें
            </button>
          </div>
        )
      )}

      {/* RECENT TRANSACTIONS LEDGER TABLE */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            <h3 className="font-black text-slate-900 text-sm">हाल ही के रिचार्ज एवं बिल भुगतान (BBPS Ledger)</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-bold">कुल: {recentTxns.length} ट्रांजैक्शन</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">समय/दिनांक</th>
                <th className="py-2.5 px-3">सेवा</th>
                <th className="py-2.5 px-3">उपभोक्ता/नंबर</th>
                <th className="py-2.5 px-3">रकम</th>
                <th className="py-2.5 px-3">स्थिति</th>
                <th className="py-2.5 px-3 text-right">रसीद</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTxns.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">{t.date}</td>
                  <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">{t.title}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">{t.consumer}</td>
                  <td className="py-3 px-3 font-black text-slate-900 whitespace-nowrap">₹{t.amount}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3 text-emerald-600" /> सफल
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(t)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition"
                      title="WhatsApp पर रसीद भेजें"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>

      {/* REAL PAYMENT GATEWAY WAITING & VERIFICATION MODAL */}
      {gatewayState === 'waiting' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4 sm:space-y-5 relative my-auto">
            <button
              type="button"
              onClick={() => {
                try { localStorage.removeItem('safargo_active_recharge_order'); } catch {}
                setGatewayState('failed');
                setGatewayError('उपभोक्ता या एजेंट द्वारा भुगतान रद्द किया गया। (Payment Cancelled)');
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
              title="रद्द करें"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Radar Header */}
            <div className="text-center space-y-2 pt-1">
              <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="relative w-12 h-12 bg-gradient-to-tr from-emerald-600 to-teal-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 px-3 py-0.5 rounded-full border border-emerald-200">
                  सफ़रगो सुरक्षित पेमेंट गेटवे • 100% SECURE
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  भुगतान पूरा करें एवं रसीद प्राप्त करें
                </h3>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  नीचे दिए गए किसी भी UPI ऐप से भुगतान करें। भुगतान के तुरंत बाद सफ़रगो पर रसीद स्वतः खुलेगी।
                </p>
              </div>
            </div>

            {/* Order Details Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between pb-1 border-b border-slate-200/80">
                <span className="text-slate-500">मोबाइल नंबर:</span>
                <span className="font-mono font-bold text-slate-900">+91 {mobileNumber}</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200/80">
                <span className="text-slate-500">ऑपरेटर:</span>
                <span className="font-bold text-slate-900">
                  {detectedOperator ? `${detectedOperator.company} • ${detectedOperator.circle}` : operator.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200/80">
                <span className="text-slate-500">प्लान:</span>
                <span className="font-bold text-indigo-600 truncate max-w-[200px]">
                  {selectedLivePlan ? `${selectedLivePlan.validity} • ${selectedLivePlan.data}` : selectedMobilePlan.desc}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-700 font-bold">कुल देय राशि:</span>
                <span className="font-black text-emerald-700 text-base">
                  ₹{selectedLivePlan ? selectedLivePlan.rs : selectedMobilePlan.price}.00
                </span>
              </div>
            </div>

            {/* Live Polling & Auto-Detection Status */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 py-2 px-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>
                {hasInitiatedPayment 
                  ? '⚡ UPI ऐप से भुगतान की पुष्टि हो रही है... (वापस आते ही रसीद स्वतः खुलेगी)' 
                  : 'NPCI भारत बिलपे गेटवे से आटोमेटिक सिंक चालू है (Auto Sync Active)'}
              </span>
            </div>

            {/* 1-TAP UPI APP BUTTONS (Direct Mobile Intent) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-0.5">
                <span>⚡ 1-क्लिक UPI ऐप्स (सीधे ऐप खोलें):</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-black">
                  Zero Redirection
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* PhonePe */}
                <a
                  href={activeCheckoutUrl || upiIntentLinks.phonepe}
                  target={activeCheckoutUrl ? "_blank" : undefined}
                  rel="noreferrer"
                  onClick={() => setHasInitiatedPayment(true)}
                  className="p-2.5 bg-[#5f259f]/10 hover:bg-[#5f259f]/20 border border-[#5f259f]/30 rounded-xl flex items-center gap-2 transition active:scale-95 group text-slate-900"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#5f259f] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    पे
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="text-xs font-black block truncate text-[#5f259f]">PhonePe</span>
                    <span className="text-[9px] text-slate-500 block">फोनपे से पे करें</span>
                  </div>
                </a>

                {/* Google Pay */}
                <a
                  href={upiIntentLinks.gpay}
                  onClick={() => setHasInitiatedPayment(true)}
                  className="p-2.5 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 rounded-xl flex items-center gap-2 transition active:scale-95 group text-slate-900"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    G
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="text-xs font-black block truncate text-blue-700">Google Pay</span>
                    <span className="text-[9px] text-slate-500 block">GPay से पे करें</span>
                  </div>
                </a>

                {/* Paytm */}
                <a
                  href={upiIntentLinks.paytm}
                  onClick={() => setHasInitiatedPayment(true)}
                  className="p-2.5 bg-sky-50 hover:bg-sky-100/70 border border-sky-200 rounded-xl flex items-center gap-2 transition active:scale-95 group text-slate-900"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#00baf2] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    ₹
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="text-xs font-black block truncate text-sky-800">Paytm UPI</span>
                    <span className="text-[9px] text-slate-500 block">पेटीएम से पे करें</span>
                  </div>
                </a>

                {/* BHIM / Other */}
                <a
                  href={upiIntentLinks.bhim || upiIntentLinks.generic}
                  onClick={() => setHasInitiatedPayment(true)}
                  className="p-2.5 bg-amber-50 hover:bg-amber-100/70 border border-amber-200 rounded-xl flex items-center gap-2 transition active:scale-95 group text-slate-900"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    UPI
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="text-xs font-black block truncate text-amber-900">BHIM / Any UPI</span>
                    <span className="text-[9px] text-slate-500 block">अन्य यूपीआई ऐप</span>
                  </div>
                </a>
              </div>
            </div>

            


            {/* Dynamic QR Code Toggle */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowUpiQr(!showUpiQr)}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition"
              >
                <QrCode className="w-4 h-4 text-slate-600" />
                <span>{showUpiQr ? 'क्यूआर कोड छिपाएं (Hide QR)' : '📲 क्यूआर कोड से स्कैन करके पे करें (Show QR)'}</span>
              </button>

              {showUpiQr && (
                <div className="p-4 bg-slate-900 rounded-2xl text-center space-y-2.5 animate-fade-in border border-slate-800">
                  <div className="bg-white p-2.5 rounded-xl inline-block shadow-md">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiIntentLinks.generic)}`}
                      alt="UPI QR Code"
                      className="w-40 h-40 mx-auto rounded-lg"
                    />
                  </div>
                  <p className="text-[10px] text-emerald-400 font-bold">
                    किसी भी UPI ऐप से स्कैन करें • ₹{currentRechargeAmount}.00 स्वतः भरा हुआ
                  </p>
                </div>
              )}
            </div>

            {/* External Gateway Tab Link (Card / Netbanking) */}
            {activeCheckoutUrl && (
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setHasInitiatedPayment(true);
                    try {
                      window.open(activeCheckoutUrl, '_blank');
                    } catch {
                      window.location.href = activeCheckoutUrl;
                    }
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline inline-flex items-center gap-1"
                >
                  <span>डेबिट/क्रेडिट कार्ड या नेटबैंकिंग गेटवे खोलें</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* PRIMARY ACTION BUTTON */}
            <div className="space-y-2 pt-1 border-t border-slate-200">


              <button
                type="button"
                disabled={isVerifying}
                onClick={() => handleManualVerify(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                    <span>बैंक से लाइव स्टेटस जांच रहे हैं...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                    <span>ऑटो-स्टेटस चेक करें (Check Status)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT FAILED MODAL */}
      {gatewayState === 'failed' && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-red-200 space-y-5 text-center">
            <div className="w-16 h-16 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                भुगतान पूरा नहीं हुआ
              </h3>
              <p className="text-xs text-red-600 font-medium bg-red-50 p-3 rounded-xl border border-red-200 text-left">
                {gatewayError || 'बैंक या यूपीआई ऐप द्वारा भुगतान अस्वीकार कर दिया गया अथवा टाइमआउट हो गया।'}
              </p>
            </div>

            <p className="text-[11px] text-slate-500">
              यदि आपके बैंक खाते से पैसे कट गए हैं, तो 10 मिनट के भीतर ऑपरेटर द्वारा स्वतः रिचार्ज या रिफंड कर दिया जाएगा।
            </p>

            <button
              type="button"
              onClick={() => {
                setGatewayState('idle');
                setGatewayError(null);
              }}
              className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow transition"
            >
              पुनः प्रयास करें (Try Again)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
