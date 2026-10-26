import React, { useState, useMemo } from 'react';
import { useTravel } from '../../context/TravelContext';
import { BusItem, BusSeat, StopPoint } from '../../types/travel';
import { generateSeats } from '../../data/busData';
import { MP_LOCATIONS, ALL_INDIA_CITIES } from '../../data/mpCitiesData';
import { 
  Bus, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Navigation, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Users, 
  Armchair, 
  Bed, 
  BedDouble, 
  Phone, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Copy, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  DollarSign,
  Calendar,
  Layers,
  Power
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Popular Bus Operators across India & MP
export const POPULAR_OPERATORS = [
  { name: 'Hans Travels', contact: '+91 98260 12345', city: 'Indore', rating: 4.8 },
  { name: 'Verma Travels', contact: '+91 98261 54321', city: 'Bhopal', rating: 4.7 },
  { name: 'Intercity SmartBus', contact: '+91 80000 90000', city: 'Delhi', rating: 4.9 },
  { name: 'Kamla Travels', contact: '+91 94250 11223', city: 'Gwalior', rating: 4.6 },
  { name: 'Chartered Bus', contact: '+91 73124 55667', city: 'Indore', rating: 4.8 },
  { name: 'Royal Travels', contact: '+91 98270 99887', city: 'Jabalpur', rating: 4.5 },
  { name: 'Citylink Travels', contact: '+91 98930 44332', city: 'Ujjain', rating: 4.6 },
  { name: 'MP Tourism Superfast', contact: '+91 75527 78899', city: 'Bhopal', rating: 4.9 },
  { name: 'Shrinath Travel Agency', contact: '+91 94141 55667', city: 'Jaipur', rating: 4.7 },
  { name: 'SafarGo Prime Club', contact: '1800-SAFAR-GO', city: 'National Network', rating: 4.9 }
];

export const BUS_CATEGORIES = [
  'Volvo 9600 Multi-Axle AC Sleeper (2+1)',
  'BharatBenz AC Luxury Sleeper (2+1)',
  'Scania Multi-Axle AC Sleeper (2+1)',
  'Volvo AC Semi-Sleeper / Seater (2+2)',
  'Eicher AC Executive Seater (2+2)',
  'Ashok Leyland Non-AC Seater (2+2)',
  'Tata Non-AC Sleeper (2+1)',
  'Electric Luxury Green Bus (2+2)'
];

export const AdminBusManagement: React.FC = () => {
  const { buses, addBus, deleteBus, updateBus, t } = useTravel();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOperator, setFilterOperator] = useState('all');
  const [filterType, setFilterType] = useState('all'); // all | ac | sleeper | seater | primo
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating_desc' | 'time_asc'>('price_asc');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [selectedBusForLayout, setSelectedBusForLayout] = useState<BusItem | null>(null);
  const [editingBusId, setEditingBusId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Add / Edit Form State
  const [operatorName, setOperatorName] = useState('Hans Travels');
  const [operatorContact, setOperatorContact] = useState('+91 98260 12345');
  const [busNumber, setBusNumber] = useState('MP 09 FA 2026');
  const [busCategory, setBusCategory] = useState(BUS_CATEGORIES[0]);
  const [sourceCity, setSourceCity] = useState('Indore');
  const [destinationCity, setDestinationCity] = useState('Bhopal');
  const [departureTime, setDepartureTime] = useState('21:30');
  const [arrivalTime, setArrivalTime] = useState('06:00');
  const [duration, setDuration] = useState('8h 30m');

  // Distinct Kiraya (Seater vs Sleeper)
  const [seaterFare, setSeaterFare] = useState<number>(450);
  const [sleeperFare, setSleeperFare] = useState<number>(650);
  const [upperSleeperFare, setUpperSleeperFare] = useState<number>(750);
  const [originalFare, setOriginalFare] = useState<number>(850);

  // Seat Counts & Stops
  const [seaterCount, setSeaterCount] = useState<number>(12);
  const [sleeperCount, setSleeperCount] = useState<number>(18);
  const [rating, setRating] = useState<number>(4.8);
  const [isPrimo, setIsPrimo] = useState(true);
  const [hasLiveTracking, setHasLiveTracking] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Stops
  const [boardingStand, setBoardingStand] = useState('ISBT Terminal Stand');
  const [boardingLandmark, setBoardingLandmark] = useState('Near Gate No. 2');
  const [droppingStand, setDroppingStand] = useState('Main Bus Terminal');
  const [droppingLandmark, setDroppingLandmark] = useState('City Bypass Stand');
  const [intermediateHalts, setIntermediateHalts] = useState('Dewas Bypass, Ashta, Sehore');
  const [cancellationPolicy, setCancellationPolicy] = useState('प्रस्थान से 4 घंटे पहले तक 100% रिफंड');

  // Amenities Checklist
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'AC',
    'Charging Point',
    'Blanket & Pillow',
    'Water Bottle',
    'Reading Light',
    'Emergency SOS'
  ]);

  const allAmenitiesOptions = [
    'AC',
    'Charging Point',
    'Blanket & Pillow',
    'Water Bottle',
    'Reading Light',
    'Live GPS Tracking',
    'Emergency SOS',
    'Wi-Fi',
    'CCTV Surveillance',
    'Fire Extinguisher',
    'Snack Pack',
    'Deep Cleaned Berth'
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Open Form for Adding New Bus
  const handleOpenAdd = () => {
    setEditingBusId(null);
    setOperatorName('Hans Travels');
    setOperatorContact('+91 98260 12345');
    setBusNumber(`MP 09 FA ${Math.floor(1000 + Math.random() * 9000)}`);
    setBusCategory(BUS_CATEGORIES[0]);
    setSourceCity('Indore');
    setDestinationCity('Bhopal');
    setDepartureTime('21:30');
    setArrivalTime('06:00');
    setDuration('8h 30m');
    setSeaterFare(450);
    setSleeperFare(650);
    setUpperSleeperFare(750);
    setOriginalFare(850);
    setSeaterCount(12);
    setSleeperCount(18);
    setRating(4.8);
    setIsPrimo(true);
    setHasLiveTracking(true);
    setIsActive(true);
    setBoardingStand('AICTSL City Bus Stand');
    setBoardingLandmark('Near Platform 3');
    setDroppingStand('Habibganj ISBT Terminal');
    setDroppingLandmark('Platform 1 Bypass');
    setIntermediateHalts('Dewas Bypass, Ashta Stand, Sehore Crescent');
    setCancellationPolicy('प्रस्थान से 4 घंटे पहले तक 100% रिफंड');
    setIsFormModalOpen(true);
  };

  // Open Form for Editing Existing Bus
  const handleOpenEdit = (bus: BusItem) => {
    setEditingBusId(bus.id);
    setOperatorName(bus.operatorName);
    setOperatorContact(bus.operatorContact || '+91 98260 12345');
    setBusNumber(bus.busNumber || `MP 09 FA ${bus.id.slice(-4).toUpperCase()}`);
    setBusCategory(bus.busType);
    setSourceCity(bus.sourceCity);
    setDestinationCity(bus.destinationCity);
    setDepartureTime(bus.departureTime);
    setArrivalTime(bus.arrivalTime);
    setDuration(bus.duration);
    setSeaterFare(bus.seaterFare || bus.fare);
    setSleeperFare(bus.sleeperFare || (bus.fare + 150));
    setUpperSleeperFare(bus.upperSleeperFare || (bus.fare + 200));
    setOriginalFare(bus.originalFare || (bus.fare + 250));
    setRating(bus.rating);
    setIsPrimo(bus.isPrimo);
    setHasLiveTracking(bus.hasLiveTracking);
    setIsActive(bus.isActive !== false);
    setBoardingStand(bus.boardingPoints[0]?.name || 'City Boarding Stand');
    setBoardingLandmark(bus.boardingPoints[0]?.landmark || 'Main Platform');
    setDroppingStand(bus.droppingPoints[0]?.name || 'City Terminal Stand');
    setDroppingLandmark(bus.droppingPoints[0]?.landmark || 'Main Exit');
    setIntermediateHalts('Dewas, Ashta, Sehore');
    setCancellationPolicy(bus.cancellationPolicy || 'प्रस्थान से 4 घंटे पहले तक 100% रिफंड');
    setSelectedAmenities(bus.amenities || ['AC', 'Charging Point', 'Blanket & Pillow']);
    setIsFormModalOpen(true);
  };

  // Save Bus (Add or Update)
  const handleSaveBus = (e: React.FormEvent) => {
    e.preventDefault();

    const minFare = Math.min(seaterFare, sleeperFare);
    const maxFare = Math.max(seaterFare, sleeperFare, upperSleeperFare);
    const totalCapacity = seaterCount + sleeperCount;

    // Generate real seats with individual seater vs sleeper pricing
    const generatedSeats = generateSeats(seaterFare, seaterFare, sleeperFare, upperSleeperFare);

    const bp: StopPoint[] = [
      {
        id: `bp-${Date.now()}-1`,
        name: boardingStand.trim(),
        time: departureTime,
        address: `${boardingStand}, ${sourceCity}`,
        landmark: boardingLandmark.trim()
      }
    ];

    const dp: StopPoint[] = [
      {
        id: `dp-${Date.now()}-1`,
        name: droppingStand.trim(),
        time: arrivalTime,
        address: `${droppingStand}, ${destinationCity}`,
        landmark: droppingLandmark.trim()
      }
    ];

    if (editingBusId) {
      updateBus(editingBusId, {
        operatorName: operatorName.trim(),
        operatorContact: operatorContact.trim(),
        busNumber: busNumber.trim(),
        busType: busCategory,
        sourceCity: sourceCity.trim(),
        destinationCity: destinationCity.trim(),
        departureTime,
        arrivalTime,
        duration,
        fare: minFare,
        seaterFare,
        sleeperFare,
        upperSleeperFare,
        originalFare: originalFare || (maxFare + 150),
        discountPercent: Math.round(((originalFare - minFare) / originalFare) * 100) || 15,
        rating,
        isPrimo,
        hasLiveTracking,
        isActive,
        availableSeats: totalCapacity - 4,
        amenities: selectedAmenities,
        boardingPoints: bp,
        droppingPoints: dp,
        seats: generatedSeats,
        cancellationPolicy
      });
      showToast(`✅ बस "${operatorName}" सफलतापूर्वक अपडेट हो गई!`);
    } else {
      addBus({
        operatorName: operatorName.trim(),
        operatorContact: operatorContact.trim(),
        busNumber: busNumber.trim(),
        busType: busCategory,
        sourceCity: sourceCity.trim(),
        destinationCity: destinationCity.trim(),
        departureTime,
        arrivalTime,
        duration,
        fare: minFare,
        seaterFare,
        sleeperFare,
        upperSleeperFare,
        originalFare: originalFare || (maxFare + 150),
        discountPercent: Math.round(((originalFare - minFare) / originalFare) * 100) || 15,
        rating,
        reviewCount: Math.floor(80 + Math.random() * 400),
        isPrimo,
        hasLiveTracking,
        isActive,
        availableSeats: totalCapacity - 4,
        amenities: selectedAmenities,
        boardingPoints: bp,
        droppingPoints: dp,
        seats: generatedSeats,
        cancellationPolicy
      });
      showToast(`🎉 नई बस "${operatorName}" (${sourceCity} → ${destinationCity}) बेड़े में जुड़ गई!`);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }

    setIsFormModalOpen(false);
  };

  // Toggle Active / Inactive
  const handleToggleStatus = (bus: BusItem) => {
    const newStatus = !(bus.isActive !== false);
    updateBus(bus.id, { isActive: newStatus });
    showToast(newStatus ? `🟢 बस "${bus.operatorName}" सक्रिय (Active) हो गई!` : `⚪ बस "${bus.operatorName}" बंद (Inactive) कर दी गई।`);
  };

  // Delete Bus Confirmation
  const handleDelete = (bus: BusItem) => {
    if (window.confirm(`क्या आप बस "${bus.operatorName}" (${bus.sourceCity} → ${bus.destinationCity}) को स्थायी रूप से हटाना चाहते हैं?`)) {
      deleteBus(bus.id);
      showToast(`🗑️ बस "${bus.operatorName}" बेड़े से हटा दी गई!`);
    }
  };

  // Duplicate / Clone Bus
  const handleDuplicate = (bus: BusItem) => {
    addBus({
      ...bus,
      id: undefined as any,
      operatorName: `${bus.operatorName} (Copy)`,
      busNumber: `MP 09 FA ${Math.floor(1000 + Math.random() * 9000)}`,
      availableSeats: bus.seats.length - 2
    });
    showToast(`📋 बस "${bus.operatorName}" का क्लोन तैयार हो गया!`);
  };

  // Filtered & Sorted Buses
  const filteredBuses = useMemo(() => {
    return buses.filter(bus => {
      // 1. Text Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          bus.operatorName.toLowerCase().includes(q) ||
          bus.sourceCity.toLowerCase().includes(q) ||
          bus.destinationCity.toLowerCase().includes(q) ||
          bus.busType.toLowerCase().includes(q) ||
          (bus.busNumber && bus.busNumber.toLowerCase().includes(q)) ||
          bus.boardingPoints.some(bp => bp.name.toLowerCase().includes(q)) ||
          bus.droppingPoints.some(dp => dp.name.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // 2. Operator Filter
      if (filterOperator !== 'all' && bus.operatorName.toLowerCase() !== filterOperator.toLowerCase()) {
        return false;
      }

      // 3. Category / Type Filter
      if (filterType === 'ac' && !bus.busType.toLowerCase().includes('ac')) return false;
      if (filterType === 'sleeper' && !bus.busType.toLowerCase().includes('sleeper')) return false;
      if (filterType === 'seater' && !bus.busType.toLowerCase().includes('seater')) return false;
      if (filterType === 'primo' && !bus.isPrimo) return false;

      // 4. Status Filter
      if (filterStatus === 'active' && bus.isActive === false) return false;
      if (filterStatus === 'inactive' && bus.isActive !== false) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.fare - b.fare;
      if (sortBy === 'price_desc') return b.fare - a.fare;
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      if (sortBy === 'time_asc') return a.departureTime.localeCompare(b.departureTime);
      return 0;
    });
  }, [buses, searchQuery, filterOperator, filterType, filterStatus, sortBy]);

  // Aggregate Stats
  const totalFleetCount = buses.length;
  const activeFleetCount = buses.filter(b => b.isActive !== false).length;
  const totalOperatorsCount = new Set(buses.map(b => b.operatorName)).size;
  const totalSeatsCount = buses.reduce((acc, b) => acc + (b.seats?.length || 30), 0);
  const primoBusesCount = buses.filter(b => b.isPrimo).length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & KPI Stat Cards */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Bus className="w-3.5 h-3.5 text-yellow-400" />
              <span>SafarGo Bus Fleet Management ERP</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t('आधिकारिक बस बेड़ा एवं ऑपरेटर प्रबंधन', 'Bus Fleet & Operator Console')}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              {t(
                'ऑपरेटर्स, सीटर व स्लीपर किराया, समय सारिणी, बस लेआउट और लाइव ट्रैकिंग को एक ही जगह से नियंत्रित करें।',
                'Manage bus operators, seater vs sleeper fares, schedules, seat layout blueprints and live GPS tracking.'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 active:scale-95 transition-all self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('➕ नई बस जोड़ें (Add Bus)', 'Add New Bus')}</span>
          </button>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">कुल बसें (Fleet)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{totalFleetCount}</span>
              <span className="text-[11px] font-bold text-emerald-400">{activeFleetCount} सक्रिय</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">रजिस्टर्ड ऑपरेटर्स</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">{totalOperatorsCount}</span>
              <span className="text-[11px] font-bold text-slate-300">ट्रांसपोर्टर्स</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">नेटवर्क सीटें</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-400">{totalSeatsCount}</span>
              <span className="text-[11px] font-bold text-slate-300">सीटर + स्लीपर</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Primo सर्टिफाइड</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-rose-400">{primoBusesCount}</span>
              <span className="text-[11px] font-bold text-slate-300">लग्जरी बसें</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Search & Multi-Filter Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Main Keyword Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('ऑपरेटर, शहर (उदा. इंदौर, भोपाल, दिल्ली, जयपुर), बस नंबर या स्टॉप से खोजें...', 'Search by operator, city (Indore, Bhopal, Delhi, Jaipur), bus number or stop...')}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Operator Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={filterOperator}
              onChange={(e) => setFilterOperator(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">🏢 सभी ऑपरेटर्स (All Operators)</option>
              {Array.from(new Set(buses.map(b => b.operatorName))).map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="price_asc">₹ किराया: कम से ज्यादा</option>
              <option value="price_desc">₹ किराया: ज्यादा से कम</option>
              <option value="rating_desc">★ रेटिंग: उच्चतम पहले</option>
              <option value="time_asc">⏰ समय: पहले प्रस्थान</option>
            </select>
          </div>
        </div>

        {/* Filter Pills (Category & Status) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> बस प्रकार:
            </span>
            {[
              { id: 'all', label: 'सभी बसें' },
              { id: 'sleeper', label: '🛌 स्लीपर' },
              { id: 'seater', label: '💺 सीटर' },
              { id: 'ac', label: '❄️ AC बसें' },
              { id: 'primo', label: '★ Primo' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  filterType === f.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1">स्टेटस:</span>
            {[
              { id: 'all', label: 'सभी' },
              { id: 'active', label: '🟢 चालू' },
              { id: 'inactive', label: '⚪ बंद' }
            ].map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setFilterStatus(s.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  filterStatus === s.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bus Fleet Table / Card List */}
      <div className="space-y-4">
        {filteredBuses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Bus className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">कोई बस नहीं मिली</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              आपके चुने गए फ़िल्टर या खोज शब्द के अनुसार कोई बस उपलब्ध नहीं है। कृपया फ़िल्टर रीसेट करें।
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterOperator('all');
                setFilterType('all');
                setFilterStatus('all');
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
            >
              सभी फ़िल्टर साफ़ करें
            </button>
          </div>
        ) : (
          filteredBuses.map((bus) => {
            const isBusActive = bus.isActive !== false;
            const currentSeaterFare = bus.seaterFare || bus.fare;
            const currentSleeperFare = bus.sleeperFare || (bus.fare + 150);
            const currentUpperFare = bus.upperSleeperFare || (bus.fare + 200);

            return (
              <div
                key={bus.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border transition-all space-y-4 ${
                  !isBusActive
                    ? 'border-slate-200 bg-slate-50/70 opacity-75'
                    : 'border-slate-200 hover:border-indigo-400 hover:shadow-md'
                }`}
              >
                {/* Header: Operator Name, Bus Number, Tags & Fares */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0 shadow-inner">
                      {bus.operatorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-900 text-base">{bus.operatorName}</h3>
                        {bus.isPrimo && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            ★ PRIMO
                          </span>
                        )}
                        {bus.hasLiveTracking && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Navigation className="w-2.5 h-2.5" /> Live GPS
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isBusActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}>
                          {isBusActive ? '🟢 बुकिंग चालू' : '⚪ बंद'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                        <span className="font-semibold text-slate-800">{bus.busType}</span>
                        {bus.busNumber && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100 text-[11px] font-bold">
                              {bus.busNumber}
                            </span>
                          </>
                        )}
                        {bus.operatorContact && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-600">
                              <Phone className="w-3 h-3" /> {bus.operatorContact}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DISTINCT SEATER & SLEEPER PRICING BADGES */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-right">
                      <span className="text-[9px] uppercase font-bold text-amber-800 block tracking-wider flex items-center gap-1 justify-end">
                        <Armchair className="w-3 h-3 text-amber-600" /> सीटर किराया
                      </span>
                      <span className="text-base font-black text-amber-900 leading-tight">₹{currentSeaterFare}</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-right">
                      <span className="text-[9px] uppercase font-bold text-emerald-800 block tracking-wider flex items-center gap-1 justify-end">
                        <Bed className="w-3 h-3 text-emerald-600" /> स्लीपर किराया
                      </span>
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-base font-black text-emerald-900 leading-tight">₹{currentSleeperFare}</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">(Up: ₹{currentUpperFare})</span>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-100 rounded-2xl border border-slate-200 text-center font-bold text-xs">
                      <span className="text-amber-500">★</span> {bus.rating}
                    </div>
                  </div>
                </div>

                {/* Route, Timings & Stand Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">प्रस्थान (Departure)</span>
                    <p className="text-lg font-black text-slate-900">{bus.departureTime}</p>
                    <p className="font-extrabold text-slate-800 text-sm mt-0.5">{bus.sourceCity}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{bus.boardingPoints[0]?.name}</p>
                  </div>

                  <div className="text-center flex flex-col items-center justify-center my-auto">
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">{bus.duration}</span>
                    <div className="w-full h-0.5 bg-slate-300 relative my-1.5 max-w-[140px]">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 absolute -top-[4px] left-1/2 -translate-x-1/2 border-2 border-white shadow-xs" />
                    </div>
                    <span className="text-[11px] font-bold text-indigo-700">
                      {bus.availableSeats || 24} सीटें उपलब्ध
                    </span>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">पहुंचना (Arrival)</span>
                    <p className="text-lg font-black text-slate-900">{bus.arrivalTime}</p>
                    <p className="font-extrabold text-slate-800 text-sm mt-0.5">{bus.destinationCity}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{bus.droppingPoints[0]?.name}</p>
                  </div>
                </div>

                {/* Amenities & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {bus.amenities?.slice(0, 5).map((a, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md border border-slate-200">
                        {a}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Layout */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBusForLayout(bus);
                        setIsLayoutModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>लेआउट</span>
                    </button>

                    {/* Clone Bus */}
                    <button
                      type="button"
                      onClick={() => handleDuplicate(bus)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1"
                      title="इस बस का डुप्लीकेट बनाएं"
                    >
                      <Copy className="w-3.5 h-3.5 text-amber-600" />
                      <span>क्लोन</span>
                    </button>

                    {/* Toggle Active / Inactive */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(bus)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
                        isBusActive
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isBusActive ? 'रोकें (Pause)' : 'चालू करें'}</span>
                    </button>

                    {/* Edit Bus */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(bus)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>एडिट</span>
                    </button>

                    {/* Delete Bus */}
                    <button
                      type="button"
                      onClick={() => handleDelete(bus)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 font-bold text-xs rounded-xl transition flex items-center gap-1 border border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>हटाएं</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT BUS FULL-FEATURED MODAL (ABHIBUS ERP INSPIRED)                  */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingBusId ? '✏️ बस विवरण व किराया संपादित करें' : '➕ नई बस बेड़े में शामिल करें'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    ऑपरेटर, सीटर/स्लीपर किराया, समय और स्टॉप्स कॉन्फ़िगर करें
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBus} className="space-y-6 text-xs">
              {/* SECTION 1: OPERATOR & VEHICLE INFO */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-indigo-700">
                  <span>1. बस ऑपरेटर एवं वाहन विवरण (Operator & Bus Model)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ऑपरेटर नाम *</label>
                    <input
                      type="text"
                      required
                      list="operators-list"
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      placeholder="उदा. Hans Travels, Verma Travels..."
                      className="w-full font-bold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <datalist id="operators-list">
                      {POPULAR_OPERATORS.map(op => (
                        <option key={op.name} value={op.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">हेल्पलाइन / क्रू संपर्क फोन</label>
                    <input
                      type="text"
                      value={operatorContact}
                      onChange={(e) => setOperatorContact(e.target.value)}
                      placeholder="+91 98260 12345"
                      className="w-full font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">वाहन नंबर (Registration)</label>
                    <input
                      type="text"
                      value={busNumber}
                      onChange={(e) => setBusNumber(e.target.value)}
                      placeholder="MP 09 FA 2026"
                      className="w-full font-mono font-bold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">बस श्रेणी / मॉडल (Bus Category) *</label>
                  <select
                    value={busCategory}
                    onChange={(e) => setBusCategory(e.target.value)}
                    className="w-full font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {BUS_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION 2: DISTINCT KIRAYA (SEATER VS SLEEPER FARE CONFIG) */}
              <div className="space-y-3 p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-indigo-950 text-sm flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                    <span>2. किराया प्रबंधन (Seater vs Sleeper Kiraya Setup)</span>
                  </h4>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                    AbhiBus Multi-Fare Logic
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-indigo-200">
                    <label className="block font-black text-slate-800 mb-1 flex items-center gap-1">
                      <Armchair className="w-3.5 h-3.5 text-amber-600" />
                      <span>सीटर किराया (₹) *</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={seaterFare}
                      onChange={(e) => setSeaterFare(Number(e.target.value))}
                      className="w-full font-black text-base text-slate-900 px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-[9px] text-slate-400 mt-0.5 block">लोअर डेक सामान्य सीट</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-indigo-200">
                    <label className="block font-black text-slate-800 mb-1 flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-emerald-600" />
                      <span>स्लीपर किराया (₹) *</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={sleeperFare}
                      onChange={(e) => setSleeperFare(Number(e.target.value))}
                      className="w-full font-black text-base text-slate-900 px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-[9px] text-slate-400 mt-0.5 block">लोअर डेक स्लीपर बर्थ</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-indigo-200">
                    <label className="block font-black text-slate-800 mb-1 flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5 text-indigo-600" />
                      <span>अपर स्लीपर (₹) *</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={upperSleeperFare}
                      onChange={(e) => setUpperSleeperFare(Number(e.target.value))}
                      className="w-full font-black text-base text-slate-900 px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-[9px] text-slate-400 mt-0.5 block">अपर डेक लग्जरी स्लीपर</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-indigo-200">
                    <label className="block font-bold text-slate-600 mb-1 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      <span>एमआरपी (₹)</span>
                    </label>
                    <input
                      type="number"
                      min={100}
                      value={originalFare}
                      onChange={(e) => setOriginalFare(Number(e.target.value))}
                      className="w-full font-bold text-base text-slate-500 px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                    <span className="text-[9px] text-slate-400 mt-0.5 block">डिस्काउंट दिखाने के लिए</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: ROUTE & TIMINGS */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-indigo-700">
                  <span>3. रूट, समय सारिणी व स्टॉप्स (Route & Schedule)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">प्रस्थान शहर (From City) *</label>
                    <input
                      type="text"
                      required
                      value={sourceCity}
                      onChange={(e) => setSourceCity(e.target.value)}
                      placeholder="उदा. Indore, Delhi, Bhopal"
                      className="w-full font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">गंतव्य शहर (To City) *</label>
                    <input
                      type="text"
                      required
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      placeholder="उदा. Bhopal, Jaipur, Mumbai"
                      className="w-full font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">प्रस्थान समय (Dep Time) *</label>
                    <input
                      type="text"
                      required
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      placeholder="21:30"
                      className="w-full font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">पहुंचने का समय (Arr Time) *</label>
                    <input
                      type="text"
                      required
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      placeholder="06:00"
                      className="w-full font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">अवधि (Duration) *</label>
                    <input
                      type="text"
                      required
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="8h 30m"
                      className="w-full font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">बोर्डिंग स्टॉप व लैंडमार्क</label>
                    <input
                      type="text"
                      value={boardingStand}
                      onChange={(e) => setBoardingStand(e.target.value)}
                      placeholder="उदा. AICTSL City Bus Stand, Platform 3"
                      className="w-full font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ड्रॉपिंग स्टॉप व लैंडमार्क</label>
                    <input
                      type="text"
                      value={droppingStand}
                      onChange={(e) => setDroppingStand(e.target.value)}
                      placeholder="उदा. Habibganj ISBT Terminal Stand"
                      className="w-full font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: AMENITIES & FEATURES */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-indigo-700">
                  <span>4. सुविधाएं व विशेष सुविधाएं (Amenities)</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {allAmenitiesOptions.map(amenity => {
                    const isChecked = selectedAmenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                          } else {
                            setSelectedAmenities([...selectedAmenities, amenity]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition flex items-center gap-2 ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 text-indigo-600 rounded"
                        />
                        <span className="truncate">{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 5: TOGGLES (PRIMO, GPS, STATUS) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isPrimo}
                    onChange={(e) => setIsPrimo(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>★ Primo क्लास बस</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={hasLiveTracking}
                    onChange={(e) => setHasLiveTracking(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>🛰️ लाइव GPS ट्रैकिंग चालू</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>🟢 सक्रिय (बुकिंग ओपन)</span>
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition active:scale-95"
                >
                  {editingBusId ? 'बदलाव सुरक्षित करें' : '➕ बस बेड़े में जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEAT LAYOUT & BLUEPRINT INSPECTOR MODAL                                   */}
      {/* ========================================================================= */}
      {isLayoutModalOpen && selectedBusForLayout && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>{selectedBusForLayout.operatorName} • सीट लेआउट ब्लूप्रिंट</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedBusForLayout.sourceCity} → {selectedBusForLayout.destinationCity} ({selectedBusForLayout.busType})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsLayoutModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Legend */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-bold text-center">
              <div className="bg-amber-100/70 p-2 rounded-xl text-amber-900">
                <span className="text-[10px] block text-amber-700">सीटर किराया</span>
                <span>₹{selectedBusForLayout.seaterFare || selectedBusForLayout.fare}</span>
              </div>
              <div className="bg-emerald-100/70 p-2 rounded-xl text-emerald-900">
                <span className="text-[10px] block text-emerald-700">लोअर स्लीपर</span>
                <span>₹{selectedBusForLayout.sleeperFare || (selectedBusForLayout.fare + 100)}</span>
              </div>
              <div className="bg-indigo-100/70 p-2 rounded-xl text-indigo-900">
                <span className="text-[10px] block text-indigo-700">अपर स्लीपर</span>
                <span>₹{selectedBusForLayout.upperSleeperFare || (selectedBusForLayout.fare + 150)}</span>
              </div>
            </div>

            {/* Layout Grid Display */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              <div>
                <h5 className="font-black text-xs text-slate-700 mb-2 uppercase tracking-wider">
                  लोअर डेक (Lower Deck)
                </h5>
                <div className="grid grid-cols-4 gap-2 bg-slate-100 p-3 rounded-2xl">
                  {selectedBusForLayout.seats?.filter(s => s.deck === 'lower').map(s => (
                    <div
                      key={s.id}
                      className={`p-2 rounded-xl border text-center font-bold text-xs ${
                        s.type === 'sleeper'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <span className="block text-[10px] text-slate-400 font-mono">{s.seatNumber}</span>
                      <span className="text-[11px] block">{s.type === 'sleeper' ? 'स्लीपर' : 'सीटर'}</span>
                      <span className="text-[10px] text-indigo-700 font-black">₹{s.fare}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-black text-xs text-slate-700 mb-2 uppercase tracking-wider">
                  अपर डेक (Upper Deck Sleeper)
                </h5>
                <div className="grid grid-cols-3 gap-2 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100">
                  {selectedBusForLayout.seats?.filter(s => s.deck === 'upper').map(s => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl border bg-white border-indigo-200 text-center font-bold text-xs"
                    >
                      <span className="block text-[10px] text-indigo-500 font-mono">{s.seatNumber}</span>
                      <span className="text-[11px] block text-slate-800">लग्जरी स्लीपर</span>
                      <span className="text-[10px] text-indigo-700 font-black">₹{s.fare}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsLayoutModalOpen(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-black transition"
            >
              बंद करें
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
