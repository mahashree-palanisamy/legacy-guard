import React from 'react';
import { motion } from 'framer-motion';
import Timeline from '@/components/Timeline';
import { useAppData } from '@/contexts/AppDataContext';

const ActivityPage = () => {
  const { activities } = useAppData();

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">Activity Log</h1>
        <p className="text-muted-foreground text-sm mt-1">Complete audit trail of all platform actions</p>
      </motion.div>

      <div className="glass-card p-6 mt-6">
        <Timeline items={activities} />
      </div>
    </div>
  );
};

export default ActivityPage;
