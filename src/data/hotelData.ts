import { HotelItem } from '../types/travel';

export const MOCK_HOTELS: HotelItem[] = [
  {
    id: 'hotel-01',
    name: 'SafarGo Grand Palace Heritage & Spa',
    city: 'Jaipur',
    area: 'MI Road, Near City Palace',
    starCategory: 5,
    rating: 4.8,
    reviewCount: 1420,
    pricePerNight: 2899,
    originalPrice: 5999,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Free WiFi', 'Swimming Pool', 'Free Breakfast', 'Couple Friendly', 'Spa & Wellness', 'Valet Parking', 'Air Conditioned'],
    description: 'Experience royal Rajputana hospitality in the heart of the Pink City. Features grand courtyards, temperature-controlled pool, and authentic Rajasthani Thali restaurant.',
    coupleFriendly: true,
    freeBreakfast: true,
    rooms: [
      {
        id: 'room-101',
        name: 'Deluxe Heritage King Room',
        pricePerNight: 2899,
        originalPrice: 5999,
        maxGuests: 2,
        bedType: '1 Extra Large King Bed',
        features: ['City View Balcony', 'Free High Speed WiFi', 'Complimentary Breakfast', 'Bathtub'],
        isAvailable: true
      },
      {
        id: 'room-102',
        name: 'Royal Rajputana Suite with Courtyard View',
        pricePerNight: 4499,
        originalPrice: 8999,
        maxGuests: 3,
        bedType: '1 King Bed + 1 Sofa Bed',
        features: ['Jharokha Window Seating', 'Jacuzzi', 'Butler Service', 'Free Airport Pickup'],
        isAvailable: true
      }
    ]
  },
  {
    id: 'hotel-02',
    name: 'Casa De Goa Boutique Beach Resort',
    city: 'Goa',
    area: 'Calangute Beach (200m from Sand)',
    starCategory: 4,
    rating: 4.7,
    reviewCount: 2840,
    pricePerNight: 2199,
    originalPrice: 4500,
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Direct Beach Access', 'Swimming Pool', 'Poolside Bar', 'Free Breakfast', 'Scooter Rental on Site', 'Free WiFi'],
    description: 'Portuguese-styled tropical paradise located just 3 minutes walk from buzzing Calangute Beach and Tito’s Lane. Enjoy sunset cocktails by the infinity pool.',
    coupleFriendly: true,
    freeBreakfast: true,
    rooms: [
      {
        id: 'room-201',
        name: 'Pool View Balcony Room',
        pricePerNight: 2199,
        originalPrice: 4500,
        maxGuests: 2,
        bedType: '1 Queen Bed',
        features: ['Private Balcony', 'Mini Bar', 'Tea/Coffee Maker', 'Walk-in Shower'],
        isAvailable: true
      }
    ]
  },
  {
    id: 'hotel-03',
    name: 'Snow Valley Himalayan Cedar Retreat',
    city: 'Manali',
    area: 'Log Huts Area, Old Manali',
    starCategory: 4,
    rating: 4.9,
    reviewCount: 3600,
    pricePerNight: 1899,
    originalPrice: 3800,
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Snow Peak Mountain View', 'Room Heater Included', 'Bonfire Nightly', 'Free WiFi', 'Multi-cuisine Cafe', 'Travel Desk'],
    description: 'Surrounded by pine and deodar forests, offering panoramic views of snow-capped Rohtang peaks. Cozy wooden architecture with fireplace lounge.',
    coupleFriendly: true,
    freeBreakfast: true,
    rooms: [
      {
        id: 'room-301',
        name: 'Himalayan Luxury Pine Room',
        pricePerNight: 1899,
        originalPrice: 3800,
        maxGuests: 2,
        bedType: '1 King Bed',
        features: ['Valley View', 'Central Heating', 'Electric Blanket', 'Free Mountain Tea'],
        isAvailable: true
      }
    ]
  },
  {
    id: 'hotel-04',
    name: 'The Park Luxury Business Suites',
    city: 'Delhi',
    area: 'Connaught Place (CP Center)',
    starCategory: 5,
    rating: 4.6,
    reviewCount: 2100,
    pricePerNight: 3499,
    originalPrice: 7000,
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Near Metro Station', 'Gym & Fitness Center', 'Conference Rooms', 'Buffet Breakfast', 'Airport Shuttle', 'Free WiFi'],
    description: 'Central location in Connaught Place next to Shivaji Stadium Metro. Perfect for business travelers and tourists exploring India Gate and Red Fort.',
    coupleFriendly: true,
    freeBreakfast: true,
    rooms: [
      {
        id: 'room-401',
        name: 'Executive City Suite',
        pricePerNight: 3499,
        originalPrice: 7000,
        maxGuests: 2,
        bedType: '1 King Bed',
        features: ['Work Desk with Ergonomic Chair', 'Smart TV', 'Lounge Access'],
        isAvailable: true
      }
    ]
  }
];
