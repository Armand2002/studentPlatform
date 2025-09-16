'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useNotifications } from '@/components/notifications/NotificationSystem';
import { UserRole } from '@/lib/permissions';
import { RoleIcon, RoleBadge } from '@/components/ui/PermissionComponents';
import { api } from '@/lib/api';
import SearchBar from '@/components/ui/SearchBar'

interface User {
  id: number;
  email: string;
  role: 'student' | 'tutor' | 'admin';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  avatar_url?: string;
}

interface Student {
  id: number;
  user_id: number;
  school_name?: string;
  grade_level?: string;
  subjects_of_interest?: string[];
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  emergency_contact?: string;
  medical_notes?: string;
  user?: User;
}

interface Tutor {
  id: number;
  user_id: number;
  bio?: string;
  specializations?: string[];
  experience_years?: number;
  education?: string;
  certifications?: string[];
  hourly_rate?: number;
  availability_schedule?: Record<string, any>;
  location?: string;
  languages?: string[];
  rating?: number;
  total_reviews?: number;
  is_verified?: boolean;
  user?: User;
}

interface BulkAction {
  type: 'approve' | 'reject' | 'activate' | 'deactivate' | 'delete' | 'export';
  userIds: number[];
  reason?: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'students' | 'tutors' | 'approvals'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const { addNotification } = useNotifications();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all users usando la libreria api
      const usersRes = await api.get('/api/admin/users');
      setUsers(usersRes.data);

      // Fetch students
      const studentsRes = await api.get('/api/users/students');
      setStudents(studentsRes.data);

      // Fetch tutors
      const tutorsRes = await api.get('/api/users/tutors');
      setTutors(tutorsRes.data);

      // Fetch pending approvals
      try {
        const approvalsRes = await api.get('/api/admin/pending-approvals');
        setPendingApprovals(approvalsRes.data);
      } catch (error) {
        // Endpoint potrebbe non esistere, ignoriamo per ora
        console.log('Pending approvals endpoint not available');
        setPendingApprovals([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      addNotification({
        type: 'error',
        title: 'Errore Caricamento',
        message: 'Impossibile caricare i dati degli utenti'
      });
    } finally {
      setLoading(false);
    }
  };

  // helper to update local state optimistically after approve/reject/delete
  const markUserApprovedLocally = (userId: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: true } : u));
    setPendingApprovals(prev => prev.filter(p => p.id !== userId));
    setStudents(prev => prev.map(s => s.user && s.user.id === userId ? { ...s, user: { ...s.user, is_verified: true } } : s));
    setTutors(prev => prev.map(t => t.user && t.user.id === userId ? { ...t, user: { ...t.user, is_verified: true } } : t));
  }

  const markUserRejectedLocally = (userId: number) => {
    setPendingApprovals(prev => prev.filter(p => p.id !== userId));
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: false } : u));
    setStudents(prev => prev.map(s => s.user && s.user.id === userId ? { ...s, user: { ...s.user, is_verified: false } } : s));
    setTutors(prev => prev.map(t => t.user && t.user.id === userId ? { ...t, user: { ...t.user, is_verified: false } } : t));
  }

  const handleApproveUser = async (userId: number, reason?: string) => {
    try {
      // optimistic update
      markUserApprovedLocally(userId);
      await api.put(`/api/admin/users/${userId}/approve`);
      addNotification({ type: 'success', title: 'Utente Approvato', message: "L'utente è stato approvato con successo" });
      // reconciliation
      await fetchData();
    } catch (error) {
      console.error('Error approving user:', error);
      addNotification({
        type: 'error',
        title: 'Errore Approvazione',
        message: "Impossibile approvare l'utente"
      });
    }
  };

  const handleRejectUser = async (userId: number, reason: string = 'Non specificato') => {
    try {
      // optimistic update
      markUserRejectedLocally(userId);
      await api.put(`/api/admin/users/${userId}/reject?reason=${encodeURIComponent(reason)}`);
      addNotification({ type: 'warning', title: 'Utente Rifiutato', message: `L'utente è stato rifiutato: ${reason}` });
      await fetchData();
    } catch (error) {
      console.error('Error rejecting user:', error);
      addNotification({
        type: 'error',
        title: 'Errore Rifiuto',
        message: "Impossibile rifiutare l'utente"
      });
    }
  };

  const handleDeleteUser = async (userId: number, userType: 'student' | 'tutor') => {
    try {
      const endpoint = userType === 'student'
        ? `/api/users/students/${userId}`
        : `/api/users/tutors/${userId}`;
      // optimistic removal
      setStudents(prev => prev.filter(s => s.id !== userId));
      setTutors(prev => prev.filter(t => t.id !== userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
      await api.delete(endpoint);
      addNotification({
        type: 'success',
        title: 'Utente Eliminato',
        message: `${userType === 'student' ? 'Studente' : 'Tutor'} eliminato con successo`
      });
      fetchData();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      addNotification({
        type: 'error',
        title: 'Errore Eliminazione',
        message: "Impossibile eliminare l'utente"
      });
    }
  };

  const handleBulkAction = async (action: BulkAction) => {
    if (selectedUsers.length === 0) return;

    try {

      switch (action.type) {
        case 'approve':
          for (const userId of selectedUsers) {
            markUserApprovedLocally(userId);
            await api.put(`/api/admin/users/${userId}/approve`);
          }
          addNotification({
            type: 'success',
            title: 'Approvazione Multipla',
            message: `${selectedUsers.length} utenti approvati`
          });
          break;

        case 'reject':
          for (const userId of selectedUsers) {
            markUserRejectedLocally(userId);
            await api.put(`/api/admin/users/${userId}/reject?reason=${encodeURIComponent(action.reason || 'Azione multipla')}`);
          }
          addNotification({
            type: 'warning',
            title: 'Rifiuto Multiplo',
            message: `${selectedUsers.length} utenti rifiutati`
          });
          break;

        case 'export':
          exportUsers(selectedUsers);
          addNotification({
            type: 'info',
            title: 'Export Completato',
            message: `${selectedUsers.length} utenti esportati`
          });
          break;
      }

      setSelectedUsers([]);
      setShowBulkActions(false);
      fetchData();
    } catch (error) {
      console.error('Bulk action error:', error);
      addNotification({
        type: 'error',
        title: 'Errore Azione Multipla',
        message: 'Impossibile completare l\'azione'
      });
    }
  };

  const exportUsers = (userIds?: number[]) => {
    const usersToExport = userIds 
      ? users.filter(user => userIds.includes(user.id))
      : users;

    const csvContent = [
      'ID,Email,Ruolo,Verificato,Attivo,Data Registrazione,Nome,Cognome',
      ...usersToExport.map(user => 
        `${user.id},${user.email},${user.role},${user.is_verified},${user.is_active},${user.created_at},${user.first_name || ''},${user.last_name || ''}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Choose the underlying list to filter depending on the active tab.
  // When viewing students/tutors we want to filter the corresponding arrays
  // (they include nested `user` objects), otherwise use the main `users` list
  const baseList: User[] =
    activeTab === 'students'
      ? students.map(s => s.user).filter(Boolean) as User[]
      : activeTab === 'tutors'
      ? tutors.map(t => t.user).filter(Boolean) as User[]
      : activeTab === 'approvals'
      ? pendingApprovals
      : users;

  const filteredUsers = baseList.filter(user => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (
        !user.email.toLowerCase().includes(q) &&
        !(user.first_name?.toLowerCase().includes(q)) &&
        !(user.last_name?.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    if (filterRole && user.role !== filterRole) return false;
    if (filterStatus === 'verified' && !user.is_verified) return false;
    if (filterStatus === 'unverified' && user.is_verified) return false;
    if (filterStatus === 'active' && !user.is_active) return false;
    if (filterStatus === 'inactive' && user.is_active) return false;
    return true;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const getUserDisplayName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email;
  };

  // ✅ CLEANUP: Removed duplicate getRoleIcon and getRoleBadge functions
  // Using centralized components from /lib/permissions instead

  const tabs = [
    { id: 'users', label: 'Tutti gli Utenti', count: users.length },
    { id: 'students', label: 'Studenti', count: students.length },
    { id: 'tutors', label: 'Tutor', count: tutors.length },
    { id: 'approvals', label: 'Approvazioni', count: pendingApprovals.length }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-foreground-secondary">Caricamento utenti...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestione Utenti Avanzata</h1>
          <p className="text-foreground-secondary">Gestione completa di utenti, approvazioni e operazioni multiple</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => exportUsers()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Esporta Tutti
          </button>
          
          {selectedUsers.length > 0 && (
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Azioni Multiple ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-foreground-secondary hover:border-border'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-foreground py-0.5 px-2.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters and Search */}
      <div className="bg-background-secondary p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Cerca per email, nome o cognome..." />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tutti i ruoli</option>
            <option value="student">Studenti</option>
            <option value="tutor">Tutor</option>
            <option value="admin">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tutti gli stati</option>
            <option value="verified">Verificati</option>
            <option value="unverified">Non verificati</option>
            <option value="active">Attivi</option>
            <option value="inactive">Inattivi</option>
          </select>

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10 per pagina</option>
            <option value={25}>25 per pagina</option>
            <option value={50}>50 per pagina</option>
            <option value={100}>100 per pagina</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {showBulkActions && selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            Azioni per {selectedUsers.length} utenti selezionati
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleBulkAction({ type: 'approve', userIds: selectedUsers })}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Approva Tutti
            </button>
            <button
              onClick={() => handleBulkAction({ type: 'reject', userIds: selectedUsers, reason: 'Azione multipla admin' })}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <XCircleIcon className="h-4 w-4" />
              Rifiuta Tutti
            </button>
            <button
              onClick={() => handleBulkAction({ type: 'export', userIds: selectedUsers })}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Esporta Selezionati
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-foreground-secondary">
        <span>
          Mostrando {paginatedUsers.length} di {filteredUsers.length} utenti
          {searchTerm && ` (filtrati da ${users.length} totali)`}
        </span>
        {totalPages > 1 && (
          <span>Pagina {currentPage} di {totalPages}</span>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-background-secondary rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruolo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrazione
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border rounded"
                    />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {getUserDisplayName(user).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">
                          {getUserDisplayName(user)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <RoleIcon role={user.role as UserRole} />
                      <RoleBadge role={user.role as UserRole} />
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.is_verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.is_verified ? 'Verificato' : 'Non verificato'}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.is_active 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Attivo' : 'Inattivo'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('it-IT')}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Visualizza dettagli"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      
                      {!user.is_verified && (
                        <button
                          onClick={() => handleApproveUser(user.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Approva utente"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {user.is_verified && (
                        <button
                          onClick={() => handleRejectUser(user.id, 'Revoca approvazione admin')}
                          className="text-orange-600 hover:text-orange-800"
                          title="Revoca approvazione"
                        >
                          <ExclamationTriangleIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Elimina utente"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
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
              const page = Math.max(1, currentPage - 2) + i;
              if (page > totalPages) return null;
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

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background-secondary rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Dettagli Utente</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-foreground-secondary"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">
                      {getUserDisplayName(selectedUser).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold">{getUserDisplayName(selectedUser)}</h4>
                    <p className="text-foreground-secondary">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <RoleIcon role={selectedUser.role as UserRole} />
<RoleBadge role={selectedUser.role as UserRole} />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary">ID Utente</label>
                    <p className="text-sm text-foreground">{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary">Data Registrazione</label>
                    <p className="text-sm text-foreground">
                      {new Date(selectedUser.created_at).toLocaleString('it-IT')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary">Stato Verifica</label>
                    <p className={`text-sm font-medium ${
                      selectedUser.is_verified ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {selectedUser.is_verified ? 'Verificato' : 'Non verificato'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary">Stato Account</label>
                    <p className={`text-sm font-medium ${
                      selectedUser.is_active ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {selectedUser.is_active ? 'Attivo' : 'Inattivo'}
                    </p>
                  </div>
                </div>
                
                {selectedUser.phone && (
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary">Telefono</label>
                    <p className="text-sm text-foreground">{selectedUser.phone}</p>
                  </div>
                )}
                
                {selectedUser.address && (
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary">Indirizzo</label>
                    <p className="text-sm text-foreground">{selectedUser.address}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                {!selectedUser.is_verified && (
                  <button
                    onClick={() => {
                      handleApproveUser(selectedUser.id);
                      setShowUserModal(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Approva
                  </button>
                )}
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-foreground-secondary bg-background-secondary border border-border rounded-lg hover:bg-gray-50"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background-secondary rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-foreground">Conferma Eliminazione</h3>
            </div>
            
            <div className="p-6">
              <p className="text-foreground-secondary">
                Sei sicuro di voler eliminare l&apos;utente <strong>{getUserDisplayName(userToDelete)}</strong>?
                Questa azione non può essere annullata.
              </p>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-foreground-secondary bg-background-secondary border border-border rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={() => handleDeleteUser(userToDelete.id, userToDelete.role as 'student' | 'tutor')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
