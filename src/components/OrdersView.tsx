import { MapPin, Phone, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatIDR, OrderStatus, SKILLS } from '../types/models';
import { InvoiceStatusLabel, OrderStatusLabel } from './StatusText';

interface OrdersViewProps {
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string | null) => void;
  onOpenCreateOrder: () => void;
  onOpenBillingForOrder: (orderId: string) => void;
}

const FILTER_OPTIONS: ('All' | OrderStatus)[] = [
  'All',
  'Pending Dispatch',
  'Assigned',
  'In Progress',
  'Completed',
  'Cancelled',
];

export function OrdersView({
  selectedOrderId,
  onSelectOrder,
  onOpenCreateOrder,
  onOpenBillingForOrder,
}: OrdersViewProps) {
  const {
    orders,
    customers,
    technicians,
    services,
    invoices,
    payments,
    warranties,
    commissions,
    assignTechnician,
    updateOrderStatus,
  } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== 'All' && order.status !== statusFilter) return false;
      if (!q) return true;
      const customer = customers.find((c) => c.id === order.customerId);
      const tech = technicians.find((t) => t.id === order.technicianId);
      const service = services.find((s) => s.id === order.serviceId);
      return (
        order.id.toLowerCase().includes(q) ||
        (customer?.name.toLowerCase().includes(q) ?? false) ||
        (customer?.address.toLowerCase().includes(q) ?? false) ||
        (tech?.name.toLowerCase().includes(q) ?? false) ||
        (service?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [orders, customers, technicians, services, search, statusFilter]);

  const activeOrder = selectedOrderId
    ? orders.find((o) => o.id === selectedOrderId) ?? null
    : null;
  const activeCustomer = activeOrder
    ? customers.find((c) => c.id === activeOrder.customerId)
    : undefined;
  const activeService = activeOrder
    ? services.find((s) => s.id === activeOrder.serviceId)
    : undefined;
  const activeInvoice = activeOrder
    ? invoices.find((i) => i.orderId === activeOrder.id)
    : undefined;
  const activePayments = activeInvoice
    ? payments.filter((p) => p.invoiceId === activeInvoice.id)
    : [];
  const activeWarranty = activeOrder
    ? warranties.find((w) => w.orderId === activeOrder.id)
    : undefined;
  const activeCommission = activeOrder
    ? commissions.find((c) => c.orderId === activeOrder.id)
    : undefined;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setStatusFilter(opt)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === opt
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SSJ ID, customer, area..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <p className="text-sm font-medium text-slate-900">No matching orders found</p>
            <p className="text-xs text-slate-500 mt-1">
              Adjust your search filter or create a new dispatch order.
            </p>
            <button
              type="button"
              onClick={onOpenCreateOrder}
              className="mt-4 px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Create First Order
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer & Area</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4">Invoice</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredOrders.map((order) => {
                  const customer = customers.find((c) => c.id === order.customerId);
                  const tech = technicians.find((t) => t.id === order.technicianId);
                  const service = services.find((s) => s.id === order.serviceId);
                  const invoice = invoices.find((i) => i.orderId === order.id);
                  const isSelected = activeOrder?.id === order.id;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-blue-700 whitespace-nowrap tabular-nums">
                        {order.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 whitespace-nowrap">
                          {customer?.name ?? `Customer #${order.customerId}`}
                        </div>
                        <div className="text-xs text-slate-500 max-w-[240px] truncate">
                          {customer?.address}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-[220px] truncate">
                        {service?.name ?? `Service #${order.serviceId}`}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {tech ? (
                          <span className="text-slate-900">{tech.name}</span>
                        ) : (
                          <span className="text-amber-700 font-medium text-xs">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <OrderStatusLabel status={order.status} />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {invoice ? (
                          <InvoiceStatusLabel status={invoice.status} />
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                        {formatIDR(order.totalAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Order Detail & Dispatch Drawer */}
      {activeOrder && (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div
            className="fixed inset-0"
            onClick={() => onSelectOrder(null)}
            aria-hidden="true"
          />
          <aside
            className="relative z-10 w-full max-w-lg bg-white border-l border-slate-200 h-full flex flex-col overflow-hidden"
            aria-label="Order Dispatch Details"
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <div className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                  {activeOrder.id}
                </div>
                <div className="mt-1">
                  <OrderStatusLabel status={activeOrder.status} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
                aria-label="Close order details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer Info */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-500">Customer</h3>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="text-sm font-semibold text-slate-900">
                    {activeCustomer?.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-mono tabular-nums">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{activeCustomer?.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{activeCustomer?.address}</span>
                  </div>
                </div>
              </section>

              {/* Service & Amount */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-500">Service Scope</h3>
                <div className="p-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {activeService?.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Base rate: {formatIDR(activeService?.price ?? 0)} ({activeService?.unit})
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums font-bold text-slate-900">
                    {formatIDR(activeOrder.totalAmount)}
                  </div>
                </div>
              </section>

              {/* Dispatch Technician */}
              <section className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500">
                  Assigned Technician
                </label>
                <select
                  value={activeOrder.technicianId ?? ''}
                  onChange={(e) =>
                    assignTechnician(
                      activeOrder.id,
                      e.target.value === '' ? null : Number(e.target.value)
                    )
                  }
                  disabled={activeOrder.status === 'Completed' || activeOrder.status === 'Cancelled'}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">Unassigned (Pending Dispatch)</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {SKILLS[t.skillId]}
                    </option>
                  ))}
                </select>
              </section>

              {/* Workflow Status Actions */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-500">
                  Update Dispatch Workflow
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['Pending Dispatch', 'Assigned', 'In Progress', 'Completed'] as OrderStatus[]).map(
                    (st) => {
                      const isCurrent = activeOrder.status === st;
                      const needsTech =
                        (st === 'Assigned' || st === 'In Progress' || st === 'Completed') &&
                        activeOrder.technicianId === null;
                      return (
                        <button
                          key={st}
                          type="button"
                          disabled={isCurrent || needsTech || activeOrder.status === 'Cancelled'}
                          onClick={() => updateOrderStatus(activeOrder.id, st)}
                          className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                            isCurrent
                              ? 'bg-blue-700 text-white border-blue-700'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-40'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    }
                  )}
                </div>
                {activeOrder.technicianId === null && activeOrder.status !== 'Cancelled' && (
                  <p className="text-xs text-amber-700">
                    Assign a technician above before advancing to Assigned, In Progress, or Completed.
                  </p>
                )}
                {activeOrder.status !== 'Completed' && activeOrder.status !== 'Cancelled' && (
                  <button
                    type="button"
                    onClick={() => updateOrderStatus(activeOrder.id, 'Cancelled')}
                    className="w-full mt-2 px-3 py-2 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </section>

              {/* Linked Invoice & Payments */}
              {activeInvoice && (
                <section className="space-y-2 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-500">
                      Invoice #{activeInvoice.id}
                    </h3>
                    <InvoiceStatusLabel status={activeInvoice.status} />
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Billed Amount</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-900">
                        {formatIDR(activeInvoice.totalAmount)}
                      </span>
                    </div>
                    {activePayments.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 space-y-1.5">
                        {activePayments.map((pay) => (
                          <div
                            key={pay.id}
                            className="flex items-center justify-between text-xs text-slate-600"
                          >
                            <span>
                              Payment #{pay.id} · {pay.method}
                            </span>
                            <span className="font-mono tabular-nums text-emerald-700 font-medium">
                              {formatIDR(pay.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {(activeInvoice.status === 'Unpaid' ||
                      activeInvoice.status === 'Partial') && (
                      <button
                        type="button"
                        onClick={() => onOpenBillingForOrder(activeOrder.id)}
                        className="w-full px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
                      >
                        Record Payment (QRIS / VA / e-Wallet)
                      </button>
                    )}
                  </div>
                </section>
              )}

              {/* Auto-Issued Warranty & Commission */}
              {(activeWarranty || activeCommission) && (
                <section className="space-y-2 pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-semibold text-slate-500">
                    Completion Records
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeWarranty && (
                      <div className="p-3.5 border border-slate-200 rounded-lg">
                        <div className="text-xs text-slate-500">
                          Warranty #{activeWarranty.id}
                        </div>
                        <div className="mt-1 text-xs font-mono tabular-nums font-medium text-slate-900">
                          {activeWarranty.startDate} to {activeWarranty.endDate}
                        </div>
                      </div>
                    )}
                    {activeCommission && (
                      <div className="p-3.5 border border-slate-200 rounded-lg">
                        <div className="text-xs text-slate-500">
                          Tech Commission #{activeCommission.id}
                        </div>
                        <div className="mt-1 text-sm font-mono tabular-nums font-semibold text-emerald-700">
                          {formatIDR(activeCommission.amount)}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
