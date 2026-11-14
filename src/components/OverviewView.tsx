import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatIDR, OrderStatus, PaymentMethod, SKILLS } from '../types/models';
import { NavSection } from './Sidebar';
import { OrderStatusLabel } from './StatusText';

interface OverviewViewProps {
  onNavigate: (section: NavSection) => void;
  onSelectOrder: (orderId: string) => void;
}

const STATUS_SEQUENCE: OrderStatus[] = [
  'Pending Dispatch',
  'Assigned',
  'In Progress',
  'Completed',
  'Cancelled',
];

const PAYMENT_METHODS: PaymentMethod[] = ['QRIS', 'VA', 'e-Wallet'];

export function OverviewView({ onNavigate, onSelectOrder }: OverviewViewProps) {
  const {
    orders,
    invoices,
    payments,
    warranties,
    technicians,
    customers,
    services,
    commissions,
    spareparts,
  } = useStore();

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'Completed' && o.status !== 'Cancelled'
  ).length;
  const unassignedCount = orders.filter(
    (o) => o.technicianId === null && o.status !== 'Cancelled'
  ).length;
  const settledRevenue = payments
    .filter((p) => p.status === 'Settled')
    .reduce((sum, p) => sum + p.amount, 0);
  const outstandingAmount = invoices
    .filter((i) => i.status === 'Unpaid' || i.status === 'Partial')
    .reduce((sum, i) => {
      const paid = payments
        .filter((p) => p.invoiceId === i.id && p.status === 'Settled')
        .reduce((s, p) => s + p.amount, 0);
      return sum + Math.max(0, i.totalAmount - paid);
    }, 0);

  const lowStockCount = spareparts.filter((p) => p.stock <= 5).length;

  return (
    <div className="space-y-8">
      {/* 4-Column KPI Strip */}
      <section aria-label="Key Operational Metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="p-5">
            <div className="text-xs font-medium text-slate-500">Active Orders</div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
              {activeOrdersCount}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {unassignedCount} pending technician dispatch
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs font-medium text-slate-500">Settled Revenue</div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formatIDR(settledRevenue)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {formatIDR(outstandingAmount)} awaiting settlement
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs font-medium text-slate-500">Active Warranties</div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
              {warranties.length}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              90-day coverage on completed jobs
            </div>
          </div>

          <div className="p-5">
            <div className="text-xs font-medium text-slate-500">Technician Roster</div>
            <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
              {technicians.length}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {lowStockCount} sparepart SKUs at low stock
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Breakdown & Payment Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Dispatch Pipeline by Order Status
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution across {orders.length} total orders
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              <span>Open Dispatch</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-4">
            {STATUS_SEQUENCE.map((status) => {
              const matching = orders.filter((o) => o.status === status);
              const pct = orders.length > 0 ? Math.round((matching.length / orders.length) * 100) : 0;
              const sumAmount = matching.reduce((s, o) => s + o.totalAmount, 0);
              const barColor =
                status === 'Completed'
                  ? 'bg-emerald-600'
                  : status === 'In Progress'
                  ? 'bg-blue-600'
                  : status === 'Pending Dispatch'
                  ? 'bg-amber-500'
                  : status === 'Cancelled'
                  ? 'bg-red-500'
                  : 'bg-slate-600';

              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <OrderStatusLabel status={status} />
                    <div className="font-mono tabular-nums text-slate-600">
                      {matching.length} orders · {formatIDR(sumAmount)}
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-200`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Payment Channels
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Settled volume by method
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('billing')}
                className="text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap"
              >
                Invoices
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {PAYMENT_METHODS.map((method) => {
                const methodPayments = payments.filter(
                  (p) => p.method === method && p.status === 'Settled'
                );
                const total = methodPayments.reduce((s, p) => s + p.amount, 0);
                const share =
                  settledRevenue > 0 ? Math.round((total / settledRevenue) * 100) : 0;

                return (
                  <div key={method} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">{method}</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-900">
                        {formatIDR(total)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
                      <span>{methodPayments.length} transactions</span>
                      <span>{share}% share</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>Total Commissions Accrued</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {formatIDR(commissions.reduce((s, c) => s + c.amount, 0))}
            </span>
          </div>
        </section>
      </div>

      {/* Recent Orders & Technician Load */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Service Orders</h2>
            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              View All Orders
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                  <th className="py-2.5 px-4">Order ID</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Service</th>
                  <th className="py-2.5 px-4">Technician</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {orders.slice(0, 6).map((order) => {
                  const customer = customers.find((c) => c.id === order.customerId);
                  const service = services.find((s) => s.id === order.serviceId);
                  const tech = technicians.find((t) => t.id === order.technicianId);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => {
                        onSelectOrder(order.id);
                        onNavigate('orders');
                      }}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-4 font-mono text-xs font-medium text-blue-700 whitespace-nowrap tabular-nums">
                        {order.id}
                      </td>
                      <td className="py-2.5 px-4 text-slate-900 font-medium whitespace-nowrap">
                        {customer?.name ?? `Customer #${order.customerId}`}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 max-w-[200px] truncate">
                        {service?.name ?? `Service #${order.serviceId}`}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                        {tech ? tech.name : <span className="text-amber-700">Unassigned</span>}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <OrderStatusLabel status={order.status} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums font-medium text-slate-900 whitespace-nowrap">
                        {formatIDR(order.totalAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Technician Workload</h2>
            <button
              type="button"
              onClick={() => onNavigate('technicians')}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              Roster
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {technicians.map((tech) => {
              const activeJobs = orders.filter(
                (o) =>
                  o.technicianId === tech.id &&
                  (o.status === 'Assigned' || o.status === 'In Progress')
              ).length;
              const earned = commissions
                .filter((c) => c.technicianId === tech.id)
                .reduce((s, c) => s + c.amount, 0);

              return (
                <div key={tech.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {tech.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {SKILLS[tech.skillId] ?? `Skill #${tech.skillId}`}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono tabular-nums font-semibold text-slate-900">
                      {activeJobs} active
                    </div>
                    <div className="text-xs font-mono tabular-nums text-slate-500">
                      {formatIDR(earned)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
