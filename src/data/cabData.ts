import { CabItem } from '../types/travel';

export const MOCK_CABS: CabItem[] = [
  {
    id: 'cab-01',
    category: 'Hatchback',
    carModel: 'Maruti WagonR / Tata Tiago AC',
    passengerCapacity: 4,
    luggageCapacity: 2,
    estimatedFare: 1850,
    perKmRate: 11,
    freeCancellationMinutes: 60,
    features: ['Top Rated Driver', 'Toll & State Tax Included', 'Clean & Sanitized Car'],
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cab-02',
    category: 'Sedan',
    carModel: 'Maruti Dzire / Honda Amaze AC',
    passengerCapacity: 4,
    luggageCapacity: 3,
    estimatedFare: 2350,
    perKmRate: 13,
    freeCancellationMinutes: 60,
    features: ['Extra Legroom', 'Boot Space for Big Bags', 'Fasttag Equipped', 'Live Tracking'],
    image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cab-03',
    category: 'SUV',
    carModel: 'Maruti Ertiga / Kia Carens (6+1)',
    passengerCapacity: 6,
    luggageCapacity: 4,
    estimatedFare: 3450,
    perKmRate: 17,
    freeCancellationMinutes: 120,
    features: ['Comfortable 3 Rows', 'Carrier on Roof', 'Highway Expert Chauffeur'],
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cab-04',
    category: 'Innova Crysta',
    carModel: 'Toyota Innova Crysta Luxury Captain Seats',
    passengerCapacity: 7,
    luggageCapacity: 5,
    estimatedFare: 4800,
    perKmRate: 22,
    freeCancellationMinutes: 120,
    features: ['Reclining Captain Seats', 'Rear AC Vents', 'Super Smooth Highway Ride'],
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80'
  }
];
