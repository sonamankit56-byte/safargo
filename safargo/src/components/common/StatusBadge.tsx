import React from 'react';
import { BookingStatus } from '../../lib/types';
import { Clock, CheckCircle2, XCircle, AlertTriangle, RefreshCw, FileText } from 'lucide-react';

interface StatusBadgeProps {
  status: BookingStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }[size];

  switch (status) {
    case 'pending':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          Pending Review
        </span>
      );
    case 'awaiting_operator':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-800 border border-blue-300 ${sizeClasses}`}>
          <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          Awaiting Operator
        </span>
      );
    case 'confirmed':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Confirmed
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-800 border border-rose-300 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );
    case 'cancellation_requested':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-purple-50 text-purple-800 border border-purple-300 ${sizeClasses}`}>
          <FileText className="w-3.5 h-3.5 text-purple-600" />
          Cancel Requested
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-300 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-gray-500" />
          Cancelled
        </span>
      );
    case 'refund_pending':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-yellow-50 text-yellow-800 border border-yellow-300 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-yellow-600" />
          Refund Pending
        </span>
      );
    case 'refunded':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-teal-50 text-teal-800 border border-teal-300 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
          Refunded
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
          {status}
        </span>
      );
  }
};
