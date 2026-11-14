import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../context/StoreContext';

type ModelKey =
  | 'User'
  | 'Customer'
  | 'Technician'
  | 'Service'
  | 'Sparepart'
  | 'Order'
  | 'Invoice'
  | 'Payment'
  | 'Warranty'
  | 'Commission';

interface ModelSpec {
  key: ModelKey;
  kotlinSnippet: string;
  serializedFields: Record<string, string>;
}

const MODEL_SPECS: ModelSpec[] = [
  {
    key: 'User',
    serializedFields: {
      id: 'id: Int',
      name: 'name: String',
      email: 'email: String',
      roleId: 'role_id: Int',
    },
    kotlinSnippet: `data class User(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("role_id") val roleId: Int
)`,
  },
  {
    key: 'Customer',
    serializedFields: {
      id: 'id: Int',
      userId: 'user_id: Int',
      name: 'name: String',
      phone: 'phone: String',
      address: 'address: String',
    },
    kotlinSnippet: `data class Customer(
    @SerializedName("id") val id: Int,
    @SerializedName("user_id") val userId: Int,
    @SerializedName("name") val name: String,
    @SerializedName("phone") val phone: String,
    @SerializedName("address") val address: String
)`,
  },
  {
    key: 'Technician',
    serializedFields: {
      id: 'id: Int',
      userId: 'user_id: Int',
      name: 'name: String',
      phone: 'phone: String',
      skillId: 'skill_id: Int',
    },
    kotlinSnippet: `data class Technician(
    @SerializedName("id") val id: Int,
    @SerializedName("user_id") val userId: Int,
    @SerializedName("name") val name: String,
    @SerializedName("phone") val phone: String,
    @SerializedName("skill_id") val skillId: Int
)`,
  },
  {
    key: 'Service',
    serializedFields: {
      id: 'id: Int',
      categoryId: 'category_id: Int',
      name: 'name: String',
      price: 'price: Double',
      unit: 'unit: String',
    },
    kotlinSnippet: `data class Service(
    @SerializedName("id") val id: Int,
    @SerializedName("category_id") val categoryId: Int,
    @SerializedName("name") val name: String,
    @SerializedName("price") val price: Double,
    @SerializedName("unit") val unit: String
)`,
  },
  {
    key: 'Sparepart',
    serializedFields: {
      id: 'id: Int',
      categoryId: 'category_id: Int',
      name: 'name: String',
      price: 'price: Double',
      stock: 'stock: Int',
    },
    kotlinSnippet: `data class Sparepart(
    @SerializedName("id") val id: Int,
    @SerializedName("category_id") val categoryId: Int,
    @SerializedName("name") val name: String,
    @SerializedName("price") val price: Double,
    @SerializedName("stock") val stock: Int
)`,
  },
  {
    key: 'Order',
    serializedFields: {
      id: 'id: String (SSJ-YYYYMMDD-XXXX)',
      customerId: 'customer_id: Int',
      technicianId: 'technician_id: Int?',
      serviceId: 'service_id: Int',
      status: 'status: String',
      totalAmount: 'total_amount: Double',
    },
    kotlinSnippet: `data class Order(
    @SerializedName("id") val id: String,
    @SerializedName("customer_id") val customerId: Int,
    @SerializedName("technician_id") val technicianId: Int?,
    @SerializedName("service_id") val serviceId: Int,
    @SerializedName("status") val status: String,
    @SerializedName("total_amount") val totalAmount: Double
)`,
  },
  {
    key: 'Invoice',
    serializedFields: {
      id: 'id: Int',
      orderId: 'order_id: String',
      totalAmount: 'total_amount: Double',
      status: 'status: String',
    },
    kotlinSnippet: `data class Invoice(
    @SerializedName("id") val id: Int,
    @SerializedName("order_id") val orderId: String,
    @SerializedName("total_amount") val totalAmount: Double,
    @SerializedName("status") val status: String
)`,
  },
  {
    key: 'Payment',
    serializedFields: {
      id: 'id: Int',
      invoiceId: 'invoice_id: Int',
      method: 'method: String (QRIS, VA, e-Wallet)',
      amount: 'amount: Double',
      status: 'status: String',
    },
    kotlinSnippet: `data class Payment(
    @SerializedName("id") val id: Int,
    @SerializedName("invoice_id") val invoiceId: Int,
    @SerializedName("method") val method: String,
    @SerializedName("amount") val amount: Double,
    @SerializedName("status") val status: String
)`,
  },
  {
    key: 'Warranty',
    serializedFields: {
      id: 'id: Int',
      orderId: 'order_id: String',
      startDate: 'start_date: String',
      endDate: 'end_date: String',
    },
    kotlinSnippet: `data class Warranty(
    @SerializedName("id") val id: Int,
    @SerializedName("order_id") val orderId: String,
    @SerializedName("start_date") val startDate: String,
    @SerializedName("end_date") val endDate: String
)`,
  },
  {
    key: 'Commission',
    serializedFields: {
      id: 'id: Int',
      technicianId: 'technician_id: Int',
      orderId: 'order_id: String',
      amount: 'amount: Double',
    },
    kotlinSnippet: `data class Commission(
    @SerializedName("id") val id: Int,
    @SerializedName("technician_id") val technicianId: Int,
    @SerializedName("order_id") val orderId: String,
    @SerializedName("amount") val amount: Double
)`,
  },
];

function toSnakeCasePayload(model: ModelKey, item: Record<string, unknown>): Record<string, unknown> {
  const map: Record<string, string> = {
    roleId: 'role_id',
    userId: 'user_id',
    skillId: 'skill_id',
    categoryId: 'category_id',
    customerId: 'customer_id',
    technicianId: 'technician_id',
    serviceId: 'service_id',
    totalAmount: 'total_amount',
    orderId: 'order_id',
    invoiceId: 'invoice_id',
    startDate: 'start_date',
    endDate: 'end_date',
  };

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(item)) {
    out[map[k] ?? k] = v;
  }
  return out;
}

export function ModelsSchemaView() {
  const store = useStore();
  const [selected, setSelected] = useState<ModelKey>('Order');
  const [copied, setCopied] = useState(false);

  const recordsByModel: Record<ModelKey, unknown[]> = {
    User: store.users,
    Customer: store.customers,
    Technician: store.technicians,
    Service: store.services,
    Sparepart: store.spareparts,
    Order: store.orders,
    Invoice: store.invoices,
    Payment: store.payments,
    Warranty: store.warranties,
    Commission: store.commissions,
  };

  const spec = MODEL_SPECS.find((m) => m.key === selected) ?? MODEL_SPECS[0];
  const liveRecords = recordsByModel[selected].map((r) =>
    toSnakeCasePayload(selected, r as Record<string, unknown>)
  );
  const jsonString = JSON.stringify(liveRecords, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Package: com.servicestore.jakarta.data.model
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Inspect the 10 Kotlin Gson data models and export live serialized JSON payloads from active console state
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Model Selector List */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden h-fit">
          {MODEL_SPECS.map((m, idx) => {
            const count = recordsByModel[m.key].length;
            const isSelected = m.key === selected;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelected(m.key)}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                  isSelected ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span className="text-sm font-medium">
                  {String(idx + 1).padStart(2, '0')}. {m.key}
                </span>
                <span className="font-mono text-xs tabular-nums text-slate-500">
                  {count} rows
                </span>
              </button>
            );
          })}
        </div>

        {/* Kotlin Definition & Live JSON */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                {spec.key}.kt (Kotlin Data Class)
              </span>
              <span className="text-xs font-mono text-slate-500">
                Gson @SerializedName
              </span>
            </div>
            <pre className="p-5 bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
              {spec.kotlinSnippet}
            </pre>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                Live JSON Payload ({liveRecords.length} records)
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 bg-slate-50 text-slate-800 text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
              {jsonString}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
