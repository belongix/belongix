// hooks/useJobs.ts — Jobs convenience hook with debounced search

import { useState, useEffect, useCallback, useRef } from 'react';
import { useJobStore, type JobFilters } from '../store/jobStore';
import { useAuthStore } from '../store/authStore';

export function useJobs(initialFilters: JobFilters = {}) {
  const { jobs, loading, appliedIds, loadJobs, applyToJob, loadAppliedIds } = useJobStore();
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<JobFilters>(initialFilters);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (user?.id) loadAppliedIds(user.id);
  }, [user?.id]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadJobs(filters);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [filters]);

  const apply = useCallback(async (jobId: string) => {
    if (!user?.id) throw new Error('Not authenticated');
    await applyToJob(jobId, user.id);
  }, [user?.id]);

  const filtered = jobs.filter(j => {
    if (filters.query &&
        !j.title.toLowerCase().includes(filters.query.toLowerCase()) &&
        !j.company.toLowerCase().includes(filters.query.toLowerCase())) return false;
    if (filters.city && j.city !== filters.city) return false;
    if (filters.jobType && j.job_type !== filters.jobType) return false;
    return true;
  });

  return {
    jobs: filtered,
    allJobs: jobs,
    loading,
    appliedIds,
    filters,
    setFilters,
    apply,
    refresh: () => loadJobs(filters),
  };
}
