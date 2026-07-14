import { useEffect, useMemo, useState } from 'react';
import { Plus, X, Search, Phone, Calendar, Trash2, Wallet } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import {
  getStoredOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  ORDER_STATUSES,
} from '../utils/orderStorage';
import { SERVICE_FIELD_TEMPLATES, getServiceLabel } from '../data/serviceTypes';

const statusStyles = {
  Pending: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  'In Progress': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Ready: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  Delivered: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
};

const getBusiness = () => {
  try {
    return JSON.parse(localStorage.getItem('storewise_business') || '{}');
  } catch {
    return {};
  }
};

const emptyForm = (fields) => ({
  customerName: '',
  customerPhone: '',
  description: '',
  price: '',
  dueDate: '',
  details: fields.map((label) => ({ label, value: '' })),
});

const Orders = () => {
  const { user } = useAuthContext();
  const [business, setBusiness] = useState(getBusiness);
  const [orders, setOrders] = useState(getStoredOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(() => emptyForm(SERVICE_FIELD_TEMPLATES[getBusiness().type] || []));
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentInput, setPaymentInput] = useState('');

  useEffect(() => {
    const sync = () => setOrders(getStoredOrders());
    sync();
    window.addEventListener('orders-updated', sync);
    return () => window.removeEventListener('orders-updated', sync);
  }, []);

  const serviceLabel = getServiceLabel(business);
  const defaultFields = SERVICE_FIELD_TEMPLATES[business.type] || [];

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        o.customerName?.toLowerCase().includes(query) ||
        o.description?.toLowerCase().includes(query) ||
        o.customerPhone?.includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    return ORDER_STATUSES.reduce((acc, s) => {
      acc[s] = orders.filter((o) => o.status === s).length;
      return acc;
    }, {});
  }, [orders]);

  const openNewOrder = () => {
    setForm(emptyForm(defaultFields));
    setIsFormOpen(true);
  };

  const updateDetailField = (index, key, value) => {
    const next = [...form.details];
    next[index] = { ...next[index], [key]: value };
    setForm({ ...form, details: next });
  };

  const addDetailField = () => {
    setForm({ ...form, details: [...form.details, { label: '', value: '' }] });
  };

  const removeDetailField = (index) => {
    setForm({ ...form, details: form.details.filter((_, i) => i !== index) });
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!form.customerName.trim()) return;

    addOrder({
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      description: form.description.trim(),
      price: Number(form.price || 0),
      dueDate: form.dueDate,
      details: form.details.filter((d) => d.label.trim()),
      assignedTo: user?.name || 'Staff',
    });

    setOrders(getStoredOrders());
    setIsFormOpen(false);
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setPaymentInput('');
  };

  const handleStatusChange = (status) => {
    updateOrder(selectedOrder.id, { status });
    const next = getStoredOrders();
    setOrders(next);
    setSelectedOrder(next.find((o) => o.id === selectedOrder.id));
  };

  const handleLogPayment = () => {
    const amount = Number(paymentInput);
    if (!amount || amount <= 0) return;
    const newPaid = Number(selectedOrder.amountPaid || 0) + amount;
    updateOrder(selectedOrder.id, { amountPaid: newPaid });
    const next = getStoredOrders();
    setOrders(next);
    setSelectedOrder(next.find((o) => o.id === selectedOrder.id));
    setPaymentInput('');
  };

  const handleDeleteOrder = () => {
    if (!window.confirm(`Delete this order for ${selectedOrder.customerName}?`)) return;
    deleteOrder(selectedOrder.id);
    setOrders(getStoredOrders());
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{serviceLabel} Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} total orders</p>
        </div>
        <button onClick={openNewOrder} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Order
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              statusFilter === status ? 'border-purple-500/40 bg-purple-600/10' : 'border-white/10 bg-[#12121a] hover:border-white/20'
            }`}
          >
            <p className="text-sm text-gray-400">{status}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{statusCounts[status] || 0}</p>
          </button>
        ))}
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by customer, phone, or job..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#12121a] shadow-2xl shadow-black/20">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/20">
              <Wallet className="h-6 w-6 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">No orders yet</h2>
            <p className="mt-2 max-w-md text-sm text-gray-400">Click "New Order" to log your first job.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-left text-gray-400">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Job</th>
                  <th className="px-5 py-3 font-medium">Due Date</th>
                  <th className="px-5 py-3 font-medium">Balance</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const balance = Number(order.price || 0) - Number(order.amountPaid || 0);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => openOrderDetail(order)}
                      className="cursor-pointer border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-white">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerPhone || 'No phone'}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-300">{order.description || '—'}</td>
                      <td className="px-5 py-3 text-gray-300">{order.dueDate || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={balance > 0 ? 'text-orange-300' : 'text-emerald-300'}>
                          {formatCurrency(balance)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${statusStyles[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Order Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">New {serviceLabel} Order</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Customer Name</label>
                  <input
                    className="input bg-[#16161f] border-white/10 text-white"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    className="input bg-[#16161f] border-white/10 text-white"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Job Description</label>
                <input
                  className="input bg-[#16161f] border-white/10 text-white"
                  placeholder="e.g. Ankara gown, long sleeve"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price (₦)</label>
                  <input
                    type="number"
                    min="0"
                    className="input bg-[#16161f] border-white/10 text-white"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="input bg-[#16161f] border-white/10 text-white"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Details</label>
                  <button type="button" onClick={addDetailField} className="text-xs text-purple-400 hover:text-purple-300">
                    + Add field
                  </button>
                </div>
                <div className="space-y-2">
                  {form.details.map((detail, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        placeholder="Label"
                        className="input bg-[#16161f] border-white/10 text-white text-sm"
                        value={detail.label}
                        onChange={(e) => updateDetailField(index, 'label', e.target.value)}
                      />
                      <input
                        placeholder="Value"
                        className="input bg-[#16161f] border-white/10 text-white text-sm"
                        value={detail.value}
                        onChange={(e) => updateDetailField(index, 'value', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeDetailField(index)}
                        className="p-2 text-gray-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {form.details.length === 0 && (
                    <p className="text-xs text-gray-500">No detail fields yet — click "+ Add field" if you need any.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedOrder.customerName}</h2>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {selectedOrder.customerPhone || 'No phone'}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <p className="text-sm text-gray-400">{selectedOrder.description || 'No description'}</p>
                {selectedOrder.dueDate && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Due {selectedOrder.dueDate}
                  </p>
                )}
              </div>

              {selectedOrder.details?.length > 0 && (
                <div className="rounded-lg border border-white/5 bg-[#0e0e14] p-3 space-y-1.5">
                  {selectedOrder.details.map((d, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-500">{d.label}</span>
                      <span className="text-white">{d.value || '—'}</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedOrder.status === status
                          ? statusStyles[status]
                          : 'border-white/10 text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-white/5 bg-[#0e0e14] p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Price</span>
                  <span className="text-white">{formatCurrency(selectedOrder.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Paid</span>
                  <span className="text-emerald-300">{formatCurrency(selectedOrder.amountPaid || 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-400">Balance</span>
                  <span className="text-orange-300">
                    {formatCurrency(Number(selectedOrder.price || 0) - Number(selectedOrder.amountPaid || 0))}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Log payment (₦)"
                    value={paymentInput}
                    onChange={(e) => setPaymentInput(e.target.value)}
                    className="input bg-[#16161f] border-white/10 text-white text-sm flex-1"
                  />
                  <button onClick={handleLogPayment} className="btn btn-primary text-sm px-3">Add</button>
                </div>
              </div>

              <button
                onClick={handleDeleteOrder}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;