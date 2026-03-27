import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Shield, Users, Video, FileText, Activity,
  ChevronLeft, ChevronRight, Heart, Menu, User, Settings, HelpCircle, Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ownerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assets', label: 'Assets', icon: Shield },
  { to: '/heirs', label: 'Heirs', icon: Users },
  { to: '/videos', label: 'Legacy Videos', icon: Video },
  { to: '/will', label: 'Digital Will', icon: FileText },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help & Guide', icon: HelpCircle },
];

const heirLinks = [
  { to: '/heir-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assets', label: 'Assets', icon: Shield },
  { to: '/videos', label: 'Legacy Videos', icon: Video },
  { to: '/will', label: 'Digital Will', icon: FileText },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help & Guide', icon: HelpCircle },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const links = user?.role === 'HEIR' ? heirLinks : ownerLinks;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <Heart className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight leading-tight">Digital Closure</h1>
            <p className="text-[10px] text-sidebar-foreground/50">Legacy Platform</p>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-nav-item relative ${isActive ? 'active' : ''}`}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{link.label}</span>}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 w-1 h-6 rounded-r-full gradient-primary"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex items-center justify-center p-3 m-3 rounded-xl hover:bg-sidebar-accent text-sidebar-foreground/50 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass-card"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className="md:hidden fixed left-0 top-0 h-full w-[260px] bg-sidebar z-50 border-r border-sidebar-border"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      <aside
        className={`hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
          collapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default AppSidebar;