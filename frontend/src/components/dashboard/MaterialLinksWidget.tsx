"use client"
import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon, 
  FolderIcon, 
  LinkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  BeakerIcon,
  CalculatorIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface MaterialData {
  id: string
  title: string
  type: 'document' | 'video' | 'link' | 'exercise' | 'quiz'
  subject: string
  description: string
  url: string
  size?: string
  duration?: string
  lastAccessed?: string
  isNew: boolean
}

interface MaterialLinksWidgetProps {
  className?: string
}

const subjectIcons: Record<string, React.ComponentType<any>> = {
  'Matematica': CalculatorIcon,
  'Fisica': AcademicCapIcon,
  'Chimica': BeakerIcon,
  'Biologia': BookOpenIcon,
  'Italiano': DocumentTextIcon,
  'Inglese': GlobeAltIcon,
  'Storia': BookOpenIcon,
  'Geografia': GlobeAltIcon,
  'Filosofia': BookOpenIcon,
  'Arte': AcademicCapIcon
}

const typeColors: Record<string, string> = {
  'document': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  'video': 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  'link': 'text-green-500 bg-green-500/10 border-green-500/20',
  'exercise': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  'quiz': 'text-red-500 bg-red-500/10 border-red-500/20'
}

const typeLabels: Record<string, string> = {
  'document': 'Documento',
  'video': 'Video',
  'link': 'Link',
  'exercise': 'Esercizio',
  'quiz': 'Quiz'
}

export default function MaterialLinksWidget({ className }: MaterialLinksWidgetProps) {
  const [materials, setMaterials] = useState<MaterialData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

  // Mock data per sviluppo - sarà sostituito con API call
  useEffect(() => {
    const mockMaterials: MaterialData[] = [
      {
        id: '1',
        title: 'Formule Calcolo Differenziale',
        type: 'document',
        subject: 'Matematica',
        description: 'Raccolta completa delle formule per il calcolo differenziale',
        url: '/materials/math/calc-diff-formulas.pdf',
        size: '2.3 MB',
        lastAccessed: '2025-08-28',
        isNew: false
      },
      {
        id: '2',
        title: 'Video Lezione: Integrali',
        type: 'video',
        subject: 'Matematica',
        description: 'Spiegazione completa degli integrali indefiniti e definiti',
        url: '/materials/math/integrali-video.mp4',
        duration: '45 min',
        lastAccessed: '2025-08-25',
        isNew: true
      },
      {
        id: '3',
        title: 'Esercizi Meccanica Classica',
        type: 'exercise',
        subject: 'Fisica',
        description: 'Serie di esercizi con soluzioni per la meccanica classica',
        url: '/materials/physics/meccanica-esercizi.pdf',
        size: '1.8 MB',
        lastAccessed: '2025-08-27',
        isNew: false
      },
      {
        id: '4',
        title: 'Quiz Chimica Organica',
        type: 'quiz',
        subject: 'Chimica',
        description: 'Test di autovalutazione sulla chimica organica',
        url: '/materials/chemistry/quiz-organica.html',
        lastAccessed: '2025-08-26',
        isNew: false
      },
      {
        id: '5',
        title: 'Link Utili: Storia Contemporanea',
        type: 'link',
        subject: 'Storia',
        description: 'Risorse online per lo studio della storia contemporanea',
        url: 'https://example.com/storia-contemporanea',
        lastAccessed: '2025-08-24',
        isNew: true
      },
      {
        id: '6',
        title: 'Appunti Filosofia Antica',
        type: 'document',
        subject: 'Filosofia',
        description: 'Appunti completi sui filosofi presocratici',
        url: '/materials/philosophy/filosofia-antica.pdf',
        size: '3.1 MB',
        lastAccessed: '2025-08-23',
        isNew: false
      }
    ]

    // Simula API call
    setTimeout(() => {
      setMaterials(mockMaterials)
      setLoading(false)
    }, 1000)
  }, [])

  const subjects = Array.from(new Set(materials.map(m => m.subject))).sort()
  const filteredMaterials = selectedSubject === 'all' 
    ? materials 
    : materials.filter(m => m.subject === selectedSubject)

  const getSubjectIcon = (subject: string) => {
    const IconComponent = subjectIcons[subject] || DocumentTextIcon
    return <IconComponent className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Oggi'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ieri'
    } else {
      return date.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short'
      })
    }
  }

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-background-secondary rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-background-secondary rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-background-secondary rounded w-1/2"></div>
                <div className="h-2 bg-background-secondary rounded w-3/4"></div>
                <div className="h-2 bg-background-secondary rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("p-6 border-red-500/20", className)}>
        <div className="text-center text-red-500">
          <DocumentTextIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Errore nel caricamento materiali</p>
          <p className="text-xs text-foreground-muted">{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-primary" />
            Materiali di Studio
          </h3>
          <p className="text-sm text-foreground-muted">
            {materials.length} materiale{materials.length !== 1 ? 'i' : ''} disponibili
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {materials.filter(m => m.isNew).length}
          </div>
          <div className="text-xs text-foreground-muted">Nuovi</div>
        </div>
      </div>

      {/* Subject Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSubject('all')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
              selectedSubject === 'all'
                ? "bg-primary text-white border-primary"
                : "bg-background-secondary text-foreground-secondary border-border hover:bg-background-tertiary"
            )}
          >
            Tutte le materie
          </button>
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors flex items-center gap-1",
                selectedSubject === subject
                  ? "bg-primary text-white border-primary"
                  : "bg-background-secondary text-foreground-secondary border-border hover:bg-background-tertiary"
              )}
            >
              {getSubjectIcon(subject)}
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-3">
        {filteredMaterials.map((material) => (
          <div 
            key={material.id}
            className={cn(
              "p-4 rounded-lg border transition-all duration-200 hover:bg-background-secondary",
              material.isNew 
                ? "border-primary/30 bg-primary/5" 
                : "border-border bg-background-secondary/30"
            )}
          >
            {/* Material Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground text-sm">{material.title}</h4>
                  {material.isNew && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
                      Nuovo
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground-muted">{material.description}</p>
              </div>
              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-full border flex items-center gap-1",
                typeColors[material.type]
              )}>
                {getSubjectIcon(material.subject)}
                {typeLabels[material.type]}
              </span>
            </div>

            {/* Material Details */}
            <div className="flex items-center justify-between text-xs text-foreground-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  {getSubjectIcon(material.subject)}
                  {material.subject}
                </span>
                {material.size && (
                  <span>{material.size}</span>
                )}
                {material.duration && (
                  <span>{material.duration}</span>
                )}
                {material.lastAccessed && (
                  <span>Ultimo accesso: {formatDate(material.lastAccessed)}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1 text-foreground-muted hover:text-primary transition-colors">
                  <EyeIcon className="h-3 w-3" />
                </button>
                <button className="p-1 text-foreground-muted hover:text-primary transition-colors">
                  <ArrowDownTrayIcon className="h-3 w-3" />
                </button>
                <button className="p-1 text-foreground-muted hover:text-primary transition-colors">
                  <LinkIcon className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Materials State */}
      {filteredMaterials.length === 0 && (
        <div className="text-center py-8">
          <FolderIcon className="h-12 w-12 text-foreground-muted mx-auto mb-3" />
          <p className="text-foreground-muted text-sm">
            {selectedSubject === 'all' 
              ? 'Nessun materiale disponibile' 
              : `Nessun materiale per ${selectedSubject}`
            }
          </p>
          <p className="text-foreground-muted text-xs mt-1">
            I tuoi tutor caricheranno materiali qui
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 text-xs font-medium text-primary border border-primary/20 rounded-md hover:bg-primary/10 transition-colors">
            Richiedi Materiale
          </button>
          <button className="flex-1 px-3 py-2 text-xs font-medium text-foreground-secondary border border-border rounded-md hover:bg-background-secondary transition-colors">
            Vedi Tutti
          </button>
        </div>
      </div>
    </Card>
  )
}
