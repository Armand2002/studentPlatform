'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  UserPlus, 
  Settings, 
  FileText, 
  AlertCircle, 
  Shield, 
  Download,
  Mail,
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
  const { title, description, icon: Icon, color, badge, urgent, onClick } = action;
  
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left border rounded-lg hover:shadow-md transition-all duration-200 ${
        urgent ? 'border-red-200 bg-red-50 hover:bg-red-100' : 'border-border bg-white hover:bg-background-secondary/50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`font-medium ${urgent ? 'text-red-900' : 'text-foreground'}`}>
                {title}
              </h4>
              {badge && (
                <Badge className={urgent ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                  {badge}
                </Badge>
              )}
            </div>
            <p className={`text-sm mt-1 ${urgent ? 'text-red-600' : 'text-foreground-secondary'}`}>
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
      onClick: () => console.log('Navigate to approvals'),
    },
    {
      id: 'system-alerts',
      title: 'Alert di Sistema',
      description: 'Problemi che richiedono attenzione',
      icon: AlertCircle,
      color: 'bg-red-500',
      badge: '2',
      urgent: true,
      onClick: () => console.log('View system alerts'),
    },
    {
      id: 'user-management',
      title: 'Gestisci Utenti',
      description: 'Visualizza e modifica profili utenti',
      icon: Users,
      color: 'bg-green-500',
      onClick: () => console.log('Navigate to user management'),
    },
    {
      id: 'package-assignments',
      title: 'Assegna Pacchetti',
      description: 'Assegna pacchetti a studenti',
      icon: Package,
      color: 'bg-purple-500',
      onClick: () => console.log('Navigate to package assignments'),
    },
    {
      id: 'payment-verification',
      title: 'Verifica Pagamenti',
      description: 'Controlla pagamenti offline',
      icon: CreditCard,
      color: 'bg-orange-500',
      badge: '5',
      onClick: () => console.log('Navigate to payment verification'),
    },
    {
      id: 'generate-reports',
      title: 'Genera Report',
      description: 'Export dati e statistiche',
      icon: BarChart3,
      color: 'bg-indigo-500',
      onClick: () => console.log('Generate reports'),
    },
    {
      id: 'send-notifications',
      title: 'Invia Notifiche',
      description: 'Comunica con utenti della piattaforma',
      icon: Mail,
      color: 'bg-teal-500',
      onClick: () => console.log('Send notifications'),
    },
    {
      id: 'system-settings',
      title: 'Impostazioni Sistema',
      description: 'Configura parametri piattaforma',
      icon: Settings,
      color: 'bg-gray-500',
      onClick: () => console.log('Navigate to system settings'),
    },
    {
      id: 'backup-data',
      title: 'Backup Database',
      description: 'Esegui backup dei dati',
      icon: Download,
      color: 'bg-cyan-500',
      onClick: () => console.log('Start database backup'),
    },
    {
      id: 'security-audit',
      title: 'Audit Sicurezza',
      description: 'Verifica log e accessi',
      icon: Shield,
      color: 'bg-red-600',
      onClick: () => console.log('Navigate to security audit'),
    },
    {
      id: 'performance-monitor',
      title: 'Monitor Performance',
      description: 'Controlla prestazioni sistema',
      icon: Zap,
      color: 'bg-yellow-500',
      onClick: () => console.log('View performance dashboard'),
    },
    {
      id: 'activity-logs',
      title: 'Log Attività',
      description: 'Visualizza cronologia azioni',
      icon: FileText,
      color: 'bg-slate-500',
      onClick: () => console.log('View activity logs'),
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
            <p className="text-2xl font-bold text-primary">{urgentActions.length}</p>
            <p className="text-xs text-foreground-secondary">Urgenti</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary">{normalActions.length}</p>
            <p className="text-xs text-foreground-secondary">Disponibili</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">{quickActions.length}</p>
            <p className="text-xs text-foreground-secondary">Totali</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
