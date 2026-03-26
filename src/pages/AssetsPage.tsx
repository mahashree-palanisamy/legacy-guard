import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import AssetCard from '@/components/AssetCard';
import Modal from '@/components/Modal';
import { useAppData, type Asset } from '@/contexts/AppDataContext';
import { toast } from 'sonner';

const assetTypes: { value: Asset['type']; label: string }[] = [
  { value: 'bank', label: 'Bank Account' },
  { value: 'social', label: 'Social Media' },
  { value: 'crypto', label: 'Crypto Wallet' },
  { value: 'document', label: 'Document (Aadhar, PAN, etc.)' },
  { value: 'other', label: 'Other' },
];

const emptyForm = { name: '', type: 'bank' as Asset['type'], username: '', password: '', notes: '' };

const AssetsPage = () => {
  const { assets, addAsset, updateAsset, deleteAsset } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (a: Asset) => { setForm({ name: a.name, type: a.type, username: a.username, password: a.password, notes: a.notes }); setEditingId(a.id); setModalOpen(true); };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Asset name is required'); return; }
    if (editingId) {
      updateAsset(editingId, form);
      toast.success('Asset updated');
    } else {
      addAsset(form);
      toast.success('Asset added');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => { deleteAsset(id); toast.success('Asset deleted'); };

  const filtered = assets.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-title">Assets</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your digital assets and credentials</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground font-medium text-sm">
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </motion.div>

      <div className="mt-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets..." className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filtered.map((a) => (
          <AssetCard key={a.id} asset={a} onEdit={() => openEdit(a)} onDelete={() => handleDelete(a.id)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No assets found. Add your first asset to get started.</p>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Asset' : 'Add Asset'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Asset Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., HDFC Savings Account" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Asset['type'] })} className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {assetTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Username / Account ID</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="username or account ID" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="••••••••" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Additional notes..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssetsPage;
