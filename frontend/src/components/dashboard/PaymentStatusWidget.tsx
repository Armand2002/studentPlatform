"use client"
import { useState, useEffect } from 'react'
import { 
  CreditCardIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface PaymentData {
  id: string
  amount: number
  description: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  date: string
  dueDate?: string
  method: 'card' | 'bank_transfer' | 'paypal' | 'cash'
  packageName?: string
  isOverdue: boolean
}

interface PaymentStatusWidgetProps {
  className?: string
}

const statusConfig = {
  completed: {
    color: 'text-green-500 bg-green-500/10 border-green-500/20',
    icon: CheckCircleIcon,
    label: 'Completato'
  },
  pending: {
    color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    icon: ClockIcon,
    label: 'In attesa'
  },
  failed: {
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    icon: XCircleIcon,
    label: 'Fallito'
  },
  refunded: {
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    icon: CheckCircleIcon,
    label: 'Rimborsato'
  }
}

const methodIcons = {
  card: CreditCardIcon,
  bank_transfer: BanknotesIcon,
  paypal: CreditCardIcon,
  cash: BanknotesIcon
}

const methodLabels = {
  card: 'Carta',
  bank_transfer: 'Bonifico',
  paypal: 'PayPal',
  cash: 'Contanti'
}

export default function PaymentStatusWidget({ className }: PaymentStatusWidgetProps) {
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // API call per ottenere lo stato dei pagamenti
    const fetchPayments = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 Fetching payments from backend...')
        
        // Chiama l'endpoint per ottenere i pagamenti dello studente
        const token = localStorage.getItem('access_token')
        if (!token) {
          console.warn('⚠️ No token found, user not authenticated')
          setPayments([])
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const paymentsData = await response.json()
        
        // Trasforma i dati dal backend nel formato richiesto dal componente
        const transformedPayments: PaymentData[] = paymentsData.map((payment: any) => {
          const paymentDate = new Date(payment.created_at || payment.date)
          const dueDate = payment.due_date ? new Date(payment.due_date) : null
          const isOverdue = dueDate ? dueDate < new Date() && payment.status === 'pending' : false

          return {
            id: payment.id.toString(),
            amount: payment.amount ?? null,
            description: payment.description || `Pagamento per ${payment.package_name || 'servizio'}`,
            status: payment.status || 'pending',
            date: payment.created_at || payment.date,
            dueDate: payment.due_date,
            method: payment.payment_method || 'card',
            packageName: payment.package_name,
            isOverdue
          }
        })
        
        setPayments(transformedPayments)
        
      } catch (err) {
        console.error('❌ Error fetching payments:', err)
        setError('Errore nel caricamento dei pagamenti dal backend.')
        setPayments([])
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)

  const overdueAmount = payments
    .filter(p => p.isOverdue)
    .reduce((sum, p) => sum + p.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  const getMethodIcon = (method: string) => {
    const IconComponent = methodIcons[method as keyof typeof methodIcons] || CreditCardIcon
    return <IconComponent className="h-3 w-3" />
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
          <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Errore nel caricamento pagamenti</p>
          <p className="text-xs text-foreground-muted">{error}</p>
        </div>
      </Card>
    )
  }

  const completedPayments = payments.filter(p => p.status === 'completed')
  const pendingPayments = payments.filter(p => p.status === 'pending')
  const failedPayments = payments.filter(p => p.status === 'failed')

  return (
    <Card className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-primary" />
            Stato Pagamenti
          </h3>
          <p className="text-sm text-foreground-muted">
            {payments.length} transazione{payments.length !== 1 ? 'i' : ''} totali
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{formatCurrency(totalSpent)}</div>
          <div className="text-xs text-foreground-muted">Speso</div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
          <div className="text-lg font-bold text-green-500">
            {completedPayments.length}
          </div>
          <div className="text-xs text-foreground-muted">Completati</div>
        </div>
        <div className="text-center p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
          <div className="text-lg font-bold text-yellow-500">
            {pendingPayments.length}
          </div>
          <div className="text-xs text-foreground-muted">In attesa</div>
        </div>
        <div className="text-center p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
          <div className="text-lg font-bold text-red-500">
            {failedPayments.length}
          </div>
          <div className="text-xs text-foreground-muted">Falliti</div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="mb-6 p-4 bg-background-secondary/50 border border-border rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <ArrowTrendingUpIcon className="h-4 w-4 text-primary" />
          Panoramica Finanziaria
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground-muted">Totale speso:</span>
            <span className="font-medium text-green-500">{formatCurrency(totalSpent)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-muted">In attesa:</span>
            <span className="font-medium text-yellow-500">{formatCurrency(pendingAmount)}</span>
          </div>
          {overdueAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-foreground-muted">Scaduti:</span>
              <span className="font-medium text-red-500">{formatCurrency(overdueAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground mb-3">Transazioni Recenti</h4>
        {payments.slice(0, 4).map((payment) => {
          const statusConfig = getStatusConfig(payment.status)
          const StatusIcon = statusConfig.icon

          return (
            <div 
              key={payment.id}
              className={cn(
                "p-3 rounded-lg border transition-all duration-200",
                payment.isOverdue 
                  ? "border-red-500/30 bg-red-500/5" 
                  : "border-border bg-background-secondary/30"
              )}
            >
              {/* Payment Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-medium text-foreground text-sm">{payment.description}</h5>
                  {payment.packageName && (
                    <p className="text-xs text-foreground-muted">{payment.packageName}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full border flex items-center gap-1",
                    statusConfig.color
                  )}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </span>
                  {payment.isOverdue && (
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="flex items-center justify-between text-xs text-foreground-muted">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    {getMethodIcon(payment.method)}
                    {methodLabels[payment.method as keyof typeof methodLabels]}
                  </span>
                  <span>{formatDate(payment.date)}</span>
                  {payment.dueDate && (
                    <span className={cn(
                      payment.isOverdue ? "text-red-500" : "text-foreground-muted"
                    )}>
                      Scadenza: {formatDate(payment.dueDate)}
                    </span>
                  )}
                </div>
                <div className="font-medium text-foreground">
                  {formatCurrency(payment.amount)}
                </div>
              </div>

              {/* Overdue Warning */}
              {payment.isOverdue && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-600">
                  ⚠️ Pagamento scaduto! Completa il pagamento per evitare sospensioni.
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 text-xs font-medium text-primary border border-primary/20 rounded-md hover:bg-primary/10 transition-colors">
            Completa Pagamento
          </button>
          <button className="flex-1 px-3 py-2 text-xs font-medium text-foreground-secondary border border-border rounded-md hover:bg-background-secondary transition-colors">
            Storico Completo
          </button>
        </div>
      </div>
    </Card>
  )
}
