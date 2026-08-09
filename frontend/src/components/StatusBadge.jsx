
function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();

  const styles = {
    open: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    claimed: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  const labels = {
    open: 'Open',
    claimed: 'Claimed',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5
        text-[11px] font-semibold uppercase tracking-wide
        ${styles[normalized] || 'bg-gray-100 text-gray-500 border-gray-200'}`}
    >
      { }
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full
          ${normalized === 'open' ? 'bg-emerald-500' : 'bg-gray-400'}`}
        aria-hidden="true"
      />
      {labels[normalized] || status}
    </span>
  );
}

export default StatusBadge;
