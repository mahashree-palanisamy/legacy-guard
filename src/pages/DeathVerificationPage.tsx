import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Mail, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DeathVerificationPage = () => {
  const [ownerEmail, setOwnerEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const { loginAsHeir } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Please upload a death certificate'); return; }
    setVerifying(true);
    try {
      await loginAsHeir(ownerEmail, file);
      setVerified(true);
      toast.success('Verification successful! Redirecting...');
      setTimeout(() => navigate('/heir-dashboard'), 1500);
    } catch { toast.error('Verification failed'); }
    finally { setVerifying(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card-elevated p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground">Death Verification</h1>
            <p className="text-sm text-primary-foreground/60 mt-1">Access inherited digital assets</p>
          </div>

          {verified ? (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-primary-foreground">Verified Successfully</h2>
              <p className="text-sm text-muted-foreground mt-1">Redirecting to heir dashboard...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary-foreground/80 mb-1.5 block">Owner Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="owner@example.com" required />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-primary-foreground/80 mb-1.5 block">Death Certificate</label>
                <label className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/20">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">{file ? file.name : 'Upload PDF or Image'}</span>
                  <span className="text-xs text-muted-foreground/50 mt-1">Max 10MB</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <button type="submit" disabled={verifying || !file} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Verify & Access Assets'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">← Back to login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default DeathVerificationPage;
