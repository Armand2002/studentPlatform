'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MoreHorizontal, UserPlus, Download, RefreshCw, Eye, Edit, Ban, CheckCircle, XCircle } from 'lucide-react';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { api, cacheUtils } from '@/lib/api';
import { Pagination } from '@/components/ui/Pagination';
import { UserListSkeleton } from '@/components/ui/Skeleton';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'tutor' | 'admin';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  profile?: {
    phone?: string;
    bio?: string;
    verified?: boolean;
  };
}

interface UserFilters {
  role: 'all' | 'student' | 'tutor' | 'admin';
  status: 'all' | 'active' | 'inactive' | 'pending' | 'suspended';
  search: string;
  dateFrom?: string;
  dateTo?: string;
}

const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    search: ''
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load users from API
      const response = await api.getCached('/api/users/', {
        cacheKey: 'admin-users-list',
        useCache: true
      });
      setUsers(response.data || []);
    } catch (err) {
      setError('Errore nel caricamento degli utenti');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesRole = filters.role === 'all' || user.role === filters.role;
      const matchesStatus = filters.status === 'all' || user.status === filters.status;
      const matchesSearch = !filters.search || 
        user.first_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.last_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesRole && matchesStatus && matchesSearch;
    });

    return filtered;
  }, [users, filters]);

  const paginatedUsers = useMemo(() => {
    const startIndex = page * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, page, pageSize]);

  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0); // Reset to first page when filtering
  };

  const handleUserAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case 'approve':
          await api.put(`/api/admin/users/${userId}/approve`);
          break;
        case 'suspend':
          await api.put(`/api/admin/users/${userId}/suspend`);
          break;
        case 'activate':
          await api.put(`/api/admin/users/${userId}/activate`);
          break;
        default:
          console.log(`Action ${action} not implemented yet`);
      }
      // Reload users after action
      await loadUsers();
    } catch (err) {
      console.error(`Error performing action ${action}:`, err);
      setError(`Errore durante l'operazione: ${action}`);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;
    
    try {
      // Execute bulk action
      await Promise.all(
        selectedUsers.map(userId => handleUserAction(action, userId))
      );
      setSelectedUsers([]);
    } catch (err) {
      setError('Errore nell\'esecuzione dell\'azione bulk');
    }
  };

  const exportUsers = () => {
    // Create CSV content
    const headers = ['ID', 'Nome', 'Cognome', 'Email', 'Ruolo', 'Status', 'Data Registrazione'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.id,
        user.first_name,
        user.last_name,
        user.email,
        user.role,
        user.status,
        new Date(user.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      suspended: 'bg-red-100 text-red-800 border-red-200'
    };
    return badges[status as keyof typeof badges] || badges.inactive;
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      student: 'bg-blue-100 text-blue-800 border-blue-200',
      tutor: 'bg-purple-100 text-purple-800 border-purple-200',
      admin: 'bg-red-100 text-red-800 border-red-200'
    };
    return badges[role as keyof typeof badges] || badges.student;
  };

  if (!user || user.role !== 'admin') {
    return (
      <RequireAuth>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Accesso Negato</h1>
            <p className="text-foreground-secondary mt-2">
              Questa sezione è accessibile solo agli amministratori.
            </p>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestione Utenti</h1>
          <p className="text-foreground-secondary">
            Gestisci tutti gli utenti della piattaforma
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportUsers}
            className="flex items-center gap-2 px-4 py-2 bg-background-secondary text-foreground border border-border rounded-lg hover:bg-background-tertiary transition-colors"
          >
            <Download size={16} />
            Esporta
          </button>
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 px-4 py-2 bg-background-secondary text-foreground border border-border rounded-lg hover:bg-background-tertiary transition-colors"
          >
            <RefreshCw size={16} />
            Aggiorna
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <UserPlus size={16} />
            Nuovo Utente
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-background-secondary rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-foreground-secondary" />
          <input
            type="text"
            placeholder="Cerca utenti..."
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <select
          value={filters.role}
          onChange={(e) => handleFilterChange({ role: e.target.value as any })}
          className="px-3 py-2 bg-background border border-border rounded-lg text-foreground"
        >
          <option value="all">Tutti i ruoli</option>
          <option value="student">Studenti</option>
          <option value="tutor">Tutor</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange({ status: e.target.value as any })}
          className="px-3 py-2 bg-background border border-border rounded-lg text-foreground"
        >
          <option value="all">Tutti gli stati</option>
          <option value="active">Attivi</option>
          <option value="pending">In attesa</option>
          <option value="inactive">Inattivi</option>
          <option value="suspended">Sospesi</option>
        </select>

        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-foreground-secondary">
              {selectedUsers.length} selezionati
            </span>
            <button
              onClick={() => handleBulkAction('approve')}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Approva
            </button>
            <button
              onClick={() => handleBulkAction('suspend')}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Sospendi
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Users table */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        {loading ? (
          <UserListSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-secondary border-b border-border">
                <tr>
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(paginatedUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="text-left p-4 text-foreground font-medium">Utente</th>
                  <th className="text-left p-4 text-foreground font-medium">Ruolo</th>
                  <th className="text-left p-4 text-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-foreground font-medium">Registrazione</th>
                  <th className="text-left p-4 text-foreground font-medium">Ultimo accesso</th>
                  <th className="text-left p-4 text-foreground font-medium">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-background-secondary">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(prev => [...prev, user.id]);
                          } else {
                            setSelectedUsers(prev => prev.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {user.first_name[0]}{user.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-foreground-secondary">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                        {user.role === 'student' ? 'Studente' : 
                         user.role === 'tutor' ? 'Tutor' : 'Admin'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(user.status)}`}>
                        {user.status === 'active' ? 'Attivo' :
                         user.status === 'pending' ? 'In Attesa' :
                         user.status === 'suspended' ? 'Sospeso' : 'Inattivo'}
                      </span>
                    </td>
                    <td className="p-4 text-foreground-secondary text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-foreground-secondary text-sm">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Mai'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUserAction('view', user.id)}
                          className="p-1 hover:bg-background-tertiary rounded"
                          title="Visualizza"
                        >
                          <Eye size={16} className="text-foreground-secondary" />
                        </button>
                        <button
                          onClick={() => handleUserAction('edit', user.id)}
                          className="p-1 hover:bg-background-tertiary rounded"
                          title="Modifica"
                        >
                          <Edit size={16} className="text-foreground-secondary" />
                        </button>
                        {user.status === 'pending' && (
                          <button
                            onClick={() => handleUserAction('approve', user.id)}
                            className="p-1 hover:bg-green-100 rounded"
                            title="Approva"
                          >
                            <CheckCircle size={16} className="text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleUserAction('suspend', user.id)}
                          className="p-1 hover:bg-red-100 rounded"
                          title="Sospendi"
                        >
                          <Ban size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredUsers.length > pageSize && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filteredUsers.length / pageSize)}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default UsersPage;
