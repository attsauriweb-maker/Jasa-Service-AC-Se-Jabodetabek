import { Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatIDR, SKILLS } from '../types/models';

export function TechniciansView() {
  const { technicians, orders, commissions, users, addTechnician } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skillId, setSkillId] = useState(1);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) return;
    addTechnician({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      skillId,
    });
    setName('');
    setEmail('');
    setPhone('');
    setSkillId(1);
    setModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Field Technicians ({technicians.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active roster, assigned workload, and 20% job completion commissions
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Add Technician</span>
        </button>
      </div>

      {/* Technicians Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                <th className="py-3 px-4">Tech ID</th>
                <th className="py-3 px-4">Name & Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Skill Specialty</th>
                <th className="py-3 px-4 text-right">Active Jobs</th>
                <th className="py-3 px-4 text-right">Completed</th>
                <th className="py-3 px-4 text-right">Earned Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {technicians.map((tech) => {
                const user = users.find((u) => u.id === tech.userId);
                const techOrders = orders.filter((o) => o.technicianId === tech.id);
                const activeCount = techOrders.filter(
                  (o) => o.status === 'Assigned' || o.status === 'In Progress'
                ).length;
                const completedCount = techOrders.filter(
                  (o) => o.status === 'Completed'
                ).length;
                const totalCommission = commissions
                  .filter((c) => c.technicianId === tech.id)
                  .reduce((s, c) => s + c.amount, 0);

                return (
                  <tr key={tech.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500 tabular-nums">
                      #{tech.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 whitespace-nowrap">
                        {tech.name}
                      </div>
                      <div className="text-xs text-slate-500">{user?.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                      {tech.phone}
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {SKILLS[tech.skillId] ?? `Skill #${tech.skillId}`}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900">
                      {activeCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900">
                      {completedCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700 whitespace-nowrap">
                      {formatIDR(totalCommission)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Ledger */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Commission Ledger ({commissions.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatically accrued when an assigned order transitions to Completed
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {commissions.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              No commissions recorded yet. Complete an assigned order to accrue commission.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                    <th className="py-2.5 px-4">Commission ID</th>
                    <th className="py-2.5 px-4">Technician</th>
                    <th className="py-2.5 px-4">Order ID</th>
                    <th className="py-2.5 px-4 text-right">Order Total</th>
                    <th className="py-2.5 px-4 text-right">Commission (20%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {commissions.map((comm) => {
                    const tech = technicians.find((t) => t.id === comm.technicianId);
                    const order = orders.find((o) => o.id === comm.orderId);
                    return (
                      <tr key={comm.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono text-xs text-slate-500 tabular-nums">
                          CM-{String(comm.id).padStart(4, '0')}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-900">
                          {tech?.name ?? `Technician #${comm.technicianId}`}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-xs text-blue-700 tabular-nums">
                          {comm.orderId}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-600">
                          {order ? formatIDR(order.totalAmount) : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                          {formatIDR(comm.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Add Technician Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-tech-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 id="add-tech-title" className="text-base font-semibold text-slate-900">
                Add Field Technician
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hendri Wijaya"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hendri@servicestore.id"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812-0000-0000"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Primary Skill
                </label>
                <select
                  value={skillId}
                  onChange={(e) => setSkillId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {Object.entries(SKILLS).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >
                  Save Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
