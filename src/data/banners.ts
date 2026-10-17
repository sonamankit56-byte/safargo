export interface PromoBanner {
  id: string;
  title: string;
  hindiTitle: string;
  subtitle: string;
  discountBadge: string;
  bgGradient: string;
  accentColor: string;
  tag: string;
  imageUrl: string;
  targetCategory?: string;
}

export const PROMO_BANNERS: PromoBanner[] = [
  {
    id: 'banner-01',
    title: 'Maha Bachat Festival',
    hindiTitle: 'महा बचत फेस्टिवल • सबसे कम दाम',
    subtitle: 'Extra ₹50 Off on 1st Order + Free Delivery',
    discountBadge: 'UP TO 80% OFF',
    bgGradient: 'from-pink-600 via-purple-700 to-indigo-900',
    accentColor: '#FFC107',
    tag: 'FESTIVE SALE',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'banner-02',
    title: 'SafarGo Mall Direct',
    hindiTitle: 'सफ़रगो मॉल • 100% ओरिजिनल ब्रांड्स',
    subtitle: 'Direct from Verified Factories | Zero Middlemen',
    discountBadge: 'STARTING ₹149',
    bgGradient: 'from-amber-600 via-orange-600 to-rose-700',
    accentColor: '#FFFFFF',
    tag: 'MALL EXCLUSIVE',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'banner-03',
    title: 'Resell & Earn From Home',
    hindiTitle: 'घर बैठे रीसेल करें और हर महीने ₹25,000 कमाएं',
    subtitle: '0 Investment • Add Margin • We deliver to your customer',
    discountBadge: 'CASH PROFIT',
    bgGradient: 'from-emerald-700 via-teal-800 to-cyan-900',
    accentColor: '#00E676',
    tag: 'EARN WITH SAFARGO',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80'
  }
];

export const DEAL_BUCKETS = [
  {
    id: 'under-99',
    label: 'Under ₹99',
    hindiLabel: '₹99 से कम',
    subtext: 'Steal Deals',
    bg: 'bg-gradient-to-r from-red-500 to-orange-500',
    tagColor: 'text-yellow-200'
  },
  {
    id: 'under-199',
    label: 'Under ₹199',
    hindiLabel: '₹199 स्टोर',
    subtext: 'Bestsellers',
    bg: 'bg-gradient-to-r from-purple-600 to-pink-500',
    tagColor: 'text-pink-100'
  },
  {
    id: 'under-299',
    label: 'Under ₹299',
    hindiLabel: '₹299 स्टोर',
    subtext: 'Trending Fashion',
    bg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    tagColor: 'text-blue-100'
  },
  {
    id: 'free-del',
    label: 'Free Delivery',
    hindiLabel: 'फ्री डिलीवरी',
    subtext: 'Zero Shipping',
    bg: 'bg-gradient-to-r from-emerald-600 to-teal-500',
    tagColor: 'text-emerald-100'
  }
];
