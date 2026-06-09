'use client';

import Button from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-black"
          style={{
            background: 'var(--accent-soft)',
            borderColor: 'var(--border-accent)',
            color: 'var(--accent)',
          }}
        >
          {page}
        </span>

        <p
          className="text-sm font-semibold"
          style={{ color: 'var(--text-muted)' }}
        >
          Page{' '}
          <span style={{ color: 'var(--text-primary)' }}>{page}</span> of{' '}
          <span style={{ color: 'var(--text-primary)' }}>{totalPages}</span>
        </p>
      </div>

      <div
        className="flex items-center gap-2 rounded-2xl border p-1"
        style={{
          background: 'var(--bg-surface-soft)',
          borderColor: 'var(--border)',
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          disabled={!canGoPrev}
          onClick={() => onPageChange(page - 1)}
        >
          ← Prev
        </Button>

        <div
          className="hidden h-8 items-center rounded-xl border px-3 text-xs font-black sm:flex"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          {page} / {totalPages}
        </div>

        <Button
          variant="secondary"
          size="sm"
          disabled={!canGoNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next →
        </Button>
      </div>
    </div>
  );
}