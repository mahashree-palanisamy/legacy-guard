import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface Asset {
  id: string;
  name: string;
  type: 'bank' | 'social' | 'crypto' | 'document' | 'other';
  username: string;
  password: string;
  notes: string;
  assignedHeirs: string[];
  createdAt: string;
}

export interface Heir {
  id: string;
  name: string;
  email: string;
  relationship: string;
  assignedAssets: string[];
  createdAt: string;
}

export interface VideoMessage {
  id: string;
  title: string;
  fileName: string;
  thumbnail?: string;
  duration?: string;
  createdAt: string;
  analysisResult?: {
    status: 'verified' | 'review_needed';
    confidence: number;
    checks: { label: string; passed: boolean }[];
  };
}

export interface ActivityItem {
  id: string;
  type: 'asset_added' | 'heir_added' | 'video_uploaded' | 'will_updated' | 'death_verified';
  description: string;
  timestamp: string;
}

interface AppData {
  assets: Asset[];
  heirs: Heir[];
  videos: VideoMessage[];
  willContent: string;
  activities: ActivityItem[];
  addAsset: (a: Omit<Asset, 'id' | 'createdAt' | 'assignedHeirs'>) => void;
  updateAsset: (id: string, a: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  addHeir: (h: Omit<Heir, 'id' | 'createdAt' | 'assignedAssets'>) => void;
  updateHeir: (id: string, h: Partial<Heir>) => void;
  deleteHeir: (id: string) => void;
  addVideo: (v: Omit<VideoMessage, 'id' | 'createdAt'>) => void;
  setWill: (content: string) => void;
  assignHeirToAsset: (heirId: string, assetId: string) => void;
}

const AppDataContext = createContext<AppData | undefined>(undefined);

const genId = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const KEYS = {
  assets: 'pdcp_assets',
  heirs: 'pdcp_heirs',
  videos: 'pdcp_videos',
  will: 'pdcp_will',
  activities: 'pdcp_activities',
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const defaultActivities: ActivityItem[] = [
  { id: '1', type: 'asset_added', description: 'Bank account "HDFC Savings" added', timestamp: '2026-03-25T10:30:00Z' },
  { id: '2', type: 'heir_added', description: 'Heir "Priya Sharma" added', timestamp: '2026-03-24T14:20:00Z' },
  { id: '3', type: 'will_updated', description: 'Digital will updated', timestamp: '2026-03-23T09:15:00Z' },
];

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [assets, setAssets] = useState<Asset[]>(() => loadJson(KEYS.assets, []));
  const [heirs, setHeirs] = useState<Heir[]>(() => loadJson(KEYS.heirs, []));
  const [videos, setVideos] = useState<VideoMessage[]>(() => loadJson(KEYS.videos, []));
  const [willContent, setWillContent] = useState(() => localStorage.getItem(KEYS.will) || '');
  const [activities, setActivities] = useState<ActivityItem[]>(() => loadJson(KEYS.activities, defaultActivities));

  // Persist to localStorage on every change
  useEffect(() => { localStorage.setItem(KEYS.assets, JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem(KEYS.heirs, JSON.stringify(heirs)); }, [heirs]);
  useEffect(() => { localStorage.setItem(KEYS.videos, JSON.stringify(videos)); }, [videos]);
  useEffect(() => { localStorage.setItem(KEYS.will, willContent); }, [willContent]);
  useEffect(() => { localStorage.setItem(KEYS.activities, JSON.stringify(activities)); }, [activities]);

  const addActivity = (type: ActivityItem['type'], description: string) => {
    setActivities((prev) => [{ id: genId(), type, description, timestamp: now() }, ...prev]);
  };

  const addAsset = (a: Omit<Asset, 'id' | 'createdAt' | 'assignedHeirs'>) => {
    setAssets((prev) => [...prev, { ...a, id: genId(), createdAt: now(), assignedHeirs: [] }]);
    addActivity('asset_added', `Asset "${a.name}" added`);
  };
  const updateAsset = (id: string, a: Partial<Asset>) => setAssets((prev) => prev.map((x) => (x.id === id ? { ...x, ...a } : x)));
  const deleteAsset = (id: string) => setAssets((prev) => prev.filter((x) => x.id !== id));

  const addHeir = (h: Omit<Heir, 'id' | 'createdAt' | 'assignedAssets'>) => {
    setHeirs((prev) => [...prev, { ...h, id: genId(), createdAt: now(), assignedAssets: [] }]);
    addActivity('heir_added', `Heir "${h.name}" added`);
  };
  const updateHeir = (id: string, h: Partial<Heir>) => setHeirs((prev) => prev.map((x) => (x.id === id ? { ...x, ...h } : x)));
  const deleteHeir = (id: string) => setHeirs((prev) => prev.filter((x) => x.id !== id));

  const addVideo = (v: Omit<VideoMessage, 'id' | 'createdAt'>) => {
    setVideos((prev) => [...prev, { ...v, id: genId(), createdAt: now() }]);
    addActivity('video_uploaded', `Video "${v.title}" uploaded`);
  };

  const setWill = (content: string) => {
    setWillContent(content);
    addActivity('will_updated', 'Digital will updated');
  };

  const assignHeirToAsset = (heirId: string, assetId: string) => {
    setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, assignedHeirs: [...new Set([...a.assignedHeirs, heirId])] } : a)));
    setHeirs((prev) => prev.map((h) => (h.id === heirId ? { ...h, assignedAssets: [...new Set([...h.assignedAssets, assetId])] } : h)));
  };

  return (
    <AppDataContext.Provider value={{ assets, heirs, videos, willContent, activities, addAsset, updateAsset, deleteAsset, addHeir, updateHeir, deleteHeir, addVideo, setWill, assignHeirToAsset }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
};