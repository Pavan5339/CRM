import React, { useMemo, useState } from 'react';
import {
  REGULARIZATION_DAYS,
  REGULARIZATION_HISTORY,
  REGULARIZATION_PENDING,
  WEEKDAYS,
  buildMonthGrid,
  findFirstRegularizationDateForMonth,
  formatDateLong,
  formatDateShort,
  formatMonthYear,
  type RegularizationDay,
  type RegularizationStatusItem,
} from './attendanceShared';

type RegularizationTab = 'apply' | 'pending' | 'history';

interface PermissionRow {
  id: string;
  permissionType: string;
  fromTime: string;
  toTime: string;
  reason: string;
}

interface DraftState {
  ccInput: string;
  ccList: string[];
  remarks: string;
  rows: PermissionRow[];
}

const PERMISSION_OPTIONS = [
  'Official Work',
  'Medical',
  'Work From Home',
  'Personal',
  'Client Visit',
  'On Duty',
];

const STATUS_STYLES: Record<RegularizationStatusItem['status'], string> = {
  Pending: 'bg-amber-50 text-amber-700',
  Approved: 'bg-emerald-50 text-emerald-700',
  Rejected: 'bg-rose-50 text-rose-600',
};

function createPermissionRow(): PermissionRow {
  return {
    id: `row-${Math.random().toString(36).slice(2, 10)}`,
    permissionType: '',
    fromTime: '10:00',
    toTime: '19:00',
    reason: '',
  };
}

function createDraft(): DraftState {
  return {
    ccInput: '',
    ccList: [],
    remarks: '',
    rows: [createPermissionRow()],
  };
}

function formatCalendarDayLabel(item: RegularizationDay | undefined) {
  if (!item) {
    return null;
  }

  return item.kind === 'leave' ? 'L' : '';
}

function StatusCard({ item }: { item: RegularizationStatusItem }) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl editorial-shadow p-6 border border-outline-variant/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-lg font-bold font-headline text-on-surface">{formatDateLong(item.date)}</p>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[item.status]}`}>{item.status}</span>
          </div>
          <p className="text-sm text-on-surface-variant mt-2">{item.permissionType}</p>
        </div>
        <div className="text-sm text-on-surface-variant">Applied on {item.appliedOn}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        <div className="bg-surface-container-low rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-2">Time Range</p>
          <p className="text-sm font-semibold text-on-surface">{item.timeRange}</p>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-4 md:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-2">Reason</p>
          <p className="text-sm font-semibold text-on-surface">{item.reason}</p>
        </div>
      </div>
    </div>
  );
}

export default function RegularizeAttendance() {
  const [activeMonth, setActiveMonth] = useState(() => new Date(2026, 2, 1));
  const [activeTab, setActiveTab] = useState<RegularizationTab>('apply');
  const [draftsByDate, setDraftsByDate] = useState<Record<string, DraftState>>({});
  const [selectedDate, setSelectedDate] = useState<string>(() => findFirstRegularizationDateForMonth(2026, 2));

  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const regularizationMap = useMemo(() => {
    const map: Record<string, RegularizationDay> = {};
    REGULARIZATION_DAYS.forEach((item) => {
      map[item.date] = item;
    });
    return map;
  }, []);

  const selectedDay = regularizationMap[selectedDate];
  const draft = draftsByDate[selectedDate] ?? createDraft();
  const gapCountLabel = selectedDay?.countLabel ?? `${REGULARIZATION_DAYS.length} Gap day(s)`;

  const changeMonth = (offset: number) => {
    const next = new Date(year, month + offset, 1);
    const nextYear = next.getFullYear();
    const nextMonth = next.getMonth();
    setActiveMonth(next);
    setSelectedDate(findFirstRegularizationDateForMonth(nextYear, nextMonth));
  };

  const updateDraft = (updater: (draftState: DraftState) => DraftState) => {
    setDraftsByDate((current) => {
      const base = current[selectedDate] ?? createDraft();
      return {
        ...current,
        [selectedDate]: updater(base),
      };
    });
  };

  const updateRow = (rowId: string, key: keyof PermissionRow, value: string) => {
    updateDraft((current) => ({
      ...current,
      rows: current.rows.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)),
    }));
  };

  const addRow = () => {
    updateDraft((current) => ({
      ...current,
      rows: [...current.rows, createPermissionRow()],
    }));
  };

  const removeRow = (rowId: string) => {
    updateDraft((current) => {
      const nextRows = current.rows.filter((row) => row.id !== rowId);
      return {
        ...current,
        rows: nextRows.length > 0 ? nextRows : [createPermissionRow()],
      };
    });
  };

  const addCc = () => {
    const value = draft.ccInput.trim();
    if (!value) {
      return;
    }

    updateDraft((current) => ({
      ...current,
      ccInput: '',
      ccList: current.ccList.includes(value) ? current.ccList : [...current.ccList, value],
    }));
  };

  const removeCc = (value: string) => {
    updateDraft((current) => ({
      ...current,
      ccList: current.ccList.filter((item) => item !== value),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 xl:col-span-3">
          <div className="bg-surface-container-lowest rounded-3xl editorial-shadow overflow-hidden">
            <div className="p-5 border-b border-outline-variant/10">
              <div className="flex items-center justify-between mb-5">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                <h3 className="text-lg font-bold font-headline text-on-surface">{formatMonthYear(year, month)}</h3>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest py-1"
                  >
                    {day.slice(0, 1)}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {cells.map((cell, idx) => {
                  if (!cell.isCurrentMonth || cell.day === null) {
                    return <div key={idx} className="h-11 rounded-xl" />;
                  }

                  const item = regularizationMap[cell.dateStr];
                  const isSelected = cell.dateStr === selectedDate;
                  const isEligible = Boolean(item);

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!isEligible}
                      onClick={() => isEligible && setSelectedDate(cell.dateStr)}
                      className={`relative h-11 rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${
                        isEligible
                          ? 'bg-primary/8 text-primary hover:bg-primary/12 cursor-pointer'
                          : 'text-on-surface-variant/35 bg-transparent cursor-default'
                      } ${isSelected ? 'ring-2 ring-primary bg-primary/14 shadow-md shadow-primary/10' : ''}`}
                    >
                      <span>{cell.day}</span>
                      {isEligible && (
                        <span className="absolute left-1.5 bottom-1.5 w-0 h-0 border-l-[8px] border-l-primary border-t-[8px] border-t-transparent" />
                      )}
                      {isEligible && formatCalendarDayLabel(item) && (
                        <span className="absolute top-1 right-1 text-[9px] font-bold">{formatCalendarDayLabel(item)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-primary/8 px-5 py-3 flex items-center justify-between border-b border-primary/10">
              <p className="text-sm text-error">{gapCountLabel}</p>
              <button
                type="button"
                className="border border-primary text-primary px-4 py-2 rounded-xl font-semibold hover:bg-primary/8 transition-colors"
              >
                Quick Add
              </button>
            </div>

            <div className="px-5 py-5 space-y-2">
              <p className="text-sm text-on-surface-variant">Jump To</p>
              <p className="text-3xl font-headline font-extrabold text-primary">{selectedDate ? formatDateShort(selectedDate) : '—'}</p>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-9 space-y-6">
          <div className="flex justify-center xl:justify-start">
            <div className="inline-flex rounded-2xl border border-outline-variant/30 overflow-hidden bg-surface-container-lowest">
              {(['apply', 'pending', 'history'] as RegularizationTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-base font-medium capitalize transition-colors ${
                    activeTab === tab ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'apply' && (
            <>
              <div className="bg-surface-container-lowest rounded-3xl editorial-shadow p-6 grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6">
                <div className="lg:pr-6 lg:border-r lg:border-outline-variant/15">
                  <p className="text-base font-medium text-on-surface mb-4">Add CC</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={draft.ccInput}
                      onChange={(event) => updateDraft((current) => ({ ...current, ccInput: event.target.value }))}
                      placeholder="name@company.com"
                      className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={addCc}
                      className="shrink-0 border border-outline-variant/30 text-on-surface px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl text-primary">person_add</span>
                      Add CC
                    </button>
                  </div>
                  {draft.ccList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {draft.ccList.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full text-xs font-semibold"
                        >
                          {item}
                          <button type="button" onClick={() => removeCc(item)} className="material-symbols-outlined text-sm">
                            close
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-base font-medium text-on-surface mb-4">Remarks</p>
                  <textarea
                    value={draft.remarks}
                    onChange={(event) => updateDraft((current) => ({ ...current, remarks: event.target.value }))}
                    placeholder="Write Here"
                    rows={4}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-3xl editorial-shadow p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/15 pb-6 mb-6">
                  <div>
                    <p className="text-3xl font-headline font-extrabold text-on-surface">
                      {selectedDate ? formatDateLong(selectedDate) : 'Select a leave day'}
                    </p>
                    <p className="text-sm text-on-surface-variant mt-2">
                      {selectedDay ? `${selectedDay.label} selected for attendance regularization.` : 'Only gap days can be regularized.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <button type="button" className="material-symbols-outlined text-2xl hover:text-primary transition-colors">
                      expand_less
                    </button>
                    <button type="button" className="material-symbols-outlined text-2xl hover:text-primary transition-colors">
                      more_vert
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {draft.rows.map((row, index) => (
                    <div key={row.id} className="border-b border-outline-variant/15 pb-6 last:border-b-0 last:pb-0">
                      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.45fr_0.45fr_1fr_auto] gap-4 items-start">
                        <div className="flex gap-4">
                          <div className="w-1 rounded-full bg-primary mt-1 min-h-12" />
                          <div className="flex-1">
                            <label className="text-xs font-medium text-on-surface-variant mb-3 block">Permission Type</label>
                            <select
                              value={row.permissionType}
                              onChange={(event) => updateRow(row.id, 'permissionType', event.target.value)}
                              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="">Select</option>
                              {PERMISSION_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-on-surface-variant mb-3 block">From Time</label>
                          <input
                            type="time"
                            value={row.fromTime}
                            onChange={(event) => updateRow(row.id, 'fromTime', event.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-on-surface-variant mb-3 block">To Time</label>
                          <input
                            type="time"
                            value={row.toTime}
                            onChange={(event) => updateRow(row.id, 'toTime', event.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-on-surface-variant mb-3 block">Reason</label>
                          <input
                            type="text"
                            value={row.reason}
                            onChange={(event) => updateRow(row.id, 'reason', event.target.value)}
                            placeholder="Enter Description"
                            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div className="pt-8 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            aria-label={`Delete permission row ${index + 1}`}
                            className="text-error hover:bg-error/10 rounded-xl p-3 transition-colors"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6 pt-5 border-t border-outline-variant/15">
                  <button
                    type="button"
                    onClick={addRow}
                    className="text-primary font-medium text-2xl flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-2xl">add</span>
                    Add More
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'pending' && (
            <div className="grid gap-4">
              {REGULARIZATION_PENDING.map((item) => (
                <StatusCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="grid gap-4">
              {REGULARIZATION_HISTORY.map((item) => (
                <StatusCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
