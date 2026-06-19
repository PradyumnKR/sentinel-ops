import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, AlertTriangle, Megaphone } from 'lucide-react';
import type { Incident } from '../types';

export const DeclareIncident: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSeverity, setNewSeverity] = useState('Critical');
  const [newCategory, setNewCategory] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newStatus, setNewStatus] = useState('Investigating');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || !newCategory.trim()) {
      addToast('Title, Description, and Category are mandatory.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await api.post<Incident>('/incidents/', {
        title: newTitle,
        description: newDescription,
        severity: newSeverity,
        category: newCategory,
        location: newLocation || undefined,
        status: newStatus
      });
      addToast('Incident declared successfully', 'success');
      navigate(`/incidents/${response.data.id}`);
    } catch (error) {
      addToast('Failed to declare incident.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up pb-10">
      <button 
        onClick={() => navigate('/incidents')}
        className="flex items-center text-sm label-caps text-[var(--text-secondary)] hover:text-white transition-colors"
      >
        <ArrowLeft size={14} className="mr-2" />
        BACK TO DASHBOARD
      </button>

      <div className="glass-panel p-8 md:p-12">
        <div className="flex items-center gap-4 mb-2">
          <AlertTriangle size={32} style={{ color: 'var(--status-high)' }} />
          <h1 className="text-3xl font-bold">Declare Incident</h1>
        </div>
        <p className="text-[var(--text-secondary)] mb-8 ml-[48px]">
          Initiate high-priority response protocol. This action will alert all on-call personnel.
        </p>

        <form onSubmit={handleCreateIncident} className="space-y-6 ml-[48px]">
          <div>
            <label className="block label-caps mb-2 text-[var(--text-primary)]">INCIDENT TITLE *</label>
            <input 
              type="text" 
              className="sentinel-input bg-[var(--input-bg)]" 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)} 
              placeholder="e.g. Database Connection Timeouts in US-East"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block label-caps mb-2 text-[var(--text-primary)]">CATEGORY *</label>
              <select 
                className="sentinel-input bg-[var(--input-bg)] appearance-none cursor-pointer"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
              >
                <option value="" disabled>Select Category...</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Security">Security</option>
                <option value="Database">Database</option>
                <option value="Application">Application</option>
                <option value="Network">Network</option>
              </select>
            </div>
            
            <div>
              <label className="block label-caps mb-2 text-[var(--text-primary)]">SEVERITY LEVEL *</label>
              <select 
                className="sentinel-input bg-[var(--input-bg)] appearance-none cursor-pointer"
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value)}
              >
                <option value="Critical">Critical (SEV-1)</option>
                <option value="High">High (SEV-2)</option>
                <option value="Medium">Medium (SEV-3)</option>
                <option value="Low">Low (SEV-4)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block label-caps mb-2 text-[var(--text-primary)]">INITIAL STATUS</label>
              <select 
                className="sentinel-input bg-[var(--input-bg)] appearance-none cursor-pointer"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Investigating">Investigating</option>
                <option value="Identified">Identified</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Open">Open</option>
              </select>
            </div>
            <div>
              <label className="block label-caps mb-2 text-[var(--text-primary)]">AFFECTED REGION/SERVICE</label>
              <input 
                type="text" 
                className="sentinel-input bg-[var(--input-bg)]" 
                value={newLocation} 
                onChange={(e) => setNewLocation(e.target.value)} 
                placeholder="e.g. us-east-1, Auth Service"
              />
            </div>
          </div>

          <div>
            <label className="block label-caps mb-2 text-[var(--text-primary)]">DESCRIPTION / SYMPTOMS *</label>
            <textarea 
              className="sentinel-input bg-[var(--input-bg)] min-h-[120px]" 
              value={newDescription} 
              onChange={(e) => setNewDescription(e.target.value)} 
              placeholder="Provide detailed symptoms, error logs, or user reports..."
              required
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              className="sentinel-btn sentinel-btn-primary py-3 px-6"
              disabled={isSubmitting}
            >
              <Megaphone size={18} className="mr-2" />
              {isSubmitting ? 'DECLARING...' : 'DECLARE INCIDENT & ALARM ON-CALL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
