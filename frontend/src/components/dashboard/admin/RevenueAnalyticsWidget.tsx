'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  Euro, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  Target,
  Calendar,
  Percent
} from 'lucide-react';
import { api } from '@/lib/api';

interface RevenueData {
  today: number | null;
  week: number | null;
  month: number | null;
  total: number | null;
  avgPerLesson: number | null;
  commission: number | null;
  growth: {
    daily: number | null;
    weekly: number | null;
    monthly: number | null;
  };
}

interface RevenueMetricProps {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: number | null;
  color: string;
}

function RevenueMetric({ label, value, icon: Icon, trend, color }: RevenueMetricProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm text-foreground-secondary">{label}</p>
          <p className="font-semibold text-foreground">{value}</p>
        </div>
      </div>
      {trend !== null && trend !== undefined && (
        <div className="flex items-center">
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ml-1 ${
            trend > 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        </div>
      )}
    </div>
  );
}

export function RevenueAnalyticsWidget() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch da API analytics esistenti
      const response = await api.get('/api/analytics/metrics');
      const data = response.data;

      // Calcola i dati revenue solo dai dati API reali
      const monthRevenue = data.revenue_cents_30d ? Math.round(data.revenue_cents_30d / 100) : null;
      const weekRevenue = null; // To be calculated from historical data
      const todayRevenue = null; // To be calculated from historical data
      const totalRevenue = null; // To be calculated from historical data
      const avgPerLesson = null; // To be calculated from lesson data
      const platformCommission = monthRevenue ? Math.round(monthRevenue * 0.15) : null; // 15% commissione

      setRevenueData({
        today: todayRevenue,
        week: weekRevenue,
        month: monthRevenue,
        total: totalRevenue,
        avgPerLesson,
        commission: platformCommission,
        growth: {
          daily: null,
          weekly: null,
          monthly: null,
        },
      });
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError('Impossibile caricare i dati revenue');
      setRevenueData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-background-secondary rounded w-2/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`loading-${i}`} className="h-12 bg-background-secondary rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error || !revenueData) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Errore revenue analytics</p>
          <p className="text-sm mt-1">{error || 'Dati non disponibili'}</p>
          <button 
            onClick={fetchRevenueData}
            className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            Riprova
          </button>
        </div>
      </Card>
    );
  }

  const revenueMetrics = [
    {
      label: 'Oggi',
      value: revenueData.today !== null ? `€${revenueData.today}` : 'N/A',
      icon: Calendar,
      trend: revenueData.growth.daily,
      color: 'bg-blue-500',
    },
    {
      label: 'Settimana',
      value: revenueData.week !== null ? `€${revenueData.week.toLocaleString()}` : 'N/A',
      icon: TrendingUp,
      trend: revenueData.growth.weekly,
      color: 'bg-green-500',
    },
    {
      label: 'Mese',
      value: revenueData.month !== null ? `€${revenueData.month.toLocaleString()}` : 'N/A',
      icon: Euro,
      trend: revenueData.growth.monthly,
      color: 'bg-emerald-500',
    },
    {
      label: 'Totale Platform',
      value: revenueData.total !== null ? `€${revenueData.total.toLocaleString()}` : 'N/A',
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      label: 'Media/Lezione',
      value: revenueData.avgPerLesson !== null ? `€${revenueData.avgPerLesson}` : 'N/A',
      icon: Target,
      color: 'bg-orange-500',
    },
    {
      label: 'Commissioni (15%)',
      value: revenueData.commission !== null ? `€${revenueData.commission.toLocaleString()}` : 'N/A',
      icon: Percent,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue Analytics</h3>
          <p className="text-sm text-foreground-secondary">
            Breakdown dettagliato guadagni piattaforma
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Euro className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="space-y-3">
        {revenueMetrics.map((metric, index) => (
          <RevenueMetric key={`metric-${index}`} {...metric} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 p-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium">Report</span>
          </button>
          <button className="flex items-center justify-center gap-2 p-3 bg-secondary text-white rounded-lg hover:bg-secondary/80 transition-colors">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Performance Eccellente
          </span>
        </div>
        <p className="text-xs text-green-600 mt-1">
          Revenue in crescita del {revenueData.growth.monthly !== null && revenueData.growth.monthly !== undefined ? `+${revenueData.growth.monthly}%` : 'N/A'} rispetto al mese scorso
        </p>
      </div>
    </Card>
  );
}
