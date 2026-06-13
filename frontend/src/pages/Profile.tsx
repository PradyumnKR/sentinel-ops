import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User as UserIcon, Mail, Shield, Calendar, Save } from 'lucide-react';
import api from '../services/api';

export const Profile: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const { addToast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real app we would have a PUT /api/users/me or similar
      // Since it's not defined in the backend explicitly yet, we'll try a mock or generic update
      await api.put('/users/me', { name });
      await checkAuth(); // Refresh user data
      addToast('Profile updated successfully', 'success');
    } catch (error) {
      addToast('Update failed. Backend endpoint might not exist yet.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <UserIcon className="mr-3" size={32} style={{ color: 'var(--accent-primary)' }} />
        My Profile
      </h1>
      
      <div className="glass-panel p-8 space-y-8 animate-slide-up">
        
        <div className="flex items-center space-x-6 pb-8 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold" 
               style={{ background: 'var(--bg-surface-elevated)', color: 'var(--accent-primary)', border: '2px solid var(--border-strong)' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-sm uppercase tracking-wider font-bold mt-1" 
               style={{ color: user.role === 'admin' ? 'var(--severity-critical)' : 'var(--accent-secondary)' }}>
              {user.role}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: 'var(--text-secondary)' }}>
              <UserIcon size={16} className="mr-2" />
              Full Name
            </label>
            <input 
              type="text" 
              className="sentinel-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: 'var(--text-secondary)' }}>
              <Mail size={16} className="mr-2" />
              Email Address
            </label>
            <input 
              type="email" 
              className="sentinel-input opacity-50 cursor-not-allowed" 
              value={user.email} 
              disabled 
            />
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Email addresses cannot be changed directly.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: 'var(--text-secondary)' }}>
              <Shield size={16} className="mr-2" />
              Role
            </label>
            <input 
              type="text" 
              className="sentinel-input opacity-50 cursor-not-allowed uppercase" 
              value={user.role} 
              disabled 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={16} className="mr-2" />
              Member Since
            </label>
            <input 
              type="text" 
              className="sentinel-input opacity-50 cursor-not-allowed" 
              value={new Date(user.created_at).toLocaleDateString()} 
              disabled 
            />
          </div>
        </div>

        <div className="pt-6 border-t flex justify-end" style={{ borderColor: 'var(--border-subtle)' }}>
          <button 
            className="sentinel-btn sentinel-btn-primary" 
            onClick={handleSave}
            disabled={isSaving || name === user.name}
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
