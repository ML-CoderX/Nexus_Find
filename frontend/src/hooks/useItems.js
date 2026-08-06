import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

/**
 * useItems — custom hook that fetches all items from the Supabase `items`
 * table, ordered by `createdat` descending (newest first).
 *
 * Returns { items, loading, error, refetch }.
 *
 * WHY CLIENT-SIDE FILTERING (not Supabase queries)?
 * For a campus lost-and-found board the total row count is small (hundreds,
 * not millions). Fetching everything once and filtering in JS means:
 *   1. Instant filter responses — no round-trip per filter change.
 *   2. Filters can be combined freely without building dynamic queries.
 *   3. The data stays fresh via the refetch() callback.
 * If the dataset ever grows large, swap to server-side `.ilike()` / `.eq()`
 * queries and paginate.
 */
export default function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('items')
      .select('*')
      .order('createdat', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setItems([]);
    } else {
      setItems(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
}
