'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCardIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'

interface Payment {
  id: number
  amount_cents: number
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'
  provider: string
  description?: string
  external_id?: string
  created_at: string
  updated_at: string
  user: {
    id: number
    email: string
    first_name?: string
    last_name?: string
    role: string
  }
  package?: {
    id: number
    name: string
    total_hours: number
  }
}

interface PaymentStats {
  total: number
  succeeded: number
  pending: number
  failed: number
  totalRevenue: number
  monthlyRevenue: number
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [stats, setStats] = useState<PaymentStats>({
    total: 0,
    succeeded: 0,
    pending: 0,
    failed: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [paymentsPerPage] = useState(15)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, statusFilter, dateFilter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      
      // Fetch payments from admin endpoint
      const response = await fetch('/api/proxy/payments/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Fetched payments:', data)
        setPayments(data)
        calculateStats(data)
      } else {
        console.error('Failed to fetch payments:', response.status)
        setPayments([])
        calculateStats([])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      setPayments([])
      calculateStats([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (paymentList: Payment[]) => {
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const stats = {
      total: paymentList.length,
      succeeded: paymentList.filter(p => p.status === 'succeeded').length,
      pending: paymentList.filter(p => p.status === 'pending' || p.status === 'processing').length,
      failed: paymentList.filter(p => p.status === 'failed').length,
      totalRevenue: paymentList
        .filter(p => p.status === 'succeeded')
        .reduce((sum, p) => sum + p.amount_cents, 0),
      monthlyRevenue: paymentList
        .filter(p => p.status === 'succeeded' && new Date(p.created_at) >= currentMonth)
        .reduce((sum, p) => sum + p.amount_cents, 0)
    }
    setStats(stats)
  }

  const filterPayments = () => {
    let filtered = payments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.external_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      let dateThreshold: Date

      switch (dateFilter) {
        case 'today':
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          dateThreshold = new Date(0)
      }

      filtered = filtered.filter(payment => new Date(payment.created_at) >= dateThreshold)
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setFilteredPayments(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }

  

  // Pagination
  const indexOfLastPayment = currentPage * paymentsPerPage
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment)
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const formatCurrency = (cents: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'refunded': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded': return <CheckCircleIcon className="w-5 h-5" />
      case 'pending': return <ClockIcon className="w-5 h-5" />
      case 'processing': return <ClockIcon className="w-5 h-5" />
      case 'failed': return <XCircleIcon className="w-5 h-5" />
      case 'cancelled': return <XCircleIcon className="w-5 h-5" />
      case 'refunded': return <BanknotesIcon className="w-5 h-5" />
      default: return <ClockIcon className="w-5 h-5" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'succeeded': return 'Completato'
      case 'pending': return 'In Attesa'
      case 'processing': return 'Elaborazione'
      case 'failed': return 'Fallito'
      case 'cancelled': return 'Annullato'
      case 'refunded': return 'Rimborsato'
      default: return status
    }
  }

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'stripe': return 'Stripe'
      case 'paypal': return 'PayPal'
      case 'bank_transfer': return 'Bonifico'
      case 'credit_card': return 'Carta di Credito'
      default: return provider
    }
  }

  const exportCSV = () => {
    const headers = ['ID', 'Data', 'Utente', 'Email', 'Importo', 'Stato', 'Provider', 'Descrizione']
    const csvContent = [
      headers.join(','),
      ...filteredPayments.map(payment => [
        payment.id,
        `"${formatDate(payment.created_at)}"`,
        `"${payment.user.first_name || ''} ${payment.user.last_name || ''}"`.trim(),
        `"${payment.user.email}"`,
        formatCurrency(payment.amount_cents, payment.currency),
        getStatusText(payment.status),
        getProviderName(payment.provider),
        `"${payment.description || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `pagamenti_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <RequireAuth>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-md w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      {user?.role === 'admin' ? (
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestione Pagamenti
              </h1>
              <p className="text-gray-600">
                Monitora e gestisci tutti i pagamenti della piattaforma
              </p>
            </div>
            
            <button
              onClick={exportCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              Esporta CSV
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCardIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Totale Pagamenti</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completati</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.succeeded}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Attesa</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BanknotesIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue Totale</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cerca per utente, email o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tutti gli stati</option>
                <option value="succeeded">Completati</option>
                <option value="pending">In Attesa</option>
                <option value="processing">Elaborazione</option>
                <option value="failed">Falliti</option>
                <option value="cancelled">Annullati</option>
                <option value="refunded">Rimborsati</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tutte le date</option>
                <option value="today">Oggi</option>
                <option value="week">Ultima settimana</option>
                <option value="month">Ultimo mese</option>
              </select>

              <div className="text-sm text-gray-600 flex items-center">
                <span>
                  Risultati: {filteredPayments.length} di {payments.length}
                </span>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {currentPayments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nessun pagamento trovato
                </h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                    ? 'Prova a modificare i filtri di ricerca.'
                    : 'Non ci sono pagamenti registrati.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pagamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Importo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provider
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{payment.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.description || 'Nessuna descrizione'}
                            </div>
                            {payment.external_id && (
                              <div className="text-xs text-gray-400">
                                ID: {payment.external_id}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-xs">
                                {payment.user.first_name?.[0] || payment.user.email[0].toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.user.first_name && payment.user.last_name 
                                  ? `${payment.user.first_name} ${payment.user.last_name}`
                                  : payment.user.email}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount_cents, payment.currency)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            <span className="ml-1">{getStatusText(payment.status)}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {getProviderName(payment.provider)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Dettagli
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-sm border">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Precedente
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Successivo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indexOfFirstPayment + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastPayment, filteredPayments.length)}
                    </span>{' '}
                    di <span className="font-medium">{filteredPayments.length}</span> risultati
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } ${pageNumber === 1 ? 'rounded-l-md' : ''} ${
                            pageNumber === totalPages ? 'rounded-r-md' : ''
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    })}
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details Modal */}
          {selectedPayment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Dettagli Pagamento #{selectedPayment.id}
                    </h2>
                    <button
                      onClick={() => setSelectedPayment(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircleIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Informazioni Pagamento</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Importo</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {formatCurrency(selectedPayment.amount_cents, selectedPayment.currency)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Stato</label>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedPayment.status)} mt-1`}>
                            {getStatusIcon(selectedPayment.status)}
                            <span className="ml-1">{getStatusText(selectedPayment.status)}</span>
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Provider</label>
                          <p className="mt-1 text-sm text-gray-900">{getProviderName(selectedPayment.provider)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">ID Esterno</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedPayment.external_id || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Informazioni Utente</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nome</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedPayment.user.first_name && selectedPayment.user.last_name 
                              ? `${selectedPayment.user.first_name} ${selectedPayment.user.last_name}`
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedPayment.user.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Ruolo</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedPayment.user.role}</p>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Timeline</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Data Creazione</label>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPayment.created_at)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Ultimo Aggiornamento</label>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPayment.updated_at)}</p>
                        </div>
                      </div>
                    </div>

                    {selectedPayment.description && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Descrizione</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedPayment.description}</p>
                      </div>
                    )}

                    {selectedPayment.package && (
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Pacchetto Associato</h3>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Nome:</span> {selectedPayment.package.name}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Ore Totali:</span> {selectedPayment.package.total_hours}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedPayment(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Chiudi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </RequireAuth>
  )
}
