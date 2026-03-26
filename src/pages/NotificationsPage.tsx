import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Users, Video, FileText, Activity } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';

const iconMap: Record<string, React.ElementType> = {
  asset_added: Shield,
  heir_added: Users,
  video_uploaded: Video,
  will_updated: FileText,
  death_verified: Activity,
};

const colorMap: Record<string, string> = {
  asset_added: 'bg-primary/10 text-primary',
  heir_added: 'bg-secondary/10 text-secondary',
  video_uploaded: 'bg-success/10 text-success',
  will_updated: 'bg-info/10 text-info',
  death_verified: 'bg-warning/10 text-warning',
};

const NotificationsPage = () => {
  const { activities } = useAppData();

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Bell className="w-6 h-6 text-primary" />
          <h1 className="section-title">Notifications</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">Your recent activity alerts</p>
      </motion.div>

      <div className="mt-6 space-y-3">
        {activities.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          activities.map((item, i) => {
            const Icon = iconMap[item.type] || Activity;
            const color = colorMap[item.type] || 'bg-muted text-muted-foreground';
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 flex items-center gap-4"
              >
                <div className={`p-2 rounded-xl flex-shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;