import React, { useState, useMemo } from 'react';
import {
  ATTENDANCE_DATA,
  WEEKDAYS,
  buildMonthGrid,
  formatDateLong,
  formatMonthYear,
  type AttendanceRecord,
  type AttendanceStatus,
} from './attendanceShared';

interface AttendanceProps {
  onOpenRegularizeAttendance: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<AttendanceStatus, { label: string; bg: string; text: string; dot: string; icon: string }> = {
  present:  { label: 'Present',  bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500', icon: 'check_circle' },
  absent:   { label: 'Absent',   bg: 'bg-rose-50',     text: 'text-rose-600',    dot: 'bg-rose-500',    icon: 'cancel' },
  late:     { label: 'Late',     bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500',   icon: 'schedule' },
  halfday:  { label: 'Half Day', bg: 'bg-sky-50',      text: 'text-sky-700',     dot: 'bg-sky-500',     icon: 'timelapse' },
  weekend:  { label: 'Weekend',  bg: 'bg-surface-container-low', text: 'text-on-surface-variant', dot: 'bg-on-surface/20', icon: 'weekend' },
  holiday:  { label: 'Holiday',  bg: 'bg-purple-50',   text: 'text-purple-700',  dot: 'bg-purple-500',  icon: 'celebration' },
};

// ── Component ────────────────────────────────────────────────────────
export default function Attendance({ onOpenRegularizeAttendance }: AttendanceProps) {
  const [activeMonth, setActiveMonth] = useState(() => new Date(2026, 2, 1)); // March 2026
  const [selectedDate, setSelectedDate] = useState<string>('2026-03-27');

  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const recordMap = useMemo(() => {
    const map: Record<string, AttendanceRecord> = {};
    ATTENDANCE_DATA.forEach((r) => { map[r.date] = r; });
    return map;
  }, []);

  const selectedRecord = selectedDate ? recordMap[selectedDate] ?? null : null;

  // Determine effective status for a cell
  const getStatus = (dateStr: string, isWeekend: boolean): AttendanceStatus => {
    const rec = recordMap[dateStr];
    if (rec) return rec.status;
    if (isWeekend) return 'weekend';
    return 'present'; // fallback for days before data range — treat as neutral
  };

  const changeMonth = (offset: number) => {
    const next = new Date(year, month + offset, 1);
    setActiveMonth(next);
    // Try to keep selection in month, else clear
    const ny = next.getFullYear();
    const nm = next.getMonth();
    const selY = selectedDate ? Number(selectedDate.slice(0, 4)) : -1;
    const selM = selectedDate ? Number(selectedDate.slice(5, 7)) - 1 : -1;
    if (selY !== ny || selM !== nm) {
      // Pick first record in the new month, or 1st
      const first = ATTENDANCE_DATA.find(r => {
        const ry = Number(r.date.slice(0, 4));
        const rm = Number(r.date.slice(5, 7)) - 1;
        return ry === ny && rm === nm;
      });
      setSelectedDate(first ? first.date : `${ny}-${String(nm + 1).padStart(2, '0')}-01`);
    }
  };

  // Check if a cell has no record and is not a weekend
  const hasNoRecord = (dateStr: string, isWeekend: boolean) => !recordMap[dateStr] && !isWeekend;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* ─── Bento Grid: Stats and Action (unchanged) ─── */}
      <div className="grid grid-cols-12 gap-6">
        {/* Summary Stats */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-5 rounded-2xl editorial-shadow flex flex-col justify-between group hover:bg-primary transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined p-2 bg-secondary-container text-primary rounded-lg group-hover:bg-on-primary group-hover:text-primary transition-colors text-xl">check_circle</span>
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant group-hover:text-on-primary/80 uppercase">On-Time</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-headline font-extrabold text-on-surface group-hover:text-on-primary transition-colors">22</p>
              <p className="text-sm font-medium text-on-surface-variant group-hover:text-on-primary/70 transition-colors">This month</p>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-5 rounded-2xl editorial-shadow flex flex-col justify-between group hover:bg-error transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined p-2 bg-error-container/20 text-error rounded-lg group-hover:bg-on-error group-hover:text-error transition-colors text-xl">schedule</span>
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant group-hover:text-on-error/80 uppercase">Late-In</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-headline font-extrabold text-on-surface group-hover:text-on-error transition-colors">03</p>
              <p className="text-sm font-medium text-on-surface-variant group-hover:text-on-error/70 transition-colors">This month</p>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-5 rounded-2xl editorial-shadow flex flex-col justify-between group hover:bg-surface-dim transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined p-2 bg-surface-container text-on-surface-variant rounded-lg group-hover:bg-on-surface group-hover:text-surface-dim transition-colors text-xl">block</span>
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant group-hover:text-on-surface/80 uppercase">Absent</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-headline font-extrabold text-on-surface group-hover:text-on-surface transition-colors">01</p>
              <p className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface/70 transition-colors">This month</p>
            </div>
          </div>
        </div>

        {/* Regularization CTA */}
        <div className="col-span-12 lg:col-span-4 bg-tertiary-container/30 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-center editorial-shadow">
          <div className="z-10">
            <h3 className="font-headline text-lg font-bold text-on-tertiary-container mb-1">Missed a swipe?</h3>
            <p className="text-xs text-on-tertiary-container/80 mb-4 max-w-[200px]">Submit a regularization request for the current pay period.</p>
            <button
              type="button"
              onClick={onOpenRegularizeAttendance}
              className="bg-on-tertiary-container text-tertiary-container px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">edit_note</span>
              Regularize Attendance
            </button>
          </div>
          {/* Abstract Design Elements */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-tertiary-container rounded-full opacity-40 blur-3xl"></div>
          <div className="absolute top-0 right-0 p-4">
            <span className="material-symbols-outlined text-tertiary-container/40 text-6xl">auto_stories</span>
          </div>
        </div>
      </div>

      {/* ─── Calendar + Detail Panel ─── */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Monthly Attendance Calendar */}
        <div className="col-span-12 xl:col-span-8">
          <div className="bg-surface-container-lowest rounded-2xl editorial-shadow p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => changeMonth(-1)}
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <h3 className="text-lg font-bold font-headline text-on-surface">{formatMonthYear(year, month)}</h3>
              <button
                onClick={() => changeMonth(1)}
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((cell, idx) => {
                if (!cell.isCurrentMonth || cell.day === null) {
                  return <div key={idx} className="h-14 rounded-xl" />;
                }

                const status = getStatus(cell.dateStr, cell.isWeekend);
                const cfg = STATUS_CONFIG[status];
                const isSelected = cell.dateStr === selectedDate;
                const noRecord = hasNoRecord(cell.dateStr, cell.isWeekend);

                // For days with no record that aren't weekends, show a neutral muted cell
                const cellBg = noRecord
                  ? 'bg-surface-container-low/60'
                  : cfg.bg;
                const cellText = noRecord
                  ? 'text-on-surface-variant/50'
                  : cfg.text;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`
                      relative flex flex-col items-center justify-center h-14 rounded-xl transition-all duration-200 cursor-pointer
                      ${cellBg} ${cellText}
                      ${isSelected ? 'ring-2 ring-primary shadow-md shadow-primary/15 scale-[1.04]' : 'hover:scale-[1.02] hover:shadow-sm'}
                      ${cell.isToday && !isSelected ? 'ring-1 ring-slate-300' : ''}
                    `}
                  >
                    <span className={`text-sm font-bold leading-none ${isSelected ? 'text-primary' : ''}`}>
                      {cell.day}
                    </span>
                    {!noRecord && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 ${cfg.dot}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 pt-4 border-t border-outline-variant/10">
              {(['present', 'late', 'halfday', 'absent', 'weekend', 'holiday'] as AttendanceStatus[]).map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                  <span className="text-[11px] font-medium text-on-surface-variant">{STATUS_CONFIG[s].label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Date Detail Panel */}
        <div className="col-span-12 xl:col-span-4">
          <div className="bg-surface-container-lowest rounded-2xl editorial-shadow p-6 h-full flex flex-col">
            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-5">Selected Date</h4>

            {(() => {
              // Weekend / holiday with no work record
              const selParts = selectedDate.split('-').map(Number);
              const selDt = new Date(selParts[0], selParts[1] - 1, selParts[2]);
              const isWeekend = selDt.getDay() === 0 || selDt.getDay() === 6;

              if (selectedRecord && selectedRecord.status === 'holiday') {
                // Holiday state
                const cfg = STATUS_CONFIG.holiday;
                return (
                  <div className="flex-1 flex flex-col">
                    <p className="text-base font-bold font-headline text-on-surface mb-1">{formatDateLong(selectedDate)}</p>
                    <span className={`self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text} mt-1 mb-5`}>
                      <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
                      {cfg.label}
                    </span>
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                      <span className="material-symbols-outlined text-purple-300 text-5xl mb-3">celebration</span>
                      <p className="text-sm font-semibold text-on-surface mb-1">{selectedRecord.notes || 'Holiday'}</p>
                      <p className="text-xs text-on-surface-variant">No attendance tracking on holidays.</p>
                    </div>
                  </div>
                );
              }

              if (isWeekend && !selectedRecord) {
                return (
                  <div className="flex-1 flex flex-col">
                    <p className="text-base font-bold font-headline text-on-surface mb-4">{formatDateLong(selectedDate)}</p>
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                      <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl mb-3">weekend</span>
                      <p className="text-sm font-semibold text-on-surface mb-1">Weekend</p>
                      <p className="text-xs text-on-surface-variant">No attendance tracking on weekends.</p>
                    </div>
                  </div>
                );
              }

              if (!selectedRecord) {
                return (
                  <div className="flex-1 flex flex-col">
                    <p className="text-base font-bold font-headline text-on-surface mb-4">{formatDateLong(selectedDate)}</p>
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                      <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl mb-3">event_busy</span>
                      <p className="text-sm text-on-surface-variant">No attendance details available for this date.</p>
                    </div>
                  </div>
                );
              }

              // Normal record
              const cfg = STATUS_CONFIG[selectedRecord.status];
              return (
                <div className="flex-1 flex flex-col">
                  {/* Date Header */}
                  <p className="text-base font-bold font-headline text-on-surface mb-1">{formatDateLong(selectedDate)}</p>
                  <span className={`self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text} mt-1 mb-5`}>
                    <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
                    {cfg.label}
                  </span>

                  {/* Shift Summary */}
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-5 pb-4 border-b border-outline-variant/10">
                    <span className="material-symbols-outlined text-base">schedule</span>
                    <span>Shift: <strong className="text-on-surface">10:00 AM – 07:00 PM</strong></span>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    {[
                      { label: 'Check-in',   value: selectedRecord.checkIn,   icon: 'login' },
                      { label: 'Check-out',  value: selectedRecord.checkOut,  icon: 'logout' },
                      { label: 'Late In',    value: selectedRecord.lateIn,    icon: 'alarm' },
                      { label: 'Early Out',  value: selectedRecord.earlyOut,  icon: 'directions_run' },
                      { label: 'Work Hours', value: selectedRecord.workHours, icon: 'hourglass_top' },
                      { label: 'Shift Hours',value: selectedRecord.shiftHours,icon: 'work_history' },
                    ].map((m) => (
                      <div key={m.label} className="bg-surface-container-low/60 rounded-xl px-3.5 py-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="material-symbols-outlined text-on-surface-variant/60 text-sm">{m.icon}</span>
                          <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider">{m.label}</span>
                        </div>
                        <p className="text-sm font-bold font-headline text-on-surface">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Notes / Remark */}
                  {selectedRecord.notes && (
                    <div className="mt-auto pt-4 border-t border-outline-variant/10">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-on-surface-variant/50 text-base mt-0.5">info</span>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{selectedRecord.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
