'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Server, 
  Database, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  HardDrive,
  Cpu,
  Zap
} from 'lucide-react';
import { api } from '@/lib/api';

interface SystemStatus {
  status: 'online' | 'warning' | 'error';
  uptime: string;
  responseTime: number;
  lastCheck: string;
  details?: string;
}

interface SystemMetrics {
  apiServer: SystemStatus;
  database: SystemStatus;
  authService: SystemStatus;
  storage: SystemStatus;
  performance: {
    avgResponseTime: number;
    requestsPerMinute: number;
    errorRate: number;
    activeConnections: number;
  };
  resources: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

interface StatusItemProps {
  readonly label: string;
  readonly status: SystemStatus;
  readonly icon: React.ElementType;
}

function StatusItem({ label, status, icon: Icon }: StatusItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <div className="flex items-center gap-2 mt-1">
            {getStatusIcon(status.status)}
            <span className="text-xs text-foreground-secondary">
              {status.responseTime}ms - {status.uptime}
            </span>
          </div>
        </div>
      </div>
      <Badge className={getStatusColor(status.status)}>
        {status.status}
      </Badge>
    </div>
  );
}

interface MetricBarProps {
  readonly label: string;
  readonly value: number;
  readonly max: number;
  readonly unit: string;
  readonly color: string;
}

function MetricBar({ label, value, max, unit, color }: MetricBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-foreground-secondary">{label}</span>
        <span className="text-sm font-medium text-foreground">
          {value}{unit} / {max}{unit}
        </span>
      </div>
      <div className="w-full bg-background-secondary rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function SystemOverviewWidget() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    apiServer: {
      status: 'online',
      uptime: '99.9%',
      responseTime: 0,
      lastCheck: new Date().toISOString(),
    },
    database: {
      status: 'online',
      uptime: '99.8%',
      responseTime: 0,
      lastCheck: new Date().toISOString(),
    },
    authService: {
      status: 'online',
      uptime: '100%',
      responseTime: 0,
      lastCheck: new Date().toISOString(),
    },
    storage: {
      status: 'online',
      uptime: '99.9%',
      responseTime: 0,
      lastCheck: new Date().toISOString(),
    },
    performance: {
      avgResponseTime: 0,
      requestsPerMinute: 0,
      errorRate: 0,
      activeConnections: 0,
    },
    resources: {
      cpu: 0,
      memory: 0,
      storage: 0,
    },
  });

  const fetchSystemMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test API server status
      const startTime = Date.now();
      await api.get('/api/analytics/metrics');
      const responseTime = Date.now() - startTime;

      // Mock system metrics (in production, questi verrebbero da API di monitoring)
      setSystemMetrics({
        apiServer: {
          status: 'online',
          uptime: '99.9%',
          responseTime,
          lastCheck: new Date().toISOString(),
        },
        database: {
          status: 'online',
          uptime: '99.8%',
          responseTime: responseTime + 50,
          lastCheck: new Date().toISOString(),
        },
        authService: {
          status: 'online',
          uptime: '100%',
          responseTime: responseTime - 20,
          lastCheck: new Date().toISOString(),
        },
        storage: {
          status: 'online',
          uptime: '99.9%',
          responseTime: responseTime + 30,
          lastCheck: new Date().toISOString(),
        },
        performance: {
          avgResponseTime: responseTime,
          requestsPerMinute: 145,
          errorRate: 0.1,
          activeConnections: 23,
        },
        resources: {
          cpu: 35,
          memory: 62,
          storage: 45,
        },
      });
    } catch (err) {
      console.error('Error fetching system metrics:', err);
      setError('Impossibile caricare lo stato del sistema');
      
      // Fallback con dati mock
      setSystemMetrics({
        apiServer: {
          status: 'error',
          uptime: '0%',
          responseTime: 0,
          lastCheck: new Date().toISOString(),
          details: 'API server non raggiungibile',
        },
        database: {
          status: 'warning',
          uptime: '95%',
          responseTime: 1200,
          lastCheck: new Date().toISOString(),
          details: 'Prestazioni degradate',
        },
        authService: {
          status: 'online',
          uptime: '100%',
          responseTime: 180,
          lastCheck: new Date().toISOString(),
        },
        storage: {
          status: 'online',
          uptime: '99.9%',
          responseTime: 120,
          lastCheck: new Date().toISOString(),
        },
        performance: {
          avgResponseTime: 450,
          requestsPerMinute: 89,
          errorRate: 2.3,
          activeConnections: 15,
        },
        resources: {
          cpu: 75,
          memory: 88,
          storage: 92,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemMetrics();
    
    // Auto-refresh ogni 30 secondi
    const interval = setInterval(fetchSystemMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-background-secondary rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`system-loading-${i}`} className="h-12 bg-background-secondary rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const systemServices = [
    {
      label: 'API Server',
      status: systemMetrics.apiServer,
      icon: Server,
    },
    {
      label: 'Database',
      status: systemMetrics.database,
      icon: Database,
    },
    {
      label: 'Auth Service',
      status: systemMetrics.authService,
      icon: Wifi,
    },
    {
      label: 'Storage',
      status: systemMetrics.storage,
      icon: HardDrive,
    },
  ];

  const resourceMetrics = [
    {
      label: 'CPU',
      value: systemMetrics.resources.cpu,
      max: 100,
      unit: '%',
      color: systemMetrics.resources.cpu > 80 ? 'bg-red-500' : 
             systemMetrics.resources.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500',
    },
    {
      label: 'Memory',
      value: systemMetrics.resources.memory,
      max: 100,
      unit: '%',
      color: systemMetrics.resources.memory > 80 ? 'bg-red-500' : 
             systemMetrics.resources.memory > 60 ? 'bg-yellow-500' : 'bg-green-500',
    },
    {
      label: 'Storage',
      value: systemMetrics.resources.storage,
      max: 100,
      unit: '%',
      color: systemMetrics.resources.storage > 80 ? 'bg-red-500' : 
             systemMetrics.resources.storage > 60 ? 'bg-yellow-500' : 'bg-green-500',
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">System Overview</h3>
          <p className="text-sm text-foreground-secondary">
            Stato dei servizi e risorse di sistema
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Sistema non disponibile</span>
          </div>
          <p className="text-xs text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* System Services Status */}
      <div className="space-y-3 mb-6">
        {systemServices.map((service, index) => (
          <StatusItem key={`service-${index}`} {...service} />
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="border-t border-border pt-6 mb-6">
        <h4 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Performance
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-foreground-secondary">Resp. Time</span>
            <p className="font-medium text-foreground">{systemMetrics.performance.avgResponseTime}ms</p>
          </div>
          <div>
            <span className="text-foreground-secondary">Req/min</span>
            <p className="font-medium text-foreground">{systemMetrics.performance.requestsPerMinute}</p>
          </div>
          <div>
            <span className="text-foreground-secondary">Error Rate</span>
            <p className="font-medium text-foreground">{systemMetrics.performance.errorRate}%</p>
          </div>
          <div>
            <span className="text-foreground-secondary">Connections</span>
            <p className="font-medium text-foreground">{systemMetrics.performance.activeConnections}</p>
          </div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          Resource Usage
        </h4>
        <div className="space-y-4">
          {resourceMetrics.map((metric, index) => (
            <MetricBar key={`resource-${index}`} {...metric} />
          ))}
        </div>
      </div>

      {/* Last Update */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-foreground-secondary flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Ultimo aggiornamento: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </Card>
  );
}
