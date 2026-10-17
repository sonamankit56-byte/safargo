// SafarGo Shopping (Meesho Clone) Core Types

export type ProductCategory = 
  | 'women_ethnic'
  | 'western_wear'
  | 'men_fashion'
  | 'kids_toys'
  | 'home_kitchen'
  | 'beauty_health'
  | 'jewellery'
  | 'electronics';

export interface ProductReview {
  id: string;
  userName: string;
  userCity: string;
  rating: number;
  date: string;
  comment: string;
  verifiedBuyer: boolean;
  helpfulCount: number;
  userImages?: string[];
}

export interface Product {
  id: string;
  title: string;
  hindiTitle?: string;
  category: ProductCategory;
  categoryName: string;
  subCategory: string;
  dealPrice: number;       // Discounted customer wholesale price
  mrp: number;             // Original maximum retail price
  discountPercent: number;
  rating: number;          // e.g. 4.2
  ratingCount: number;     // e.g. 1845
  reviewCount: number;     // e.g. 420
  images: string[];
  sizes: string[];         // e.g. ['Free Size'] or ['S', 'M', 'L', 'XL', 'XXL']
  fabricOrMaterial: string;
  color: string;
  pattern: string;
  freeDelivery: boolean;
  cashOnDeliveryAvailable: boolean;
  easyReturnsDays: number; // e.g. 7 days
  isMallProduct: boolean;  // SafarGo Mall factory-direct brand
  brandName?: string;
  supplierName: string;
  supplierRating: number;
  supplierFollowers: number;
  inStock: boolean;
  description: string;
  specifications: Record<string, string>;
  reviews: ProductReview[];
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  selectedSize: string;
  quantity: number;
  isResale: boolean;
  customerPrice?: number;   // Price reseller wants to charge customer
  resellerMargin?: number;  // customerPrice - (dealPrice * quantity)
}

export interface DeliveryAddress {
  id: string;
  fullName: string;
  phoneNumber: string;
  houseNo: string;
  roadNameArea: string;
  pincode: string;
  city: string;
  state: string;
  landmark?: string;
  addressType: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

export type PaymentMethod = 'cod' | 'upi' | 'card' | 'netbanking';

export type TrackingStatus = 
  | 'placed' 
  | 'packed' 
  | 'shipped' 
  | 'out_for_delivery' 
  | 'delivered'
  | 'cancelled';

export interface TrackingStep {
  status: TrackingStatus;
  title: string;
  hindiTitle: string;
  description: string;
  timestamp: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending_cod';
  productTotal: number;
  discountTotal: number;
  shippingFee: number;
  extraPrepaidDiscount: number;
  finalPaidAmount: number;
  trackingStatus: TrackingStatus;
  trackingSteps: TrackingStep[];
  estimatedDeliveryDate: string;
  courierPartner: string;
  trackingNumber: string;
  isResellerOrder: boolean;
  resellerMarginAmount: number;
  marginStatus: 'none' | 'pending_delivery' | 'ready_for_payout' | 'credited_to_bank';
}

export interface ResellerWallet {
  totalMarginEarned: number;
  pendingMargin: number;
  nextPayoutDate: string; // Every Sunday
  bankAccountMasked?: string;
  bankIfsc?: string;
  upiIdMasked?: string;
  payoutHistory: {
    id: string;
    amount: number;
    date: string;
    status: 'transferred' | 'processing';
    bankReference: string;
    orderNumber: string;
  }[];
}

export interface CategoryItem {
  id: ProductCategory;
  name: string;
  hindiName: string;
  icon: string;
  bannerImage: string;
  subCategories: {
    name: string;
    hindiName: string;
    image: string;
    itemCount: string;
  }[];
}

export type AppView = 
  | 'home'
  | 'categories'
  | 'mall'
  | 'orders'
  | 'account'
  | 'product_detail'
  | 'cart'
  | 'address_selection'
  | 'payment'
  | 'order_success'
  | 'order_tracking'
  | 'resell_desk'
  | 'wishlist'
  | 'search_modal';
