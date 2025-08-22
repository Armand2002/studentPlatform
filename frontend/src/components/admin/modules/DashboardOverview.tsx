import React from 'react';
import { Users, GraduationCap, Calendar, Euro, Plus, BookOpen, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface DashboardData {
  dashboard: {
    kpis: {
      totalStudents: number;
      totalTutors: number;
      todayLessons: number;
      monthRevenue: number;
      completedLessonsToday: number;
    };
    trends: {
      labels: string[];
      completed: number[];
      upcoming: number[];
    };
  };
}

interface DashboardOverviewProps {
  data: DashboardData;
  formatCurrency: (amount: number | undefined) => string;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ data, formatCurrency }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Studenti Totali</p>
            <p className="text-2xl font-bold text-gray-900">{data.dashboard.kpis.totalStudents}</p>
          </div>
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        <p className="text-xs text-gray-500 mt-2">+12% vs mese scorso</p>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tutor Attivi</p>
            <p className="text-2xl font-bold text-gray-900">{data.dashboard.kpis.totalTutors}</p>
          </div>
          <GraduationCap className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-xs text-gray-500 mt-2">+3 nuovi questo mese</p>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Lezioni Oggi</p>
            <p className="text-2xl font-bold text-gray-900">{data.dashboard.kpis.todayLessons}</p>
          </div>
          <Calendar className="w-8 h-8 text-purple-600" />
        </div>
        <p className="text-xs text-gray-500 mt-2">{data.dashboard.kpis.completedLessonsToday} completate</p>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Ricavi Mensili</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.dashboard.kpis.monthRevenue)}</p>
          </div>
          <Euro className="w-8 h-8 text-emerald-600" />
        </div>
        <p className="text-xs text-gray-500 mt-2">+8% vs target</p>
      </Card>
    </div>

    {/* Grafici Trend */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lezioni Settimanali</h3>
        <div className="space-y-4">
          {data.dashboard.trends.labels.map((day, idx) => (
            <div key={day} className="flex items-center space-x-4">
              <span className="w-8 text-sm text-gray-600">{day}</span>
              <div className="flex-1 flex space-x-2">
                <div className="bg-blue-200 h-6 rounded" style={{width: `${data.dashboard.trends.completed[idx] * 4}px`}}></div>
                <div className="bg-yellow-200 h-6 rounded" style={{width: `${data.dashboard.trends.upcoming[idx] * 4}px`}}></div>
              </div>
              <span className="text-sm text-gray-500">{data.dashboard.trends.completed[idx] + data.dashboard.trends.upcoming[idx]}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <Plus className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Nuovo Studente</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
            <BookOpen className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Nuovo Pacchetto</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
            <Calendar className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Prenota Lezione</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors">
            <CreditCard className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Conferma Pagamento</span>
          </button>
        </div>
      </Card>
    </div>
  </div>
);

export default DashboardOverview;
