import React, { useState } from 'react';
import { Layers, Plus, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

import { AdminLayout } from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

import { useIssues } from '../../context/IssueContext';
import { adminService } from '../../services/adminService';

export function AdminCategoriesPage() {
  const { categories, reloadData } = useIssues();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priorityWeight, setPriorityWeight] = useState(1.0);
  const [submitting, setSubmitting] = useState(false);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await adminService.addCategory({ name, description, priorityWeight });
      reloadData();
      setName('');
      setDescription('');
      setPriorityWeight(1.0);
      setModalOpen(false);
      toast.success('New category created!');
    } catch (err) {
      toast.error('Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-midnight-800">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Manage Issue Categories</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure active municipal problem categories and set priority weight multipliers.
            </p>
          </div>

          <Button onClick={() => setModalOpen(true)} size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 bg-white dark:bg-midnight-850/90 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 shadow-md dark:shadow-2xl space-y-3.5 backdrop-blur-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/80 px-2.5 py-0.5 rounded-full border border-brand-200/60 dark:border-brand-800/60">
                  Weight: {cat.priorityWeight}x
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  ACTIVE
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">{cat.name}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Category Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Issue Category">
        <form onSubmit={handleAddCategory} className="space-y-4">
          <Input label="Category Name" placeholder="e.g. Traffic Signals & Signs" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Short Description" placeholder="Describe the type of infrastructure problems..." value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input label="Priority Weight Multiplier (e.g. 1.0 to 1.5)" type="number" step="0.1" value={priorityWeight} onChange={(e) => setPriorityWeight(e.target.value)} />

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setModalOpen(false)} variant="outline" size="sm">
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} size="sm">
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
