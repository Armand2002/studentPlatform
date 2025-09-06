'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Euro,
  BarChart3,
  CheckCircle 
} from 'lucide-react';
import { api } from '@/lib/api';

interface PlatformMetricsData {
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalPackages: number;
  activeLessons: number;
  completedLessons24h: number;
  totalRevenue30d: number;
  platformGrowth: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  color: string;
  description: string;
}

function MetricCard({ title, value, icon: Icon, trend, color, description }: MetricCardProps) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground-secondary">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          <p className="text-xs text-foreground-secondary mt-1">{description}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center">
            <TrendingUp className={`w-4 h-4 mr-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-xs text-foreground-secondary ml-1">vs mese scorso</span>
          </div>
        </div>
      )}
    </Card>
  );
}

export function PlatformMetrics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PlatformMetricsData>({
    totalUsers: 0,
    totalStudents: 0,
    totalTutors: 0,
    totalPackages: 0,
    activeLessons: 0,
    completedLessons24h: 0,
    totalRevenue30d: 0,
    platformGrowth: 0,
  });

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dalle API esistenti del backend
      const [analyticsRes, usersRes] = await Promise.all([
        api.get('/api/analytics/metrics'),
        api.get('/api/admin/users'),
      ]);

      const analyticsData = analyticsRes.data;
      const usersData = usersRes.data;

      setMetrics({
        totalUsers: usersData.length || 0,
        totalStudents: analyticsData.students || 0,
        totalTutors: analyticsData.tutors || 0,
        totalPackages: analyticsData.packages || 0,
        activeLessons: analyticsData.bookings || 0,
        completedLessons24h: analyticsData.completed_24h || 0,
        totalRevenue30d: Math.round((analyticsData.revenue_cents_30d || 0) / 100),
        platformGrowth: 12, // Mock per ora
      });
    } catch (err) {
      console.error('Error fetching platform metrics:', err);
      setError('Impossibile caricare le metriche della piattaforma');
      
      // Fallback con dati mock
      setMetrics({
        totalUsers: 175,
        totalStudents: 150,
        totalTutors: 25,
        totalPackages: 42,
        activeLessons: 18,
        completedLessons24h: 8,
        totalRevenue30d: 15420,
        platformGrowth: 12,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-background-secondary rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-background-secondary rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-background-secondary rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Errore nel caricamento delle metriche</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={fetchMetrics}
            className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            Riprova
          </button>
        </div>
      </Card>
    );
  }

  const metricCards = [
    {
      title: 'Utenti Totali',
      value: metrics.totalUsers,
      icon: Users,
      trend: metrics.platformGrowth,
      color: 'bg-blue-500',
      description: 'Studenti + Tutors registrati'
    },
    {
      title: 'Studenti Attivi',
      value: metrics.totalStudents,
      icon: GraduationCap,
      trend: 8,
      color: 'bg-green-500',
      description: 'Con pacchetti attivi'
    },
    {
      title: 'Tutors Verificati',
      value: metrics.totalTutors,
      icon: Users,
      trend: 15,
      color: 'bg-purple-500',
      description: 'Tutors approvati e attivi'
    },
    {
      title: 'Pacchetti Venduti',
      value: metrics.totalPackages,
      icon: BookOpen,
      trend: 22,
      color: 'bg-orange-500',
      description: 'Totale pacchetti attivi'
    },
    {
      title: 'Lezioni Attive',
      value: metrics.activeLessons,
      icon: Clock,
      color: 'bg-teal-500',
      description: 'Lezioni programmate oggi'
    },
    {
      title: 'Completate (24h)',
      value: metrics.completedLessons24h,
      icon: CheckCircle,
      color: 'bg-green-600',
      description: 'Lezioni completate oggi'
    },
    {
      title: 'Revenue (30g)',
      value: `€${metrics.totalRevenue30d.toLocaleString()}`,
      icon: Euro,
      trend: 18,
      color: 'bg-emerald-500',
      description: 'Fatturato ultimo mese'
    },
    {
      title: 'Crescita Platform',
      value: `+${metrics.platformGrowth}%`,
      icon: BarChart3,
      color: 'bg-indigo-500',
      description: 'Crescita mensile utenti'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => (
        <MetricCard key={`metric-${index}`} {...metric} />
      ))}
    </div>
  );
}
