'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  GraduationCap, 
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Ban
} from 'lucide-react';
import { api } from '@/lib/api';
import { UserRole, UserStatus } from '@/lib/permissions';
import { RoleIcon, StatusBadge } from '@/components/ui/PermissionComponents';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
  status: 'active' | 'pending' | 'suspended' | 'verified';
  registrationDate: string;
  lastActivity?: string;
  totalLessons?: number;
  totalEarnings?: number;
}

interface UserRowProps {
  readonly user: User;
  readonly onAction: (action: string, user: User) => void;
}

function UserRow({ user, onAction }: UserRowProps) {
  // ✅ CLEANUP: Removed duplicate getStatusBadge and getRoleIcon functions
  // Using centralized components instead

  return (
    <tr className="border-b border-border hover:bg-background-secondary/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <RoleIcon role={user.role as UserRole} />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-foreground-secondary">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={user.status as UserStatus} />
      </td>
      <td className="px-4 py-3 text-sm text-foreground-secondary">
        {new Date(user.registrationDate).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-sm text-foreground-secondary">
        {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'Mai'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onAction('view', user)}
            className="p-1 text-foreground-secondary hover:text-primary transition-colors"
            title="Visualizza dettagli"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onAction('edit', user)}
            className="p-1 text-foreground-secondary hover:text-secondary transition-colors"
            title="Modifica utente"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onAction('suspend', user)}
            className="p-1 text-foreground-secondary hover:text-red-500 transition-colors"
            title="Sospendi utente"
          >
            <Ban className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onAction('more', user)}
            className="p-1 text-foreground-secondary hover:text-foreground transition-colors"
            title="Altre azioni"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function UserManagementWidget() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'tutor' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/api/admin/users');
      const usersData = response.data;

      // Trasforma i dati in formato User
      const transformedUsers: User[] = usersData.map((user: any) => ({
        id: user.id,
        firstName: user.first_name || 'N/A',
        lastName: user.last_name || 'N/A',
        email: user.email,
        role: user.role || 'student',
        status: user.is_active ? 'active' : 'pending',
        registrationDate: user.created_at || new Date().toISOString(),
        lastActivity: user.last_login || undefined,
        totalLessons: 0, // Da implementare
        totalEarnings: 0, // Da implementare
      }));

      setUsers(transformedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Impossibile caricare gli utenti');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = (action: string, user: User) => {
    console.log(`Action: ${action} on user:`, user);
    // Implementare azioni specifiche
    switch (action) {
      case 'view':
        // Aprire modal dettagli utente
        break;
      case 'edit':
        // Aprire form modifica utente
        break;
      case 'suspend':
        // Sospendere utente
        break;
      default:
        break;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-background-secondary rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`user-loading-${i}`} className="h-12 bg-background-secondary rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Errore nel caricamento utenti</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={fetchUsers}
            className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            Riprova
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Gestione Utenti</h3>
          <p className="text-sm text-foreground-secondary">
            {filteredUsers.length} di {users.length} utenti
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
          <input
            type="text"
            placeholder="Cerca utenti..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tutti i ruoli</option>
            <option value="student">Studenti</option>
            <option value="tutor">Tutors</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tutti gli stati</option>
            <option value="active">Attivi</option>
            <option value="pending">In attesa</option>
            <option value="suspended">Sospesi</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                Utente
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                Status
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                Registrazione
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                Ultima attività
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground-secondary">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.slice(0, 5).map((user) => (
              <UserRow key={user.id} user={user} onAction={handleUserAction} />
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <UserX className="w-12 h-12 text-foreground-secondary mx-auto mb-3" />
          <p className="text-foreground-secondary">Nessun utente trovato</p>
        </div>
      )}

      {filteredUsers.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-primary hover:text-primary/80 text-sm font-medium">
            Visualizza tutti ({filteredUsers.length})
          </button>
        </div>
      )}
    </Card>
  );
}
