import { EmployeeStatus } from '@/lib/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils';

export default function StatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
