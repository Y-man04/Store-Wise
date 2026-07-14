import { ShieldCheck, SlidersHorizontal } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/5 bg-[#111118] p-6 shadow-lg shadow-black/10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Admin Settings</h1>
            <p className="text-sm text-gray-400">Manage store preferences and access controls.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/5 bg-[#0e0e16] p-5">
            <h2 className="text-lg font-semibold text-white mb-2">Store profile</h2>
            <p className="text-sm text-gray-500 mb-4">
              Update your store name, contact details, and default settings.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Store name</label>
                <input className="input w-full" value="Store-Wise" readOnly />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Support email</label>
                <input className="input w-full" value="support@storewise.com" readOnly />
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/5 bg-[#0e0e16] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-purple-600/10 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Security</h2>
                <p className="text-sm text-gray-500">Review access settings and account permissions.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#111118] p-4">
                <div>
                  <p className="text-sm font-medium text-white">Require manager approval</p>
                  <p className="text-xs text-gray-500">Approve high-value sales before checkout.</p>
                </div>
                <span className="text-sm text-green-400">Enabled</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#111118] p-4">
                <div>
                  <p className="text-sm font-medium text-white">Two-factor auth</p>
                  <p className="text-xs text-gray-500">Recommended for admin accounts.</p>
                </div>
                <span className="text-sm text-gray-400">Not set</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
