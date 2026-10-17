import React from 'react';
import { Star } from 'lucide-react';

interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ 
  rating, 
  reviewCount, 
  size = 'sm',
  showCount = true 
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <div 
        className={`inline-flex items-center gap-1 font-bold rounded-full text-white ${
          rating >= 4.0 ? 'bg-emerald-600' : rating >= 3.0 ? 'bg-amber-600' : 'bg-red-500'
        } ${
          isSm ? 'px-1.5 py-0.5 text-[11px]' : isLg ? 'px-2.5 py-1 text-sm' : 'px-2 py-0.5 text-xs'
        }`}
      >
        <span>{rating.toFixed(1)}</span>
        <Star className={isSm ? 'w-2.5 h-2.5 fill-current' : 'w-3 h-3 fill-current'} />
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-gray-500 text-[11px]">
          ({reviewCount.toLocaleString('en-IN')})
        </span>
      )}
    </div>
  );
};
