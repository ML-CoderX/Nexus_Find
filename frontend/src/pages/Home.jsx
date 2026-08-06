import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useItems from '../hooks/useItems';
import FilterBar from '../components/FilterBar';
import ItemCard from '../components/ItemCard';

/* ────────────────────────────────────────────────────────
 * DEFAULT FILTER STATE
 * All filters start empty (= show everything).
 * ──────────────────────────────────────────────────────── */
const INITIAL_FILTERS = {
  typeTab:  '',   // '' | 'lost' | 'found'
  category: '',
  location: '',
  status:   '',
  search:   '',
};

/* ────────────────────────────────────────────────────────
 * Skeleton card — shown during the loading state.
 * Mimics the shape of ItemCard for a polished feel.
 * ──────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse">
      <div className="h-2 bg-gray-200" />
      <div className="h-28 bg-gray-100" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex justify-between">
          <div className="h-3 w-16 rounded bg-gray-200" />
          <div className="h-4 w-12 rounded-full bg-gray-200" />
        </div>
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded bg-gray-100" />
          <div className="h-3 w-2/3 rounded bg-gray-100" />
        </div>
        <div className="mt-auto flex gap-4 border-t border-gray-100 pt-3">
          <div className="h-3 w-20 rounded bg-gray-100" />
          <div className="h-3 w-16 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
 * Home Page
 * ════════════════════════════════════════════════════════ */
function Home() {
  const { items, loading, error, refetch } = useItems();
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  /*
   * FILTER-COMBINING LOGIC
   *
   * All active filters are ANDed together — an item must pass EVERY
   * active filter to appear in the results. We chain .filter() calls
   * for readability; for a small dataset this is negligible perf cost.
   *
   *   typeTab   → exact match on type
   *   category  → exact match on category
   *   location  → exact match on location
   *   status    → exact match on status
   *   search    → case-insensitive substring match on title OR description
   */
  const filteredItems = useMemo(() => {
    let result = items;

    if (filters.typeTab) {
      result = result.filter((i) => i.type === filters.typeTab);
    }
    if (filters.category) {
      result = result.filter((i) => i.category === filters.category);
    }
    if (filters.location) {
      result = result.filter((i) => i.location === filters.location);
    }
    if (filters.status) {
      result = result.filter((i) => i.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
      );
    }

    return result;
  }, [items, filters]);

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="bg-navy-900 text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold"
              aria-hidden="true"
            >
              ✦
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-wide">CAMPUS LOST &amp; FOUND</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                Student Affairs · Item Recovery
              </p>
            </div>
          </Link>

          <Link to="/report" className="btn-primary text-xs !px-4 !py-2">
            + Post an Item
          </Link>
        </nav>
      </header>

      {/* ── Hero section ───────────────────────────────── */}
      <section className="border-b border-gray-200 bg-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            A Service of Student Affairs · Updated Daily
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Lost something<br />on campus?
          </h1>
          <p className="mt-3 max-w-lg text-gray-500">
            Check the board below. If you have found something, please add it so its owner
            has a fair shot at getting it back.
          </p>
        </div>
      </section>

      {/* ── Filters + Board ────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Filter bar */}
        <FilterBar
          items={items}
          filters={filters}
          onChange={setFilters}
        />

        {/* Result count + timestamp */}
        <div className="mt-6 mb-4 flex items-center justify-between text-sm text-gray-500">
          <p>
            <span className="font-semibold text-brand-600">{filteredItems.length}</span>
            {' '}item{filteredItems.length !== 1 ? 's' : ''} on the board
          </p>
          {!loading && (
            <button
              type="button"
              onClick={refetch}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Updated just now
            </button>
          )}
        </div>

        {/* ── Loading state: skeleton grid ──────────────── */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Error state ─────────────────────────────── */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
            <svg className="mb-4 h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h2 className="text-lg font-bold text-red-800">Failed to load items</h2>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="btn-primary mt-6 !bg-red-600 !hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty state ─────────────────────────────── */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
            <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-700">No items match your filters</h2>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or clearing filters.
            </p>
            <button
              type="button"
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="btn-secondary mt-6"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* ── Items grid ──────────────────────────────── */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
