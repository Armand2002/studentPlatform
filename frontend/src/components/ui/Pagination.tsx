import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly pageSize: number;
  readonly onPageChange: (page: number) => void;
  readonly loading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  loading = false
}: PaginationProps) {
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage + 1 - delta);
      i <= Math.min(totalPages - 1, currentPage + 1 + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage + 1 - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + 1 + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      <div className="text-sm text-muted-foreground">
        Mostrando {startItem} - {endItem} di {totalItems} risultati
      </div>
      
      <div className="flex items-center gap-2">
        {/* First page */}
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0 || loading}
          className="p-2 rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          title="Prima pagina"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || loading}
          className="p-2 rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          title="Pagina precedente"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`dots-${index < 2 ? 'start' : 'end'}`} className="px-3 py-2 text-muted-foreground">
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber - 1 === currentPage;

            return (
              <button
                key={`page-${pageNumber}`}
                onClick={() => onPageChange(pageNumber - 1)}
                disabled={loading}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent disabled:opacity-50'
                  } disabled:cursor-not-allowed`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || loading}
          className="p-2 rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          title="Pagina successiva"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1 || loading}
          className="p-2 rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          title="Ultima pagina"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
