// Comprehensive Directory of Madhya Pradesh (MP) Districts, Tehsils, Towns, Villages & Boarding Points
// Sourced from India LGD & MP State Transport Network

export interface MPCityInfo {
  name: string;
  hindiName: string;
  district: string;
  hindiDistrict: string;
  isDistrictHeadquarter: boolean;
  division: 'Malwa' | 'Bhopal' | 'Mahakoshal' | 'Gwalior-Chambal' | 'Vindhya-Bundelkhand' | 'Nimar';
  popularBoardingPoints: {
    name: string;
    hindiName: string;
    landmark: string;
    address: string;
  }[];
}

export const MP_LOCATIONS: MPCityInfo[] = [
  // ==========================================
  // 1. INDORE & MALWA DIVISION
  // ==========================================
  {
    name: 'Indore',
    hindiName: 'इंदौर',
    district: 'Indore',
    hindiDistrict: 'इंदौर',
    isDistrictHeadquarter: true,
    division: 'Malwa',
    popularBoardingPoints: [
      { name: 'Sarwate Bus Stand', hindiName: 'सरवटे बस स्टैंड (रेलवे स्टेशन के सामने)', landmark: 'Platform 1 Railway Station', address: 'Opposite Main Railway Station, Chhoti Gwaltoli' },
      { name: 'Navlakha Bus Stand', hindiName: 'नवलखा बस स्टैंड (खंडवा/महाराष्ट्र रूट)', landmark: 'Navlakha Square Overbridge', address: 'AB Road, Near Navlakha Chouraha' },
      { name: 'AICTSL Campus Geeta Bhawan', hindiName: 'एआईसीटीएसएल गीता भवन (चार्टर्ड/वॉल्वो हब)', landmark: 'Geeta Bhawan Square', address: 'Old AICTSL Office, AB Road' },
      { name: 'Vijay Nagar Square / Radisson', hindiName: 'विजयनगर / रेडिसन चौराha (भोपाल/उज्जैन रूट)', landmark: 'Near Radisson Blu Hotel', address: 'Ring Road Crossing, Vijay Nagar' },
      { name: 'Gangwal Bus Stand', hindiName: 'गंगवाल बस स्टैंड (धार/गुजरात रूट)', landmark: 'Gangwal Square', address: 'Near Mhow Naka, Dhar Road' },
      { name: 'Teen Imli Bus Stand', hindiName: 'तीन इमली बस स्टैंड (जबलपुर/सागर रूट)', landmark: 'Teen Imli Square', address: 'Ring Road Bypass Junction' }
    ]
  },
  {
    name: 'Mhow',
    hindiName: 'महू (डॉ. अंबेडकर नगर)',
    district: 'Indore',
    hindiDistrict: 'इंदौर',
    isDistrictHeadquarter: false,
    division: 'Malwa',
    popularBoardingPoints: [
      { name: 'Dreamland Chouraha', hindiName: 'ड्रीमलैंड चौराहा', landmark: 'Dreamland Cinema', address: 'Station Road, Mhow Cantt' },
      { name: 'Mhow Railway Station Stand', hindiName: 'महू रेलवे स्टेशन बस स्टैंड', landmark: 'Main Station Gate', address: 'Railway Station Road' }
    ]
  },
  {
    name: 'Sanwer',
    hindiName: 'सांवेर',
    district: 'Indore',
    hindiDistrict: 'इंदौर',
    isDistrictHeadquarter: false,
    division: 'Malwa',
    popularBoardingPoints: [
      { name: 'Sanwer Main Bus Stand', hindiName: 'सांवेर मुख्य बस स्टैंड', landmark: 'Tehsil Office Gate', address: 'Indore-Ujjain Highway' }
    ]
  },
  {
    name: 'Depalpur',
    hindiName: 'देपालपुर',
    district: 'Indore',
    hindiDistrict: 'इंदौर',
    isDistrictHeadquarter: false,
    division: 'Malwa',
    popularBoardingPoints: [
      { name: 'Depalpur Bus Stand', hindiName: 'देपालपुर पुराना बस स्टैंड', landmark: 'Fawara Chowk', address: 'Main Market Road' }
    ]
  },
  {
    name: 'Pithampur',
    hindiName: 'पीथमपुर (औद्योगिक नगरी)',
    district: 'Dhar',
    hindiDistrict: 'धार',
    isDistrictHeadquarter: false,
    division: 'Malwa',
    popularBoardingPoints: [
      { name: 'Sector 1 Bus Stand', hindiName: 'पीथमपुर सेक्टर-1 बस स्टैंड', landmark: 'Eicher Chouraha', address: 'Main Industrial Area Sector 1' },
      { name: 'Chatrachhaya Square', hindiName: 'छत्रछाया चौराहा', landmark: 'Chatrachhaya Hospital', address: 'Sector 2 Main Highway' },
      { name: 'Rau Bypass Cut', hindiName: 'राऊ-पीथमपुर बायपास कट', landmark: 'Toll Plaza Entry', address: 'Indore-Pithampur 4 Lane Highway' }
    ]
  },
  {
    name: 'Dhar',
    hindiName: 'धार',
    district: 'Dhar',
    hindiDistrict: 'धार',
    isDistrictHeadquarter: true,
    division: 'Malwa',
    popularBoardingPoints: [
      { name: 'Dhar Private Bus Stand', hindiName: 'धार प्राइवेट बस स्टैंड', landmark: 'Trimurti Nagar', address: 'Mandav Road, Dhar' },
      { name: 'Ghoda Choupati Bus Stand', hindiName: 'घोड़ा चौपाटी बस स्टैंड', landmark: 'Historic Horse Statue', address: 'Indore-Ahmedabad Road' }
    ]
  },
  {
    name: 'Manawar',
    hindiName: 'मनावर',
    district: 'Dhar',
    hindiDistrict: 'धार',
    isDistrictHeadquarter: false,
    division: 'Nimar',
    popularBoardingPoints: [
      { name: 'Manawar Bus Stand', hindiName: 'मनावर मुख्य बस स्टैंड', landmark: 'Singhana Road Cut', address: 'Bus Stand Road, Manawar' },
      { name: 'Gandhi Chouraha', hindiName: 'गांधी चौराहा', landmark: 'Post Office', address: 'Main Bazar Road' }
    ]
  },
  {
    name: 'Kukshi',
    hindiName: 'कुक्षी',
    district: 'Dhar',
    hindiDistrict: 'धार',
    isDistrictHeadquarter: false,
    division: 'Nimar',
    popularBoardingPoints: [
      { name: 'Kukshi Bus Stand', hindiName: 'कुक्षी मुख्य बस स्टैंड', landmark: 'Cinema Road', address: 'Barwani-Alirajpur Highway' }
    ]
  },
  {
    name: 'Badnawar',
    hindiName: 'बदनावर',
    district: 'Dhar',
    hindiDistrict: 'धार',
    isDistrictHeadquarter: false,
    division: 'Malwa',
    popularBoardingPoints: [
      { name: 'Badnawar Chouraha', hindiName: 'बदनावर फोरलेन चौराहा', landmark: 'Ratlam-Indore Highway', address: 'Bypass Circle' }
    ]
  },
  {
    name: 'Ujjain',
    hindiName: 'उज्जैन (महाकाल नगरी)',
    district: 'Ujjain',
    hindiDistrict: 'उज्जैन',
    isDistrictHeadquarter: true,
    division: 'Malwa',
    popularBoardingPoints: [
      { name: 'Nanakheda ISBT', hindiName: 'नानाखेड़ा बस स्टैंड (ISBT)', landmark: 'Harifatak Overbridge End', address: 'Indore Road, Nanakheda' },
      { name: 'Dewas Gate Bus Stand', hindiName: 'देवास गेट बस स्टैंड (रेलवे स्टेशन)', landmark: 'Railway Station Front', address: 'Opposite Ujjain Junction Gate' },
      { name: 'Mahakal Mandir Chouraha', hindiName: 'महाकाल मंदिर चौराहा (पिकअप)', landmark: 'Near Triveni Museum', address: 'Mahakal Corridor Road' }
    ]
  },
  {
    name: 'Nagda',
    hindiName: 'नागदा',
    district: 'Ujjain',
    hindiDistrict: 'उज्जैन',
    isDistrictHeadquarter: false,
    division: 'Malwa',
    popularBoardingPoints: [
      { name: 'Nagda Station Stand', hindiName: 'नागदा रेलवे स्टेशन बस स्टैंड', landmark: 'Grasim Birla Gram Gate', address: 'Station Road' }
    ]
  },
  {
    name: 'Dewas',
    hindiName: 'देवास',
    district: 'Dewas',
    hindiDistrict: 'देवास',
    isDistrictHeadquarter: true,
    division: 'Malwa',
    popularBoardingPoints: [
      { name: 'Dewas Main Bus Stand', hindiName: 'देवास मुख्य बस स्टैंड', landmark: 'Sayaji Gate', address: 'Station Road, Dewas' },
      { name: 'Bhopal Chouraha Bypass', hindiName: 'भोपाल चौराहा बायपास', landmark: 'Overbridge Entry', address: 'Indore-Bhopal Corridor' }
    ]
  },

  // ==========================================
  // 2. BHOPAL & CENTRAL DIVISION
  // ==========================================
  {
    name: 'Bhopal',
    hindiName: 'भोपाल (राजधानी)',
    district: 'Bhopal',
    hindiDistrict: 'भोपाल',
    isDistrictHeadquarter: true,
    division: 'Bhopal',
    popularBoardingPoints: [
      { name: 'ISBT Habibganj / Rani Kamlapati', hindiName: 'ISBT हबीबगंज (रानी कमलापति)', landmark: 'Rani Kamlapati Station Gate 3', address: 'Hoshangabad Road, Habibganj' },
      { name: 'Nadra Bus Stand', hindiName: 'नादरा बस स्टैंड (रेलवे स्टेशन प्लेटफॉर्म 6)', landmark: 'Platform 6 Side', address: 'Near Hamidia Road, Bhopal' },
      { name: 'Halalpur Bus Stand', hindiName: 'हलालपुर बस स्टैंड (इंदौर/उज्जैन रूट)', landmark: 'Halalpur Flyover', address: 'Indore-Bhopal Highway Entry' },
      { name: 'Lalghati Chouraha', hindiName: 'लालघाटी चौराहा', landmark: 'Airport Cut / Overbridge', address: 'VIP Road Crossing' },
      { name: 'Board Office Square (MP Nagar)', hindiName: 'बोर्ड ऑफिस चौराहा, एमपी नगर', landmark: 'DB City Mall / Metro Pillar', address: 'MP Nagar Zone 1' }
    ]
  },
  {
    name: 'Sehore',
    hindiName: 'सीहोर',
    district: 'Sehore',
    hindiDistrict: 'सीहोर',
    isDistrictHeadquarter: true,
    division: 'Bhopal',
    popularBoardingPoints: [
      { name: 'Sehore Main Bus Stand', hindiName: 'सीहोर मुख्य बस स्टैंड', landmark: 'Kotwali Chouraha', address: 'Station Road, Sehore' },
      { name: 'Crescent Bypass Highway', hindiName: 'क्रेसेंट वाटर पार्क बायपास', landmark: 'Crescent Resort Cut', address: 'Bhopal-Indore Highway' }
    ]
  },
  {
    name: 'Ashta',
    hindiName: 'आष्टा',
    district: 'Sehore',
    hindiDistrict: 'सीहोर',
    isDistrictHeadquarter: false,
    division: 'Bhopal',
    popularBoardingPoints: [
      { name: 'Ashta Bypass Toll Plaza', hindiName: 'आष्टा बायपास टोल प्लाजा', landmark: 'Highway Toll Gate', address: 'Indore-Bhopal 4-Lane Highway' },
      { name: 'Kannod Road Chouraha', hindiName: 'कन्नौद रोड चौराहा', landmark: 'Pooja Hotel', address: 'Ashta Town Cut' },
      { name: 'Old Bus Stand Ashta', hindiName: 'आष्टा पुराना बस स्टैंड', landmark: 'Main Market Fountain', address: 'Near Municipal Council' }
    ]
  },
  {
    name: 'Shujalpur',
    hindiName: 'शुजालपुर',
    district: 'Shajapur',
    hindiDistrict: 'शाजापुर',
    isDistrictHeadquarter: false,
    division: 'Bhopal',
    popularBoardingPoints: [
      { name: 'Shujalpur Mandi Stand', hindiName: 'शुजालपुर मंडी बस स्टैंड', landmark: 'Railway Station Road', address: 'Near Krishi Upaj Mandi' }
    ]
  },
  {
    name: 'Narmadapuram',
    hindiName: 'नर्मदापुरम (होशंगाबाद)',
    district: 'Narmadapuram',
    hindiDistrict: 'नर्मदापुरम',
    isDistrictHeadquarter: true,
    division: 'Bhopal',
    popularBoardingPoints: [
      { name: 'Sethani Ghat Stand', hindiName: 'सेठानी घाट बस स्टैंड', landmark: 'Meenakshi Chouraha', address: 'Main Road, Narmadapuram' },
      { name: 'Narmada Bridge Naka', hindiName: 'नर्मदा पुल नाका', landmark: 'Old Bridge Entry', address: 'Bhopal-Itarsi Highway' }
    ]
  },
  {
    name: 'Itarsi',
    hindiName: 'इटारसी',
    district: 'Narmadapuram',
    hindiDistrict: 'नर्मदापुरम',
    isDistrictHeadquarter: false,
    division: 'Bhopal',
    popularBoardingPoints: [
      { name: 'Itarsi New Bus Stand', hindiName: 'इटारसी नया बस स्टैंड', landmark: 'Overbridge Circle', address: 'Nagpur Highway Cut' }
    ]
  },
  {
    name: 'Pipariya',
    hindiName: 'पिपरिया (पचमढ़ी गेट)',
    district: 'Narmadapuram',
    hindiDistrict: 'नर्मदापुरम',
    isDistrictHeadquarter: false,
    division: 'Bhopal',
    popularBoardingPoints: [
      { name: 'Pipariya Station Stand', hindiName: 'पिपरिया रेलवे स्टेशन बस स्टैंड', landmark: 'Pachmarhi Road Junction', address: 'Station Road' }
    ]
  },
  {
    name: 'Vidisha',
    hindiName: 'विदिशा',
    district: 'Vidisha',
    hindiDistrict: 'विदिशा',
    isDistrictHeadquarter: true,
    division: 'Bhopal',
    popularBoardingPoints: [
      { name: 'Vidisha Main Bus Stand', hindiName: 'विदिशा मुख्य बस स्टैंड', landmark: 'Neemtal Square', address: 'Station Road, Vidisha' }
    ]
  },
  {
    name: 'Raisen',
    hindiName: 'रायसेन',
    district: 'Raisen',
    hindiDistrict: 'रायसेन',
    isDistrictHeadquarter: true,
    division: 'Bhopal',
    popularBoardingPoints: [
      { name: 'Raisen Bus Stand', hindiName: 'रायसेन सांची रोड स्टैंड', landmark: 'Fort View Point', address: 'Bhopal-Sagar Highway' }
    ]
  },

  // ==========================================
  // 3. NIMAR DIVISION (KHANDWA, KHARGONE, BARWANI)
  // ==========================================
  {
    name: 'Khandwa',
    hindiName: 'खंडवा (किशोर दा नगरी)',
    district: 'Khandwa',
    hindiDistrict: 'खंडवा',
    isDistrictHeadquarter: true,
    division: 'Nimar',
    popularBoardingPoints: [
      { name: 'Makhanlal Chaturvedi Stand', hindiName: 'माखनलाल चतुर्वेदी बस स्टैंड', landmark: 'Anand Nagar Square', address: 'Indore-Khandwa Road' },
      { name: 'Jaswadi Road Bypass', hindiName: 'जसवाड़ी रोड बायपास', landmark: 'Overbridge Entry', address: 'Burhanpur Road' }
    ]
  },
  {
    name: 'Khargone',
    hindiName: 'खरगोन',
    district: 'Khargone',
    hindiDistrict: 'खरगोन',
    isDistrictHeadquarter: true,
    division: 'Nimar',
    popularBoardingPoints: [
      { name: 'Diversion Road Bus Stand', hindiName: 'डायवर्सन रोड बस स्टैंड', landmark: 'Bistan Naka', address: 'Main Bus Stand Road' }
    ]
  },
  {
    name: 'Badwah',
    hindiName: 'बड़वाह (नर्मदा तट)',
    district: 'Khargone',
    hindiDistrict: 'खरगोन',
    isDistrictHeadquarter: false,
    division: 'Nimar',
    popularBoardingPoints: [
      { name: 'Badwah Narmada Stand', hindiName: 'बड़वाह नर्मदा पुल बस स्टैंड', landmark: 'Narmada Bridge Gate', address: 'Indore-Khandwa Highway' }
    ]
  },
  {
    name: 'Sanawad',
    hindiName: 'सनावद (ओंकारेश्वर तीर्थ हब)',
    district: 'Khargone',
    hindiDistrict: 'खरगोन',
    isDistrictHeadquarter: false,
    division: 'Nimar',
    popularBoardingPoints: [
      { name: 'Sanawad Main Square', hindiName: 'सनावद मुख्य चौराहा', landmark: 'Omkareshwar Road Cut', address: 'Khandwa Highway' }
    ]
  },
  {
    name: 'Sendhwa',
    hindiName: 'सेंधवा (महाराष्ट्र बॉर्डर)',
    district: 'Barwani',
    hindiDistrict: 'बड़वानी',
    isDistrictHeadquarter: false,
    division: 'Nimar',
    popularBoardingPoints: [
      { name: 'Sendhwa AB Road Bypass', hindiName: 'सेंधवा एबी रोड बायपास', landmark: 'Bijasan Ghat Cut', address: 'Indore-Mumbai National Highway' }
    ]
  },
  {
    name: 'Barwani',
    hindiName: 'बड़वानी',
    district: 'Barwani',
    hindiDistrict: 'बड़वानी',
    isDistrictHeadquarter: true,
    division: 'Nimar',
    popularBoardingPoints: [
      { name: 'Barwani Central Stand', hindiName: 'बड़वानी सेंट्रल बस स्टैंड', landmark: 'Court Chouraha', address: 'Rajghat Road' }
    ]
  },

  // ==========================================
  // 4. MAHAKOSHAL & VINDHYA DIVISION
  // ==========================================
  {
    name: 'Jabalpur',
    hindiName: 'जबलपुर (संस्कारधानी)',
    district: 'Jabalpur',
    hindiDistrict: 'जबलपुर',
    isDistrictHeadquarter: true,
    division: 'Mahakoshal',
    popularBoardingPoints: [
      { name: 'Deendayal Chowk ISBT', hindiName: 'दीनदयाल चौक ISBT', landmark: 'Damoh Naka Flyover', address: 'ISBT Main Terminal, Jabalpur' },
      { name: 'Russell Chowk', hindiName: 'रसेल चौक (प्राइवेट ट्रेवल्स हब)', landmark: 'Clock Tower', address: 'Civic Centre Road' },
      { name: 'Madan Mahal Square', hindiName: 'मदन महल स्टेशन चौराहा', landmark: 'Railway Station Gate', address: 'Nagpur Highway Cut' }
    ]
  },
  {
    name: 'Sagar',
    hindiName: 'सागर',
    district: 'Sagar',
    hindiDistrict: 'सागर',
    isDistrictHeadquarter: true,
    division: 'Vindhya-Bundelkhand',
    popularBoardingPoints: [
      { name: 'Peeli Kothi Bus Stand', hindiName: 'पीली कोठी बस स्टैंड', landmark: 'Civil Lines Circle', address: 'University Road, Sagar' }
    ]
  },
  {
    name: 'Rewa',
    hindiName: 'रीवा',
    district: 'Rewa',
    hindiDistrict: 'रीवा',
    isDistrictHeadquarter: true,
    division: 'Vindhya-Bundelkhand',
    popularBoardingPoints: [
      { name: 'New Bus Stand (Saman Tiraha)', hindiName: 'न्यू बस स्टैंड (समान तिराहा)', landmark: 'College Chouraha', address: 'Rewa-Allahabad Highway' }
    ]
  },
  {
    name: 'Satna',
    hindiName: 'सतना',
    district: 'Satna',
    hindiDistrict: 'सतना',
    isDistrictHeadquarter: true,
    division: 'Vindhya-Bundelkhand',
    popularBoardingPoints: [
      { name: 'Bharhut Nagar Stand', hindiName: 'भरहुत नगर बस स्टैंड', landmark: 'Panna Naka Overbridge', address: 'Rewa Road, Satna' }
    ]
  },
  {
    name: 'Maihar',
    hindiName: 'मैहर (शारदा माता धाम)',
    district: 'Maihar',
    hindiDistrict: 'मैहर',
    isDistrictHeadquarter: true,
    division: 'Vindhya-Bundelkhand',
    popularBoardingPoints: [
      { name: 'Maa Sharda Bypass Stand', hindiName: 'माँ शारदा मंदिर बायपास स्टैंड', landmark: 'Ropeway Entry Cut', address: 'National Highway 30' }
    ]
  },
  {
    name: 'Katni',
    hindiName: 'कटनी',
    district: 'Katni',
    hindiDistrict: 'कटनी',
    isDistrictHeadquarter: true,
    division: 'Mahakoshal',
    popularBoardingPoints: [
      { name: 'Mission Chowk Stand', hindiName: 'मिशन चौक बस स्टैंड', landmark: 'Railway Station Overbridge', address: 'Jabalpur Bypass Road' }
    ]
  },
  {
    name: 'Chhindwara',
    hindiName: 'छिंदवाड़ा',
    district: 'Chhindwara',
    hindiDistrict: 'छिंदवाड़ा',
    isDistrictHeadquarter: true,
    division: 'Mahakoshal',
    popularBoardingPoints: [
      { name: 'Parasia Road Stand', hindiName: 'परासिया रोड बस स्टैंड', landmark: 'ELC Chowk', address: 'Nagpur Road, Chhindwara' }
    ]
  },

  // ==========================================
  // 5. GWALIOR & CHAMBAL DIVISION
  // ==========================================
  {
    name: 'Gwalior',
    hindiName: 'ग्वालियर (तानसेन नगरी)',
    district: 'Gwalior',
    hindiDistrict: 'ग्वालियर',
    isDistrictHeadquarter: true,
    division: 'Gwalior-Chambal',
    popularBoardingPoints: [
      { name: 'Jhansi Road ISBT', hindiName: 'झांसी रोड ISBT (चेतकपुरी)', landmark: 'Chetakpuri Gate', address: 'Jhansi Highway, Gwalior' },
      { name: 'Padav Chouraha', hindiName: 'पड़ाव चौराहा (दिल्ली/आगरा हब)', landmark: 'Railway Station Platform 1', address: 'Station Road' },
      { name: 'Gola Ka Mandir', hindiName: 'गोला का मंदिर (भिंड/मुरैना रूट)', landmark: 'Chambal Circle', address: 'Airport Road Cut' }
    ]
  },
  {
    name: 'Morena',
    hindiName: 'मुरैना',
    district: 'Morena',
    hindiDistrict: 'मुरैना',
    isDistrictHeadquarter: true,
    division: 'Gwalior-Chambal',
    popularBoardingPoints: [
      { name: 'Barrier Chouraha Stand', hindiName: 'बैरियर चौराहा बस स्टैंड', landmark: 'AB Road Flyover', address: 'Agra-Gwalior Highway' }
    ]
  },
  {
    name: 'Shivpuri',
    hindiName: 'शिवपुरी',
    district: 'Shivpuri',
    hindiDistrict: 'शिवपुरी',
    isDistrictHeadquarter: true,
    division: 'Gwalior-Chambal',
    popularBoardingPoints: [
      { name: 'Madhav Chowk Stand', hindiName: 'माधव चौक बस स्टैंड', landmark: 'Circular Road', address: 'Jhansi-Kota Bypass' }
    ]
  },
  {
    name: 'Guna',
    hindiName: 'गुना',
    district: 'Guna',
    hindiDistrict: 'गुना',
    isDistrictHeadquarter: true,
    division: 'Gwalior-Chambal',
    popularBoardingPoints: [
      { name: 'Ambedkar Chouraha Stand', hindiName: 'अंबेडकर चौराहा बस स्टैंड', landmark: 'Cantt Area', address: 'AB Road Guna' }
    ]
  },
  {
    name: 'Dabra',
    hindiName: 'डबरा',
    district: 'Gwalior',
    hindiDistrict: 'ग्वालियर',
    isDistrictHeadquarter: false,
    division: 'Gwalior-Chambal',
    popularBoardingPoints: [
      { name: 'Dabra Highway Stand', hindiName: 'डबरा हाईवे बस स्टैंड', landmark: 'Sugar Mill Gate', address: 'Gwalior-Jhansi Highway' }
    ]
  }
];

// Major Indian Metros and Hubs for Interstate Routes
export const ALL_INDIA_CITIES = [
  ...MP_LOCATIONS.map(m => m.name),
  'Delhi', 'Jaipur', 'Mumbai', 'Pune', 'Goa', 'Bengaluru', 'Hyderabad', 
  'Ahmedabad', 'Surat', 'Lucknow', 'Varanasi', 'Agra', 'Kanpur', 
  'Chandigarh', 'Manali', 'Shimla', 'Udaipur', 'Kota', 'Nagpur', 'Kolkata'
];
