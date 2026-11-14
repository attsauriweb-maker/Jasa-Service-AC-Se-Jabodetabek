import { AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { getTodayIso } from '../types/models';

export function WarrantiesView() {
  const { warranties, orders, customers, services } = useStore();
  const [search, setSearch] = useState('');
  const today = getTodayIso();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return warranties;
    return warranties.filter((w) => {
      const order = orders.find((o) => o.id === w.orderId);
      const customer = order
        ? customers.find((c) => c.id === order.customerId)
        : undefined;
      return (
        w.orderId.toLowerCase().includes(q) ||
        (customer?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [warranties, orders, customers, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Service Warranties ({warranties.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            90-day coverage automatically issued upon order completion
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID or customer..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            No matching warranty records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                  <th className="py-3 px-4">Warranty ID</th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Covered Service</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">End Date</th>
                  <th className="py-3 px-4">Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((w) => {
                  const order = orders.find((o) => o.id === w.orderId);
                  const customer = order
                    ? customers.find((c) => c.id === order.customerId)
                    : undefined;
                  const service = order
                    ? services.find((s) => s.id === order.serviceId)
                    : undefined;
                  const isActive = w.endDate >= today;

                  return (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-xs text-slate-500 tabular-nums">
                        WR-{String(w.id).padStart(4, '0')}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-medium text-blue-700 tabular-nums whitespace-nowrap">
                        {w.orderId}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                        {customer?.name ?? '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[240px] truncate">
                        {service?.name ?? '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                        {w.startDate}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                        {w.endDate}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Expired</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
