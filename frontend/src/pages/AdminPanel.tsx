import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import { 
  Users, 
  ShieldAlert, 
  Trash, 
  UserMinus, 
  UserPlus, 
  Mail, 
  GraduationCap 
} from 'lucide-react';

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  college: string;
  branch: string;
  graduationYear: number;
  currentCompany?: string;
  isVerified: boolean;
  createdAt: string;
}

export const AdminPanel: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (userId: string) => {
    setMessage(null);
    setActionLoadingId(userId);
    try {
      const res = await api.put(`/admin/users/${userId}/role`);
      // Update local state
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, role: res.data.role };
        }
        return u;
      }));
      setMessage({ type: 'success', text: res.data.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to toggle role.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`DANGER: Are you sure you want to permanently delete user "${userName}"? This will delete all their interview experiences, tips, and comments.`)) {
      return;
    }

    setMessage(null);
    setActionLoadingId(userId);
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setMessage({ type: 'success', text: res.data.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete user.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
          Admin Moderation Panel
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage system users, toggle administrative roles, and moderate spam accounts.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl border text-xs ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
        }`}>
          {message.text}
        </div>
      )}

      {/* Users Table */}
      <div className="glass-card rounded-2xl border border-darkBorder overflow-hidden">
        <div className="p-5 border-b border-darkBorder flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200">Registered Users ({users.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-darkBorder bg-slate-900/40 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Academic Details</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = currentUser && u.id === currentUser.id;
                const isWorking = actionLoadingId === u.id;

                return (
                  <tr 
                    key={u.id}
                    className="border-b border-darkBorder/40 hover:bg-slate-900/10 transition-colors"
                  >
                    {/* User profile metadata */}
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{u.name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{u.email}</span>
                      </div>
                    </td>

                    {/* Academy metadata */}
                    <td className="p-4">
                      <div className="text-slate-300 font-medium">{u.college.split(',')[0]}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>{u.branch} (Class of {u.graduationYear})</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        u.role === 'admin' 
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25' 
                          : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Verified Status */}
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase ${u.isVerified ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {u.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>

                    {/* Registered Date */}
                    <td className="p-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    {/* Moderation actions */}
                    <td className="p-4 text-right">
                      {isSelf ? (
                        <span className="text-[10px] text-slate-500 font-bold italic">You (Current Admin)</span>
                      ) : isWorking ? (
                        <Loader size="sm" />
                      ) : (
                        <div className="flex gap-2 justify-end">
                          {/* Toggle role */}
                          <button
                            onClick={() => handleToggleRole(u.id)}
                            title={u.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              u.role === 'admin'
                                ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20'
                            }`}
                          >
                            {u.role === 'admin' ? <UserMinus className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete user */}
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            title="Delete User"
                            className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-450 hover:bg-rose-500/20 transition-colors"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
