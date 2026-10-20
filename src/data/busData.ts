import { BusItem, BusSeat, StopPoint } from '../types/travel';
import { MP_LOCATIONS } from './mpCitiesData';

// Helper to generate realistic 2-deck 2+1 sleeper/seater bus layout
export const generateSeats = (baseFare: number): BusSeat[] => {
  const seats: BusSeat[] = [];

  // Lower Deck: 12 Seater + 6 Sleeper
  // Left single column, right double column
  for (let r = 1; r <= 6; r++) {
    // Left single (Window)
    const isBooked1 = (r === 2 || r === 4);
    const isLadies1 = (r === 3);
    seats.push({
      id: `L-${r}A`,
      deck: 'lower',
      row: r,
      col: 1,
      seatNumber: `${r}A`,
      type: r <= 4 ? 'seater' : 'sleeper',
      isWindow: true,
      status: isBooked1 ? 'booked' : isLadies1 ? 'ladies_reserved' : 'available',
      fare: baseFare
    });

    // Right inner
    const isBooked2 = (r === 1 || r === 5);
    seats.push({
      id: `L-${r}B`,
      deck: 'lower',
      row: r,
      col: 2,
      seatNumber: `${r}B`,
      type: r <= 4 ? 'seater' : 'sleeper',
      isWindow: false,
      status: isBooked2 ? 'booked' : 'available',
      fare: baseFare
    });

    // Right window
    const isBooked3 = (r === 3 || r === 6);
    seats.push({
      id: `L-${r}C`,
      deck: 'lower',
      row: r,
      col: 3,
      seatNumber: `${r}C`,
      type: r <= 4 ? 'seater' : 'sleeper',
      isWindow: true,
      status: isBooked3 ? 'booked' : 'available',
      fare: baseFare + 50
    });
  }

  // Upper Deck: 12 Luxury Sleeper Berths
  for (let r = 1; r <= 6; r++) {
    // Upper Single Sleeper (Window)
    const isBookedU1 = (r === 1 || r === 3);
    seats.push({
      id: `U-${r}A`,
      deck: 'upper',
      row: r,
      col: 1,
      seatNumber: `U${r}A`,
      type: 'sleeper',
      isWindow: true,
      status: isBookedU1 ? 'booked' : 'available',
      fare: baseFare + 150
    });

    // Upper Double Sleeper Left
    const isBookedU2 = (r === 2);
    seats.push({
      id: `U-${r}B`,
      deck: 'upper',
      row: r,
      col: 2,
      seatNumber: `U${r}B`,
      type: 'sleeper',
      isWindow: false,
      status: isBookedU2 ? 'booked' : 'available',
      fare: baseFare + 100
    });

    // Upper Double Sleeper Window
    const isBookedU3 = (r === 4 || r === 5);
    seats.push({
      id: `U-${r}C`,
      deck: 'upper',
      row: r,
      col: 3,
      seatNumber: `U${r}C`,
      type: 'sleeper',
      isWindow: true,
      status: isBookedU3 ? 'booked' : 'available',
      fare: baseFare + 120
    });
  }

  return seats;
};

export const MOCK_BUSES: BusItem[] = [
  // 1. INDORE TO BHOPAL - CHARTERED SPEED BUS (MP Corridors)
  {
    id: 'bus-mp-01',
    operatorName: 'Chartered Speed Bus (AICTSL)',
    busType: 'Volvo B11R I-Shift AC Seater (2+2)',
    sourceCity: 'Indore',
    destinationCity: 'Bhopal',
    departureTime: '08:00',
    arrivalTime: '11:15',
    duration: '3h 15m',
    fare: 399,
    originalFare: 650,
    discountPercent: 38,
    rating: 4.8,
    reviewCount: 3100,
    isPrimo: true,
    hasLiveTracking: true,
    availableSeats: 16,
    amenities: ['Individual AC Vents', 'Seat Belts', 'Free Wi-Fi', 'Packaged Water', 'Live GPS Tracking', 'CCTV Security'],
    boardingPoints: [
      { id: 'bp-ct-1', name: 'AICTSL Campus Geeta Bhawan', time: '08:00', address: 'Opposite Church, AB Road, Indore', landmark: 'Geeta Bhawan Square' },
      { id: 'bp-ct-2', name: 'Vijay Nagar Square', time: '08:20', address: 'Near Mangal City Mall', landmark: 'Pillar 45' },
      { id: 'bp-ct-3', name: 'Dewas Bhopal Chouraha Bypass', time: '08:50', address: 'Near Sayaji Gate Overbridge', landmark: 'Dewas Highway' }
    ],
    droppingPoints: [
      { id: 'dp-ct-1', name: 'Halalpur Bus Stand Bhopal', time: '10:45', address: 'Indore-Bhopal Highway Entry', landmark: 'Halalpur Flyover' },
      { id: 'dp-ct-2', name: 'Lalghati Chouraha', time: '11:00', address: 'Airport VIP Road Crossing', landmark: 'Overbridge Entry' },
      { id: 'dp-ct-3', name: 'ISBT Habibganj (Rani Kamlapati)', time: '11:15', address: 'Platform 3 Gate, Rani Kamlapati Station', landmark: 'Metro Terminal' }
    ],
    seats: generateSeats(399),
    liveRouteWaypoints: [
      { id: 'wp-1', stopName: 'AICTSL Geeta Bhawan Indore', time: '08:00', status: 'passed', landmark: 'प्रस्थान स्टॉप', distanceKm: 0 },
      { id: 'wp-2', stopName: 'विजयनगर / रेडिसन चौराहा', time: '08:20', status: 'passed', landmark: 'रिंग रोड कट', distanceKm: 12 },
      { id: 'wp-3', stopName: 'देवास भोपाल चौराहा बायपास', time: '08:50', status: 'passed', landmark: 'टोल नाका', distanceKm: 42 },
      { id: 'wp-4', stopName: 'सोनकच्छ बायपास टोल प्लाजा', time: '09:20', status: 'current', landmark: 'वर्तमान लोकेशन • स्पीड 74 km/h', distanceKm: 85 },
      { id: 'wp-5', stopName: 'आष्टा बायपास (कन्नौद रोड चौराहा)', time: '09:45', status: 'upcoming', landmark: '10 मिनट ठहराव / ढाबा ब्रेक', distanceKm: 120, haltDurationMinutes: 10 },
      { id: 'wp-6', stopName: 'सीहोर क्रेसेंट बायपास', time: '10:20', status: 'upcoming', landmark: 'सीहोर जिला कट', distanceKm: 155 },
      { id: 'wp-7', stopName: 'हलालपुर बस स्टैंड भोपाल', time: '10:45', status: 'upcoming', landmark: 'भोपाल एंट्री', distanceKm: 180 },
      { id: 'wp-8', stopName: 'ISBT हबीबगंज (रानी कमलापति)', time: '11:15', status: 'upcoming', landmark: 'अंतिम गंतव्य', distanceKm: 195 }
    ],
    liveTelemetry: {
      currentSpeedKmH: 74,
      currentLocationName: 'सोनकच्छ बायपास टोल प्लाजा (हाईवे किमी 85)',
      nextStopName: 'आष्टा बायपास चौराहा',
      nextStopEtaMinutes: 25,
      trafficStatus: 'smooth',
      totalDistanceKm: 195,
      coveredDistanceKm: 85
    }
  },

  // 2. INDORE TO BHOPAL - HANS TRAVELS (Multi-Axle Sleeper)
  {
    id: 'bus-mp-02',
    operatorName: 'Hans Travels (Indore)',
    busType: 'Scania Multi-Axle Luxury AC Sleeper (2+1)',
    sourceCity: 'Indore',
    destinationCity: 'Bhopal',
    departureTime: '06:30',
    arrivalTime: '10:00',
    duration: '3h 30m',
    fare: 350,
    originalFare: 600,
    discountPercent: 42,
    rating: 4.6,
    reviewCount: 2240,
    isPrimo: false,
    hasLiveTracking: true,
    availableSeats: 20,
    amenities: ['Air Suspension', 'Charging Point', 'Fresh Blanket', 'Packaged Water', 'GPS Tracking'],
    boardingPoints: [
      { id: 'bp-ht-1', name: 'Navlakha Bus Stand', time: '06:30', address: 'Hans Travels Office, Navlakha Square', landmark: 'Near Overbridge' },
      { id: 'bp-ht-2', name: 'Pipliyahana Square', time: '06:50', address: 'World Cup Square Ring Road', landmark: 'Ring Road' },
      { id: 'bp-ht-3', name: 'Star Square / Radisson', time: '07:10', address: 'Near Hotel Radisson Blu', landmark: 'Bypass Cut' }
    ],
    droppingPoints: [
      { id: 'dp-ht-1', name: 'Halalpur Bus Stand', time: '09:40', address: 'Indore-Bhopal Highway Entry', landmark: 'Halalpur Flyover' },
      { id: 'dp-ht-2', name: 'Nadra Bus Stand Bhopal', time: '10:00', address: 'Platform 2, Railway Station Side', landmark: 'Platform Gate 6' }
    ],
    seats: generateSeats(350),
    liveRouteWaypoints: [
      { id: 'wp-h1', stopName: 'नवलखा बस स्टैंड इंदौर', time: '06:30', status: 'passed', landmark: 'प्रस्थान स्टॉप', distanceKm: 0 },
      { id: 'wp-h2', stopName: 'पिपलियाहाना चौराहा', time: '06:50', status: 'passed', landmark: 'बायपास', distanceKm: 8 },
      { id: 'wp-h3', stopName: 'देवास बायपास', time: '07:30', status: 'passed', landmark: 'देवास कट', distanceKm: 40 },
      { id: 'wp-h4', stopName: 'आष्टा बायपास चौराहा', time: '08:30', status: 'current', landmark: 'वर्तमान लोकेशन • स्पीड 68 km/h', distanceKm: 120 },
      { id: 'wp-h5', stopName: 'सीहोर बस स्टैंड कट', time: '09:10', status: 'upcoming', landmark: 'सीहोर हाईवे', distanceKm: 155 },
      { id: 'wp-h6', stopName: 'नादरा बस स्टैंड भोपाल', time: '10:00', status: 'upcoming', landmark: 'अंतिम स्टॉप', distanceKm: 195 }
    ],
    liveTelemetry: {
      currentSpeedKmH: 68,
      currentLocationName: 'आष्टा बायपास चौराहा (कन्नौद रोड फाटा)',
      nextStopName: 'सीहोर बस स्टैंड कट',
      nextStopEtaMinutes: 40,
      trafficStatus: 'smooth',
      totalDistanceKm: 195,
      coveredDistanceKm: 120
    }
  },

  // 3. DELHI TO JAIPUR - SAFARGO PRIMO LUXURY
  {
    id: 'bus-01',
    operatorName: 'SafarGo Primo Luxury Express',
    busType: 'Volvo 9600 Multi-Axle AC Sleeper (2+1)',
    sourceCity: 'Delhi',
    destinationCity: 'Jaipur',
    departureTime: '22:30',
    arrivalTime: '04:15',
    duration: '5h 45m',
    fare: 649,
    originalFare: 1199,
    discountPercent: 46,
    rating: 4.8,
    reviewCount: 3410,
    isPrimo: true,
    hasLiveTracking: true,
    availableSeats: 18,
    amenities: ['High Speed WiFi', 'Charging Port', 'Fresh Blanket & Pillow', 'Free Mineral Water', 'GPS Live Tracking', 'SOS Emergency Alarm'],
    boardingPoints: [
      { id: 'bp-1', name: 'Kashmiri Gate ISBT, Gate No. 2', time: '22:30', address: 'Opposite Metro Station Gate 2', landmark: 'Kashmiri Gate Metro' },
      { id: 'bp-2', name: 'Dhaula Kuan Metro Station', time: '23:15', address: 'Under Dhaula Kuan Flyover', landmark: 'Near Police Post' },
      { id: 'bp-3', name: 'IFFCO Chowk, Gurgaon', time: '23:55', address: 'Near IFFCO Chowk Flyover Slip Road', landmark: 'Metro Pillar 142' }
    ],
    droppingPoints: [
      { id: 'dp-1', name: 'Sindhi Camp Bus Stand', time: '04:15', address: 'Platform 4, Sindhi Camp', landmark: 'Main Station Entrance' },
      { id: 'dp-2', name: 'Narayan Singh Circle', time: '04:30', address: 'Near Police Memorial', landmark: 'City Center' },
      { id: 'dp-3', name: '200 Feet Bypass, Ajmer Road', time: '04:45', address: 'Heerapura Flyover', landmark: 'Ajmer Highway Cut' }
    ],
    seats: generateSeats(649),
    liveRouteWaypoints: [
      { id: 'wp-d1', stopName: 'कश्मीरी गेट ISBT दिल्ली', time: '22:30', status: 'passed', landmark: 'गेट नंबर 2', distanceKm: 0 },
      { id: 'wp-d2', stopName: 'धौला कुआं मेट्रो स्टेशन', time: '23:15', status: 'passed', landmark: 'फ्लाईओवर के नीचे', distanceKm: 18 },
      { id: 'wp-d3', stopName: 'इफ्को चौक गुड़गांव', time: '23:55', status: 'passed', landmark: 'पिलर नंबर 142', distanceKm: 38 },
      { id: 'wp-d4', stopName: 'धारूहेड़ा / बावल टोल प्लाजा', time: '01:00', status: 'passed', landmark: 'टोल गेट', distanceKm: 85 },
      { id: 'wp-d5', stopName: 'कोटपूतली बायपास (मिडवे ढाबा)', time: '02:15', status: 'current', landmark: 'वर्तमान लोकेशन • स्पीड 76 km/h', distanceKm: 145, haltDurationMinutes: 15 },
      { id: 'wp-d6', stopName: 'शाहपुरा हाईवे तिराहा', time: '03:10', status: 'upcoming', landmark: 'जयपुर हाईवे', distanceKm: 205 },
      { id: 'wp-d7', stopName: 'सिंधी कैंप बस स्टैंड जयपुर', time: '04:15', status: 'upcoming', landmark: 'अंतिम स्टेशन', distanceKm: 275 }
    ],
    liveTelemetry: {
      currentSpeedKmH: 76,
      currentLocationName: 'कोटपूतली बायपास (मिडवे ढाबा रेस्ट स्टॉप)',
      nextStopName: 'शाहपुरा हाईवे तिराहा',
      nextStopEtaMinutes: 55,
      trafficStatus: 'smooth',
      totalDistanceKm: 275,
      coveredDistanceKm: 145
    }
  },

  // 4. DELHI TO MANALI - ZINGBUS ELECTRIC EXPRESS
  {
    id: 'bus-03',
    operatorName: 'Zingbus Electric Express',
    busType: 'Zero-Emission Luxury AC Sleeper (2+1)',
    sourceCity: 'Delhi',
    destinationCity: 'Manali',
    departureTime: '19:30',
    arrivalTime: '08:30',
    duration: '13h 00m',
    fare: 1199,
    originalFare: 2199,
    discountPercent: 45,
    rating: 4.9,
    reviewCount: 4120,
    isPrimo: true,
    hasLiveTracking: true,
    availableSeats: 21,
    amenities: ['Super Silent Drive', 'Personal USB Port', 'Hot Tea / Coffee Stop', 'Sanitized Bedding', 'Live GPS Tracking'],
    boardingPoints: [
      { id: 'bp-31', name: 'Kashmiri Gate Zingbus Lounge', time: '19:30', address: 'Shop 12, Kashmiri Gate Waiting Lounge', landmark: 'Opposite ISBT' },
      { id: 'bp-32', name: 'Majnu Ka Tilla', time: '20:00', address: 'Outer Ring Road Bus Stop', landmark: 'Gurudwara Gate' }
    ],
    droppingPoints: [
      { id: 'dp-31', name: 'Kullu By Pass', time: '07:15', address: 'Kullu Main Highway Bridge', landmark: 'Beas River Point' },
      { id: 'dp-32', name: 'Manali Private Bus Stand', time: '08:30', address: 'Near Mall Road Entry', landmark: 'Mall Road Bridge' }
    ],
    seats: generateSeats(1199),
    liveRouteWaypoints: [
      { id: 'wp-m1', stopName: 'कश्मीरी गेट लाउंज दिल्ली', time: '19:30', status: 'passed', landmark: 'Zingbus लाउंज', distanceKm: 0 },
      { id: 'wp-m2', stopName: 'मजनू का टीला', time: '20:00', status: 'passed', landmark: 'रिंग रोड', distanceKm: 8 },
      { id: 'wp-m3', stopName: 'पानीपत टोल प्लाजा', time: '21:40', status: 'passed', landmark: 'GT रोड', distanceKm: 90 },
      { id: 'wp-m4', stopName: 'चंडीगढ़ ट्रिब्यून चौक', time: '00:30', status: 'passed', landmark: 'चंडीगढ़ बाईपास', distanceKm: 245 },
      { id: 'wp-m5', stopName: 'बिलासपुर (कीरतपुर-नेरचौक टनल)', time: '03:45', status: 'current', landmark: 'वर्तमान लोकेशन • स्पीड 58 km/h', distanceKm: 370 },
      { id: 'wp-m6', stopName: 'मंडी बाईपास', time: '05:30', status: 'upcoming', landmark: 'व्यास नदी पुल', distanceKm: 440 },
      { id: 'wp-m7', stopName: 'कुल्लू बाईपास', time: '07:15', status: 'upcoming', landmark: 'कुल्लू वैली', distanceKm: 510 },
      { id: 'wp-m8', stopName: 'मनाली प्राइवेट बस स्टैंड', time: '08:30', status: 'upcoming', landmark: 'मॉल रोड', distanceKm: 550 }
    ],
    liveTelemetry: {
      currentSpeedKmH: 58,
      currentLocationName: 'बिलासपुर टनल 4 (हिमाचल प्रदेश)',
      nextStopName: 'मंडी बाईपास',
      nextStopEtaMinutes: 105,
      trafficStatus: 'smooth',
      totalDistanceKm: 550,
      coveredDistanceKm: 370
    }
  },

  // 5. MUMBAI TO GOA - VRL TRAVELS
  {
    id: 'bus-06',
    operatorName: 'VRL Travels Royal Class',
    busType: 'Multi-Axle I-Shift AC Sleeper',
    sourceCity: 'Mumbai',
    destinationCity: 'Goa',
    departureTime: '18:00',
    arrivalTime: '07:30',
    duration: '13h 30m',
    fare: 1250,
    originalFare: 2400,
    discountPercent: 48,
    rating: 4.6,
    reviewCount: 5200,
    isPrimo: true,
    hasLiveTracking: true,
    availableSeats: 12,
    amenities: ['Double Blanket', 'Reading Light', 'Charging Plug', 'Free Snack Box', 'Clean Toilet Break'],
    boardingPoints: [
      { id: 'bp-61', name: 'Borivali West (Gokul Hotel)', time: '18:00', address: 'Near Chamunda Circle', landmark: 'Highway Junction' },
      { id: 'bp-62', name: 'Andheri East (Bisleri)', time: '18:45', address: 'Western Express Highway', landmark: 'Bisleri Compound' },
      { id: 'bp-63', name: 'Vashi Plaza, Navi Mumbai', time: '20:00', address: 'Vashi Flyover End', landmark: 'Sector 17' }
    ],
    droppingPoints: [
      { id: 'dp-61', name: 'Mapusa Bus Stand', time: '06:30', address: 'Near Mapusa Municipal Market', landmark: 'Kadamba Depot' },
      { id: 'dp-62', name: 'Panjim (Patto Plaza)', time: '07:30', address: 'Kadamba Bus Terminal, Panjim', landmark: 'Mandovi Bridge' }
    ],
    seats: generateSeats(1250),
    liveRouteWaypoints: [
      { id: 'wp-v1', stopName: 'बोरीवली वेस्ट मुंबई', time: '18:00', status: 'passed', landmark: 'गोकुल होटल', distanceKm: 0 },
      { id: 'wp-v2', stopName: 'वाशी प्लाजा नवी मुंबई', time: '20:00', status: 'passed', landmark: 'फ्लाईओवर', distanceKm: 35 },
      { id: 'wp-v3', stopName: 'पुणे नवले ब्रिज बायपास', time: '23:30', status: 'passed', landmark: 'बैंगलोर हाईवे', distanceKm: 180 },
      { id: 'wp-v4', stopName: 'सतारा टोल प्लाजा', time: '01:45', status: 'passed', landmark: 'टोल', distanceKm: 290 },
      { id: 'wp-v5', stopName: 'कोल्हापुर बायपास (मिडवे)', time: '03:30', status: 'current', landmark: 'वर्तमान लोकेशन • स्पीड 72 km/h', distanceKm: 400, haltDurationMinutes: 15 },
      { id: 'wp-v6', stopName: 'सावंतवाड़ी / गोवा बॉर्डर', time: '05:45', status: 'upcoming', landmark: 'बॉर्डर चेकपोस्ट', distanceKm: 520 },
      { id: 'wp-v7', stopName: 'मापुसा बस स्टैंड', time: '06:30', status: 'upcoming', landmark: 'कदांबा स्टैंड', distanceKm: 570 },
      { id: 'wp-v8', stopName: 'पणजी पट्टो प्लाजा', time: '07:30', status: 'upcoming', landmark: 'मांडवी ब्रिज', distanceKm: 590 }
    ],
    liveTelemetry: {
      currentSpeedKmH: 72,
      currentLocationName: 'कोल्हापुर बायपास (शिरोली नाका)',
      nextStopName: 'सावंतवाड़ी चेकपोस्ट',
      nextStopEtaMinutes: 135,
      trafficStatus: 'smooth',
      totalDistanceKm: 590,
      coveredDistanceKm: 400
    }
  }
];

// Helper to look up specific points for any MP location or Indian city
const getCityStopPoints = (cityName: string, type: 'boarding' | 'dropping'): StopPoint[] => {
  const clean = cityName.trim().toLowerCase();
  const mpMatch = MP_LOCATIONS.find(m => m.name.toLowerCase() === clean || m.hindiName.toLowerCase().includes(clean));

  if (mpMatch && mpMatch.popularBoardingPoints.length > 0) {
    return mpMatch.popularBoardingPoints.map((p, idx) => ({
      id: `${type}-${clean}-${idx + 1}`,
      name: `${p.name} (${p.hindiName})`,
      time: type === 'boarding' ? `0${7 + idx * 2}:30` : `1${2 + idx * 2}:45`,
      address: p.address,
      landmark: p.landmark
    }));
  }

  // Fallback realistic stops for generic cities
  return [
    {
      id: `${type}-${clean}-1`,
      name: `${cityName} Main Bus Stand (ISBT)`,
      time: type === 'boarding' ? '08:00' : '14:30',
      address: `Platform 1, Central Terminal, ${cityName}`,
      landmark: 'Near Railway Station Gate'
    },
    {
      id: `${type}-${clean}-2`,
      name: `${cityName} Highway Bypass Crossing`,
      time: type === 'boarding' ? '08:30' : '15:00',
      address: `Overbridge Toll Plaza, ${cityName} Bypass`,
      landmark: 'National Highway Cut'
    }
  ];
};

// ==========================================
// DYNAMIC ALL-INDIA & ALL-MP ROUTE ENGINE
// ==========================================
export const getBusesForRoute = (
  fromCity: string,
  toCity: string,
  filter: 'all' | 'ac' | 'sleeper' | 'primo' = 'all'
): BusItem[] => {
  const normFrom = fromCity.trim().toLowerCase();
  const normTo = toCity.trim().toLowerCase();

  // 1. Direct match from static MOCK_BUSES
  const directMatches = MOCK_BUSES.filter(b => {
    const fromMatch = b.sourceCity.toLowerCase() === normFrom || normFrom.includes(b.sourceCity.toLowerCase()) || b.sourceCity.toLowerCase().includes(normFrom);
    const toMatch = b.destinationCity.toLowerCase() === normTo || normTo.includes(b.destinationCity.toLowerCase()) || b.destinationCity.toLowerCase().includes(normTo);
    return fromMatch && toMatch;
  });

  if (directMatches.length > 0) {
    return directMatches.filter(b => {
      if (filter === 'ac') return b.busType.toLowerCase().includes('ac');
      if (filter === 'sleeper') return b.busType.toLowerCase().includes('sleeper');
      if (filter === 'primo') return b.isPrimo;
      return true;
    });
  }

  // 2. Intelligent Dynamic Generator for ANY City / Village Pair
  const boardingPoints = getCityStopPoints(fromCity, 'boarding');
  const droppingPoints = getCityStopPoints(toCity, 'dropping');

  // Estimate distance and fare based on route
  const isShortRoute = normFrom.includes('pithampur') || normTo.includes('pithampur') || 
                       normFrom.includes('mhow') || normTo.includes('mhow') ||
                       (normFrom.includes('indore') && normTo.includes('ujjain')) ||
                       (normFrom.includes('ujjain') && normTo.includes('indore')) ||
                       (normFrom.includes('sehore') && normTo.includes('bhopal'));

  const basePrice = isShortRoute ? 120 : (normFrom.includes('bhopal') || normFrom.includes('indore')) ? 420 : 650;
  const baseDuration = isShortRoute ? '1h 15m' : '4h 30m';
  const totalKm = isShortRoute ? 55 : 210;

  const generatedList: BusItem[] = [
    {
      id: `dyn-bus-${normFrom}-${normTo}-01`,
      operatorName: isShortRoute ? 'सूत्र सेवा (MP Sutra Seva Express)' : 'Hans Travels (Madhya Pradesh)',
      busType: isShortRoute ? 'Deluxe Non-AC Hi-Tech (2+2)' : 'Scania Multi-Axle Luxury AC Sleeper (2+1)',
      sourceCity: fromCity,
      destinationCity: toCity,
      departureTime: '07:15',
      arrivalTime: isShortRoute ? '08:30' : '11:45',
      duration: baseDuration,
      fare: basePrice,
      originalFare: Math.round(basePrice * 1.6),
      discountPercent: 38,
      rating: 4.7,
      reviewCount: 1840,
      isPrimo: !isShortRoute,
      hasLiveTracking: true,
      availableSeats: 22,
      amenities: ['Individual Charging Socket', 'Reading Light', 'Clean Interior', 'GPS Live Tracking'],
      boardingPoints,
      droppingPoints,
      seats: generateSeats(basePrice),
      liveRouteWaypoints: [
        { id: 'w1', stopName: `${fromCity} प्रस्थान स्टैंड`, time: '07:15', status: 'passed', landmark: 'शुरुआती स्टॉप', distanceKm: 0 },
        { id: 'w2', stopName: `${fromCity} फोरलेन बायपास`, time: '07:45', status: 'current', landmark: `वर्तमान स्थिति • 72 km/h`, distanceKm: Math.round(totalKm * 0.35) },
        { id: 'w3', stopName: 'हाईवे टोल व रेस्ट स्टॉप', time: '09:30', status: 'upcoming', landmark: 'चाय-नाश्ता ठहराव (10 मिनट)', distanceKm: Math.round(totalKm * 0.65), haltDurationMinutes: 10 },
        { id: 'w4', stopName: `${toCity} मुख्य बस स्टैंड`, time: isShortRoute ? '08:30' : '11:45', status: 'upcoming', landmark: 'गंतव्य टर्मिनल', distanceKm: totalKm }
      ],
      liveTelemetry: {
        currentSpeedKmH: 72,
        currentLocationName: `${fromCity} हाईवे बायपास (किमी ${Math.round(totalKm * 0.35)})`,
        nextStopName: 'हाईवे टोल व रेस्ट स्टॉप',
        nextStopEtaMinutes: 35,
        trafficStatus: 'smooth',
        totalDistanceKm: totalKm,
        coveredDistanceKm: Math.round(totalKm * 0.35)
      }
    },
    {
      id: `dyn-bus-${normFrom}-${normTo}-02`,
      operatorName: 'Chartered Speed Bus Line',
      busType: 'Volvo B11R I-Shift AC Seater (2+2)',
      sourceCity: fromCity,
      destinationCity: toCity,
      departureTime: '10:30',
      arrivalTime: isShortRoute ? '11:45' : '15:00',
      duration: baseDuration,
      fare: basePrice + 60,
      originalFare: Math.round((basePrice + 60) * 1.5),
      discountPercent: 33,
      rating: 4.8,
      reviewCount: 2950,
      isPrimo: true,
      hasLiveTracking: true,
      availableSeats: 16,
      amenities: ['Individual AC Vents', 'Seat Belts', 'Packaged Mineral Water', 'Live GPS Tracking'],
      boardingPoints,
      droppingPoints,
      seats: generateSeats(basePrice + 60),
      liveRouteWaypoints: [
        { id: 'w21', stopName: `${fromCity} मुख्य पिकअप`, time: '10:30', status: 'passed', landmark: 'टर्मिनल 1', distanceKm: 0 },
        { id: 'w22', stopName: 'हाईवे जंक्शन', time: '12:00', status: 'current', landmark: 'स्पीड 75 km/h', distanceKm: Math.round(totalKm * 0.5) },
        { id: 'w23', stopName: `${toCity} ड्रॉपिंग स्टॉप`, time: isShortRoute ? '11:45' : '15:00', status: 'upcoming', landmark: 'अंतिम स्टॉप', distanceKm: totalKm }
      ],
      liveTelemetry: {
        currentSpeedKmH: 75,
        currentLocationName: `हाईवे कॉरिडोर किमी ${Math.round(totalKm * 0.5)}`,
        nextStopName: `${toCity} ड्रॉपिंग स्टॉप`,
        nextStopEtaMinutes: 45,
        trafficStatus: 'smooth',
        totalDistanceKm: totalKm,
        coveredDistanceKm: Math.round(totalKm * 0.5)
      }
    },
    {
      id: `dyn-bus-${normFrom}-${normTo}-03`,
      operatorName: 'SafarGo Primo Green Mobility',
      busType: 'Zero-Emission Luxury AC Sleeper (2+1)',
      sourceCity: fromCity,
      destinationCity: toCity,
      departureTime: '18:45',
      arrivalTime: isShortRoute ? '20:00' : '23:15',
      duration: baseDuration,
      fare: basePrice + 120,
      originalFare: Math.round((basePrice + 120) * 1.7),
      discountPercent: 41,
      rating: 4.9,
      reviewCount: 4100,
      isPrimo: true,
      hasLiveTracking: true,
      availableSeats: 14,
      amenities: ['Super Silent Ride', 'Blanket & Pillow', 'High-Speed USB-C', 'GPS Tracking', 'Women Safe Assistance'],
      boardingPoints,
      droppingPoints,
      seats: generateSeats(basePrice + 120),
      liveRouteWaypoints: [
        { id: 'w31', stopName: `${fromCity} लाउंज`, time: '18:45', status: 'passed', landmark: 'पिकअप लाउंज', distanceKm: 0 },
        { id: 'w32', stopName: 'ग्रीन एक्सप्रेसवे मिडवे', time: '20:15', status: 'current', landmark: 'वर्तमान लोकेशन • 78 km/h', distanceKm: Math.round(totalKm * 0.55) },
        { id: 'w33', stopName: `${toCity} ISBT गेट`, time: isShortRoute ? '20:00' : '23:15', status: 'upcoming', landmark: 'टर्मिनल गेट', distanceKm: totalKm }
      ],
      liveTelemetry: {
        currentSpeedKmH: 78,
        currentLocationName: `ग्रीन एक्सप्रेसवे (किमी ${Math.round(totalKm * 0.55)})`,
        nextStopName: `${toCity} ISBT गेट`,
        nextStopEtaMinutes: 60,
        trafficStatus: 'smooth',
        totalDistanceKm: totalKm,
        coveredDistanceKm: Math.round(totalKm * 0.55)
      }
    },
    {
      id: `dyn-bus-${normFrom}-${normTo}-04`,
      operatorName: 'NueGo Intercity Electric',
      busType: 'Electric AC Seater (2+2)',
      sourceCity: fromCity,
      destinationCity: toCity,
      departureTime: '21:30',
      arrivalTime: isShortRoute ? '22:45' : '02:00',
      duration: baseDuration,
      fare: basePrice + 40,
      originalFare: Math.round((basePrice + 40) * 1.4),
      discountPercent: 29,
      rating: 4.6,
      reviewCount: 1650,
      isPrimo: true,
      hasLiveTracking: true,
      availableSeats: 26,
      amenities: ['CCTV Surveillance', 'Clean Sanitized Seats', 'Charging Point', 'Live GPS'],
      boardingPoints,
      droppingPoints,
      seats: generateSeats(basePrice + 40),
      liveRouteWaypoints: [
        { id: 'w41', stopName: `${fromCity} बोर्डिंग गेट`, time: '21:30', status: 'passed', landmark: 'गेट 1', distanceKm: 0 },
        { id: 'w42', stopName: `${toCity} फाइनल ड्रॉप`, time: isShortRoute ? '22:45' : '02:00', status: 'upcoming', landmark: 'प्लेटफॉर्म 2', distanceKm: totalKm }
      ],
      liveTelemetry: {
        currentSpeedKmH: 70,
        currentLocationName: `${fromCity} आउटर बाईपास`,
        nextStopName: `${toCity} फाइनल ड्रॉप`,
        nextStopEtaMinutes: 70,
        trafficStatus: 'smooth',
        totalDistanceKm: totalKm,
        coveredDistanceKm: Math.round(totalKm * 0.2)
      }
    }
  ];

  return generatedList.filter(b => {
    if (filter === 'ac') return b.busType.toLowerCase().includes('ac');
    if (filter === 'sleeper') return b.busType.toLowerCase().includes('sleeper');
    if (filter === 'primo') return b.isPrimo;
    return true;
  });
};

export const POPULAR_ROUTES = [
  { from: 'Indore', to: 'Bhopal', duration: '3h 15m', fare: '₹350', busesCount: 64 },
  { from: 'Indore', to: 'Ujjain', duration: '1h 15m', fare: '₹110', busesCount: 85 },
  { from: 'Bhopal', to: 'Jabalpur', duration: '6h 00m', fare: '₹480', busesCount: 36 },
  { from: 'Indore', to: 'Pithampur', duration: '45m', fare: '₹60', busesCount: 110 },
  { from: 'Ashta', to: 'Bhopal', duration: '1h 30m', fare: '₹95', busesCount: 42 },
  { from: 'Indore', to: 'Gwalior', duration: '9h 00m', fare: '₹850', busesCount: 28 },
  { from: 'Delhi', to: 'Jaipur', duration: '5h 45m', fare: '₹549', busesCount: 48 },
  { from: 'Delhi', to: 'Manali', duration: '13h 00m', fare: '₹1,099', busesCount: 32 },
  { from: 'Mumbai', to: 'Goa', duration: '13h 30m', fare: '₹1,250', busesCount: 42 }
];
