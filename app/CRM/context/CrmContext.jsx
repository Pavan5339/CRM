"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import MOCK_DATA from "../data/mockData.json";

export const MOCK_USERS = {
  admin: { id: "u1", name: "Alice Admin", role: "admin" },
  manager: { id: "u2", name: "Bob Manager", role: "manager" },
  sales: { id: "u3", name: "Charlie Sales", role: "sales" },
  viewer: { id: "u4", name: "Dave Viewer", role: "viewer" },
};

const CrmContext = createContext(null);

export function CrmProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(MOCK_USERS.admin);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState(MOCK_DATA.tasks);

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const addTask = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
  };

  // Quick helper to switch users
  const switchUser = (roleKey) => {
    if (MOCK_USERS[roleKey]) {
      setCurrentUser(MOCK_USERS[roleKey]);
    }
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  // Optional: check localStorage for theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("crm-theme");
    // eslint-disable-next-line
    if (savedTheme === "dark") setIsDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("crm-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // RBAC helpers
  const canManageUsers = currentUser.role === "admin";
  const canManageSystemSettings = currentUser.role === "admin";
  const canManageEmailTemplates = currentUser.role === "admin";
  const canDeleteLeads = ["admin", "manager"].includes(currentUser.role);
  const isReadOnly = currentUser.role === "viewer";

  return (
    <CrmContext.Provider
      value={{
        currentUser,
        switchUser,
        isDarkMode,
        toggleDarkMode,
        isSidebarCollapsed,
        toggleSidebar,
        tasks,
        setTasks,
        updateTask,
        addTask,
        permissions: {
          canManageUsers,
          canManageSystemSettings,
          canManageEmailTemplates,
          canDeleteLeads,
          isReadOnly,
        },
      }}
    >
      <div className={isDarkMode ? "dark" : ""}>{children}</div>
    </CrmContext.Provider>
  );
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error("useCrm must be used within a CrmProvider");
  }
  return context;
}
