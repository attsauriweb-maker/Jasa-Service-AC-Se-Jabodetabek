// Direct TypeScript representations of com.servicestore.jakarta.data.model

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
}

export interface Customer {
  id: number;
  userId: number;
  name: string;
  phone: string;
  address: string;
}

export interface Technician {
  id: number;
  userId: number;
  name: string;
  phone: string;
  skillId: number;
}

export interface Service {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  unit: string;
}

export interface Sparepart {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  stock: number;
}

export type OrderStatus =
  | 'Pending Dispatch'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export interface Order {
  id: string; // format: SSJ-YYYYMMDD-XXXX
  customerId: number;
  technicianId: number | null;
  serviceId: number;
  status: OrderStatus;
  totalAmount: number;
}

export type InvoiceStatus = 'Unpaid' | 'Partial' | 'Paid' | 'Void';

export interface Invoice {
  id: number;
  orderId: string;
  totalAmount: number;
  status: InvoiceStatus;
}

export type PaymentMethod = 'QRIS' | 'VA' | 'e-Wallet';
export type PaymentStatus = 'Pending' | 'Settled' | 'Failed';

export interface Payment {
  id: number;
  invoiceId: number;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
}

export interface Warranty {
  id: number;
  orderId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface Commission {
  id: number;
  technicianId: number;
  orderId: string;
  amount: number;
}

// Lookup metadata for normalized foreign keys (role_id, skill_id, category_id)
export const ROLES: Record<number, string> = {
  1: 'Operations Admin',
  2: 'Dispatch Coordinator',
  3: 'Field Technician',
  4: 'Customer',
};

export const SKILLS: Record<number, string> = {
  1: 'HVAC & Split AC',
  2: 'Home Appliances & Washing',
  3: 'Refrigeration & Chiller',
  4: 'Electrical & Smart Panel',
};

export const CATEGORIES: Record<number, string> = {
  1: 'AC & Cooling',
  2: 'Laundry & Washer',
  3: 'Kitchen & Cold Storage',
  4: 'Electrical & Plumbing',
};

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateOrderId(existingOrders: Order[]): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const datePart = `${yyyy}${mm}${dd}`;

  const prefix = `SSJ-${datePart}-`;
  const matchingSequences = existingOrders
    .filter((o) => o.id.startsWith(prefix))
    .map((o) => parseInt(o.id.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n));

  const nextSeq = matchingSequences.length > 0 ? Math.max(...matchingSequences) + 1 : 1;
  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

export function getTodayIso(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function addDaysIso(startIso: string, days: number): string {
  const dt = new Date(`${startIso}T00:00:00`);
  dt.setDate(dt.getDate() + days);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
