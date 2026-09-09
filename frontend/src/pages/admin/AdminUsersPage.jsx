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
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">User Directory & Roles</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage registered platform users and grant City Administrator privileges.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4 text-right">Role Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-brand-50 text-brand-700 border border-brand-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
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
    </AdminLayout>
  );
}
