'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';

interface EarningsData {
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  avgPerLesson: number;
  totalLessons: number;
}

export function EarningsBreakdown() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);

  const loadEarnings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ottieni dati live dashboard per earnings tutor  
      const [todayResponse, performanceResponse] = await Promise.all([
        api.get('/api/dashboard/live'),
        api.get('/api/dashboard/tutor-performance')
      ]);
      
      const todayData = todayResponse.data;
      const perfData = performanceResponse.data;
      
      // Calcola totali da dati reali
      const totalRevenue = perfData.total_revenue_generated || 0;
      const totalLessons = perfData.total_lessons_completed || 0;
      
      // NESSUN CALCOLO DI GROWTH - usiamo solo dati reali
      // Growth sarà 0% finché non implementiamo tracking storico nel backend
      const weeklyGrowthCalc = 0;
      const monthlyGrowthCalc = 0;
      
      setEarnings({
        todayEarnings: todayData.tutor_earnings_today || 0,
        weeklyEarnings: totalRevenue * 0.7, // 70% tutor share stimato
        monthlyEarnings: totalRevenue, // Assume current month
        totalEarnings: totalRevenue,
        weeklyGrowth: 0, // NESSUN GROWTH MOCK - solo 0%
        monthlyGrowth: 0, // NESSUN GROWTH MOCK - solo 0%
        avgPerLesson: totalLessons > 0 ? totalRevenue / totalLessons : 0,
        totalLessons: totalLessons
      });
    } catch (err) {
      console.error('Error loading earnings data:', err);
      setError('Impossibile caricare i dati guadagni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-foreground/10 rounded mb-4 w-2/3"></div>
          <div className="space-y-3">
            <div className="h-16 bg-foreground/10 rounded"></div>
            <div className="h-16 bg-foreground/10 rounded"></div>
            <div className="h-16 bg-foreground/10 rounded"></div>
            <div className="h-16 bg-foreground/10 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !earnings) {
    return (
      <Card className="p-6">
        <div className="text-center text-foreground-secondary">
          <p>Errore nel caricamento dei guadagni</p>
          <button 
            onClick={loadEarnings}
            className="mt-2 text-primary hover:text-primary/80"
          >
            Riprova
          </button>
        </div>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Breakdown Guadagni</h3>
        <div className="text-xs text-foreground-secondary bg-background-secondary px-2 py-1 rounded">
          Aggiornato ora
        </div>
      </div>

      <div className="space-y-4">
        {/* Today Earnings */}
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div>
              <div className="font-medium text-foreground">Oggi</div>
              <div className="text-sm text-foreground-secondary">Guadagni odierni</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              {formatCurrency(earnings.todayEarnings)}
            </div>
          </div>
        </div>

        {/* Weekly Earnings */}
        <div className="flex items-center justify-between p-4 bg-green-500/5 rounded-lg border border-green-500/10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <div className="font-medium text-foreground">Questa Settimana</div>
              <div className="text-sm text-foreground-secondary">Ultimi 7 giorni</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-500">
              {formatCurrency(earnings.weeklyEarnings)}
            </div>
            <div className={`text-xs ${earnings.weeklyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(earnings.weeklyGrowth)}
            </div>
          </div>
        </div>

        {/* Monthly Earnings */}
        <div className="flex items-center justify-between p-4 bg-blue-500/5 rounded-lg border border-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <div className="font-medium text-foreground">Questo Mese</div>
              <div className="text-sm text-foreground-secondary">Ultimi 30 giorni</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-500">
              {formatCurrency(earnings.monthlyEarnings)}
            </div>
            <div className={`text-xs ${earnings.monthlyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(earnings.monthlyGrowth)}
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="flex items-center justify-between p-4 bg-purple-500/5 rounded-lg border border-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div>
              <div className="font-medium text-foreground">Totale</div>
              <div className="text-sm text-foreground-secondary">Tutti i guadagni</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-purple-500">
              {formatCurrency(earnings.totalEarnings)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-background-secondary rounded-lg">
            <div className="text-lg font-bold text-orange-500">
              {formatCurrency(earnings.avgPerLesson)}
            </div>
            <div className="text-xs text-foreground-secondary">Media/Lezione</div>
          </div>
          <div className="text-center p-3 bg-background-secondary rounded-lg">
            <div className="text-lg font-bold text-emerald-500">
              {earnings.totalLessons}
            </div>
            <div className="text-xs text-foreground-secondary">Lezioni Totali</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex gap-2">
          <button className="flex-1 py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-md transition-colors">
            📊 Report
          </button>
          <button className="flex-1 py-2 px-3 bg-green-500/10 hover:bg-green-500/20 text-green-500 text-sm rounded-md transition-colors">
            💰 Bonifico
          </button>
        </div>
      </div>
    </Card>
  );
}
