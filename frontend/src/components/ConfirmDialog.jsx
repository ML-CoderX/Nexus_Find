import { useState, useCallback } from 'react';

/**
 * ConfirmDialog — a modal overlay with a confirm/cancel choice.
 *
 * Props:
 *   title       – dialog heading
 *   message     – body text
 *   confirmText – label for the confirm button (default "Confirm")
 *   variant     – "danger" | "default" — controls confirm button color
 *   loading     – disables buttons and shows spinner while an action runs
 *   onConfirm   – callback when the user confirms
 *   onCancel    – callback when the user cancels / clicks backdrop
 */
function ConfirmDialog({
  title,
  message,
  confirmText = 'Confirm',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const confirmClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-brand-500 hover:bg-brand-600 text-white';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-bold text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-gray-500">{message}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary !py-2 !px-4 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2
              text-sm font-semibold transition-all duration-200
              disabled:cursor-not-allowed disabled:opacity-50 ${confirmClass}`}
          >
            {loading && (
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                aria-hidden="true"
              />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * useConfirmDialog — convenience hook that manages open/close state
 * for a ConfirmDialog. Returns { isOpen, open, close, ConfirmDialogComponent }.
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return { isOpen, open, close };
}

export default ConfirmDialog;
