import {
  Commission,
  Customer,
  Invoice,
  Order,
  Payment,
  Service,
  Sparepart,
  Technician,
  User,
  Warranty,
} from '../types/models';

export const SEED_USERS: User[] = [
  { id: 1, name: 'Raka Pratama', email: 'raka.pratama@servicestore.id', roleId: 1 },
  { id: 2, name: 'Dina Kusuma', email: 'dina.kusuma@servicestore.id', roleId: 2 },
  { id: 3, name: 'Agus Setiawan', email: 'agus.setiawan@servicestore.id', roleId: 3 },
  { id: 4, name: 'Budi Santoso', email: 'budi.santoso@servicestore.id', roleId: 3 },
  { id: 5, name: 'Fajar Hidayat', email: 'fajar.hidayat@servicestore.id', roleId: 3 },
  { id: 6, name: 'Rizky Ramadhan', email: 'rizky.ramadhan@servicestore.id', roleId: 3 },
  { id: 7, name: 'Nadia Wijaya', email: 'nadia.wijaya@gmail.com', roleId: 4 },
  { id: 8, name: 'Hendra Gunawan', email: 'hendra.g@kopikemiri.id', roleId: 4 },
  { id: 9, name: 'Sari Lestari', email: 'sari.lestari@mentengliving.id', roleId: 4 },
  { id: 10, name: 'Kevin Tanoto', email: 'kevin.tanoto@pikresidence.id', roleId: 4 },
  { id: 11, name: 'Maya Putri', email: 'maya.putri@senopatistudio.id', roleId: 4 },
  { id: 12, name: 'Arief Wibowo', email: 'arief.wibowo@tebetmail.id', roleId: 4 },
];

export const SEED_CUSTOMERS: Customer[] = [
  {
    id: 1,
    userId: 7,
    name: 'Nadia Wijaya',
    phone: '+62 812-8490-2210',
    address: 'Jl. Kemang Raya No. 48, Jakarta Selatan',
  },
  {
    id: 2,
    userId: 8,
    name: 'Hendra Gunawan',
    phone: '+62 811-9032-7741',
    address: 'Jl. Boulevard Barat Blok LC 7, Kelapa Gading, Jakarta Utara',
  },
  {
    id: 3,
    userId: 9,
    name: 'Sari Lestari',
    phone: '+62 813-1145-9902',
    address: 'Jl. Teuku Umar No. 19, Menteng, Jakarta Pusat',
  },
  {
    id: 4,
    userId: 10,
    name: 'Kevin Tanoto',
    phone: '+62 818-7764-3301',
    address: 'Cluster Gold Coast No. 12, Pantai Indah Kapuk, Jakarta Utara',
  },
  {
    id: 5,
    userId: 11,
    name: 'Maya Putri',
    phone: '+62 812-3398-4510',
    address: 'Jl. Senopati No. 71, Kebayoran Baru, Jakarta Selatan',
  },
  {
    id: 6,
    userId: 12,
    name: 'Arief Wibowo',
    phone: '+62 815-8820-6143',
    address: 'Jl. Tebet Barat Dalam IV No. 9, Jakarta Selatan',
  },
];

export const SEED_TECHNICIANS: Technician[] = [
  {
    id: 1,
    userId: 3,
    name: 'Agus Setiawan',
    phone: '+62 812-7701-1104',
    skillId: 1,
  },
  {
    id: 2,
    userId: 4,
    name: 'Budi Santoso',
    phone: '+62 813-8814-2209',
    skillId: 2,
  },
  {
    id: 3,
    userId: 5,
    name: 'Fajar Hidayat',
    phone: '+62 817-6620-3388',
    skillId: 3,
  },
  {
    id: 4,
    userId: 6,
    name: 'Rizky Ramadhan',
    phone: '+62 819-5503-4491',
    skillId: 4,
  },
];

export const SEED_SERVICES: Service[] = [
  { id: 1, categoryId: 1, name: 'AC Split Cuci & Tune-Up (0.5–2 PK)', price: 125000, unit: 'per unit' },
  { id: 2, categoryId: 1, name: 'Isi Freon R32 / R410A Full Press', price: 350000, unit: 'per unit' },
  { id: 3, categoryId: 1, name: 'Overhaul AC Cassette Komersial', price: 650000, unit: 'per unit' },
  { id: 4, categoryId: 2, name: 'Service Mesin Cuci Front Loading', price: 275000, unit: 'per visit' },
  { id: 5, categoryId: 3, name: 'Perbaikan Chiller & Showcase Resto', price: 480000, unit: 'per unit' },
  { id: 6, categoryId: 4, name: 'Perbaikan Panel MCB & Instalasi Listrik', price: 320000, unit: 'per titik' },
];

export const SEED_SPAREPARTS: Sparepart[] = [
  { id: 1, categoryId: 1, name: 'Kapasitor AC 30uF Original', price: 145000, stock: 24 },
  { id: 2, categoryId: 1, name: 'Thermistor Sensor Indoor Split', price: 110000, stock: 16 },
  { id: 3, categoryId: 1, name: 'Pipa Tembaga Inverter 3m Set', price: 295000, stock: 5 },
  { id: 4, categoryId: 2, name: 'Drain Pump Mesin Cuci Front Load', price: 340000, stock: 9 },
  { id: 5, categoryId: 3, name: 'Kompresor Kulkas Inverter 1/4 PK', price: 920000, stock: 3 },
  { id: 6, categoryId: 4, name: 'MCB Schneider 16A 1-Phase', price: 85000, stock: 32 },
];

export const SEED_ORDERS: Order[] = [
  {
    id: 'SSJ-20261110-0001',
    customerId: 1,
    technicianId: 1,
    serviceId: 2,
    status: 'Completed',
    totalAmount: 495000,
  },
  {
    id: 'SSJ-20261111-0002',
    customerId: 2,
    technicianId: 3,
    serviceId: 5,
    status: 'Completed',
    totalAmount: 1400000,
  },
  {
    id: 'SSJ-20261112-0003',
    customerId: 3,
    technicianId: 2,
    serviceId: 4,
    status: 'Completed',
    totalAmount: 615000,
  },
  {
    id: 'SSJ-20261113-0004',
    customerId: 4,
    technicianId: 1,
    serviceId: 3,
    status: 'In Progress',
    totalAmount: 650000,
  },
  {
    id: 'SSJ-20261113-0005',
    customerId: 5,
    technicianId: 4,
    serviceId: 6,
    status: 'Assigned',
    totalAmount: 405000,
  },
  {
    id: 'SSJ-20261113-0006',
    customerId: 6,
    technicianId: null,
    serviceId: 1,
    status: 'Pending Dispatch',
    totalAmount: 125000,
  },
  {
    id: 'SSJ-20261113-0007',
    customerId: 1,
    technicianId: null,
    serviceId: 2,
    status: 'Pending Dispatch',
    totalAmount: 350000,
  },
];

export const SEED_INVOICES: Invoice[] = [
  { id: 101, orderId: 'SSJ-20261110-0001', totalAmount: 495000, status: 'Paid' },
  { id: 102, orderId: 'SSJ-20261111-0002', totalAmount: 1400000, status: 'Paid' },
  { id: 103, orderId: 'SSJ-20261112-0003', totalAmount: 615000, status: 'Partial' },
  { id: 104, orderId: 'SSJ-20261113-0004', totalAmount: 650000, status: 'Unpaid' },
  { id: 105, orderId: 'SSJ-20261113-0005', totalAmount: 405000, status: 'Unpaid' },
  { id: 106, orderId: 'SSJ-20261113-0006', totalAmount: 125000, status: 'Unpaid' },
  { id: 107, orderId: 'SSJ-20261113-0007', totalAmount: 350000, status: 'Unpaid' },
];

export const SEED_PAYMENTS: Payment[] = [
  { id: 1, invoiceId: 101, method: 'QRIS', amount: 495000, status: 'Settled' },
  { id: 2, invoiceId: 102, method: 'VA', amount: 1400000, status: 'Settled' },
  { id: 3, invoiceId: 103, method: 'e-Wallet', amount: 350000, status: 'Settled' },
];

export const SEED_WARRANTIES: Warranty[] = [
  { id: 1, orderId: 'SSJ-20261110-0001', startDate: '2026-11-10', endDate: '2027-02-08' },
  { id: 2, orderId: 'SSJ-20261111-0002', startDate: '2026-11-11', endDate: '2027-02-09' },
  { id: 3, orderId: 'SSJ-20261112-0003', startDate: '2026-11-12', endDate: '2027-02-10' },
];

export const SEED_COMMISSIONS: Commission[] = [
  { id: 1, technicianId: 1, orderId: 'SSJ-20261110-0001', amount: 99000 },
  { id: 2, technicianId: 3, orderId: 'SSJ-20261111-0002', amount: 280000 },
  { id: 3, technicianId: 2, orderId: 'SSJ-20261112-0003', amount: 123000 },
];
