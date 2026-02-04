/**
 * Task: T070 | Spec: @specs/001-sdd-initialization/ui/pages.md §Dashboard Page
 * Description: Dashboard page with task list and CRUD operations
 * Purpose: Display and manage user's tasks with full CRUD functionality
 * Reference: Constitution III (User Isolation), plan.md Step 5
 * UI Redesign: Red/Coral sidebar, top bar, progress rings, task cards
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { apiCall } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ProgressRing from "@/components/ProgressRing";
import AddNewTaskModal from "@/components/AddNewTaskModal";
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

  // Track which task is being deleted (for loading state per task)
  const [deletingTaskIds, setDeletingTaskIds] = useState<Set<string>>(new Set());

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
   * T038: Shows loading spinner while deletion is in-flight
   */
  async function handleDeleteTask(taskId: string) {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      // T038: Show loading spinner for this specific task
      setDeletingTaskIds(prev => new Set([...prev, taskId]));
      setError(null);

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
    } finally {
      // Clear loading state for this task
      setDeletingTaskIds(prev => {
        const updated = new Set(prev);
        updated.delete(taskId);
        return updated;
      });
    }
  }

  /**
   * Load tasks on component mount or when user changes
   * Clear tasks when user logs out to prevent showing stale data
   */
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        // User logged in - load their tasks
        loadTasks();
      } else {
        // User logged out - clear tasks to prevent showing old user's data
        setTasks([]);
        setLoading(false);
      }
    }
  }, [authLoading, user?.id]); // Use user?.id instead of user to avoid unnecessary reloads

  // Calculate progress
  const completedCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const inProgressCount = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const notStartedCount = tasks.filter(t => t.status === TaskStatus.PENDING).length;

  const completedPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const inProgressPercentage = tasks.length > 0 ? Math.round((inProgressCount / tasks.length) * 100) : 0;
  const notStartedPercentage = tasks.length > 0 ? Math.round((notStartedCount / tasks.length) * 100) : 0;

  // Filter tasks based on search
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Please log in to access the dashboard</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Sidebar */}
      <Sidebar />

      {/* TopBar */}
      <TopBar onSearch={setSearchQuery} />

      {/* Main Content */}
      <main className="md:ml-64 mt-20 p-6 bg-background">
        <div className="content-wrapper max-w-7xl py-6 sm:py-8 lg:py-12">
        {/* Welcome Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Welcome back, {user.name || user.email.split('@')[0]} 👋</h1>
            <p className="mt-1 text-text-secondary">You have {tasks.length} tasks</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-accent text-sm px-6 py-3 hidden sm:block"
          >
            + Add New Task
          </button>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 alert alert-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="text-sm font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-sm text-error-dark hover:text-error underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Rings Section */}
        {tasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Task Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ProgressRing
                percentage={completedPercentage}
                label="Completed"
                color="green"
                size="md"
              />
              <ProgressRing
                percentage={inProgressPercentage}
                label="In Progress"
                color="blue"
                size="md"
              />
              <ProgressRing
                percentage={notStartedPercentage}
                label="Not Started"
                color="orange"
                size="md"
              />
              <div className="card p-6 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-primary mb-2">{tasks.length}</div>
                <p className="text-sm font-medium text-text-secondary">Total Tasks</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Add Task Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="sm:hidden mb-6 btn-accent w-full"
        >
          + Add New Task
        </button>

        {/* Tasks Section */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">My Tasks</h2>

          {loading ? (
            <div className="text-center py-12 card">
              <LoadingSpinner size="medium" />
              <p className="text-text-secondary mt-3">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 card">
              <p className="text-text-secondary text-lg">
                {searchQuery
                  ? `No tasks matching "${searchQuery}"`
                  : 'No tasks yet. Create one to get started!'}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary mt-4"
              >
                Create Your First Task
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                variants={ANIMATION_VARIANTS.listContainer}
                initial="hidden"
                animate="visible"
              >
                {filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    className="card overflow-hidden hover:shadow-card-hover transition-all"
                    variants={ANIMATION_VARIANTS.listItem}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <div className="p-6">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
                        {task.title}
                      </h3>

                      {/* Description */}
                      {task.description && (
                        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Status Badge */}
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                            task.status === TaskStatus.COMPLETED
                              ? 'bg-success'
                              : task.status === TaskStatus.IN_PROGRESS
                              ? 'bg-accent-blue'
                              : 'bg-warning'
                          }`}
                        >
                          {task.status}
                        </span>
                        <span className="text-xs text-text-muted ml-auto">
                          {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t border-border">
                        <motion.button
                          onClick={() => handleToggleComplete(task)}
                          className="btn-secondary flex-1 text-sm py-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {task.status === TaskStatus.COMPLETED ? 'Mark Pending' : 'Mark Done'}
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={deletingTaskIds.has(task.id)}
                          className="btn-destructive flex-1 text-sm py-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {deletingTaskIds.has(task.id) ? (
                            <span className="flex items-center justify-center gap-1">
                              <LoadingSpinner size="small" color="currentColor" />
                              <span>Deleting...</span>
                            </span>
                          ) : (
                            'Delete'
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Add New Task Modal */}
        <AddNewTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (formData) => {
            try {
              setError(null);
              const taskData: TaskCreate = {
                title: formData.title,
                description: formData.description || undefined,
              };

              const response = await apiCall('/api/v1/tasks', {
                method: 'POST',
                body: JSON.stringify(taskData),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create task');
              }

              await loadTasks();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to create task');
            }
          }}
        />
      </div>
    </main>
    </div>
  );
}
