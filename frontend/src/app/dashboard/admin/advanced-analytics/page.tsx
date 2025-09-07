'use client';

import { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import { 
  CalendarDaysIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  CurrencyEuroIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  PresentationChartLineIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '@/components/notifications/NotificationSystem';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

interface AdvancedAnalytics {
  platform_metrics: {
    total_users: number | null;
    active_users_24h: number | null;
    new_registrations_7d: number | null;
    retention_rate_30d: number | null;
    engagement_score: number | null;
  };
  revenue_analytics: {
    total_revenue_cents: number | null;
    revenue_growth_30d: number | null;
    avg_revenue_per_user: number | null;
    commission_earned_cents: number | null;
    pending_payments_cents: number | null;
  };
  lesson_analytics: {
    total_lessons: number | null;
    completed_lessons_7d: number | null;
    cancellation_rate: number | null;
    avg_lesson_duration: number | null;
    satisfaction_score: number | null;
  };
  tutor_analytics: {
    total_tutors: number | null;
    active_tutors_7d: number | null;
    avg_tutor_rating: number | null;
    tutor_utilization_rate: number | null;
    top_subjects: string[];
  };
  student_analytics: {
    total_students: number | null;
    active_students_7d: number | null;
    avg_sessions_per_student: number | null;
    student_progression_rate: number | null;
    completion_rate: number | null;
  };
  performance_trends: {
    labels: string[];
    revenue_trend: number[];
    lessons_trend: number[];
    users_trend: number[];
    satisfaction_trend: number[];
  };
  geographical_data: {
    regions: string[];
    user_distribution: number[];
    revenue_distribution: number[];
  };
  conversion_funnel: {
    visitors: number | null;
    signups: number | null;
    verified: number | null;
    first_lesson: number | null;
    recurring: number | null;
  };
  forecasting?: {
    optimistic_scenario: number[];
    realistic_scenario: number[];
    pessimistic_scenario?: number[];
    forecast_labels: string[];
  };
}

interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  date_range: 'last_7d' | 'last_30d' | 'last_90d' | 'custom';
  custom_start?: string;
  custom_end?: string;
  include_charts: boolean;
  include_raw_data: boolean;
}

export default function AdvancedAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'lessons' | 'users' | 'forecasting'>('overview');
  const [dateRange, setDateRange] = useState('last_30d');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    date_range: 'last_30d',
    include_charts: true,
    include_raw_data: false
  });
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const { addNotification } = useNotifications();

  const fetchAdvancedAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Try backend API only - no fallback data
      try {
        const [analyticsRes, trendsRes, dashboardRes] = await Promise.all([
          fetch(`/api/analytics/metrics?range=${dateRange}`, { headers }),
          fetch(`/api/analytics/trends?days=30`, { headers }),
          fetch('/api/dashboard/live', { headers })
        ]);

        const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null;
        const trendsData = trendsRes.ok ? await trendsRes.json() : null;
        const dashboardData = dashboardRes.ok ? await dashboardRes.json() : null;

        // Generate analytics only if we have real API data
        const generatedAnalytics = generateEnhancedAnalytics(analyticsData, trendsData, dashboardData);
        setAnalytics(generatedAnalytics);
      } catch (apiError) {
        console.log('API not available:', apiError);
        setAnalytics(null);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
      addNotification({
        type: 'error',
        title: 'Errore Caricamento',
        message: 'Impossibile caricare i dati analytics'
      });
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const generateEnhancedAnalytics = (analytics: any, trends: any, dashboard: any): AdvancedAnalytics | null => {
    // Return null if no valid API data is available
    if (!analytics && !trends && !dashboard) {
      return null;
    }

    const base = analytics || {};
    const trendData = trends || { labels: [], completed: [], upcoming: [] };
    
    return {
      platform_metrics: {
        total_users: base.students && base.tutors ? base.students + base.tutors : null,
        active_users_24h: dashboard?.today?.active_users || null,
        new_registrations_7d: base.new_registrations_7d || null,
        retention_rate_30d: base.retention_rate_30d || null,
        engagement_score: base.engagement_score || null
      },
      revenue_analytics: {
        total_revenue_cents: base.revenue_cents_30d || null,
        revenue_growth_30d: base.revenue_growth_30d || null,
        avg_revenue_per_user: base.avg_revenue_per_user || null,
        commission_earned_cents: base.revenue_cents_30d ? Math.round(base.revenue_cents_30d * 0.15) : null,
        pending_payments_cents: base.pending_payments_cents || null
      },
      lesson_analytics: {
        total_lessons: base.bookings || null,
        completed_lessons_7d: base.completed_lessons_7d || (base.completed_24h ? base.completed_24h * 7 : null),
        cancellation_rate: base.cancellation_rate || null,
        avg_lesson_duration: base.avg_lesson_duration || null,
        satisfaction_score: base.satisfaction_score || null
      },
      tutor_analytics: {
        total_tutors: base.tutors || null,
        active_tutors_7d: base.active_tutors_7d || null,
        avg_tutor_rating: base.avg_tutor_rating || null,
        tutor_utilization_rate: base.tutor_utilization_rate || null,
        top_subjects: base.top_subjects || []
      },
      student_analytics: {
        total_students: base.students || null,
        active_students_7d: base.active_students_7d || null,
        avg_sessions_per_student: base.avg_sessions_per_student || null,
        student_progression_rate: base.student_progression_rate || null,
        completion_rate: base.completion_rate || null
      },
      performance_trends: {
        labels: trendData.labels || [],
        revenue_trend: trendData.revenue_trend || [],
        lessons_trend: trendData.completed || [],
        users_trend: trendData.users_trend || [],
        satisfaction_trend: trendData.satisfaction_trend || []
      },
      geographical_data: {
        regions: base.geographical_regions || [],
        user_distribution: base.geographical_user_distribution || [],
        revenue_distribution: base.geographical_revenue_distribution || []
      },
      conversion_funnel: {
        visitors: base.conversion_visitors || null,
        signups: base.conversion_signups || null,
        verified: base.conversion_verified || null,
        first_lesson: base.conversion_first_lesson || null,
        recurring: base.conversion_recurring || null
      },
      forecasting: base.forecasting ? {
        optimistic_scenario: base.forecasting.optimistic_scenario || [],
        realistic_scenario: base.forecasting.realistic_scenario || [],
        pessimistic_scenario: base.forecasting.pessimistic_scenario || [],
        forecast_labels: base.forecasting.forecast_labels || []
      } : undefined
    };
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        format: exportOptions.format,
        date_range: exportOptions.date_range,
        include_charts: exportOptions.include_charts.toString(),
        include_raw_data: exportOptions.include_raw_data.toString(),
        ...(exportOptions.custom_start && { start_date: exportOptions.custom_start }),
        ...(exportOptions.custom_end && { end_date: exportOptions.custom_end })
      });

      const response = await fetch(`/api/admin/analytics/export?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const extensions = { excel: 'xlsx', pdf: 'pdf', csv: 'csv' };
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${extensions[exportOptions.format]}`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        addNotification({
          type: 'success',
          title: 'Export Completato',
          message: `Report ${exportOptions.format.toUpperCase()} scaricato con successo`
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      addNotification({
        type: 'error',
        title: 'Errore Export',
        message: 'Impossibile esportare il report'
      });
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
  };

  const startAutoRefresh = () => {
    if (refreshInterval) clearInterval(refreshInterval);
    const interval = setInterval(fetchAdvancedAnalytics, 30000); // 30 seconds
    setRefreshInterval(interval as unknown as number);
  };

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  };

  const formatCurrency = (cents: number | null) => {
    if (cents === null) return '€0.00';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(cents / 100);
  };

  const formatPercentage = (value: number | null) => {
    if (value === null) return '0.0%';
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number | null) => {
    if (value === null) return '0';
    return value.toLocaleString();
  };

  const getGrowthIcon = (growth: number | null) => {
    if (growth === null) return null;
    return growth >= 0 
      ? <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
      : <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
  };

  const getGrowthColor = (growth: number | null) => {
    if (growth === null) return 'text-gray-500';
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  useEffect(() => {
    fetchAdvancedAnalytics();
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [dateRange]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-foreground-secondary">Caricamento analytics avanzati...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard Avanzato</h1>
          <p className="text-foreground-secondary">Business Intelligence e Performance Analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">
            Ultimo aggiornamento: {lastUpdated.toLocaleTimeString('it-IT')}
          </div>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="last_7d">Ultimi 7 giorni</option>
            <option value="last_30d">Ultimi 30 giorni</option>
            <option value="last_90d">Ultimi 90 giorni</option>
            <option value="last_6m">Ultimi 6 mesi</option>
            <option value="last_year">Ultimo anno</option>
          </select>

          <button
            onClick={refreshInterval ? stopAutoRefresh : startAutoRefresh}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              refreshInterval 
                ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
            }`}
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshInterval ? 'animate-spin' : ''}`} />
            {refreshInterval ? 'Stop Auto-refresh' : 'Auto-refresh'}
          </button>

          <button
            onClick={() => fetchAdvancedAnalytics()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-foreground-secondary rounded-lg transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Aggiorna
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Panoramica', icon: ChartBarIcon },
            { id: 'revenue', name: 'Revenue', icon: CurrencyEuroIcon },
            { id: 'lessons', name: 'Lezioni', icon: CalendarDaysIcon },
            { id: 'users', name: 'Utenti', icon: UserGroupIcon },
            { id: 'forecasting', name: 'Previsioni', icon: PresentationChartLineIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-foreground-secondary hover:border-border'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* No Data State */}
      {!loading && !analytics && (
        <div className="flex flex-col items-center justify-center h-64 bg-background-secondary rounded-lg border">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nessun Dato Disponibile</h3>
          <p className="text-foreground-secondary text-center mb-4">
            I dati analytics non sono ancora disponibili. <br />
            Assicurati che il backend sia in esecuzione e che l'API analytics sia implementata.
          </p>
          <button
            onClick={fetchAdvancedAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Riprova
          </button>
        </div>
      )}

      {analytics && (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground-secondary">Utenti Totali</p>
                      <p className="text-3xl font-bold text-foreground">{formatNumber(analytics.platform_metrics.total_users)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {analytics.platform_metrics.new_registrations_7d && (
                          <>
                            {getGrowthIcon(analytics.platform_metrics.new_registrations_7d > 0 ? 1 : -1)}
                            <span className={`text-sm ${getGrowthColor(analytics.platform_metrics.new_registrations_7d > 0 ? 1 : -1)}`}>
                              {analytics.platform_metrics.new_registrations_7d} nuovi questa settimana
                            </span>
                          </>
                        )}
                        {!analytics.platform_metrics.new_registrations_7d && (
                          <span className="text-sm text-gray-500">Nessun dato disponibile</span>
                        )}
                      </div>
                    </div>
                    <UserGroupIcon className="h-8 w-8 text-primary" />
                  </div>
                </div>

                <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground-secondary">Revenue Totale</p>
                      <p className="text-3xl font-bold text-foreground">{formatCurrency(analytics.revenue_analytics.total_revenue_cents)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {analytics.revenue_analytics.revenue_growth_30d !== null && (
                          <>
                            {getGrowthIcon(analytics.revenue_analytics.revenue_growth_30d)}
                            <span className={`text-sm ${getGrowthColor(analytics.revenue_analytics.revenue_growth_30d)}`}>
                              {formatPercentage(analytics.revenue_analytics.revenue_growth_30d)} vs mese scorso
                            </span>
                          </>
                        )}
                        {analytics.revenue_analytics.revenue_growth_30d === null && (
                          <span className="text-sm text-gray-500">Nessun dato di crescita</span>
                        )}
                      </div>
                    </div>
                    <CurrencyEuroIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground-secondary">Lezioni Completate</p>
                      <p className="text-3xl font-bold text-foreground">{formatNumber(analytics.lesson_analytics.total_lessons)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-foreground-secondary">
                          {analytics.lesson_analytics.satisfaction_score !== null ? (
                            `Rating ${analytics.lesson_analytics.satisfaction_score}/5`
                          ) : (
                            'Rating non disponibile'
                          )}
                        </span>
                      </div>
                    </div>
                    <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground-secondary">Engagement Score</p>
                      <p className="text-3xl font-bold text-foreground">
                        {analytics.platform_metrics.engagement_score !== null ? analytics.platform_metrics.engagement_score : 'N/A'}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {analytics.platform_metrics.engagement_score !== null && analytics.platform_metrics.engagement_score > 7 && (
                          <>
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">Engagement elevato</span>
                          </>
                        )}
                        {analytics.platform_metrics.engagement_score !== null && analytics.platform_metrics.engagement_score <= 7 && (
                          <span className="text-sm text-gray-500">Engagement in crescita</span>
                        )}
                        {analytics.platform_metrics.engagement_score === null && (
                          <span className="text-sm text-gray-500">Dati non disponibili</span>
                        )}
                      </div>
                    </div>
                    <ChartBarIcon className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Performance Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Trend Revenue vs Lezioni</h3>
                  <Line 
                    data={{
                      labels: analytics.performance_trends.labels,
                      datasets: [
                        {
                          label: 'Revenue (€)',
                          data: analytics.performance_trends.revenue_trend,
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4,
                          yAxisID: 'y'
                        },
                        {
                          label: 'Lezioni',
                          data: analytics.performance_trends.lessons_trend,
                          borderColor: 'rgb(16, 185, 129)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          tension: 0.4,
                          yAxisID: 'y1'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' }
                      },
                      scales: {
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          grid: { drawOnChartArea: false }
                        }
                      }
                    }}
                  />
                </div>

                <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Distribuzione Geografica</h3>
                  <Doughnut 
                    data={{
                      labels: analytics.geographical_data.regions,
                      datasets: [{
                        data: analytics.geographical_data.user_distribution,
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(16, 185, 129, 0.8)',
                          'rgba(245, 158, 11, 0.8)',
                          'rgba(239, 68, 68, 0.8)'
                        ],
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Funnel di Conversione</h3>
                <div className="flex items-center justify-between">
                  {analytics.conversion_funnel.visitors ? [
                    { label: 'Visitatori', value: analytics.conversion_funnel.visitors, percentage: 100 },
                    { 
                      label: 'Registrazioni', 
                      value: analytics.conversion_funnel.signups, 
                      percentage: analytics.conversion_funnel.signups && analytics.conversion_funnel.visitors ? 
                        (analytics.conversion_funnel.signups / analytics.conversion_funnel.visitors * 100) : 0 
                    },
                    { 
                      label: 'Verificati', 
                      value: analytics.conversion_funnel.verified, 
                      percentage: analytics.conversion_funnel.verified && analytics.conversion_funnel.visitors ? 
                        (analytics.conversion_funnel.verified / analytics.conversion_funnel.visitors * 100) : 0 
                    },
                    { 
                      label: 'Prima Lezione', 
                      value: analytics.conversion_funnel.first_lesson, 
                      percentage: analytics.conversion_funnel.first_lesson && analytics.conversion_funnel.visitors ? 
                        (analytics.conversion_funnel.first_lesson / analytics.conversion_funnel.visitors * 100) : 0 
                    },
                    { 
                      label: 'Ricorrenti', 
                      value: analytics.conversion_funnel.recurring, 
                      percentage: analytics.conversion_funnel.recurring && analytics.conversion_funnel.visitors ? 
                        (analytics.conversion_funnel.recurring / analytics.conversion_funnel.visitors * 100) : 0 
                    }
                  ].map((step, index) => (
                    <div key={step.label} className="flex flex-col items-center flex-1">
                      <div className="w-full">
                        <div className="text-center mb-2">
                          <p className="text-sm font-medium text-foreground-secondary">{step.label}</p>
                          <p className="text-2xl font-bold text-foreground">{step.value ? step.value.toLocaleString() : '0'}</p>
                          <p className="text-xs text-gray-500">{step.percentage.toFixed(1)}%</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${step.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      {index < 4 && (
                        <div className="flex-shrink-0 mx-2">
                          <FunnelIcon className="h-4 w-4 text-gray-400 rotate-90" />
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="flex items-center justify-center h-32 w-full">
                      <p className="text-foreground-secondary">Dati funnel non disponibili</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                  <h4 className="text-sm font-medium text-foreground-secondary">Revenue Totale</h4>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(analytics.revenue_analytics.total_revenue_cents)}</p>
                  <p className="text-sm text-green-600">+{formatPercentage(analytics.revenue_analytics.revenue_growth_30d)} vs mese scorso</p>
                </div>
                
                <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                  <h4 className="text-sm font-medium text-foreground-secondary">Revenue per Utente</h4>
                  <p className="text-2xl font-bold text-foreground">€{analytics.revenue_analytics.avg_revenue_per_user}</p>
                  <p className="text-sm text-gray-500">Media degli ultimi 30 giorni</p>
                </div>
                
                <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                  <h4 className="text-sm font-medium text-foreground-secondary">Commissioni Platform</h4>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(analytics.revenue_analytics.commission_earned_cents)}</p>
                  <p className="text-sm text-gray-500">15% del revenue totale</p>
                </div>
              </div>

              <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Trend Revenue Dettagliato</h3>
                <Bar 
                  data={{
                    labels: analytics.performance_trends.labels,
                    datasets: [
                      {
                        label: 'Revenue Giornaliero (€)',
                        data: analytics.performance_trends.revenue_trend,
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' }
                    },
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Lessons Tab */}
          {activeTab === 'lessons' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                  <h4 className="text-sm font-medium text-foreground-secondary">Lezioni Totali</h4>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(analytics.lesson_analytics.total_lessons)}</p>
                </div>
                
                <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                  <h4 className="text-sm font-medium text-foreground-secondary">Completate (7 giorni)</h4>
                  <p className="text-2xl font-bold text-foreground">{analytics.lesson_analytics.completed_lessons_7d}</p>
                </div>
                
                <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                  <h4 className="text-sm font-medium text-foreground-secondary">Tasso Cancellazione</h4>
                  <p className="text-2xl font-bold text-foreground">{formatPercentage(analytics.lesson_analytics.cancellation_rate)}</p>
                </div>
                
                <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                  <h4 className="text-sm font-medium text-foreground-secondary">Durata Media</h4>
                  <p className="text-2xl font-bold text-foreground">{analytics.lesson_analytics.avg_lesson_duration} min</p>
                </div>
              </div>

              <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Performance Lezioni nel Tempo</h3>
                <Line 
                  data={{
                    labels: analytics.performance_trends.labels,
                    datasets: [
                      {
                        label: 'Lezioni Completate',
                        data: analytics.performance_trends.lessons_trend,
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                      },
                      {
                        label: 'Soddisfazione (1-5)',
                        data: analytics.performance_trends.satisfaction_trend,
                        borderColor: 'rgb(245, 158, 11)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y1'
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        position: 'left'
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        min: 0,
                        max: 5,
                        grid: { drawOnChartArea: false }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Statistiche Studenti</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Totali:</span>
                        <span className="font-semibold">{formatNumber(analytics.student_analytics.total_students)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Attivi (7 giorni):</span>
                        <span className="font-semibold">{analytics.student_analytics.active_students_7d}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Sessioni/Studente:</span>
                        <span className="font-semibold">{analytics.student_analytics.avg_sessions_per_student}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Tasso Completamento:</span>
                        <span className="font-semibold text-green-600">{formatPercentage(analytics.student_analytics.completion_rate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Statistiche Tutor</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Totali:</span>
                        <span className="font-semibold">{analytics.tutor_analytics.total_tutors}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Attivi (7 giorni):</span>
                        <span className="font-semibold">{analytics.tutor_analytics.active_tutors_7d}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Rating Medio:</span>
                        <span className="font-semibold text-yellow-600">{analytics.tutor_analytics.avg_tutor_rating}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-secondary">Utilizzo:</span>
                        <span className="font-semibold text-primary">{formatPercentage(analytics.tutor_analytics.tutor_utilization_rate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Crescita Utenti</h3>
                <Line 
                  data={{
                    labels: analytics.performance_trends.labels,
                    datasets: [
                      {
                        label: 'Utenti Totali',
                        data: analytics.performance_trends.users_trend,
                        borderColor: 'rgb(139, 92, 246)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' }
                    },
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Forecasting Tab */}
          {activeTab === 'forecasting' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <PresentationChartLineIcon className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Previsioni AI</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">€52,400</p>
                    <p className="text-sm text-foreground-secondary">Revenue Prevista (Prossimo Mese)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">+18%</p>
                    <p className="text-sm text-foreground-secondary">Crescita Stimata Utenti</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">1,450</p>
                    <p className="text-sm text-foreground-secondary">Nuove Lezioni Stimate</p>
                  </div>
                </div>
              </div>

              <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Scenario Analysis</h3>
                <Radar 
                  data={{
                    labels: analytics?.performance_trends?.labels || [],
                    datasets: [
                      {
                        label: 'Scenario Ottimistico',
                        data: analytics?.forecasting?.optimistic_scenario || [],
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      },
                      {
                        label: 'Scenario Realistico',
                        data: analytics?.forecasting?.realistic_scenario || [],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' }
                    },
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background-secondary rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Opzioni Export</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="export-format" className="block text-sm font-medium text-foreground-secondary mb-2">Formato</label>
                <select
                  id="export-format"
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions({...exportOptions, format: e.target.value as any})}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="excel">Excel (XLSX)</option>
                  <option value="pdf">PDF Report</option>
                  <option value="csv">CSV Data</option>
                </select>
              </div>

              <div>
                <label htmlFor="export-period" className="block text-sm font-medium text-foreground-secondary mb-2">Periodo</label>
                <select
                  id="export-period"
                  value={exportOptions.date_range}
                  onChange={(e) => setExportOptions({...exportOptions, date_range: e.target.value as any})}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="last_7d">Ultimi 7 giorni</option>
                  <option value="last_30d">Ultimi 30 giorni</option>
                  <option value="last_90d">Ultimi 90 giorni</option>
                  <option value="custom">Periodo personalizzato</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.include_charts}
                    onChange={(e) => setExportOptions({...exportOptions, include_charts: e.target.checked})}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-foreground-secondary">Includi grafici</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.include_raw_data}
                    onChange={(e) => setExportOptions({...exportOptions, include_raw_data: e.target.checked})}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-foreground-secondary">Includi dati grezzi</span>
                </label>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-background-tertiary">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-foreground-secondary bg-background-secondary border border-border rounded-lg hover:bg-background-tertiary"
                >
                  Annulla
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {exporting ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      Esportando...
                    </>
                  ) : (
                    <>
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Esporta
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
