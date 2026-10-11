import { AdminSettings, FeatureVisibilityMode } from '../types';

export interface PlatformFeatureDefinition {
  key: keyof AdminSettings;
  name: string;
  hindiName: string;
  category: 'core' | 'delivery' | 'promoter' | 'marketing' | 'services';
  description: string;
  iconName: string;
}

export const PLATFORM_FEATURE_DEFINITIONS: PlatformFeatureDefinition[] = [
  {
    key: 'feature_bus_booking_mode',
    name: 'Manual Bus Booking & Operator Stock',
    hindiName: 'बस बुकिंग सर्विस (मैन्युअल नेटवर्क)',
    category: 'core',
    description: 'ग्रामीण CSC एजेंटों व यात्रियों के लिए 15-मिनट ऑपरेटर कंफर्मेशन युक्त बस बुकिंग नेटवर्क।',
    iconName: 'Bus'
  },
  {
    key: 'feature_quick_delivery_mode',
    name: '15-Minute Rural Quick Delivery',
    hindiName: '15-मिनट क्विक डिलीवरी (ब्लिंकिट मॉडल)',
    category: 'delivery',
    description: 'छोटे कस्बों (सिरोंज, कुरवाई, लटेरी, चंदेरी) में 5 मिनट दुकान पिकअप व 15 मिनट डिलीवरी सेवा।',
    iconName: 'Bike'
  },
  {
    key: 'feature_promoter_program_mode',
    name: 'Promoting Partner Program (5 Slots)',
    hindiName: 'प्रमोटिंग पार्टनर प्रोग्राम (₹15,000 फिक्स्ड)',
    category: 'promoter',
    description: 'सुपर एडमिन के नीचे 5 एक्सक्लूसिव पद, 500 एजेंट लक्ष्य (न्यूनतम 3 बुकिंग), दुकान पैकेज व एजेंट अप्रूवल डेस्क।',
    iconName: 'Award'
  },
  {
    key: 'feature_boarding_sathi_mode',
    name: 'Boarding Sathi Add-On (+₹33)',
    hindiName: 'बोर्डिंग साथी सेवा (+₹33 ऐड-ऑन)',
    category: 'core',
    description: 'बस आने तक एजेंट यात्री के साथ रहेगा व बस में बैठाएगा (एजेंट को ₹23, सफ़ारगो को ₹10 शेयर)।',
    iconName: 'Users'
  },
  {
    key: 'feature_shopkeeper_portal_mode',
    name: 'Local Merchant Shopkeeper Portal',
    hindiName: 'लोकल दुकानदार मर्चेंट पोर्टल',
    category: 'delivery',
    description: 'आस-पास के दुकानदारों की मंथली सब्सक्रिप्शन लिस्टिंग, कैटलॉग प्रोडक्ट्स व इन-स्टॉक टॉगल।',
    iconName: 'Store'
  },
  {
    key: 'feature_customer_portal_mode',
    name: 'Customer Registration & Portal',
    hindiName: 'कस्टमर पोर्टल व पब्लिक रजिस्ट्रेशन',
    category: 'core',
    description: 'यात्रियों के लिए अलग लॉगिन/रजिस्ट्रेशन, ई-टिकट डाउनलोड और क्विक डिलीवरी आर्डर प्लेसमेंट।',
    iconName: 'User'
  },
  {
    key: 'feature_creator_rewards_mode',
    name: 'Viral Creator & Reels Cash Rewards',
    hindiName: 'वायरल क्रिएटर व रील्स प्रमोशन (कैश रिवॉर्ड)',
    category: 'marketing',
    description: 'Instagram रील्स (1M व्यूज = ₹500) व YouTube शॉर्ट्स (10k व्यूज = ₹100) 24-Hour SLA नकद इनाम।',
    iconName: 'Sparkles'
  },
  {
    key: 'feature_promo_codes_mode',
    name: 'Promo Codes & Discount Offers Engine',
    hindiName: 'प्रोमो कोड व डिस्काउंट कूपन इंजन',
    category: 'marketing',
    description: 'एडमिन द्वारा निर्मित स्पेशल प्रोमो कोड्स, फ्लैट डिस्काउंट व एजेंट इंसेंटिव बोनस।',
    iconName: 'Tag'
  },
  {
    key: 'feature_refer_earn_mode',
    name: 'Agent Refer & Earn Program',
    hindiName: 'एजेंट रेफर और कमाएं (₹50 बोनस)',
    category: 'marketing',
    description: 'अन्य सीएससी मित्रों को जोड़ने पर प्रति एजेंट 5 बुकिंग पश्चात ₹50 नकद रेफरल बोनस।',
    iconName: 'Gift'
  },
  {
    key: 'feature_live_tracking_mode',
    name: 'Live PNR & Flipkart-Style Order Tracking',
    hindiName: 'लाइव PNR व डिलीवरी स्टेप ट्रैकिंग',
    category: 'core',
    description: 'PNR नंबर या आर्डर नंबर से लाइव स्टेप-बाय-स्टेप स्थिति व टाइमर ट्रैकिंग।',
    iconName: 'Search'
  },
  {
    key: 'feature_tatkal_service_mode',
    name: 'Tatkal Emergency Bus Assistance',
    hindiName: 'तत्काल / इमरजेंसी बस सहायता',
    category: 'services',
    description: 'अति आवश्यक व तुरंत यात्रा के लिए स्पेशल हेल्पडेस्क WhatsApp बटन।',
    iconName: 'Zap'
  },
  {
    key: 'feature_parcel_service_mode',
    name: 'Bus Parcel & Cargo Booking',
    hindiName: 'बस पार्सल व माल ढुलाई बुकिंग',
    category: 'services',
    description: 'दुकानदारों व ग्रामीणों के लिए बस डिक्की पार्सल बुकिंग सहायता डेस्क।',
    iconName: 'Package'
  },
  {
    key: 'feature_train_enquiry_mode',
    name: 'Railway Waiting Connecting Bus',
    hindiName: 'रेलवे वेटिंग कनेक्टिंग बस पूछताछ',
    category: 'services',
    description: 'ट्रेन कन्फर्म न होने पर रेलवे स्टेशन से आगे के लिए बस विकल्प।',
    iconName: 'Train'
  },
  {
    key: 'feature_hotel_service_mode',
    name: 'Bus Stand Hotel & Dharamshala',
    hindiName: 'होटल व धर्मशाला बुकिंग डेस्क',
    category: 'services',
    description: 'तीर्थ स्थलों व प्रमुख शहरों में यात्रियों के लिए कमरा बुकिंग डेस्क।',
    iconName: 'Building'
  },
  {
    key: 'feature_print_service_mode',
    name: 'CSC Digital Ticket Printing',
    hindiName: 'CSC डिजिटल प्रिंट व लैमिनेशन',
    category: 'services',
    description: 'टिकट व पहचान पत्र कलर प्रिंटिंग सहायता डेस्क।',
    iconName: 'Printer'
  }
];

export const getFeatureMode = (
  settings: AdminSettings | undefined,
  featureKey: string,
  defaultMode: FeatureVisibilityMode = 'active'
): FeatureVisibilityMode => {
  if (!settings) return defaultMode;
  const val = (settings as any)[featureKey];
  if (val === 'active' || val === 'coming_soon' || val === 'hidden') {
    return val;
  }
  // Fallback for legacy boolean properties if matched
  const booleanKey = featureKey.replace('_mode', '');
  const boolVal = (settings as any)[booleanKey];
  if (typeof boolVal === 'boolean') {
    return boolVal ? 'active' : 'hidden';
  }
  return defaultMode;
};

export const isFeatureActive = (settings: AdminSettings | undefined, featureKey: string): boolean => {
  return getFeatureMode(settings, featureKey) === 'active';
};

export const isFeatureComingSoon = (settings: AdminSettings | undefined, featureKey: string): boolean => {
  return getFeatureMode(settings, featureKey) === 'coming_soon';
};

export const isFeatureHidden = (settings: AdminSettings | undefined, featureKey: string): boolean => {
  return getFeatureMode(settings, featureKey) === 'hidden';
};
