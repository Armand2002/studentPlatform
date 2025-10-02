'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  XMarkIcon,
  PencilIcon,
  UserGroupIcon,
  DocumentIcon,
  ChartBarIcon,
  CurrencyEuroIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  LinkIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import { useForm } from '@/hooks/useForm'

interface Package {
  id: number
  name: string
  subject: string
  description?: string
  total_hours: number
  price: number
  tutor: {
    id: number
    first_name: string
    last_name: string
    email: string
  } | null
  is_active: boolean
  created_at: string
  purchases_count?: number
  assignments_count?: number
}

interface Assignment {
  id: number
  student: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  assigned_date: string
  status: string
  hours_used: number
  hours_remaining: number
  expiry_date: string
}

interface Material {
  id: number
  title: string
  description: string
  google_drive_url: string
  created_at: string
}

interface PackageStats {
  total_assignments: number
  active_assignments: number
  total_hours_used: number
  total_revenue: number
  avg_completion_rate: number
}

interface PackageManagementModalProps {
  isOpen: boolean
  onClose: () => void
  packageData: Package
  onPackageUpdate: () => void
}

export default function PackageManagementModal({ 
  isOpen, 
  onClose, 
  packageData, 
  onPackageUpdate 
}: PackageManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'assignments' | 'materials' | 'stats'>('edit')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [stats, setStats] = useState<PackageStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form per modifica pacchetto
  const { formState: { data: formData, loading: updating }, updateField, handleSubmit } = useForm({
    name: packageData.name,
    subject: packageData.subject,
    description: packageData.description || '',
    total_hours: packageData.total_hours,
    price: packageData.price,
    is_active: packageData.is_active
  })


  useEffect(() => {
    if (isOpen) {
      fetchPackageDetails()
    }
  }, [isOpen, packageData.id])

  const fetchPackageDetails = async () => {
    try {
      setError(null)

      // Temporarily disable API calls to avoid 404 errors
      // TODO: Implement these endpoints in the backend
      const assignmentsRes = { data: [] }
      const materialsRes = { data: [] }
      const statsRes = { 
        data: {
          total_assignments: 0,
          active_assignments: 0,
          total_hours_used: 0,
          total_revenue: 0,
          avg_completion_rate: 0
        }
      }

      setAssignments(assignmentsRes.data || [])
      setMaterials(materialsRes.data || [])
      setStats(statsRes.data)
    } catch (err) {
      console.error('Error fetching package details:', err)
      setError('Errore nel caricamento dei dettagli del pacchetto')
    }
  }

  const updatePackage = async (data: any) => {
    try {
      await api.put(`/api/admin/packages/${packageData.id}`, data)
      onPackageUpdate()
      // Non chiudiamo il modal, solo mostriamo successo
    } catch (err) {
      throw new Error('Errore nell\'aggiornamento del pacchetto')
    }
  }


  const removeMaterial = async (materialId: number) => {
    // TODO: Implement material deletion endpoint
    alert('Funzionalità in sviluppo - Eliminazione materiali')
  }

  const removeAssignment = async (assignmentId: number) => {
    // TODO: Implement assignment deletion endpoint
    alert('Funzionalità in sviluppo - Eliminazione assegnazioni')
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'edit', label: 'Modifica', icon: PencilIcon },
    { id: 'assignments', label: 'Assegnazioni', icon: UserGroupIcon, count: assignments.length },
    { id: 'materials', label: 'Materiali', icon: DocumentIcon, count: materials.length },
    { id: 'stats', label: 'Statistiche', icon: ChartBarIcon }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestisci Pacchetto</h2>
            <p className="text-foreground-muted mt-1">{packageData.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-primary text-primary bg-primary/5' 
                  : 'border-transparent text-foreground-muted hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <Badge className="ml-2 bg-primary/20 text-primary">{tab.count}</Badge>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <XCircleIcon className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSubmit(updatePackage)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nome Pacchetto
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Materia
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => updateField('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Es: Matematica, Fisica, Inglese..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ore Totali
                  </label>
                  <input
                    type="number"
                    value={formData.total_hours}
                    onChange={(e) => updateField('total_hours', parseInt(e.target.value))}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Prezzo (€)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateField('price', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descrizione
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Descrizione del pacchetto..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <label htmlFor="is_active" className="text-sm text-foreground">
                  Pacchetto attivo
                </label>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={updating}
                  className="bg-primary hover:bg-primary/80"
                >
                  {updating ? 'Aggiornamento...' : 'Aggiorna Pacchetto'}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Assegnazioni Attive</h3>
                <Badge className="bg-blue-100 text-blue-800">
                  {assignments.length} assegnazioni
                </Badge>
              </div>

              {assignments.length === 0 ? (
                <Card className="p-8 text-center">
                  <UserGroupIcon className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                  <p className="text-foreground-muted">Nessuna assegnazione trovata</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {assignments.map(assignment => (
                    <Card key={assignment.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <UserIcon className="w-5 h-5 text-foreground-muted" />
                            <span className="font-medium text-foreground">
                              {assignment.student.first_name} {assignment.student.last_name}
                            </span>
                            <Badge className={
                              assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                              assignment.status === 'expired' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {assignment.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-foreground-muted">Email</p>
                              <p className="text-foreground">{assignment.student.email}</p>
                            </div>
                            <div>
                              <p className="text-foreground-muted">Ore utilizzate</p>
                              <p className="text-foreground">{assignment.hours_used} / {packageData.total_hours}</p>
                            </div>
                            <div>
                              <p className="text-foreground-muted">Ore rimanenti</p>
                              <p className="text-foreground">{assignment.hours_remaining}</p>
                            </div>
                            <div>
                              <p className="text-foreground-muted">Scadenza</p>
                              <p className="text-foreground">
                                {new Date(assignment.expiry_date).toLocaleDateString('it-IT')}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-700 border-red-200"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Materiali Didattici</h3>
                <Badge className="bg-blue-100 text-blue-800">
                  {materials.length} materiali
                </Badge>
              </div>


              {/* Lista materiali */}
              {materials.length === 0 ? (
                <Card className="p-8 text-center">
                  <DocumentIcon className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                  <p className="text-foreground-muted">Nessun materiale caricato</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {materials.map(material => (
                    <Card key={material.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <DocumentIcon className="w-5 h-5 text-foreground-muted" />
                            <span className="font-medium text-foreground">{material.title}</span>
                          </div>
                          
                          {material.description && (
                            <p className="text-sm text-foreground-muted mb-2">{material.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-foreground-muted">
                            <span>Aggiunto il {new Date(material.created_at).toLocaleDateString('it-IT')}</span>
                            <a
                              href={material.google_drive_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-primary hover:text-primary/80"
                            >
                              <LinkIcon className="w-3 h-3" />
                              <span>Apri in Google Drive</span>
                            </a>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeMaterial(material.id)}
                          className="text-red-600 hover:text-red-700 border-red-200"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Statistiche Pacchetto</h3>
              
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center space-x-3">
                      <UserGroupIcon className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.total_assignments}</p>
                        <p className="text-sm text-foreground-muted">Assegnazioni Totali</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.active_assignments}</p>
                        <p className="text-sm text-foreground-muted">Assegnazioni Attive</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="w-8 h-8 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.total_hours_used}</p>
                        <p className="text-sm text-foreground-muted">Ore Utilizzate</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-center space-x-3">
                      <CurrencyEuroIcon className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">€{stats.total_revenue.toFixed(2)}</p>
                        <p className="text-sm text-foreground-muted">Revenue Totale</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-center space-x-3">
                      <ChartBarIcon className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.avg_completion_rate.toFixed(1)}%</p>
                        <p className="text-sm text-foreground-muted">Tasso Completamento</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-center space-x-3">
                      <CurrencyEuroIcon className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          €{stats.total_assignments > 0 ? (stats.total_revenue / stats.total_assignments).toFixed(2) : '0.00'}
                        </p>
                        <p className="text-sm text-foreground-muted">Revenue Media</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <ChartBarIcon className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                  <p className="text-foreground-muted">Statistiche non disponibili</p>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-border bg-muted/30">
          <Button variant="outline" onClick={onClose}>
            Chiudi
          </Button>
        </div>
      </div>
    </div>
  )
}
