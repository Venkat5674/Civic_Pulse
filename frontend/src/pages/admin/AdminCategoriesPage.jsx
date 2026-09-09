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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Manage Issue Categories</h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure active municipal problem categories and set priority weight multipliers.
            </p>
          </div>

          <Button onClick={() => setModalOpen(true)} size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded">
                  Weight: {cat.priorityWeight}x
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  ACTIVE
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{cat.description}</p>
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
