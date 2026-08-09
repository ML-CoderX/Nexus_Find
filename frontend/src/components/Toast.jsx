import { useEffect, useState } from 'react';


function Toast({ message, type = 'success', onClose, duration = 5000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const isSuccess = type === 'success';

  return (
    <aside
      role="status"
      aria-live="polite"
      className={`fixed right-6 top-6 z-50 flex max-w-sm items-start gap-3 rounded-xl
        border px-5 py-4 shadow-lg transition-all duration-300
        ${isSuccess
          ? 'border-green-200 bg-green-50 text-green-800'
          : 'border-red-200 bg-red-50 text-red-800'
        }`}
    >
      {/* Icon */}
      <span className="mt-0.5 text-lg" aria-hidden="true">
        {isSuccess ? '✓' : '✕'}
      </span>

      <p className="flex-1 text-sm font-medium">{message}</p>

      <button
        type="button"
        onClick={() => { setVisible(false); onClose(); }}
        className="ml-2 text-lg leading-none opacity-50 hover:opacity-100"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </aside>
  );
}

export default Toast;
