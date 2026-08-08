import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

/**
 * Computes a human-friendly relative time string like "2h ago" or "3d ago".
 */
function timeAgo(dateString) {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

/**
 * Color-coded top accent bar and type label based on lost vs found.
 * Lost  = red tones   (urgent "help me find it" feel)
 * Found = blue tones  (calm "I have it" feel)
 */
const TYPE_STYLES = {
  lost: {
    bar:   'bg-gradient-to-r from-red-400 to-red-500',
    label: 'text-red-600',
    bg:    'bg-red-50',
  },
  found: {
    bar:   'bg-gradient-to-r from-blue-400 to-blue-500',
    label: 'text-blue-600',
    bg:    'bg-blue-50',
  },
};

/**
 * ItemCard — displays a single item in the board grid.
 *
 * Renders: color-coded accent bar, thumbnail (or placeholder),
 * category badge, type label, title, description snippet,
 * location, time ago, and status badge.
 *
 * The entire card is a clickable link to /item/:id.
 */
function ItemCard({ item }) {
  const typeStyle = TYPE_STYLES[item.type] || TYPE_STYLES.lost;

  return (
    <Link
      to={`/item/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200
        bg-white shadow-sm transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md"
      aria-label={`View details for ${item.title}`}
    >
      {/* ── Color accent bar + category badge ──────────── */}
      <div className={`relative h-2 ${typeStyle.bar}`}>
        {item.category && (
          <span
            className="absolute right-3 top-2 rounded-full bg-white/90 px-2.5 py-0.5
              text-[11px] font-medium text-gray-600 shadow-sm backdrop-blur-sm"
          >
            {item.category}
          </span>
        )}
      </div>

      {/* ── Thumbnail ────────────────────────────────── */}
      {item.imageurl ? (
        <figure className="relative h-40 w-full overflow-hidden bg-gray-100">
          <img
            src={item.imageurl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300
              group-hover:scale-105"
          />
        </figure>
      ) : (
        /* Placeholder when no image — shows an icon on a tinted background */
        <figure className={`flex h-28 items-center justify-center ${typeStyle.bg}`}>
          <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
          </svg>
        </figure>
      )}

      {/* ── Card body ────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Type label + status */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold uppercase tracking-wider ${typeStyle.label}`}>
            {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
          </span>
          <StatusBadge status={item.status} />
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
          {item.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Meta row — location + time */}
        <div className="mt-auto flex items-center gap-4 border-t border-gray-100 pt-3 text-[11px] text-gray-400">
          <span className="flex min-w-0 items-center gap-1">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="truncate">{item.location}</span>
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Posted {timeAgo(item.createdat)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ItemCard;
