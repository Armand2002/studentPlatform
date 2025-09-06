'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Card } from '@/components/ui/Card';
import { TrendingUp, Users, BookOpen, Clock } from 'lucide-react';
import { api } from '@/lib/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsData {
  labels: string[];
  users: number[];
  lessons: number[];
  revenue: number[];
  packages: number[];
}

type ChartType = 'line' | 'bar';
type TimeFrame = 'weekly' | 'monthly';

export function AdminAnalyticsChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('weekly');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    labels: [],
    users: [],
    lessons: [],
    revenue: [],
    packages: [],
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Chiamata alle API analytics esistenti
      const response = await api.get('/api/analytics/trends', {
        params: { 
          days: timeFrame === 'weekly' ? 7 : 30,
          type: 'admin_overview'
        }
      });

      const data = response.data;
      
      if (timeFrame === 'weekly') {
        const weekLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
        setAnalyticsData({
          labels: weekLabels,
          users: data.users || [12, 15, 18, 22, 25, 20, 24],
          lessons: data.completed || [8, 12, 15, 18, 22, 16, 20],
          revenue: data.revenue || [450, 680, 820, 950, 1200, 980, 1150],
          packages: data.packages || [2, 3, 1, 4, 5, 2, 3],
        });
      } else {
        const monthLabels = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'];
        setAnalyticsData({
          labels: monthLabels,
          users: data.users || [120, 145, 168, 192, 215, 238],
          lessons: data.completed || [280, 320, 365, 410, 456, 498],
          revenue: data.revenue || [8500, 9200, 10100, 11500, 12800, 14200],
          packages: data.packages || [25, 28, 32, 35, 38, 42],
        });
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Impossibile caricare i dati analytics');
      
      // Fallback con dati mock
      const weekLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
      const monthLabels = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'];
      
      setAnalyticsData({
        labels: timeFrame === 'weekly' ? weekLabels : monthLabels,
        users: timeFrame === 'weekly' ? [12, 15, 18, 22, 25, 20, 24] : [120, 145, 168, 192, 215, 238],
        lessons: timeFrame === 'weekly' ? [8, 12, 15, 18, 22, 16, 20] : [280, 320, 365, 410, 456, 498],
        revenue: timeFrame === 'weekly' ? [450, 680, 820, 950, 1200, 980, 1150] : [8500, 9200, 10100, 11500, 12800, 14200],
        packages: timeFrame === 'weekly' ? [2, 3, 1, 4, 5, 2, 3] : [25, 28, 32, 35, 38, 42],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeFrame]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-background-secondary rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-background-secondary rounded"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Errore nel caricamento analytics</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            Riprova
          </button>
        </div>
      </Card>
    );
  }

  const ChartComponent = chartType === 'line' ? Line : Bar;

  const chartData = {
    labels: analyticsData.labels,
    datasets: [
      {
        label: 'Nuovi Utenti',
        data: analyticsData.users,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: chartType === 'line',
      },
      {
        label: 'Lezioni Completate',
        data: analyticsData.lessons,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
      {
        label: 'Revenue (€)',
        data: analyticsData.revenue,
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        yAxisID: 'y2',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Utenti / Lezioni',
        },
      },
      y1: {
        type: 'linear' as const,
        display: false,
        position: 'right' as const,
      },
      y2: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Revenue (€)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Analytics Piattaforma</h3>
          <p className="text-sm text-foreground-secondary">
            Monitora crescita utenti, attività e revenue
          </p>
        </div>
        
        <div className="flex gap-2 mt-4 sm:mt-0">
          {/* Time Frame Toggle */}
          <div className="flex bg-background-secondary rounded-lg p-1">
            <button
              onClick={() => setTimeFrame('weekly')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeFrame === 'weekly' 
                  ? 'bg-primary text-white' 
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Settimana
            </button>
            <button
              onClick={() => setTimeFrame('monthly')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeFrame === 'monthly' 
                  ? 'bg-primary text-white' 
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Mese
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-background-secondary rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                chartType === 'line' 
                  ? 'bg-secondary text-white' 
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
              title="Line Chart"
            >
              📈
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                chartType === 'bar' 
                  ? 'bg-secondary text-white' 
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
              title="Bar Chart"
            >
              📊
            </button>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ChartComponent data={chartData} options={options} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">
            {analyticsData.users.reduce((a, b) => a + b, 0)}
          </div>
          <div className="text-sm text-foreground-secondary flex items-center justify-center gap-1">
            <Users className="w-4 h-4" />
            Nuovi Utenti
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">
            {analyticsData.lessons.reduce((a, b) => a + b, 0)}
          </div>
          <div className="text-sm text-foreground-secondary flex items-center justify-center gap-1">
            <Clock className="w-4 h-4" />
            Lezioni
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500">
            €{analyticsData.revenue.reduce((a, b) => a + b, 0).toLocaleString()}
          </div>
          <div className="text-sm text-foreground-secondary flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Revenue
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-500">
            {analyticsData.packages.reduce((a, b) => a + b, 0)}
          </div>
          <div className="text-sm text-foreground-secondary flex items-center justify-center gap-1">
            <BookOpen className="w-4 h-4" />
            Pacchetti
          </div>
        </div>
      </div>
    </Card>
  );
}
