import { CSSProperties } from 'react';

interface SkeletonProps {
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <output 
      className={`animate-pulse rounded-md bg-muted ${className}`}
      aria-label="Loading..."
      style={style}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { readonly rows?: number; readonly cols?: number }) {
  const headerCols = Array.from({ length: cols }, (_, i) => `header-col-${i + 1}`);
  const tableRows = Array.from({ length: rows }, (_, i) => ({
    id: `table-row-${i + 1}`,
    cells: Array.from({ length: cols }, (_, j) => `cell-${i + 1}-${j + 1}`)
  }));

  return (
    <div className="space-y-3">
      {/* Header skeleton */}
      <div className="flex space-x-4">
        {headerCols.map((colId) => (
          <Skeleton key={colId} className="h-4 w-24" />
        ))}
      </div>
      
      {/* Rows skeleton */}
      {tableRows.map((row) => (
        <div key={row.id} className="flex space-x-4">
          {row.cells.map((cellId) => (
            <Skeleton key={cellId} className="h-4 w-20" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border p-6 space-y-3">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
    </div>
  );
}

export function DashboardStatsSkeleton() {
  const statItems = Array.from({ length: 4 }, (_, i) => `stat-${i + 1}`);
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((statId) => (
        <div key={statId} className="rounded-lg border p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <Skeleton className="h-8 w-[80px]" />
          <Skeleton className="h-3 w-[100px] mt-2" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  const barHeights = Array.from({ length: 12 }, (_, i) => ({
    id: `chart-bar-${i + 1}`,
    height: `${Math.random() * 80 + 20}%`
  }));

  return (
    <div className="rounded-lg border p-6">
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-3 w-[150px]" />
      </div>
      <div className="h-[350px] w-full">
        <div className="flex items-end justify-between h-full space-x-2">
          {barHeights.map((bar) => (
            <Skeleton 
              key={bar.id} 
              className="w-full"
              style={{ height: bar.height }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function UserListSkeleton() {
  const userIds = Array.from({ length: 8 }, (_, i) => `user-skeleton-${i + 1}`);
  
  return (
    <div className="space-y-4">
      {userIds.map((userId) => (
        <div key={userId} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
          <div className="ml-auto flex space-x-2">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
