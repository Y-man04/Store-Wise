import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { SERVICE_TYPES, SERVICE_FIELD_TEMPLATES, isServiceType } from '../data/serviceTypes';
import {
  Store, Users, Package, Receipt, Check, ChevronRight, ChevronLeft,
  Building2, Phone, MapPin, Search, X, Wrench, Scissors, Car, Camera,
  Home, Zap, Droplets, Dumbbell, BookOpen, Truck, Printer, Shield,
  Bug, Paintbrush, Hammer, Wrench as WrenchIcon, Fan, WashingMachine,
  Sparkles, UtensilsCrossed, Calendar, Music, Laptop, HeartHandshake,
  MoreHorizontal, Smartphone, Monitor, Wind, Pill, ShoppingBag
} from 'lucide-react';

// Top 6 services shown directly + icon mapping
const TOP_SERVICES = [
  { id: 'tailoring', label: 'Tailoring', icon: Scissors },
  { id: 'salon', label: 'Salon & Barbing', icon: Sparkles },
  { id: 'laundry', label: 'Laundry & Dry Cleaning', icon: WashingMachine },
  { id: 'mechanic', label: 'Auto Repair / Mechanic', icon: Car },
  { id: 'phone_repair', label: 'Phone Repair', icon: Smartphone },
  { id: 'cleaning', label: 'Cleaning Services', icon: Droplets },
];

// Icon mapping for ALL services (used in modal)
const SERVICE_ICONS = {
  tailoring: Scissors,
  salon: Sparkles,
  laundry: WashingMachine,
  mechanic: Car,
  phone_repair: Smartphone,
  electronics_repair: Laptop,
  catering: UtensilsCrossed,
  event_planning: Calendar,
  photography: Camera,
  cleaning: Droplets,
  cyber_cafe: Monitor,
  printing: Printer,
  delivery: Truck,
  gym: Dumbbell,
  tutoring: BookOpen,
  real_estate: Home,
  plumbing: Wrench,
  electrical: Zap,
  carpentry: Hammer,
  painting: Paintbrush,
  welding: WrenchIcon,
  generator_repair: Fan,
  ac_repair: Wind,
  car_wash: Car,
  security: Shield,
  pest_control: Bug,
  other_service: HeartHandshake,
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [business, setBusiness] = useState({
    name: '',
    address: '',
    phone: '',
    type: 'supermarket',
    serviceLabel: '',
  });
  const [staff, setStaff] = useState([
    { name: '', username: '', email: '', role: 'cashier', password: '' },
  ]);
  const [productsAdded, setProductsAdded] = useState(false);
  const [testSaleDone, setTestSaleDone] = useState(false);

  // Modal state
  const [showMoreServices, setShowMoreServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const totalSteps = 5;
  const isService = isServiceType(business.type);

  // Focus search when modal opens
  useEffect(() => {
    if (showMoreServices && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [showMoreServices]);

  // Close modal on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowMoreServices(false);
    };
    if (showMoreServices) {
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [showMoreServices]);

  const handleBusinessSubmit = () => {
    if (!business.name || !business.phone) return;
    localStorage.setItem('storewise_business', JSON.stringify(business));
    localStorage.removeItem('storewise_users');
    localStorage.removeItem('storewise_pending_users');
    localStorage.removeItem('storewise_user');
    localStorage.removeItem('storewise_products');
    localStorage.removeItem('storewise_orders');
    setStep(2);
  };

  const handleStaffSubmit = () => {
    const normalizedStaff = staff
      .map((member) => ({
        ...member,
        name: String(member.name || '').trim(),
        username: String(member.username || '').trim(),
        email: String(member.email || '').trim(),
        password: String(member.password || '').trim(),
        role: String(member.role || 'cashier').trim().toLowerCase(),
      }))
      .filter((member) => member.name || member.username || member.email || member.password);

    if (normalizedStaff.length === 0) {
      setStep(3);
      return;
    }

    const newUsers = normalizedStaff.map((member) => ({
      id: Date.now() + Math.random(),
      name: member.name || member.username || member.email || 'Staff User',
      username: member.username || (member.email ? member.email.split('@')[0] : ''),
      email: member.email,
      password: member.password,
      role: member.role || 'cashier',
      businessName: business.name,
      createdAt: new Date().toISOString(),
    }));

    try {
      localStorage.setItem('storewise_users', JSON.stringify(newUsers));
      localStorage.setItem('storewise_pending_users', JSON.stringify(newUsers));
    } catch {
      localStorage.setItem('storewise_pending_users', JSON.stringify(newUsers));
    }

    const adminUser = newUsers.find((user) => user.role === 'admin') || newUsers[0];
    localStorage.setItem('storewise_user', JSON.stringify(adminUser));

    setStep(3);
  };

  const handleAddStaff = () => {
    setStaff([...staff, { name: '', username: '', email: '', role: 'cashier', password: '' }]);
  };

  const updateStaff = (index, field, value) => {
    const updated = [...staff];
    updated[index][field] = value;
    setStaff(updated);
  };

  const removeStaff = (index) => {
    if (staff.length <= 1) return;
    setStaff(staff.filter((_, i) => i !== index));
  };

  const generateDummySales = () => {
    const usersData = JSON.parse(localStorage.getItem('storewise_users') || '[]');
    const cashiers = usersData.filter((u) => u.role === 'cashier' || u.role === 'manager');
    if (cashiers.length === 0) return;

    const sales = [];

    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      const dailySales = Math.floor(Math.random() * 11) + 5;

      for (let s = 0; s < dailySales; s++) {
        const itemCount = Math.floor(Math.random() * 4) + 1;
        const items = [];
        let total = 0;

        for (let i = 0; i < itemCount; i++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const qty = Math.floor(Math.random() * 3) + 1;
          items.push({ ...product, quantity: qty });
          total += product.price * qty;
        }

        const hour = 8 + Math.floor(Math.random() * 12);
        date.setHours(hour, Math.floor(Math.random() * 60));

        const cashier = cashiers[Math.floor(Math.random() * cashiers.length)];
        const paymentMethods = ['Cash', 'Cash', 'Cash', 'Transfer', 'Transfer'];

        sales.push({
          id: `RCP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
          items,
          subtotal: total,
          discount: 0,
          total,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          amountTendered: total + Math.floor(Math.random() * 500),
          change: Math.floor(Math.random() * 500),
          cashier: cashier.name,
          date: date.toISOString(),
        });
      }
    }

    localStorage.setItem('storewise_sales', JSON.stringify(sales));
  };

  const generateDummyOrders = () => {
    const fields = SERVICE_FIELD_TEMPLATES[business.type] || [];
    const usersData = JSON.parse(localStorage.getItem('storewise_users') || '[]');
    const staffPool = usersData.length > 0 ? usersData : [{ name: business.name }];
    const statuses = ['Pending', 'In Progress', 'Ready', 'Delivered'];
    const sampleCustomers = ['Amaka Okafor', 'Chidi Eze', 'Bisi Adeyemi', 'Tunde Bello', 'Ngozi Umeh', 'Femi Alabi', 'Grace Nnamdi', 'Yusuf Ibrahim'];
    const orders = [];

    for (let i = 0; i < 8; i++) {
      const due = new Date();
      due.setDate(due.getDate() + Math.floor(Math.random() * 14) - 3);
      const price = 3000 + Math.floor(Math.random() * 15) * 500;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const details = fields.map((label) => ({ label, value: '' }));

      orders.push({
        id: `order-${Date.now()}-${i}`,
        customerName: sampleCustomers[i % sampleCustomers.length],
        customerPhone: `080${Math.floor(10000000 + Math.random() * 89999999)}`,
        description: 'Sample order',
        details,
        price,
        amountPaid: status === 'Delivered' ? price : Math.floor(price / 2),
        dueDate: due.toISOString().slice(0, 10),
        status,
        assignedTo: staffPool[Math.floor(Math.random() * staffPool.length)].name,
        createdAt: new Date().toISOString(),
      });
    }

    localStorage.setItem('storewise_orders', JSON.stringify(orders));
  };

  const handleProductsStep = () => {
    setProductsAdded(true);
    if (isService) {
      generateDummyOrders();
    } else {
      generateDummySales();
    }
    setStep(4);
  };

  const handleTestSale = () => {
    setTestSaleDone(true);
    setStep(5);
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  // Filter services for modal (exclude top 6, match search)
  const moreServices = SERVICE_TYPES.filter((s) => !TOP_SERVICES.find((t) => t.id === s.id));
  const filteredServices = searchQuery.trim()
    ? moreServices.filter((s) =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : moreServices;

  const selectServiceType = (typeId) => {
    setBusiness({ ...business, type: typeId, serviceLabel: '' });
    setShowMoreServices(false);
    setSearchQuery('');
  };

  const getServiceIcon = (id) => {
    const Icon = SERVICE_ICONS[id] || Wrench;
    return Icon;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-7 h-7 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Set Up Your Business</h2>
              <p className="text-sm text-gray-500">Tell us about your store</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Business Name</label>
                <input
                  type="text"
                  value={business.name}
                  onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                  className="input"
                  placeholder="e.g. Bayo Supermarket"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={business.phone}
                  onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                  className="input"
                  placeholder="e.g. 0803 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Address</label>
                <input
                  type="text"
                  value={business.address}
                  onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                  className="input"
                  placeholder="e.g. 12 Allen Avenue, Ikeja, Lagos"
                />
              </div>

              {/* Business Type — NEW CLEAN LAYOUT */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Business Type</label>

                {/* Product-based */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Product-Based</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'supermarket', label: 'Supermarket', icon: Store },
                      { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
                      { id: 'retail', label: 'Retail Store', icon: ShoppingBag },
                      { id: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const active = business.type === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setBusiness({ ...business, type: opt.id, serviceLabel: '' })}
                          className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                            active
                              ? 'border-purple-500 bg-purple-500/10 text-white'
                              : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="text-sm font-medium">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Service-based */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Service-Based</p>
                  <div className="grid grid-cols-2 gap-2">
                    {TOP_SERVICES.map((opt) => {
                      const Icon = opt.icon;
                      const active = business.type === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setBusiness({ ...business, type: opt.id, serviceLabel: '' })}
                          className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                            active
                              ? 'border-purple-500 bg-purple-500/10 text-white'
                              : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="text-sm font-medium">{opt.label}</span>
                        </button>
                      );
                    })}
                    {/* + More Services button */}
                    <button
                      onClick={() => setShowMoreServices(true)}
                      className={`flex items-center gap-2 p-3 rounded-lg border border-dashed transition-all text-left ${
                        isService && !TOP_SERVICES.find(t => t.id === business.type) && business.type !== 'other_service'
                          ? 'border-purple-500/50 bg-purple-500/10 text-purple-300'
                          : 'border-white/20 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                      }`}
                    >
                      <MoreHorizontal className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-medium">More Services...</span>
                    </button>
                  </div>

                  {/* Selected service indicator — shows when a non-top service is picked from modal */}
                  {isService && !TOP_SERVICES.find(t => t.id === business.type) && business.type !== 'other_service' && (
                    <div className="mt-3 flex items-center gap-2 p-3 rounded-lg border border-purple-500/30 bg-purple-500/10">
                      <Check className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="text-sm text-purple-300">
                        Selected: <span className="font-medium text-white">{SERVICE_TYPES.find(s => s.id === business.type)?.label || business.type}</span>
                      </span>
                    </div>
                  )}

                  {/* Other Service indicator */}
                  {business.type === 'other_service' && (
                    <div className="mt-3 flex items-center gap-2 p-3 rounded-lg border border-purple-500/30 bg-purple-500/10">
                      <Check className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="text-sm text-purple-300">
                        Custom: <span className="font-medium text-white">{business.serviceLabel || 'Other Service'}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Other Service custom input */}
                {business.type === 'other_service' && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      What service do you offer?
                    </label>
                    <input
                      type="text"
                      value={business.serviceLabel}
                      onChange={(e) => setBusiness({ ...business, serviceLabel: e.target.value })}
                      className="input"
                      placeholder="e.g. Photography, Car Wash, Event Planning"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This label will appear throughout your dashboard
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleBusinessSubmit}
              disabled={!business.name || !business.phone || (business.type === 'other_service' && !business.serviceLabel)}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Add Your Team</h2>
              <p className="text-sm text-gray-500">Add staff accounts only if you want them listed later</p>
            </div>
            <div className="space-y-4">
              {staff.map((member, index) => (
                <div key={index} className="card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-400">Staff Member {index + 1}</span>
                    {staff.length > 1 && (
                      <button onClick={() => removeStaff(index)} className="text-xs text-red-400">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateStaff(index, 'name', e.target.value)}
                        className="input text-sm"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Role</label>
                      <select
                        value={member.role}
                        onChange={(e) => updateStaff(index, 'role', e.target.value)}
                        className="input text-sm"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="cashier">Cashier</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Username</label>
                    <input
                      type="text"
                      value={member.username}
                      onChange={(e) => updateStaff(index, 'username', e.target.value)}
                      className="input text-sm"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) => updateStaff(index, 'email', e.target.value)}
                      className="input text-sm"
                      placeholder="email@store.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Password</label>
                    <input
                      type="password"
                      value={member.password}
                      onChange={(e) => updateStaff(index, 'password', e.target.value)}
                      className="input text-sm"
                      placeholder="Set password"
                    />
                  </div>
                </div>
              ))}
              <button onClick={handleAddStaff} className="btn btn-secondary w-full text-sm">
                + Add Another Staff Member
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn btn-secondary flex-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleStaffSubmit} className="btn btn-primary flex-1">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {isService ? 'Orders Setup' : 'Add Products'}
              </h2>
              <p className="text-sm text-gray-500">
                {isService
                  ? 'Track customer jobs from start to finish'
                  : 'We have pre-loaded common products for your store type'}
              </p>
            </div>

            {isService ? (
              <div className="card p-6 text-center">
                <p className="text-sm text-gray-400 mb-4">
                  Since {business.name} is a service business, you'll use the{' '}
                  <span className="text-white font-medium">Orders</span> page instead of a product catalog.
                </p>
                <div className="text-left text-sm text-gray-500 space-y-2 mb-4">
                  <p>• Log each customer job with a due date and status</p>
                  <p>• Track details specific to your service — fields are fully customizable</p>
                  <p>• Move jobs from Pending → In Progress → Ready → Delivered</p>
                </div>
                <p className="text-xs text-gray-600">
                  You can still add sellable items (like fabric or thread) from the Products page anytime.
                </p>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-sm text-gray-400 mb-4">
                  Your store comes with pre-loaded products matching your business type.
                </p>
                <p className="text-xs text-gray-600">
                  You can add, edit, or remove products anytime from the Products page.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn btn-secondary flex-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleProductsStep} className="btn btn-primary flex-1">
                Looks Good <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-7 h-7 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {isService ? 'Sample Orders Ready' : 'Test Your First Sale'}
              </h2>
              <p className="text-sm text-gray-500">
                {isService
                  ? 'We generated a few sample jobs so you can see how it looks'
                  : 'Try the POS to make sure everything works'}
              </p>
            </div>
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <Check className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-white">Sample data generated</p>
                  <p className="text-xs text-gray-500">
                    {isService ? '8 sample orders across every status' : '~300 transactions across 30 days'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn btn-secondary flex-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleTestSale} className="btn btn-primary flex-1">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">You are all set</h2>
            <p className="text-sm text-gray-500 mb-6">
              {business.name} is ready to start {isService ? 'taking orders' : 'selling'}
            </p>

            <div className="card p-4 text-left space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Store className="w-4 h-4 text-purple-400" />
                <span className="text-white">{business.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400">{business.address || 'Lagos, Nigeria'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400">{business.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400">{staff.filter((s) => s.name).length} staff members</span>
              </div>
            </div>

            <button onClick={handleFinish} className="btn btn-primary w-full">
              Go to Dashboard
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 overflow-y-auto relative">
      <div className="w-full max-w-md max-h-[calc(100vh-3rem)] overflow-hidden">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Step {step} of {totalSteps}</span>
            <span className="text-xs text-purple-400">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="card p-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
          {renderStep()}
        </div>
      </div>

      {/* MORE SERVICES MODAL */}
      {showMoreServices && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowMoreServices(false)}
          />
          {/* Modal */}
          <div className="relative w-full max-w-lg bg-[#13131f] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">All Services</h3>
              <button
                onClick={() => setShowMoreServices(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input w-full pl-10"
                  placeholder="Search services..."
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-2">
              {filteredServices.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No services match "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredServices.map((service) => {
                    const Icon = getServiceIcon(service.id);
                    const isOther = service.id === 'other_service';
                    return (
                      <button
                        key={service.id}
                        onClick={() => selectServiceType(service.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors">
                          <Icon className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-300 group-hover:text-white truncate">
                            {service.label}
                          </p>
                          {isOther && (
                            <p className="text-xs text-gray-500">Custom service type</p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="p-3 border-t border-white/10 bg-white/[0.02]">
              <p className="text-xs text-gray-500 text-center">
                {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;