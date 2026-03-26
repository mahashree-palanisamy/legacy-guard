import React from 'react';
import { motion } from 'framer-motion';
import type { ActivityItem } from '@/contexts/AppDataContext';
import { Shield, Users, Video, FileText, Skull } from 'lucide-react';

const typeConfig: Record<ActivityItem['type'], { icon: React.ElementType; color: string }> = {
  asset_added: { icon: Shield, color: 'text-primary bg-primary/10' },
  heir_added: { icon: Users, color: 'text-accent bg-accent/10' },
  video_uploaded: { icon: Video, color: 'text-success bg-success/10' },
  will_updated: { icon: FileText, color: 'text-warning bg-warning/10' },
  death_verified: { icon: Skull, color: 'text-destructive bg-destructive/10' },
};

const Timeline = ({ items }: { items: ActivityItem[] }) => (
  <div className="space-y-3">
    {items.map((item, i) => {
      const { icon: Icon, color } = typeConfig[item.type];
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-start gap-3 py-2"
        >
          <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">{item.description}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(item.timestamp).toLocaleString()}
            </p>
          </div>
        </motion.div>
      );
    })}
    {items.length === 0 && (
      <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
    )}
  </div>
);

export default Timeline;
