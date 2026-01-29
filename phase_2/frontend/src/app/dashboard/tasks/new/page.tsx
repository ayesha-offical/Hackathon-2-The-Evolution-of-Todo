/**
 * Task: T071 | Spec: @specs/001-sdd-initialization/ui/pages.md §Create Task Page
 * Description: Page for creating new tasks
 * Purpose: Allow users to create new tasks with title, description, and status
 * Reference: plan.md Step 5, Constitution III (User Isolation)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TaskForm from '@/components/TaskForm';
import { ErrorAlert, SuccessToast, AlertContainer } from '@/components/common/Alert';
import { apiCall } from '@/lib/api';
import { ROUTES, TASK_STATUS } from '@/config/constants';
import type { Task, ErrorResponse } from '@/types';

/**
 * Create Task Page
 *
 * Protected route - requires authentication
 *
 * Features:
 * - TaskForm component for input
 * - Form validation (title required, length limits)
 * - Submit handler: POST /api/v1/tasks
 * - Success handling: show toast, redirect to dashboard
 * - Error handling: display error alert
 * - Cancel button: return to dashboard
 *
 * User Isolation:
 * - Backend associates task with authenticated user_id (from JWT)
 * - User cannot specify user_id in request body
 * - Task is automatically scoped to user_id from JWT claims
 */
export default function CreateTaskPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Handle form submission
   *
   * Calls: POST /api/v1/tasks
   * Body: { title, description?, status }
   * User ID is extracted from JWT by backend middleware
   *
   * Constitution III: User isolation enforced by backend filtering by JWT user_id
   */
  const handleSubmit = async (formData: Task) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare request body (exclude id and user_id as they're set by backend)
      const createTaskData = {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status || TASK_STATUS.PENDING,
      };

      // Call backend API with Bearer token
      const response = await apiCall('/api/v1/tasks', {
        method: 'POST',
        body: JSON.stringify(createTaskData),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.detail || 'Failed to create task');
      }

      const _createdTask: Task = await response.json();

      // Show success message
      setSuccess('Task created successfully!');

      // Redirect to dashboard after brief delay to show success message
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  /**
   * Handle cancel button
   * Returns to dashboard without saving
   */
  const handleCancel = () => {
    router.push(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          {/* Back Link */}
          <Link
            href={ROUTES.DASHBOARD}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            ← Back to Tasks
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
          <p className="text-gray-600 mt-2">
            Add a new task to your list. Fill in the title and optionally add a description.
          </p>
        </div>

        {/* Alerts */}
        <AlertContainer>
          {error && (
            <ErrorAlert
              message={error}
              onClose={() => setError(null)}
            />
          )}
          {success && (
            <SuccessToast
              message={success}
              onClose={() => setSuccess(null)}
            />
          )}
        </AlertContainer>

        {/* Task Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <TaskForm
            task={undefined} // New task - no initial data
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>

        {/* Form Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Tips for creating tasks</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use clear, descriptive titles (1-255 characters)</li>
            <li>• Add details in the description if needed (0-2000 characters)</li>
            <li>• Set an initial status (defaults to Pending)</li>
            <li>• You can edit the task anytime after creation</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
