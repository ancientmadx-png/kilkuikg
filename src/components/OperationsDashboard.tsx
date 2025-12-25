import { useState, useEffect } from 'react';
import {
  Activity, TrendingUp, TrendingDown, Minus,
  Award, FileCheck, Shield, ChevronRight,
  Menu, X, Clock, ArrowLeft, Bot,
  XCircle, Share, Database
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { ethers } from 'ethers';
import contractData from '../contracts/AcademicCredentials.json';
import MetricsChart from './dashboard/MetricsChart';
import SystemHealthMonitor from './dashboard/SystemHealthMonitor';
import NotificationsPanel from './dashboard/NotificationsPanel';
import AnimatedGreenRobot from './AnimatedGreenRobot';
import AIAssistantChat from './dashboard/AIAssistantChat';

/* ---------------- TYPES ---------------- */
interface DashboardStats {
  totalCredentials: number;
  activeInstitutions: number;
  verificationRate: number;
  systemHealth: number;
  totalShares: number;
  revokedCredentials: number;
  activeStudents: number;
  avgResponseTime: number;
  trends: {
    credentials: number;
    institutions: number;
    verifications: number;
    health: number;
  };
}

interface ChartDataPoint {
  date: string;
  issued: number;
  verified: number;
  shared: number;
}

interface RecentActivity {
  id: string;
  action: string;
  actor_address: string;
  metadata: any;
  created_at: string;
}

interface OperationsDashboardProps {
  onBack?: () => void;
}

/* ---------------- COMPONENT ---------------- */
export default function OperationsDashboard({ onBack }: OperationsDashboardProps = {}) {
  const [stats, setStats] = useState<DashboardStats>({
    totalCredentials: 0,
    activeInstitutions: 0,
    verificationRate: 0,
    systemHealth: 100,
    totalShares: 0,
    revokedCredentials: 0,
    activeStudents: 0,
    avgResponseTime: 0,
    trends: { credentials: 0, institutions: 0, verifications: 0, health: 0 }
  });

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'ai-assistant'>('dashboard');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  /* ---------------- DATA ---------------- */
  const loadDashboardData = async () => {
    try {
      const [credentials, institutions, auditLogs, recentLogs] = await Promise.all([
        supabase.from('credentials').select('*'),
        supabase
          .from('institution_authorization_requests')
          .select('id')
          .eq('status', 'approved'),
        supabase.from('audit_logs').select('*'),
        supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6)
      ]);

      const totalCreds = credentials.data?.length || 0;
      const activeInsts = institutions.data?.length || 0;
      const verifications =
        auditLogs.data?.filter(l => l.action === 'verified').length || 0;

      setStats(prev => ({
        ...prev,
        totalCredentials: totalCreds,
        activeInstitutions: activeInsts,
        verificationRate: totalCreds
          ? Math.round((verifications / totalCreds) * 100)
          : 0,
        systemHealth: 98
      }));

      setRecentActivities(recentLogs.data || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- HELPERS ---------------- */
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const formatIssuedDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'issued':
        return { icon: Award, color: 'bg-yellow-500/20', iconColor: 'text-yellow-400', label: 'Credential Issued' };
      case 'verified':
        return { icon: FileCheck, color: 'bg-blue-500/20', iconColor: 'text-blue-400', label: 'Verified' };
      case 'shared':
        return { icon: Share, color: 'bg-purple-500/20', iconColor: 'text-purple-400', label: 'Shared' };
      case 'revoked':
        return { icon: XCircle, color: 'bg-red-500/20', iconColor: 'text-red-400', label: 'Revoked' };
      default:
        return { icon: Activity, color: 'bg-gray-500/20', iconColor: 'text-gray-400', label: 'System' };
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 w-64 bg-[#050B18] border-r border-gray-800 z-50
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform`}>
          <div className="p-6 border-b border-gray-800 flex justify-between">
            <span className="text-xl font-bold text-[#F5B301]">ZK LEDGER</span>
            <button className="lg:hidden" onClick={() => setMobileMenuOpen(false)}>
              <X />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-3 text-gray-400 hover:text-[#F5B301]"
              >
                <ArrowLeft /> Back
              </button>
            )}

            {[
              { name: 'Dashboard', icon: Activity, view: 'dashboard' },
              { name: 'AI Assistant', icon: Bot, view: 'ai-assistant' }
            ].map(item => (
              <button
                key={item.name}
                onClick={() => setActiveView(item.view as any)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg
                ${activeView === item.view
                  ? 'bg-[#F5B301] text-black'
                  : 'text-gray-400 hover:bg-[#0B1220] hover:text-[#F5B301]'}`}
              >
                <item.icon />
                {item.name}
                {activeView === item.view && <ChevronRight className="ml-auto" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN */}
        <div className="flex-1 lg:ml-64">
          <header className="bg-black border-b border-gray-800 p-6 flex justify-between">
            <h1 className="text-2xl font-bold text-[#F5B301]">
              {activeView === 'dashboard' ? 'Operations Center' : 'AI Assistant'}
            </h1>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={16} />
              {new Date().toLocaleTimeString()}
            </div>
          </header>

          <main className="p-6 space-y-6">

            {/* AI ASSISTANT */}
            {activeView === 'ai-assistant' && (
              <div className="h-[calc(100vh-10rem)]">
                <AIAssistantChat />
              </div>
            )}

            {/* DASHBOARD */}
            {activeView === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Credentials', value: stats.totalCredentials, icon: Award },
                    { label: 'Active Institutions', value: stats.activeInstitutions, icon: Shield },
                    { label: 'Verification Rate', value: `${stats.verificationRate}%`, icon: FileCheck },
                    { label: 'System Health', value: `${stats.systemHealth}%`, icon: Activity }
                  ].map((card, i) => (
                    <div
                      key={i}
                      className="bg-[#0B1220] border border-gray-800 rounded-xl p-6 hover:border-[#F5B301] transition"
                    >
                      <card.icon className="text-[#F5B301] mb-3" />
                      <div className="text-3xl font-bold">{card.value}</div>
                      <div className="text-gray-400 text-sm">{card.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-[#0B1220] border border-gray-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-[#F5B301] mb-4">
                      Recent Activity
                    </h2>

                    {recentActivities.map(activity => {
                      const cfg = getActivityIcon(activity.action);
                      const Icon = cfg.icon;

                      return (
                        <div key={activity.id} className="flex items-center gap-3 py-3 border-b border-gray-800">
                          <div className={`w-9 h-9 ${cfg.color} rounded-full flex items-center justify-center`}>
                            <Icon className={cfg.iconColor} size={18} />
                          </div>

                          <div className="flex-1">
                            <div className="text-sm font-semibold">{cfg.label}</div>
                            <div className="text-xs text-gray-400">
                              {activity.actor_address
                                ? `${activity.actor_address.slice(0, 8)}...${activity.actor_address.slice(-6)}`
                                : 'System'}
                            </div>
                          </div>

                          <div className="text-xs text-gray-500">
                            {activity.action === 'issued'
                              ? formatIssuedDate(activity.created_at)
                              : getTimeAgo(activity.created_at)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <SystemHealthMonitor systemHealth={stats.systemHealth} />
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <AnimatedGreenRobot size={150} color="#F5B301" animationSpeed={2} />
    </div>
  );
}
