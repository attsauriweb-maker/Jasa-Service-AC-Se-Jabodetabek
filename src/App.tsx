import { Menu, Plus } from 'lucide-react';
import { useState } from 'react';
import { BillingView } from './components/BillingView';
import { CatalogView } from './components/CatalogView';
import { CreateOrderModal } from './components/CreateOrderModal';
import { CustomersView } from './components/CustomersView';
import { ModelsSchemaView } from './components/ModelsSchemaView';
import { OrdersView } from './components/OrdersView';
import { OverviewView } from './components/OverviewView';
import { NavSection, Sidebar } from './components/Sidebar';
import { TechniciansView } from './components/TechniciansView';
import { WarrantiesView } from './components/WarrantiesView';
import { StoreProvider, useStore } from './context/StoreContext';

const SECTION_TITLES: Record<NavSection, string> = {
  overview: 'Overview',
  orders: 'Orders & Dispatch',
  technicians: 'Technicians & Commissions',
  catalog: 'Services & Spareparts',
  billing: 'Invoices & Payments',
  warranties: 'Warranties',
  customers: 'Customers & Users',
  models: 'Kotlin Data Models',
};

function ConsoleLayout() {
  const { orders, invoices, resetDemoData } = useStore();
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [billingOrderId, setBillingOrderId] = useState<string | null>(null);

  const pendingCount = orders.filter(
    (o) => o.status === 'Pending Dispatch' || o.status === 'Assigned'
  ).length;
  const unpaidCount = invoices.filter(
    (i) => i.status === 'Unpaid' || i.status === 'Partial'
  ).length;

  const handleOpenBillingForOrder = (orderId: string) => {
    setSelectedOrderId(null);
    setBillingOrderId(orderId);
    setActiveSection('billing');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar
        activeSection={activeSection}
        onSelect={setActiveSection}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        pendingCount={pendingCount}
        unpaidCount={unpaidCount}
        onResetDemo={resetDemoData}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar Contract: Breadcrumb on left, primary CTA on right */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-400 hidden sm:inline whitespace-nowrap">
                Service Store Jakarta
              </span>
              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <h1 className="font-semibold text-slate-900 truncate">
                {SECTION_TITLES[activeSection]}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCreateOrderOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>New Order</span>
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeSection === 'overview' && (
            <OverviewView
              onNavigate={setActiveSection}
              onSelectOrder={(orderId) => setSelectedOrderId(orderId)}
            />
          )}
          {activeSection === 'orders' && (
            <OrdersView
              selectedOrderId={selectedOrderId}
              onSelectOrder={setSelectedOrderId}
              onOpenCreateOrder={() => setCreateOrderOpen(true)}
              onOpenBillingForOrder={handleOpenBillingForOrder}
            />
          )}
          {activeSection === 'technicians' && <TechniciansView />}
          {activeSection === 'catalog' && <CatalogView />}
          {activeSection === 'billing' && (
            <BillingView
              preselectedOrderId={billingOrderId}
              onClearPreselectedOrder={() => setBillingOrderId(null)}
            />
          )}
          {activeSection === 'warranties' && <WarrantiesView />}
          {activeSection === 'customers' && <CustomersView />}
          {activeSection === 'models' && <ModelsSchemaView />}
        </main>
      </div>

      <CreateOrderModal
        open={createOrderOpen}
        onClose={() => setCreateOrderOpen(false)}
        onCreated={(order) => {
          setSelectedOrderId(order.id);
          setActiveSection('orders');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ConsoleLayout />
    </StoreProvider>
  );
}
