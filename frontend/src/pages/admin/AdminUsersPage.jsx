import React, { useState, useEffect } from 'react';
import { Users, Shield, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

import { AdminLayout } from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/Button';
import { adminService } from '../../services/adminService';

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await adminService.getUsers();
        setUsers(list);
      } catch (err) {
        toast.error('Failed to load user directory');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const nextRole = currentRole === 'ADMIN' ? 'CITIZEN' : 'ADMIN';
    try {
      const updated = await adminService.updateUserRole(userId, nextRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast.success(`User role updated to ${nextRole}`);
    } catch (err) {
      toast.error('Failed to update user role');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="pb-2 border-b border-slate-200/60 dark:border-midnight-800">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">User Directory & Roles</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage registered platform users and grant City Administrator privileges.
          </p>
        </div>

        <div className="bg-white dark:bg-midnight-850/90 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 shadow-md dark:shadow-2xl overflow-hidden backdrop-blur-xl transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50/90 dark:bg-midnight-800/80 text-slate-500 dark:text-slate-400 uppercase font-extrabold text-[10px] border-b border-slate-200/80 dark:border-midnight-700/80">
                <tr>
                  <th className="py-4 px-4">User</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4 text-right">Role Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-midnight-800/60 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-midnight-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20" />
                        <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                            : 'bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button onClick={() => handleRoleToggle(u.id, u.role)} variant="outline" size="sm">
                        {u.role === 'ADMIN' ? 'Demote to Citizen' : 'Promote to Admin'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
