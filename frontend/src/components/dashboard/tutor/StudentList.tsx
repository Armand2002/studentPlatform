'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';

interface Student {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  subjects: string[];
  totalLessons: number;
  completedLessons: number;
  lastLesson?: string;
  nextLesson?: string;
  status: 'active' | 'inactive' | 'pending';
  rating?: number;
}

export function StudentList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ SECURE ENDPOINT: Get only students assigned to this tutor
      const studentsResponse = await api.get('/api/users/tutors/me/students');
      const assignedStudents = studentsResponse.data;
      console.log('🔒 Assigned students:', assignedStudents);
      
      // Get bookings to calculate stats for these students only
      const bookingsResponse = await api.get('/api/bookings');
      const allBookings = bookingsResponse.data;
      
      // Map assigned students with their booking stats
      const studentsWithStats: Student[] = assignedStudents.map((student: any) => {
        const studentBookings = allBookings.filter((b: any) => b.student_id === student.id);
        const completedBookings = studentBookings.filter((b: any) => b.status === 'COMPLETED');
        
        return {
          id: student.id,
          name: (student.first_name && student.last_name) 
            ? `${student.first_name} ${student.last_name}` 
            : `Studente ${student.id}`,
          email: student.user?.email || 'N/A',
          subjects: [...new Set(studentBookings.map((b: any) => b.subject).filter(Boolean))] as string[],
          totalLessons: studentBookings.length,
          completedLessons: completedBookings.length,
          lastLesson: completedBookings.length > 0 ? 
            completedBookings[completedBookings.length - 1].start_time?.split('T')[0] : undefined,
          nextLesson: studentBookings.find((b: any) => 
            b.status === 'CONFIRMED' && new Date(b.start_time) > new Date()
          )?.start_time?.split('T')[0],
          status: studentBookings.length > 0 ? 'active' : 'inactive' as const,
          rating: completedBookings.length > 0 ? 
            Math.min(4.0 + (completedBookings.length / 10), 5.0) : undefined
        };
      });
      
      setStudents(studentsWithStats);
    } catch (err) {
      console.error('❌ Error loading assigned students:', err);
      setError('Impossibile caricare la lista studenti assegnati');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    if (filter === 'all') return true;
    return student.status === filter;
  });

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'inactive': return 'text-red-500 bg-red-500/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-foreground-secondary bg-background-secondary';
    }
  };

  const getStatusText = (status: Student['status']) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'inactive': return 'Inattivo';
      case 'pending': return 'In attesa';
      default: return 'Sconosciuto';
    }
  };

  const getEmptyStateMessage = (currentFilter: string) => {
    if (currentFilter === 'all') return "Non hai ancora studenti assegnati";
    if (currentFilter === 'active') return "Nessuno studente attivo";
    return "Nessuno studente inattivo";
  };

  const getProgressPercentage = (student: Student) => {
    if (student.totalLessons === 0) return 0;
    return Math.round((student.completedLessons / student.totalLessons) * 100);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-foreground/10 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            <div className="h-16 bg-foreground/10 rounded"></div>
            <div className="h-16 bg-foreground/10 rounded"></div>
            <div className="h-16 bg-foreground/10 rounded"></div>
            <div className="h-16 bg-foreground/10 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-foreground-secondary">
          <p>Errore nel caricamento degli studenti</p>
          <button 
            onClick={loadStudents}
            className="mt-2 text-primary hover:text-primary/80"
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
          <h3 className="text-lg font-semibold text-foreground">I Miei Studenti</h3>
          <p className="text-sm text-foreground-secondary">
            {students.length} studenti totali
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex bg-background-secondary rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === 'all' 
                ? 'bg-primary text-white' 
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            Tutti
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === 'active' 
                ? 'bg-primary text-white' 
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            Attivi
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === 'inactive' 
                ? 'bg-primary text-white' 
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            Inattivi
          </button>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-foreground-secondary">
            <div className="text-4xl mb-2">👥</div>
            <p>Nessuno studente trovato</p>
            <p className="text-sm mt-1">
              {getEmptyStateMessage(filter)}
            </p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} className="p-4 bg-background-secondary rounded-lg border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                    {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{student.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(student.status)}`}>
                        {getStatusText(student.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground-secondary mb-2">{student.email}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {student.subjects.map((subject, index) => (
                        <span key={`${student.id}-subject-${index}`} className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded">
                          {subject}
                        </span>
                      ))}
                    </div>

                    {student.status !== 'pending' && (
                      <div className="space-y-2">
                        {/* Progress Bar */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-foreground-secondary">Progresso:</span>
                          <div className="flex-1 bg-background-tertiary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${getProgressPercentage(student)}%` }}
                            ></div>
                          </div>
                          <span className="text-foreground-secondary">{getProgressPercentage(student)}%</span>
                        </div>

                        {/* Lesson Stats */}
                        <div className="flex items-center justify-between text-xs text-foreground-secondary">
                          <span>{student.completedLessons}/{student.totalLessons} lezioni</span>
                          {student.lastLesson && (
                            <span>Ultima: {new Date(student.lastLesson).toLocaleDateString()}</span>
                          )}
                        </div>

                        {/* Next Lesson */}
                        {student.nextLesson && (
                          <div className="text-xs text-primary">
                            Prossima: {new Date(student.nextLesson).toLocaleDateString()}
                          </div>
                        )}

                        {/* Rating */}
                        {student.rating && (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-foreground-secondary">Valutazione:</span>
                            <div className="text-yellow-500">
                              {'★'.repeat(student.rating)}{'☆'.repeat(5 - student.rating)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <button className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors">
                    💬
                  </button>
                  <button className="p-2 text-foreground-secondary hover:bg-background-tertiary rounded-md transition-colors">
                    📊
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {students.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-500">
              {students.filter(s => s.status === 'active').length}
            </div>
            <div className="text-xs text-foreground-secondary">Attivi</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-500">
              {students.filter(s => s.status === 'inactive').length}
            </div>
            <div className="text-xs text-foreground-secondary">Inattivi</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-500">
              {students.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-xs text-foreground-secondary">In attesa</div>
          </div>
        </div>
      )}
    </Card>
  );
}
