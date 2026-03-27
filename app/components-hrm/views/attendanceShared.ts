export type AttendanceStatus = 'present' | 'absent' | 'late' | 'halfday' | 'weekend' | 'holiday';

export interface AttendanceRecord {
  date: string;
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  lateIn: string;
  earlyOut: string;
  workHours: string;
  shiftHours: string;
  notes: string;
}

export interface RegularizationDay {
  date: string;
  kind: 'gap' | 'leave';
  label: string;
  countLabel?: string;
}

export interface RegularizationStatusItem {
  id: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  permissionType: string;
  timeRange: string;
  reason: string;
  appliedOn: string;
}

export const ATTENDANCE_DATA: AttendanceRecord[] = [
  { date: '2026-03-02', status: 'present', checkIn: '09:55 AM', checkOut: '07:10 PM', lateIn: '-', earlyOut: '-', workHours: '9h 15m', shiftHours: '9h 00m', notes: '' },
  { date: '2026-03-03', status: 'present', checkIn: '09:48 AM', checkOut: '07:02 PM', lateIn: '-', earlyOut: '-', workHours: '9h 14m', shiftHours: '9h 00m', notes: '' },
  { date: '2026-03-04', status: 'late', checkIn: '10:32 AM', checkOut: '07:15 PM', lateIn: '32 min', earlyOut: '-', workHours: '8h 43m', shiftHours: '9h 00m', notes: 'Late arrival — traffic delay' },
  { date: '2026-03-05', status: 'present', checkIn: '09:50 AM', checkOut: '07:05 PM', lateIn: '-', earlyOut: '-', workHours: '9h 15m', shiftHours: '9h 00m', notes: '' },
  { date: '2026-03-06', status: 'present', checkIn: '09:58 AM', checkOut: '07:00 PM', lateIn: '-', earlyOut: '-', workHours: '9h 02m', shiftHours: '9h 00m', notes: '' },
  { date: '2026-03-09', status: 'present', checkIn: '09:45 AM', checkOut: '07:08 PM', lateIn: '-', earlyOut: '-', workHours: '9h 23m', shiftHours: '9h 00m', notes: '' },
  { date: '2026-03-10', status: 'halfday', checkIn: '09:50 AM', checkOut: '02:00 PM', lateIn: '-', earlyOut: '5h 00m', workHours: '4h 10m', shiftHours: '9h 00m', notes: 'Half day — personal errand' },
  { date: '2026-03-11', status: 'present', checkIn: '09:52 AM', checkOut: '07:12 PM', lateIn: '-', earlyOut: '-', workHours: '9h 20m', shiftHours: '9h 00m', notes: '' },
  { date: '2026-03-12', status: 'present', checkIn: '09:47 AM', checkOut: '07:00 PM', lateIn: '-', earlyOut: '-', workHours: '9h 13m', shiftHours: '9h 00m', notes: '' },
  { date: '2026-03-13', status: 'absent', checkIn: '-', checkOut: '-', lateIn: '-', earlyOut: '-', workHours: '0h 00m', shiftHours: '9h 00m', notes: 'Absent — sick leave' },
  { date: '2026-03-16', status: 'present', checkIn: '09:55 AM', checkOut: '07:05 PM', lateIn: '-', earlyOut: '-', workHours: '9h 10m', shiftHours: '9h 00m', notes: '' },
  { date: '2026-03-17', status: 'present', checkIn: '09:42 AM', checkOut: '07:00 PM', lateIn: '-', earlyOut: '-', workHours: '9h 18m', shiftHours: '9h 00m', notes: '' },
  { date: '2026-03-18', status: 'late', checkIn: '10:18 AM', checkOut: '07:20 PM', lateIn: '18 min', earlyOut: '-', workHours: '9h 02m', shiftHours: '9h 00m', notes: 'Late arrival' },
  { date: '2026-03-19', status: 'present', checkIn: '09:50 AM', checkOut: '07:10 PM', lateIn: '-', earlyOut: '-', workHours: '9h 20m', shiftHours: '9h 00m', notes: '' },
  { date: '2026-03-20', status: 'present', checkIn: '09:48 AM', checkOut: '07:02 PM', lateIn: '-', earlyOut: '-', workHours: '9h 14m', shiftHours: '9h 00m', notes: '' },
  { date: '2026-03-23', status: 'present', checkIn: '09:55 AM', checkOut: '07:08 PM', lateIn: '-', earlyOut: '-', workHours: '9h 13m', shiftHours: '9h 00m', notes: '' },
  { date: '2026-03-24', status: 'present', checkIn: '09:40 AM', checkOut: '07:00 PM', lateIn: '-', earlyOut: '-', workHours: '9h 20m', shiftHours: '9h 00m', notes: '' },
  { date: '2026-03-25', status: 'halfday', checkIn: '09:50 AM', checkOut: '01:50 PM', lateIn: '-', earlyOut: '5h 10m', workHours: '4h 00m', shiftHours: '9h 00m', notes: 'Half day — doctor appointment' },
  { date: '2026-03-26', status: 'present', checkIn: '09:52 AM', checkOut: '07:05 PM', lateIn: '-', earlyOut: '-', workHours: '9h 13m', shiftHours: '9h 00m', notes: '' },
  { date: '2026-03-27', status: 'present', checkIn: '09:58 AM', checkOut: '-', lateIn: '-', earlyOut: '-', workHours: '-', shiftHours: '9h 00m', notes: 'Today — still in office' },
  { date: '2026-03-30', status: 'holiday', checkIn: '-', checkOut: '-', lateIn: '-', earlyOut: '-', workHours: '-', shiftHours: '-', notes: 'Ugadi' },
];

export const REGULARIZATION_DAYS: RegularizationDay[] = [
  { date: '2026-03-06', kind: 'gap', label: 'Gap Day' },
  { date: '2026-03-09', kind: 'gap', label: 'Gap Day' },
  { date: '2026-03-12', kind: 'gap', label: 'Gap Day' },
  { date: '2026-03-16', kind: 'gap', label: 'Gap Day' },
  { date: '2026-03-18', kind: 'gap', label: 'Gap Day' },
  { date: '2026-03-20', kind: 'gap', label: 'Gap Day' },
  { date: '2026-03-24', kind: 'gap', label: 'Gap Day' },
  { date: '2026-03-27', kind: 'gap', label: 'Gap Day' },
  { date: '2026-03-31', kind: 'leave', label: 'Leave Day', countLabel: '8 Gap day(s)' },
];

export const REGULARIZATION_PENDING: RegularizationStatusItem[] = [
  {
    id: 'pending-1',
    date: '2026-03-18',
    status: 'Pending',
    permissionType: 'Official Work',
    timeRange: '10:00 - 12:30',
    reason: 'Client visit entry adjustment',
    appliedOn: '17 Mar 2026',
  },
  {
    id: 'pending-2',
    date: '2026-03-24',
    status: 'Pending',
    permissionType: 'Work From Home',
    timeRange: '02:00 - 07:00',
    reason: 'Network outage at office floor',
    appliedOn: '24 Mar 2026',
  },
];

export const REGULARIZATION_HISTORY: RegularizationStatusItem[] = [
  {
    id: 'history-1',
    date: '2026-03-05',
    status: 'Approved',
    permissionType: 'Medical',
    timeRange: '10:00 - 01:00',
    reason: 'Doctor consultation',
    appliedOn: '06 Mar 2026',
  },
  {
    id: 'history-2',
    date: '2026-02-26',
    status: 'Rejected',
    permissionType: 'Personal',
    timeRange: '03:00 - 05:00',
    reason: 'Missed punch without manager note',
    appliedOn: '27 Feb 2026',
  },
];

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const today = new Date();

  const cells: {
    day: number | null;
    dateStr: string;
    isCurrentMonth: boolean;
    isWeekend: boolean;
    isToday: boolean;
  }[] = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: null, dateStr: '', isCurrentMonth: false, isWeekend: false, isToday: false });
  }

  for (let d = 1; d <= totalDays; d++) {
    const dt = new Date(year, month, d);
    const dow = dt.getDay();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      day: d,
      dateStr,
      isCurrentMonth: true,
      isWeekend: dow === 0 || dow === 6,
      isToday: today.getFullYear() === year && today.getMonth() === month && today.getDate() === d,
    });
  }

  while (cells.length < 42) {
    cells.push({ day: null, dateStr: '', isCurrentMonth: false, isWeekend: false, isToday: false });
  }

  return cells;
}

export function formatMonthYear(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatDateLong(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function findFirstRegularizationDateForMonth(year: number, month: number) {
  const match = REGULARIZATION_DAYS.find((item) => {
    const itemYear = Number(item.date.slice(0, 4));
    const itemMonth = Number(item.date.slice(5, 7)) - 1;
    return itemYear === year && itemMonth === month;
  });

  return match?.date ?? `${year}-${String(month + 1).padStart(2, '0')}-01`;
}
