import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ShieldAlert } from 'lucide-react';
import HeirCard from '@/components/HeirCard';
import Modal from '@/components/Modal';
import { useAppData } from '@/contexts/AppDataContext';
import { useIsOwner } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const emptyForm = { name: '', email: '', relationship: '' };

const HeirsPage = () => {
  const { heirs, assets, addHeir, updateHeir, deleteHeir, assignHeirToAsset } = useAppData();
  const isOwner = useIsOwner();
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModal, setAssignModal] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    if (!isOwner) { toast.error('You have view-only access'); return; }
    setForm(emptyForm); setEditingId(null); setModalOpen(true);
  };
  const openEdit = (h: typeof heirs[0]) => {
    if (!isOwner) { toast.error('You have view-only access'); return; }
    setForm({ name: h.name, email: h.email, relationship: h.relationship }); setEditingId(h.id); setModalOpen(true);
  };

  const handleSave = () => {
    if (!isOwner) { toast.error('You have view-only access'); return; }
    if (!form.name.trim() || !form.email.trim()) { toast.error('Name and email required'); return; }
    if (editingId) { updateHeir(editingId, form); toast.success('Heir updated'); }
    else { addHeir(form); toast.success('Heir added'); }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!isOwner) { toast.error('You have view-only access'); return; }
    deleteHeir(id); toast.success('Heir deleted');
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-title">Heirs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isOwner ? 'Manage your heirs and asset assignments' : 'Viewing designated heirs'}
          </p>
        </div>
        {isOwner && (
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground font-medium text-sm">
            <Plus className="w-4 h-4" /> Add Heir
          </button>
        )}
      </motion.div>

      {!isOwner && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <ShieldAlert className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">You have view-only access.</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {heirs.map((h) => (
          <div key={h.id}>
            <HeirCard heir={h} onEdit={isOwner ? () => openEdit(h) : undefined} onDelete={isOwner ? () => handleDelete(h.id) : undefined} showActions={isOwner} />
            {isOwner && (
              <button onClick={() => setAssignModal(h.id)} className="mt-2 w-full text-xs text-primary hover:underline">Assign assets →</button>
            )}
          </div>
        ))}
      </div>

      {heirs.length === 0 && (
        <div className="text-center py-16"><p className="text-muted-foreground">No heirs added yet.</p></div>
      )}

      {isOwner && (
        <>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Heir' : 'Add Heir'}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Full name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="heir@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Relationship</label>
                <input value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., Son, Daughter, Spouse" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">Save</button>
              </div>
            </div>
          </Modal>

          <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Assets to Heir">
            <div className="space-y-3">
              {assets.length === 0 && <p className="text-sm text-muted-foreground">No assets available. Add assets first.</p>}
              {assets.map((a) => (
                <button key={a.id} onClick={() => { if (assignModal) { assignHeirToAsset(assignModal, a.id); toast.success(`Assigned "${a.name}"`); } }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 text-sm transition-colors">
                  <span>{a.name}</span>
                  <span className="text-xs text-muted-foreground">{a.type}</span>
                </button>
              ))}
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default HeirsPage;
