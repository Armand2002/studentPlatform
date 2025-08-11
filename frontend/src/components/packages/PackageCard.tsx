import Link from 'next/link'

export type PackageDto = {
  id: number
  tutor_id: number
  name: string
  description?: string | null
  total_hours: number
  price: number
  subject: string
}

interface PackageCardProps {
  pkg: PackageDto
  onPurchase?: (pkg: PackageDto) => void
}

export default function PackageCard({ pkg, onPurchase }: Readonly<PackageCardProps>) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-card">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900">{pkg.name}</h3>
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{pkg.subject}</span>
      </div>
      <p className="line-clamp-3 text-sm text-gray-600">{pkg.description || '—'}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          <div><span className="font-medium">Ore:</span> {pkg.total_hours}</div>
          <div><span className="font-medium">Prezzo:</span> € {Number(pkg.price).toFixed(2)}</div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/packages/${pkg.id}`} className="inline-flex h-9 items-center rounded-md border border-blue-200 px-3 text-xs text-blue-700 hover:bg-blue-50">Dettagli</Link>
          {onPurchase && (
            <button onClick={() => onPurchase(pkg)} className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-xs text-white hover:bg-primary-600">Acquista</button>
          )}
        </div>
      </div>
    </div>
  )
}


