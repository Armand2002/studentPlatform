'use client';

import { useState, useEffect } from 'react';
import { 
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address: string;
  user_agent: string;
  status: 'success' | 'failure' | 'warning';
  details: Record<string, any>;
  session_id: string;
}

const ACTION_TYPES = [
  'user.login',
  'user.logout',
  'user.register',
  'user.update',
  'user.delete',
  'booking.create',
  'booking.update',
  'booking.cancel',
  'payment.create',
  'payment.confirm',
  'admin.approve_user',
  'admin.reject_user',
  'admin.assign_package',
  'settings.update',
  'export.generate'
];

const RESOURCE_TYPES = [
  'user',
  'student',
  'tutor',
  'booking',
  'payment',
  'package',
  'assignment',
  'settings'
];



export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedResource, setSelectedResource] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be an API call
      // const token = localStorage.getItem('token');
      // const response = await fetch('/api/admin/audit-logs', { headers: { 'Authorization': `Bearer ${token}` } });
      
      // For now, return empty array until API is implemented
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLogs([]);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failure':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failure':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'warning':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('it-IT');
  };

  const formatUserAgent = (userAgent: string) => {
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('Macintosh')) return 'MacOS';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('curl')) return 'API/Bot';
    return 'Unknown';
  };

  const exportLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        search: searchTerm,
        action: selectedAction,
        resource: selectedResource,
        status: selectedStatus,
        user: selectedUser,
        date_from: dateFrom,
        date_to: dateTo
      });
      
      const response = await fetch(`/api/admin/audit-logs/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (searchTerm && !log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !log.action.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.ip_address.includes(searchTerm)) {
      return false;
    }
    if (selectedAction && log.action !== selectedAction) return false;
    if (selectedResource && log.resource_type !== selectedResource) return false;
    if (selectedStatus && log.status !== selectedStatus) return false;
    if (selectedUser && log.user_role !== selectedUser) return false;
    if (dateFrom && new Date(log.timestamp) < new Date(dateFrom)) return false;
    if (dateTo && new Date(log.timestamp) > new Date(dateTo)) return false;
    return true;
  });

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-foreground-secondary">Caricamento audit logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-foreground-secondary">Tracciamento completo delle attività sulla piattaforma</p>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <DocumentArrowDownIcon className="h-4 w-4" />
          Esporta CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-background-secondary p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-4 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-foreground">Filtri</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tutte le azioni</option>
            {ACTION_TYPES.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          {/* Resource Filter */}
          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tutte le risorse</option>
            {RESOURCE_TYPES.map(resource => (
              <option key={resource} value={resource}>{resource}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tutti gli stati</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="warning">Warning</option>
          </select>

          {/* User Role Filter */}
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tutti i ruoli</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>

          {/* Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-foreground-secondary">
        <span>Mostrando {paginatedLogs.length} di {filteredLogs.length} risultati</span>
        <span>Pagina {currentPage} di {totalPages}</span>
      </div>

      {/* Logs Table */}
      <div className="bg-background-secondary rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azione
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risorsa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP / Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-foreground">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {log.user_email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.user_role}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-foreground font-mono">
                      {log.action}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-foreground">
                      {log.resource_type}
                      {log.resource_id && (
                        <span className="text-gray-500 ml-1">#{log.resource_id}</span>
                      )}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <span className={getStatusBadge(log.status)}>
                        {log.status}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ComputerDesktopIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-foreground">
                          {log.ip_address}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatUserAgent(log.user_agent)}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <EyeIcon className="h-4 w-4" />
                      Dettagli
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-foreground-secondary bg-background-secondary border border-border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Precedente
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-foreground-secondary bg-background-secondary border border-border hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-foreground-secondary bg-background-secondary border border-border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Successivo
          </button>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background-secondary rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Dettagli Audit Log</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-foreground-secondary"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary">Timestamp</label>
                  <p className="text-sm text-foreground">{formatTimestamp(selectedLog.timestamp)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary">Utente</label>
                  <p className="text-sm text-foreground">
                    {selectedLog.user_email} ({selectedLog.user_role})
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary">Azione</label>
                  <p className="text-sm text-foreground font-mono">{selectedLog.action}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary">Risorsa</label>
                  <p className="text-sm text-foreground">
                    {selectedLog.resource_type}
                    {selectedLog.resource_id && ` #${selectedLog.resource_id}`}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary">IP Address</label>
                  <p className="text-sm text-foreground">{selectedLog.ip_address}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary">User Agent</label>
                  <p className="text-sm text-foreground break-all">{selectedLog.user_agent}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary">Session ID</label>
                  <p className="text-sm text-foreground font-mono">{selectedLog.session_id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary">Dettagli</label>
                  <pre className="text-sm text-foreground bg-gray-50 p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
