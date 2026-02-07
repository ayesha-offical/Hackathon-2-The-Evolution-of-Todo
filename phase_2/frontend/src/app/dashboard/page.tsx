"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { apiCall } from "@/lib/api";
import { ROUTES } from "@/config/constants";
import type { Task } from "@/types/task";
import { TaskStatus } from "@/types/task";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form & Edit state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  function startEdit(task: Task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
  }

  function cancelEdit() {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function handleUpdateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTaskId || !editTitle.trim()) return;
    try {
      setIsUpdating(true);
      setError(null);
      const response = await apiCall(`/api/v1/tasks/${editingTaskId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to update task");
      setTasks(tasks.map((t) =>
        t.id === editingTaskId
          ? { ...t, title: editTitle.trim(), description: editDescription.trim() || null }
          : t
      ));
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  }

  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall("/api/v1/tasks?page=1&limit=100");
      if (!response.ok) throw new Error(`Failed to load tasks`);
      const data = await response.json();
      setTasks(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      setIsCreating(true);
      const response = await apiCall("/api/v1/tasks", {
        method: "POST",
        body: JSON.stringify({ title: newTaskTitle.trim(), description: newTaskDescription.trim() || undefined }),
      });
      if (!response.ok) throw new Error("Failed to create task");
      setNewTaskTitle("");
      setNewTaskDescription("");
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggleComplete(task: Task) {
    try {
      const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
      const response = await apiCall(`/api/v1/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update");
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;
    try {
      const response = await apiCall(`/api/v1/tasks/${taskId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  /**
   * Redirect unauthenticated users to login
   * Safety check in case middleware fails
   */
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [authLoading, user, router]);

  /**
   * Load tasks when user is authenticated
   */
  useEffect(() => {
    if (!authLoading && user) {
      loadTasks();
    }
  }, [authLoading, user?.id]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 blur-xl bg-cyan-500/20 animate-pulse"></div>
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;

  return (
    <div className="min-h-screen bg-[#030712] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Welcome Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Workspace
            </h1>
            <p className="text-gray-400 mt-1">Welcome back, <span className="text-white font-medium">{user?.email?.split('@')[0]}</span></p>
          </div>
          
          {/* Stats Bar */}
          <div className="flex gap-4">
            <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Tasks</p>
              <p className="text-xl font-bold">{tasks.length}</p>
            </div>
            <div className="px-6 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md text-cyan-400">
              <p className="text-xs opacity-70 uppercase tracking-widest">Done</p>
              <p className="text-xl font-bold">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Create Task */}
          <div className="lg:col-span-1">
            <motion.div 
              className="sticky top-28 p-6 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
                Quick Add
              </h2>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all"
                />
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Details (optional)"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all resize-none"
                />
                <button
                  type="submit"
                  disabled={isCreating || !newTaskTitle.trim()}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
                >
                  {isCreating ? "Adding..." : "Add Task"}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Right Column: Task List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold mb-4 px-2">Active Tasks</h2>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            {loading ? (
               <div className="h-64 flex items-center justify-center text-gray-500 italic">Fetching your tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="p-12 text-center rounded-[2rem] border border-dashed border-white/10 text-gray-500">
                No tasks found. Start by adding one!
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all flex items-start gap-4"
                  >
                    <button 
                      onClick={() => handleToggleComplete(task)}
                      className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        task.status === TaskStatus.COMPLETED 
                        ? "bg-cyan-500 border-cyan-500" 
                        : "border-white/20 hover:border-cyan-500/50"
                      }`}
                    >
                      {task.status === TaskStatus.COMPLETED && <span className="text-black text-xs font-bold">✓</span>}
                    </button>

                    <div className="flex-1 min-w-0">
                      {editingTaskId === task.id ? (
                        <form onSubmit={handleUpdateTask} className="space-y-3">
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Title"
                            className="w-full bg-white/10 border border-cyan-500/50 rounded-lg px-3 py-2 text-sm font-bold text-white focus:border-cyan-500 outline-none"
                          />
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Description (optional)"
                            rows={2}
                            className="w-full bg-white/10 border border-cyan-500/50 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={isUpdating || !editTitle.trim()}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 disabled:opacity-50"
                            >
                              {isUpdating ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              disabled={isUpdating}
                              className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-400 text-sm hover:bg-white/20 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <h3 className={`font-bold text-lg transition-all ${task.status === TaskStatus.COMPLETED ? "text-gray-600 line-through" : "text-white"}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-gray-500 text-sm mt-1 line-clamp-1">{task.description}</p>
                          )}
                        </>
                      )}
                    </div>

                    {editingTaskId !== task.id && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          type="button"
                          onClick={() => startEdit(task)}
                          className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all"
                          title="Edit task"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          title="Delete task"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}