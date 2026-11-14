import { Minus, Plus, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatIDR, generateOrderId, Order, SKILLS } from '../types/models';

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (order: Order) => void;
}

export function CreateOrderModal({ open, onClose, onCreated }: CreateOrderModalProps) {
  const { customers, services, spareparts, technicians, orders, createOrder } = useStore();

  const [customerId, setCustomerId] = useState<number>(customers[0]?.id ?? 1);
  const [serviceId, setServiceId] = useState<number>(services[0]?.id ?? 1);
  const [technicianId, setTechnicianId] = useState<string>('');
  const [partQty, setPartQty] = useState<Record<number, number>>({});

  const previewOrderId = useMemo(() => generateOrderId(orders), [orders]);

  const selectedService = services.find((s) => s.id === serviceId);

  const sparepartsTotal = useMemo(() => {
    return spareparts.reduce((sum, part) => {
      const qty = partQty[part.id] ?? 0;
      return sum + part.price * qty;
    }, 0);
  }, [spareparts, partQty]);

  const grandTotal = (selectedService?.price ?? 0) + sparepartsTotal;

  if (!open) return null;

  const updateQty = (partId: number, delta: number, maxStock: number) => {
    setPartQty((prev) => {
      const current = prev[partId] ?? 0;
      const next = Math.max(0, Math.min(maxStock, current + delta));
      return { ...prev, [partId]: next };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createOrder({
      customerId,
      serviceId,
      technicianId: technicianId === '' ? null : Number(technicianId),
      sparepartQuantities: partQty,
    });
    setPartQty({});
    setTechnicianId('');
    onCreated?.(created);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-order-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 id="create-order-title" className="text-base font-semibold text-slate-900">
              Create New Service Order
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
              Order ID: {previewOrderId} · Auto-generates Invoice
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Customer
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Assign Technician (Optional)
              </label>
              <select
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Leave Unassigned (Pending Dispatch)</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {SKILLS[t.skillId] ?? `Skill #${t.skillId}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Primary Service
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {formatIDR(s.price)} ({s.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700">
                Spareparts Add-Ons (Optional)
              </span>
              <span className="text-xs text-slate-500">
                Stock decrements upon creation
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 max-h-52 overflow-y-auto">
              {spareparts.map((part) => {
                const qty = partQty[part.id] ?? 0;
                return (
                  <div
                    key={part.id}
                    className="px-3.5 py-2.5 flex items-center justify-between gap-4 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">
                        {part.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono tabular-nums">
                        {formatIDR(part.price)} · Stock: {part.stock}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQty(part.id, -1, part.stock)}
                        disabled={qty === 0}
                        className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        aria-label={`Decrease quantity for ${part.name}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-mono tabular-nums text-slate-900">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(part.id, 1, part.stock)}
                        disabled={qty >= part.stock}
                        className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        aria-label={`Increase quantity for ${part.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Order & Invoice Total</div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                {formatIDR(grandTotal)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap"
              >
                Create Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
