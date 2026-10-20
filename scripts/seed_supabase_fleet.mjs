import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.qkttyqjyfbifdatyaprv',
  password: 'Ankitiji8899',
  ssl: { rejectUnauthorized: false }
});

const SEED_BUSES = [
  {
    id: 'bus-sfg-101',
    operator_name: 'SafarGo Gold Express',
    bus_type: '2+1 BharatBenz AC Sleeper (Washroom onboard)',
    rating: 4.8,
    total_ratings: 1420,
    departure_time: '21:30',
    departure_location: 'Kashmere Gate ISBT, Platform 3',
    arrival_time: '04:15',
    arrival_location: 'Sindhi Camp, Jaipur',
    duration: '6h 45m',
    fare: 899,
    original_fare: 1199,
    seats_available: 18,
    is_primo: true,
    source_city: 'Delhi',
    destination_city: 'Jaipur',
    amenities: ['Free WiFi', 'Charging Point', 'Blanket & Pillow', 'Mineral Water Bottle', 'Live GPS Tracking', 'Emergency SOS Button'],
    boarding_points: [
      { id: 'bp-1', name: 'Kashmere Gate ISBT Metro Gate 1', time: '21:30', landmark: 'Near Platform 3' },
      { id: 'bp-2', name: 'Dhaula Kuan Metro Bus Stand', time: '22:15', landmark: 'Under Flyover' },
      { id: 'bp-3', name: 'IFFCO Chowk, Gurgaon', time: '22:45', landmark: 'Near Main Toll Plaza' }
    ],
    dropping_points: [
      { id: 'dp-1', name: 'Sindhi Camp Bus Stand, Jaipur', time: '04:15', landmark: 'Main Entrance' },
      { id: 'dp-2', name: 'Narayan Singh Circle', time: '04:35', landmark: 'City bus bay' },
      { id: 'dp-3', name: '200 Feet Bypass Ajmer Road', time: '04:55', landmark: 'Flyover starting' }
    ]
  },
  {
    id: 'bus-sfg-102',
    operator_name: 'Zingbus Plus',
    bus_type: 'Volvo 9600 Multi-Axle Semi-Sleeper AC',
    rating: 4.6,
    total_ratings: 980,
    departure_time: '22:15',
    departure_location: 'Majnu Ka Tilla, Delhi',
    arrival_time: '05:00',
    arrival_location: 'Sindhi Camp, Jaipur',
    duration: '6h 45m',
    fare: 749,
    original_fare: 999,
    seats_available: 22,
    is_primo: true,
    source_city: 'Delhi',
    destination_city: 'Jaipur',
    amenities: ['AC', 'Reclining Seats', 'Reading Light', 'Charging USB Port', 'Water Bottle'],
    boarding_points: [
      { id: 'bp-4', name: 'Majnu Ka Tilla', time: '22:15', landmark: 'Opposite Tibetan Market' },
      { id: 'bp-5', name: 'Karol Bagh Metro Station', time: '22:45', landmark: 'Pillar 112' },
      { id: 'bp-6', name: 'Mahipalpur Aerocity', time: '23:30', landmark: 'Near Radisson Hotel' }
    ],
    dropping_points: [
      { id: 'dp-4', name: 'Sindhi Camp', time: '05:00', landmark: 'Platform 4' },
      { id: 'dp-5', name: 'Transport Nagar', time: '05:25', landmark: 'Near Flyover' }
    ]
  },
  {
    id: 'bus-sfg-103',
    operator_name: 'RSRTC Royal Cruiser',
    bus_type: 'Scania AC Multi-Axle Diamond Class',
    rating: 4.5,
    total_ratings: 2310,
    departure_time: '23:00',
    departure_location: 'Bikaner House, India Gate, Delhi',
    arrival_time: '05:30',
    arrival_location: 'Sindhi Camp Central, Jaipur',
    duration: '6h 30m',
    fare: 685,
    original_fare: 750,
    seats_available: 14,
    is_primo: false,
    source_city: 'Delhi',
    destination_city: 'Jaipur',
    amenities: ['Government Certified Safe', 'Punctual Timing', 'Emergency Hammer', 'CCTV Surveillance'],
    boarding_points: [
      { id: 'bp-7', name: 'Bikaner House, Pandara Road', time: '23:00', landmark: 'Gate No. 2' },
      { id: 'bp-8', name: 'Gurgaon Rajiv Chowk', time: '23:55', landmark: 'NH-48 Service Lane' }
    ],
    dropping_points: [
      { id: 'dp-6', name: 'Sindhi Camp', time: '05:30', landmark: 'RSRTC Bay' }
    ]
  },
  {
    id: 'bus-sfg-104',
    operator_name: 'IntrCity SmartBus',
    bus_type: 'AC Sleeper / Seater Smart Lounge',
    rating: 4.7,
    total_ratings: 1890,
    departure_time: '20:45',
    departure_location: 'RK Ashram Marg Metro',
    arrival_time: '03:30',
    arrival_location: 'Polo Victory Cinema, Jaipur',
    duration: '6h 45m',
    fare: 849,
    original_fare: 1100,
    seats_available: 10,
    is_primo: true,
    source_city: 'Delhi',
    destination_city: 'Jaipur',
    amenities: ['Bus Captain Onboard', 'Cleaned Bedrolls', 'WiFi', 'Free Coffee at Lounge', 'GPS'],
    boarding_points: [
      { id: 'bp-9', name: 'RK Ashram Smart Lounge', time: '20:45', landmark: 'Gate 2 Metro' },
      { id: 'bp-10', name: 'Dhaula Kuan', time: '21:30', landmark: 'Bus Bay' }
    ],
    dropping_points: [
      { id: 'dp-7', name: 'Polo Victory', time: '03:30', landmark: 'Near Station' }
    ]
  },
  {
    id: 'bus-sfg-105',
    operator_name: 'Vikas Travels Non-Stop',
    bus_type: '2+2 Non-AC Seater Push Back',
    rating: 4.1,
    total_ratings: 640,
    departure_time: '18:30',
    departure_location: 'Sarai Kale Khan ISBT',
    arrival_time: '01:00',
    arrival_location: 'Sindhi Camp, Jaipur',
    duration: '6h 30m',
    fare: 450,
    original_fare: 550,
    seats_available: 28,
    is_primo: false,
    source_city: 'Delhi',
    destination_city: 'Jaipur',
    amenities: ['Luggage Storage', 'First Aid Box', 'Music System'],
    boarding_points: [
      { id: 'bp-11', name: 'Sarai Kale Khan ISBT', time: '18:30', landmark: 'Platform 7' }
    ],
    dropping_points: [
      { id: 'dp-8', name: 'Sindhi Camp', time: '01:00', landmark: 'Near Gate 1' }
    ]
  }
];

async function seedFleet() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL Pooler.');

  for (const b of SEED_BUSES) {
    await client.query(`
      INSERT INTO public.safargo_fleet_buses (
        id, operator_name, bus_type, rating, review_count,
        departure_time, arrival_time, duration, fare, original_fare,
        available_seats, is_primo, source_city, destination_city,
        amenities, boarding_points, dropping_points
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        fare = EXCLUDED.fare,
        operator_name = EXCLUDED.operator_name,
        bus_type = EXCLUDED.bus_type;
    `, [
      b.id, b.operator_name, b.bus_type, b.rating, b.total_ratings,
      b.departure_time, b.arrival_time, b.duration, b.fare, b.original_fare,
      b.seats_available, b.is_primo, b.source_city, b.destination_city,
      JSON.stringify(b.amenities),
      JSON.stringify(b.boarding_points),
      JSON.stringify(b.dropping_points)
    ]);
  }

  console.log(`✅ Successfully seeded ${SEED_BUSES.length} buses into Supabase!`);
  await client.end();
}

seedFleet().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
