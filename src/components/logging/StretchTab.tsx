import TabShell from './TabShell';
import { stretchSchema } from './schema';
import type { useDailyLog } from '../../hooks/useDailyLog';

type LogProps = ReturnType<typeof useDailyLog> & { date: string };

export default function StretchTab({ get, setValue, resetTab }: LogProps) {
  return <TabShell schema={stretchSchema} get={get} setValue={setValue} resetTab={resetTab} />;
}
