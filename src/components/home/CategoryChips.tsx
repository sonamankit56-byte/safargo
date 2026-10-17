import React from 'react';
import { 
  Sparkles, 
  Shirt, 
  User, 
  Smile, 
  Home, 
  Heart, 
  Gem, 
  Headphones,
  LayoutGrid
} from 'lucide-react';
import { useShopping } from '../../context/ShoppingContext';

export const CategoryChips: React.FC = () => {
  const { selectedCategory, setSelectedCategory, setCurrentView, t } = useShopping();

  const chips = [
    { id: 'all', name: 'All', hindiName: 'सभी', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'women_ethnic', name: 'Women Ethnic', hindiName: 'विमेंस एथनिक', icon: <Sparkles className="w-4 h-4 text-pink-600" /> },
    { id: 'western_wear', name: 'Western', hindiName: 'वेस्टर्न वियर', icon: <Shirt className="w-4 h-4 text-purple-600" /> },
    { id: 'men_fashion', name: 'Men Fashion', hindiName: 'मेन्स फैशन', icon: <User className="w-4 h-4 text-blue-600" /> },
    { id: 'kids_toys', name: 'Kids & Toys', hindiName: 'किड्स खिलौने', icon: <Smile className="w-4 h-4 text-amber-500" /> },
    { id: 'home_kitchen', name: 'Home & Kitchen', hindiName: 'होम किचन', icon: <Home className="w-4 h-4 text-emerald-600" /> },
    { id: 'beauty_health', name: 'Beauty', hindiName: 'ब्यूटी', icon: <Heart className="w-4 h-4 text-rose-500" /> },
    { id: 'jewellery', name: 'Jewellery', hindiName: 'ज्वैलरी', icon: <Gem className="w-4 h-4 text-yellow-600" /> },
    { id: 'electronics', name: 'Electronics', hindiName: 'गैजेट्स', icon: <Headphones className="w-4 h-4 text-indigo-600" /> },
  ];

  return (
    <div className="bg-white border-b border-gray-100 py-2.5 px-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
        {chips.map((chip) => {
          const isSelected = selectedCategory === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => {
                setSelectedCategory(chip.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 border shrink-0 ${
                isSelected
                  ? 'bg-[#9F2089] text-white border-[#9F2089] shadow-sm'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              <span className={isSelected ? 'text-white' : ''}>{chip.icon}</span>
              <span>{t(chip.hindiName, chip.name)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
