import {
  AlertCircle,
  CheckCircle2,
  Clock,
  PlayCircle,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { InvoiceStatus, OrderStatus, PaymentStatus } from '../types/models';

export function OrderStatusLabel({ status }: { status: OrderStatus }) {
  switch (status) {
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Completed</span>
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 whitespace-nowrap">
          <PlayCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>In Progress</span>
        </span>
      );
    case 'Assigned':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 whitespace-nowrap">
          <UserCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Assigned</span>
        </span>
      );
    case 'Pending Dispatch':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Pending Dispatch</span>
        </span>
      );
    case 'Cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 whitespace-nowrap">
          <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Cancelled</span>
        </span>
      );
  }
}

export function InvoiceStatusLabel({ status }: { status: InvoiceStatus }) {
  switch (status) {
    case 'Paid':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Paid</span>
        </span>
      );
    case 'Partial':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Partial</span>
        </span>
      );
    case 'Unpaid':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 whitespace-nowrap">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Unpaid</span>
        </span>
      );
    case 'Void':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 whitespace-nowrap">
          <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Void</span>
        </span>
      );
  }
}

export function PaymentStatusLabel({ status }: { status: PaymentStatus }) {
  switch (status) {
    case 'Settled':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Settled</span>
        </span>
      );
    case 'Pending':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Pending</span>
        </span>
      );
    case 'Failed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 whitespace-nowrap">
          <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Failed</span>
        </span>
      );
  }
}
