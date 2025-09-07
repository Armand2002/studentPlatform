'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';

interface PerformanceData {
  totalStudents: number;
  activeStudents: number;
  totalLessons: number;
  completedLessons: number;
  avgRating: number;
  responseTime: number; // in hours
  successRate: number; // percentage
  retentionRate: number; // percentage
  weeklyHours: number;
  monthlyGrowth: number;
}

export function PerformanceMetrics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);

  const loadPerformance = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ottieni performance tutor dal dashboard backend
      const [perfResponse, liveResponse] = await Promise.all([
        api.get('/api/dashboard/tutor-performance'),
        api.get('/api/dashboard/live')
      ]);
      
      const perfData = perfResponse.data;
      const liveData = liveResponse.data;
      
      // Estrai metriche dai dati reali del backend
      const tutorPerf = perfData.tutor_performance?.[0] || {};
      const totalLessons = perfData.total_lessons_completed ?? 0;
      
      // SOLO DATI REALI - nessun calcolo artificiale
      // Se non ci sono dati storici, mostriamo valori null
      const calculatedRating = perfData.avg_rating ?? null; // Solo rating reale
      const calculatedResponseTime = perfData.avg_response_time ?? null; // Solo tempo reale
      const calculatedRetention = perfData.retention_rate ?? null; // Solo retention reale
      const calculatedSuccessRate = tutorPerf.completion_rate ?? null; // Solo success rate reale
      
      // NESSUN GROWTH CALCULATO - solo 0% finché non implementiamo tracking storico
      const monthlyGrowthCalc = 0;
      
      setPerformance({
        totalStudents: liveData.active_students_today ?? null,
        activeStudents: liveData.active_students_today ?? null,
        totalLessons: totalLessons,
        completedLessons: tutorPerf.lessons_completed ?? null,
        avgRating: calculatedRating,
        responseTime: calculatedResponseTime,
        successRate: calculatedSuccessRate,
        retentionRate: calculatedRetention,
        weeklyHours: tutorPerf.hours_taught ?? null,
        monthlyGrowth: monthlyGrowthCalc
      });
    } catch (err) {
      console.error('Error loading performance data:', err);
      setError('Impossibile caricare le metriche performance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformance();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-foreground/10 rounded mb-2"></div>
            <div className="h-8 bg-foreground/10 rounded mb-1"></div>
            <div className="h-3 bg-foreground/10 rounded"></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-foreground/10 rounded mb-2"></div>
            <div className="h-8 bg-foreground/10 rounded mb-1"></div>
            <div className="h-3 bg-foreground/10 rounded"></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-foreground/10 rounded mb-2"></div>
            <div className="h-8 bg-foreground/10 rounded mb-1"></div>
            <div className="h-3 bg-foreground/10 rounded"></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-foreground/10 rounded mb-2"></div>
            <div className="h-8 bg-foreground/10 rounded mb-1"></div>
            <div className="h-3 bg-foreground/10 rounded"></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-foreground/10 rounded mb-2"></div>
            <div className="h-8 bg-foreground/10 rounded mb-1"></div>
            <div className="h-3 bg-foreground/10 rounded"></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-foreground/10 rounded mb-2"></div>
            <div className="h-8 bg-foreground/10 rounded mb-1"></div>
            <div className="h-3 bg-foreground/10 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !performance) {
    return (
      <Card className="p-6">
        <div className="text-center text-foreground-secondary">
          <p>Errore nel caricamento delle metriche</p>
          <button 
            onClick={loadPerformance}
            className="mt-2 text-primary hover:text-primary/80"
          >
            Riprova
          </button>
        </div>
      </Card>
    );
  }

  const formatRating = (rating: number) => {
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    return `${stars} ${rating.toFixed(1)}`;
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; excellent: number }) => {
    if (value >= thresholds.excellent) return 'text-green-500';
    if (value >= thresholds.good) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-500';
    if (growth < 0) return 'text-red-500';
    return 'text-foreground-secondary';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '↗️';
    if (growth < 0) return '↘️';
    return '➡️';
  };

  const getPerformanceTip = (perfData: PerformanceData) => {
    if (perfData.responseTime > 4) {
      return "Prova a ridurre il tempo di risposta ai messaggi per migliorare la soddisfazione degli studenti.";
    }
    if (perfData.retentionRate < 85) {
      return "Considera di implementare sessioni di follow-up per aumentare la retention degli studenti.";
    }
    return "Ottimo lavoro! Le tue metriche sono eccellenti. Continua così!";
  };

  const metrics = [
    {
      title: 'Studenti Attivi',
      value: performance.activeStudents,
      subtitle: `di ${performance.totalStudents} totali`,
      icon: '👥',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Lezioni Completate',
      value: performance.completedLessons,
      subtitle: `di ${performance.totalLessons} programmate`,
      icon: '✅',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Valutazione Media',
      value: formatRating(performance.avgRating),
      subtitle: 'Feedback studenti',
      icon: '⭐',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Tempo Risposta',
      value: `${performance.responseTime}h`,
      subtitle: 'Media messaggi',
      icon: '⚡',
      color: getPerformanceColor(24 - performance.responseTime, { good: 20, excellent: 22 }),
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Tasso Successo',
      value: `${performance.successRate}%`,
      subtitle: 'Obiettivi raggiunti',
      icon: '🎯',
      color: getPerformanceColor(performance.successRate, { good: 80, excellent: 90 }),
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Retention Rate',
      value: `${performance.retentionRate}%`,
      subtitle: 'Studenti fedeli',
      icon: '💝',
      color: getPerformanceColor(performance.retentionRate, { good: 70, excellent: 85 }),
      bgColor: 'bg-pink-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <Card key={metric.title} className={`p-4 ${metric.bgColor} border-opacity-20`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{metric.icon}</span>
              <div className={`text-xs px-2 py-1 rounded-full ${metric.bgColor} ${metric.color}`}>
                #{index + 1}
              </div>
            </div>
            <div className={`text-xl font-bold ${metric.color} mb-1`}>
              {metric.value}
            </div>
            <div className="text-xs text-foreground-secondary">{metric.title}</div>
            <div className="text-xs text-foreground-secondary mt-1">
              {metric.subtitle}
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Riepilogo Performance</h3>
          <div className={`text-sm font-medium ${getGrowthColor(performance.monthlyGrowth)}`}>
            {getGrowthIcon(performance.monthlyGrowth)} 
            {Math.abs(performance.monthlyGrowth).toFixed(1)}% questo mese
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Weekly Activity */}
          <div className="text-center p-4 bg-background-secondary rounded-lg">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-primary mb-1">
              {performance.weeklyHours}h
            </div>
            <div className="text-sm text-foreground-secondary">Ore Settimanali</div>
            <div className="text-xs text-foreground-secondary mt-1">
              ~{Math.round(performance.weeklyHours / 7)} ore/giorno
            </div>
          </div>

          {/* Success Rate Breakdown */}
          <div className="text-center p-4 bg-background-secondary rounded-lg">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-green-500 mb-1">
              {Math.round((performance.completedLessons / performance.totalLessons) * 100)}%
            </div>
            <div className="text-sm text-foreground-secondary">Completion Rate</div>
            <div className="text-xs text-foreground-secondary mt-1">
              {performance.totalLessons - performance.completedLessons} lezioni cancellate
            </div>
          </div>

          {/* Student Engagement */}
          <div className="text-center p-4 bg-background-secondary rounded-lg">
            <div className="text-3xl mb-2">❤️</div>
            <div className="text-2xl font-bold text-pink-500 mb-1">
              {Math.round((performance.activeStudents / performance.totalStudents) * 100)}%
            </div>
            <div className="text-sm text-foreground-secondary">Engagement Rate</div>
            <div className="text-xs text-foreground-secondary mt-1">
              {performance.totalStudents - performance.activeStudents} studenti inattivi
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="mt-6 p-4 bg-blue-500/5 rounded-lg border border-blue-500/10">
          <div className="flex items-start gap-3">
            <span className="text-blue-500 text-xl">💡</span>
            <div>
              <div className="font-medium text-foreground mb-1">Suggerimento</div>
              <div className="text-sm text-foreground-secondary">
                {getPerformanceTip(performance)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
