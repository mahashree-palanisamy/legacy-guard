import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, CheckCircle, ShieldAlert } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';
import { useIsOwner } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const WillPage = () => {
  const { willContent, setWill } = useAppData();
  const isOwner = useIsOwner();
  const [content, setContent] = useState(willContent);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!isOwner) { toast.error('You have view-only access'); return; }
    setWill(content);
    setSaved(true);
    toast.success('Will saved successfully');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-title">Digital Will</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isOwner ? 'Write your last wishes and instructions' : 'Viewing the digital will'}
          </p>
        </div>
        {isOwner && (
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground font-medium text-sm">
            {saved ? <><CheckCircle className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Will</>}
          </button>
        )}
      </motion.div>

      {!isOwner && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <ShieldAlert className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">You have view-only access to this document.</p>
        </motion.div>
      )}

      <div className="glass-card mt-6 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{isOwner ? 'Will Editor' : 'Will Document'}</span>
        </div>
        {isOwner ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full p-6 bg-transparent text-sm leading-relaxed focus:outline-none resize-none"
            placeholder="Dear family and loved ones,

I, [Your Name], being of sound mind, hereby declare this as my digital will and testament.

Write your instructions here..."
          />
        ) : (
          <div className="p-6">
            {willContent ? (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">{willContent}</pre>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No will document has been written yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WillPage;
