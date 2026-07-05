import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { ThresholdDef } from '../types/database';

export interface SettingsRow {
  user_id: string;
  sleep_target_hours: number;
  primary_weight_unit: string;
  thresholds: Record<string, ThresholdDef>;
}

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }: { data: SettingsRow | null }) => {
        setSettings(data);
        setLoading(false);
      });
  }, [user]);

  const update = useCallback(async (patch: Partial<Omit<SettingsRow, 'user_id'>>) => {
    if (!user || !settings) return;
    const optimistic = { ...settings, ...patch };
    setSettings(optimistic);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('settings')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select('*')
      .single();
    if (error) {
      setSettings(settings); // rollback
    } else if (data) {
      setSettings(data as SettingsRow);
    }
  }, [user, settings]);

  return { settings, loading, update };
}
