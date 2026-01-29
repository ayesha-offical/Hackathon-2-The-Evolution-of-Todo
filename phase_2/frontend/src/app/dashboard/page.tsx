/**
 * Task: T070 | Spec: @specs/001-sdd-initialization/ui/pages.md §Dashboard Page
 * Description: Dashboard page with task list and CRUD operations
 * Purpose: Display and manage user's tasks with full CRUD functionality
 * Reference: Constitution III (User Isolation), plan.md Step 5
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { apiCall } from "@/lib/api";
import type { Task, TaskCreate } from "@/types/task";
import { TaskStatus } from "@/types/task";
import { ANIMATION_VARIANTS, SPRING_CONFIGS } from "@/config/animations";

/**
 * Dashboard page component
 *
 * Features:
 * - Display list of user's tasks
 * - Create new task with simple form
 * - Mark tasks as complete
 * - Delete tasks
 * - User isolation enforced via JWT (Constitution III)
 *
 * Reference:
 * - UI spec: @specs/001-sdd-initialization/ui/pages.md §Dashboard Page
 * - API spec: rest-endpoints.md §Task CRUD endpoints
 * - User Story: US-Task-1, US-Task-2, US-Task-4
 */
export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  /**
   * Load tasks from API
   * Constitution III: User isolation enforced by backend filtering by user_id
   */
  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall("/api/v1/tasks?page=1&limit=100");

      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.statusText}`);
      }

      const data = await response.json();
      setTasks(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Create new task
   * Constitution III: user_id automatically assigned from JWT on backend
   */
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();

    if (!newTaskTitle.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const taskData: TaskCreate = {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
      };

      const response = await apiCall("/api/v1/tasks", {
        method: "POST",
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task");
      }

      // Clear form
      setNewTaskTitle("");
      setNewTaskDescription("");

      // Reload tasks
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsCreating(false);
    }
  }

  /**
   * Toggle task completion status
   */
  async function handleToggleComplete(task: Task) {
    try {
      const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;

      const response = await apiCall(`/api/v1/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      // Update local state
      setTasks(tasks.map(t =>
        t.id === task.id ? { ...t, status: newStatus } : t
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  }

  /**
   * Delete task
   * Constitution III: Backend verifies user owns the task before deletion
   */
  async function handleDeleteTask(taskId: string) {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const response = await apiCall(`/api/v1/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      // Remove from local state
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  }

  /**
   * Load tasks on component mount
   */
  useEffect(() => {
    if (!authLoading && user) {
      loadTasks();
    }
  }, [authLoading, user]);

  // Show loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show error if not authenticated (should not happen due to middleware)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Please log in to access the dashboard</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper max-w-6xl py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary">
            Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-text-secondary">
            Welcome, {user.email}
          </p>
        </div>

        {/* Error Alert - Responsive */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 alert alert-error"
              variants={ANIMATION_VARIANTS.slideInFromRight}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: 100 }}
            >
              <p className="text-xs sm:text-sm font-medium">
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs sm:text-sm text-error-light hover:text-error underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Task Form - Responsive */}
        <motion.div
          className="card mb-8"
          variants={ANIMATION_VARIANTS.appear}
          initial="hidden"
          animate="visible"
        >
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">
              Create New Task
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label htmlFor="title" className="label">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="input-base w-full text-sm sm:text-base"
                  disabled={isCreating}
                  required
                  maxLength={255}
                />
              </div>

              <div>
                <label htmlFor="description" className="label">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Enter task description"
                  className="textarea-base w-full text-sm sm:text-base"
                  disabled={isCreating}
                  rows={3}
                  maxLength={2000}
                />
              </div>

              <motion.button
                type="submit"
                disabled={isCreating || !newTaskTitle.trim()}
                className="btn-primary w-full text-sm sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={SPRING_CONFIGS.primary}
              >
                {isCreating ? "Creating..." : "Create Task"}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Task List - Responsive Grid */}
        <div className="card">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">
              My Tasks ({tasks.length})
            </h2>

            {loading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-sm sm:text-base text-text-secondary">Loading tasks...</div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-sm sm:text-base text-text-secondary">
                  No tasks yet. Create one to get started!
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div
                  className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6"
                  variants={ANIMATION_VARIANTS.listContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      className="card-interactive group"
                      variants={ANIMATION_VARIANTS.listItem}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 p-3 sm:p-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={task.status === "Completed"}
                        onChange={() => handleToggleComplete(task)}
                        className="h-5 w-5 rounded accent-primary bg-background-surface/50 border border-primary/30 flex-shrink-0"
                      />

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-base sm:text-lg font-medium break-words transition-colors ${
                            task.status === TaskStatus.COMPLETED
                              ? "line-through text-text-muted"
                              : "text-text-primary group-hover:text-primary"
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="mt-1 text-xs sm:text-sm text-text-secondary line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs text-text-muted">
                          <span
                            className={`px-2 py-1 rounded-md w-fit border font-medium ${
                              task.status === TaskStatus.COMPLETED
                                ? "bg-success/20 text-success-light border-success/30"
                                : task.status === TaskStatus.IN_PROGRESS
                                ? "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30"
                                : "bg-primary/20 text-primary-300 border-primary/30"
                            }`}
                          >
                            {task.status}
                          </span>
                          <span className="text-xs">
                            Created: {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <motion.button
                        onClick={() => handleDeleteTask(task.id)}
                        className="btn-ghost text-xs sm:text-sm px-3 py-1 text-error hover:text-error-light opacity-0 group-hover:opacity-100 transition-opacity w-full sm:w-auto"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={SPRING_CONFIGS.primary}
                      >
                        Delete
                      </motion.button>
                    </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
