import { City, Bus, Seat } from '../types';

export const CITIES: City[] = [
  { name: 'Delhi', state: 'Delhi', popular: true },
  { name: 'Manali', state: 'Himachal Pradesh', popular: true },
  { name: 'Mumbai', state: 'Maharashtra', popular: true },
  { name: 'Goa', state: 'Goa', popular: true },
  { name: 'Pune', state: 'Maharashtra', popular: true },
  { name: 'Bangalore', state: 'Karnataka', popular: true },
  { name: 'Hyderabad', state: 'Telangana', popular: true },
  { name: 'Jaipur', state: 'Rajasthan', popular: true },
  { name: 'Chandigarh', state: 'Punjab', popular: true },
  { name: 'Shimla', state: 'Himachal Pradesh', popular: true },
  { name: 'Ahmedabad', state: 'Gujarat', popular: true },
  { name: 'Chennai', state: 'Tamil Nadu', popular: true },
  { name: 'Kolkata', state: 'West Bengal', popular: true },
  { name: 'Agra', state: 'Uttar Pradesh', popular: false },
  { name: 'Dehradun', state: 'Uttarakhand', popular: false },
  { name: 'Udaipur', state: 'Rajasthan', popular: false },
  { name: 'Varanasi', state: 'Uttar Pradesh', popular: false },
];

export const POPULAR_ROUTES = [
  { from: 'Delhi', to: 'Manali', duration: '12h 30m', buses: '42+ buses', price: '₹799' },
  { from: 'Mumbai', to: 'Goa', duration: '11h 15m', buses: '58+ buses', price: '₹650' },
  { from: 'Bangalore', to: 'Hyderabad', duration: '8h 45m', buses: '65+ buses', price: '₹550' },
  { from: 'Pune', to: 'Mumbai', duration: '3h 30m', buses: '90+ buses', price: '₹320' },
  { from: 'Delhi', to: 'Jaipur', duration: '5h 00m', buses: '74+ buses', price: '₹399' },
  { from: 'Bangalore', to: 'Goa', duration: '11h 00m', buses: '38+ buses', price: '₹850' },
];

function generateSeats(busId: string, basePrice: number, isSleeper: boolean): Seat[] {
  const seats: Seat[] = [];
  const rows = 6;

  // Lower Deck
  for (let r = 1; r <= rows; r++) {
    // Single window seat (Col 1)
    const status1 = (r === 2 || r === 5) ? 'booked' : (r === 3 ? 'female_reserved' : 'available');
    seats.push({
      id: `${busId}-L-${r}-1`,
      number: `L${r}A`,
      deck: 'lower',
      type: isSleeper ? 'sleeper' : 'seater',
      price: basePrice,
      status: status1,
      row: r,
      col: 1,
    });

    // Double seats on right side (Col 2, 3)
    const status2 = (r === 1 || r === 4) ? 'booked' : 'available';
    seats.push({
      id: `${busId}-L-${r}-2`,
      number: `L${r}B`,
      deck: 'lower',
      type: isSleeper ? 'sleeper' : 'seater',
      price: basePrice,
      status: status2,
      row: r,
      col: 2,
    });

    const status3 = (r === 4) ? 'booked' : (r === 1 ? 'female_reserved' : 'available');
    seats.push({
      id: `${busId}-L-${r}-3`,
      number: `L${r}C`,
      deck: 'lower',
      type: isSleeper ? 'sleeper' : 'seater',
      price: basePrice,
      status: status3,
      row: r,
      col: 3,
    });
  }

  // Upper Deck (if sleeper or semi-sleeper)
  if (isSleeper) {
    for (let r = 1; r <= rows; r++) {
      const status1 = (r === 3) ? 'booked' : 'available';
      seats.push({
        id: `${busId}-U-${r}-1`,
        number: `U${r}A`,
        deck: 'upper',
        type: 'sleeper',
        price: basePrice + 150,
        status: status1,
        row: r,
        col: 1,
      });

      const status2 = (r === 2 || r === 6) ? 'booked' : 'available';
      seats.push({
        id: `${busId}-U-${r}-2`,
        number: `U${r}B`,
        deck: 'upper',
        type: 'sleeper',
        price: basePrice + 150,
        status: status2,
        row: r,
        col: 2,
      });

      const status3 = (r === 5) ? 'booked' : 'available';
      seats.push({
        id: `${busId}-U-${r}-3`,
        number: `U${r}C`,
        deck: 'upper',
        type: 'sleeper',
        price: basePrice + 150,
        status: status3,
        row: r,
        col: 3,
      });
    }
  }

  return seats;
}

export const MOCK_BUSES: Bus[] = [
  {
    id: 'bus-01',
    operator: {
      id: 'op-01',
      name: 'IntrCity SmartBus',
      rating: 4.8,
      totalRatings: 3420,
      isPrimo: true,
      busType: 'Volvo 9600 Multi-Axle A/C Sleeper (2+1)'
    },
    fromCity: 'Delhi',
    toCity: 'Manali',
    departureTime: '19:30',
    arrivalTime: '08:00',
    duration: '12h 30m',
    basePrice: 1199,
    seatsAvailable: 19,
    singleSeatsAvailable: 5,
    isAC: true,
    isSleeper: true,
    isSeater: false,
    amenities: ['Live Tracking', 'Water Bottle', 'Charging Point', 'Blanket', 'Reading Light', 'Emergency Exit'],
    boardingPoints: [
      { id: 'bp-1', location: 'Kashmere Gate Metro Gate 5', landmark: 'Near Parking', time: '19:30' },
      { id: 'bp-2', location: 'Majnu Ka Tilla', landmark: 'Opposite HP Petrol Pump', time: '20:15' },
      { id: 'bp-3', location: 'Karnal Bypass', landmark: 'Under Flyover', time: '21:00' },
    ],
    droppingPoints: [
      { id: 'dp-1', location: 'Kullu Bypass', landmark: 'Main Highway', time: '06:45' },
      { id: 'dp-2', location: 'Private Bus Stand Manali', landmark: 'Mall Road Entry', time: '08:00' },
    ],
    seats: generateSeats('bus-01', 1199, true),
  },
  {
    id: 'bus-02',
    operator: {
      id: 'op-02',
      name: 'Zingbus Plus',
      rating: 4.6,
      totalRatings: 1890,
      isPrimo: true,
      busType: 'Scania Multi-Axle AC Sleeper Lounge'
    },
    fromCity: 'Delhi',
    toCity: 'Manali',
    departureTime: '20:45',
    arrivalTime: '09:15',
    duration: '12h 30m',
    basePrice: 999,
    seatsAvailable: 14,
    singleSeatsAvailable: 3,
    isAC: true,
    isSleeper: true,
    isSeater: false,
    amenities: ['Free WiFi', 'Live Tracking', 'Water Bottle', 'Charging Point', 'Air Suspension'],
    boardingPoints: [
      { id: 'bp-1', location: 'RK Ashram Metro Station', landmark: 'Pillar 12', time: '20:45' },
      { id: 'bp-2', location: 'Majnu Ka Tilla', landmark: 'Near Gurdwara', time: '21:30' },
    ],
    droppingPoints: [
      { id: 'dp-1', location: 'Green Tax Barrier', landmark: 'Manali Entrance', time: '08:45' },
      { id: 'dp-2', location: 'Private Bus Stand Manali', landmark: 'Mall Road Entry', time: '09:15' },
    ],
    seats: generateSeats('bus-02', 999, true),
  },
  {
    id: 'bus-03',
    operator: {
      id: 'op-03',
      name: 'NueGo Electric AC',
      rating: 4.7,
      totalRatings: 2150,
      isPrimo: true,
      busType: 'Eco Luxury Electric AC Seater (2+2)'
    },
    fromCity: 'Delhi',
    toCity: 'Jaipur',
    departureTime: '06:00',
    arrivalTime: '11:15',
    duration: '5h 15m',
    basePrice: 449,
    seatsAvailable: 22,
    singleSeatsAvailable: 6,
    isAC: true,
    isSleeper: false,
    isSeater: true,
    amenities: ['100% Silent Electric', 'Charging Point', 'CCTV', 'Emergency Button', 'Sanitized Seat'],
    boardingPoints: [
      { id: 'bp-1', location: 'Dhaula Kuan Metro', landmark: 'Foot Over Bridge', time: '06:00' },
      { id: 'bp-2', location: 'IFFCO Chowk Gurgaon', landmark: 'Near Bus Stand', time: '06:45' },
    ],
    droppingPoints: [
      { id: 'dp-1', location: 'Sindhi Camp Bus Stand', landmark: 'Metro Station Gate 2', time: '11:15' },
      { id: 'dp-2', location: 'Narayan Singh Circle', landmark: 'Main Circle', time: '11:35' },
    ],
    seats: generateSeats('bus-03', 449, false),
  },
  {
    id: 'bus-04',
    operator: {
      id: 'op-04',
      name: 'VRL Travels',
      rating: 4.5,
      totalRatings: 4890,
      isPrimo: false,
      busType: 'I-Shift Multi-Axle Volvo B11R AC Sleeper'
    },
    fromCity: 'Mumbai',
    toCity: 'Goa',
    departureTime: '21:00',
    arrivalTime: '08:30',
    duration: '11h 30m',
    basePrice: 1250,
    seatsAvailable: 11,
    singleSeatsAvailable: 2,
    isAC: true,
    isSleeper: true,
    isSeater: false,
    amenities: ['Water Bottle', 'Charging Point', 'Reading Light', 'Blanket', 'Pillow'],
    boardingPoints: [
      { id: 'bp-1', location: 'Borivali West', landmark: 'Gokul Hotel', time: '21:00' },
      { id: 'bp-2', location: 'Andheri East', landmark: 'Bisleri Compound', time: '21:40' },
      { id: 'bp-3', location: 'Vashi', landmark: 'Old Toll Naka', time: '22:45' },
    ],
    droppingPoints: [
      { id: 'dp-1', location: 'Mapusa', landmark: 'Taxi Stand', time: '07:30' },
      { id: 'dp-2', location: 'Panaji', landmark: 'Behind KTC Bus Stand', time: '08:30' },
    ],
    seats: generateSeats('bus-04', 1250, true),
  },
  {
    id: 'bus-05',
    operator: {
      id: 'op-05',
      name: 'Orange Tours and Travels',
      rating: 4.4,
      totalRatings: 2840,
      isPrimo: true,
      busType: 'Mercedes Benz Multi-Axle Sleeper'
    },
    fromCity: 'Bangalore',
    toCity: 'Hyderabad',
    departureTime: '22:15',
    arrivalTime: '07:00',
    duration: '8h 45m',
    basePrice: 890,
    seatsAvailable: 16,
    singleSeatsAvailable: 4,
    isAC: true,
    isSleeper: true,
    isSeater: false,
    amenities: ['WiFi', 'Live Tracking', 'Water Bottle', 'Charging Point', 'Snacks'],
    boardingPoints: [
      { id: 'bp-1', location: 'Majestic', landmark: 'Anand Rao Circle', time: '22:15' },
      { id: 'bp-2', location: 'Hebbal', landmark: 'Esteem Mall', time: '23:00' },
    ],
    droppingPoints: [
      { id: 'dp-1', location: 'Gachibowli', landmark: 'ORR Junction', time: '06:15' },
      { id: 'dp-2', location: 'Ameerpet', landmark: 'Metro Pillar 1042', time: '07:00' },
    ],
    seats: generateSeats('bus-05', 890, true),
  },
  {
    id: 'bus-06',
    operator: {
      id: 'op-06',
      name: 'Hans Travels (I) Pvt Ltd',
      rating: 4.2,
      totalRatings: 1420,
      isPrimo: false,
      busType: 'Bharat Benz AC Sleeper (2+1)'
    },
    fromCity: 'Pune',
    toCity: 'Mumbai',
    departureTime: '07:30',
    arrivalTime: '11:00',
    duration: '3h 30m',
    basePrice: 380,
    seatsAvailable: 28,
    singleSeatsAvailable: 8,
    isAC: true,
    isSleeper: false,
    isSeater: true,
    amenities: ['Water Bottle', 'Charging Point', 'Music System'],
    boardingPoints: [
      { id: 'bp-1', location: 'Swargate', landmark: 'Near Police Ground', time: '07:30' },
      { id: 'bp-2', location: 'Wakad', landmark: 'Hinjewadi Bridge', time: '08:15' },
    ],
    droppingPoints: [
      { id: 'dp-1', location: 'Dadar East', landmark: 'Swami Narayan Temple', time: '10:45' },
      { id: 'dp-2', location: 'Borivali East', landmark: 'National Park', time: '11:00' },
    ],
    seats: generateSeats('bus-06', 380, false),
  },
  {
    id: 'bus-07',
    operator: {
      id: 'op-07',
      name: 'SRS Travels',
      rating: 4.3,
      totalRatings: 3100,
      isPrimo: false,
      busType: 'Scania AC Seater / Sleeper'
    },
    fromCity: 'Delhi',
    toCity: 'Manali',
    departureTime: '17:30',
    arrivalTime: '06:15',
    duration: '12h 45m',
    basePrice: 850,
    seatsAvailable: 8,
    singleSeatsAvailable: 1,
    isAC: true,
    isSleeper: true,
    isSeater: true,
    amenities: ['Water Bottle', 'Charging Point', 'Blanket', 'Reading Light'],
    boardingPoints: [
      { id: 'bp-1', location: 'Kashmere Gate Metro Gate 1', landmark: 'Main Gate', time: '17:30' },
      { id: 'bp-2', location: 'Majnu Ka Tilla', landmark: 'Foot Bridge', time: '18:15' },
    ],
    droppingPoints: [
      { id: 'dp-1', location: 'Private Bus Stand Manali', landmark: 'Mall Road Entry', time: '06:15' },
    ],
    seats: generateSeats('bus-07', 850, true),
  },
  {
    id: 'bus-08',
    operator: {
      id: 'op-08',
      name: 'Himachal Volvo Express',
      rating: 4.7,
      totalRatings: 4210,
      isPrimo: true,
      busType: 'Volvo B11R 2+2 Semi-Sleeper Air-Suspension'
    },
    fromCity: 'Delhi',
    toCity: 'Manali',
    departureTime: '21:30',
    arrivalTime: '09:45',
    duration: '12h 15m',
    basePrice: 1350,
    seatsAvailable: 24,
    singleSeatsAvailable: 7,
    isAC: true,
    isSleeper: true,
    isSeater: false,
    amenities: ['Live Tracking', 'High-Speed WiFi', 'Thermal Blanket', 'Mineral Water', 'Emergency First Aid'],
    boardingPoints: [
      { id: 'bp-1', location: 'Kashmere Gate ISBT', landmark: 'Platform 18', time: '21:30' },
      { id: 'bp-2', location: 'Rohini Sector 14', landmark: 'Near Metro', time: '22:15' },
    ],
    droppingPoints: [
      { id: 'dp-1', location: 'Manali Government Bus Stand', landmark: 'Central Town', time: '09:45' },
    ],
    seats: generateSeats('bus-08', 1350, true),
  }
];
