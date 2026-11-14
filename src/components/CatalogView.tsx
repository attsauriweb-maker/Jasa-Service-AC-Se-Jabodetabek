import { AlertTriangle, Minus, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES, formatIDR } from '../types/models';

export function CatalogView() {
  const {
    services,
    spareparts,
    adjustSparepartStock,
    addService,
    addSparepart,
  } = useStore();

  const [tab, setTab] = useState<'services' | 'spareparts'>('services');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState(1);
  const [itemPrice, setItemPrice] = useState('');
  const [serviceUnit, setServiceUnit] = useState('per unit');
  const [partStock, setPartStock] = useState('10');

  const filteredServices = services.filter(
    (s) => categoryFilter === 'all' || s.categoryId === categoryFilter
  );
  const filteredParts = spareparts.filter(
    (p) => categoryFilter === 'all' || p.categoryId === categoryFilter
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(itemPrice);
    if (!itemName.trim() || Number.isNaN(numericPrice) || numericPrice <= 0) return;

    if (tab === 'services') {
      addService({
        categoryId: itemCategory,
        name: itemName.trim(),
        price: numericPrice,
        unit: serviceUnit.trim() || 'per unit',
      });
    } else {
      addSparepart({
        categoryId: itemCategory,
        name: itemName.trim(),
        price: numericPrice,
        stock: Math.max(0, Number(partStock) || 0),
      });
    }

    setItemName('');
    setItemPrice('');
    setPartStock('10');
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
            <button
              type="button"
              onClick={() => setTab('services')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                tab === 'services'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Services ({services.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('spareparts')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                tab === 'spareparts'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Spareparts ({spareparts.length})
            </button>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value === 'all' ? 'all' : Number(e.target.value)
              )
            }
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORIES).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{tab === 'services' ? 'Add Service' : 'Add Sparepart'}</span>
        </button>
      </div>

      {/* Tables */}
      {tab === 'services' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Service Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Billing Unit</th>
                  <th className="py-3 px-4 text-right">Standard Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500 tabular-nums">
                      SRV-{String(srv.id).padStart(3, '0')}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {srv.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {CATEGORIES[srv.categoryId] ?? `Category #${srv.categoryId}`}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                      {srv.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                      {formatIDR(srv.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Sparepart Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Stock Level</th>
                  <th className="py-3 px-4 text-right">Adjust Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredParts.map((part) => {
                  const isLow = part.stock <= 5;
                  return (
                    <tr key={part.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-xs text-slate-500 tabular-nums">
                        PRT-{String(part.id).padStart(3, '0')}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {part.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {CATEGORIES[part.categoryId] ?? `Category #${part.categoryId}`}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                        {formatIDR(part.price)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-end gap-1.5 font-mono tabular-nums text-xs font-semibold ${
                            part.stock === 0
                              ? 'text-red-700'
                              : isLow
                              ? 'text-amber-700'
                              : 'text-slate-900'
                          }`}
                        >
                          {isLow && (
                            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                          <span>
                            {part.stock} {part.stock === 0 ? 'Out of stock' : isLow ? 'Low' : 'units'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => adjustSparepartStock(part.id, -1)}
                            disabled={part.stock === 0}
                            className="w-7 h-7 inline-flex items-center justify-center border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                            aria-label={`Decrease stock for ${part.name}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustSparepartStock(part.id, 1)}
                            className="w-7 h-7 inline-flex items-center justify-center border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100"
                            aria-label={`Increase stock for ${part.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Service / Sparepart Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalog-modal-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 id="catalog-modal-title" className="text-base font-semibold text-slate-900">
                {tab === 'services' ? 'Add Service Item' : 'Add Sparepart SKU'}
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {tab === 'services' ? 'Service Name' : 'Sparepart Name'}
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder={
                    tab === 'services'
                      ? 'e.g. Bongkar Pasang AC Split 1 PK'
                      : 'e.g. Fan Motor Indoor AC Universal'
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {Object.entries(CATEGORIES).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Price (IDR)
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={500}
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="250000"
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                {tab === 'services' ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Billing Unit
                    </label>
                    <input
                      type="text"
                      required
                      value={serviceUnit}
                      onChange={(e) => setServiceUnit(e.target.value)}
                      placeholder="per unit"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={partStock}
                      onChange={(e) => setPartStock(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
