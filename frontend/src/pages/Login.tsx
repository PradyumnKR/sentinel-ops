import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { AxiosError } from 'axios';
import { Shield, IdCard, Key, Eye, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      await login(response.data.access_token);
      addToast('Login successful', 'success');
      navigate('/');
    } catch (err: unknown) {
        const axiosErr = err as AxiosError<{ detail?: string }> | undefined;
        const message = axiosErr?.response?.data?.detail ?? 'Login failed. Please check your credentials.';
        addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ backgroundColor: 'var(--bg-void)' }}>
      {/* Background Glow Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div 
          className="absolute w-250 h-250 rounded-full blob-1"
          style={{ 
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 60%)',
            filter: 'blur(45px)'
          }}
        />
        <div 
          className="absolute w-125 h-125 rounded-full blob-2"
          style={{ 
            background: 'radial-gradient(circle, rgba(208, 188, 255, 0.30) 0%, transparent 60%)',
            filter: 'blur(45px)',
            marginLeft: '200px',
            marginTop: '-100px'
          }}
        />
      </div>

      <div className="glass-panel w-full max-w-85 p-8 animate-slide-up relative z-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded bg-[rgba(192,193,255,0.05)] border border-[rgba(192,193,255,0.15)] flex items-center justify-center mb-6">
            <Shield size={24} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SENTINEL OPS</h1>
          <p className="label-caps mt-3" style={{ color: 'var(--text-muted)' }}>Command Center Auth</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block label-caps mb-2" style={{ color: 'var(--text-secondary)' }}>Operator ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IdCard size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="sentinel-input pl-10! terminal-text"
                required
                placeholder="sysadmin@sentinel.ops"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block label-caps" style={{ color: 'var(--text-secondary)' }}>Clearance Key</label>
              <span className="label-caps" style={{ color: 'var(--accent-secondary)' }}>Recovery</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="sentinel-input pl-10! pr-10!"
                required
                placeholder="••••••••••••"
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors hover:text-white"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                <Eye size={18} />
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="sentinel-btn sentinel-btn-primary w-full tracking-wide text-sm"
              disabled={isLoading}
            >
              INITIALIZE SESSION <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <div className="mt-8 border-t pt-6 text-center space-y-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Require access? <a href="#" className="hover:underline" style={{ color: 'var(--accent-secondary)' }}>Contact Command</a>
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="status-dot" style={{ backgroundColor: 'var(--status-resolved)' }}></span>
            <span className="label-caps" style={{ color: 'var(--text-muted)' }}>Systems Operational</span>
          </div>
        </div>

      </div>
    </div>
  );
};
