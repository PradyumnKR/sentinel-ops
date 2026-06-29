import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, LayoutDashboard, Asterisk, User as UserIcon, LogOut, Settings, History } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/incidents', icon: <Asterisk size={18} />, label: 'Incidents' },
    { to: '/events', icon: <History size={18} />, label: 'System Events' },
    { to: '/profile', icon: <UserIcon size={18} />, label: 'Profile' },
  ];

  return (
    <aside className="w-52 h-screen fixed left-0 top-0 border-r flex flex-col" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="w-8 h-8 rounded bg-[rgba(192,193,255,0.1)] border border-[rgba(192,193,255,0.2)] flex items-center justify-center mr-3 shrink-0">
          <Shield size={18} style={{ color: 'var(--accent-primary)' }} />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-widest text-white leading-tight">SENTINEL OPS</h1>
          <p className="text-[10px] tracking-widest text-[var(--text-muted)] font-semibold mt-0.5">COMMAND CENTER</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 transition-colors border-l-2 ${
                isActive 
                  ? 'bg-[var(--bg-surface-hover)] border-[var(--button-primary)] text-white font-medium' 
                  : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-white'
              }`
            }
          >
            <span className="mr-4 text-[var(--text-muted)]">{link.icon}</span>
            <span className="text-sm">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="pb-6 space-y-1">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center px-6 py-3 transition-colors border-l-2 border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-white"
        >
          <LogOut size={18} className="mr-4 text-[var(--text-muted)]" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};
