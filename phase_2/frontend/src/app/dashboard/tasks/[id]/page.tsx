/**
 * Task: T072 | Spec: @specs/001-sdd-initialization/ui/pages.md §Edit Task Page
 * Task: T080 | Spec: @specs/001-sdd-initialization/ui/pages.md §TodoFusion Motion Design
 * Description: Page for editing and deleting existing tasks with spring animations
 * Purpose: Allow users to edit task details and delete tasks with confirmation
 * Reference: plan.md Step 5, Constitution III (User Isolation)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import TaskForm from '@/components/TaskForm';
import { ErrorAlert, SuccessToast, AlertContainer } from '@/components/common/Alert';
import { apiCall } from '@/lib/api';
import { ROUTES, TASK_STATUS } from '@/config/constants';
import { ANIMATION_VARIANTS, SPRING_CONFIGS } from '@/config/animations';
import type { Task, ErrorResponse } from '@/types';

/**
 * Edit Task Page
 *
 * Protected route - requires authentication
 * Dynamic route parameter: [id] - the task ID to edit
 *
 * Features:
 * - Pre-filled TaskForm with existing task data
 * - Submit handler: PATCH /api/v1/tasks/{id}
 * - Delete button with confirmation modal
 * - Success handling: show toast, redirect to dashboard
 * - Error handling: display error alert
 * - Unsaved changes warning
 * - Task metadata display (created_at, updated_at)
 *
 * User Isolation:
 * - Backend fetches task and verifies ownership via JWT user_id
 * - User cannot access other users' tasks (404 if not owned)
 * - Task is updated only for authenticated user
 */
export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Fetch task data on component mount
   * GET /api/v1/tasks/{id}
   *
   * If task not found or user doesn't own it:
   * - Backend returns 404
   * - Display error and offer navigation back
   */
  useEffect(() => {
    const fetchTask = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiCall(`/api/v1/tasks/${taskId}`, {
          method: 'GET',
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Task not found');
          }
          const errorData: ErrorResponse = await response.json();
          throw new Error(errorData.detail || 'Failed to load task');
        }

        const fetchedTask: Task = await response.json();
        setTask(fetchedTask);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load task';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  /**
   * Handle form submission
   *
   * Calls: PATCH /api/v1/tasks/{id}
   * Body: { title, description?, status }
   *
   * Constitution III: User isolation enforced by backend filtering by JWT user_id
   */
  const handleSubmit = async (formData: Partial<Task>) => {
    setIsSaving(true);
    setError(null);

    try {
      // Prepare request body (exclude id and user_id as they're immutable)
      const updateTaskData = {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status || TASK_STATUS.PENDING,
      };

      // Call backend API with Bearer token
      const response = await apiCall(`/api/v1/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateTaskData),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.detail || 'Failed to update task');
      }

      const updatedTask: Task = await response.json();
      setTask(updatedTask);

      // Show success message
      setSuccess('Task updated successfully!');
      setHasChanges(false);

      // Redirect to dashboard after brief delay to show success message
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      setIsSaving(false);
    }
  };

  /**
   * Handle delete button
   * Shows confirmation modal before proceeding
   */
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  /**
   * Confirm and execute delete
   *
   * Calls: DELETE /api/v1/tasks/{id}
   * On success: redirect to /dashboard
   *
   * Constitution III: User isolation enforced by backend
   */
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await apiCall(`/api/v1/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.detail || 'Failed to delete task');
      }

      // Task deleted successfully, redirect to dashboard
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  /**
   * Handle cancel button
   * Returns to dashboard without saving
   */
  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmed) {
        return;
      }
    }
    router.push(ROUTES.DASHBOARD);
  };

  /**
   * Format timestamp to relative format
   */
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen bg-gray-50"
        variants={ANIMATION_VARIANTS.appear}
        initial="hidden"
        animate="visible"
      >
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="flex items-center justify-center py-12"
            variants={ANIMATION_VARIANTS.appear}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="text-center"
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <svg
                className="w-8 h-8 mx-auto mb-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <motion.p
                className="text-gray-600 mt-2"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Loading task...
              </motion.p>
            </motion.div>
          </motion.div>
        </main>
      </motion.div>
    );
  }

  // Error state (task not found)
  if (!task && error) {
    return (
      <motion.div
        className="min-h-screen bg-gray-50"
        variants={ANIMATION_VARIANTS.appear}
        initial="hidden"
        animate="visible"
      >
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AlertContainer>
            <AnimatePresence>
              <motion.div
                variants={ANIMATION_VARIANTS.slideInFromRight}
                initial="hidden"
                animate="visible"
              >
                <ErrorAlert
                  message={error}
                  onClose={() => setError(null)}
                />
              </motion.div>
            </AnimatePresence>
          </AlertContainer>
          <motion.div
            className="mt-6"
            variants={ANIMATION_VARIANTS.listItem}
            initial="hidden"
            animate="visible"
          >
            <Link
              href={ROUTES.DASHBOARD}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← Back to Tasks
            </Link>
          </motion.div>
        </main>
      </motion.div>
    );
  }

  // Task loaded successfully
  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      variants={ANIMATION_VARIANTS.appear}
      initial="hidden"
      animate="visible"
    >
      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          className="mb-8"
          variants={ANIMATION_VARIANTS.listContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Back Link */}
          <motion.div
            variants={ANIMATION_VARIANTS.listItem}
            initial="hidden"
            animate="visible"
          >
            <Link
              href={ROUTES.DASHBOARD}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
            >
              ← Back to Tasks
            </Link>
          </motion.div>

          <motion.h1
            className="text-3xl font-bold text-gray-900"
            variants={ANIMATION_VARIANTS.listItem}
            initial="hidden"
            animate="visible"
          >
            Edit Task
          </motion.h1>
          <motion.p
            className="text-gray-600 mt-2"
            variants={ANIMATION_VARIANTS.listItem}
            initial="hidden"
            animate="visible"
          >
            Update task details below or delete the task permanently.
          </motion.p>
        </motion.div>

        {/* Alerts */}
        <AlertContainer>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                variants={ANIMATION_VARIANTS.slideInFromRight}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <ErrorAlert
                  message={error}
                  onClose={() => setError(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {success && (
              <motion.div
                key="success"
                variants={ANIMATION_VARIANTS.slideInFromRight}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <SuccessToast
                  message={success}
                  onClose={() => setSuccess(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </AlertContainer>

        {/* Task Form */}
        <AnimatePresence mode="wait">
          {task && (
            <motion.div
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              key="task-form"
              variants={ANIMATION_VARIANTS.listItem}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <TaskForm
                task={task}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSaving}
              />

              {/* Metadata Display */}
              <motion.div
                className="mt-8 pt-6 border-t border-gray-200 space-y-2"
                variants={ANIMATION_VARIANTS.listContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  variants={ANIMATION_VARIANTS.listItem}
                  initial="hidden"
                  animate="visible"
                >
                  <div>
                    <motion.p
                      className="text-sm text-gray-500"
                      variants={ANIMATION_VARIANTS.listItem}
                      initial="hidden"
                      animate="visible"
                    >
                      Created: <span className="font-medium text-gray-700">
                        {formatRelativeTime(task.created_at)}
                      </span>
                    </motion.p>
                  </div>
                  <div>
                    <motion.p
                      className="text-sm text-gray-500"
                      variants={ANIMATION_VARIANTS.listItem}
                      initial="hidden"
                      animate="visible"
                    >
                      Updated: <span className="font-medium text-gray-700">
                        {formatRelativeTime(task.updated_at)}
                      </span>
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Delete Section */}
              <motion.div
                className="mt-8 pt-6 border-t border-gray-200"
                variants={ANIMATION_VARIANTS.listItem}
                initial="hidden"
                animate="visible"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Danger Zone</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Once you delete a task, there is no going back.
                    </p>
                  </div>
                  <motion.button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={SPRING_CONFIGS.primary}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Task'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              variants={ANIMATION_VARIANTS.overlayFade}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.div
                className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6"
                variants={ANIMATION_VARIANTS.appear}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <motion.h2
                  className="text-lg font-bold text-gray-900 mb-4"
                  variants={ANIMATION_VARIANTS.listItem}
                  initial="hidden"
                  animate="visible"
                >
                  Delete Task?
                </motion.h2>
                <motion.p
                  className="text-gray-600 mb-6"
                  variants={ANIMATION_VARIANTS.listItem}
                  initial="hidden"
                  animate="visible"
                >
                  Are you sure you want to delete this task? This action cannot be undone.
                </motion.p>
                <motion.div
                  className="flex gap-4 justify-end"
                  variants={ANIMATION_VARIANTS.listContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    variants={ANIMATION_VARIANTS.listItem}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={SPRING_CONFIGS.primary}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    variants={ANIMATION_VARIANTS.listItem}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={SPRING_CONFIGS.primary}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
