'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  AcademicCapIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '@/components/notifications/NotificationSystem';

interface PendingUser {
  id: number;
  email: string;
  role: 'student' | 'tutor';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  student_profile?: StudentProfile;
  tutor_profile?: TutorProfile;
}

interface StudentProfile {
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
}

interface TutorProfile {
  id: number;
  user_id: number;
  bio?: string;
  specializations?: string[];
  experience_years?: number;
  education?: string;
  certifications?: string[];
  hourly_rate?: number;
  location?: string;
  languages?: string[];
  is_verified?: boolean;
}

interface ApprovalDecision {
  userId: number;
  action: 'approve' | 'reject';
  reason?: string;
  notes?: string;
}

export default function RegistrationApprovalPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionAction, setDecisionAction] = useState<'approve' | 'reject'>('approve');
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  
  const { addNotification } = useNotifications();

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch pending approvals from admin API
      const response = await fetch('/api/admin/pending-approvals', { headers });
      if (response.ok) {
        const data = await response.json();
        
        // Fetch additional profile data for each user
        const enrichedUsers = await Promise.all(
          data.map(async (user: PendingUser) => {
            try {
              if (user.role === 'student') {
                const studentRes = await fetch(`/api/users/students/${user.id}`, { headers });
                if (studentRes.ok) {
                  const studentData = await studentRes.json();
                  user.student_profile = studentData;
                }
              } else if (user.role === 'tutor') {
                const tutorRes = await fetch(`/api/users/tutors/${user.id}`, { headers });
                if (tutorRes.ok) {
                  const tutorData = await tutorRes.json();
                  user.tutor_profile = tutorData;
                }
              }
            } catch (error) {
              console.log(`Could not fetch profile for user ${user.id}:`, error);
            }
            return user;
          })
        );
        
        setPendingUsers(enrichedUsers);
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
      addNotification({
        type: 'error',
        title: 'Errore Caricamento',
        message: 'Impossibile caricare le richieste di approvazione'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalDecision = async (decision: ApprovalDecision) => {
    setProcessingIds(prev => [...prev, decision.userId]);
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = decision.action === 'approve' 
        ? `/api/admin/users/${decision.userId}/approve`
        : `/api/admin/users/${decision.userId}/reject?reason=${encodeURIComponent(decision.reason || 'Non specificato')}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const actionText = decision.action === 'approve' ? 'approvato' : 'rifiutato';
        addNotification({
          type: decision.action === 'approve' ? 'success' : 'warning',
          title: `Utente ${actionText}`,
          message: `La richiesta è stata ${actionText} con successo`,
          action: {
            label: 'Vedi dettagli',
            href: '/admin/user-management'
          }
        });
        
        // Remove from pending list
        setPendingUsers(prev => prev.filter(user => user.id !== decision.userId));
        
        // Send email notification (could be handled by backend)
        await sendNotificationEmail(decision);
        
      } else {
        throw new Error('Failed to process approval decision');
      }
    } catch (error) {
      console.error('Error processing approval:', error);
      addNotification({
        type: 'error',
        title: 'Errore Elaborazione',
        message: 'Impossibile elaborare la decisione'
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== decision.userId));
      setShowDecisionModal(false);
      setDecisionReason('');
      setDecisionNotes('');
    }
  };

  const sendNotificationEmail = async (decision: ApprovalDecision) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/admin/send-approval-notification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: decision.userId,
          action: decision.action,
          reason: decision.reason,
          notes: decision.notes
        })
      });
    } catch (error) {
      console.log('Could not send notification email:', error);
    }
  };

  const quickApprove = async (userId: number) => {
    await handleApprovalDecision({
      userId,
      action: 'approve',
      reason: 'Approvazione rapida admin'
    });
  };

  const openDecisionModal = (user: PendingUser, action: 'approve' | 'reject') => {
    setSelectedUser(user);
    setDecisionAction(action);
    setShowDecisionModal(true);
  };

  const getUserDisplayName = (user: PendingUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email;
  };

  const getPriorityScore = (user: PendingUser) => {
    let score = 0;
    
    // Tutor applications have higher priority
    if (user.role === 'tutor') score += 10;
    
    // Users with complete profiles have higher priority
    if (user.role === 'tutor' && user.tutor_profile) {
      if (user.tutor_profile.bio) score += 2;
      if (user.tutor_profile.specializations?.length) score += 2;
      if (user.tutor_profile.experience_years) score += 2;
      if (user.tutor_profile.education) score += 2;
      if (user.tutor_profile.certifications?.length) score += 2;
    }
    
    if (user.role === 'student' && user.student_profile) {
      if (user.student_profile.school_name) score += 1;
      if (user.student_profile.grade_level) score += 1;
      if (user.student_profile.parent_name) score += 2;
    }
    
    // Older applications have higher priority
    const daysOld = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld > 7) score += 5;
    else if (daysOld > 3) score += 3;
    else if (daysOld > 1) score += 1;
    
    return score;
  };

  const getPriorityBadge = (score: number) => {
    if (score >= 15) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Alta</span>;
    } else if (score >= 10) {
      return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Media</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Bassa</span>;
    }
  };

  const getWaitingDays = (createdAt: string) => {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredAndSortedUsers = pendingUsers
    .filter(user => !filterRole || user.role === filterRole)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'priority':
          return getPriorityScore(b) - getPriorityScore(a);
        default:
          return 0;
      }
    });

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-foreground-secondary">Caricamento richieste...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workflow Approvazioni</h1>
          <p className="text-foreground-secondary">Gestione delle richieste di registrazione in attesa</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-foreground-secondary">
            <span className="font-medium">{pendingUsers.length}</span> richieste in attesa
          </div>
          <button
            onClick={fetchPendingUsers}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Aggiorna
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background-secondary p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {pendingUsers.filter(u => u.role === 'student').length}
              </p>
              <p className="text-sm text-foreground-secondary">Studenti</p>
            </div>
          </div>
        </div>

        <div className="bg-background-secondary p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {pendingUsers.filter(u => u.role === 'tutor').length}
              </p>
              <p className="text-sm text-foreground-secondary">Tutor</p>
            </div>
          </div>
        </div>

        <div className="bg-background-secondary p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {pendingUsers.filter(u => getWaitingDays(u.created_at) > 3).length}
              </p>
              <p className="text-sm text-foreground-secondary">Oltre 3 giorni</p>
            </div>
          </div>
        </div>

        <div className="bg-background-secondary p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {pendingUsers.filter(u => getPriorityScore(u) >= 15).length}
              </p>
              <p className="text-sm text-foreground-secondary">Alta Priorità</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background-secondary p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-4">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tutti i ruoli</option>
            <option value="student">Solo studenti</option>
            <option value="tutor">Solo tutor</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Più recenti</option>
            <option value="oldest">Più vecchi</option>
            <option value="priority">Per priorità</option>
          </select>
        </div>
      </div>

      {/* Pending Users List */}
      {filteredAndSortedUsers.length === 0 ? (
        <div className="bg-background-secondary rounded-lg shadow-sm border p-8 text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nessuna richiesta in attesa</h3>
          <p className="text-foreground-secondary">Tutte le richieste di registrazione sono state elaborate!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedUsers.map((user) => (
            <div key={user.id} className="bg-background-secondary rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-blue-600">
                      {getUserDisplayName(user).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {getUserDisplayName(user)}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'tutor' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'tutor' ? 'Tutor' : 'Studente'}
                      </span>
                      {getPriorityBadge(getPriorityScore(user))}
                    </div>
                    
                    <p className="text-foreground-secondary mb-2">{user.email}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Richiesta {getWaitingDays(user.created_at)} giorni fa
                      </div>
                      
                      {user.phone && (
                        <div className="flex items-center gap-1">
                          <PhoneIcon className="h-4 w-4" />
                          {user.phone}
                        </div>
                      )}
                      
                      {user.address && (
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          {user.address}
                        </div>
                      )}
                    </div>

                    {/* Profile Preview */}
                    {user.role === 'tutor' && user.tutor_profile && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AcademicCapIcon className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-900">Profilo Tutor</span>
                        </div>
                        {user.tutor_profile.specializations && (
                          <p className="text-sm text-green-700 mb-1">
                            <strong>Specializzazioni:</strong> {user.tutor_profile.specializations.join(', ')}
                          </p>
                        )}
                        {user.tutor_profile.experience_years && (
                          <p className="text-sm text-green-700 mb-1">
                            <strong>Esperienza:</strong> {user.tutor_profile.experience_years} anni
                          </p>
                        )}
                        {user.tutor_profile.education && (
                          <p className="text-sm text-green-700">
                            <strong>Formazione:</strong> {user.tutor_profile.education}
                          </p>
                        )}
                      </div>
                    )}

                    {user.role === 'student' && user.student_profile && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <UserIcon className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Profilo Studente</span>
                        </div>
                        {user.student_profile.school_name && (
                          <p className="text-sm text-blue-700 mb-1">
                            <strong>Scuola:</strong> {user.student_profile.school_name}
                          </p>
                        )}
                        {user.student_profile.grade_level && (
                          <p className="text-sm text-blue-700 mb-1">
                            <strong>Classe:</strong> {user.student_profile.grade_level}
                          </p>
                        )}
                        {user.student_profile.parent_name && (
                          <p className="text-sm text-blue-700">
                            <strong>Genitore:</strong> {user.student_profile.parent_name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDetailModal(true);
                    }}
                    className="p-2 text-foreground-secondary hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Visualizza dettagli"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => quickApprove(user.id)}
                    disabled={processingIds.includes(user.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    {processingIds.includes(user.id) ? 'Elaborando...' : 'Approva'}
                  </button>
                  
                  <button
                    onClick={() => openDecisionModal(user, 'reject')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Rifiuta
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background-secondary rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Dettagli Richiesta - {getUserDisplayName(selectedUser)}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-foreground-secondary"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-foreground">Informazioni Utente</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary">Nome completo</label>
                      <p className="text-sm text-foreground">{getUserDisplayName(selectedUser)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary">Email</label>
                      <p className="text-sm text-foreground">{selectedUser.email}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary">Ruolo</label>
                      <p className="text-sm text-foreground">{selectedUser.role}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary">Data registrazione</label>
                      <p className="text-sm text-foreground">
                        {new Date(selectedUser.created_at).toLocaleString('it-IT')}
                      </p>
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

                {/* Profile Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-foreground">
                    Profilo {selectedUser.role === 'tutor' ? 'Tutor' : 'Studente'}
                  </h4>
                  
                  {selectedUser.role === 'tutor' && selectedUser.tutor_profile ? (
                    <div className="space-y-3">
                      {selectedUser.tutor_profile.bio && (
                        <div>
                          <label className="block text-sm font-medium text-foreground-secondary">Biografia</label>
                          <p className="text-sm text-foreground">{selectedUser.tutor_profile.bio}</p>
                        </div>
                      )}
                      
                      {selectedUser.tutor_profile.specializations && (
                        <div>
                          <label className="block text-sm font-medium text-foreground-secondary">Specializzazioni</label>
                          <p className="text-sm text-foreground">
                            {selectedUser.tutor_profile.specializations.join(', ')}
                          </p>
                        </div>
                      )}
                      
                      {selectedUser.tutor_profile.experience_years && (
                        <div>
                          <label className="block text-sm font-medium text-foreground-secondary">Anni di esperienza</label>
                          <p className="text-sm text-foreground">{selectedUser.tutor_profile.experience_years}</p>
                        </div>
                      )}
                      
                      {selectedUser.tutor_profile.education && (
                        <div>
                          <label className="block text-sm font-medium text-foreground-secondary">Formazione</label>
                          <p className="text-sm text-foreground">{selectedUser.tutor_profile.education}</p>
                        </div>
                      )}
                      
                      {selectedUser.tutor_profile.certifications && (
                        <div>
                          <label className="block text-sm font-medium text-foreground-secondary">Certificazioni</label>
                          <p className="text-sm text-foreground">
                            {selectedUser.tutor_profile.certifications.join(', ')}
                          </p>
                        </div>
                      )}
                      
                      {selectedUser.tutor_profile.hourly_rate && (
                        <div>
                          <label className="block text-sm font-medium text-foreground-secondary">Tariffa oraria</label>
                          <p className="text-sm text-foreground">€{selectedUser.tutor_profile.hourly_rate}/ora</p>
                        </div>
                      )}
                    </div>
                  ) : selectedUser.role === 'student' && selectedUser.student_profile ? (
                    <div className="space-y-3">
                      {selectedUser.student_profile.school_name && (
                        <div>
                          <label className="block text-sm font-medium text-foreground-secondary">Scuola</label>
                          <p className="text-sm text-foreground">{selectedUser.student_profile.school_name}</p>
                        </div>
                      )}
                      
                      {selectedUser.student_profile.grade_level && (
                        <div>
                          <label className="block text-sm font-medium text-foreground-secondary">Classe</label>
                          <p className="text-sm text-foreground">{selectedUser.student_profile.grade_level}</p>
                        </div>
                      )}
                      
                      {selectedUser.student_profile.subjects_of_interest && (
                        <div>
                          <label className="block text-sm font-medium text-foreground-secondary">Materie di interesse</label>
                          <p className="text-sm text-foreground">
                            {selectedUser.student_profile.subjects_of_interest.join(', ')}
                          </p>
                        </div>
                      )}
                      
                      {selectedUser.student_profile.parent_name && (
                        <div>
                          <label className="block text-sm font-medium text-foreground-secondary">Nome genitore</label>
                          <p className="text-sm text-foreground">{selectedUser.student_profile.parent_name}</p>
                        </div>
                      )}
                      
                      {selectedUser.student_profile.parent_phone && (
                        <div>
                          <label className="block text-sm font-medium text-foreground-secondary">Telefono genitore</label>
                          <p className="text-sm text-foreground">{selectedUser.student_profile.parent_phone}</p>
                        </div>
                      )}
                      
                      {selectedUser.student_profile.parent_email && (
                        <div>
                          <label className="block text-sm font-medium text-foreground-secondary">Email genitore</label>
                          <p className="text-sm text-foreground">{selectedUser.student_profile.parent_email}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Profilo non completato</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => openDecisionModal(selectedUser, 'reject')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <XCircleIcon className="h-4 w-4" />
                  Rifiuta
                </button>
                <button
                  onClick={() => openDecisionModal(selectedUser, 'approve')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  Approva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {showDecisionModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background-secondary rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-foreground">
                {decisionAction === 'approve' ? 'Conferma Approvazione' : 'Conferma Rifiuto'}
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-foreground-secondary mb-4">
                Sei sicuro di voler {decisionAction === 'approve' ? 'approvare' : 'rifiutare'} la richiesta di{' '}
                <strong>{getUserDisplayName(selectedUser)}</strong>?
              </p>
              
              {decisionAction === 'reject' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary mb-1">
                      Motivo del rifiuto *
                    </label>
                    <select
                      value={decisionReason}
                      onChange={(e) => setDecisionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleziona un motivo</option>
                      <option value="Documentazione incompleta">Documentazione incompleta</option>
                      <option value="Requisiti non soddisfatti">Requisiti non soddisfatti</option>
                      <option value="Informazioni non verificabili">Informazioni non verificabili</option>
                      <option value="Profilo non adeguato">Profilo non adeguato</option>
                      <option value="Altro">Altro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary mb-1">
                      Note aggiuntive
                    </label>
                    <textarea
                      value={decisionNotes}
                      onChange={(e) => setDecisionNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Note opzionali per l'utente..."
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDecisionModal(false)}
                  className="px-4 py-2 text-foreground-secondary bg-background-secondary border border-border rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={() => handleApprovalDecision({
                    userId: selectedUser.id,
                    action: decisionAction,
                    reason: decisionReason,
                    notes: decisionNotes
                  })}
                  disabled={decisionAction === 'reject' && !decisionReason}
                  className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                    decisionAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {decisionAction === 'approve' ? (
                    <CheckCircleIcon className="h-4 w-4" />
                  ) : (
                    <XCircleIcon className="h-4 w-4" />
                  )}
                  {decisionAction === 'approve' ? 'Approva' : 'Rifiuta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
