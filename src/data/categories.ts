import { CategoryItem } from '../types';

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 'women_ethnic',
    name: 'Women Ethnic',
    hindiName: 'विमेंस एथनिक',
    icon: 'Sparkles',
    bannerImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      {
        name: 'All Sarees',
        hindiName: 'सभी साड़ियां',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
        itemCount: '15,400+ Designs'
      },
      {
        name: 'Kurtis & Kurta Sets',
        hindiName: 'कुर्ती और कुर्ता सेट',
        image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=400&q=80',
        itemCount: '24,200+ Designs'
      },
      {
        name: 'Suits & Dress Materials',
        hindiName: 'सूट और ड्रेस मटेरियल',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
        itemCount: '9,800+ Designs'
      },
      {
        name: 'Lehengas & Ghagras',
        hindiName: 'लहंगे और घाघरा',
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80',
        itemCount: '6,100+ Designs'
      },
      {
        name: 'Blouses & Petticoats',
        hindiName: 'ब्लाउज और पेटीकोट',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
        itemCount: '4,500+ Designs'
      },
      {
        name: 'Dupattas & Shawls',
        hindiName: 'दुपट्टा और शॉल',
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80',
        itemCount: '3,800+ Designs'
      }
    ]
  },
  {
    id: 'western_wear',
    name: 'Western Wear',
    hindiName: 'वेस्टर्न वियर',
    icon: 'Shirt',
    bannerImage: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      {
        name: 'Tops & Tunics',
        hindiName: 'टॉप्स और ट्यूनिक्स',
        image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80',
        itemCount: '18,900+ Designs'
      },
      {
        name: 'Dresses & Jumpsuits',
        hindiName: 'ड्रेस और जंपसूट',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=80',
        itemCount: '12,300+ Designs'
      },
      {
        name: 'Jeans & Jeggings',
        hindiName: 'जींस और जेगिंग्स',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80',
        itemCount: '7,400+ Designs'
      },
      {
        name: 'Nightwear & Loungewear',
        hindiName: 'नाइटवियर और लाउंजवियर',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
        itemCount: '5,200+ Designs'
      }
    ]
  },
  {
    id: 'men_fashion',
    name: 'Men Fashion',
    hindiName: 'मेन्स फैशन',
    icon: 'User',
    bannerImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      {
        name: 'Casual & Formal Shirts',
        hindiName: 'शर्ट्स',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
        itemCount: '16,700+ Styles'
      },
      {
        name: 'T-Shirts & Polos',
        hindiName: 'टी-शर्ट्स',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
        itemCount: '21,000+ Styles'
      },
      {
        name: 'Track Pants & Trousers',
        hindiName: 'लोअर और ट्राउजर्स',
        image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=400&q=80',
        itemCount: '8,400+ Styles'
      },
      {
        name: 'Kurtas & Ethnic Sets',
        hindiName: 'कुर्ता और धोती सेट',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
        itemCount: '4,100+ Styles'
      }
    ]
  },
  {
    id: 'kids_toys',
    name: 'Kids & Toys',
    hindiName: 'किड्स और खिलौने',
    icon: 'Smile',
    bannerImage: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      {
        name: 'Boys Clothing',
        hindiName: 'लड़कों के कपड़े',
        image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=400&q=80',
        itemCount: '11,200+ Products'
      },
      {
        name: 'Girls Frocks & Dresses',
        hindiName: 'लड़कियों की फ्रॉक',
        image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=400&q=80',
        itemCount: '13,500+ Products'
      },
      {
        name: 'Soft Toys & Games',
        hindiName: 'खिलौने और गेम्स',
        image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=400&q=80',
        itemCount: '9,100+ Products'
      }
    ]
  },
  {
    id: 'home_kitchen',
    name: 'Home & Kitchen',
    hindiName: 'होम और किचन',
    icon: 'Home',
    bannerImage: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      {
        name: 'Bedsheets & Curtains',
        hindiName: 'बेडशीट और पर्दे',
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80',
        itemCount: '18,000+ Items'
      },
      {
        name: 'Kitchen Gadgets & Choppers',
        hindiName: 'किचन गैजेट्स व चॉपर',
        image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80',
        itemCount: '14,300+ Items'
      },
      {
        name: 'Storage & Organizers',
        hindiName: 'स्टोरेज डिब्बे',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80',
        itemCount: '7,900+ Items'
      }
    ]
  },
  {
    id: 'beauty_health',
    name: 'Beauty & Health',
    hindiName: 'ब्यूटी व हेल्थ',
    icon: 'Heart',
    bannerImage: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      {
        name: 'Lipsticks & Makeup Kits',
        hindiName: 'मेकअप व लिपस्टिक',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80',
        itemCount: '12,800+ Products'
      },
      {
        name: 'Skincare & Face Serums',
        hindiName: 'स्किनकेयर प्रोडक्ट्स',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
        itemCount: '8,400+ Products'
      }
    ]
  },
  {
    id: 'jewellery',
    name: 'Jewellery',
    hindiName: 'ज्वैलरी',
    icon: 'Gem',
    bannerImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      {
        name: 'Choker & Necklace Sets',
        hindiName: 'नेकलेस व चोकर सेट',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
        itemCount: '22,400+ Designs'
      },
      {
        name: 'Earrings & Jhumkas',
        hindiName: 'झुमके व ईयररिंग्स',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80',
        itemCount: '17,100+ Designs'
      }
    ]
  },
  {
    id: 'electronics',
    name: 'Electronics',
    hindiName: 'इलेक्ट्रॉनिक्स',
    icon: 'Headphones',
    bannerImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      {
        name: 'Bluetooth Earbuds & Neckbands',
        hindiName: 'ईयरबड्स और नैकबैंड',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
        itemCount: '8,600+ Gadgets'
      },
      {
        name: 'Smart Watches & Bands',
        hindiName: 'स्मार्ट वॉच',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
        itemCount: '5,300+ Gadgets'
      }
    ]
  }
];
