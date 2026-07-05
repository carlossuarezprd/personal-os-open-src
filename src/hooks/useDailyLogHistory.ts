import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { LogTab } from '../types/database';

export interface HistoryRow {
  id: string;
  date: string;
  tab: LogTab;
  field: string;
  prev_value: boolean | number | null;
  new_value: boolean | number | null;
  changed_at: string;
}

/** Recent change log for a single calendar date. Returns latest first. */
export function useDailyLogHistory(date: string, refreshKey: number = 0) {
  const { user } = useAuth();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !date) return;
    supabase
      .from('daily_logs_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .order('changed_at', { ascending: false })
      .limit(50)
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        else setRows((data ?? []) as unknown as HistoryRow[]);
        setLoading(false);
      });
  }, [user, date, refreshKey]);

  const remove = useCallback(async (id: string) => {
    await supabase.from('daily_logs_history').delete().eq('id', id);
    setRows(prev => prev.filter(r => r.id !== id));
  }, []);

  return { rows, loading, error, remove };
}
