import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { LogTab } from '../types/database';

type TabData = Record<string, boolean | number | null>;

export interface LogRow {
  id?: string;
  morning: TabData;
  daily: TabData;
  night: TabData;
  stretch: TabData;
  weekly: TabData;
}

const EMPTY_LOG: LogRow = { morning: {}, daily: {}, night: {}, stretch: {}, weekly: {} };

export function useDailyLog(date: string) {
  const { user } = useAuth();
  const [log, setLog] = useState<LogRow>(EMPTY_LOG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !date) return;
    setLoading(true);
    setLog(EMPTY_LOG);
    supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle()
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        else if (data) setLog(data as unknown as LogRow);
        else setLog(EMPTY_LOG);
        setLoading(false);
      });
  }, [user, date]);

  const setValue = useCallback(async (tab: LogTab, itemId: string, value: boolean | number | null) => {
    if (!user) return;

    setLog(prev => {
      const prevValue = (prev[tab] as TabData)[itemId] ?? null;
      if (prevValue === value) return prev;

      const newTabData = { ...(prev[tab] as TabData), [itemId]: value };
      const payload = {
        user_id: user.id,
        date,
        [tab]: newTabData,
      };

      // Fire-and-forget history record. Safe to ignore failure (table may not
      // exist yet if the user hasn't applied migration 002).
      supabase
        .from('daily_logs_history')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({ user_id: user.id, date, tab, field: itemId, prev_value: prevValue, new_value: value } as any)
        .then(() => {});

      supabase
        .from('daily_logs')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(payload as any, { onConflict: 'user_id,date' })
        .then(({ error: e }) => {
          if (e) {
            setError(e.message);
            // Rollback to the captured prev value
            setLog(prev2 => ({
              ...prev2,
              [tab]: { ...(prev2[tab] as TabData), [itemId]: prevValue },
            }));
          }
        });

      return { ...prev, [tab]: newTabData };
    });
  }, [user, date]);

  const resetTab = useCallback(async (tab: LogTab) => {
    if (!user) return;
    setLog(prev => ({ ...prev, [tab]: {} }));
    await supabase
      .from('daily_logs')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert({ user_id: user.id, date, [tab]: {} } as any, { onConflict: 'user_id,date' });
  }, [user, date]);

  const get = useCallback((tab: LogTab, itemId: string): boolean | number | null => {
    return (log[tab] as TabData)[itemId] ?? null;
  }, [log]);

  return { log, loading, error, setValue, resetTab, get };
}
