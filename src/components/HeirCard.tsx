import React from 'react';
import { motion } from 'framer-motion';
import type { Heir } from '@/contexts/AppDataContext';
import { User, Mail, Heart, Trash2, Edit } from 'lucide-react';

interface HeirCardProps {
  heir: Heir;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const HeirCard = ({ heir, onEdit, onDelete, showActions = true }: HeirCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass-card p-5 group"
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          {heir.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold">{heir.name}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Heart className="w-3 h-3" /> {heir.relationship}
          </p>
        </div>
      </div>
      {showActions && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Edit className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
        </div>
      )}
    </div>

    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
      <Mail className="w-3.5 h-3.5" />
      <span className="text-xs">{heir.email}</span>
    </div>

    {heir.assignedAssets.length > 0 && (
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">{heir.assignedAssets.length} asset(s) assigned</p>
      </div>
    )}
  </motion.div>
);

export default HeirCard;
