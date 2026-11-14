import {
  ClipboardList,
  Code2,
  LayoutDashboard,
  Package,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from 'lucide-react';

export type NavSection =
  | 'overview'
  | 'orders'
  | 'technicians'
  | 'catalog'
  | 'billing'
  | 'warranties'
  | 'customers'
  | 'models';

interface SidebarProps {
  activeSection: NavSection;
  onSelect: (section: NavSection) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  pendingCount: number;
  unpaidCount: number;
  onResetDemo: () => void;
}

const NAV_ITEMS: { id: NavSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders & Dispatch', icon: ClipboardList },
  { id: 'technicians', label: 'Technicians', icon: Wrench },
  { id: 'catalog', label: 'Services & Parts', icon: Package },
  { id: 'billing', label: 'Invoices & Payments', icon: Receipt },
  { id: 'warranties', label: 'Warranties', icon: ShieldCheck },
  { id: 'customers', label: 'Customers & Users', icon: Users },
  { id: 'models', label: 'Data Models', icon: Code2 },
];

export function Sidebar({
  activeSection,
  onSelect,
  mobileOpen,
  onCloseMobile,
  pendingCount,
  unpaidCount,
  onResetDemo,
}: SidebarProps) {
  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64">
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 shrink-0">
        <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          Service Store Jakarta
        </span>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-md"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const count =
            item.id === 'orders'
              ? pendingCount
              : item.id === 'billing'
              ? unpaidCount
              : 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-blue-700' : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </span>
              {count > 0 && (
                <span
                  className={`text-xs font-mono tabular-nums shrink-0 ${
                    isActive ? 'text-blue-700 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-3 shrink-0">
        <div className="text-xs text-slate-500 leading-relaxed">
          <div className="font-medium text-slate-700">DKI Jakarta Dispatch</div>
          <div>Raka Pratama · Operations Admin</div>
        </div>
        <button
          type="button"
          onClick={onResetDemo}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Reset Sample Data</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0">{navContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{navContent}</div>
        </div>
      )}
    </>
  );
}
