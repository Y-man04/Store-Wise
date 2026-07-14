import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Store, 
  ArrowRight,
  Check,
  Star,
  Menu,
  X,
  Play,
  ShoppingCart,
  Package,
  BarChart3,
  Pill,
  Receipt,
  Shield
} from 'lucide-react';

const About = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newAccount = {
      id: Date.now(),
      businessName,
      email,
      status: 'active',
      createdAt: new Date().toISOString(),
      trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('storewise_accounts') || '[]');
    localStorage.setItem('storewise_accounts', JSON.stringify([...existing, newAccount]));

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
      setBusinessName('');
    }, 8000);
  };

  const features = [
    {
      icon: ShoppingCart,
      title: 'Point of Sale',
      desc: 'Fast checkout with barcode scanning, multiple payment methods, and automatic receipt generation.'
    },
    {
      icon: Package,
      title: 'Inventory Control',
      desc: 'Real-time stock tracking with automatic low-stock alerts. Know exactly what you have.'
    },
    {
      icon: BarChart3,
      title: 'Sales Reports',
      desc: 'Daily, weekly, and monthly reports. See what is selling and when your busiest hours are.'
    },
    {
      icon: Pill,
      title: 'Pharmacy Module',
      desc: 'NAFDAC-compliant expiry tracking, batch numbers, and drug category management.'
    },
    {
      icon: Receipt,
      title: 'Digital Receipts',
      desc: 'Print, SMS, or WhatsApp receipts to customers instantly with your branding.'
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      desc: 'Admin, Manager, and Cashier roles. Your cashier can sell, but cannot see your books.'
    }
  ];

  const testimonials = [
    {
      quote: "We were losing ₦180,000 monthly to stockouts. Store-Wise alerts stopped that completely. It paid for itself in the first month.",
      name: "Adebayo Ogunlesi",
      role: "Owner, Bayo Mart",
      location: "Ikeja, Lagos",
      metric: "₦180k saved",
      metricLabel: "monthly stockout losses"
    },
    {
      quote: "NAFDAC audit used to take 2 days of paperwork. Last month it took 45 minutes because every batch and expiry was already documented.",
      name: "Dr. Ngozi Okonkwo",
      role: "Pharmacist, HealthPlus",
      location: "Wuse, Abuja",
      metric: "2 days → 45 min",
      metricLabel: "NAFDAC audit time"
    },
    {
      quote: "Rolled out to 4 locations in 2 weeks. I check stock at any branch from my phone. No more driving around.",
      name: "Emeka Ibe",
      role: "Operations Manager",
      location: "MegaMart Chain",
      metric: "4 stores",
      metricLabel: "managed from one dashboard"
    }
  ];

  const pricing = [
    {
      name: 'Starter',
      price: '₦15,000',
      period: '/mo',
      desc: 'For small shops & kiosks',
      features: ['1 cashier terminal', 'Up to 500 products', 'Basic reports', 'WhatsApp receipts'],
      cta: 'Start Free Trial'
    },
    {
      name: 'Business',
      price: '₦35,000',
      period: '/mo',
      desc: 'For growing businesses',
      features: ['5 cashier terminals', 'Unlimited products', 'Advanced analytics', 'Pharmacy module', 'Priority support'],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '₦80,000',
      period: '/mo',
      desc: 'For chains & franchises',
      features: ['Unlimited terminals', 'Unlimited locations', 'Custom integrations', 'Dedicated manager', 'On-site training'],
      cta: 'Contact Sales'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-purple-600 rounded-md flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm">Store-Wise</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#product" className="text-sm text-gray-400 hover:text-white transition-colors">Product</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <a 
              href="#signup" 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Start Free Trial
            </a>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-6 py-4 border-t border-white/5 space-y-3 bg-[#0a0a0f]">
            <a href="#product" className="block text-sm text-gray-400">Product</a>
            <a href="#pricing" className="block text-sm text-gray-400">Pricing</a>
            <Link to="/login" className="block text-sm text-gray-400">Sign In</Link>
            <a href="#signup" className="block px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium text-center">Start Free Trial</a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-medium mb-6 border border-purple-500/20">
            Now serving 500+ Nigerian businesses
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            The POS system built<br className="hidden md:block" /> for Nigerian retail
          </h1>

          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Sell faster, track inventory automatically, and never run out of stock again. Built for supermarkets, pharmacies, and retail stores.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <a 
              href="#signup" 
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              Start 14-Day Free Trial
              <ArrowRight className="w-4 h-4" />
            </a>
            <button className="px-6 py-3 bg-white/5 text-white rounded-lg font-medium border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2">
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500" />
              No setup fees
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500" />
              No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Product Screenshot */}
      <section id="product" className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#12121a] rounded-xl border border-white/5 aspect-[16/9] flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 font-medium text-sm">Product Dashboard Screenshot</p>
              <p className="text-gray-600 text-xs mt-1">Replace with your actual product image</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="border-y border-white/5 py-10 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-xs text-gray-500 mt-1">Businesses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">₦2.4B+</p>
              <p className="text-xs text-gray-500 mt-1">Transactions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-xs text-gray-500 mt-1">Uptime</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">&lt;3 min</p>
              <p className="text-xs text-gray-500 mt-1">To first sale</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Product</p>
            <h2 className="text-3xl font-bold text-white">Everything you need to run your store</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="card p-6 hover:border-white/10 transition-colors">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white/[0.02] px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Testimonials</p>
            <h2 className="text-3xl font-bold text-white">Trusted by store owners</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="card p-6">
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-6">"{t.quote}"</p>

                <div className="bg-purple-500/10 rounded-lg p-3 mb-4 border border-purple-500/20">
                  <p className="text-lg font-bold text-purple-400">{t.metric}</p>
                  <p className="text-xs text-purple-500">{t.metricLabel}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-400">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                    <p className="text-xs text-gray-600">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Pricing</p>
            <h2 className="text-3xl font-bold text-white">Simple, transparent pricing</h2>
            <p className="text-gray-500 mt-2 text-sm">Pay in Naira. No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricing.map((plan, idx) => (
              <div 
                key={idx} 
                className={`card p-6 relative ${plan.popular ? 'border-purple-500/30' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <p className="text-sm font-semibold text-gray-500 mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">{plan.desc}</p>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-green-500" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <a 
                  href="#signup"
                  className={`block w-full py-2.5 rounded-lg font-medium text-sm text-center transition-colors ${
                    plan.popular 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup */}
      <section id="signup" className="py-20 bg-white/[0.02] px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Get Started</p>
              <h2 className="text-3xl font-bold text-white mb-4">Start your free trial today</h2>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                No credit card required. No setup fees. Get your first sale in under 3 minutes.
              </p>

              <div className="space-y-3 mb-8">
                {['Free 14-day trial with full features', 'Setup help from our Lagos team', 'Pay in Naira — no forex issues', 'Cancel anytime'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-green-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-8">
              {submitted ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">You are all set</h3>
                  <p className="text-gray-400 text-sm mb-2">Check your email for login credentials.</p>
                  <p className="text-gray-500 text-xs mb-4">Your 14-day trial starts now.</p>
                  <button 
                    onClick={() => navigate('/onboarding')}
                    className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Set Up Your Store
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-white mb-1">Create your account</h3>
                  <p className="text-gray-500 text-sm mb-6">Takes less than a minute.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Business Name</label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="input"
                        placeholder="e.g. Bayo Supermarket"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input"
                        placeholder="you@business.com"
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                    >
                      Start Free Trial
                    </button>
                    <p className="text-xs text-gray-600 text-center">
                      By signing up, you agree to our Terms and Privacy Policy.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050508] border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-purple-600 rounded-md flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-white text-sm">Store-Wise</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                POS and inventory management for Nigerian businesses.
              </p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3 text-xs uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#product" className="text-gray-500 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-500 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3 text-xs uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="text-gray-500 hover:text-white transition-colors cursor-pointer">About</span></li>
                <li><span className="text-gray-500 hover:text-white transition-colors cursor-pointer">Contact</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3 text-xs uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li>hello@store-wise.ng</li>
                <li>+234 800 000 0000</li>
                <li>Lagos, Nigeria</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-700">© 2026 Store-Wise. All rights reserved.</p>
            <div className="flex items-center gap-6 text-xs text-gray-600">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;