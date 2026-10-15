/**
 * SafarGo Uber Multi-Modal Mobility Service
 * Uses Uber Developer Platform Client ID & Universal Deeplinks
 * for First-Mile & Last-Mile Cab/Auto Assist for Bus Travelers.
 */

export const UBER_CLIENT_ID =
  import.meta.env.VITE_UBER_CLIENT_ID || 'wp3yjLxasbIwEkPX2sfI_yohPS9-RUvl';

export interface UberRideOptions {
  pickupAddress?: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffAddress: string;
  dropoffLat?: number;
  dropoffLng?: number;
  dropoffNickname?: string;
  productType?: 'auto' | 'ubergo' | 'premier' | 'xl';
}

/**
 * Generates an official Uber Universal Deeplink.
 * Opens native Uber App on mobile (or Uber Web) with pickup and destination pre-filled.
 */
export const buildUberRideUrl = (options: UberRideOptions): string => {
  const params = new URLSearchParams();
  params.set('client_id', UBER_CLIENT_ID);
  params.set('action', 'setPickup');

  if (options.pickupAddress) {
    params.set('pickup[formatted_address]', options.pickupAddress);
  } else {
    params.set('pickup', 'my_location');
  }

  if (options.pickupLat && options.pickupLng) {
    params.set('pickup[latitude]', options.pickupLat.toString());
    params.set('pickup[longitude]', options.pickupLng.toString());
  }

  params.set('dropoff[formatted_address]', options.dropoffAddress);

  if (options.dropoffNickname) {
    params.set('dropoff[nickname]', options.dropoffNickname);
  }

  if (options.dropoffLat && options.dropoffLng) {
    params.set('dropoff[latitude]', options.dropoffLat.toString());
    params.set('dropoff[longitude]', options.dropoffLng.toString());
  }

  return `https://m.uber.com/ul/?${params.toString()}`;
};

/**
 * 🛺 First-Mile Assist:
 * Help traveler book an Uber Cab / Auto from their home to the Bus Boarding Point.
 */
export const getUberBoardingAssistUrl = (booking: {
  from_city: string;
  boarding_point?: string;
}): string => {
  const standName = booking.boarding_point || `${booking.from_city} Bus Stand`;
  const fullAddress = `${standName}, ${booking.from_city}`;

  return buildUberRideUrl({
    pickupAddress: undefined, // defaults to traveler's current GPS location
    dropoffAddress: fullAddress,
    dropoffNickname: `बस बोर्डिंग पॉइंट (${booking.from_city})`,
  });
};

/**
 * 🚕 Last-Mile Assist:
 * When bus reaches destination (e.g. 5:00 AM at Bhopal ISBT),
 * traveler can 1-click book an Uber from the drop point to their home/hotel.
 */
export const getUberDropAssistUrl = (booking: {
  to_city: string;
  drop_point?: string;
  actual_drop_point?: string;
}): string => {
  const dropStand =
    booking.actual_drop_point || booking.drop_point || `${booking.to_city} Bus Stand`;
  const fullAddress = `${dropStand}, ${booking.to_city}`;

  return buildUberRideUrl({
    pickupAddress: fullAddress,
    dropoffAddress: `${booking.to_city}`,
    dropoffNickname: `${booking.to_city} गंतव्य`,
  });
};

/**
 * Quick Estimated Fares for Bus vs Uber Cab comparison
 */
export const getEstimatedCabFare = (fromCity: string, toCity: string): {
  autoFare: number;
  cabFare: number;
  cabDurationText: string;
} => {
  // Approximate intercity/local taxi estimates based on common MP/North India corridors
  const key = `${fromCity.toLowerCase()}-${toCity.toLowerCase()}`;

  const routeFares: Record<string, { autoFare: number; cabFare: number; cabDurationText: string }> = {
    'sironj-bhopal': { autoFare: 450, cabFare: 2200, cabDurationText: '2.5 घंटे' },
    'bhopal-sironj': { autoFare: 450, cabFare: 2200, cabDurationText: '2.5 घंटे' },
    'bhopal-indore': { autoFare: 600, cabFare: 2800, cabDurationText: '3.5 घंटे' },
    'indore-bhopal': { autoFare: 600, cabFare: 2800, cabDurationText: '3.5 घंटे' },
    'vidisha-bhopal': { autoFare: 250, cabFare: 1200, cabDurationText: '1.2 घंटे' },
    'bhopal-vidisha': { autoFare: 250, cabFare: 1200, cabDurationText: '1.2 घंटे' },
    'guna-bhopal': { autoFare: 550, cabFare: 3100, cabDurationText: '3.8 घंटे' },
    'bhopal-jabalpur': { autoFare: 800, cabFare: 4800, cabDurationText: '6 घंटे' },
  };

  if (routeFares[key]) {
    return routeFares[key];
  }

  // Fallback estimation
  return {
    autoFare: 250,
    cabFare: 1800,
    cabDurationText: 'लगभग 2 - 4 घंटे',
  };
};

/**
 * 📍 Top Transit Hubs, Bus Stands & Stations
 * For fast city/place autocomplete across Go Agent Desk and Uber Connect.
 */
export interface TransitLocation {
  city: string;
  standName: string;
  landmark: string;
  type: 'bus_stand' | 'isbt' | 'railway_station' | 'city_center';
}

export const POPULAR_TRANSIT_STATIONS: TransitLocation[] = [
  { city: 'Sironj', standName: 'Sironj Main Bus Stand', landmark: 'Chhatri Chowk', type: 'bus_stand' },
  { city: 'Sironj', standName: 'Vidisha Road Naka', landmark: 'Vidisha Road', type: 'bus_stand' },
  { city: 'Vidisha', standName: 'Vidisha Railway Station Stand', landmark: 'Station Road', type: 'railway_station' },
  { city: 'Vidisha', standName: 'Bareth Road Bus Stand', landmark: 'Bareth Road', type: 'bus_stand' },
  { city: 'Bhopal', standName: 'Bhopal ISBT (Interstate Bus Terminal)', landmark: 'Habibganj / Rani Kamlapati', type: 'isbt' },
  { city: 'Bhopal', standName: 'Nadra Bus Stand', landmark: 'Bhopal Main Railway Station', type: 'bus_stand' },
  { city: 'Bhopal', standName: 'Lalghati Chouraha', landmark: 'Airport Road', type: 'city_center' },
  { city: 'Indore', standName: 'Sarwate Bus Stand', landmark: 'Indore Railway Station', type: 'bus_stand' },
  { city: 'Indore', standName: 'Navlakha Bus Stand', landmark: 'Navlakha Chouraha', type: 'bus_stand' },
  { city: 'Indore', standName: 'Vijay Nagar AICTSL Stand', landmark: 'Vijay Nagar Square', type: 'isbt' },
  { city: 'Gwalior', standName: 'Gwalior ISBT', landmark: 'Transport Nagar', type: 'isbt' },
  { city: 'Gwalior', standName: 'Gwalior Railway Station Bus Stand', landmark: 'Station Road', type: 'railway_station' },
  { city: 'Guna', standName: 'Guna Bus Stand', landmark: 'AB Road', type: 'bus_stand' },
  { city: 'Sagar', standName: 'Sagar Main Bus Stand', landmark: 'Civil Lines', type: 'bus_stand' },
  { city: 'Jabalpur', standName: 'Deendayal Chowk ISBT', landmark: 'ISBT Jabalpur', type: 'isbt' },
  { city: 'Ujjain', standName: 'Dewas Gate Bus Stand', landmark: 'Ujjain Junction', type: 'bus_stand' },
  { city: 'Ujjain', standName: 'Nanakheda Bus Stand', landmark: 'Indore Road', type: 'isbt' },
  { city: 'Bina', standName: 'Bina Junction Bus Stand', landmark: 'Station Road', type: 'railway_station' },
  { city: 'Delhi', standName: 'Kashmere Gate ISBT', landmark: 'North Delhi', type: 'isbt' },
  { city: 'Delhi', standName: 'Anand Vihar ISBT', landmark: 'East Delhi', type: 'isbt' },
  { city: 'Jaipur', standName: 'Sindhi Camp Bus Stand', landmark: 'Station Road', type: 'isbt' },
  { city: 'Agra', standName: 'Idgah Bus Stand', landmark: 'Idgah', type: 'bus_stand' },
  { city: 'Ahmedabad', standName: 'Geeta Mandir Bus Stand', landmark: 'Central Stand', type: 'isbt' },
];

export const searchTransitLocations = (query: string): TransitLocation[] => {
  if (!query || query.trim().length < 1) return POPULAR_TRANSIT_STATIONS.slice(0, 8);
  const q = query.toLowerCase().trim();
  return POPULAR_TRANSIT_STATIONS.filter(
    (loc) =>
      loc.city.toLowerCase().includes(q) ||
      loc.standName.toLowerCase().includes(q) ||
      loc.landmark.toLowerCase().includes(q)
  );
};

