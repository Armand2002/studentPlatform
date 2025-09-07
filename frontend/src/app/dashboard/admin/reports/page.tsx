'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Users,
  BookOpen,
  Euro,
  Filter,
  RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';

interface ReportData {
  period: string;
  totalRevenue: number;
  totalBookings: number;
  activeUsers: number;
  completionRate: number;
  avgSessionDuration: number;
  topTutors: Array<{
    id: number;
    name: string;
    totalEarnings: number;
    totalLessons: number;
    rating: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  userGrowth: Array<{
    month: string;
    students: number;
    tutors: number;
  }>;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState('last_30_days');
  const [reportType, setReportType] = useState('overview');

  // Helper function per convertire dateRange in giorni
  const getDaysFromRange = (range: string): number => {
    switch (range) {
      case 'today': return 1;
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
      default: return 30;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch solo i dati necessari dalla nuova API reports
      const reportsRes = await api.get(`/api/admin/reports/overview?days=${getDaysFromRange(dateRange)}`);
      const reports = reportsRes.data;

      // Usa i dati reali dalla nuova API reports
      const totalRevenue = reports.total_revenue_cents / 100;
      const completionRate = reports.completion_rate;

      setReportData({
        period: dateRange,
        totalRevenue,
        totalBookings: reports.total_bookings,
        activeUsers: reports.active_users,
        completionRate,
        avgSessionDuration: reports.average_session_duration ?? null,
        topTutors: reports.top_tutors || [],
        revenueByMonth: reports.monthly_revenue || [],
        userGrowth: reports.user_growth || [],
      });

    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Impossibile caricare i dati del report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;
    
    const csvContent = [
      ['Metrica', 'Valore'],
      ['Fatturato Totale', `€${reportData.totalRevenue.toFixed(2)}`],
      ['Prenotazioni Totali', reportData.totalBookings.toString()],
      ['Utenti Attivi', reportData.activeUsers.toString()],
      ['Tasso Completamento', `${reportData.completionRate.toFixed(1)}%`],
      ['Durata Media Sessione', `${reportData.avgSessionDuration} min`],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, reportType]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Report</h1>
        </div>
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <div className="text-center text-red-600">
            <p className="font-medium">Errore nel caricamento dei report</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={fetchData}
              className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Riprova
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Report</h1>
        <div className="flex gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background"
          >
            <option value="last_7_days">Ultimi 7 giorni</option>
            <option value="last_30_days">Ultimi 30 giorni</option>
            <option value="last_3_months">Ultimi 3 mesi</option>
            <option value="last_6_months">Ultimi 6 mesi</option>
            <option value="last_year">Ultimo anno</option>
          </select>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            <Download className="w-4 h-4" />
            Esporta CSV
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-background-secondary transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Aggiorna
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-secondary">Fatturato Totale</p>
              <p className="text-2xl font-bold text-foreground">€{reportData.totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-1">+12% vs periodo precedente</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
              <Euro className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-secondary">Prenotazioni</p>
              <p className="text-2xl font-bold text-foreground">{reportData.totalBookings}</p>
              <p className="text-xs text-green-600 mt-1">+8% vs periodo precedente</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-secondary">Utenti Attivi</p>
              <p className="text-2xl font-bold text-foreground">{reportData.activeUsers}</p>
              <p className="text-xs text-green-600 mt-1">+15% vs periodo precedente</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-secondary">Tasso Completamento</p>
              <p className="text-2xl font-bold text-foreground">{reportData.completionRate.toFixed(1)}%</p>
              <p className="text-xs text-green-600 mt-1">+3% vs periodo precedente</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Andamento Fatturato</h3>
          <div className="space-y-3">
            {reportData.revenueByMonth.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-foreground-secondary">{item.month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">€{item.revenue}</span>
                  <div className="w-24 h-2 bg-background-secondary rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(item.revenue / 6000) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground-secondary">{item.bookings} prenotazioni</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* User Growth */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Crescita Utenti</h3>
          <div className="space-y-3">
            {reportData.userGrowth.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-foreground-secondary">{item.month}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">{item.students} studenti</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{item.tutors} tutor</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Top Tutor Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-foreground-secondary">Tutor</th>
                <th className="text-right py-3 px-4 font-medium text-foreground-secondary">Guadagni</th>
                <th className="text-right py-3 px-4 font-medium text-foreground-secondary">Lezioni</th>
                <th className="text-right py-3 px-4 font-medium text-foreground-secondary">Rating</th>
                <th className="text-right py-3 px-4 font-medium text-foreground-secondary">Performance</th>
              </tr>
            </thead>
            <tbody>
              {reportData.topTutors.map((tutor, index) => (
                <tr key={tutor.id} className="border-b border-border hover:bg-background-secondary">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                        {tutor.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{tutor.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-medium">€{tutor.totalEarnings}</td>
                  <td className="text-right py-3 px-4">{tutor.totalLessons}</td>
                  <td className="text-right py-3 px-4">
                    <span className="inline-flex items-center gap-1">
                      ⭐ {tutor.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-background-secondary rounded-full">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${Math.min((tutor.totalEarnings / Math.max(...reportData.topTutors.map((t: any) => t.totalEarnings))) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-foreground-secondary">
                        Relativo
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
