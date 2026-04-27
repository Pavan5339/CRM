'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const DEFAULT_WORKSPACE_STATE = {
  isAuthenticated: false,
  accountType: null,
  workspaceHref: '/login',
  taskManagerHref: '/login',
  user: null,
  modules: {
    taskManager: { enabled: false, href: null },
    hrm: { enabled: false, href: null },
    auditing: { enabled: false, href: null },
    crm: { enabled: false, href: null },
  },
};

export function useWorkspaceRouting() {
  const [workspaceState, setWorkspaceState] = useState(DEFAULT_WORKSPACE_STATE);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const loadWorkspaceState = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        setWorkspaceState(DEFAULT_WORKSPACE_STATE);
        return;
      }

      try {
        const response = await fetch('/api/auth/context', {
          method: 'GET',
          credentials: 'include',
        });

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setWorkspaceState({
            isAuthenticated: true,
            accountType: null,
            workspaceHref: '/login',
            taskManagerHref: '/login',
            user: null,
            modules: DEFAULT_WORKSPACE_STATE.modules,
          });
          return;
        }

        const result = await response.json();

        setWorkspaceState({
          isAuthenticated: Boolean(result?.authenticated),
          accountType: result?.accountType || null,
          workspaceHref: result?.workspaceHref || result?.destination || '/login',
          taskManagerHref: result?.taskManagerHref || '/login',
          user: result?.user || null,
          modules: result?.modules || DEFAULT_WORKSPACE_STATE.modules,
        });
      } catch {
        if (isMounted) {
          setWorkspaceState({
            isAuthenticated: true,
            accountType: null,
            workspaceHref: '/login',
            taskManagerHref: '/login',
            user: null,
            modules: DEFAULT_WORKSPACE_STATE.modules,
          });
        }
      }
    };

    loadWorkspaceState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadWorkspaceState();
    });

    const handleFocus = () => {
      loadWorkspaceState();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return workspaceState;
}
