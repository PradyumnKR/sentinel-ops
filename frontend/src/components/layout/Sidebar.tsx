import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, LayoutDashboard, AlertTriangle, User as UserIcon, LogOut } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/incidents', icon: <AlertTriangle size={20} />, label: 'Incidents' },
    { to: '/profile', icon: <UserIcon size={20} />, label: 'Profile' },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r flex flex-col" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <Shield size={24} style={{ color: 'var(--accent-primary)' }} className="mr-3" />
        <span className="font-bold text-lg tracking-wide" style={{ color: 'var(--text-primary)' }}>SentinelOps</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-[var(--bg-surface-elevated)] text-[var(--accent-primary)] font-medium' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <span className="mr-3">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--accent-primary)] font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Unknown User'}</p>
            <p className="text-xs truncate uppercase tracking-wider mt-0.5 font-semibold" style={{ color: user?.role === 'admin' ? 'var(--severity-high)' : 'var(--text-muted)' }}>
              {user?.role || 'operator'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm rounded-md transition-colors text-[var(--severity-critical)] hover:bg-[rgba(219,75,75,0.1)]"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
