import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';


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
