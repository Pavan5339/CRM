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
  
  // NEW: Global Leads state (with Inquiry sources)
  const [leads, setLeads] = useState(() => {
    const sources = ["Service Enquiry", "Expert Request", "Voice Requirement", "Partner Registration", "Contact Form"];
    return MOCK_DATA.leads.map((l, i) => ({
      ...l,
      source: sources[i % sources.length]
    }));
  });

  // NEW: Global Activities state
  const [activities, setActivities] = useState(() => {
    const actionTypes = ['registered', 'logged in', 'profile updated', 'AI profile submitted', 'agreement signed', 'requirement submitted', 'WhatsApp sent', 'email sent', 'call completed', 'admin note added', 'status changed'];
    const mapped = MOCK_DATA.activities.map((a, i) => ({
      ...a,
      type: actionTypes[i % actionTypes.length]
    }));
    return mapped.sort((x, y) => new Date(y.date) - new Date(x.date));
  });

  const addActivity = (newActivity) => {
    setActivities(prev => [newActivity, ...prev]);
  };

  // NEW: Followups state
  const [followups, setFollowups] = useState([
    { id: "FWP001", leadId: 1, type: "Service Enquiry", title: "New inquiry from Acme Corp", priority: "High", dueDate: "2026-05-24", dueTime: "10:00 AM", status: "New", assigneeId: "u1", notes: "Inquired about enterprise SLA", created: "May 24, 2026" },
    { id: "FWP002", leadId: 3, type: "Expert Request", title: "Consultation request from Tony Stark", priority: "High", dueDate: "2026-05-24", dueTime: "11:30 AM", status: "In Progress", assigneeId: "u2", notes: "Needs details on integration APIs", created: "May 23, 2026" },
    { id: "FWP003", leadId: 7, type: "Voice Requirement", title: "Cyberdyne voice prompt setup", priority: "Medium", dueDate: "2026-05-25", dueTime: "02:00 PM", status: "New", assigneeId: "u3", notes: "Submitted voice form with strict guidelines", created: "May 24, 2026" },
    { id: "FWP004", leadId: 2, type: "Partner Registration", title: "Review Global Tech partner profile", priority: "Medium", dueDate: "2026-05-22", dueTime: "09:00 AM", status: "Overdue", assigneeId: "u1", notes: "Profile is 60% complete, missing agreement", created: "May 20, 2026" },
    { id: "FWP005", leadId: 4, type: "Contact Form", title: "General inquiry from Bruce Wayne", priority: "Low", dueDate: "2026-05-26", dueTime: "-", status: "New", assigneeId: "u3", notes: "Questions about bulk pricing", created: "May 24, 2026" }
  ]);

  const addFollowup = (newFollowup) => {
    setFollowups(prev => [newFollowup, ...prev]);
  };

  const updateFollowup = (id, updates) => {
    setFollowups(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteFollowup = (id) => {
    setFollowups(prev => prev.filter(f => f.id !== id));
  };

  // NEW: Campaigns (Sequences) state
  const [campaigns, setCampaigns] = useState(MOCK_DATA.campaigns || []);
  const [enrollments, setEnrollments] = useState(MOCK_DATA.enrollments || []);

  const addCampaign = (campaign) => setCampaigns(prev => [...prev, campaign]);
  const updateCampaign = (id, updates) => setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  const deleteCampaign = (id) => setCampaigns(prev => prev.filter(c => c.id !== id));

  const enrollLead = (leadId, campaignId) => {
    const newEnrollment = {
      id: `ENR-${Date.now()}`,
      leadId,
      campaignId,
      currentStep: 1,
      enrolledAt: new Date().toISOString(),
      status: "Active"
    };
    setEnrollments(prev => [...prev, newEnrollment]);
  };

  const updateEnrollment = (id, updates) => setEnrollments(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const addTask = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
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
  const canManageSystemSettings = currentUser.role === "admin";
  const canManageEmailTemplates = currentUser.role === "admin";
  const canDeleteLeads = ["admin", "manager"].includes(currentUser.role);
  const isReadOnly = currentUser.role === "viewer";

  return (
    <CrmContext.Provider
      value={{
        currentUser,
        isDarkMode,
        toggleDarkMode,
        isSidebarCollapsed,
        toggleSidebar,
        tasks,
        setTasks,
        updateTask,
        addTask,
        activities,
        setActivities,
        addActivity,
        followups,
        setFollowups,
        addFollowup,
        updateFollowup,
        deleteFollowup,
        campaigns,
        setCampaigns,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        enrollments,
        setEnrollments,
        enrollLead,
        updateEnrollment,
        leads,
        setLeads,
        permissions: {
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
