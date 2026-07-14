import { useEffect, useMemo, useState } from 'react';
import { Plus, X, Search, Phone, Trash2, AlertTriangle, Shirt } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import {
  getStoredOrders,
  addOrder,
  updateOrder,
  deleteOrder,
} from '../utils/orderStorage';
import { SERVICE_FIELD_TEMPLATES, SERVICE_STATUS_STAGES } from '../data/serviceTypes';

const STAGES = SERVICE_STATUS_STAGES.laundry;

const stageAccent = {
  Received: 'border-l-amber-500',
  Washing: 'border-l-blue-500',
  Drying: 'border-l-cyan-500',
  Ready: 'border-l-emerald-500',
  Delivered: 'border-l-gray-500',
};

const stageBadge = {
  Received: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  Washing: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  Drying: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  Ready: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  Delivered: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const isOverdue = (order) => order.dueDate && order.dueDate < todayISO() && order.status !== 'Delivered';

const emptyForm = () => ({
  customerName: '',
  customerPhone: '',
  description: '',
  price: '',
  dueDate: '',
  details: SERVICE_FIELD_TEMPLATES.laundry.map((label) => ({ label, value: '' })),
});

const LaundryOrders = () => {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState(getStoredOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentInput, setPaymentInput] = useState('');

  useEffect(() => {
    const sync = () => setOrders(getStoredOrders());
    sync();
    window.addEventListener('orders-updated', sync);
    return () => window.removeEventListener('orders-updated', sync);
  }, []);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter(
      (o) =>
        o.customerName?.toLowerCase().includes(query) ||
        o.description?.toLowerCase().includes(query) ||
        o.customerPhone?.includes(query)
    );
  }, [orders, searchQuery]);

  const ordersByStage = useMemo(() => {
    const map = {};
    STAGES.forEach((stage) => { map[stage] = []; });
    filteredOrders.forEach((o) => {
      const stage = STAGES.includes(o.status) ? o.status : STAGES[0];
      map[stage].push(o);
    });
    return map;
  }, [filteredOrders]);

  const overdueCount = filteredOrders.filter(isOverdue).length;

  const openNewOrder = () => {
    setForm(emptyForm());
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
      status: STAGES[0],
    });

    setOrders(getStoredOrders());
    setIsFormOpen(false);
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setPaymentInput('');
  };

  const handleStageChange = (stage) => {
    updateOrder(selectedOrder.id, { status: stage });
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Laundry Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} total jobs
            {overdueCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" /> {overdueCount} overdue
              </span>
            )}
          </p>
        </div>
        <button onClick={openNewOrder} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Order
        </button>
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

      {/* Kanban board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {STAGES.map((stage) => (
          <div key={stage} className="card overflow-hidden">
            <div className={`flex items-center justify-between px-4 py-3 border-b border-white/10 border-l-4 ${stageAccent[stage]}`}>
              <span className="text-sm font-semibold text-white">{stage}</span>
              <span className="text-xs text-gray-500">{ordersByStage[stage].length}</span>
            </div>
            <div className="p-3 space-y-2">
              {ordersByStage[stage].length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-6">No jobs</p>
              ) : (
                ordersByStage[stage].map((order) => {
                  const overdue = isOverdue(order);
                  return (
                    <button
                      key={order.id}
                      onClick={() => openOrderDetail(order)}
                      className={`w-full text-left rounded-xl border p-3 hover:bg-white/5 transition-colors ${
                        overdue ? 'border-red-500/40 bg-red-500/5' : 'border-white/10 bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-white truncate">{order.customerName}</p>
                        {overdue && <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{order.description || 'No description'}</p>
                      {order.dueDate && (
                        <p className={`text-xs mt-1.5 ${overdue ? 'text-red-400 font-medium' : 'text-gray-600'}`}>
                          Due {order.dueDate}
                        </p>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Order Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: '#111118' }}>
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">New Laundry Order</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Customer Name</label>
                  <input
                    className="input"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    className="input"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Job Description</label>
                <input
                  className="input"
                  placeholder="e.g. 3 shirts, 2 trousers, dry clean suit"
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
                    className="input"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="input"
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
                        className="input text-sm flex-1"
                        value={detail.label}
                        onChange={(e) => updateDetailField(index, 'label', e.target.value)}
                      />
                      <input
                        placeholder="Value"
                        className="input text-sm flex-1"
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
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: '#111118' }}>
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
                  <p className={`text-xs mt-1 ${isOverdue(selectedOrder) ? 'text-red-400 font-medium' : 'text-gray-500'}`}>
                    Due {selectedOrder.dueDate} {isOverdue(selectedOrder) && '— OVERDUE'}
                  </p>
                )}
              </div>

              {selectedOrder.details?.length > 0 && (
                <div className="card p-3 space-y-1.5" style={{ backgroundColor: '#0e0e14' }}>
                  {selectedOrder.details.map((d, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-500">{d.label}</span>
                      <span className="text-white">{d.value || '—'}</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stage</label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => handleStageChange(stage)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedOrder.status === stage ? stageBadge[stage] : 'border-white/10 text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card p-4 space-y-3" style={{ backgroundColor: '#0e0e14' }}>
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
                    className="input text-sm flex-1"
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

export default LaundryOrders;