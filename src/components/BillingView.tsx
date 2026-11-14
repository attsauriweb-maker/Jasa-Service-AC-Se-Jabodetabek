import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatIDR, Invoice, InvoiceStatus, PaymentMethod } from '../types/models';
import { InvoiceStatusLabel, PaymentStatusLabel } from './StatusText';

interface BillingViewProps {
  preselectedOrderId?: string | null;
  onClearPreselectedOrder?: () => void;
}

const INVOICE_FILTERS: ('All' | InvoiceStatus)[] = [
  'All',
  'Unpaid',
  'Partial',
  'Paid',
  'Void',
];

const PAYMENT_METHODS: PaymentMethod[] = ['QRIS', 'VA', 'e-Wallet'];

export function BillingView({
  preselectedOrderId,
  onClearPreselectedOrder,
}: BillingViewProps) {
  const { invoices, payments, orders, customers, recordPayment } = useStore();
  const [filter, setFilter] = useState<'All' | InvoiceStatus>('All');
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('QRIS');
  const [amountInput, setAmountInput] = useState<string>('');

  const getPaidForInvoice = (invoiceId: number) =>
    payments
      .filter((p) => p.invoiceId === invoiceId && p.status === 'Settled')
      .reduce((s, p) => s + p.amount, 0);

  useEffect(() => {
    if (!preselectedOrderId) return;
    const match = invoices.find((inv) => inv.orderId === preselectedOrderId);
    if (match && (match.status === 'Unpaid' || match.status === 'Partial')) {
      const paid = getPaidForInvoice(match.id);
      const remaining = Math.max(0, match.totalAmount - paid);
      setActiveInvoice(match);
      setAmountInput(String(remaining));
    }
    onClearPreselectedOrder?.();
  }, [preselectedOrderId]);

  const openPaymentModal = (inv: Invoice) => {
    const paid = getPaidForInvoice(inv.id);
    const remaining = Math.max(0, inv.totalAmount - paid);
    setActiveInvoice(inv);
    setMethod('QRIS');
    setAmountInput(String(remaining));
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoice) return;
    const amt = Number(amountInput);
    if (Number.isNaN(amt) || amt <= 0) return;
    recordPayment(activeInvoice.id, method, amt);
    setActiveInvoice(null);
  };

  const filteredInvoices = invoices.filter(
    (inv) => filter === 'All' || inv.status === filter
  );

  return (
    <div className="space-y-8">
      {/* Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
          {INVOICE_FILTERS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilter(opt)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === opt
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-mono tabular-nums">
          Supported channels: QRIS · Virtual Account (VA) · e-Wallet
        </div>
      </div>

      {/* Invoices Table */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Invoices ({filteredInvoices.length})
        </h2>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Billed</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInvoices.map((inv) => {
                  const order = orders.find((o) => o.id === inv.orderId);
                  const customer = order
                    ? customers.find((c) => c.id === order.customerId)
                    : undefined;
                  const paid = getPaidForInvoice(inv.id);
                  const balance = Math.max(0, inv.totalAmount - paid);
                  const canPay = inv.status === 'Unpaid' || inv.status === 'Partial';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-900 tabular-nums">
                        INV-{inv.id}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-blue-700 tabular-nums whitespace-nowrap">
                        {inv.orderId}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-medium whitespace-nowrap">
                        {customer?.name ?? '-'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <InvoiceStatusLabel status={inv.status} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 whitespace-nowrap">
                        {formatIDR(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700 whitespace-nowrap">
                        {formatIDR(paid)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                        {formatIDR(balance)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {canPay ? (
                          <button
                            type="button"
                            onClick={() => openPaymentModal(inv)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
                          >
                            Record Payment
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Payments Audit Table */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Payment Transactions ({payments.length})
        </h3>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                  <th className="py-2.5 px-4">Payment ID</th>
                  <th className="py-2.5 px-4">Invoice ID</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono text-xs text-slate-500 tabular-nums">
                      PAY-{String(pay.id).padStart(4, '0')}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-slate-900 tabular-nums">
                      INV-{pay.invoiceId}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {pay.method}
                    </td>
                    <td className="py-2.5 px-4">
                      <PaymentStatusLabel status={pay.status} />
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                      {formatIDR(pay.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Record Payment Modal */}
      {activeInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="record-payment-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 id="record-payment-title" className="text-base font-semibold text-slate-900">
                  Record Payment · INV-{activeInvoice.id}
                </h2>
                <p className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                  Order {activeInvoice.orderId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-5">
              <div>
                <span className="block text-xs font-medium text-slate-700 mb-2">
                  Payment Channel
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`py-2.5 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                        method === m
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Amount Received (IDR)
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  max={Math.max(
                    1000,
                    activeInvoice.totalAmount - getPaidForInvoice(activeInvoice.id)
                  )}
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="mt-1.5 text-xs text-slate-500 font-mono tabular-nums">
                  Remaining balance:{' '}
                  {formatIDR(
                    Math.max(
                      0,
                      activeInvoice.totalAmount - getPaidForInvoice(activeInvoice.id)
                    )
                  )}
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveInvoice(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
