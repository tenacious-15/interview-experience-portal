import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import { 
  User as UserIcon, 
  GraduationCap, 
  Building2, 
  Mail, 
  Calendar, 
  Upload, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setCollege(user.college);
      setBranch(user.branch);
      setGraduationYear(user.graduationYear.toString());
      setCurrentCompany(user.currentCompany || '');
      setAvatar(user.avatar || '');
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (limit to 2MB for base64 safety)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Avatar image must be smaller than 2MB.' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result as string;
        setAvatar(base64Str);
        setAvatarPreview(base64Str);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      await updateUserProfile({
        name,
        college,
        branch,
        graduationYear: parseInt(graduationYear),
        currentCompany,
        avatar: avatar.startsWith('data:') ? avatar : undefined // only send if newly uploaded base64
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">My Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your academic and employment info.</p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-2xl border border-darkBorder space-y-6">
        
        {/* Avatar Upload Sector */}
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-darkBorder pb-6">
          <div className="relative w-24 h-24 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 overflow-hidden flex items-center justify-center text-3xl font-extrabold text-indigo-300">
            {avatarPreview ? (
              <img src={avatarPreview} alt={name} className="w-full h-full object-cover animate-[fadeIn_0.2s_ease-out]" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <h4 className="text-sm font-bold text-slate-200">Profile Picture</h4>
            <p className="text-[10px] text-slate-500">Supports PNG, JPG, or GIF. Maximum 2MB size.</p>
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/5 hover:border-slate-700 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5" />
              Upload Avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address <span className="text-slate-600">(Cannot be modified)</span></label>
            <div className="relative opacity-60">
              <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl input-premium cursor-not-allowed bg-slate-950/60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl input-premium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Company <span className="text-slate-600">(Optional)</span></label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl input-premium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">College Name</label>
            <div className="relative">
              <GraduationCap className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. IIT Delhi"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl input-premium font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branch / Specialization</label>
            <input
              type="text"
              required
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g. Computer Science"
              className="w-full px-4 py-2.5 rounded-xl input-premium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Graduation Year</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
              <input
                type="number"
                required
                min={2020}
                max={2035}
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="2026"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl input-premium"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-darkBorder">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl font-bold text-white btn-premium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader size="sm" /> : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
