'use client';

import { useState, useTransition } from 'react';
import { provisionSchoolAction, toggleSchoolStatusAction } from '@/lib/actions/superAdminActions';
import { SchoolType } from '@prisma/client';
import { Plus, School, ShieldAlert, CheckCircle2, X, Lock, User, Mail, MapPin, Power } from 'lucide-react';

interface SchoolsClientProps {
  initialSchools: any[];
}

export default function SchoolsClient({ initialSchools }: SchoolsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [schoolName, setSchoolName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<SchoolType>('BILINGUAL');
  const [address, setAddress] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('Mboa2026!');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const res = await provisionSchoolAction({
        schoolName,
        code,
        type,
        address,
        adminName,
        adminEmail,
        adminPassword,
      });

      if (res.success) {
        setMessage({
          type: 'success',
          text: `School "${schoolName}" provisioned successfully with Admin account "${adminEmail}"!`,
        });
        setSchoolName('');
        setCode('');
        setAddress('');
        setAdminName('');
        setAdminEmail('');
        setIsModalOpen(false);
      } else {
        setMessage({
          type: 'error',
          text: res.error || 'Failed to provision school tenant.',
        });
      }
    });
  }

  function handleToggleStatus(schoolId: string, currentStatus: boolean, name: string) {
    const actionText = currentStatus ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${actionText} subscription for "${name}"?`)) return;

    startTransition(async () => {
      await toggleSchoolStatusAction(schoolId, !currentStatus);
      setMessage({
        type: 'success',
        text: `School "${name}" subscription status updated.`,
      });
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Provision Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            School Tenant Management
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Provision new school tenants and manage active SaaS subscription access
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-blue-950/40 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Provision New School Tenant
        </button>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-200'
              : 'bg-red-950/50 border-red-500/30 text-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* School Tenants Data Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <School className="w-4 h-4 text-blue-400" />
            Provisioned School Tenants ({initialSchools.length})
          </h3>
        </div>

        {initialSchools.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No school tenants provisioned yet. Click the button above to add your first school.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-400">
                  <th className="py-3 px-4">School Name & Code</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Admin Account</th>
                  <th className="py-3 px-4 text-center">Classes</th>
                  <th className="py-3 px-4 text-center">Teachers</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {initialSchools.map((s) => {
                  const adminUser = s.users[0];
                  return (
                    <tr key={s.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-4 font-bold text-white">
                        <div className="space-y-0.5">
                          <span className="text-sm block">{s.name}</span>
                          <span className="font-mono text-[10px] text-slate-400 opacity-80 uppercase px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                            {s.code}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-300 font-medium">
                        <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded text-[11px] font-bold">
                          {s.type}
                        </span>
                      </td>

                      <td className="p-4 text-slate-300">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white block">{adminUser?.name || 'N/A'}</span>
                          <span className="text-slate-400 text-[11px]">{adminUser?.email || 'N/A'}</span>
                        </div>
                      </td>

                      <td className="p-4 text-center font-bold text-white">
                        {s._count?.classes || 0}
                      </td>

                      <td className="p-4 text-center font-bold text-white">
                        {s._count?.teachers || 0}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            s.isActive
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                              : 'bg-red-500/10 border border-red-500/30 text-red-300'
                          }`}
                        >
                          {s.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(s.id, s.isActive, s.name)}
                          disabled={isPending}
                          title={s.isActive ? 'Suspend Tenant' : 'Activate Tenant'}
                          className={`p-2 rounded-lg transition-colors border ${
                            s.isActive
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                <School className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Provision New School Tenant
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Create a dedicated tenant workspace and initial School Admin credentials.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">School Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Collège Jean Tabi"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tenant Code (Unique)</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CJT-01"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subsystem Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as SchoolType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="BILINGUAL">Bilingual (Anglophone & Francophone)</option>
                    <option value="GRAMMAR">Grammar School</option>
                    <option value="TECHNICAL">Technical / Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Campus Location / Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Yaoundé, Centre"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs">Initial School Admin Account Credentials</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Admin Full Name</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Principal Mme. Nkem"
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Admin Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="e.g. principal@jeantabi.cm"
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Temporary Password</label>
                  <input
                    type="text"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-all shadow-md disabled:opacity-50"
                >
                  {isPending ? 'Provisioning...' : 'Provision Tenant Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
