import React from 'react';
import { useShopping } from '../../context/ShoppingContext';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

export const ProductFeed: React.FC = () => {
  const { 
    products, 
    selectedCategory, 
    setSelectedCategory,
    searchQuery, 
    sortBy, 
    setSortBy, 
    t 
  } = useShopping();

  // Filter products by category and search
  const filteredProducts = products.filter((product) => {
    const matchesCategory = 
      selectedCategory === 'all' || product.category === selectedCategory;

    const matchesSearch = 
      !searchQuery ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.fabricOrMaterial.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.dealPrice - b.dealPrice;
    if (sortBy === 'price_desc') return b.dealPrice - a.dealPrice;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.ratingCount - a.ratingCount; // 'popular'
  });

  return (
    <div className="max-w-7xl mx-auto px-3 py-3">
      {/* Feed Header with Sort Options */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#9F2089]" />
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
            {t('आपके लिए चुनिंदा प्रोडक्ट्स', 'Products For You')}
          </h2>
          <span className="text-xs text-gray-500 font-normal">
            ({sortedProducts.length})
          </span>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 shadow-sm">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer pr-1"
          >
            <option value="popular">{t('लोकप्रिय (Popular)', 'Popular')}</option>
            <option value="price_asc">{t('कीमत: कम से ज्यादा', 'Price: Low to High')}</option>
            <option value="price_desc">{t('कीमत: ज्यादा से कम', 'Price: High to Low')}</option>
            <option value="rating">{t('रेटिंग (Rating)', 'Customer Rating')}</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 my-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-pink-50 flex items-center justify-center text-[#9F2089]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-800">
            {t('कोई प्रोडक्ट नहीं मिला', 'No Products Found')}
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            {t('कृपया अन्य कैटेगरी चुनें या सर्च फ़िल्टर रीसेट करें', 'Try switching to another category or clearing your search filters.')}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 bg-[#9F2089] text-white text-xs font-bold rounded-lg shadow hover:bg-pink-800 transition-colors"
          >
            {t('सभी प्रोडक्ट्स देखें', 'View All Products')}
          </button>
        </div>
      )}
    </div>
  );
};
