'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  UserPlus, 
  Settings, 
  FileText, 
  AlertCircle, 
  Shield, 
  Bell,
  Users,
  Package,
  CreditCard,
  BarChart3,
  Zap,
  RefreshCw
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
  urgent?: boolean;
  onClick: () => void;
}

interface ActionButtonProps {
  readonly action: QuickAction;
}

function ActionButton({ action }: ActionButtonProps) {
  const { title, description, icon: Icon, badge, urgent, onClick } = action;
  
  return (
    <button
      onClick={onClick}
      className="w-full p-4 text-left border border-border rounded-lg hover:shadow-md transition-all duration-200 bg-card hover:bg-background-secondary"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            urgent ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            <Icon className={`w-5 h-5 ${urgent ? 'text-red-600' : 'text-blue-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground">
                {title}
              </h4>
              {badge && (
                <Badge className={urgent ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-sm mt-1 text-foreground-secondary">
              {description}
            </p>
          </div>
        </div>
        {urgent && (
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
        )}
      </div>
    </button>
  );
}

export function AdminQuickActionsWidget() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh action
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const quickActions: QuickAction[] = [
    {
      id: 'pending-approvals',
      title: 'Approvazioni Tutor',
      description: 'Revisiona e approva nuovi tutors',
      icon: UserPlus,
      color: 'bg-blue-500',
      badge: '3',
      urgent: true,
      onClick: () => router.push('/dashboard/admin/user-management?tab=approvals'),
    },
    {
      id: 'user-management',
      title: 'Gestisci Utenti',
      description: 'Visualizza e modifica profili utenti',
      icon: Users,
      color: 'bg-green-500',
      onClick: () => router.push('/dashboard/admin/user-management'),
    },
    {
      id: 'package-management',
      title: 'Gestisci Pacchetti',
      description: 'Crea e modifica pacchetti',
      icon: Package,
      color: 'bg-purple-500',
      onClick: () => router.push('/dashboard/admin/packages'),
    },
    {
      id: 'package-assignments',
      title: 'Assegnazioni',
      description: 'Assegna pacchetti a studenti',
      icon: FileText,
      color: 'bg-blue-500',
      onClick: () => router.push('/dashboard/admin/assignments'),
    },
    {
      id: 'payment-verification',
      title: 'Pagamenti',
      description: 'Gestisci pagamenti e fatturazione',
      icon: CreditCard,
      color: 'bg-orange-500',
      badge: '5',
      onClick: () => router.push('/dashboard/admin/payments'),
    },
    {
      id: 'lessons-management',
      title: 'Gestisci Lezioni',
      description: 'Monitora e gestisci le lezioni',
      icon: Bell,
      color: 'bg-green-500',
      onClick: () => router.push('/dashboard/admin/lessons'),
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Visualizza report e statistiche',
      icon: BarChart3,
      color: 'bg-indigo-500',
      onClick: () => router.push('/dashboard/admin/analytics'),
    },
    {
      id: 'system-settings',
      title: 'Impostazioni',
      description: 'Configura parametri piattaforma',
      icon: Settings,
      color: 'bg-gray-500',
      onClick: () => router.push('/dashboard/admin/settings'),
    },
    {
      id: 'audit-logs',
      title: 'Log Audit',
      description: 'Visualizza log di sistema',
      icon: Shield,
      color: 'bg-red-600',
      onClick: () => router.push('/dashboard/admin/audit-logs'),
    },
  ];

  // Separa azioni urgenti da quelle normali
  const urgentActions = quickActions.filter(action => action.urgent);
  const normalActions = quickActions.filter(action => !action.urgent);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
          <p className="text-sm text-foreground-secondary">
            Azioni rapide per la gestione della piattaforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-foreground-secondary hover:text-primary transition-colors disabled:opacity-50"
            title="Aggiorna azioni"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Urgent Actions Section */}
      {urgentActions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h4 className="text-sm font-medium text-red-900">Richiede Attenzione</h4>
            <Badge className="bg-red-100 text-red-800">{urgentActions.length}</Badge>
          </div>
          <div className="grid gap-3">
            {urgentActions.map((action) => (
              <ActionButton key={action.id} action={action} />
            ))}
          </div>
        </div>
      )}

      {/* Normal Actions Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-foreground-secondary" />
          <h4 className="text-sm font-medium text-foreground">Azioni Generali</h4>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {normalActions.map((action) => (
            <ActionButton key={action.id} action={action} />
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-red-600">{urgentActions.length}</p>
            <p className="text-xs text-foreground-secondary">Urgenti</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{normalActions.length}</p>
            <p className="text-xs text-foreground-secondary">Disponibili</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{quickActions.length}</p>
            <p className="text-xs text-foreground-secondary">Totali</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
