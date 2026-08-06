import { useState, useEffect, useRef, useMemo } from 'react';

/* ────────────────────────────────────────────────────────
 * CATEGORY LIST
 * Must stay in sync with the categories in ItemForm.jsx.
 * ──────────────────────────────────────────────────────── */
const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Keys',
  'Cards & IDs',
  'Books',
  'Bags & Wallets',
  'Water Bottles',
  'Other',
];

/**
 * FilterBar — provides all filter controls for the board.
 *
 * Props:
 *   items     – the full unfiltered array from useItems()
 *   filters   – current filter state object
 *   onChange  – callback receiving the updated filter state
 *
 * FILTER-COMBINING LOGIC (applied in the Home page):
 * All active filters are ANDed together. Each filter narrows the set:
 *   1. typeTab   → exact match on item.type ('lost' | 'found' | '' for all)
 *   2. category  → exact match on item.category (or '' for all)
 *   3. location  → exact match on item.location (or '' for all)
 *   4. status    → exact match on item.status (or '' for all)
 *   5. search    → case-insensitive substring match against title + description
 *
 * The search input is debounced (see below) so we don't re-filter on every
 * keystroke — instead we wait 300ms after the user stops typing.
 */
function FilterBar({ items, filters, onChange }) {
  /* ── Local search state for debounce ──────────────── */
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debounceRef = useRef(null);

  /*
   * DEBOUNCE LOGIC
   * Instead of updating filters.search on every keystroke, we buffer the
   * raw input in local state and only propagate to the parent after 300ms
   * of inactivity. This prevents expensive re-filtering from running on
   * every character typed.
   *
   * How it works:
   *   1. On each keystroke, clear any pending timer and start a new 300ms timer.
   *   2. When the timer fires, call onChange with the latest search value.
   *   3. On unmount, clear the timer to prevent memory leaks.
   */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange({ ...filters, search: searchInput });
    }, 300);
    return () => clearTimeout(debounceRef.current);
    // We intentionally exclude `filters` and `onChange` from deps
    // to avoid an infinite loop — we only want to react to searchInput changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  /* ── Derive unique locations from the data for the dropdown ── */
  const uniqueLocations = useMemo(() => {
    const set = new Set(items.map((i) => i.location).filter(Boolean));
    return [...set].sort();
  }, [items]);

  /* ── Helpers ──────────────────────────────────────── */
  const setFilter = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    setSearchInput('');
    onChange({ typeTab: '', category: '', location: '', status: '', search: '' });
  };

  const hasActiveFilters =
    filters.typeTab || filters.category || filters.location || filters.status || filters.search;

  /* ── Tab style helper ─────────────────────────────── */
  const tabClass = (value) =>
    `px-4 py-2 text-sm font-semibold transition-colors duration-150 rounded-lg
     ${filters.typeTab === value
       ? 'bg-navy-900 text-white'
       : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`;

  return (
    <div className="space-y-4">
      {/* ── Row 1: Search + Type Tabs ───────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            placeholder="Search by item, building, or detail"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-base pl-10"
            aria-label="Search items"
          />
        </div>

        {/* Type tabs */}
        <nav className="flex gap-1 rounded-lg bg-gray-100 p-1" aria-label="Filter by type">
          <button type="button" onClick={() => setFilter('typeTab', '')} className={tabClass('')}>
            All Items
          </button>
          <button type="button" onClick={() => setFilter('typeTab', 'lost')} className={tabClass('lost')}>
            Lost
          </button>
          <button type="button" onClick={() => setFilter('typeTab', 'found')} className={tabClass('found')}>
            Found
          </button>
        </nav>
      </div>

      {/* ── Row 2: Dropdown filters + Clear ─────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* Filter icon */}
        <div className="hidden sm:flex sm:items-center sm:gap-1 sm:self-end sm:pb-2">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
        </div>

        {/* Category */}
        <div className="flex-1">
          <label htmlFor="filter-category" className="mb-1 block text-xs font-medium text-gray-500">
            Category
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
            className="input-base text-sm"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="flex-1">
          <label htmlFor="filter-location" className="mb-1 block text-xs font-medium text-gray-500">
            Location
          </label>
          <select
            id="filter-location"
            value={filters.location}
            onChange={(e) => setFilter('location', e.target.value)}
            className="input-base text-sm"
          >
            <option value="">All locations</option>
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex-1">
          <label htmlFor="filter-status" className="mb-1 block text-xs font-medium text-gray-500">
            Status
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
            className="input-base text-sm"
          >
            <option value="">Active Items</option>
            <option value="open">Open</option>
            <option value="claimed">Claimed</option>
          </select>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="self-end pb-2 text-sm font-medium text-brand-600
              underline underline-offset-2 hover:text-brand-700"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;
