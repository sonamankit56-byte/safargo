import { Product } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    title: 'Kashvi Pretty Sarees - Pure Banarasi Soft Silk Woven Saree With Unstitched Blouse Piece',
    hindiTitle: 'काशी प्रीति साड़ियां - शुद्ध बनारसी सिल्क साड़ी ब्लाउज पीस के साथ',
    category: 'women_ethnic',
    categoryName: 'Women Ethnic',
    subCategory: 'Sarees',
    dealPrice: 389,
    mrp: 1499,
    discountPercent: 74,
    rating: 4.3,
    ratingCount: 3840,
    reviewCount: 912,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['Free Size'],
    fabricOrMaterial: 'Banarasi Soft Silk',
    color: 'Royal Red & Golden',
    pattern: 'Zari Woven Floral Border',
    freeDelivery: true,
    cashOnDeliveryAvailable: true,
    easyReturnsDays: 7,
    isMallProduct: true,
    brandName: 'SafarGo Mall Verified',
    supplierName: 'Varanasi Weaves Pvt Ltd',
    supplierRating: 4.4,
    supplierFollowers: 12400,
    inStock: true,
    description: 'Elevate your festive elegance with this authentic Banarasi soft silk saree featuring intricate golden zari motifs across the body and a heavy pallu. Comes with a matching unstitched blouse piece. Lightweight, comfortable drape perfect for weddings, pujas, and special occasions.',
    specifications: {
      'Saree Length': '5.5 Meters',
      'Blouse Length': '0.8 Meters (Unstitched)',
      'Occasion': 'Festive, Wedding, Party',
      'Care Instructions': 'Dry Clean Only',
      'Weave Type': 'Banarasi Jacquard Woven'
    },
    reviews: [
      {
        id: 'rev-01',
        userName: 'Pooja Sharma',
        userCity: 'Jaipur',
        rating: 5,
        date: '14 Oct 2026',
        comment: 'Bahut hi sundar saree hai! Kapda ekdum soft hai aur zari work heavy lagta hai. Market me 1500 se kam nahi milti!',
        verifiedBuyer: true,
        helpfulCount: 42
      },
      {
        id: 'rev-02',
        userName: 'Sunita Patel',
        userCity: 'Ahmedabad',
        rating: 4,
        date: '11 Oct 2026',
        comment: 'Color exactly photo jaisa hai. Reselling me customer ko deliver karwaya tha, unhe bohot pasand aaya. Good profit!',
        verifiedBuyer: true,
        helpfulCount: 19
      }
    ]
  },
  {
    id: 'prod-002',
    title: 'Aakarsha Alluring Kurtis - Embroidered Rayon Anarkali Kurti with Pocket',
    hindiTitle: 'आकर्षा कुर्ती - एम्ब्रॉयडर्ड रेयॉन अनारकली कुर्ती',
    category: 'women_ethnic',
    categoryName: 'Women Ethnic',
    subCategory: 'Kurtis',
    dealPrice: 299,
    mrp: 899,
    discountPercent: 66,
    rating: 4.2,
    ratingCount: 5210,
    reviewCount: 1140,
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    fabricOrMaterial: '14 Kg Heavy Rayon',
    color: 'Teal Blue & Silver',
    pattern: 'Handwork Thread Embroidery',
    freeDelivery: true,
    cashOnDeliveryAvailable: true,
    easyReturnsDays: 7,
    isMallProduct: false,
    supplierName: 'Surat Fashion Hub',
    supplierRating: 4.1,
    supplierFollowers: 8600,
    inStock: true,
    description: 'Crafted from premium 14-kg rayon, this flared Anarkali kurti offers unmatched comfort with breathable drape. Detailed with fine thread embroidery around the yoke and finished with a convenient side pocket.',
    specifications: {
      'Kurti Length': '46 Inches',
      'Sleeve Length': '3/4 Sleeve',
      'Neck Type': 'Mandarin Collar with Notch',
      'Wash Care': 'Hand Wash or Gentle Machine Wash'
    },
    reviews: [
      {
        id: 'rev-03',
        userName: 'Anjali Verma',
        userCity: 'Lucknow',
        rating: 5,
        date: '15 Oct 2026',
        comment: 'Kapda bahut soft hai aur fitting ekdum perfect hai size M me. Fast delivery mili.',
        verifiedBuyer: true,
        helpfulCount: 28
      }
    ]
  },
  {
    id: 'prod-003',
    title: 'Classy Stylus Men Cotton Blend Solid Slim Fit Casual Shirt',
    hindiTitle: 'क्लासी मेन्स कॉटन स्लिम फिट कैजुअल शर्ट',
    category: 'men_fashion',
    categoryName: 'Men Fashion',
    subCategory: 'Shirts',
    dealPrice: 265,
    mrp: 799,
    discountPercent: 67,
    rating: 4.1,
    ratingCount: 4620,
    reviewCount: 890,
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    fabricOrMaterial: 'Cotton Blend (80% Cotton, 20% Poly)',
    color: 'Olive Green',
    pattern: 'Solid Matte Finish',
    freeDelivery: true,
    cashOnDeliveryAvailable: true,
    easyReturnsDays: 7,
    isMallProduct: true,
    brandName: 'Roadster Urban (Mall)',
    supplierName: 'Tirupur Apparel Mills',
    supplierRating: 4.3,
    supplierFollowers: 15100,
    inStock: true,
    description: 'Clean styling meets day-long comfort. Tailored in a modern slim fit with spread collar, curved hemline, and chest pocket. Resists wrinkles through active workdays.',
    specifications: {
      'Collar': 'Spread Collar',
      'Sleeve': 'Full Sleeves with Roll-up tabs',
      'Closure': 'Button front placket',
      'Fit': 'Slim Fit'
    },
    reviews: [
      {
        id: 'rev-04',
        userName: 'Rahul Yadav',
        userCity: 'Patna',
        rating: 5,
        date: '12 Oct 2026',
        comment: '265 rupaye me best shirt! Office me pehanke gaya sabne tarif ki.',
        verifiedBuyer: true,
        helpfulCount: 34
      }
    ]
  },
  {
    id: 'prod-004',
    title: 'True Wireless Bluetooth Earbuds 5.3 with 45H Playtime & Environmental Noise Cancellation (ENC)',
    hindiTitle: 'ट्रू वायरलेस ईयरबड्स - 45 घंटे बैटरी और डीप बास',
    category: 'electronics',
    categoryName: 'Electronics',
    subCategory: 'Audio & Gadgets',
    dealPrice: 449,
    mrp: 1999,
    discountPercent: 77,
    rating: 4.4,
    ratingCount: 8930,
    reviewCount: 2310,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['One Size'],
    fabricOrMaterial: 'ABS Plastic with Matte Metallic Finish',
    color: 'Midnight Black',
    pattern: 'In-Ear Ergonomic Stem',
    freeDelivery: true,
    cashOnDeliveryAvailable: true,
    easyReturnsDays: 7,
    isMallProduct: true,
    brandName: 'SoundBeat Pro',
    supplierName: 'Alpha Tech Shenzhen & Delhi',
    supplierRating: 4.5,
    supplierFollowers: 32000,
    inStock: true,
    description: 'Experience studio-grade deep bass with 13mm dynamic neodymium drivers. Features dual MEMS mics for crystal clear calling, IPX5 sweat resistance, and instant pair Bluetooth 5.3 connectivity.',
    specifications: {
      'Battery Life': 'Up to 45 Hours with Case',
      'Charging Port': 'Type-C Fast Charge (10 min = 2 hrs)',
      'Bluetooth Version': 'v5.3 Low Latency',
      'Water Resistance': 'IPX5 Splashproof'
    },
    reviews: [
      {
        id: 'rev-05',
        userName: 'Vikas Kumar',
        userCity: 'Bhopal',
        rating: 5,
        date: '16 Oct 2026',
        comment: 'Calling quality and bass dono zabardast hain. Type-C fast charging works super quick.',
        verifiedBuyer: true,
        helpfulCount: 51
      }
    ]
  },
  {
    id: 'prod-005',
    title: 'Glaze Cotton Floral King Size Double Bedsheet with 2 Matching Pillow Covers (90x100 inches)',
    hindiTitle: 'ग्लैज़ कॉटन किंग साइज डबल बेडशीट 2 तकिया कवर के साथ',
    category: 'home_kitchen',
    categoryName: 'Home & Kitchen',
    subCategory: 'Bedding',
    dealPrice: 249,
    mrp: 799,
    discountPercent: 69,
    rating: 4.2,
    ratingCount: 3120,
    reviewCount: 640,
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['Double King (90x100 in)'],
    fabricOrMaterial: 'Glaze Cotton Soft Touch (210 TC)',
    color: 'Floral Indigo Blue',
    pattern: 'Botanical Bloom Print',
    freeDelivery: true,
    cashOnDeliveryAvailable: true,
    easyReturnsDays: 7,
    isMallProduct: false,
    supplierName: 'Panipat Home Tex Corp',
    supplierRating: 4.2,
    supplierFollowers: 9400,
    inStock: true,
    description: 'Breathable, fade-resistant king-size double bedsheet with deep tucks that stay on the mattress without slipping. High thread count glaze cotton provides cool comfort in all seasons.',
    specifications: {
      'Bedsheet Dimensions': '228 cm x 254 cm (90 x 100 in)',
      'Pillow Cover Size': '46 cm x 69 cm (18 x 27 in)',
      'Thread Count': '210 TC',
      'Color Fastness': 'Guaranteed 100% No Bleed'
    },
    reviews: [
      {
        id: 'rev-06',
        userName: 'Rekha Devi',
        userCity: 'Varanasi',
        rating: 4,
        date: '10 Oct 2026',
        comment: 'Wash karne ke baad bhi color nahi nikla. Resell me 499 me bika, seedha 250 margin mila mujhe!',
        verifiedBuyer: true,
        helpfulCount: 23
      }
    ]
  },
  {
    id: 'prod-006',
    title: 'Women Flared High-Rise Stretchable Blue Denim Jeans with 4 Pockets',
    hindiTitle: 'विमेंस फ्लेयर्ड स्ट्रेचेबल ब्लू डेनिम जींस',
    category: 'western_wear',
    categoryName: 'Western Wear',
    subCategory: 'Jeans & Bottoms',
    dealPrice: 349,
    mrp: 1199,
    discountPercent: 71,
    rating: 4.3,
    ratingCount: 4180,
    reviewCount: 780,
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['26', '28', '30', '32', '34'],
    fabricOrMaterial: 'Denim Lycra (98% Cotton, 2% Spandex)',
    color: 'Medium Acid Wash Blue',
    pattern: 'Bell Bottom Flare',
    freeDelivery: true,
    cashOnDeliveryAvailable: true,
    easyReturnsDays: 7,
    isMallProduct: true,
    brandName: 'Tokyo Bella (Mall)',
    supplierName: 'Delhi Jeans Co',
    supplierRating: 4.4,
    supplierFollowers: 17800,
    inStock: true,
    description: 'Vintage wide-leg high rise jeans engineered with stretch Lycra for complete freedom of movement. Accentuates waistline with a sculpted silhouette and reinforced belt loops.',
    specifications: {
      'Waist Rise': 'High Rise',
      'Length': 'Full Length (39 in)',
      'Fly': 'Zipper with Metal Button',
      'Stretch': 'High Stretch'
    },
    reviews: [
      {
        id: 'rev-07',
        userName: 'Simran Kaur',
        userCity: 'Chandigarh',
        rating: 5,
        date: '13 Oct 2026',
        comment: 'Fitting is unbelievable! Feels like Zara quality at SafarGo price.',
        verifiedBuyer: true,
        helpfulCount: 39
      }
    ]
  },
  {
    id: 'prod-007',
    title: 'Traditional Gold Plated Kundan & Pearls Choker Necklace Set with Jhumka Earrings & Maangtikka',
    hindiTitle: 'कुंदन और मोती चोकर नेकलेस सेट झुमके और मांगटीका के साथ',
    category: 'jewellery',
    categoryName: 'Jewellery',
    subCategory: 'Necklace Sets',
    dealPrice: 199,
    mrp: 999,
    discountPercent: 80,
    rating: 4.4,
    ratingCount: 6810,
    reviewCount: 1420,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['Free Size (Adjustable Dori)'],
    fabricOrMaterial: 'Brass Alloy with 22K Micro Gold Polish',
    color: 'Gold & Off-White Pearl',
    pattern: 'Kundan Meenakari Handcraft',
    freeDelivery: true,
    cashOnDeliveryAvailable: true,
    easyReturnsDays: 7,
    isMallProduct: false,
    supplierName: 'Rajkot Royal Jewels',
    supplierRating: 4.5,
    supplierFollowers: 24500,
    inStock: true,
    description: 'Royal Rajasthani Kundan choker necklace accented with lustrous freshwater faux pearls and enamelled reverse meenakari. Comes with matching jhumkas and statement maangtikka in safe velvet gift packaging.',
    specifications: {
      'Closure': 'Adjustable Silk Dori (Thread)',
      'Plating': 'High Micron Gold Plating',
      'Earring Fastening': 'Push Back Post',
      'Includes': '1 Necklace, 2 Earrings, 1 Maangtikka'
    },
    reviews: [
      {
        id: 'rev-08',
        userName: 'Kavita Joshi',
        userCity: 'Udaipur',
        rating: 5,
        date: '08 Oct 2026',
        comment: '199 me itna shandar jewellery set! Photo se bhi jyada chamakdar hai.',
        verifiedBuyer: true,
        helpfulCount: 67
      }
    ]
  },
  {
    id: 'prod-008',
    title: 'Rechargeable Electric USB Mini Garlic & Vegetable Chopper (250ml Wireless Food Processor)',
    hindiTitle: 'इलेक्ट्रिक वायरलेस मिनी गार्लिक एवं वेजीटेबल चॉपर',
    category: 'home_kitchen',
    categoryName: 'Home & Kitchen',
    subCategory: 'Kitchen Appliances',
    dealPrice: 179,
    mrp: 599,
    discountPercent: 70,
    rating: 4.3,
    ratingCount: 9400,
    reviewCount: 2150,
    images: [
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['250 ml'],
    fabricOrMaterial: 'BPA-Free Food Grade Plastic + 304 Stainless Steel Blades',
    color: 'Pastel Mint Green',
    pattern: 'One-Touch Top Button',
    freeDelivery: true,
    cashOnDeliveryAvailable: true,
    easyReturnsDays: 7,
    isMallProduct: true,
    brandName: 'KitchenPro (Mall)',
    supplierName: 'Smart Appliances Hub',
    supplierRating: 4.4,
    supplierFollowers: 19800,
    inStock: true,
    description: 'Chop garlic, ginger, onions, chilies, herbs, and dry fruits in just 10 seconds. Cordless rechargeable battery charges via any USB phone charger. Easy to wash waterproof bowl.',
    specifications: {
      'Capacity': '250 ml',
      'Blades': '3 Sharp Stainless Steel Blades',
      'Battery': '1200 mAh Lithium-ion (35 uses per charge)',
      'Waterproof': 'IPX7 Bowl Washable'
    },
    reviews: [
      {
        id: 'rev-09',
        userName: 'Meena Sharma',
        userCity: 'Agra',
        rating: 5,
        date: '15 Oct 2026',
        comment: 'Daily kitchen me pyaz lahsun ke liye perfect hai. Chhota hai par powerful hai!',
        verifiedBuyer: true,
        helpfulCount: 45
      }
    ]
  },
  {
    id: 'prod-009',
    title: 'Cute Cartoon Print Boys & Girls Cotton Dungaree with Striped Inner T-Shirt Set',
    hindiTitle: 'क्यूट कार्टून प्रिंट बच्चों का कॉटन डंगरी सेट टी-शर्ट के साथ',
    category: 'kids_toys',
    categoryName: 'Kids & Toys',
    subCategory: 'Kids Clothing',
    dealPrice: 229,
    mrp: 699,
    discountPercent: 67,
    rating: 4.3,
    ratingCount: 2840,
    reviewCount: 520,
    images: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['0-6 Months', '6-12 Months', '1-2 Years', '2-3 Years', '3-4 Years'],
    fabricOrMaterial: '100% Bio-Washed Combed Cotton',
    color: 'Mustard Yellow & Navy',
    pattern: 'Bear Embroidery Dungaree',
    freeDelivery: true,
    cashOnDeliveryAvailable: true,
    easyReturnsDays: 7,
    isMallProduct: false,
    supplierName: 'Little Angels Ludhiana',
    supplierRating: 4.3,
    supplierFollowers: 11200,
    inStock: true,
    description: 'Softest breathable cotton designed gently for baby sensitive skin. Adjustable shoulder straps with dual snap buttons and bottom diaper-access snap buttons for easy dressing.',
    specifications: {
      'Package Contents': '1 Dungaree Romper + 1 Soft T-Shirt',
      'Closure': 'Snap Buttons at Crotch & Shoulder',
      'Fabric Safe': 'OEKO-TEX Certified Non-Toxic Dyes'
    },
    reviews: [
      {
        id: 'rev-10',
        userName: 'Priya Mukherjee',
        userCity: 'Kolkata',
        rating: 5,
        date: '11 Oct 2026',
        comment: 'Mere bete par bahut cute lagta hai. Kapda bilkul chubhta nahi.',
        verifiedBuyer: true,
        helpfulCount: 22
      }
    ]
  },
  {
    id: 'prod-010',
    title: 'Matte Liquid Long Stay Lipstick Set of 4 Shades (Waterproof & Smudgeproof 16 Hrs)',
    hindiTitle: 'मैट लिक्विड लिपस्टिक सेट (4 शेड्स) - 16 घंटे वाटरप्रूफ',
    category: 'beauty_health',
    categoryName: 'Beauty & Health',
    subCategory: 'Makeup',
    dealPrice: 169,
    mrp: 649,
    discountPercent: 74,
    rating: 4.2,
    ratingCount: 7600,
    reviewCount: 1820,
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['Pack of 4 (4 x 3.5ml)'],
    fabricOrMaterial: 'Enriched with Vitamin E & Jojoba Oil',
    color: 'Nude, Ruby Red, Mauve, Plum',
    pattern: 'Velvet Matte Finish',
    freeDelivery: true,
    cashOnDeliveryAvailable: true,
    easyReturnsDays: 7,
    isMallProduct: true,
    brandName: 'SafarGo Glam (Mall)',
    supplierName: 'Cosmo Glow Mumbai',
    supplierRating: 4.4,
    supplierFollowers: 28400,
    inStock: true,
    description: 'Intense pigment payoff in a feather-light liquid texture that sets to an infallible transfer-proof matte finish in 60 seconds without drying out your lips.',
    specifications: {
      'Shades Included': '4 Trending Indian Skintone Nudes & Pinks',
      'Formula': 'Paraben-Free, Cruelty-Free 100% Vegan',
      'Stay Duration': '16+ Hours Smudgeproof'
    },
    reviews: [
      {
        id: 'rev-11',
        userName: 'Deepa Saini',
        userCity: 'Delhi',
        rating: 5,
        date: '09 Oct 2026',
        comment: '169 me 4 lipsticks! Colors are superb especially the Mauve shade.',
        verifiedBuyer: true,
        helpfulCount: 38
      }
    ]
  },
  {
    id: 'prod-011',
    title: 'Men Pack of 2 Solid Dry-Fit Sports Gym Track Pants with Zipper Pockets',
    hindiTitle: 'मेन्स पैक ऑफ 2 ड्राई-फिट स्पोर्ट्स ट्रैक पैंट्स',
    category: 'men_fashion',
    categoryName: 'Men Fashion',
    subCategory: 'Track Pants',
    dealPrice: 329,
    mrp: 999,
    discountPercent: 67,
    rating: 4.2,
    ratingCount: 4920,
    reviewCount: 970,
    images: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    fabricOrMaterial: 'Poly-Spandex 4-Way Stretch',
    color: 'Jet Black & Charcoal Grey',
    pattern: 'Athletic Tapered Ankle',
    freeDelivery: true,
    cashOnDeliveryAvailable: true,
    easyReturnsDays: 7,
    isMallProduct: false,
    supplierName: 'Tirupur Active Wear',
    supplierRating: 4.2,
    supplierFollowers: 13900,
    inStock: true,
    description: 'Engineered for morning runs, workouts, and comfortable lounging. Moisture-wicking fabric dries in minutes with deep zippered side pockets that securely hold 6.7-inch smartphones.',
    specifications: {
      'Pocket Type': 'Both sides Heavy Duty Zipper Pockets',
      'Waistband': 'Elasticated with Adjustable Drawstring',
      'Pack': 'Combo of 2 Lower Pants'
    },
    reviews: [
      {
        id: 'rev-12',
        userName: 'Manoj Tiwari',
        userCity: 'Kanpur',
        rating: 4,
        date: '14 Oct 2026',
        comment: 'Gym ke liye badiya hai, dono side chain wali pocket hai mobile nahi girta.',
        verifiedBuyer: true,
        helpfulCount: 30
      }
    ]
  },
  {
    id: 'prod-012',
    title: 'Ultra-Slim Smart Watch with 1.95" HD Display, Bluetooth Calling & SpO2 Heart Rate Monitor',
    hindiTitle: 'अल्ट्रा-स्लिम स्मार्ट वॉच - 1.95 इंच डिस्प्ले एवं कॉलिंग',
    category: 'electronics',
    categoryName: 'Electronics',
    subCategory: 'Smart Watches',
    dealPrice: 599,
    mrp: 2999,
    discountPercent: 80,
    rating: 4.3,
    ratingCount: 11200,
    reviewCount: 3100,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: ['Standard Dial with Silicone Strap'],
    fabricOrMaterial: 'Zinc Alloy Bezel + Food-grade Silicone Strap',
    color: 'Space Grey & Black Strap',
    pattern: 'Curved Bezel Touch Display',
    freeDelivery: true,
    cashOnDeliveryAvailable: true,
    easyReturnsDays: 7,
    isMallProduct: true,
    brandName: 'PulseFit Pro (Mall)',
    supplierName: 'Apex Electronics Hub',
    supplierRating: 4.5,
    supplierFollowers: 41000,
    inStock: true,
    description: 'Make and receive calls directly on your wrist with loud HD speaker and microphone. Features 120+ sports modes, 24/7 heart rate and blood oxygen tracking, custom watch faces, and 7-day battery life.',
    specifications: {
      'Display': '1.95" IPS High Brightness Display (550 Nits)',
      'Calling': 'Bluetooth Calling with Dial Pad & Contacts',
      'Sensors': 'Real-time Heart Rate, SpO2, Sleep Tracker',
      'Battery': '7 Days Standby, Magnetic Charger'
    },
    reviews: [
      {
        id: 'rev-13',
        userName: 'Amit Chauhan',
        userCity: 'Meerut',
        rating: 5,
        date: '17 Oct 2026',
        comment: '600 rupaye me calling smartwatch milna impossible lagta tha, SafarGo ne sach kar dikhaya!',
        verifiedBuyer: true,
        helpfulCount: 74
      }
    ]
  }
];
