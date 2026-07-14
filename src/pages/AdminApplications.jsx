import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { 
  Store, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  MoreHorizontal,
  LogOut,
  BarChart3,
  Bell,
  Filter,
  ChevronDown,
  ChevronUp,
  Trash2,
  RotateCcw,
  UserCheck,
  AlertCircle,
  MapPin,
  Briefcase
} from 'lucide-react';

const AdminApplications = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('storewise_applications');
    if (saved) {
      setApplications(JSON.parse(saved));
    }
  }, []);

  // Listen for new applications
  useEffect(() => {
    const handleNewApp = () => {
      const saved = localStorage.getItem('storewise_applications');
      if (saved) setApplications(JSON.parse(saved));
    };
    window.addEventListener('storewise_new_application', handleNewApp);
    return () => window.removeEventListener('storewise_new_application', handleNewApp);
  }, []);

  const handleApprove = (id) => {
    const updated = applications.map(app => 
      app.id === id ? { ...app, status: 'approved', approvedAt: new Date().toISOString() } : app
    );
    setApplications(updated);
    localStorage.setItem('storewise_applications', JSON.stringify(updated));
    if (selectedApp?.id === id) {
      setSelectedApp({ ...selectedApp, status: 'approved', approvedAt: new Date().toISOString() });
    }
  };

  const handleReject = (id) => {
    const updated = applications.map(app => 
      app.id === id ? { ...app, status: 'rejected', rejectedAt: new Date().toISOString() } : app
    );
    setApplications(updated);
    localStorage.setItem('storewise_applications', JSON.stringify(updated));
    if (selectedApp?.id === id) {
      setSelectedApp({ ...selectedApp, status: 'rejected', rejectedAt: new Date().toISOString() });
    }
  };

  const handleDelete = (id) => {
    const updated = applications.filter(app => app.id !== id);
    setApplications(updated);
    localStorage.setItem('storewise_applications', JSON.stringify(updated));
    setShowDetailModal(false);
    setSelectedApp(null);
  };

  const handleReset = (id) => {
    const updated = applications.map(app => 
      app.id === id ? { ...app, status: 'pending', approvedAt: null, rejectedAt: null } : app
    );
    setApplications(updated);
    localStorage.setItem('storewise_applications', JSON.stringify(updated));
    if (selectedApp?.id === id) {
      setSelectedApp({ ...selectedApp, status: 'pending', approvedAt: null, rejectedAt: null });
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = 
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.businessType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.appliedAt) - new Date(a.appliedAt);
    if (sortBy === 'oldest') return new Date(a.appliedAt) - new Date(b.appliedAt);
    if (sortBy === 'name') return a.companyName.localeCompare(b.companyName);
    return 0;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-[#12121a] border-b border-gray-200 dark:border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white text-sm">Store-Wise</h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-500 uppercase tracking-wider">Applications</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {stats.pending > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <Bell className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-yellow-500 font-medium">{stats.pending} pending</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-purple-500 font-medium">Admin</span>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-red-500"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-[#12121a] rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">All time</span>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Total Applications</p>
          </div>

          <div className="bg-white dark:bg-[#12121a] rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              {stats.pending > 0 && (
                <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded-full">{stats.pending}</span>
              )}
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.pending}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Awaiting Review</p>
          </div>

          <div className="bg-white dark:bg-[#12121a] rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-green-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.approved}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Approved</p>
          </div>

          <div className="bg-white dark:bg-[#12121a] rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-red-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.rejected}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Rejected</p>
          </div>
        </div>

        {/* Filters, Search, Sort */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white dark:bg-[#12121a] rounded-xl p-1 border border-gray-200 dark:border-white/5">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filter === f 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({stats[f]})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#12121a] border border-gray-200 dark:border-white/5 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="p-2.5 bg-white dark:bg-[#12121a] border border-gray-200 dark:border-white/5 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"
              >
                <Filter className="w-4 h-4" />
              </button>

              {showSortMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1a1a25] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                  {[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'oldest', label: 'Oldest First' },
                    { value: 'name', label: 'Name (A-Z)' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { setSortBy(option.value); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sortBy === option.value 
                          ? 'bg-purple-500/10 text-purple-500' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white dark:bg-[#12121a] rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden">
          {filteredApps.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No applications found</h3>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                {searchQuery ? 'Try adjusting your search or filters.' : 'Applications will appear here when businesses register from the landing page.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">Business</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">Applied</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                  {filteredApps.map((app) => (
                    <tr 
                      key={app.id} 
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      onClick={() => { setSelectedApp(app); setShowDetailModal(true); }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{app.companyName}</p>
                            <p className="text-xs text-gray-500">ID: {app.id.toString().slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate max-w-[180px]">{app.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {app.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 capitalize border border-gray-200 dark:border-white/5">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {app.businessType}
                          </span>
                          <p className="text-xs text-gray-500 capitalize">{app.size} size</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{timeAgo(app.appliedAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(app.id)}
                                className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(app.id)}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => { setSelectedApp(app); setShowDetailModal(true); }}
                            className="p-2 bg-gray-100 dark:bg-white/5 text-gray-500 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                            title="View Details"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12121a] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#12121a] rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedApp.companyName}</h2>
                  <p className="text-xs text-gray-500">ID: {selectedApp.id.toString().slice(-6)}</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowDetailModal(false); setSelectedApp(null); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedApp.status)}
                <span className="text-xs text-gray-500">{formatDate(selectedApp.appliedAt)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Business Type</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{selectedApp.businessType}</p>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Store Size</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{selectedApp.size}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedApp.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedApp.phone}</p>
                  </div>
                </div>
              </div>

              {selectedApp.message && (
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Message</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedApp.message}</p>
                </div>
              )}

              {selectedApp.status === 'approved' && selectedApp.approvedAt && (
                <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-semibold">Approved on {formatDate(selectedApp.approvedAt)}</span>
                  </div>
                </div>
              )}

              {selectedApp.status === 'rejected' && selectedApp.rejectedAt && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                    <XCircle className="w-4 h-4" />
                    <span className="font-semibold">Rejected on {formatDate(selectedApp.rejectedAt)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-white/5 flex items-center justify-between sticky bottom-0 bg-white dark:bg-[#12121a] rounded-b-2xl">
              <button
                onClick={() => handleDelete(selectedApp.id)}
                className="flex items-center gap-2 px-4 py-2 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <div className="flex items-center gap-3">
                {selectedApp.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleReject(selectedApp.id)}
                      className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedApp.id)}
                      className="px-4 py-2 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                    >
                      Approve
                    </button>
                  </>
                )}
                {selectedApp.status !== 'pending' && (
                  <button
                    onClick={() => handleReset(selectedApp.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-100 dark:hover:bg-yellow-500/20 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Pending
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;