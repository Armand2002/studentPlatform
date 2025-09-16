"use client"
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import RequireAuth from '@/components/auth/RequireAuth'
import { 
  UserGroupIcon,
  StarIcon,
  BookOpenIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface Tutor {
  id: string
  full_name: string
  email: string
  avatar?: string
  bio?: string
  subjects: string[]
  rating?: number
  total_lessons?: number
  available_today: boolean
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchSubject, setSearchSubject] = useState('')

  useEffect(() => {
    fetchTutors()
  }, [searchSubject])

  const fetchTutors = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      if (!token) {
        setTutors([])
        return
      }

      // Prima, otteniamo i pacchetti dello studente per trovare i tutor associati
      const packagesResponse = await fetch('http://localhost:8000/api/packages/purchases/active', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!packagesResponse.ok) {
        console.error('Failed to fetch student packages')
        setTutors([])
        return
      }

      const packages = await packagesResponse.json()
      console.log('📦 Student active packages:', packages)

      // Estraiamo gli ID dei tutor dai pacchetti acquistati
      const tutorIds = [...new Set(packages.map((purchase: any) => purchase.package?.tutor_id).filter(Boolean))]
      console.log('🧑‍🏫 Tutor IDs from packages:', tutorIds)

      if (tutorIds.length === 0) {
        console.log('No tutors found from packages')
        setTutors([])
        return
      }

      // Ora otteniamo le informazioni complete dei tutor
      let url = 'http://localhost:8000/api/users/tutors'
      if (searchSubject) {
        url += `?subject=${encodeURIComponent(searchSubject)}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const allTutors = await response.json()
        console.log('🧑‍🏫 All tutors data received:', allTutors)
        
        // Filtriamo solo i tutor che sono nei pacchetti dello studente
        const studentTutors = allTutors.filter((tutor: any) => 
          tutorIds.includes(tutor.id)
        )
        
        console.log('🎯 Student assigned tutors:', studentTutors)
        setTutors(studentTutors)
      }
    } catch (error) {
      console.error('Error fetching tutors:', error)
      setTutors([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-xl p-6 border border-primary/20">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <UserGroupIcon className="h-8 w-8 text-primary" />
            Trova un Tutor
          </h1>
          <p className="text-foreground-secondary text-lg">
            Scopri i nostri tutor qualificati e trova quello perfetto per te.
          </p>
        </div>

        {/* Search */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary" />
            Cerca per materia
          </h2>
          <div className="max-w-md">
            <input
              type="text"
              placeholder="es. Matematica, Fisica, Inglese..."
              value={searchSubject}
              onChange={(e) => setSearchSubject(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </Card>

        {/* Tutors Grid */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Tutor Disponibili ({tutors.length})
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-background-secondary rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : tutors.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nessun tutor assegnato
              </h3>
              <p className="text-foreground-muted mb-6">
                Non hai ancora pacchetti attivi con tutor assegnati.
                <br />
                Acquista un pacchetto per iniziare le lezioni!
              </p>
              <a
                href="/dashboard/student/packages"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <BookOpenIcon className="h-4 w-4" />
                Esplora i Pacchetti
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map((tutor) => (
                <div 
                  key={tutor.id}
                  className="p-6 border border-border rounded-lg hover:shadow-lg transition-all bg-background-secondary/30"
                >
                  {/* Tutor Avatar & Info */}
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <UserGroupIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">
                      {tutor.full_name}
                    </h3>
                    {tutor.rating && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-foreground-secondary">
                          {tutor.rating} ({tutor.total_lessons || 0} lezioni)
                        </span>
                      </div>
                    )}
                    {tutor.available_today && (
                      <span className="inline-block px-2 py-1 text-xs bg-green-500/10 text-green-600 rounded-full mt-2">
                        Disponibile oggi
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  {tutor.bio && (
                    <p className="text-sm text-foreground-muted mb-4 line-clamp-3">
                      {tutor.bio}
                    </p>
                  )}

                  {/* Subjects */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                      <BookOpenIcon className="h-4 w-4" />
                      Materie
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(tutor.subjects) ? tutor.subjects : []).slice(0, 3).map((subject, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                        >
                          {subject}
                        </span>
                      ))}
                      {(Array.isArray(tutor.subjects) ? tutor.subjects : []).length > 3 && (
                        <span className="px-2 py-1 text-xs bg-background-secondary text-foreground-muted rounded">
                          +{(Array.isArray(tutor.subjects) ? tutor.subjects : []).length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors text-sm font-medium">
                      Vedi Profilo
                    </button>
                    <button className="w-full px-4 py-2 border border-border text-foreground-secondary rounded-md hover:bg-background-secondary transition-colors text-sm">
                      Prenota Lezione
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </RequireAuth>
  )
}
