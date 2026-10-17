import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  CartItem, 
  DeliveryAddress, 
  Order, 
  ResellerWallet, 
  AppView, 
  PaymentMethod,
  TrackingStep,
  TrackingStatus 
} from '../types';
import { MOCK_PRODUCTS } from '../data/mockData';

interface ShoppingContextType {
  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  navigateBack: () => void;
  navigateToProduct: (product: Product) => void;
  
  // Catalog & Product Selection
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  
  // Search & Filter
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  sortBy: 'popular' | 'price_asc' | 'price_desc' | 'rating';
  setSortBy: (sort: 'popular' | 'price_asc' | 'price_desc' | 'rating') => void;
  
  // Cart & Reseller Operations
  cart: CartItem[];
  addToCart: (product: Product, selectedSize: string, quantity?: number, isResale?: boolean, customerPrice?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, qty: number) => void;
  updateItemSize: (cartItemId: string, size: string) => void;
  setItemResaleMargin: (cartItemId: string, customerPrice: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotalAmount: number;
  cartTotalDiscount: number;
  cartTotalMargin: number;

  // Wishlist
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Checkout & Addresses
  addresses: DeliveryAddress[];
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  addAddress: (address: Omit<DeliveryAddress, 'id'>) => void;
  activeAddress: DeliveryAddress | undefined;

  // Orders & Live Tracking
  orders: Order[];
  latestOrder: Order | null;
  activeTrackingOrder: Order | null;
  placeOrder: (paymentMethod: PaymentMethod) => Order;
  setActiveTrackingOrder: (order: Order | null) => void;

  // Reseller Hub & Wallet
  resellerWallet: ResellerWallet;
  updateBankDetails: (accountNo: string, ifsc: string, upi: string) => void;

  // Multi-Language Toggle
  language: 'hi' | 'en';
  toggleLanguage: () => void;
  t: (hiText: string, enText: string) => string;
}

const DEFAULT_ADDRESSES: DeliveryAddress[] = [
  {
    id: 'addr-01',
    fullName: 'Rahul Sharma',
    phoneNumber: '9876543210',
    houseNo: 'House No. 42, Ward 5',
    roadNameArea: 'Near Ram Mandir, Civil Lines',
    pincode: '452001',
    city: 'Indore',
    state: 'Madhya Pradesh',
    landmark: 'Opposite State Bank ATM',
    addressType: 'Home',
    isDefault: true
  }
];

const DEFAULT_WALLET: ResellerWallet = {
  totalMarginEarned: 1420,
  pendingMargin: 350,
  nextPayoutDate: 'Next Sunday (19 Oct 2026)',
  bankAccountMasked: '•••• •••• •••• 4892',
  bankIfsc: 'SBIN0001428',
  upiIdMasked: 'rahul****@okhdfcbank',
  payoutHistory: [
    {
      id: 'pay-001',
      amount: 680,
      date: '12 Oct 2026',
      status: 'transferred',
      bankReference: 'CMS7492048109',
      orderNumber: 'SFG-892401'
    },
    {
      id: 'pay-002',
      amount: 740,
      date: '05 Oct 2026',
      status: 'transferred',
      bankReference: 'CMS6381048123',
      orderNumber: 'SFG-748190'
    }
  ]
};

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined);

export const ShoppingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation stack
  const [currentView, setCurrentViewInternal] = useState<AppView>('home');
  const [viewHistory, setViewHistory] = useState<AppView[]>(['home']);

  // Selected Product for S04 / S05
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating'>('popular');

  // Multi-Language ('hi' default for authentic Bharat e-commerce feel)
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');

  // Persistence helpers
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_wishlist');
      return saved ? JSON.parse(saved) : ['prod-001', 'prod-007'];
    } catch {
      return ['prod-001', 'prod-007'];
    }
  });

  const [addresses, setAddresses] = useState<DeliveryAddress[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_addresses');
      return saved ? JSON.parse(saved) : DEFAULT_ADDRESSES;
    } catch {
      return DEFAULT_ADDRESSES;
    }
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-01');

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_orders');
      return saved ? JSON.parse(saved) : [
        {
          id: 'ord-initial',
          orderNumber: 'SFG-948192',
          createdAt: '15 Oct 2026, 11:30 AM',
          items: [
            {
              cartItemId: 'item-demo-1',
              product: MOCK_PRODUCTS[0],
              selectedSize: 'Free Size',
              quantity: 1,
              isResale: true,
              customerPrice: 599,
              resellerMargin: 210
            }
          ],
          deliveryAddress: DEFAULT_ADDRESSES[0],
          paymentMethod: 'cod',
          paymentStatus: 'pending_cod',
          productTotal: 389,
          discountTotal: 1110,
          shippingFee: 0,
          extraPrepaidDiscount: 0,
          finalPaidAmount: 389,
          trackingStatus: 'shipped',
          courierPartner: 'Delhivery Surface Logistics',
          trackingNumber: 'DEL9482018401',
          estimatedDeliveryDate: '19 Oct 2026',
          isResellerOrder: true,
          resellerMarginAmount: 210,
          marginStatus: 'pending_delivery',
          trackingSteps: [
            {
              status: 'placed',
              title: 'Order Confirmed',
              hindiTitle: 'ऑर्डर कन्फर्म हुआ',
              description: 'Order placed successfully and received by seller',
              timestamp: '15 Oct, 11:32 AM',
              isCompleted: true,
              isCurrent: false
            },
            {
              status: 'packed',
              title: 'Quality Checked & Packed',
              hindiTitle: 'सफ़रगो चेकिंग व पैकिंग पूरी',
              description: 'Item sanitized and packed in SafarGo neutral tamper-proof bag',
              timestamp: '16 Oct, 03:15 PM',
              isCompleted: true,
              isCurrent: false
            },
            {
              status: 'shipped',
              title: 'Shipped via Delhivery',
              hindiTitle: 'रास्ते में है (Shipped)',
              description: 'Dispatched from Surat Hub. AWB: DEL9482018401',
              timestamp: '17 Oct, 09:40 AM',
              isCompleted: true,
              isCurrent: true
            },
            {
              status: 'out_for_delivery',
              title: 'Out for Delivery',
              hindiTitle: 'डिलीवरी के लिए निकलेगा',
              description: 'Expected to reach nearest Indore delivery hub',
              timestamp: 'Expected 19 Oct',
              isCompleted: false,
              isCurrent: false
            },
            {
              status: 'delivered',
              title: 'Delivered to Customer',
              hindiTitle: 'सफलतापूर्वक डिलीवर होगा',
              description: 'Cash margin of ₹210 will be credited directly to your bank account',
              timestamp: 'Expected 19 Oct, by 07:00 PM',
              isCompleted: false,
              isCurrent: false
            }
          ]
        }
      ];
    } catch {
      return [];
    }
  });

  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  const [resellerWallet, setResellerWallet] = useState<ResellerWallet>(() => {
    try {
      const saved = localStorage.getItem('safargo_wallet');
      return saved ? JSON.parse(saved) : DEFAULT_WALLET;
    } catch {
      return DEFAULT_WALLET;
    }
  });

  // Save to local storage on mutation
  useEffect(() => {
    localStorage.setItem('safargo_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('safargo_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    localStorage.setItem('safargo_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('safargo_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('safargo_wallet', JSON.stringify(resellerWallet));
  }, [resellerWallet]);

  // Navigation controller with history
  const setCurrentView = (view: AppView) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setViewHistory(prev => [...prev, view]);
    setCurrentViewInternal(view);
  };

  const navigateBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (viewHistory.length > 1) {
      const newHistory = [...viewHistory];
      newHistory.pop(); // remove current
      const prevView = newHistory[newHistory.length - 1];
      setViewHistory(newHistory);
      setCurrentViewInternal(prevView);
    } else {
      setCurrentViewInternal('home');
    }
  };

  const navigateToProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product_detail');
  };

  // Cart operations
  const addToCart = (
    product: Product, 
    selectedSize: string, 
    quantity: number = 1,
    isResale: boolean = false,
    customerPrice?: number
  ) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedSize === selectedSize
      );

      const margin = (customerPrice && isResale) 
        ? Math.max(0, customerPrice - (product.dealPrice * quantity)) 
        : 0;

      if (existingIndex > -1) {
        const updated = [...prev];
        const currentQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty,
          isResale: isResale || updated[existingIndex].isResale,
          customerPrice: customerPrice || updated[existingIndex].customerPrice,
          resellerMargin: (customerPrice && isResale) 
            ? Math.max(0, customerPrice - (product.dealPrice * currentQty))
            : updated[existingIndex].resellerMargin
        };
        return updated;
      } else {
        const newItem: CartItem = {
          cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product,
          selectedSize,
          quantity,
          isResale,
          customerPrice,
          resellerMargin: margin
        };
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newMargin = (item.isResale && item.customerPrice)
          ? Math.max(0, item.customerPrice - (item.product.dealPrice * qty))
          : item.resellerMargin;
        return {
          ...item,
          quantity: qty,
          resellerMargin: newMargin
        };
      }
      return item;
    }));
  };

  const updateItemSize = (cartItemId: string, size: string) => {
    setCart(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, selectedSize: size } : item));
  };

  const setItemResaleMargin = (cartItemId: string, customerPrice: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const margin = Math.max(0, customerPrice - (item.product.dealPrice * item.quantity));
        return {
          ...item,
          isResale: true,
          customerPrice,
          resellerMargin: margin
        };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalAmount = cart.reduce((acc, item) => acc + (item.product.dealPrice * item.quantity), 0);
  const cartTotalDiscount = cart.reduce((acc, item) => acc + ((item.product.mrp - item.product.dealPrice) * item.quantity), 0);
  const cartTotalMargin = cart.reduce((acc, item) => acc + (item.resellerMargin || 0), 0);

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlistIds(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  // Address
  const addAddress = (addr: Omit<DeliveryAddress, 'id'>) => {
    const newAddress: DeliveryAddress = {
      ...addr,
      id: `addr-${Date.now()}`
    };
    setAddresses(prev => [newAddress, ...prev.map(a => addr.isDefault ? { ...a, isDefault: false } : a)]);
    setSelectedAddressId(newAddress.id);
  };

  const activeAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  // Order Placement
  const placeOrder = (paymentMethod: PaymentMethod): Order => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    const deliveryDateObj = new Date();
    deliveryDateObj.setDate(deliveryDateObj.getDate() + 4);
    const estimatedDelivery = deliveryDateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const orderNum = `SFG-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNum = `DEL${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    
    // Prepaid extra discount incentive
    const prepaidDiscount = paymentMethod === 'upi' ? 25 : paymentMethod === 'card' ? 20 : 0;
    const finalAmount = Math.max(0, cartTotalAmount - prepaidDiscount);

    const hasResaleItems = cart.some(i => i.isResale && (i.resellerMargin || 0) > 0);
    const totalMargin = cartTotalMargin;

    const trackingSteps: TrackingStep[] = [
      {
        status: 'placed',
        title: 'Order Placed & Confirmed',
        hindiTitle: 'ऑर्डर कन्फर्म हुआ',
        description: `Order #${orderNum} confirmed with SafarGo Verified Seller`,
        timestamp: 'Just now',
        isCompleted: true,
        isCurrent: true
      },
      {
        status: 'packed',
        title: 'Packaging & Quality Check',
        hindiTitle: 'सफ़रगो चेकिंग व पैकिंग',
        description: hasResaleItems 
          ? 'Packed in SafarGo neutral packaging without any price tags or Meesho branding'
          : 'Packed safely in tamper-proof bubble mailer',
        timestamp: 'Within 24 Hours',
        isCompleted: false,
        isCurrent: false
      },
      {
        status: 'shipped',
        title: 'Shipped with Express Courier',
        hindiTitle: 'रास्ते में है (Shipped)',
        description: `Delhivery Air Express. AWB: ${trackingNum}`,
        timestamp: 'Expected Tomorrow',
        isCompleted: false,
        isCurrent: false
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        hindiTitle: 'डिलीवरी के लिए निकलेगा',
        description: `Courier partner will call on ${activeAddress?.phoneNumber}`,
        timestamp: `Expected ${estimatedDelivery}`,
        isCompleted: false,
        isCurrent: false
      },
      {
        status: 'delivered',
        title: 'Delivered',
        hindiTitle: 'डिलीवर होगा',
        description: hasResaleItems 
          ? `Cash margin of ₹${totalMargin} will be transferred to your Bank/UPI on Sunday`
          : '7-day easy return window opens upon delivery',
        timestamp: `Expected ${estimatedDelivery}`,
        isCompleted: false,
        isCurrent: false
      }
    ];

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      createdAt: formattedDate,
      items: [...cart],
      deliveryAddress: activeAddress || DEFAULT_ADDRESSES[0],
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending_cod' : 'paid',
      productTotal: cartTotalAmount,
      discountTotal: cartTotalDiscount,
      shippingFee: 0,
      extraPrepaidDiscount: prepaidDiscount,
      finalPaidAmount: finalAmount,
      trackingStatus: 'placed',
      trackingSteps,
      estimatedDeliveryDate: estimatedDelivery,
      courierPartner: 'Delhivery Express Surface',
      trackingNumber: trackingNum,
      isResellerOrder: hasResaleItems,
      resellerMarginAmount: totalMargin,
      marginStatus: hasResaleItems ? 'pending_delivery' : 'none'
    };

    setOrders(prev => [newOrder, ...prev]);
    setLatestOrder(newOrder);

    // If reseller margin earned, add to wallet pending balance
    if (hasResaleItems && totalMargin > 0) {
      setResellerWallet(prev => ({
        ...prev,
        pendingMargin: prev.pendingMargin + totalMargin
      }));
    }

    // Clear cart after successful order
    clearCart();

    return newOrder;
  };

  const updateBankDetails = (accountNo: string, ifsc: string, upi: string) => {
    const masked = accountNo ? `•••• •••• •••• ${accountNo.slice(-4)}` : undefined;
    const maskedUpi = upi ? `${upi.slice(0, 3)}****@${upi.split('@')[1] || 'upi'}` : undefined;
    setResellerWallet(prev => ({
      ...prev,
      bankAccountMasked: masked || prev.bankAccountMasked,
      bankIfsc: ifsc || prev.bankIfsc,
      upiIdMasked: maskedUpi || prev.upiIdMasked
    }));
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'hi' ? 'en' : 'hi');
  };

  const t = (hiText: string, enText: string) => {
    return language === 'hi' ? hiText : enText;
  };

  return (
    <ShoppingContext.Provider
      value={{
        currentView,
        setCurrentView,
        navigateBack,
        navigateToProduct,
        products: MOCK_PRODUCTS,
        selectedProduct,
        setSelectedProduct,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemSize,
        setItemResaleMargin,
        clearCart,
        cartCount,
        cartTotalAmount,
        cartTotalDiscount,
        cartTotalMargin,
        wishlistIds,
        toggleWishlist,
        isWishlisted,
        addresses,
        selectedAddressId,
        setSelectedAddressId,
        addAddress,
        activeAddress,
        orders,
        latestOrder,
        activeTrackingOrder,
        placeOrder,
        setActiveTrackingOrder,
        resellerWallet,
        updateBankDetails,
        language,
        toggleLanguage,
        t
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShopping = () => {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error('useShopping must be used within a ShoppingProvider');
  }
  return context;
};
