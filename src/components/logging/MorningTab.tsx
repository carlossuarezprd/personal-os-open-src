import TabShell from './TabShell';
import { morningSchema } from './schema';
import type { useDailyLog } from '../../hooks/useDailyLog';

type LogProps = ReturnType<typeof useDailyLog> & { date: string };

export default function MorningTab({ get, setValue, resetTab }: LogProps) {
  return <TabShell schema={morningSchema} get={get} setValue={setValue} resetTab={resetTab} />;
}
