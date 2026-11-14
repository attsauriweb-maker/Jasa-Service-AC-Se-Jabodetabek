import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  SEED_COMMISSIONS,
  SEED_CUSTOMERS,
  SEED_INVOICES,
  SEED_ORDERS,
  SEED_PAYMENTS,
  SEED_SERVICES,
  SEED_SPAREPARTS,
  SEED_TECHNICIANS,
  SEED_USERS,
  SEED_WARRANTIES,
} from '../data/seedData';
import {
  addDaysIso,
  Commission,
  Customer,
  generateOrderId,
  getTodayIso,
  Invoice,
  InvoiceStatus,
  Order,
  OrderStatus,
  Payment,
  PaymentMethod,
  Service,
  Sparepart,
  Technician,
  User,
  Warranty,
} from '../types/models';

export interface StoreState {
  users: User[];
  customers: Customer[];
  technicians: Technician[];
  services: Service[];
  spareparts: Sparepart[];
  orders: Order[];
  invoices: Invoice[];
  payments: Payment[];
  warranties: Warranty[];
  commissions: Commission[];
}

export interface CreateOrderInput {
  customerId: number;
  serviceId: number;
  technicianId: number | null;
  sparepartQuantities: Record<number, number>;
}

interface StoreContextValue extends StoreState {
  createOrder: (input: CreateOrderInput) => Order;
  assignTechnician: (orderId: string, technicianId: number | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  recordPayment: (invoiceId: number, method: PaymentMethod, amount: number) => void;
  adjustSparepartStock: (sparepartId: number, delta: number) => void;
  addService: (input: Omit<Service, 'id'>) => void;
  addSparepart: (input: Omit<Sparepart, 'id'>) => void;
  addCustomer: (input: { name: string; email: string; phone: string; address: string }) => void;
  addTechnician: (input: { name: string; email: string; phone: string; skillId: number }) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'service_store_jakarta_state_v1';

const INITIAL_STATE: StoreState = {
  users: SEED_USERS,
  customers: SEED_CUSTOMERS,
  technicians: SEED_TECHNICIANS,
  services: SEED_SERVICES,
  spareparts: SEED_SPAREPARTS,
  orders: SEED_ORDERS,
  invoices: SEED_INVOICES,
  payments: SEED_PAYMENTS,
  warranties: SEED_WARRANTIES,
  commissions: SEED_COMMISSIONS,
};

function loadInitialState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    if (!parsed.orders || !parsed.customers || !parsed.services) return INITIAL_STATE;
    return {
      users: parsed.users ?? SEED_USERS,
      customers: parsed.customers ?? SEED_CUSTOMERS,
      technicians: parsed.technicians ?? SEED_TECHNICIANS,
      services: parsed.services ?? SEED_SERVICES,
      spareparts: parsed.spareparts ?? SEED_SPAREPARTS,
      orders: parsed.orders ?? SEED_ORDERS,
      invoices: parsed.invoices ?? SEED_INVOICES,
      payments: parsed.payments ?? SEED_PAYMENTS,
      warranties: parsed.warranties ?? SEED_WARRANTIES,
      commissions: parsed.commissions ?? SEED_COMMISSIONS,
    };
  } catch {
    return INITIAL_STATE;
  }
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const createOrder = (input: CreateOrderInput): Order => {
    const service = state.services.find((s) => s.id === input.serviceId);
    let totalAmount = service ? service.price : 0;

    for (const [partIdStr, qty] of Object.entries(input.sparepartQuantities)) {
      if (qty > 0) {
        const part = state.spareparts.find((p) => p.id === Number(partIdStr));
        if (part) {
          totalAmount += part.price * qty;
        }
      }
    }

    const newOrderId = generateOrderId(state.orders);
    const newOrder: Order = {
      id: newOrderId,
      customerId: input.customerId,
      technicianId: input.technicianId,
      serviceId: input.serviceId,
      status: input.technicianId ? 'Assigned' : 'Pending Dispatch',
      totalAmount,
    };

    const nextInvoiceId =
      state.invoices.length > 0 ? Math.max(...state.invoices.map((i) => i.id)) + 1 : 101;
    const newInvoice: Invoice = {
      id: nextInvoiceId,
      orderId: newOrderId,
      totalAmount,
      status: 'Unpaid',
    };

    setState((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      invoices: [newInvoice, ...prev.invoices],
      spareparts: prev.spareparts.map((part) => {
        const usedQty = input.sparepartQuantities[part.id] ?? 0;
        if (usedQty <= 0) return part;
        return { ...part, stock: Math.max(0, part.stock - usedQty) };
      }),
    }));

    return newOrder;
  };

  const assignTechnician = (orderId: string, technicianId: number | null) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((order) => {
        if (order.id !== orderId) return order;
        let nextStatus = order.status;
        if (technicianId !== null && order.status === 'Pending Dispatch') {
          nextStatus = 'Assigned';
        } else if (technicianId === null && order.status === 'Assigned') {
          nextStatus = 'Pending Dispatch';
        }
        return { ...order, technicianId, status: nextStatus };
      }),
    }));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setState((prev) => {
      const targetOrder = prev.orders.find((o) => o.id === orderId);
      if (!targetOrder) return prev;

      const updatedOrders = prev.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      );

      let updatedWarranties = prev.warranties;
      let updatedCommissions = prev.commissions;
      let updatedInvoices = prev.invoices;

      if (status === 'Completed') {
        const hasWarranty = prev.warranties.some((w) => w.orderId === orderId);
        if (!hasWarranty) {
          const today = getTodayIso();
          const nextWarrantyId =
            prev.warranties.length > 0
              ? Math.max(...prev.warranties.map((w) => w.id)) + 1
              : 1;
          updatedWarranties = [
            {
              id: nextWarrantyId,
              orderId,
              startDate: today,
              endDate: addDaysIso(today, 90),
            },
            ...prev.warranties,
          ];
        }

        const hasCommission = prev.commissions.some((c) => c.orderId === orderId);
        if (!hasCommission && targetOrder.technicianId !== null) {
          const nextCommissionId =
            prev.commissions.length > 0
              ? Math.max(...prev.commissions.map((c) => c.id)) + 1
              : 1;
          const commissionAmount = Math.round(targetOrder.totalAmount * 0.2);
          updatedCommissions = [
            {
              id: nextCommissionId,
              technicianId: targetOrder.technicianId,
              orderId,
              amount: commissionAmount,
            },
            ...prev.commissions,
          ];
        }
      }

      if (status === 'Cancelled') {
        updatedInvoices = prev.invoices.map((inv) =>
          inv.orderId === orderId && inv.status === 'Unpaid'
            ? { ...inv, status: 'Void' as InvoiceStatus }
            : inv
        );
      }

      return {
        ...prev,
        orders: updatedOrders,
        warranties: updatedWarranties,
        commissions: updatedCommissions,
        invoices: updatedInvoices,
      };
    });
  };

  const recordPayment = (invoiceId: number, method: PaymentMethod, amount: number) => {
    setState((prev) => {
      const invoice = prev.invoices.find((inv) => inv.id === invoiceId);
      if (!invoice || amount <= 0) return prev;

      const nextPaymentId =
        prev.payments.length > 0 ? Math.max(...prev.payments.map((p) => p.id)) + 1 : 1;
      const newPayment: Payment = {
        id: nextPaymentId,
        invoiceId,
        method,
        amount,
        status: 'Settled',
      };

      const previouslyPaid = prev.payments
        .filter((p) => p.invoiceId === invoiceId && p.status === 'Settled')
        .reduce((sum, p) => sum + p.amount, 0);

      const newTotalPaid = previouslyPaid + amount;
      const nextStatus: InvoiceStatus =
        newTotalPaid >= invoice.totalAmount ? 'Paid' : 'Partial';

      return {
        ...prev,
        payments: [newPayment, ...prev.payments],
        invoices: prev.invoices.map((inv) =>
          inv.id === invoiceId ? { ...inv, status: nextStatus } : inv
        ),
      };
    });
  };

  const adjustSparepartStock = (sparepartId: number, delta: number) => {
    setState((prev) => ({
      ...prev,
      spareparts: prev.spareparts.map((part) =>
        part.id === sparepartId
          ? { ...part, stock: Math.max(0, part.stock + delta) }
          : part
      ),
    }));
  };

  const addService = (input: Omit<Service, 'id'>) => {
    setState((prev) => {
      const nextId =
        prev.services.length > 0 ? Math.max(...prev.services.map((s) => s.id)) + 1 : 1;
      return {
        ...prev,
        services: [...prev.services, { id: nextId, ...input }],
      };
    });
  };

  const addSparepart = (input: Omit<Sparepart, 'id'>) => {
    setState((prev) => {
      const nextId =
        prev.spareparts.length > 0 ? Math.max(...prev.spareparts.map((p) => p.id)) + 1 : 1;
      return {
        ...prev,
        spareparts: [...prev.spareparts, { id: nextId, ...input }],
      };
    });
  };

  const addCustomer = (input: { name: string; email: string; phone: string; address: string }) => {
    setState((prev) => {
      const nextUserId =
        prev.users.length > 0 ? Math.max(...prev.users.map((u) => u.id)) + 1 : 1;
      const nextCustomerId =
        prev.customers.length > 0 ? Math.max(...prev.customers.map((c) => c.id)) + 1 : 1;

      const newUser: User = {
        id: nextUserId,
        name: input.name,
        email: input.email,
        roleId: 4,
      };
      const newCustomer: Customer = {
        id: nextCustomerId,
        userId: nextUserId,
        name: input.name,
        phone: input.phone,
        address: input.address,
      };

      return {
        ...prev,
        users: [...prev.users, newUser],
        customers: [...prev.customers, newCustomer],
      };
    });
  };

  const addTechnician = (input: { name: string; email: string; phone: string; skillId: number }) => {
    setState((prev) => {
      const nextUserId =
        prev.users.length > 0 ? Math.max(...prev.users.map((u) => u.id)) + 1 : 1;
      const nextTechId =
        prev.technicians.length > 0 ? Math.max(...prev.technicians.map((t) => t.id)) + 1 : 1;

      const newUser: User = {
        id: nextUserId,
        name: input.name,
        email: input.email,
        roleId: 3,
      };
      const newTech: Technician = {
        id: nextTechId,
        userId: nextUserId,
        name: input.name,
        phone: input.phone,
        skillId: input.skillId,
      };

      return {
        ...prev,
        users: [...prev.users, newUser],
        technicians: [...prev.technicians, newTech],
      };
    });
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_STATE);
  };

  return (
    <StoreContext.Provider
      value={{
        ...state,
        createOrder,
        assignTechnician,
        updateOrderStatus,
        recordPayment,
        adjustSparepartStock,
        addService,
        addSparepart,
        addCustomer,
        addTechnician,
        resetDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
