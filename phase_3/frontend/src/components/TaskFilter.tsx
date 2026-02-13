/**
 * Task: T074 | Spec: @specs/001-sdd-initialization/ui/pages.md §Dashboard Page
 * Description: Task filter and sort component
 * Purpose: Allow users to filter tasks by status and sort results
 * Reference: plan.md Step 5 §Key Design Pattern
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { TASK_STATUS } from '@/config/constants';

interface TaskFilterProps {
  currentFilter: string;
  currentSort: string;
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
}

/**
 * TaskFilter Component
 *
 * Features:
 * - Status filter: All, Pending, In Progress, Completed, Archived
 * - Sort options: Newest, Oldest, Title A-Z
 * - Saves filter state to URL query params for persistence
 * - Persists across page reloads
 */
export default function TaskFilter({
  currentFilter,
  currentSort,
  onFilterChange,
  onSortChange,
}: TaskFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value;
    onFilterChange(newFilter);

    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (newFilter === 'All') {
      params.delete('status');
    } else {
      params.set('status', newFilter);
    }
    params.set('page', '1'); // Reset to page 1 when filtering
    router.push(`?${params.toString()}`);
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    onSortChange(newSort);

    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (newSort === 'Newest') {
      params.delete('sort');
    } else {
      params.set('sort', newSort);
    }
    params.set('page', '1'); // Reset to page 1 when sorting
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Status Filter */}
      <div className="flex-1">
        <label htmlFor="status-filter" className="label">
          Filter by Status
        </label>
        <select
          id="status-filter"
          value={currentFilter}
          onChange={handleFilterChange}
          className="input-base"
          style={{
            colorScheme: 'dark'
          }}
        >
          <option value="All">All Tasks</option>
          <option value={TASK_STATUS.PENDING}>{TASK_STATUS.PENDING}</option>
          <option value={TASK_STATUS.IN_PROGRESS}>
            {TASK_STATUS.IN_PROGRESS}
          </option>
          <option value={TASK_STATUS.COMPLETED}>
            {TASK_STATUS.COMPLETED}
          </option>
          <option value={TASK_STATUS.ARCHIVED}>{TASK_STATUS.ARCHIVED}</option>
        </select>
      </div>

      {/* Sort Dropdown */}
      <div className="flex-1">
        <label htmlFor="sort-options" className="label">
          Sort by
        </label>
        <select
          id="sort-options"
          value={currentSort}
          onChange={handleSortChange}
          className="input-base"
          style={{
            colorScheme: 'dark'
          }}
        >
          <option value="Newest">Newest First</option>
          <option value="Oldest">Oldest First</option>
          <option value="Title A-Z">Title A-Z</option>
        </select>
      </div>
    </div>
  );
}
