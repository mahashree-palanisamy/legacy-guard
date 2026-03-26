import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, CheckCircle } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';
import { toast } from 'sonner';

const WillPage = () => {
  const { willContent, setWill } = useAppData();
  const [content, setContent] = useState(willContent);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
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
          <p className="text-muted-foreground text-sm mt-1">Write your last wishes and instructions</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground font-medium text-sm">
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Will</>}
        </button>
      </motion.div>

      <div className="glass-card mt-6 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Will Editor</span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="w-full p-6 bg-transparent text-sm leading-relaxed focus:outline-none resize-none"
          placeholder="Dear family and loved ones,

I, [Your Name], being of sound mind, hereby declare this as my digital will and testament.

Write your instructions here regarding the distribution of your digital assets, final messages, and any other wishes you'd like to communicate...

This document serves as my expression of intent for the handling of my digital legacy."
        />
      </div>
    </div>
  );
};

export default WillPage;
