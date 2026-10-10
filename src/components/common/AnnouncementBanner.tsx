import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Megaphone, AlertTriangle, CheckCircle, Info, X, ChevronRight } from 'lucide-react';

export const AnnouncementBanner: React.FC = () => {
  const { settings } = useData();
  const { currentUser } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  const announcement = settings.announcement;

  if (!announcement || !announcement.is_active || isDismissed) {
    return null;
  }

  // Check audience targeting
  if (announcement.target === 'agents' && currentUser?.role !== 'agent') {
    return null;
  }
  if (announcement.target === 'customers' && currentUser && currentUser.role !== 'customer') {
    return null;
  }

  const getTypeStyles = () => {
    switch (announcement.type) {
      case 'urgent':
        return {
          bg: 'bg-red-600',
          badgeBg: 'bg-red-800 text-red-100',
          badgeText: 'अति आवश्यक (URGENT)',
          icon: AlertTriangle,
          textColor: 'text-white',
        };
      case 'warning':
        return {
          bg: 'bg-amber-600',
          badgeBg: 'bg-amber-800 text-amber-100',
          badgeText: 'सावधानी (NOTICE)',
          icon: AlertTriangle,
          textColor: 'text-white',
        };
      case 'success':
        return {
          bg: 'bg-emerald-600',
          badgeBg: 'bg-emerald-800 text-emerald-100',
          badgeText: 'विशेष ऑफर (SPECIAL)',
          icon: CheckCircle,
          textColor: 'text-white',
        };
      case 'info':
      default:
        return {
          bg: 'bg-indigo-700',
          badgeBg: 'bg-indigo-900 text-indigo-100',
          badgeText: 'सफ़ारगो सूचना (ANNOUNCEMENT)',
          icon: Megaphone,
          textColor: 'text-white',
        };
    }
  };

  const style = getTypeStyles();
  const IconComponent = style.icon;

  return (
    <aside
      aria-label="Platform Announcement"
      className={`${style.bg} ${style.textColor} shadow-md transition-all duration-300 relative border-b border-white/10`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <IconComponent className="w-4 h-4 text-white" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm min-w-0">
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${style.badgeBg} self-start sm:self-auto`}
            >
              {style.badgeText}
            </span>
            <span className="font-bold truncate sm:overflow-visible">
              {announcement.title}
            </span>
            <span className="hidden md:inline text-white/70">|</span>
            <span className="text-white/90 font-medium text-xs leading-snug line-clamp-2 sm:line-clamp-1">
              {announcement.message}
            </span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setIsDismissed(true)}
          title="बंद करें (Dismiss)"
          className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
