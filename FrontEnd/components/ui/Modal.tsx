'use client';

import Button from './Button';

interface ModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

const Modal = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] border p-6"
        style={{
          background: 'var(--card-bg)',
          borderColor: danger ? 'rgba(255, 77, 79, 0.30)' : 'var(--border)',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.35)',
          backdropFilter: 'var(--blur)',
          WebkitBackdropFilter: 'var(--blur)',
        }}
      >
        {/* Glow */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl"
          style={{
            background: danger ? 'var(--danger-soft)' : 'var(--accent-soft)',
          }}
        />

        {/* Close */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-black transition-all hover:-translate-y-0.5"
          style={{
            background: 'var(--bg-surface-soft)',
            borderColor: 'var(--border)',
            color: 'var(--text-muted)',
          }}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="relative z-10 pr-10">
          <div
            className="mb-4 flex h-13 w-13 items-center justify-center rounded-2xl text-2xl font-black"
            style={{
              width: '52px',
              height: '52px',
              background: danger ? 'var(--danger-soft)' : 'var(--accent-soft)',
              color: danger ? 'var(--danger)' : 'var(--accent)',
            }}
          >
            {danger ? '!' : '✓'}
          </div>

          <h3
            className="text-xl font-black leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h3>

          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {message}
          </p>
        </div>

        <div
          className="relative z-10 mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
        >
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>

          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;