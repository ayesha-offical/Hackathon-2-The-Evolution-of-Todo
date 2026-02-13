/**
 * Task: T071 | Spec: @specs/001-sdd-initialization/ui/pages.md §Create Task Page
 * Task: T080 | Spec: @specs/001-sdd-initialization/ui/pages.md §TodoFusion Motion Design
 * Description: Page for creating new tasks with spring animations
 * Purpose: Allow users to create new tasks with title, description, and status
 * Reference: plan.md Step 5, Constitution III (User Isolation)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import TaskForm from '@/components/TaskForm';
import { ErrorAlert, SuccessToast, AlertContainer } from '@/components/common/Alert';
import { apiCall } from '@/lib/api';
import { ROUTES, TASK_STATUS } from '@/config/constants';
import { ANIMATION_VARIANTS } from '@/config/animations';
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
            Create New Task
          </motion.h1>
          <motion.p
            className="text-gray-600 mt-2"
            variants={ANIMATION_VARIANTS.listItem}
            initial="hidden"
            animate="visible"
          >
            Add a new task to your list. Fill in the title and optionally add a description.
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
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          variants={ANIMATION_VARIANTS.listItem}
          initial="hidden"
          animate="visible"
        >
          <TaskForm
            task={undefined} // New task - no initial data
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </motion.div>

        {/* Form Help Text */}
        <motion.div
          className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
          variants={ANIMATION_VARIANTS.listItem}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-sm font-medium text-blue-900 mb-2">Tips for creating tasks</h3>
          <motion.ul
            className="text-sm text-blue-800 space-y-1"
            variants={ANIMATION_VARIANTS.listContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              'Use clear, descriptive titles (1-255 characters)',
              'Add details in the description if needed (0-2000 characters)',
              'Set an initial status (defaults to Pending)',
              'You can edit the task anytime after creation'
            ].map((tip, i) => (
              <motion.li
                key={i}
                variants={ANIMATION_VARIANTS.listItem}
                initial="hidden"
                animate="visible"
              >
                • {tip}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </main>
    </motion.div>
  );
}
