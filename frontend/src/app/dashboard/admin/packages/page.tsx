'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PlusIcon, MagnifyingGlassIcon, BookOpenIcon, ClockIcon, UserIcon, AcademicCapIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { packageService, PackageData } from '@/lib/api-services/packages'
import { getCurrentTutorProfile, getMe, getTutors } from '@/lib/api'

export default function PackagesAdminPage() {
  const [packages, setPackages] = useState<PackageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [isTutor, setIsTutor] = useState(false)
  const [tutorId, setTutorId] = useState<number | undefined>(undefined)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tutors, setTutors] = useState<Array<any>>([])
  const [searchTerm, setSearchTerm] = useState('')

  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await packageService.getPackages({ page: 1, limit: 200 })
      // apiRequest wrapper may return { data, meta } or array depending on implementation
      const data = (res as any).data || (res as any)
      setPackages(data)
    } catch (err) {
      console.error('Error fetching packages', err)
      setError('Impossibile caricare i pacchetti')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const me = await getMe()
        const role = (me as any)?.role
        if (role === 'tutor') {
          setIsTutor(true)
          try {
            const t = await getCurrentTutorProfile()
            setTutorId((t as any)?.id)
          } catch (err) {
            console.debug('No tutor profile', err)
          }
        }
        if (role === 'admin') {
          setIsAdmin(true)
          // fetch tutors list for admin to choose from
          try {
            const ts = await getTutors(200)
            setTutors(ts as any || [])
          } catch (err) {
            console.debug('Failed fetching tutors', err)
          }
        }
      } catch (err) {
        console.debug('getMe failed', err)
      }
      fetchPackages()
    }
    init()
  }, [])

  const handleDeactivate = async (id: string) => {
    try {
      await packageService.deactivatePackage(id)
      await fetchPackages()
    } catch (err) {
      console.error('Error deactivating package', err)
      setError('Errore durante la disattivazione del pacchetto')
    }
  }

  const filtered = packages.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  let content: JSX.Element
  if (loading) {
    content = (
      <div className="grid gap-4">
        {[1,2,3].map(i => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-background-secondary rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-background-secondary rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-background-secondary rounded w-2/3"></div>
          </Card>
        ))}
      </div>
    )
  } else if (filtered.length === 0) {
    content = (
      <Card className="p-12 text-center">
        <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Nessun pacchetto trovato</h3>
        <p className="text-slate-700">{searchTerm ? 'Prova a modificare la ricerca.' : 'Crea il primo pacchetto.'}</p>
      </Card>
    )
  } else {
    content = (
      <div className="grid gap-4">
        {filtered.map((pkg) => (
          <Card key={pkg.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <h3 className="text-lg font-medium text-slate-900">{pkg.name}</h3>
                  <Badge className={pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {pkg.isActive ? 'Attivo' : 'Disattivato'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-foreground-muted" />
                    <div>
                      <p className="font-medium text-foreground">Tutor</p>
                      <p className="text-foreground-muted">{(pkg as any).assignedTutor?.firstName || (pkg as any).assignedTutor?.first_name || '—' } {(pkg as any).assignedTutor?.lastName || (pkg as any).assignedTutor?.last_name || ''}</p>
                      <p className="text-xs text-foreground-muted">{(pkg as any).assignedTutor?.email || ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-foreground-muted" />
                    <div>
                      <p className="font-medium text-foreground">Ore Totali</p>
                      <p className="text-foreground-muted">{pkg.totalHours}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <BookOpenIcon className="w-4 h-4 text-foreground-muted" />
                    <div>
                      <p className="font-medium text-foreground">Prezzo</p>
                      <p className="text-foreground-muted">€{(typeof pkg.price === 'number' ? pkg.price.toFixed(2) : String(pkg.price))}</p>
                    </div>
                  </div>
                </div>

                {pkg.description && (
                  <p className="mt-4 text-sm text-foreground-muted">{pkg.description}</p>
                )}

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center space-x-4 text-xs text-foreground-muted">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Creata il {pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString('it-IT') : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ml-4 flex items-center justify-center">
                <Button variant="danger" onClick={() => handleDeactivate(pkg.id)}>Disattiva</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pacchetti</h1>
            <p className="text-slate-700">Gestisci i pacchetti disponibili ({packages.length})</p>
          </div>

          <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/80" disabled={!(isTutor || isAdmin)} title={!(isTutor || isAdmin) ? 'Solo i tutor o gli admin possono creare pacchetti.' : undefined}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Nuovo Pacchetto
          </Button>
        </div>

        <div className="flex space-x-4 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-700" />
            <input
              type="text"
              placeholder="Cerca per nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 placeholder-slate-700"
            />
          </div>
        </div>
      </div>

      {error && (
        <Card className="p-4 mb-6 border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {content}

      {showCreate && (isTutor || isAdmin) && (
        <CreatePackageModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchPackages(); }} tutorId={tutorId} isAdmin={isAdmin} tutors={tutors} />
      )}
    </div>
  )
}

function CreatePackageModal({ onClose, onCreated, tutorId, isAdmin, tutors }: { onClose: () => void; onCreated: () => void; tutorId?: number; isAdmin?: boolean; tutors?: Array<any> }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [totalHours, setTotalHours] = useState<number | ''>('')
  const [price, setPrice] = useState<number | ''>('')
  const [selectedTutorId, setSelectedTutorId] = useState<number | undefined>(tutorId)
  const [creating, setCreating] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !totalHours || price === '') return
    setCreating(true)
    try {
      const payload = {
        name,
        description,
        totalHours: Number(totalHours),
        price: Number(price),
        durationDays: 365,
        subjects: [] as string[],
        tutorId: typeof selectedTutorId !== 'undefined' ? selectedTutorId : undefined,
      }

      if (isAdmin) {
        await packageService.createPackageAsAdmin(payload as any)
      } else {
        await packageService.createPackage(payload as any)
      }
      onCreated()
    } catch (err) {
      console.error('Error creating package', err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl mx-4 p-6 max-h-[90vh] overflow-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Nuovo Pacchetto</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
        <label htmlFor="pkg-name" className="block text-sm font-semibold text-slate-900 mb-1">Nome</label>
              <input id="pkg-name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 placeholder-slate-500" />
          </div>

          <div>
        <label htmlFor="pkg-description" className="block text-sm font-semibold text-slate-900 mb-1">Descrizione</label>
        <textarea id="pkg-description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 placeholder-slate-500" rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pkg-hours" className="block text-sm font-semibold text-slate-900 mb-1">Ore Totali</label>
              <input id="pkg-hours" type="number" value={totalHours} onChange={(e) => setTotalHours(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 placeholder-slate-500" />
            </div>

            <div>
              <label htmlFor="pkg-price" className="block text-sm font-medium text-slate-900 mb-1">Prezzo (euro, es. 12.50)</label>
              <input id="pkg-price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 placeholder-slate-500" />
            </div>
          </div>

          {isAdmin && (
            <div>
              <label htmlFor="pkg-tutor" className="block text-sm font-medium text-slate-900 mb-1">Seleziona Tutor</label>
              <select id="pkg-tutor" value={selectedTutorId ?? ''} onChange={(e) => setSelectedTutorId(e.target.value === '' ? undefined : Number(e.target.value))} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900">
                <option value="">-- Scegli un tutor --</option>
                {(tutors || []).map((t: any) => (
                  <option key={t.id} value={t.id} className="text-slate-900">{t.first_name || t.firstName || t.email}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">Annulla</Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/80" disabled={creating}>{creating ? 'Creazione...' : 'Crea Pacchetto'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}


