"use client"
import { useState, useEffect } from 'react'
import { 
  CreditCardIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import RequireAuth from '@/components/auth/RequireAuth'

interface Payment {
  id: string
  type: 'lesson' | 'package' | 'subscription'
  description: string
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  date: string
  method: 'card' | 'paypal' | 'bank_transfer'
  invoiceUrl?: string
  lessonId?: string
  packageId?: string
  tutorName?: string
  refundReason?: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'paypal'
  name: string
  last4?: string
  brand?: string
  isDefault: boolean
  expiryDate?: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')
  const [timeFilter, setTimeFilter] = useState<'all' | 'this_month' | 'last_month' | 'this_year'>('all')

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true)
        
        console.log('🔍 Fetching payment data from backend...')
        
        // Implementazione API payments in attesa di backend endpoint
        // const [payments, methods] = await Promise.all([
        //   paymentService.getPaymentHistory(),
        //   paymentService.getPaymentMethods()
        // ])
        
        // Per ora impostiamo array vuoti finché non implementiamo il backend
        setPayments([])
        setPaymentMethods([])
        
      } catch (err) {
        console.error('❌ Error fetching payment data:', err)
        setPayments([])
        setPaymentMethods([])
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentData()
  }, [])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'text-green-500 bg-green-500/10 border-green-500/20',
          icon: CheckCircleIcon,
          label: 'Completato'
        }
      case 'pending':
        return {
          color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
          icon: ClockIcon,
          label: 'In elaborazione'
        }
      case 'failed':
        return {
          color: 'text-red-500 bg-red-500/10 border-red-500/20',
          icon: XCircleIcon,
          label: 'Fallito'
        }
      case 'refunded':
        return {
          color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
          icon: ExclamationTriangleIcon,
          label: 'Rimborsato'
        }
      default:
        return {
          color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
          icon: ClockIcon,
          label: 'Sconosciuto'
        }
    }
  }

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return CreditCardIcon
      case 'paypal':
        return BanknotesIcon
      default:
        return CreditCardIcon
    }
  }

  const filterByDate = (payment: Payment) => {
    const paymentDate = new Date(payment.date)
    const now = new Date()
    
    switch (timeFilter) {
      case 'this_month':
        return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear()
      case 'last_month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
        return paymentDate.getMonth() === lastMonth.getMonth() && paymentDate.getFullYear() === lastMonth.getFullYear()
      }
      case 'this_year':
        return paymentDate.getFullYear() === now.getFullYear()
      default:
        return true
    }
  }

  const filteredPayments = payments
    .filter(payment => filter === 'all' || payment.status === filter)
    .filter(filterByDate)

  const totalSpent = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

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
            <h1 className="text-2xl font-bold text-foreground">Pagamenti</h1>
            <p className="text-foreground-muted">
              Gestisci i tuoi pagamenti e metodi di pagamento
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <PlusIcon className="h-4 w-4" />
            Aggiungi Metodo
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">€{totalSpent.toFixed(2)}</div>
            <div className="text-sm text-foreground-muted">Totale speso</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{filteredPayments.filter(p => p.status === 'completed').length}</div>
            <div className="text-sm text-foreground-muted">Pagamenti completati</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{filteredPayments.filter(p => p.status === 'pending').length}</div>
            <div className="text-sm text-foreground-muted">In elaborazione</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{paymentMethods.length}</div>
            <div className="text-sm text-foreground-muted">Metodi salvati</div>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Metodi di Pagamento</h2>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">
              Gestisci tutti
            </button>
          </div>
          
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCardIcon className="h-12 w-12 text-foreground-muted mx-auto mb-3" />
              <p className="text-foreground-muted">
                Non hai ancora salvato nessun metodo di pagamento
              </p>
              <button className="mt-3 text-primary hover:text-primary/80 text-sm font-medium">
                Aggiungi il primo metodo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentMethods.map((method) => {
                const MethodIcon = getPaymentMethodIcon(method.type)
                return (
                  <div
                    key={method.id}
                    className="p-4 border border-border rounded-lg hover:bg-background-secondary transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <MethodIcon className="h-6 w-6 text-foreground-secondary" />
                      {method.isDefault && (
                        <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                          Predefinito
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-foreground">{method.name}</div>
                    {method.last4 && (
                      <div className="text-xs text-foreground-muted">•••• {method.last4}</div>
                    )}
                    {method.expiryDate && (
                      <div className="text-xs text-foreground-muted">Scade {method.expiryDate}</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-foreground-secondary">Stato:</span>
              {[
                { key: 'all', label: 'Tutti' },
                { key: 'completed', label: 'Completati' },
                { key: 'pending', label: 'In elaborazione' },
                { key: 'failed', label: 'Falliti' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    filter === filterOption.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-background-secondary text-foreground-muted hover:bg-background-secondary/80"
                  )}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-foreground-secondary">Periodo:</span>
              {[
                { key: 'all', label: 'Tutti' },
                { key: 'this_month', label: 'Questo mese' },
                { key: 'last_month', label: 'Mese scorso' },
                { key: 'this_year', label: 'Quest\'anno' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setTimeFilter(filterOption.key as any)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    timeFilter === filterOption.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-background-secondary text-foreground-muted hover:bg-background-secondary/80"
                  )}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Payment History */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Storico Pagamenti</h2>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground-secondary rounded-md hover:bg-background-secondary transition-colors">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Esporta
            </button>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <BanknotesIcon className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nessun pagamento trovato
              </h3>
              <p className="text-foreground-muted mb-6">
                Non ci sono pagamenti per i filtri selezionati.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => {
                const statusConfig = getStatusConfig(payment.status)
                const StatusIcon = statusConfig.icon

                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-background-secondary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-background-secondary rounded-lg">
                        {payment.type === 'lesson' && <CalendarDaysIcon className="h-5 w-5 text-blue-500" />}
                        {payment.type === 'package' && <span className="text-lg">📦</span>}
                        {payment.type === 'subscription' && <span className="text-lg">⭐</span>}
                      </div>
                      
                      <div>
                        <div className="font-medium text-foreground">{payment.description}</div>
                        <div className="text-sm text-foreground-muted">
                          {new Date(payment.date).toLocaleDateString('it-IT', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          {payment.tutorName && ` • ${payment.tutorName}`}
                        </div>
                        {payment.refundReason && (
                          <div className="text-sm text-blue-600 mt-1">
                            Rimborso: {payment.refundReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          {payment.status === 'refunded' && '- '}
                          €{payment.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-foreground-muted capitalize">
                          {payment.method.replace('_', ' ')}
                        </div>
                      </div>

                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full border",
                        statusConfig.color
                      )}>
                        <StatusIcon className="h-3 w-3 inline mr-1" />
                        {statusConfig.label}
                      </span>

                      {payment.invoiceUrl && (
                        <a
                          href={payment.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-foreground-muted hover:text-foreground transition-colors"
                          title="Scarica fattura"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </RequireAuth>
  )
}
