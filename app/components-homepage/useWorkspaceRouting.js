'use client';

const DEFAULT_WORKSPACE_STATE = {
  isAuthenticated: true,
  accountType: 'admin',
  workspaceHref: '/other-modules/crm',
  taskManagerHref: '/other-modules/crm',
  user: {
    name: 'BNC Admin',
    email: 'admin@bnc.com',
    employeeId: 'BNC-001',
  },
  modules: {
    taskManager: { enabled: false, href: null },
    hrm: { enabled: false, href: null },
    auditing: { enabled: false, href: null },
    crm: { enabled: true, href: '/other-modules/crm' },
  },
};

export function useWorkspaceRouting() {
  return DEFAULT_WORKSPACE_STATE;
}
