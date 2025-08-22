"use client"

import React, { useState } from 'react';
import { 
  BarChart3, Users, BookOpen, CreditCard, Calendar, 
  TrendingUp, Clock, CheckCircle, 
  GraduationCap
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import DashboardOverview from './modules/DashboardOverview';
import TutorManagement from './modules/TutorManagement';
import StudentManagement from './modules/StudentManagement';
import ComingSoon from './modules/ComingSoon';

const CompleteAdminDashboard = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // === MOCK DATA - Replica del file Excel ===
  const mockData = {
    dashboard: {
      kpis: {
        totalStudents: 150,
        totalTutors: 25,
        todayLessons: 8,
        monthRevenue: 15420,
        pendingPayments: 3,
        completedLessonsToday: 5,
        packagesSold: 42,
        averageRating: 4.8
      },
      trends: {
        labels: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
        completed: [12, 15, 8, 18, 22, 16, 10],
        upcoming: [8, 12, 15, 10, 14, 20, 8]
      }
    },
    tutors: [
      { id: 1, firstName: 'Marco', lastName: 'Rossi', email: 'marco.rossi@email.com', subjects: 'Matematica, Fisica', hourlyRate: 25, totalLessons: 156, rating: 4.9, isAvailable: true, totalEarnings: 3900 },
      { id: 2, firstName: 'Laura', lastName: 'Bianchi', email: 'laura.bianchi@email.com', subjects: 'Italiano, Storia', hourlyRate: 22, totalLessons: 134, rating: 4.7, isAvailable: true, totalEarnings: 2948 },
      { id: 3, firstName: 'Mattia', lastName: 'di Brisco', email: 'mattia.dibrisco@email.com', subjects: 'Inglese, Francese', hourlyRate: 28, totalLessons: 89, rating: 4.8, isAvailable: false, totalEarnings: 2492, customRate: 0 }
    ],
    students: [
      { id: 1, firstName: 'Sofia', lastName: 'Verdi', email: 'sofia.verdi@email.com', institute: 'Liceo Scientifico Galilei', classLevel: '4A', phone: '+39 334 1234567', totalLessons: 24, activePackages: 2 },
      { id: 2, firstName: 'Luca', lastName: 'Neri', email: 'luca.neri@email.com', institute: 'ITIS Marconi', classLevel: '5B', phone: '+39 335 7654321', totalLessons: 18, activePackages: 1 },
      { id: 3, firstName: 'Nicola', lastName: 'Montesano', email: 'nicola.montesano@email.com', institute: 'Liceo Classico Manzoni', classLevel: '3C', phone: '+39 336 9876543', totalLessons: 32, activePackages: 3 }
    ],
    packages: [
      { id: 1, name: 'Matematica Base', tutorId: 1, tutorName: 'Marco Rossi', totalHours: 10, price: 250, subject: 'Matematica', isActive: true, sold: 15, rating: 4.8 },
      { id: 2, name: 'Ripasso Maturità', tutorId: 2, tutorName: 'Laura Bianchi', totalHours: 20, price: 440, subject: 'Italiano', isActive: true, sold: 8, rating: 4.9 },
      { id: 3, name: 'Inglese Conversazione', tutorId: 3, tutorName: 'Mattia di Brisco', totalHours: 8, price: 224, subject: 'Inglese', isActive: true, sold: 12, rating: 4.7 }
    ],
    packagePurchases: [
      { id: 1, studentId: 1, packageId: 1, purchaseDate: '2024-01-15', expiryDate: '2024-02-15', hoursUsed: 6, hoursRemaining: 4, isActive: true },
      { id: 2, studentId: 2, packageId: 2, purchaseDate: '2024-01-10', expiryDate: '2024-02-10', hoursUsed: 15, hoursRemaining: 5, isActive: true },
      { id: 3, studentId: 3, packageId: 3, purchaseDate: '2024-01-20', expiryDate: '2024-02-20', hoursUsed: 3, hoursRemaining: 5, isActive: true }
    ],
    lessons: [
      { id: 1, studentId: 1, tutorId: 1, packagePurchaseId: 1, startTime: '2024-01-22T10:00', endTime: '2024-01-22T12:00', duration: 2, subject: 'Matematica', status: 'completed', price: 50 },
      { id: 2, studentId: 2, tutorId: 2, packagePurchaseId: 2, startTime: '2024-01-22T14:00', endTime: '2024-01-22T16:00', duration: 2, subject: 'Italiano', status: 'confirmed', price: 44 },
      { id: 3, studentId: 3, tutorId: 3, packagePurchaseId: 3, startTime: '2024-01-22T16:00', endTime: '2024-01-22T18:00', duration: 2, subject: 'Inglese', status: 'pending', price: 56 }
    ],
    payments: [
      { id: 1, studentId: 1, amount: 250, status: 'completed', description: 'Pacchetto Matematica Base', date: '2024-01-15', method: 'bank_transfer' },
      { id: 2, studentId: 2, amount: 440, status: 'pending', description: 'Pacchetto Ripasso Maturità', date: '2024-01-20', method: 'cash' },
      { id: 3, studentId: 3, amount: 224, status: 'completed', description: 'Pacchetto Inglese Conversazione', date: '2024-01-18', method: 'card' }
    ],
    tariffe: {
      doposcuola: {
        dueTimes: { totMese: 320, totSettimana: 80, tutor: 60, mio: 20 },
        incentivi: { target: 10, current: 7, bonus: 50 }
      },
      packages: {
        commission: 0.15, // 15% per GENZ TUTORS
        tutorShare: 0.85  // 85% per il tutor
      }
    }
  };

  // === UTILITY FUNCTIONS ===
  const formatCurrency = (amount: number | undefined) => `€${amount?.toFixed(2) || '0.00'}`;

  // === COMPONENTI MODULARI ===

  // Navigation
  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'tutors', name: 'Tutor', icon: Users },
    { id: 'students', name: 'Studenti', icon: GraduationCap },
    { id: 'packages', name: 'Pacchetti', icon: BookOpen },
    { id: 'lessons', name: 'Database Lezioni', icon: Calendar },
    { id: 'payments', name: 'Pagamenti', icon: CreditCard },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'scheduling', name: 'Calendario', icon: Clock }
  ];

  const renderActiveComponent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardOverview data={mockData} formatCurrency={formatCurrency} />;
      case 'tutors':
        return (
          <TutorManagement 
            tutors={mockData.tutors}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            formatCurrency={formatCurrency}
          />
        );
      case 'students':
        return <StudentManagement students={mockData.students} />;
      case 'packages':
        return <ComingSoon title="Gestione Pacchetti" description="Modulo per la gestione completa dei pacchetti di lezioni." />;
      case 'lessons':
        return <ComingSoon title="Database Lezioni" description="Sistema completo per la gestione e monitoraggio delle lezioni." />;
      case 'payments':
        return <ComingSoon title="Sistema Pagamenti" description="Gestione pagamenti, tariffe e fatturazione automatica." />;
      case 'analytics':
        return <ComingSoon title="Analytics e Report" description="Analisi avanzate e reportistica business intelligence." />;
      case 'scheduling':
        return <ComingSoon title="Pianificazione Calendario" description="Sistema avanzato di scheduling e gestione calendario." />;
      default:
        return <DashboardOverview data={mockData} formatCurrency={formatCurrency} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r">
          <div className="p-4">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
              <p className="text-sm text-gray-600">Gestione piattaforma</p>
            </div>
            <div className="space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeModule === item.id
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 pt-8">
          {renderActiveComponent()}
        </main>
      </div>


    </div>
  );
};

export default CompleteAdminDashboard;
