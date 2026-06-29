import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-void)' }}>
      <Sidebar />
      <main className="flex-1 ml-52 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
