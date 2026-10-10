import React from 'react';
import { BookingStatus } from '../../types';
import { Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<
    BookingStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    booking_request: {
      label: 'Booking Request',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />,
    },
    awaiting_operator_confirmation: {
      label: 'Awaiting Operator Confirmation',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />,
    },
    confirmed: {
      label: 'Confirmed',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
    },
    expired: {
      label: 'Expired',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />,
    },
    cancellation_requested: {
      label: 'Cancellation Requested',
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      icon: <Clock className="w-3.5 h-3.5 text-purple-600" />,
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200',
      icon: <Ban className="w-3.5 h-3.5 text-gray-500" />,
    },
  };

  const config = configs[status] || configs.booking_request;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
