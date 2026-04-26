'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type HrmFeedbackType = 'success' | 'error' | 'warning' | 'info';

type HrmFeedbackPayload = {
  type?: HrmFeedbackType;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ActiveFeedback = HrmFeedbackPayload & {
  mode: 'message' | 'confirm';
};

type HrmFeedbackContextValue = {
  showFeedback: (payload: HrmFeedbackPayload | string) => void;
  confirmFeedback: (payload: HrmFeedbackPayload | string) => Promise<boolean>;
};

const HrmFeedbackContext = createContext<HrmFeedbackContextValue | null>(null);

const FEEDBACK_META: Record<HrmFeedbackType, { icon: string; title: string; badgeClass: string }> = {
  success: {
    icon: 'task_alt',
    title: 'Success',
    badgeClass: 'bg-emerald-100 text-emerald-700 ring-emerald-200/80',
  },
  error: {
    icon: 'error',
    title: 'Action Needed',
    badgeClass: 'bg-rose-100 text-rose-700 ring-rose-200/80',
  },
  warning: {
    icon: 'warning',
    title: 'Please Check',
    badgeClass: 'bg-amber-100 text-amber-700 ring-amber-200/80',
  },
  info: {
    icon: 'info',
    title: 'Notice',
    badgeClass: 'bg-violet-100 text-violet-700 ring-violet-200/80',
  },
};

function normalizePayload(payload: HrmFeedbackPayload | string): HrmFeedbackPayload {
  return typeof payload === 'string' ? { message: payload } : payload;
}

export function HrmFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [activeFeedback, setActiveFeedback] = useState<ActiveFeedback | null>(null);
  const confirmResolverRef = useRef<((confirmed: boolean) => void) | null>(null);
  const okButtonRef = useRef<HTMLButtonElement | null>(null);

  const resolveConfirm = useCallback((confirmed: boolean) => {
    confirmResolverRef.current?.(confirmed);
    confirmResolverRef.current = null;
  }, []);

  const closeFeedback = useCallback(() => {
    if (activeFeedback?.mode === 'confirm') {
      resolveConfirm(false);
    }
    setActiveFeedback(null);
  }, [activeFeedback?.mode, resolveConfirm]);

  const showFeedback = useCallback((payload: HrmFeedbackPayload | string) => {
    setActiveFeedback({
      type: 'info',
      ...normalizePayload(payload),
      mode: 'message',
    });
  }, []);

  const confirmFeedback = useCallback((payload: HrmFeedbackPayload | string) => {
    resolveConfirm(false);
    setActiveFeedback({
      type: 'warning',
      ...normalizePayload(payload),
      mode: 'confirm',
    });

    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
    });
  }, [resolveConfirm]);

  const confirmAction = useCallback(() => {
    resolveConfirm(true);
    setActiveFeedback(null);
  }, [resolveConfirm]);

  useEffect(() => {
    if (!activeFeedback) return;
    const timer = window.setTimeout(() => okButtonRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [activeFeedback]);

  useEffect(() => {
    if (!activeFeedback) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (activeFeedback.mode === 'message') {
        closeFeedback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFeedback, closeFeedback]);

  const value = useMemo(() => ({ showFeedback, confirmFeedback }), [confirmFeedback, showFeedback]);
  const type = activeFeedback?.type || 'info';
  const meta = FEEDBACK_META[type];
  const title = activeFeedback?.title || meta.title;

  return (
    <HrmFeedbackContext.Provider value={value}>
      {children}
      {activeFeedback ? (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-violet-950/12 px-4 py-6 backdrop-blur-[3px]">
          <div
            role={activeFeedback.mode === 'confirm' ? 'alertdialog' : 'dialog'}
            aria-modal="true"
            aria-labelledby="hrm-feedback-title"
            aria-describedby="hrm-feedback-message"
            className="w-full max-w-[460px] overflow-hidden rounded-[1.75rem] border border-white/80 bg-[linear-gradient(145deg,#ffffff_0%,#fbf8ff_46%,#f1e9ff_100%)] p-6 shadow-[0_28px_72px_rgba(76,29,149,0.20),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-violet-100/70"
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${meta.badgeClass}`}>
                <span className="material-symbols-outlined text-[26px]">{meta.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p id="hrm-feedback-title" className="font-headline text-lg font-extrabold text-on-surface">
                  {title}
                </p>
                <p id="hrm-feedback-message" className="mt-2 whitespace-pre-wrap text-sm leading-6 text-on-surface-variant">
                  {activeFeedback.message}
                </p>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              {activeFeedback.mode === 'confirm' ? (
                <button
                  type="button"
                  onClick={closeFeedback}
                  className="rounded-full border border-violet-200 bg-white/80 px-5 py-2.5 text-sm font-bold text-violet-700 transition hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                  {activeFeedback.cancelLabel || 'Cancel'}
                </button>
              ) : null}
              <button
                ref={okButtonRef}
                type="button"
                onClick={activeFeedback.mode === 'confirm' ? confirmAction : closeFeedback}
                className="rounded-full bg-[linear-gradient(180deg,#efe7ff_0%,#d8c7ff_100%)] px-6 py-2.5 text-sm font-extrabold text-violet-950 shadow-[0_12px_22px_rgba(139,92,246,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(139,92,246,0.22)] focus:outline-none focus:ring-2 focus:ring-violet-300"
              >
                {activeFeedback.mode === 'confirm' ? activeFeedback.confirmLabel || 'Confirm' : activeFeedback.confirmLabel || 'OK'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </HrmFeedbackContext.Provider>
  );
}

export function useHrmFeedback() {
  const context = useContext(HrmFeedbackContext);
  if (!context) {
    throw new Error('useHrmFeedback must be used inside HrmFeedbackProvider');
  }
  return context;
}
