import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, FileText, Activity } from 'lucide-react';
import StatCard from '@/components/StatCard';
import Timeline from '@/components/Timeline';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';

const DashboardPage = () => {
  const { assets, heirs, willContent, activities } = useAppData();
  const { user } = useAuth();

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, {user?.name}. Here's your digital legacy overview.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard title="Total Assets" value={assets.length} icon={Shield} color="primary" />
        <StatCard title="Total Heirs" value={heirs.length} icon={Users} color="accent" />
        <StatCard title="Will Status" value={willContent ? 'Written' : 'Pending'} icon={FileText} color={willContent ? 'success' : 'warning'} />
        <StatCard title="Activities" value={activities.length} icon={Activity} color="primary" />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="glass-card p-5">
          <Timeline items={activities.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
