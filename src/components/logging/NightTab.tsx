import TabShell from './TabShell';
import { nightSchema } from './schema';
import type { useDailyLog } from '../../hooks/useDailyLog';

type LogProps = ReturnType<typeof useDailyLog> & { date: string };

export default function NightTab({ get, setValue, resetTab }: LogProps) {
  return <TabShell schema={nightSchema} get={get} setValue={setValue} resetTab={resetTab} />;
}
