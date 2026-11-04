import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { issueService } from '../services/issueService';
import { adminService } from '../services/adminService';

const IssueContext = createContext(null);

export function IssueProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await adminService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.warn('Failed to fetch categories:', err);
    }
  }, []);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await issueService.getIssues({ limit: 100 });
      setIssues(res.items || []);
    } catch (err) {
      console.warn('Failed to fetch issues:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchIssues();
  }, [fetchCategories, fetchIssues, refreshTrigger]);

  const reloadData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <IssueContext.Provider
      value={{
        categories,
        issues,
        loading,
        reloadData,
      }}
    >
      {children}
    </IssueContext.Provider>
  );
}

export function useIssues() {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
}
