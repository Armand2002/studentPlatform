'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  BookOpenIcon, 
  ClockIcon, 
  UserIcon, 
  AcademicCapIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CogIcon,
  InboxIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import { useForm } from '@/hooks/useForm'
import PackageManagementModal from '@/components/admin/PackageManagementModal'

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

interface Tutor {
  id: number
  first_name: string
  last_name: string
  email: string
  subjects: string
}

interface PackageRequest {
  id: string
  tutor_name: string
  tutor_email: string
  name: string
  subject: string
  total_hours: number
  description: string
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
}

interface PackageCreateData {
  name: string
  subject: string
  description: string
  total_hours: number
  price: number
  tutor_id: number
}

interface PricingRule {
  id: number
  name: string
  lesson_type: string
  subject: string
  base_price_per_hour: number
  tutor_percentage: number
}

export default function PackagesAdminPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [packageRequests, setPackageRequests] = useState<PackageRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'packages' | 'requests' | 'create'>('packages')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form for package creation
  const { formState: { data: formData, loading: creating, success, error: formError }, updateField, handleSubmit } = useForm<PackageCreateData>({
    name: '',
    subject: '',
    description: '',
    total_hours: 10,
    price: 0,
    tutor_id: 0
  }, {
    resetOnSuccess: true,
    successMessage: 'Pacchetto creato con successo!'
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [packagesRes, tutorsRes] = await Promise.all([
        api.get('/api/packages'),
        api.get('/api/users/tutors')
      ])
      
      // Temporarily disable package requests to avoid 500 errors
      const requestsRes = { data: [] }
      
      setPackages(packagesRes.data || [])
      setTutors(tutorsRes.data || [])
      setPackageRequests(requestsRes.data || [])
      
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const calculateAutomaticPrice = (subject: string, hours: number) => {
    // Pricing automatico basato su regole (simulato per ora)
    const baseRates: Record<string, number> = {
      'matematica': 25,
      'fisica': 28,
      'chimica': 26,
      'inglese': 22,
      'italiano': 20,
      'storia': 18,
      'filosofia': 20,
      'biologia': 24,
      'informatica': 30
    }
    
    const rate = baseRates[subject.toLowerCase()] || 25
    return rate * hours
  }

  const handleSubjectChange = (subject: string) => {
    updateField('subject', subject)
    if (subject && formData.total_hours) {
      const autoPrice = calculateAutomaticPrice(subject, formData.total_hours)
      updateField('price', autoPrice)
    }
  }

  const handleHoursChange = (hours: number) => {
    updateField('total_hours', hours)
    if (formData.subject && hours) {
      const autoPrice = calculateAutomaticPrice(formData.subject, hours)
      updateField('price', autoPrice)
    }
  }

  const createPackage = async (data: PackageCreateData) => {
    await api.post('/api/admin/packages', data)
    await fetchData() // Refresh packages list
    setActiveTab('packages')
  }

  const approveRequest = async (requestId: string) => {
    try {
      await api.post(`/api/admin/package-requests/${requestId}/approve`)
      await fetchData() // Refresh data
    } catch (err) {
      console.error('Error approving request:', err)
      setError('Errore nell\'approvazione della richiesta')
    }
  }

  const rejectRequest = async (requestId: string, reason: string) => {
    try {
      await api.post(`/api/admin/package-requests/${requestId}/reject`, { reason })
      await fetchData() // Refresh data
    } catch (err) {
      console.error('Error rejecting request:', err)
      setError('Errore nel rifiuto della richiesta')
    }
  }

  const togglePackageStatus = async (packageId: number, currentStatus: boolean) => {
    try {
      // Toggle package active status
      await api.put(`/api/admin/packages/${packageId}`, {
        is_active: !currentStatus
      })
      await fetchData() // Refresh packages list
    } catch (err) {
      console.error('Error toggling package status:', err)
      setError('Errore nel cambiamento stato pacchetto')
    }
  }

  const managePackage = (packageId: number) => {
    const pkg = packages.find(p => p.id === packageId)
    if (pkg) {
      setSelectedPackage(pkg)
      setIsModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPackage(null)
  }

  const handlePackageUpdate = () => {
    fetchData() // Refresh packages list
  }

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pkg.tutor ? `${pkg.tutor.first_name} ${pkg.tutor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) : false)
  )


  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-background-secondary rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-background-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gestione Pacchetti (Admin)
        </h1>
        <p className="text-foreground-secondary">
          Controllo centralizzato per creazione e gestione pacchetti. Solo gli admin possono creare pacchetti.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpenIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-foreground-muted">Pacchetti Totali</p>
              <p className="text-2xl font-semibold text-foreground">{packages.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-foreground-muted">Pacchetti Attivi</p>
              <p className="text-2xl font-semibold text-foreground">
                {packages.filter(p => p.is_active).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <AcademicCapIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-foreground-muted">Tutor Attivi</p>
              <p className="text-2xl font-semibold text-foreground">{tutors.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <InboxIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-foreground-muted">Richieste Pending</p>
              <p className="text-2xl font-semibold text-foreground">{packageRequests.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'packages', label: 'Pacchetti', icon: BookOpenIcon },
            { id: 'requests', label: 'Richieste Tutor', icon: InboxIcon, badge: packageRequests.length },
            { id: 'create', label: 'Crea Pacchetto', icon: PlusIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <Badge className="bg-orange-100 text-orange-800 text-xs">
                  {tab.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted" />
              <input
                type="text"
                placeholder="Cerca pacchetti, materie o tutor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <Button
              onClick={() => setActiveTab('create')}
              className="bg-primary hover:bg-primary/80"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Nuovo Pacchetto
            </Button>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map(pkg => (
              <Card key={pkg.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-foreground-muted">
                      {pkg.subject} • {pkg.total_hours} ore
                    </p>
                  </div>
                  <Badge className={pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {pkg.is_active ? 'Attivo' : 'Inattivo'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-foreground-muted">
                    <CurrencyEuroIcon className="w-4 h-4 mr-2" />
                    <span className="font-medium text-foreground">€{pkg.price}</span>
                    <span className="ml-2">(€{(pkg.price / pkg.total_hours).toFixed(0)}/ora)</span>
                  </div>

                  <div className="flex items-center text-sm text-foreground-muted">
                    <UserIcon className="w-4 h-4 mr-2" />
                    <span>
                      {pkg.tutor ? 
                        `${pkg.tutor.first_name} ${pkg.tutor.last_name}` : 
                        'Nessun tutor assegnato'
                      }
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-foreground-muted">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    <span>Creato il {new Date(pkg.created_at).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => managePackage(pkg.id)}
                    >
                      <CogIcon className="w-4 h-4 mr-1" />
                      Gestisci
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={pkg.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                      onClick={() => togglePackageStatus(pkg.id, pkg.is_active)}
                    >
                      {pkg.is_active ? 'Disattiva' : 'Attiva'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6">
          {packageRequests.length === 0 ? (
            <Card className="p-6 text-center">
              <InboxIcon className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nessuna richiesta pending
              </h3>
              <p className="text-foreground-muted">
                Le richieste dei tutor per nuovi pacchetti appariranno qui.
              </p>
              <div className="mt-4 text-sm text-foreground-muted">
                <p>💡 I tutor possono richiedere pacchetti tramite la loro dashboard</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {packageRequests.map(request => (
                <Card key={request.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {request.name}
                        </h3>
                        <Badge className="bg-orange-100 text-orange-800">
                          {request.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-foreground-muted">Tutor</p>
                          <p className="font-medium text-foreground">{request.tutor_name}</p>
                          <p className="text-xs text-foreground-muted">{request.tutor_email}</p>
                        </div>
                        
                        <div>
                          <p className="text-foreground-muted">Materia</p>
                          <p className="font-medium text-foreground capitalize">{request.subject}</p>
                        </div>
                        
                        <div>
                          <p className="text-foreground-muted">Ore Richieste</p>
                          <p className="font-medium text-foreground">{request.total_hours} ore</p>
                          <p className="text-xs text-foreground-muted">
                            Prezzo stimato: €{calculateAutomaticPrice(request.subject, request.total_hours)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-foreground-muted text-sm mb-1">Descrizione:</p>
                        <p className="text-foreground text-sm">{request.description}</p>
                      </div>
                      
                      <div className="text-xs text-foreground-muted">
                        Richiesta inviata il {new Date(request.requested_at).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                    
                    <div className="ml-6 flex flex-col space-y-2">
                      <Button
                        onClick={() => approveRequest(request.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Approva
                      </Button>
                      <Button
                        onClick={() => rejectRequest(request.id, "Richiesta non conforme ai criteri")}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        Rifiuta
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Crea Nuovo Pacchetto
              </h2>
              <p className="text-foreground-muted">
                Crea un pacchetto per un tutor con pricing automatico basato sulle regole tariffarie.
              </p>
            </div>

            <form onSubmit={handleSubmit(createPackage)} className="space-y-6">
              {/* Tutor Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tutor Assegnato *
                </label>
                <select
                  value={formData.tutor_id}
                  onChange={(e) => updateField('tutor_id', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="" className="text-gray-500">Seleziona un tutor</option>
                  {tutors.map(tutor => (
                    <option key={tutor.id} value={tutor.id} className="text-gray-900">
                      {tutor.first_name} {tutor.last_name} - {tutor.subjects}
                    </option>
                  ))}
                </select>
              </div>

              {/* Package Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome Pacchetto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="es. Matematica Avanzata - Liceo Scientifico"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Materia *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Es: Matematica, Fisica, Inglese..."
                  required
                />
                <p className="text-xs text-foreground-muted mt-1">
                  Il prezzo verrà calcolato automaticamente per le materie standard (Matematica, Fisica, Chimica, ecc.)
                </p>
              </div>

              {/* Hours and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ore Totali *
                  </label>
                  <select
                    value={formData.total_hours}
                    onChange={(e) => handleHoursChange(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value={5}>5 ore</option>
                    <option value={10}>10 ore</option>
                    <option value={15}>15 ore</option>
                    <option value={20}>20 ore</option>
                    <option value={30}>30 ore</option>
                    <option value={40}>40 ore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Prezzo Totale *
                  </label>
                  <div className="relative">
                    <CurrencyEuroIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateField('price', parseFloat(e.target.value))}
                      className="w-full pl-10 pr-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  {formData.total_hours > 0 && formData.price > 0 && (
                    <p className="text-xs text-foreground-muted mt-1">
                      €{(formData.price / formData.total_hours).toFixed(2)}/ora
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descrizione *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Descrivi il contenuto del pacchetto, obiettivi di apprendimento, livello..."
                  required
                />
              </div>

              {/* Pricing Info */}
                {Boolean(formData.subject && formData.total_hours) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Pricing Automatico Applicato</p>
                      <p>
                        Tariffa base: €{calculateAutomaticPrice(formData.subject, 1)}/ora • 
                        Totale: €{calculateAutomaticPrice(formData.subject, formData.total_hours)} • 
                        Tutor riceve: 70% (€{(calculateAutomaticPrice(formData.subject, formData.total_hours) * 0.7).toFixed(0)})
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <XCircleIcon className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-800">{formError}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800">Pacchetto creato con successo!</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('packages')}
                  className="flex-1"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-primary hover:bg-primary/80"
                >
                  {creating ? 'Creazione...' : 'Crea Pacchetto'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}


      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Package Management Modal */}
      {selectedPackage && (
        <PackageManagementModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          packageData={selectedPackage}
          onPackageUpdate={handlePackageUpdate}
        />
      )}
    </div>
  )
}
