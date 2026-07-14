import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Settings, Trash2, Phone } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import {
  getStoredAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  getStoredSalonServices,
  saveStoredSalonServices,
  APPOINTMENT_STATUSES,
} from '../utils/appointmentStorage';

const START_HOUR = 8;
const END_HOUR = 20;
const SLOT_MINUTES = 30;
const SLOT_COUNT = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES;
const ROW_HEIGHT = 44;

const statusStyles = {
  Booked: 'bg-blue-500/15 border-blue-500/40 text-blue-200',
  Completed: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200',
  Cancelled: 'bg-gray-500/15 border-gray-500/40 text-gray-400 line-through',
  'No-show': 'bg-orange-500/15 border-orange-500/40 text-orange-200',
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const buildSlots = () => {
  const slots = [];
  for (let i = 0; i < SLOT_COUNT; i++) {
    const totalMinutes = START_HOUR * 60 + i * SLOT_MINUTES;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const label = `${hour % 12 === 0 ? 12 : hour % 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
    slots.push({ index: i, hour, minute, label, time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` });
  }
  return slots;
};

const timeToSlotIndex = (time) => {
  const [h, m] = time.split(':').map(Number);
  return ((h - START_HOUR) * 60 + m) / SLOT_MINUTES;
};

const getStylists = () => {
  try {
    const users = JSON.parse(localStorage.getItem('storewise_users') || '[]');
    if (users.length > 0) return users.map((u) => u.name).filter(Boolean);
  } catch {
    // fall through
  }
  return ['Staff'];
};

const emptyForm = (defaults = {}) => ({
  customerName: '',
  customerPhone: '',
  serviceId: '',
  serviceName: '',
  duration: 30,
  price: '',
  stylist: '',
  date: todayISO(),
  startTime: '09:00',
  notes: '',
  ...defaults,
});

const Appointments = () => {
  const { user } = useAuthContext();
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [appointments, setAppointments] = useState(getStoredAppointments);
  const [services, setServices] = useState(getStoredSalonServices);
  const [stylists, setStylists] = useState(getStylists);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState('');
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const slots = useMemo(buildSlots, []);

  useEffect(() => {
    const syncAppt = () => setAppointments(getStoredAppointments());
    const syncSvc = () => setServices(getStoredSalonServices());
    syncAppt();
    syncSvc();
    setStylists(getStylists());
    window.addEventListener('appointments-updated', syncAppt);
    window.addEventListener('salon-services-updated', syncSvc);
    return () => {
      window.removeEventListener('appointments-updated', syncAppt);
      window.removeEventListener('salon-services-updated', syncSvc);
    };
  }, []);

  const dayAppointments = useMemo(
    () => appointments.filter((a) => a.date === selectedDate),
    [appointments, selectedDate]
  );

  const changeDay = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const openNewAppointment = (stylist, time) => {
    setForm(emptyForm({ stylist: stylist || stylists[0] || '', startTime: time || '09:00', date: selectedDate }));
    setFormError('');
    setIsFormOpen(true);
  };

  const applyService = (serviceId) => {
    const svc = services.find((s) => s.id === serviceId);
    if (!svc) {
      setForm({ ...form, serviceId, serviceName: '', duration: 30, price: form.price });
      return;
    }
    setForm({ ...form, serviceId, serviceName: svc.name, duration: svc.duration, price: svc.price });
  };

  const hasConflict = (candidate) => {
    const start = timeToSlotIndex(candidate.startTime);
    const end = start + candidate.duration / SLOT_MINUTES;
    return appointments.some((a) => {
      if (a.date !== candidate.date || a.stylist !== candidate.stylist || a.status === 'Cancelled') return false;
      if (candidate.excludeId && a.id === candidate.excludeId) return false;
      const aStart = timeToSlotIndex(a.startTime);
      const aEnd = aStart + a.duration / SLOT_MINUTES;
      return start < aEnd && end > aStart;
    });
  };

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.customerName.trim()) {
      setFormError('Customer name is required');
      return;
    }
    if (!form.stylist) {
      setFormError('Select a stylist');
      return;
    }
    if (hasConflict(form)) {
      setFormError(`${form.stylist} already has an appointment that overlaps this time`);
      return;
    }

    addAppointment({
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      serviceName: form.serviceName || 'Service',
      duration: Number(form.duration || 30),
      price: Number(form.price || 0),
      stylist: form.stylist,
      date: form.date,
      startTime: form.startTime,
      notes: form.notes.trim(),
      bookedBy: user?.name || 'Staff',
    });

    setAppointments(getStoredAppointments());
    setIsFormOpen(false);
  };

  const handleStatusChange = (status) => {
    updateAppointment(selectedAppt.id, { status });
    const next = getStoredAppointments();
    setAppointments(next);
    setSelectedAppt(next.find((a) => a.id === selectedAppt.id));
  };

  const handleDeleteAppointment = () => {
    if (!window.confirm(`Cancel and remove ${selectedAppt.customerName}'s appointment?`)) return;
    deleteAppointment(selectedAppt.id);
    setAppointments(getStoredAppointments());
    setSelectedAppt(null);
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">{dayAppointments.filter((a) => a.status !== 'Cancelled').length} booked today</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsServicesOpen(true)} className="btn btn-secondary flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Services
          </button>
          <button onClick={() => openNewAppointment()} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Appointment
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => changeDay(-1)} className="p-2 rounded-lg border border-white/10 hover:bg-white/5">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input w-auto"
        />
        <button onClick={() => changeDay(1)} className="p-2 rounded-lg border border-white/10 hover:bg-white/5">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => setSelectedDate(todayISO())} className="text-xs text-purple-400 hover:text-purple-300">
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-white/10 bg-[#12121a] overflow-x-auto">
        <div
          className="grid min-w-[600px]"
          style={{
            gridTemplateColumns: `70px repeat(${stylists.length}, 1fr)`,
            gridTemplateRows: `40px repeat(${SLOT_COUNT}, ${ROW_HEIGHT}px)`,
          }}
        >
          {/* Header row */}
          <div className="border-b border-white/10 bg-white/5" />
          {stylists.map((stylist) => (
            <div key={stylist} className="border-b border-l border-white/10 bg-white/5 flex items-center justify-center px-2">
              <span className="text-sm font-medium text-white truncate">{stylist}</span>
            </div>
          ))}

          {/* Time rows + empty click targets */}
          {slots.map((slot) => (
            <>
              <div
                key={`label-${slot.index}`}
                className="border-b border-white/5 flex items-start justify-end pr-2 pt-1 text-[11px] text-gray-500"
                style={{ gridColumn: 1, gridRow: slot.index + 2 }}
              >
                {slot.minute === 0 ? slot.label : ''}
              </div>
              {stylists.map((stylist, sIdx) => (
                <div
                  key={`cell-${slot.index}-${stylist}`}
                  onClick={() => openNewAppointment(stylist, slot.time)}
                  className="border-b border-l border-white/5 hover:bg-purple-600/5 cursor-pointer"
                  style={{ gridColumn: sIdx + 2, gridRow: slot.index + 2 }}
                />
              ))}
            </>
          ))}

          {/* Appointment blocks */}
          {dayAppointments.map((appt) => {
            const stylistIndex = stylists.indexOf(appt.stylist);
            if (stylistIndex === -1) return null;
            const startSlot = timeToSlotIndex(appt.startTime);
            const span = Math.max(1, Math.round(appt.duration / SLOT_MINUTES));
            return (
              <button
                key={appt.id}
                onClick={() => setSelectedAppt(appt)}
                className={`m-0.5 rounded-lg border px-2 py-1 text-left overflow-hidden ${statusStyles[appt.status]}`}
                style={{
                  gridColumn: stylistIndex + 2,
                  gridRow: `${startSlot + 2} / span ${span}`,
                }}
              >
                <p className="text-xs font-semibold truncate">{appt.customerName}</p>
                <p className="text-[11px] truncate opacity-80">{appt.serviceName}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* New Appointment Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">New Appointment</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{formError}</div>
              )}

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
                <label className="block text-sm font-medium text-gray-300 mb-1">Service</label>
                <select
                  className="input bg-[#16161f] border-white/10 text-white"
                  value={form.serviceId}
                  onChange={(e) => applyService(e.target.value)}
                >
                  <option value="">Custom / Other</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {formatCurrency(s.price)} ({s.duration}min)</option>
                  ))}
                </select>
              </div>

              {!form.serviceId && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Service Name</label>
                  <input
                    className="input bg-[#16161f] border-white/10 text-white"
                    value={form.serviceName}
                    onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                    placeholder="e.g. Custom style"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    className="input bg-[#16161f] border-white/10 text-white"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Stylist</label>
                  <select
                    className="input bg-[#16161f] border-white/10 text-white"
                    value={form.stylist}
                    onChange={(e) => setForm({ ...form, stylist: e.target.value })}
                  >
                    {stylists.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
                  <select
                    className="input bg-[#16161f] border-white/10 text-white"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  >
                    {slots.map((s) => (
                      <option key={s.time} value={s.time}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                <input
                  className="input bg-[#16161f] border-white/10 text-white"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedAppt.customerName}</h2>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {selectedAppt.customerPhone || 'No phone'}
                </p>
              </div>
              <button onClick={() => setSelectedAppt(null)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="rounded-lg border border-white/5 bg-[#0e0e14] p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="text-white">{selectedAppt.serviceName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Stylist</span><span className="text-white">{selectedAppt.stylist}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="text-white">{selectedAppt.startTime} ({selectedAppt.duration}min)</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Price</span><span className="text-white">{formatCurrency(selectedAppt.price)}</span></div>
                {selectedAppt.notes && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-gray-500 text-xs mb-1">Notes</p>
                    <p className="text-white">{selectedAppt.notes}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {APPOINTMENT_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedAppt.status === status ? statusStyles[status] : 'border-white/10 text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleDeleteAppointment}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
                Delete Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Services Modal */}
      {isServicesOpen && (
        <ServicesManager
          services={services}
          onClose={() => setIsServicesOpen(false)}
          onSave={(next) => {
            saveStoredSalonServices(next);
            setServices(next);
          }}
        />
      )}
    </div>
  );
};

const ServicesManager = ({ services, onClose, onSave }) => {
  const [local, setLocal] = useState(services);
  const [newSvc, setNewSvc] = useState({ name: '', duration: 30, price: '' });

  const updateField = (id, field, value) => {
    setLocal(local.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeService = (id) => {
    setLocal(local.filter((s) => s.id !== id));
  };

  const addService = () => {
    if (!newSvc.name.trim()) return;
    setLocal([...local, { id: `svc-${Date.now()}`, name: newSvc.name.trim(), duration: Number(newSvc.duration || 30), price: Number(newSvc.price || 0) }]);
    setNewSvc({ name: '', duration: 30, price: '' });
  };

  const handleSave = () => {
    onSave(local);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111118] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Manage Services</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {local.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <input
                className="input bg-[#16161f] border-white/10 text-white text-sm flex-1"
                value={s.name}
                onChange={(e) => updateField(s.id, 'name', e.target.value)}
              />
              <input
                type="number"
                className="input bg-[#16161f] border-white/10 text-white text-sm w-20"
                value={s.duration}
                onChange={(e) => updateField(s.id, 'duration', Number(e.target.value))}
                title="Duration (min)"
              />
              <input
                type="number"
                className="input bg-[#16161f] border-white/10 text-white text-sm w-24"
                value={s.price}
                onChange={(e) => updateField(s.id, 'price', Number(e.target.value))}
                title="Price (₦)"
              />
              <button onClick={() => removeService(s.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <input
              placeholder="New service"
              className="input bg-[#16161f] border-white/10 text-white text-sm flex-1"
              value={newSvc.name}
              onChange={(e) => setNewSvc({ ...newSvc, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="min"
              className="input bg-[#16161f] border-white/10 text-white text-sm w-20"
              value={newSvc.duration}
              onChange={(e) => setNewSvc({ ...newSvc, duration: e.target.value })}
            />
            <input
              type="number"
              placeholder="₦"
              className="input bg-[#16161f] border-white/10 text-white text-sm w-24"
              value={newSvc.price}
              onChange={(e) => setNewSvc({ ...newSvc, price: e.target.value })}
            />
            <button onClick={addService} className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button onClick={handleSave} className="btn btn-primary w-full mt-2">Save Services</button>
        </div>
      </div>
    </div>
  );
};

export default Appointments;