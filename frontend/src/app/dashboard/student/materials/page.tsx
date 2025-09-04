"use client"
import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon,
  PlayIcon,
  LinkIcon,
  PuzzlePieceIcon,
  QuestionMarkCircleIcon,
  FolderIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import RequireAuth from '@/components/auth/RequireAuth'

interface Material {
  id: string
  title: string
  description: string
  type: 'document' | 'video' | 'link' | 'exercise' | 'quiz'
  subject: string
  tutorName: string
  fileName?: string
  fileSize?: string
  url: string
  uploadDate: string
  lastAccessed?: string
  downloadCount: number
  isShared: boolean
  packageId?: string
  lessonId?: string
}

interface Subject {
  id: string
  name: string
  materialCount: number
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true)
        
        console.log('🔍 Fetching user materials from backend...')
        
        // Implementazione API materials in attesa di backend endpoint
        // const [materials, subjects] = await Promise.all([
        //   materialService.getUserMaterials(),
        //   materialService.getSubjects()
        // ])
        
        // Per ora impostiamo array vuoti finché non implementiamo il backend
        setMaterials([])
        setSubjects([])
        
      } catch (err) {
        console.error('❌ Error fetching materials:', err)
        setMaterials([])
        setSubjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchMaterials()
  }, [])

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'document':
        return {
          icon: DocumentTextIcon,
          color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
          label: 'Documento'
        }
      case 'video':
        return {
          icon: PlayIcon,
          color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
          label: 'Video'
        }
      case 'link':
        return {
          icon: LinkIcon,
          color: 'text-green-500 bg-green-500/10 border-green-500/20',
          label: 'Link'
        }
      case 'exercise':
        return {
          icon: PuzzlePieceIcon,
          color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
          label: 'Esercizio'
        }
      case 'quiz':
        return {
          icon: QuestionMarkCircleIcon,
          color: 'text-red-500 bg-red-500/10 border-red-500/20',
          label: 'Quiz'
        }
      default:
        return {
          icon: DocumentTextIcon,
          color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
          label: 'File'
        }
    }
  }

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === 'all' || material.subject === selectedSubject
    const matchesType = selectedType === 'all' || material.type === selectedType
    
    return matchesSearch && matchesSubject && matchesType
  })

  const materialTypes = [
    { key: 'all', label: 'Tutti i tipi' },
    { key: 'document', label: 'Documenti' },
    { key: 'video', label: 'Video' },
    { key: 'link', label: 'Link' },
    { key: 'exercise', label: 'Esercizi' },
    { key: 'quiz', label: 'Quiz' }
  ]

  if (loading) {
    return (
      <RequireAuth>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-background-secondary rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-background-secondary rounded w-2/3 mb-6"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-background-secondary rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Materiali</h1>
            <p className="text-foreground-muted">
              Accedi ai tuoi materiali di studio e risorse condivise
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <PlusIcon className="h-4 w-4" />
            Richiedi Materiale
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{materials.length}</div>
            <div className="text-sm text-foreground-muted">Materiali totali</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{materials.filter(m => m.type === 'document').length}</div>
            <div className="text-sm text-foreground-muted">Documenti</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">{materials.filter(m => m.type === 'video').length}</div>
            <div className="text-sm text-foreground-muted">Video</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{subjects.length}</div>
            <div className="text-sm text-foreground-muted">Materie</div>
          </Card>
        </div>

        {/* Subjects Overview */}
        {subjects.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Materiali per Materia</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.name)}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-colors text-left w-full",
                    selectedSubject === subject.name
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-background-secondary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FolderIcon className="h-8 w-8 text-primary" />
                    <div>
                      <div className="font-medium text-foreground">{subject.name}</div>
                      <div className="text-sm text-foreground-muted">
                        {subject.materialCount} materiali
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <input
                type="text"
                placeholder="Cerca materiali..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              {materialTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setSelectedType(type.key)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    selectedType === type.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-background-secondary text-foreground-muted hover:bg-background-secondary/80"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Tutte le materie</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Materials List */}
        <div className="space-y-4">
          {filteredMaterials.length === 0 ? (
            <Card className="p-12 text-center">
              <DocumentTextIcon className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nessun materiale trovato
              </h3>
              <p className="text-foreground-muted mb-6">
                {searchQuery || selectedSubject !== 'all' || selectedType !== 'all'
                  ? "Non ci sono materiali che corrispondono ai filtri selezionati."
                  : "Non hai ancora materiali di studio disponibili."
                }
              </p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                <PlusIcon className="h-4 w-4" />
                Richiedi il primo materiale
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((material) => {
                const typeConfig = getTypeConfig(material.type)
                const TypeIcon = typeConfig.icon

                return (
                  <Card key={material.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg border",
                          typeConfig.color
                        )}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-sm">{material.title}</h3>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full border",
                            typeConfig.color
                          )}>
                            {typeConfig.label}
                          </span>
                        </div>
                      </div>
                      {material.isShared && (
                        <ShareIcon className="h-4 w-4 text-green-500" title="Condiviso" />
                      )}
                    </div>

                    <p className="text-sm text-foreground-muted mb-3 line-clamp-2">
                      {material.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-foreground-muted">
                        <span className="font-medium">Materia:</span> {material.subject}
                      </div>
                      <div className="text-xs text-foreground-muted">
                        <span className="font-medium">Tutor:</span> {material.tutorName}
                      </div>
                      {material.fileName && (
                        <div className="text-xs text-foreground-muted">
                          <span className="font-medium">File:</span> {material.fileName}
                          {material.fileSize && ` (${material.fileSize})`}
                        </div>
                      )}
                      <div className="text-xs text-foreground-muted">
                        <span className="font-medium">Caricato:</span> {new Date(material.uploadDate).toLocaleDateString('it-IT')}
                      </div>
                      {material.lastAccessed && (
                        <div className="text-xs text-foreground-muted">
                          <span className="font-medium">Ultimo accesso:</span> {new Date(material.lastAccessed).toLocaleDateString('it-IT')}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                      >
                        <EyeIcon className="h-4 w-4" />
                        Visualizza
                      </a>
                      
                      {material.type === 'document' && (
                        <a
                          href={material.url}
                          download
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-border text-foreground-secondary rounded-md hover:bg-background-secondary transition-colors text-sm"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    {material.downloadCount > 0 && (
                      <div className="mt-2 text-xs text-foreground-muted text-center">
                        Scaricato {material.downloadCount} volte
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  )
}
