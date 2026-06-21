import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LayoutDashboard, Building2, Package, ShoppingCart,
  AlertTriangle, TrendingUp, BarChart3, Settings, User,
  Bell, Search, LogOut, Plus, Download, Edit2, Trash2,
  CheckCircle, Clock, XCircle, Eye, EyeOff,
  ArrowUpRight, ArrowDownRight, Shield, Activity,
  Truck, Globe, Star, AlertOctagon, DollarSign,
  RefreshCw, MapPin, Mail, Phone, Lock,
  Award, Package2, FileText, Menu, X, Image as ImageIcon, Upload, Import, ArrowUpFromLine,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Page =
  | "dashboard"
  | "suppliers"
  | "inventory"
  | "orders"
  | "risk"
  | "optimization"
  | "reports"
  | "profile";

// ─── Toast System ─────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info";
interface ToastMsg { id: number; type: ToastType; message: string; }

let _toastSetter: ((t: ToastMsg) => void) | null = null;
function showToast(type: ToastType, message: string) {
  _toastSetter?.({ id: Date.now(), type, message });
}

const toastStyles: Record<ToastType, { bg: string; icon: React.ReactNode; border: string }> = {
  success: { bg: "bg-emerald-600", border: "border-emerald-700", icon: <CheckCircle size={16} /> },
  error: { bg: "bg-red-600", border: "border-red-700", icon: <XCircle size={16} /> },
  warning: { bg: "bg-amber-500", border: "border-amber-600", icon: <AlertTriangle size={16} /> },
  info: { bg: "bg-blue-600", border: "border-blue-700", icon: <Activity size={16} /> },
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  useEffect(() => {
    _toastSetter = (t) => {
      setToasts((prev) => [...prev.slice(-3), t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3500);
    };
    return () => { _toastSetter = null; };
  }, []);

  return (
    <div className="fixed top-5 right-5 z-[999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const s = toastStyles[t.type];
        return (
          <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-xl border ${s.bg} ${s.border} pointer-events-auto animate-fade-in`}
            style={{ animation: "slideIn 0.25s ease" }}>
            {s.icon}
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Modal Primitive ──────────────────────────────────────────────────────────

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ animation: "scaleIn 0.2s ease" }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
          <X size={16} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

const ConfirmDialog = ({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" style={{ animation: "scaleIn 0.2s ease" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-red-100 rounded-xl"><Trash2 size={18} className="text-red-600" /></div>
        <h3 className="text-base font-bold text-slate-800">Confirm Delete</h3>
      </div>
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-2">
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Delete</button>
        <button onClick={onCancel} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
      </div>
    </div>
  </div>
);

// ─── View Detail Modal ────────────────────────────────────────────────────────

const ViewSupplierModal = ({ supplier, onClose }: { supplier: typeof suppliers[0]; onClose: () => void }) => (
  <Modal title="Supplier Details" onClose={onClose}>
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
        <div className="w-14 h-14 rounded-2xl bg-blue-900 flex items-center justify-center flex-shrink-0">
          <Building2 size={24} className="text-white" />
        </div>
        <div>
          <div className="text-lg font-bold text-slate-800">{supplier.name}</div>
          <div className="text-sm text-slate-500">{supplier.category} · {supplier.country}</div>
          <Badge label={supplier.status} colorClass={statusColor[supplier.status]} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Supplier ID", value: supplier.id },
          { label: "Country", value: supplier.country },
          { label: "Category", value: supplier.category },
          { label: "On-Time Rate", value: `${supplier.onTime}%` },
          { label: "Quality Score", value: `${supplier.quality}%` },
          { label: "Risk Level", value: supplier.risk },
        ].map((f) => (
          <div key={f.label} className="p-3 bg-slate-50 rounded-xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</div>
            <div className="text-sm font-semibold text-slate-800 mt-1">{f.value}</div>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="w-full py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">Close</button>
    </div>
  </Modal>
);

const EditSupplierModal = ({ supplier, onClose }: { supplier: typeof suppliers[0]; onClose: () => void }) => {
  const [form, setForm] = useState({ name: supplier.name, country: supplier.country, category: supplier.category });
  return (
    <Modal title="Edit Supplier" onClose={onClose}>
      <div className="space-y-4">
        {(["name", "country", "category"] as const).map((field) => (
          <div key={field}>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{field}</label>
            <input value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all" />
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <button onClick={() => { showToast("success", `${form.name} updated successfully`); onClose(); }}
            className="flex-1 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">Save Changes</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
        </div>
      </div>
    </Modal>
  );
};

const AddSupplierModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({ name: "", country: "", category: "", contact: "" });
  const fields: { key: keyof typeof form; label: string; placeholder: string }[] = [
    { key: "name", label: "Supplier Name", placeholder: "e.g. Acme Manufacturing" },
    { key: "country", label: "Country", placeholder: "e.g. USA" },
    { key: "category", label: "Category", placeholder: "e.g. Electronics" },
    { key: "contact", label: "Contact Email", placeholder: "contact@supplier.com" },
  ];
  return (
    <Modal title="Add New Supplier" onClose={onClose}>
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{f.label}</label>
            <input value={form[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all" />
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <button onClick={() => {
            if (!form.name.trim()) { showToast("error", "Supplier name is required"); return; }
            showToast("success", `${form.name} added successfully`);
            onClose();
          }} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">Add Supplier</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
        </div>
      </div>
    </Modal>
  );
};

const AddProductModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({ name: "", category: "", stock: "", price: "" });
  const fields: { key: keyof typeof form; label: string; placeholder: string }[] = [
    { key: "name", label: "Product Name", placeholder: "e.g. Control Panel Board" },
    { key: "category", label: "Category", placeholder: "e.g. Electronics" },
    { key: "stock", label: "Initial Stock Qty", placeholder: "e.g. 100" },
    { key: "price", label: "Unit Price ($)", placeholder: "e.g. 299.99" },
  ];
  return (
    <Modal title="Add New Product" onClose={onClose}>
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{f.label}</label>
            <input value={form[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all" />
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <button onClick={() => {
            if (!form.name.trim()) { showToast("error", "Product name is required"); return; }
            showToast("success", `${form.name} added to inventory`);
            onClose();
          }} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">Add Product</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
        </div>
      </div>
    </Modal>
  );
};

const NewOrderModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({ supplier: "", product: "", qty: "", eta: "" });
  return (
    <Modal title="Create New Order" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Supplier</label>
          <select value={form.supplier} onChange={(e) => setForm((p) => ({ ...p, supplier: e.target.value }))}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25">
            <option value="">Select supplier...</option>
            {suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Product</label>
          <select value={form.product} onChange={(e) => setForm((p) => ({ ...p, product: e.target.value }))}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25">
            <option value="">Select product...</option>
            {products.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quantity</label>
          <input type="number" value={form.qty} onChange={(e) => setForm((p) => ({ ...p, qty: e.target.value }))} placeholder="e.g. 50"
            className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Expected Delivery Date</label>
          <input type="date" value={form.eta} onChange={(e) => setForm((p) => ({ ...p, eta: e.target.value }))}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25" />
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={() => {
            if (!form.supplier || !form.product || !form.qty) { showToast("error", "Please fill all required fields"); return; }
            showToast("success", `Order placed for ${form.product} from ${form.supplier}`);
            onClose();
          }} className="flex-1 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">Place Order</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
        </div>
      </div>
    </Modal>
  );
};

const AlertsModal = ({ onClose, onNavigate }: { onClose: () => void; onNavigate: (p: Page) => void }) => (
  <Modal title="Active Alerts" onClose={onClose}>
    <div className="space-y-3">
      {recentActivities.filter((a) => a.type === "alert" || a.type === "warning").map((a, i) => {
        const meta = { alert: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" }, warning: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" } }[a.type];
        return (
          <div key={i} className={`p-3.5 rounded-xl border ${meta.border} ${meta.bg} flex items-start gap-3`}>
            <AlertTriangle size={14} className={`${meta.text} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">{a.text}</p>
              <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
            </div>
          </div>
        );
      })}
      <button onClick={() => { onClose(); onNavigate("risk"); }}
        className="w-full mt-2 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">
        Go to Risk Analysis
      </button>
    </div>
  </Modal>
);

const NotificationsModal = ({ onClose }: { onClose: () => void }) => (
  <Modal title="Notifications" onClose={onClose}>
    <div className="space-y-3">
      {recentActivities.map((a, i) => {
        const meta = {
          alert: { Icon: AlertOctagon, color: "text-red-500", bg: "bg-red-50" },
          warning: { Icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
          success: { Icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          info: { Icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
        }[a.type];
        return (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            <div className={`p-1.5 rounded-lg flex-shrink-0 ${meta.bg}`}>
              <meta.Icon size={13} className={meta.color} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700">{a.text}</p>
              <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
            </div>
          </div>
        );
      })}
      <button onClick={onClose} className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Dismiss All</button>
    </div>
  </Modal>
);

// ─── Mock Data ────────────────────────────────────────────────────────────────

const orderTrend = [
  { month: "Jan", orders: 420, delivered: 380, delayed: 40 },
  { month: "Feb", orders: 380, delivered: 350, delayed: 30 },
  { month: "Mar", orders: 510, delivered: 475, delayed: 35 },
  { month: "Apr", orders: 490, delivered: 450, delayed: 40 },
  { month: "May", orders: 560, delivered: 510, delayed: 50 },
  { month: "Jun", orders: 487, delivered: 443, delayed: 44 },
];

const supplierPerf = [
  { name: "Acme Mfg", onTime: 92, quality: 88, cost: 76 },
  { name: "TechParts", onTime: 78, quality: 95, cost: 82 },
  { name: "GlobalLog", onTime: 85, quality: 79, cost: 91 },
  { name: "FastShip", onTime: 95, quality: 82, cost: 68 },
  { name: "ProSource", onTime: 71, quality: 90, cost: 85 },
];

const riskDist = [
  { name: "Low Risk", value: 163, color: "#10b981" },
  { name: "Medium Risk", value: 28, color: "#f59e0b" },
  { name: "High Risk", value: 12, color: "#ef4444" },
];

let suppliers = [
  { id: "S001", name: "Acme Manufacturing", country: "USA", category: "Electronics", onTime: 92, quality: 88, risk: "Low", status: "Active" },
  { id: "S002", name: "TechParts Inc.", country: "Germany", category: "Components", onTime: 78, quality: 95, risk: "Medium", status: "Active" },
  { id: "S003", name: "Global Logistics Co", country: "China", category: "Logistics", onTime: 85, quality: 79, risk: "Low", status: "Active" },
  { id: "S004", name: "FastShip Ltd", country: "UK", category: "Transportation", onTime: 95, quality: 82, risk: "Low", status: "Active" },
  { id: "S005", name: "ProSource Materials", country: "India", category: "Raw Materials", onTime: 71, quality: 90, risk: "High", status: "Review" },
  { id: "S006", name: "Nordic Supplies", country: "Sweden", category: "Electronics", onTime: 88, quality: 93, risk: "Low", status: "Active" },
  { id: "S007", name: "Eastern Trade Corp", country: "Japan", category: "Components", onTime: 65, quality: 85, risk: "High", status: "Review" },
];

let products = [
  { id: "P001", name: "Industrial Servo Motor", category: "Electronics", stock: 245, reorder: 100, status: "In Stock", price: 289.99 },
  { id: "P002", name: "Hydraulic Pump Assembly", category: "Machinery", stock: 38, reorder: 50, status: "Low Stock", price: 1240.00 },
  { id: "P003", name: "Carbon Steel Sheets", category: "Raw Materials", stock: 1820, reorder: 500, status: "In Stock", price: 45.50 },
  { id: "P004", name: "Pneumatic Valve Kit", category: "Components", stock: 0, reorder: 200, status: "Out of Stock", price: 189.75 },
  { id: "P005", name: "Control Panel Board", category: "Electronics", stock: 92, reorder: 80, status: "In Stock", price: 540.00 },
  { id: "P006", name: "Rubber Sealing Gaskets", category: "Components", stock: 22, reorder: 100, status: "Low Stock", price: 12.99 },
];

let orders = [
  { id: "ORD-2024-001", supplier: "Acme Manufacturing", product: "Industrial Servo Motor", qty: 50, date: "Jun 01", eta: "Jun 15", status: "Delivered", value: 14499.50 },
  { id: "ORD-2024-002", supplier: "TechParts Inc.", product: "Control Panel Board", qty: 20, date: "Jun 03", eta: "Jun 18", status: "In Transit", value: 10800.00 },
  { id: "ORD-2024-003", supplier: "ProSource Materials", product: "Carbon Steel Sheets", qty: 500, date: "Jun 05", eta: "Jun 12", status: "Delayed", value: 22750.00 },
  { id: "ORD-2024-004", supplier: "FastShip Ltd", product: "Pneumatic Valve Kit", qty: 100, date: "Jun 07", eta: "Jun 20", status: "Processing", value: 18975.00 },
  { id: "ORD-2024-005", supplier: "Nordic Supplies", product: "Industrial Servo Motor", qty: 30, date: "Jun 08", eta: "Jun 22", status: "In Transit", value: 8699.70 },
  { id: "ORD-2024-006", supplier: "Eastern Trade Corp", product: "Control Panel Board", qty: 15, date: "Jun 10", eta: "Jun 25", status: "Delayed", value: 8100.00 },
];

const recentActivities = [
  { time: "2 min ago", text: "Order ORD-2024-006 flagged as high risk", type: "alert" as const },
  { time: "15 min ago", text: "ProSource Materials delivery delayed by 3 days", type: "warning" as const },
  { time: "1 hr ago", text: "New supplier Nordic Supplies onboarded successfully", type: "success" as const },
  { time: "3 hr ago", text: "Inventory alert: Pneumatic Valve Kit out of stock", type: "alert" as const },
  { time: "5 hr ago", text: "ORD-2024-001 delivered successfully", type: "success" as const },
  { time: "Yesterday", text: "Risk score updated for Eastern Trade Corp", type: "info" as const },
];

const heatmap = [
  { supplier: "Acme Mfg", delay: 1, quality: 1, inventory: 1, transport: 2, financial: 1 },
  { supplier: "TechParts", delay: 2, quality: 1, inventory: 2, transport: 1, financial: 1 },
  { supplier: "Global Log", delay: 1, quality: 2, inventory: 1, transport: 1, financial: 2 },
  { supplier: "FastShip", delay: 1, quality: 1, inventory: 1, transport: 1, financial: 2 },
  { supplier: "ProSource", delay: 3, quality: 2, inventory: 3, transport: 2, financial: 2 },
  { supplier: "Nordic", delay: 1, quality: 1, inventory: 1, transport: 2, financial: 1 },
  { supplier: "Eastern", delay: 3, quality: 2, inventory: 2, transport: 3, financial: 3 },
];

const delayTrend = [
  { month: "Jan", high: 5, medium: 12, low: 28 },
  { month: "Feb", high: 4, medium: 10, low: 25 },
  { month: "Mar", high: 7, medium: 15, low: 32 },
  { month: "Apr", high: 6, medium: 11, low: 29 },
  { month: "May", high: 9, medium: 18, low: 35 },
  { month: "Jun", high: 12, medium: 28, low: 43 },
];

const monthlyRevenue = [
  { month: "Jan", revenue: 680, cost: 420 },
  { month: "Feb", revenue: 590, cost: 380 },
  { month: "Mar", revenue: 820, cost: 510 },
  { month: "Apr", revenue: 780, cost: 460 },
  { month: "May", revenue: 920, cost: 540 },
  { month: "Jun", revenue: 830, cost: 490 },
];

// ─── Shared UI Primitives ─────────────────────────────────────────────────────

const riskColor: Record<string, string> = {
  Low: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

const statusColor: Record<string, string> = {
  Delivered: "bg-emerald-100 text-emerald-700",
  "In Transit": "bg-blue-100 text-blue-700",
  Delayed: "bg-red-100 text-red-700",
  Processing: "bg-purple-100 text-purple-700",
  Active: "bg-emerald-100 text-emerald-700",
  Review: "bg-amber-100 text-amber-700",
  "In Stock": "bg-emerald-100 text-emerald-700",
  "Low Stock": "bg-amber-100 text-amber-700",
  "Out of Stock": "bg-red-100 text-red-700",
};

const Badge = ({ label, colorClass }: { label: string; colorClass: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
    {label}
  </span>
);

const ProgressBar = ({ value, color = "bg-blue-500" }: { value: number; color?: string }) => (
  <div className="flex-1 bg-slate-200 rounded-full h-1.5 min-w-[40px] max-w-[60px]">
    <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
  </div>
);

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  Icon: React.ElementType;
  iconBg: string;
  trend: "up" | "down";
}

const KPICard = ({ title, value, change, Icon, iconBg, trend }: KPICardProps) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/70 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1 leading-none" style={{ fontFamily: "'Poppins', sans-serif" }}>{value}</p>
        <div className={`flex items-center gap-0.5 mt-2 text-xs font-semibold ${trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
          {trend === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          <span>{change} vs last month</span>
        </div>
      </div>
      <div className={`p-3 rounded-xl ${iconBg} flex-shrink-0 ml-3`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/80 backdrop-blur-sm border border-white/70 shadow-sm rounded-2xl ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h3 className="text-base font-semibold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const tooltipStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
};

// ─── Login Page ───────────────────────────────────────────────────────────────

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("admin@chainflow.io");
  const [password, setPassword] = useState("SecurePass2024");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left — Illustration Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col items-center justify-center p-14"
        style={{ background: "linear-gradient(145deg, #060f2e 0%, #0d1b4b 40%, #1a3a8a 80%, #1e4fbf 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-24 -left-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-16 -right-16 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

        <div className="relative z-10 text-white max-w-[420px] w-full">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-14">
            <div className="w-12 h-12 rounded-2xl border border-blue-400/30 bg-blue-400/15 backdrop-blur-sm flex items-center justify-center">
              <Shield size={24} className="text-blue-200" />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>ChainFlow</div>
              <div className="text-[11px] text-blue-400 tracking-wide">Supply Chain Intelligence</div>
            </div>
          </div>

          {/* Central illustration */}
          <div className="relative w-64 h-64 mx-auto mb-12">
            {/* Rings */}
            <div className="absolute inset-0 rounded-full border border-blue-400/15" />
            <div className="absolute inset-8 rounded-full border border-blue-400/20" />
            <div className="absolute inset-16 rounded-full border border-blue-400/25" />
            {/* Center hub */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-blue-500/20 backdrop-blur border border-blue-300/30 flex items-center justify-center shadow-2xl">
                <Globe size={34} className="text-blue-200" />
              </div>
            </div>
            {/* Orbit nodes */}
            {[
              { Icon: Truck, color: "text-emerald-400", top: "0", left: "50%", transform: "translate(-50%, -50%)" },
              { Icon: Package, color: "text-blue-300", top: "50%", right: "0", transform: "translate(50%, -50%)" },
              { Icon: Activity, color: "text-amber-400", bottom: "0", left: "50%", transform: "translate(-50%, 50%)" },
              { Icon: BarChart3, color: "text-purple-400", top: "50%", left: "0", transform: "translate(-50%, -50%)" },
            ].map(({ Icon, color, ...pos }, i) => (
              <div
                key={i}
                className="absolute bg-[#1a3a8a]/90 backdrop-blur p-3 rounded-xl border border-blue-400/30 shadow-lg"
                style={pos as React.CSSProperties}
              >
                <Icon size={18} className={color} />
              </div>
            ))}
            {/* Connector dots */}
            {[
              { top: "25%", left: "25%" },
              { top: "25%", right: "25%" },
              { bottom: "25%", left: "25%" },
              { bottom: "25%", right: "25%" },
            ].map((pos, i) => (
              <div key={i} className="absolute w-2 h-2 bg-blue-400/40 rounded-full" style={pos as React.CSSProperties} />
            ))}
          </div>

          <h1 className="text-3xl font-bold leading-tight mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Supply Chain Risk<br />Analysis & Optimization
          </h1>
          <p className="text-blue-200/80 text-sm leading-relaxed">
            Identify supplier risks, prevent disruptions, and optimize your operations with real-time intelligence and AI-powered recommendations.
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-10 pt-8 border-t border-white/10">
            {[
              { label: "Active Suppliers", value: "156" },
              { label: "Risk Reduction", value: "34%" },
              { label: "Cost Savings", value: "$2.1M" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.value}</div>
                <div className="text-xs text-blue-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: "linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)" }}>
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>ChainFlow</span>
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Enterprise Portal</p>
            <h2 className="text-3xl font-bold text-slate-900 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Welcome back
            </h2>
            <p className="text-slate-500 mt-2 text-sm">Sign in to your supply chain dashboard</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all shadow-sm"
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all shadow-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => setRemember(!remember)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${remember ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"}`}
                >
                  {remember && <CheckCircle size={10} className="text-white" />}
                </div>
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              onClick={onLogin}
              className="w-full py-3.5 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg active:scale-[0.98] text-sm"
              style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", boxShadow: "0 8px 24px rgba(37,99,235,0.3)" }}
            >
              Sign In to Dashboard
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Shield size={12} className="text-emerald-500" />
                <span>SOC 2 Type II</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock size={12} className="text-blue-500" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-emerald-500" />
                <span>ISO 27001</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const navItems: { id: Page; label: string; Icon: React.ElementType; group: "main" | "account" }[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard, group: "main" },
  { id: "suppliers", label: "Suppliers", Icon: Building2, group: "main" },
  { id: "inventory", label: "Inventory", Icon: Package, group: "main" },
  { id: "orders", label: "Orders", Icon: ShoppingCart, group: "main" },
  { id: "risk", label: "Risk Analysis", Icon: AlertTriangle, group: "main" },
  { id: "optimization", label: "Optimization", Icon: TrendingUp, group: "main" },
  { id: "reports", label: "Reports", Icon: BarChart3, group: "main" },
  { id: "profile", label: "Settings", Icon: Settings, group: "account" },
];

const Sidebar = ({
  page,
  onNavigate,
  onLogout,
}: {
  page: Page;
  onNavigate: (p: Page) => void;
  onLogout: () => void;
}) => {
  const mainItems = navItems.filter((n) => n.group === "main");
  const accountItems = navItems.filter((n) => n.group === "account");

  return (
    <div className="flex flex-col w-60 h-full text-white flex-shrink-0"
      style={{ background: "linear-gradient(180deg, #060f2e 0%, #0d1b4b 50%, #1a3a8a 100%)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-blue-400/20 rounded-xl border border-blue-300/30 flex items-center justify-center flex-shrink-0">
          <Shield size={17} className="text-blue-200" />
        </div>
        <div>
          <div className="font-bold text-sm leading-none" style={{ fontFamily: "'Poppins', sans-serif" }}>ChainFlow</div>
          <div className="text-[10px] text-blue-400 mt-0.5 tracking-wide">Risk Intelligence</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-5 pb-2 overflow-y-auto">
        <div className="text-[9px] text-blue-500 uppercase tracking-[0.15em] font-bold px-3 mb-2">Main Menu</div>
        <div className="space-y-0.5">
          {mainItems.map(({ id, label, Icon }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  active
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-blue-200/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  size={16}
                  className={active ? "text-emerald-400" : "text-blue-400 group-hover:text-blue-300 transition-colors"}
                />
                <span className="text-[13px]">{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="text-[9px] text-blue-500 uppercase tracking-[0.15em] font-bold px-3 mt-6 mb-2">Account</div>
        <div className="space-y-0.5">
          {accountItems.map(({ id, label, Icon }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-blue-200/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={16} className={active ? "text-emerald-400" : "text-blue-400 group-hover:text-blue-300 transition-colors"} />
                <span className="text-[13px]">{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            AK
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-white truncate">Alex Kumar</div>
            <div className="text-[10px] text-blue-400 truncate">Supply Chain Manager</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-blue-300 hover:text-white hover:bg-white/10 text-xs font-medium transition-all"
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

// ─── Top Nav ──────────────────────────────────────────────────────────────────

const pageTitle: Record<Page, string> = {
  dashboard: "Dashboard",
  suppliers: "Supplier Management",
  inventory: "Product & Inventory",
  orders: "Order Management",
  risk: "Risk Analysis",
  optimization: "Optimization Center",
  reports: "Reports & Analytics",
  profile: "Profile & Settings",
};

const TopNav = ({ page, onNavigate, onRefresh }: { page: Page; onNavigate: (p: Page) => void; onRefresh: () => void }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    showToast("info", `${pageTitle[page]} refreshed`);
    onRefresh();
    setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <>
      {showNotifs && <NotificationsModal onClose={() => setShowNotifs(false)} />}
      <div className="flex items-center justify-between px-6 py-3.5 bg-white/70 backdrop-blur-sm border-b border-slate-200/60">
        <div>
          <h1 className="text-base font-semibold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {pageTitle[page]}
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">June 21, 2024 · 10:42 AM</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative hidden md:block">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search anything..."
              className="pl-8 pr-4 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 w-48 transition-all"
            />
          </div>
          <button onClick={() => setShowNotifs(true)} className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <Bell size={17} className="text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white" />
          </button>
          <button
            onClick={handleRefresh}
            title="Refresh page"
            className="relative p-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors group"
          >
            <RefreshCw
              size={15}
              className={`transition-all duration-700 ${
                refreshing ? "animate-spin text-blue-600" : "text-slate-500 group-hover:text-blue-600"
              }`}
            />
          </button>
          <button onClick={() => onNavigate("profile")} className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            AK
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────

const kpiData: KPICardProps[] = [
  { title: "Total Orders", value: "2,847", change: "+12.5%", Icon: ShoppingCart, iconBg: "bg-blue-600", trend: "up" },
  { title: "Total Suppliers", value: "156", change: "+3 new", Icon: Building2, iconBg: "bg-indigo-600", trend: "up" },
  { title: "Delayed Deliveries", value: "43", change: "+8.2%", Icon: Clock, iconBg: "bg-amber-500", trend: "down" },
  { title: "Inventory Level", value: "87%", change: "-2.1%", Icon: Package, iconBg: "bg-teal-600", trend: "down" },
  { title: "Revenue", value: "$4.2M", change: "+18.3%", Icon: DollarSign, iconBg: "bg-emerald-600", trend: "up" },
  { title: "Risk Score", value: "6.8/10", change: "-0.5 pts", Icon: AlertTriangle, iconBg: "bg-red-500", trend: "up" },
];

const activityMeta = {
  alert: { Icon: AlertOctagon, color: "text-red-500", bg: "bg-red-50" },
  warning: { Icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
  success: { Icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  info: { Icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
};

const DashboardPage = ({ onNavigate }: { onNavigate: (p: Page) => void }) => {
  const [showAlerts, setShowAlerts] = useState(false);

  // ── Dynamic KPI Calculations ──────────────────────────────────────────────
  const dynamicKPIs = useMemo(() => {
    const totalOrdersVal = (2847 + Math.max(0, orders.length - 6)).toLocaleString();
    const totalSuppliersVal = (156 + Math.max(0, suppliers.length - 7)).toString();
    const delayedCount = 43 + Math.max(0, orders.filter(o => o.status === "Delayed").length - 2);
    
    const inStock = products.filter(p => p.status === "In Stock").length;
    const lowStock = products.filter(p => p.status === "Low Stock").length;
    const totalP = products.length || 1;
    const inventoryVal = Math.round(((inStock + 0.5 * lowStock) / totalP) * 100) + "%";
    
    const initialOrdersVal = 83824.2;
    const currentOrdersVal = orders.reduce((sum, o) => sum + o.value, 0);
    const addedRevenue = (currentOrdersVal - initialOrdersVal) / 1000000;
    const revenueVal = "$" + (4.2 + Math.max(0, addedRevenue)).toFixed(2) + "M";
    
    const highRiskSuppliers = suppliers.filter(s => s.risk === "High").length;
    const riskScoreVal = (5.5 + (highRiskSuppliers * 0.65)).toFixed(1) + "/10";

    return [
      { title: "Total Orders", value: totalOrdersVal, change: "+12.5%", Icon: ShoppingCart, iconBg: "bg-blue-600", trend: "up" as const },
      { title: "Total Suppliers", value: totalSuppliersVal, change: "+3 new", Icon: Building2, iconBg: "bg-indigo-600", trend: "up" as const },
      { title: "Delayed Deliveries", value: delayedCount.toString(), change: "+8.2%", Icon: Clock, iconBg: "bg-amber-500", trend: "down" as const },
      { title: "Inventory Level", value: inventoryVal, change: "-2.1%", Icon: Package, iconBg: "bg-teal-600", trend: "down" as const },
      { title: "Revenue", value: revenueVal, change: "+18.3%", Icon: DollarSign, iconBg: "bg-emerald-600", trend: "up" as const },
      { title: "Risk Score", value: riskScoreVal, change: "-0.5 pts", Icon: AlertTriangle, iconBg: "bg-red-500", trend: "up" as const },
    ];
  }, [orders.length, suppliers.length, products.length]);

  // ── Dynamic Order Trend Chart Data ────────────────────────────────────────
  const dynamicOrderTrend = useMemo(() => {
    const baseTrend = [
      { month: "Jan", orders: 420, delivered: 380, delayed: 40 },
      { month: "Feb", orders: 380, delivered: 350, delayed: 30 },
      { month: "Mar", orders: 510, delivered: 475, delayed: 35 },
      { month: "Apr", orders: 490, delivered: 450, delayed: 40 },
      { month: "May", orders: 560, delivered: 510, delayed: 50 },
      { month: "Jun", orders: 487, delivered: 443, delayed: 44 },
    ];
    const extraOrders = orders.length - 6;
    if (extraOrders > 0) {
      const extraDelivered = orders.filter((o, i) => i >= 6 && o.status === "Delivered").length;
      const extraDelayed = orders.filter((o, i) => i >= 6 && o.status === "Delayed").length;
      baseTrend[5].orders += extraOrders;
      baseTrend[5].delivered += extraDelivered;
      baseTrend[5].delayed += extraDelayed;
    }
    return baseTrend;
  }, [orders.length]);

  // ── Dynamic Risk Distribution Pie Chart ────────────────────────────────────
  const dynamicRiskDist = useMemo(() => {
    const lowCount = suppliers.filter(s => s.risk === "Low").length;
    const medCount = suppliers.filter(s => s.risk === "Medium").length;
    const highCount = suppliers.filter(s => s.risk === "High").length;
    return [
      { name: "Low Risk", value: 159 + lowCount, color: "#10b981" },
      { name: "Medium Risk", value: 27 + medCount, color: "#f59e0b" },
      { name: "High Risk", value: 10 + highCount, color: "#ef4444" },
    ];
  }, [suppliers.length]);

  // ── Dynamic Supplier Performance Bar Chart ────────────────────────────────
  const dynamicSupplierPerf = useMemo(() => {
    return suppliers.slice(0, 6).map((s) => ({
      name: s.name.split(" ")[0],
      onTime: s.onTime,
      quality: s.quality,
      cost: s.risk === "High" ? 65 : s.risk === "Medium" ? 78 : 92,
    }));
  }, [suppliers.length]);

  // ── Dynamic Recent Activities ──────────────────────────────────────────────
  const dynamicActivities = useMemo(() => {
    const list = [...recentActivities];
    const importLog = localStorage.getItem("last_import_log");
    if (importLog) {
      list.unshift({
        time: "Just now",
        text: importLog,
        type: "success" as const,
      });
    }
    return list.slice(0, 5);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {showAlerts && <AlertsModal onClose={() => setShowAlerts(false)} onNavigate={onNavigate} />}
      {/* Welcome banner */}
      <div
        className="rounded-2xl p-6 text-white flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)" }}
      >
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Good morning, Alex!</h2>
          <p className="text-blue-200 text-sm">
            You have{" "}
            <span className="text-white font-semibold bg-white/15 px-1.5 py-0.5 rounded-md">3 high-risk orders</span>{" "}
            and{" "}
            <span className="text-white font-semibold bg-white/15 px-1.5 py-0.5 rounded-md">2 inventory alerts</span>{" "}
            to review today.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button onClick={() => setShowAlerts(true)} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors border border-white/30">
            View Alerts
          </button>
          <button onClick={() => onNavigate("risk")} className="px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-sm font-semibold transition-colors">
            Risk Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {dynamicKPIs.map((k) => <KPICard key={k.title} {...k} />)}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6">
          <SectionHeader title="Order Trends" subtitle="Monthly order volume by delivery status" />
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={dynamicOrderTrend} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gDeliv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Area type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2.5} fill="url(#gOrders)" name="Total Orders" />
              <Area type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2} fill="url(#gDeliv)" name="Delivered" />
              <Line type="monotone" dataKey="delayed" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: "#ef4444" }} name="Delayed" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <SectionHeader title="Risk Distribution" subtitle="Orders by severity" />
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={dynamicRiskDist} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {dynamicRiskDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2.5 mt-1">
            {dynamicRiskDist.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{d.value}</span>
                  <span className="text-slate-400">({((d.value / (dynamicRiskDist.reduce((acc, x) => acc + x.value, 0) || 1)) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6">
          <SectionHeader title="Supplier Performance" subtitle="On-time delivery, quality & cost scores (%)" />
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={dynamicSupplierPerf} barGap={2} barSize={11} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="onTime" name="On-Time %" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="quality" name="Quality %" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name="Cost Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <SectionHeader title="Recent Activity" />
          <div className="space-y-3.5">
            {dynamicActivities.map((a, i) => {
              const meta = activityMeta[a.type];
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${meta.bg}`}>
                    <meta.Icon size={12} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-snug">{a.text}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Suppliers Page ───────────────────────────────────────────────────────────

const SuppliersPage = () => {
  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [viewSupplier, setViewSupplier] = useState<typeof suppliers[0] | null>(null);
  const [editSupplier, setEditSupplier] = useState<typeof suppliers[0] | null>(null);
  const [deleteSupplier, setDeleteSupplier] = useState<typeof suppliers[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filtered = suppliers.filter(
    (s) =>
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
       s.country.toLowerCase().includes(search.toLowerCase()) ||
       s.category.toLowerCase().includes(search.toLowerCase())) &&
      (filterRisk === "All" || s.risk === filterRisk)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {showAdd && <AddSupplierModal onClose={() => setShowAdd(false)} />}
      {viewSupplier && <ViewSupplierModal supplier={viewSupplier} onClose={() => setViewSupplier(null)} />}
      {editSupplier && <EditSupplierModal supplier={editSupplier} onClose={() => setEditSupplier(null)} />}
      {deleteSupplier && (
        <ConfirmDialog
          message={`Are you sure you want to remove "${deleteSupplier.name}" from your supplier list? This action cannot be undone.`}
          onConfirm={() => { showToast("success", `${deleteSupplier.name} removed`); setDeleteSupplier(null); }}
          onCancel={() => setDeleteSupplier(null)}
        />
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Suppliers", value: "156", Icon: Building2, bg: "bg-blue-600" },
          { label: "Active", value: "138", Icon: CheckCircle, bg: "bg-emerald-600" },
          { label: "Under Review", value: "12", Icon: AlertTriangle, bg: "bg-amber-500" },
          { label: "Avg On-Time", value: "84%", Icon: Clock, bg: "bg-indigo-600" },
        ].map((m) => (
          <Card key={m.label} className="p-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${m.bg} flex-shrink-0`}>
              <m.Icon size={18} className="text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>{m.value}</div>
              <div className="text-xs text-slate-500">{m.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search suppliers by name, country or category..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {["All", "Low", "Medium", "High"].map((r) => (
              <button
                key={r}
                onClick={() => { setFilterRisk(r); setCurrentPage(1); }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filterRisk === r
                    ? "bg-blue-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r}
              </button>
            ))}
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors">
              <Plus size={13} /> Add Supplier
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["ID", "Supplier Name", "Country", "Category", "On-Time %", "Quality %", "Risk", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-slate-50 hover:bg-blue-50/50 transition-colors ${i % 2 !== 0 ? "bg-slate-50/40" : ""}`}
                >
                  <td className="py-3.5 px-3 text-[10px] text-slate-400 font-mono">{s.id}</td>
                  <td className="py-3.5 px-3 text-sm font-semibold text-slate-800 whitespace-nowrap">{s.name}</td>
                  <td className="py-3.5 px-3 text-xs text-slate-600">{s.country}</td>
                  <td className="py-3.5 px-3 text-xs text-slate-600">{s.category}</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 w-7">{s.onTime}%</span>
                      <ProgressBar value={s.onTime} color={s.onTime >= 85 ? "bg-emerald-500" : s.onTime >= 75 ? "bg-amber-500" : "bg-red-500"} />
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 w-7">{s.quality}%</span>
                      <ProgressBar value={s.quality} color="bg-blue-500" />
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <Badge label={s.risk} colorClass={riskColor[s.risk]} />
                  </td>
                  <td className="py-3.5 px-3">
                    <Badge label={s.status} colorClass={statusColor[s.status]} />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => setViewSupplier(s)} className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors" title="View"><Eye size={13} /></button>
                      <button onClick={() => setEditSupplier(s)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Edit"><Edit2 size={13} /></button>
                      <button onClick={() => setDeleteSupplier(s)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Building2 size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No suppliers match your search</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400">Showing {paginated.length} of {filtered.length} suppliers</span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => String(i + 1)).map((p) => (
              <button key={p} onClick={() => setCurrentPage(Number(p))}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${Number(p) === currentPage ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{p}</button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── Inventory Page ───────────────────────────────────────────────────────────

const InventoryPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", "Electronics", "Machinery", "Raw Materials", "Components"];
  const filtered = products.filter((p) => activeCategory === "All" || p.category === activeCategory);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<typeof products[0] | null>(null);
  const [editProduct, setEditProduct] = useState<typeof products[0] | null>(null);
  const [viewProduct, setViewProduct] = useState<typeof products[0] | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} />}
      {deleteProduct && (
        <ConfirmDialog
          message={`Remove "${deleteProduct.name}" from inventory? This action cannot be undone.`}
          onConfirm={() => { showToast("success", `${deleteProduct.name} removed from inventory`); setDeleteProduct(null); }}
          onCancel={() => setDeleteProduct(null)}
        />
      )}
      {editProduct && (
        <Modal title="Edit Product" onClose={() => setEditProduct(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Product Name</label>
              <input defaultValue={editProduct.name} className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Stock Quantity</label>
              <input type="number" defaultValue={editProduct.stock} className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Unit Price ($)</label>
              <input type="number" step="0.01" defaultValue={editProduct.price} className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { showToast("success", `${editProduct.name} updated`); setEditProduct(null); }}
                className="flex-1 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">Save Changes</button>
              <button onClick={() => setEditProduct(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {viewProduct && (
        <Modal title="Product Details" onClose={() => setViewProduct(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center">
                <Package size={24} className="text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{viewProduct.name}</div>
                <div className="text-sm text-slate-500">{viewProduct.category}</div>
                <Badge label={viewProduct.status} colorClass={statusColor[viewProduct.status]} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Product ID", value: viewProduct.id },
                { label: "Category", value: viewProduct.category },
                { label: "Stock Qty", value: viewProduct.stock.toLocaleString() },
                { label: "Reorder Point", value: viewProduct.reorder.toLocaleString() },
                { label: "Unit Price", value: `$${viewProduct.price.toFixed(2)}` },
                { label: "Status", value: viewProduct.status },
              ].map((f) => (
                <div key={f.label} className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1">{f.value}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setViewProduct(null)} className="w-full py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">Close</button>
          </div>
        </Modal>
      )}
      {/* Alert banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-xl flex-shrink-0"><XCircle size={17} className="text-red-600" /></div>
          <div>
            <div className="font-bold text-red-700 text-sm">2 Out of Stock</div>
            <div className="text-xs text-red-500 mt-0.5">Immediate reorder required</div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0"><AlertTriangle size={17} className="text-amber-600" /></div>
          <div>
            <div className="font-bold text-amber-700 text-sm">3 Low Stock Items</div>
            <div className="text-xs text-amber-500 mt-0.5">Below reorder threshold</div>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl flex-shrink-0"><CheckCircle size={17} className="text-emerald-600" /></div>
          <div>
            <div className="font-bold text-emerald-700 text-sm">18 Items Healthy</div>
            <div className="text-xs text-emerald-500 mt-0.5">Stock levels are optimal</div>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeCategory === c ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors flex-shrink-0">
            <Plus size={13} /> Add Product
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Product ID", "Product Name", "Category", "Stock Qty", "Reorder Point", "Fill Rate", "Unit Price", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const fillPct = p.reorder > 0 ? Math.min(100, (p.stock / (p.reorder * 3)) * 100) : 0;
                return (
                  <tr key={p.id} className={`border-b border-slate-50 hover:bg-blue-50/50 transition-colors ${i % 2 !== 0 ? "bg-slate-50/40" : ""}`}>
                    <td className="py-3.5 px-3 text-[10px] text-slate-400 font-mono">{p.id}</td>
                    <td className="py-3.5 px-3 text-sm font-semibold text-slate-800 whitespace-nowrap">{p.name}</td>
                    <td className="py-3.5 px-3 text-xs text-slate-600">{p.category}</td>
                    <td className="py-3.5 px-3">
                      <span className={`text-sm font-bold ${p.stock === 0 ? "text-red-600" : p.stock < p.reorder ? "text-amber-600" : "text-slate-800"}`}>
                        {p.stock.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-600">{p.reorder.toLocaleString()}</td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${fillPct > 50 ? "bg-emerald-500" : fillPct > 20 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${fillPct}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400">{fillPct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-sm font-semibold text-slate-800">${p.price.toFixed(2)}</td>
                    <td className="py-3.5 px-3"><Badge label={p.status} colorClass={statusColor[p.status]} /></td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => setViewProduct(p)} className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors" title="View"><Eye size={13} /></button>
                        <button onClick={() => setEditProduct(p)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Edit"><Edit2 size={13} /></button>
                        <button onClick={() => setDeleteProduct(p)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors" title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ─── Orders Page ──────────────────────────────────────────────────────────────

// Timeline steps definition
const TIMELINE_STEPS = [
  "Order Placed",
  "Confirmed by Supplier",
  "In Production",
  "Quality Inspection",
  "Shipped / Dispatched",
  "Out for Delivery",
  "Delivered",
];

type OrderStatus = "Processing" | "Delayed" | "In Transit" | "Delivered";

// How many steps are complete for each status
const STATUS_STEP_COUNT: Record<OrderStatus, number> = {
  Processing: 2,  // Placed + Confirmed
  Delayed: 3,     // Placed + Confirmed + In Production (stalled)
  "In Transit": 5, // up to Shipped
  Delivered: 7,    // all done
};

function getTimeline(order: typeof orders[0]) {
  const status = order.status as OrderStatus;
  const doneCount = STATUS_STEP_COUNT[status] ?? 2;
  const baseDate = new Date(2024, 5, parseInt(order.date.replace("Jun ", ""), 10));

  return TIMELINE_STEPS.map((label, i) => {
    const done = i < doneCount;
    let date = "—";
    if (done) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i * 2);
      date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } else if (i === doneCount && status !== "Delivered") {
      // Next pending step — show ETA if available
      if (label === "Delivered") date = order.eta;
      else {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + i * 2);
        date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    }
    return { label, done };
  });
}

const OrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showNewOrder, setShowNewOrder] = useState(false);

  const selected = orders.find((o) => o.id === selectedOrder) ?? null;
  const timeline = selected ? getTimeline(selected) : [];

  // Status-specific footer messages
  const statusNote: Record<OrderStatus, { text: string; bg: string; icon: React.ReactNode }> = {
    Processing: { text: "Order is being processed by the supplier.", bg: "bg-blue-50", icon: <Clock size={12} className="text-blue-500" /> },
    Delayed: { text: `Shipment delayed — expected by ${selected?.eta ?? "—"}.`, bg: "bg-amber-50", icon: <AlertTriangle size={12} className="text-amber-500" /> },
    "In Transit": { text: `In transit — estimated delivery ${selected?.eta ?? "—"}.`, bg: "bg-indigo-50", icon: <Truck size={12} className="text-indigo-500" /> },
    Delivered: { text: "Order delivered successfully. All steps complete.", bg: "bg-emerald-50", icon: <CheckCircle size={12} className="text-emerald-600" /> },
  };
  const note = selected ? statusNote[selected.status as OrderStatus] : null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {showNewOrder && <NewOrderModal onClose={() => setShowNewOrder(false)} />}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: "2,847", Icon: ShoppingCart, bg: "bg-blue-600" },
          { label: "Delivered", value: "2,641", Icon: CheckCircle, bg: "bg-emerald-600" },
          { label: "In Transit", value: "163", Icon: Truck, bg: "bg-indigo-600" },
          { label: "Delayed", value: "43", Icon: AlertTriangle, bg: "bg-red-500" },
        ].map((m) => (
          <Card key={m.label} className="p-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${m.bg} flex-shrink-0`}><m.Icon size={18} className="text-white" /></div>
            <div>
              <div className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>{m.value}</div>
              <div className="text-xs text-slate-500">{m.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Orders table */}
        <Card className="lg:col-span-2 p-6">
          <SectionHeader
            title="Recent Orders"
            subtitle="Click a row to track shipment"
            action={
              <button onClick={() => setShowNewOrder(true)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors">
                <Plus size={13} /> New Order
              </button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Order ID", "Supplier", "Product", "Qty", "Order Date", "ETA", "Value", "Status"].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedOrder(selectedOrder === o.id ? null : o.id)}
                    className={`border-b border-slate-50 cursor-pointer transition-colors ${
                      selectedOrder === o.id
                        ? "bg-blue-50 ring-1 ring-inset ring-blue-200"
                        : i % 2 !== 0
                        ? "bg-slate-50/40 hover:bg-blue-50/40"
                        : "hover:bg-blue-50/40"
                    }`}
                  >
                    <td className="py-3.5 px-3 text-xs font-mono font-semibold text-blue-600">{o.id}</td>
                    <td className="py-3.5 px-3 text-xs font-medium text-slate-700 whitespace-nowrap">{o.supplier}</td>
                    <td className="py-3.5 px-3 text-xs text-slate-500">{o.product}</td>
                    <td className="py-3.5 px-3 text-xs font-bold text-slate-800">{o.qty}</td>
                    <td className="py-3.5 px-3 text-xs text-slate-400">{o.date}</td>
                    <td className="py-3.5 px-3 text-xs text-slate-400">{o.eta}</td>
                    <td className="py-3.5 px-3 text-sm font-semibold text-slate-800">${o.value.toLocaleString()}</td>
                    <td className="py-3.5 px-3"><Badge label={o.status} colorClass={statusColor[o.status]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Dynamic Timeline */}
        <Card className="p-6">
          <SectionHeader
            title="Shipment Timeline"
            subtitle={selected ? `Tracking: ${selected.id}` : "Select an order to track"}
          />
          {selected ? (
            <div className="relative mt-2">
              {/* Vertical connector */}
              <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-200" />
              <div className="space-y-4">
                {timeline.map((step, i) => {
                  const isCurrentStep = !step.done && timeline.slice(0, i).every((s) => s.done);
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 relative transition-all ${
                        step.done
                          ? "bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-200"
                          : isCurrentStep
                          ? selected.status === "Delayed"
                            ? "bg-amber-50 border-amber-400 ring-2 ring-amber-200"
                            : "bg-blue-50 border-blue-400 ring-2 ring-blue-200"
                          : "bg-white border-slate-200"
                      }`}>
                        {step.done ? (
                          <CheckCircle size={14} className="text-white" />
                        ) : isCurrentStep ? (
                          selected.status === "Delayed"
                            ? <AlertTriangle size={12} className="text-amber-500" />
                            : <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <div className="pt-1 flex-1">
                        <div className={`text-xs font-semibold ${
                          step.done ? "text-slate-800"
                          : isCurrentStep
                            ? selected.status === "Delayed" ? "text-amber-700" : "text-blue-700"
                          : "text-slate-400"
                        }`}>{step.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {step.done
                            ? (() => {
                                const base = new Date(2024, 5, parseInt(selected.date.replace("Jun ", ""), 10));
                                base.setDate(base.getDate() + i * 2);
                                return base.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
                              })()
                            : isCurrentStep && selected.status !== "Delivered"
                            ? `ETA: ${selected.eta}`
                            : "Pending"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {note && (
                <div className={`mt-5 pt-4 border-t border-slate-100`}>
                  <div className={`flex items-center gap-2 text-xs rounded-xl px-3 py-2.5 font-medium ${note.bg} ${
                    selected.status === "Delayed" ? "text-amber-700"
                    : selected.status === "Delivered" ? "text-emerald-700"
                    : selected.status === "In Transit" ? "text-indigo-700"
                    : "text-blue-700"
                  }`}>
                    {note.icon}
                    <span>{note.text}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-slate-300">
              <Truck size={40} className="mb-3 opacity-50" />
              <p className="text-sm font-medium text-slate-400">Select an order row</p>
              <p className="text-xs text-slate-300 mt-1">to view shipment tracking</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// ─── Risk Analysis Page ───────────────────────────────────────────────────────

const riskCellStyle = (level: number) => {
  if (level === 1) return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  if (level === 2) return "bg-amber-100 text-amber-700 border border-amber-200";
  return "bg-red-100 text-red-700 border border-red-200";
};

const riskLabelMap = ["Low", "Med", "High"];

const RiskPage = () => (
  <div className="flex-1 overflow-y-auto p-6 space-y-5">
    {/* Summary cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        {
          label: "High Risk Orders",
          value: "12",
          pct: "5.9%",
          border: "border-red-200",
          bg: "bg-red-50",
          text: "text-red-700",
          bar: "bg-red-500",
          Icon: AlertOctagon,
        },
        {
          label: "Medium Risk Orders",
          value: "28",
          pct: "13.8%",
          border: "border-amber-200",
          bg: "bg-amber-50",
          text: "text-amber-700",
          bar: "bg-amber-500",
          Icon: AlertTriangle,
        },
        {
          label: "Low Risk Orders",
          value: "163",
          pct: "80.3%",
          border: "border-emerald-200",
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          bar: "bg-emerald-500",
          Icon: CheckCircle,
        },
      ].map((c) => (
        <div key={c.label} className={`border ${c.border} ${c.bg} rounded-2xl p-5`}>
          <div className="flex items-center justify-between mb-4">
            <c.Icon size={22} className={c.text} />
            <span className={`text-xs font-bold ${c.text} bg-white/60 px-2.5 py-1 rounded-full`}>{c.pct} of total</span>
          </div>
          <div className="text-4xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{c.value}</div>
          <div className={`text-sm font-semibold ${c.text} mb-3`}>{c.label}</div>
          <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
            <div className={`h-full ${c.bar} rounded-full`} style={{ width: c.pct }} />
          </div>
        </div>
      ))}
    </div>

    {/* Heatmap + Delay trend */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card className="p-6">
        <SectionHeader title="Risk Heat Map" subtitle="Risk level by supplier and category" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-2 px-2 text-slate-500 font-bold text-[10px] uppercase tracking-wide">Supplier</th>
                {["Delay", "Quality", "Inventory", "Transport", "Financial"].map((h) => (
                  <th key={h} className="text-center py-2 px-2 text-slate-500 font-bold text-[10px] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmap.map((row) => (
                <tr key={row.supplier} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-2 font-semibold text-slate-700 whitespace-nowrap">{row.supplier}</td>
                  {[row.delay, row.quality, row.inventory, row.transport, row.financial].map((v, i) => (
                    <td key={i} className="py-2.5 px-2 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-lg font-semibold text-[10px] ${riskCellStyle(v)}`}>
                        {riskLabelMap[v - 1]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeader title="Delivery Delay Trends" subtitle="Risk escalation over 6 months" />
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={delayTrend} barSize={16} barGap={2} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar dataKey="high" name="High Risk" fill="#ef4444" stackId="a" />
            <Bar dataKey="medium" name="Medium Risk" fill="#f59e0b" stackId="a" />
            <Bar dataKey="low" name="Low Risk" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>

    {/* Supplier Risk Analysis */}
    <Card className="p-6">
      <SectionHeader title="Supplier Risk Analysis" subtitle="Composite risk score and contributing factors" />
      <div className="space-y-4">
        {[
          { name: "Eastern Trade Corp", score: 82, level: "High", factors: ["Delivery delay 35%", "On-time rate 65%"] },
          { name: "ProSource Materials", score: 71, level: "High", factors: ["Inventory shortage", "Geopolitical exposure"] },
          { name: "TechParts Inc.", score: 54, level: "Medium", factors: ["Quality inconsistency", "FX exposure"] },
          { name: "Global Logistics Co", score: 48, level: "Medium", factors: ["Port congestion risk", "Capacity constraints"] },
          { name: "Nordic Supplies", score: 22, level: "Low", factors: ["Stable performance", "Long-term contract"] },
          { name: "FastShip Ltd", score: 18, level: "Low", factors: ["Excellent track record", "Diversified routes"] },
          { name: "Acme Manufacturing", score: 16, level: "Low", factors: ["High reliability", "Domestic supplier"] },
        ].map((s) => (
          <div key={s.name} className="flex items-center gap-4">
            <div className="w-40 text-sm font-semibold text-slate-700 flex-shrink-0 whitespace-nowrap">{s.name}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${s.level === "High" ? "bg-red-500" : s.level === "Medium" ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 w-6 text-right">{s.score}</span>
                <Badge label={s.level} colorClass={riskColor[s.level]} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {s.factors.map((f) => (
                  <span key={f} className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ─── Optimization Page ────────────────────────────────────────────────────────

const OptimizationPage = () => (
  <div className="flex-1 overflow-y-auto p-6 space-y-5">
    {/* Impact KPIs */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Projected Savings", value: "$340K", note: "This quarter", Icon: DollarSign, bg: "bg-emerald-600" },
        { label: "Delivery Improvement", value: "+23%", note: "On-time rate gain", Icon: TrendingUp, bg: "bg-blue-600" },
        { label: "Inventory Reduction", value: "18%", note: "Excess stock freed", Icon: Package, bg: "bg-indigo-600" },
        { label: "Supplier Score Gain", value: "+12 pts", note: "Avg performance", Icon: Star, bg: "bg-amber-500" },
      ].map((m) => (
        <Card key={m.label} className="p-5">
          <div className={`p-2.5 rounded-xl ${m.bg} w-fit mb-3`}><m.Icon size={18} className="text-white" /></div>
          <div className="text-2xl font-bold text-slate-800 leading-none" style={{ fontFamily: "'Poppins', sans-serif" }}>{m.value}</div>
          <div className="text-sm font-semibold text-slate-700 mt-1.5">{m.label}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{m.note}</div>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Supplier recommendations */}
      <Card className="p-6">
        <SectionHeader title="Best Supplier Recommendations" subtitle="AI-ranked by composite performance score" />
        <div className="space-y-2">
          {[
            { rank: 1, name: "FastShip Ltd", score: 94, country: "UK", saving: "$28K", reason: "Best on-time delivery, lowest risk profile across all categories" },
            { rank: 2, name: "Acme Manufacturing", score: 91, country: "USA", saving: "$21K", reason: "High quality scores, predictable pricing, domestic advantage" },
            { rank: 3, name: "Nordic Supplies", score: 88, country: "Sweden", saving: "$17K", reason: "Excellent quality, fast lead times, favorable trade terms" },
            { rank: 4, name: "Global Logistics Co", score: 83, country: "China", saving: "$14K", reason: "Cost-effective, broad SKU coverage, proven capacity" },
          ].map((s) => (
            <div key={s.rank} className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-blue-50/60 transition-colors group">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                s.rank === 1 ? "bg-amber-100 text-amber-700" : s.rank === 2 ? "bg-slate-100 text-slate-600" : "bg-slate-50 text-slate-500"
              }`}>
                {s.rank === 1 ? <Star size={14} /> : s.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-sm text-slate-800">{s.name}</span>
                  <span className="text-xs text-slate-400">{s.country}</span>
                  <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-md">{s.score}/100</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{s.reason}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-emerald-600">{s.saving}</div>
                <div className="text-[10px] text-slate-400">est. savings</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Inventory optimization */}
      <Card className="p-6">
        <SectionHeader title="Inventory Optimization" subtitle="AI-driven reorder and stock suggestions" />
        <div className="space-y-3">
          {[
            { product: "Pneumatic Valve Kit", action: "Reorder Immediately", qty: "+200", urgency: "Critical", border: "border-red-200", bg: "bg-red-50", badge: "bg-red-100 text-red-700" },
            { product: "Hydraulic Pump Assembly", action: "Reorder Soon", qty: "+50", urgency: "High", border: "border-amber-200", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700" },
            { product: "Rubber Sealing Gaskets", action: "Reorder Soon", qty: "+100", urgency: "Medium", border: "border-amber-200", bg: "bg-yellow-50", badge: "bg-yellow-100 text-yellow-700" },
            { product: "Carbon Steel Sheets", action: "Reduce Excess Stock", qty: "-500", urgency: "Optimize", border: "border-blue-200", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700" },
          ].map((s) => (
            <div key={s.product} className={`p-3.5 rounded-xl border ${s.border} ${s.bg}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-slate-800">{s.product}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.action} · <span className="font-semibold">{s.qty} units</span></div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${s.badge}`}>{s.urgency}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* Transport + Cost */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card className="p-6">
        <SectionHeader title="Transportation Efficiency" subtitle="Route and mode analysis" />
        <div className="space-y-4">
          {[
            { route: "USA → HQ Warehouse", mode: "Air Freight", eff: 92, saving: "+$4.2K", trend: "up" },
            { route: "Germany → HQ", mode: "Sea + Rail", eff: 78, saving: "+$8.1K", trend: "up" },
            { route: "India → HQ", mode: "Air Freight", eff: 61, saving: "-$2.3K", trend: "down" },
            { route: "China → HQ", mode: "Sea Freight", eff: 85, saving: "+$6.7K", trend: "up" },
            { route: "Sweden → HQ", mode: "Air Freight", eff: 88, saving: "+$3.4K", trend: "up" },
          ].map((r) => (
            <div key={r.route} className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-50 rounded-lg flex-shrink-0"><Truck size={13} className="text-blue-600" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-700 truncate">{r.route}</span>
                  <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0">{r.mode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${r.eff >= 80 ? "bg-emerald-500" : r.eff >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${r.eff}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 w-6">{r.eff}%</span>
                </div>
              </div>
              <span className={`text-xs font-bold flex-shrink-0 ml-2 ${r.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>{r.saving}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <SectionHeader title="Cost Reduction Recommendations" subtitle="Ranked by estimated annual impact" />
        <div className="space-y-2.5">
          {[
            { title: "Implement demand forecasting AI", impact: "$67K", difficulty: "Complex", Icon: Activity, badge: "bg-purple-100 text-purple-700" },
            { title: "Switch to sea freight for non-urgent orders", impact: "$41K", difficulty: "Medium", Icon: Globe, badge: "bg-blue-100 text-blue-700" },
            { title: "Consolidate India-origin shipments", impact: "$23K", difficulty: "Easy", Icon: Package2, badge: "bg-emerald-100 text-emerald-700" },
            { title: "Renegotiate TechParts supply contract", impact: "$18K", difficulty: "Medium", Icon: Award, badge: "bg-blue-100 text-blue-700" },
            { title: "Automate PO generation for low-risk SKUs", impact: "$12K", difficulty: "Easy", Icon: CheckCircle, badge: "bg-emerald-100 text-emerald-700" },
          ].map((r) => (
            <div key={r.title} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 transition-colors group">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0"><r.Icon size={13} className="text-blue-700" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">{r.title}</div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${r.badge}`}>{r.difficulty}</span>
              </div>
              <div className="text-sm font-bold text-emerald-600 flex-shrink-0">{r.impact}/yr</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

// ─── Reports Page ─────────────────────────────────────────────────────────────

const ReportsPage = () => {
  const [period, setPeriod] = useState("monthly");
  const [refreshing, setRefreshing] = useState(false);
  const [importedData, setImportedData] = useState<string[][] | null>(null);
  const [importFileName, setImportFileName] = useState("");
  const [showImportPreview, setShowImportPreview] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null);

  // ── Dynamic Data based on Period ──────────────────────────────────────────
  const getKPIs = () => {
    if (period === "quarterly") {
      return [
        { label: "Total Revenue", value: "$14.15M", change: "+12%", trend: "up" as const },
        { label: "Total Cost", value: "$8.65M", change: "+6%", trend: "down" as const },
        { label: "Gross Profit", value: "$5.50M", change: "+23%", trend: "up" as const },
        { label: "Orders Fulfilled", value: "8,102", change: "+10%", trend: "up" as const },
      ];
    } else if (period === "yearly") {
      return [
        { label: "Total Revenue", value: "$52.80M", change: "+15%", trend: "up" as const },
        { label: "Total Cost", value: "$32.10M", change: "+8%", trend: "down" as const },
        { label: "Gross Profit", value: "$20.70M", change: "+28%", trend: "up" as const },
        { label: "Orders Fulfilled", value: "31,450", change: "+11%", trend: "up" as const },
      ];
    } else {
      // monthly
      return [
        { label: "Total Revenue", value: "$4.62M", change: "+18%", trend: "up" as const },
        { label: "Total Cost", value: "$2.80M", change: "+9%", trend: "down" as const },
        { label: "Gross Profit", value: "$1.82M", change: "+31%", trend: "up" as const },
        { label: "Orders Fulfilled", value: "2,641", change: "+14%", trend: "up" as const },
      ];
    }
  };

  const getRevenueChartData = () => {
    if (period === "quarterly") {
      return [
        { month: "Q1-23", revenue: 2.10, cost: 1.35 },
        { month: "Q2-23", revenue: 2.45, cost: 1.50 },
        { month: "Q3-23", revenue: 2.30, cost: 1.42 },
        { month: "Q4-23", revenue: 2.90, cost: 1.80 },
        { month: "Q1-24", revenue: 3.10, cost: 1.95 },
        { month: "Q2-24", revenue: 3.30, cost: 2.05 },
      ];
    } else if (period === "yearly") {
      return [
        { month: "2021", revenue: 38.5, cost: 25.1 },
        { month: "2022", revenue: 42.0, cost: 27.2 },
        { month: "2023", revenue: 46.8, cost: 29.5 },
        { month: "2024", revenue: 52.8, cost: 32.1 },
      ];
    } else {
      // monthly
      return [
        { month: "Jan", revenue: 680, cost: 420 },
        { month: "Feb", revenue: 590, cost: 380 },
        { month: "Mar", revenue: 820, cost: 510 },
        { month: "Apr", revenue: 780, cost: 460 },
        { month: "May", revenue: 920, cost: 540 },
        { month: "Jun", revenue: 830, cost: 490 },
      ];
    }
  };

  const getDelayTrendData = () => {
    if (period === "quarterly") {
      return [
        { month: "Q1-23", high: 18, medium: 42, low: 95 },
        { month: "Q2-23", high: 22, medium: 38, low: 88 },
        { month: "Q3-23", high: 15, medium: 45, low: 102 },
        { month: "Q4-23", high: 25, medium: 50, low: 110 },
        { month: "Q1-24", high: 20, medium: 40, low: 98 },
        { month: "Q2-24", high: 28, medium: 55, low: 120 },
      ];
    } else if (period === "yearly") {
      return [
        { month: "2021", high: 85, medium: 180, low: 420 },
        { month: "2022", high: 92, medium: 195, low: 450 },
        { month: "2023", high: 78, medium: 210, low: 480 },
        { month: "2024", high: 95, medium: 230, low: 520 },
      ];
    } else {
      // monthly
      return [
        { month: "Jan", high: 5, medium: 12, low: 28 },
        { month: "Feb", high: 4, medium: 10, low: 25 },
        { month: "Mar", high: 7, medium: 15, low: 32 },
        { month: "Apr", high: 6, medium: 11, low: 29 },
        { month: "May", high: 9, medium: 18, low: 35 },
        { month: "Jun", high: 12, medium: 28, low: 43 },
      ];
    }
  };

  const formatYValue = (v: number) => {
    if (period === "monthly") return `$${v}K`;
    return `$${v}M`;
  };

  // ── Real CSV / Excel download ─────────────────────────────────────────────
  const handleExportExcel = () => {
    const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);
    const rows = [
      ["ChainFlow Supply Chain Report", periodLabel, "", "", ""],
      ["Generated", new Date().toLocaleString(), "", "", ""],
      ["", "", "", "", ""],
      ["=== ORDER SUMMARY ===", "", "", "", ""],
      ["Order ID", "Supplier", "Product", "Qty", "Status", "Value ($)"],
      ...orders.map((o) => [o.id, o.supplier, o.product, o.qty, o.status, o.value.toFixed(2)]),
      ["", "", "", "", "", ""],
      ["=== SUPPLIER SUMMARY ===", "", "", "", "", ""],
      ["Supplier ID", "Name", "Country", "Category", "On-Time %", "Quality %", "Risk"],
      ...suppliers.map((s) => [s.id, s.name, s.country, s.category, s.onTime, s.quality, s.risk]),
      ["", "", "", "", "", "", ""],
      ["=== INVENTORY SUMMARY ===", "", "", "", "", "", ""],
      ["Product ID", "Name", "Category", "Stock Qty", "Reorder Point", "Unit Price ($)", "Status"],
      ...products.map((p) => [p.id, p.name, p.category, p.stock, p.reorder, p.price.toFixed(2), p.status]),
    ];

    const csv = rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chainflow_report_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("success", "Excel/CSV report downloaded successfully");
  };

  // ── Real PDF via browser print ─────────────────────────────────────────────
  const handleExportPDF = () => {
    const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) { showToast("error", "Please allow pop-ups to export PDF"); return; }

    const orderRows = orders.map((o) =>
      `<tr><td>${o.id}</td><td>${o.supplier}</td><td>${o.product}</td><td>${o.qty}</td><td>${o.status}</td><td>$${o.value.toLocaleString()}</td></tr>`
    ).join("");

    const supplierRows = suppliers.map((s) =>
      `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.country}</td><td>${s.category}</td><td>${s.onTime}%</td><td>${s.quality}%</td><td>${s.risk}</td></tr>`
    ).join("");

    const inventoryRows = products.map((p) =>
      `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.category}</td><td>${p.stock.toLocaleString()}</td><td>${p.reorder.toLocaleString()}</td><td>$${p.price.toFixed(2)}</td><td>${p.status}</td></tr>`
    ).join("");

    const activeKPIs = getKPIs();

    win.document.write(`
      <!DOCTYPE html><html><head><title>ChainFlow ${periodLabel} Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #1e293b; font-size: 12px; }
        h1 { color: #1e3a8a; font-size: 20px; margin-bottom: 4px; }
        .subtitle { color: #64748b; font-size: 12px; margin-bottom: 24px; }
        h2 { color: #1e3a8a; font-size: 14px; margin-top: 28px; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #1e3a8a; color: white; text-align: left; padding: 6px 10px; }
        td { padding: 5px 10px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) td { background: #f8faff; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
        .kpi { background: #f0f4ff; border-radius: 8px; padding: 12px; }
        .kpi .val { font-size: 22px; font-weight: bold; color: #1e3a8a; }
        .kpi .lbl { font-size: 10px; color: #64748b; margin-top: 2px; }
        @media print { button { display: none; } }
      </style></head><body>
      <h1>ChainFlow Supply Chain Report</h1>
      <div class="subtitle">Period: ${periodLabel} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString()}</div>

      <div class="kpi-grid">
        <div class="kpi"><div class="val">${activeKPIs[0].value}</div><div class="lbl">${activeKPIs[0].label}</div></div>
        <div class="kpi"><div class="val">${activeKPIs[1].value}</div><div class="lbl">${activeKPIs[1].label}</div></div>
        <div class="kpi"><div class="val">${activeKPIs[2].value}</div><div class="lbl">${activeKPIs[2].label}</div></div>
        <div class="kpi"><div class="val">${activeKPIs[3].value}</div><div class="lbl">${activeKPIs[3].label}</div></div>
      </div>

      <h2>Order Summary</h2>
      <table><thead><tr><th>Order ID</th><th>Supplier</th><th>Product</th><th>Qty</th><th>Status</th><th>Value</th></tr></thead>
      <tbody>${orderRows}</tbody></table>

      <h2>Supplier Performance</h2>
      <table><thead><tr><th>ID</th><th>Supplier</th><th>Country</th><th>Category</th><th>On-Time</th><th>Quality</th><th>Risk</th></tr></thead>
      <tbody>${supplierRows}</tbody></table>

      <h2>Inventory Status</h2>
      <table><thead><tr><th>ID</th><th>Product</th><th>Category</th><th>Stock</th><th>Reorder Pt.</th><th>Unit Price</th><th>Status</th></tr></thead>
      <tbody>${inventoryRows}</tbody></table>

      <script>window.onload = function(){ window.print(); }</script>
      </body></html>
    `);
    win.document.close();
    showToast("success", "PDF print dialog opened — save as PDF");
  };

  // ── Import CSV / Excel ─────────────────────────────────────────────────────
  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setImportFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        // Parse CSV: handle quoted fields
        const parseCSV = (raw: string): string[][] => {
          const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim());
          return lines.map((line) => {
            const cells: string[] = [];
            let cur = "", inQ = false;
            for (let i = 0; i < line.length; i++) {
              if (line[i] === '"') {
                if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
                else inQ = !inQ;
              } else if (line[i] === "," && !inQ) {
                cells.push(cur); cur = "";
              } else cur += line[i];
            }
            cells.push(cur);
            return cells;
          });
        };
        const parsed = parseCSV(text);
        setImportedData(parsed);
        setShowImportPreview(true);
        showToast("success", `${file.name} imported — ${parsed.length} rows`);
      };
      reader.readAsText(file, "utf-8");
    };
    input.click();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    showToast("info", "Report data refreshed");
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Import Preview Modal */}
      {showImportPreview && importedData && (
        <Modal title={`Import Preview — ${importFileName}`} onClose={() => setShowImportPreview(false)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-emerald-800">File imported successfully</div>
                <div className="text-xs text-emerald-600">{importedData.length} rows · {importedData[0]?.length ?? 0} columns</div>
              </div>
            </div>
            <div className="overflow-auto max-h-80 rounded-xl border border-slate-200">
              <table className="w-full text-xs min-w-max">
                {importedData.length > 0 && (
                  <thead>
                    <tr className="bg-blue-900">
                      {importedData[0].map((h, i) => (
                        <th key={i} className="py-2.5 px-3 text-left text-white font-semibold whitespace-nowrap">{h || `Col ${i+1}`}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {importedData.slice(1).map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="py-2 px-3 text-slate-700 border-b border-slate-100 whitespace-nowrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const parseImportedCSV = (data: string[][]) => {
                    let mode: "orders" | "suppliers" | "products" | null = null;
                    const newOrders: typeof orders = [];
                    const newSuppliers: typeof suppliers = [];
                    const newProducts: typeof products = [];

                    for (const row of data) {
                      if (!row || row.length === 0) continue;
                      const firstCell = row[0]?.trim();
                      if (!firstCell) continue;

                      if (firstCell.includes("=== ORDER SUMMARY ===")) {
                        mode = "orders";
                        continue;
                      } else if (firstCell.includes("=== SUPPLIER SUMMARY ===")) {
                        mode = "suppliers";
                        continue;
                      } else if (firstCell.includes("=== INVENTORY SUMMARY ===")) {
                        mode = "products";
                        continue;
                      }

                      if (
                        firstCell === "Order ID" ||
                        firstCell === "Supplier ID" ||
                        firstCell === "Product ID" ||
                        firstCell.includes("=== ") ||
                        firstCell.includes("ChainFlow") ||
                        firstCell.includes("Generated")
                      ) {
                        continue;
                      }

                      if (mode === "orders") {
                        if (row.length >= 6) {
                          newOrders.push({
                            id: row[0],
                            supplier: row[1],
                            product: row[2],
                            qty: parseInt(row[3]) || 0,
                            status: row[4] as any,
                            value: parseFloat(row[5]) || 0,
                            date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
                            eta: new Date(Date.now() + 7 * 24 * 3600 * 1000).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
                          });
                        }
                      } else if (mode === "suppliers") {
                        if (row.length >= 7) {
                          newSuppliers.push({
                            id: row[0],
                            name: row[1],
                            country: row[2],
                            category: row[3],
                            onTime: parseInt(row[4]) || 0,
                            quality: parseInt(row[5]) || 0,
                            risk: row[6] as any,
                            status: "Active",
                          });
                        }
                      } else if (mode === "products") {
                        if (row.length >= 7) {
                          newProducts.push({
                            id: row[0],
                            name: row[1],
                            category: row[2],
                            stock: parseInt(row[3]) || 0,
                            reorder: parseInt(row[4]) || 0,
                            price: parseFloat(row[5]) || 0,
                            status: row[6] as any,
                          });
                        }
                      }
                    }

                    if (newOrders.length === 0 && newSuppliers.length === 0 && newProducts.length === 0 && data.length > 1) {
                      const headers = data[0].map(h => h.toLowerCase());
                      if (headers.includes("order id") || headers.includes("qty")) {
                        data.slice(1).forEach(row => {
                          if (row.length >= 6) {
                            newOrders.push({
                              id: row[0],
                              supplier: row[1],
                              product: row[2],
                              qty: parseInt(row[3]) || 0,
                              status: row[4] as any,
                              value: parseFloat(row[5]) || 0,
                              date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
                              eta: new Date(Date.now() + 7 * 24 * 3600 * 1000).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
                            });
                          }
                        });
                      } else if (headers.includes("supplier id") || headers.includes("quality %")) {
                        data.slice(1).forEach(row => {
                          if (row.length >= 7) {
                            newSuppliers.push({
                              id: row[0],
                              name: row[1],
                              country: row[2],
                              category: row[3],
                              onTime: parseInt(row[4]) || 0,
                              quality: parseInt(row[5]) || 0,
                              risk: row[6] as any,
                              status: "Active",
                            });
                          }
                        });
                      } else if (headers.includes("product id") || headers.includes("stock qty")) {
                        data.slice(1).forEach(row => {
                          if (row.length >= 7) {
                            newProducts.push({
                              id: row[0],
                              name: row[1],
                              category: row[2],
                              stock: parseInt(row[3]) || 0,
                              reorder: parseInt(row[4]) || 0,
                              price: parseFloat(row[5]) || 0,
                              status: row[6] as any,
                            });
                          }
                        });
                      }
                    }

                    return { newOrders, newSuppliers, newProducts };
                  };

                  const { newOrders, newSuppliers, newProducts } = parseImportedCSV(importedData);
                  
                  // Append items to global lists
                  orders.push(...newOrders);
                  suppliers.push(...newSuppliers);
                  products.push(...newProducts);

                  const logMsg = `Imported ${newOrders.length} orders, ${newSuppliers.length} suppliers, and ${newProducts.length} products from ${importFileName}`;
                  localStorage.setItem("last_import_log", logMsg);

                  showToast("success", `${newOrders.length + newSuppliers.length + newProducts.length} records applied to system`);
                  (window as any).triggerAppRefresh?.();
                  setShowImportPreview(false);
                }}
                className="flex-1 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
              >
                Apply Import
              </button>
              <button onClick={() => setShowImportPreview(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                Discard
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Card className="px-5 py-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-1.5">
            {["monthly", "quarterly", "yearly"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${period === p ? "bg-blue-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleImportClick} className="flex items-center gap-1.5 px-3.5 py-2 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-50 transition-colors">
              <Import size={13} /> Import Excel
            </button>
            <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3.5 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors">
              <FileText size={13} /> Export PDF
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3.5 py-2 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-50 transition-colors">
              <ArrowUpFromLine size={13} /> Export Excel
            </button>
            <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors">
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </Card>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {getKPIs().map((k) => (
          <Card key={k.label} className="p-5">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{k.label}</div>
            <div className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>{k.value}</div>
            <div className={`flex items-center gap-1 text-xs font-semibold mt-1.5 ${k.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
              {k.trend === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {k.change} vs prior period
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <SectionHeader
            title="Revenue vs Cost"
            subtitle={`${period.charAt(0).toUpperCase() + period.slice(1)} financial performance (${period === "monthly" ? "$K" : "$M"})`}
          />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={getRevenueChartData()} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={formatYValue} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatYValue(v), ""]} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#gRev)" name="Revenue" />
              <Area type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} fill="url(#gCost)" name="Cost" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <SectionHeader title="Risk Level Trends" subtitle={`Delayed orders by severity (${period})`} />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={getDelayTrendData()} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3.5, fill: "#ef4444" }} name="High Risk" />
              <Line type="monotone" dataKey="medium" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} name="Medium Risk" />
              <Line type="monotone" dataKey="low" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} name="Low Risk" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Report files */}
      <Card className="p-6">
        <SectionHeader title="Generated Reports" subtitle="Download or view saved reports" />
        <div className="space-y-2.5">
          {[
            { name: "Supply Chain Risk Report — June 2024", date: "Jun 21, 2024", size: "2.4 MB", type: "PDF" },
            { name: "Supplier Performance Analysis — Q2 2024", date: "Jun 15, 2024", size: "1.8 MB", type: "Excel" },
            { name: "Inventory Optimization Report — June 2024", date: "Jun 10, 2024", size: "890 KB", type: "PDF" },
            { name: "Order Fulfillment Summary — May 2024", date: "May 31, 2024", size: "1.2 MB", type: "Excel" },
            { name: "Annual Supply Chain Review 2023", date: "Jan 15, 2024", size: "5.6 MB", type: "PDF" },
          ].map((r) => (
            <div key={r.name} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
              onClick={() => showToast("info", `Opening ${r.name}...`)}>
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${r.type === "PDF" ? "bg-red-100" : "bg-emerald-100"}`}>
                <FileText size={16} className={r.type === "PDF" ? "text-red-600" : "text-emerald-700"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">{r.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{r.date} · {r.size}</div>
              </div>
              <Badge label={r.type} colorClass={r.type === "PDF" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"} />
              <button onClick={(e) => { e.stopPropagation(); showToast("success", `Downloading ${r.name}...`); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-all">
                <Download size={14} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── Profile Page ─────────────────────────────────────────────────────────────

interface Notifications {
  emailAlerts: boolean;
  smsAlerts: boolean;
  riskAlerts: boolean;
  weeklyReport: boolean;
  deliveryUpdates: boolean;
}

const ProfilePage = () => {
  const [notifs, setNotifs] = useState<Notifications>({
    emailAlerts: true,
    smsAlerts: false,
    riskAlerts: true,
    weeklyReport: true,
    deliveryUpdates: false,
  });

  const notifLabels: Record<keyof Notifications, { title: string; desc: string }> = {
    emailAlerts: { title: "Email Notifications", desc: "All activity updates via email" },
    smsAlerts: { title: "SMS Alerts", desc: "Critical alerts via text message" },
    riskAlerts: { title: "High Risk Alerts", desc: "Immediate notification for new risk flags" },
    weeklyReport: { title: "Weekly Summary Report", desc: "Auto-generated every Monday morning" },
    deliveryUpdates: { title: "Real-time Delivery Updates", desc: "Live tracking notifications" },
  };

  const toggleNotif = (key: keyof Notifications) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <Card className="p-6 text-center">
          <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold text-white mb-4"
            style={{ background: "linear-gradient(135deg, #2563eb, #6366f1)" }}>
            AK
          </div>
          <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>Alex Kumar</h3>
          <p className="text-sm text-slate-500 mt-0.5">Supply Chain Manager</p>
          <p className="text-xs text-blue-600 mt-1 font-medium">admin@chainflow.io</p>
          <div className="flex justify-center gap-6 mt-5 pt-5 border-t border-slate-100">
            {[{ label: "Orders", value: "2.8K" }, { label: "Suppliers", value: "156" }, { label: "Reports", value: "48" }].map((s) => (
              <div key={s.label}>
                <div className="font-bold text-slate-800 text-lg leading-none" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => showToast("info", "Photo upload feature coming soon")} className="w-full mt-5 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">
            Edit Profile Photo
          </button>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-xl py-2">
            <Shield size={11} />
            <span className="font-semibold">Verified Enterprise Account</span>
          </div>
        </Card>

        {/* Personal info */}
        <Card className="p-6 lg:col-span-2">
          <SectionHeader title="Personal Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Full Name", value: "Alex Kumar", Icon: User },
              { label: "Email Address", value: "admin@chainflow.io", Icon: Mail },
              { label: "Phone Number", value: "+1 (555) 234-5678", Icon: Phone },
              { label: "Location", value: "San Francisco, CA", Icon: MapPin },
              { label: "Department", value: "Supply Chain Operations", Icon: Building2 },
              { label: "Employee ID", value: "EMP-2024-0042", Icon: Shield },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{f.label}</label>
                <div className="relative">
                  <f.Icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    defaultValue={f.value}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={() => showToast("success", "Profile information saved successfully")} className="px-5 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">
              Save Changes
            </button>
            <button onClick={() => showToast("info", "Changes discarded")} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              Cancel
            </button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Notifications */}
        <Card className="p-6">
          <SectionHeader title="Notification Preferences" />
          <div className="space-y-5">
            {(Object.keys(notifs) as (keyof Notifications)[]).map((key) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800">{notifLabels[key].title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{notifLabels[key].desc}</div>
                </div>
                <button
                  onClick={() => toggleNotif(key)}
                  className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${notifs[key] ? "bg-blue-600" : "bg-slate-200"}`}
                  aria-checked={notifs[key]}
                  role="switch"
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${notifs[key] ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <SectionHeader title="Security Settings" />
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" defaultValue="currentpass" className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" placeholder="Enter new password" className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" placeholder="Confirm new password" className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25" />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-slate-800">Two-Factor Authentication</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">Enabled</span>
              </div>
              <p className="text-xs text-slate-400">Your account is protected with TOTP via authenticator app.</p>
            </div>
            <button onClick={() => showToast("success", "Password updated successfully")} className="w-full py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">
              Update Password
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMobileNotifs, setShowMobileNotifs] = useState(false);
  const [pageKey, setPageKey] = useState(0);      // ← increment to force page remount
  const [isRefreshing, setIsRefreshing] = useState(false); // ← loading overlay

  useEffect(() => {
    (window as any).triggerAppRefresh = () => {
      setPageKey((k) => k + 1);
    };
    return () => {
      delete (window as any).triggerAppRefresh;
    };
  }, []);

  if (!loggedIn) {
    return (
      <>
        <ToastContainer />
        <LoginPage onLogin={() => setLoggedIn(true)} />
      </>
    );
  }

  const navigate = (p: Page) => { setPage(p); setSidebarOpen(false); };

  // Full page refresh: show overlay → unmount+remount current page
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setPageKey((k) => k + 1);
      setIsRefreshing(false);
    }, 700);
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage key={pageKey} onNavigate={navigate} />;
      case "suppliers": return <SuppliersPage key={pageKey} />;
      case "inventory": return <InventoryPage key={pageKey} />;
      case "orders": return <OrdersPage key={pageKey} />;
      case "risk": return <RiskPage key={pageKey} />;
      case "optimization": return <OptimizationPage key={pageKey} />;
      case "reports": return <ReportsPage key={pageKey} />;
      case "profile": return <ProfilePage key={pageKey} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "linear-gradient(135deg, #eef2ff 0%, #e8f0fe 50%, #f0f4ff 100%)" }}>
      <ToastContainer />
      {showMobileNotifs && <NotificationsModal onClose={() => setShowMobileNotifs(false)} />}

      {/* Full-page refresh overlay */}
      {isRefreshing && (
        <div className="fixed inset-0 z-[998] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
          <RefreshCw size={32} className="text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Refreshing {pageTitle[page]}...</p>
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar
          page={page}
          onNavigate={navigate}
          onLogout={() => { setLoggedIn(false); showToast("success", "Signed out successfully"); }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/70 backdrop-blur-sm border-b border-slate-200/60 lg:hidden flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <Menu size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-900 rounded-lg flex items-center justify-center">
              <Shield size={12} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>ChainFlow</span>
          </div>
          <button onClick={() => setShowMobileNotifs(true)} className="relative p-2 hover:bg-slate-100 rounded-xl">
            <Bell size={18} className="text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
        </div>

        {/* Desktop top nav */}
        <div className="hidden lg:block flex-shrink-0">
          <TopNav page={page} onNavigate={navigate} onRefresh={handleRefresh} />
        </div>

        {/* Page */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
