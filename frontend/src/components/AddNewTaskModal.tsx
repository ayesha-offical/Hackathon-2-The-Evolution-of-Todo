'use client';

import { useState } from 'react';
import { X, Upload, ArrowRight } from 'lucide-react';

interface AddNewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function AddNewTaskModal({ isOpen, onClose, onSubmit }: AddNewTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'Moderate',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorityOptions = [
    { label: 'Extreme', color: 'bg-error/40 border-error/60 hover:bg-error/50' },
    { label: 'Moderate', color: 'bg-accent-orange/40 border-accent-orange/60 hover:bg-accent-orange/50' },
    { label: 'Low', color: 'bg-success/40 border-success/60 hover:bg-success/50' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (priority: string) => {
    setFormData(prev => ({ ...prev, priority }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-surface/90 backdrop-blur-lg rounded-2xl shadow-card-lg max-w-2xl w-full border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/10">
          <h2 className="text-3xl font-bold text-white">Add New Task</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">Task Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all backdrop-blur-sm"
              required
            />
          </div>

          {/* Date and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all backdrop-blur-sm"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">Priority</label>
              <div className="flex gap-2">
                {priorityOptions.map(({ label, color }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handlePriorityChange(label)}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-all font-medium text-sm ${
                      formData.priority === label
                        ? `${color} border-current text-white shadow-glow-sm`
                        : `bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10`
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${label === 'Extreme' ? 'bg-error' : label === 'Moderate' ? 'bg-accent-orange' : 'bg-success'}`} />
                      <span>{label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add task details..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none backdrop-blur-sm h-24"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary hover:bg-primary-600 text-white font-semibold rounded-xl transition-all shadow-glow-sm hover:shadow-glow disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
              disabled={isSubmitting || !formData.title}
            >
              <span>{isSubmitting ? 'Creating...' : 'Create Task'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
