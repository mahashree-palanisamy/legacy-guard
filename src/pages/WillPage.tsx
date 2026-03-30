import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Save, CheckCircle, ShieldAlert, Sparkles, Loader2, X, Tag } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';
import { useIsOwner } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Suggestion {
  text: string;
  category: 'legal' | 'assets' | 'personal' | 'guardian' | 'digital';
}

const categoryColors: Record<string, string> = {
  legal: 'bg-primary/20 text-primary',
  assets: 'bg-warning/20 text-warning',
  personal: 'bg-info/20 text-info',
  guardian: 'bg-success/20 text-success',
  digital: 'bg-accent text-accent-foreground',
};

const WillPage = () => {
  const { willContent, setWill } = useAppData();
  const isOwner = useIsOwner();
  const [content, setContent] = useState(willContent);
  const [saved, setSaved] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSave = () => {
    if (!isOwner) { toast.error('You have view-only access'); return; }
    setWill(content);
    setSaved(true);
    toast.success('Will saved successfully');
    setTimeout(() => setSaved(false), 2000);
  };

  const fetchSuggestions = useCallback(async (text: string) => {
    if (!text || text.length < 10) return;
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('will-suggestions', {
        body: { content: text, context: 'Digital will writing' },
      });
      if (error) throw error;
      if (data?.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Debounced AI suggestions
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(newContent), 2000);
  };

  const insertSuggestion = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.slice(0, start) + '\n' + text + '\n' + content.slice(end);
    setContent(newContent);
    toast.success('Suggestion inserted');
  };

  const getAISuggestions = () => {
    fetchSuggestions(content);
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
        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <button
                onClick={getAISuggestions}
                disabled={loadingSuggestions}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary/30 text-primary font-medium text-sm hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                {loadingSuggestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                AI Assist
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground font-medium text-sm">
                {saved ? <><CheckCircle className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Will</>}
              </button>
            </>
          )}
        </div>
      </motion.div>

      {!isOwner && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <ShieldAlert className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">You have view-only access to this document.</p>
        </motion.div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{isOwner ? 'Will Editor' : 'Will Document'}</span>
          </div>
          {isOwner ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              rows={20}
              className="w-full p-6 bg-transparent text-sm leading-relaxed focus:outline-none resize-none text-foreground placeholder:text-muted-foreground"
              placeholder="Dear family and loved ones,

I, [Your Name], being of sound mind, hereby declare this as my digital will and testament.

Write your instructions here..."
            />
          ) : (
            <div className="p-6">
              {willContent ? (
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{willContent}</pre>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No will document has been written yet.</p>
              )}
            </div>
          )}
        </div>

        {/* AI Suggestions Panel */}
        {isOwner && (
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Suggestions</span>
              </div>
              {showSuggestions && (
                <button onClick={() => setShowSuggestions(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {loadingSuggestions ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Analyzing your will...</p>
                </div>
              ) : suggestions.length > 0 ? (
                <AnimatePresence>
                  {suggestions.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => insertSuggestion(s.text)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${categoryColors[s.category] || 'bg-muted text-muted-foreground'}`}>
                          <Tag className="w-2.5 h-2.5" />
                          {s.category}
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{s.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to insert ↵
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Start writing and AI will suggest relevant content</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Or click "AI Assist" for instant suggestions</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WillPage;
