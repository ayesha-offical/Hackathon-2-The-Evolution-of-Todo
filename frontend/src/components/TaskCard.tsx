/**
 * Task: T067 | Spec: @specs/001-sdd-initialization/ui/pages.md §Task Card Component
 * Task: T080 | Spec: @specs/001-sdd-initialization/ui/pages.md §TodoFusion Motion Design
 * Description: Task card component displaying task with status badge, actions
 * Purpose: Reusable card for displaying task in list or dashboard with spring animations
 * Reference: plan.md Step 5 §Key Design Pattern, Constitution III (User Isolation)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { TASK_STATUS } from '@/config/constants';
import { ANIMATION_VARIANTS, SPRING_CONFIGS } from '@/config/animations';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string; // From JWT - ensures user isolation
}

interface TaskCardProps {
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

/**
 * TaskCard Component
 *
 * Displays a single task with:
 * - Checkbox (visual feedback, not backend update)
 * - Title (clickable to edit)
 * - First line of description
 * - Status badge with color coding
 * - Relative timestamp ("2 hours ago")
 * - Edit button
 * - Delete button (via onDelete callback)
 *
 * User Isolation: Task.user_id must match authenticated user_id
 * This component is rendered only for tasks belonging to current user.
 */
export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get status badge color
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      [TASK_STATUS.PENDING]: 'bg-primary/30 text-primary-300 border border-primary/50 backdrop-blur-sm',
      [TASK_STATUS.IN_PROGRESS]: 'bg-accent-blue/30 text-accent-blue border border-accent-blue/50 backdrop-blur-sm',
      [TASK_STATUS.COMPLETED]: 'bg-success/30 text-success-light border border-success/50 backdrop-blur-sm',
      [TASK_STATUS.ARCHIVED]: 'bg-white/20 text-white/80 border border-white/30 backdrop-blur-sm',
    };
    return colors[status] || 'bg-primary/30 text-primary-300 border border-primary/50 backdrop-blur-sm';
  };

  // Format relative time
  const relativeTime = formatDistanceToNow(new Date(task.created_at), {
    addSuffix: true,
  });

  // Get first line of description
  const descriptionPreview = task.description
    ? task.description.split('\n')[0].substring(0, 100)
    : '';

  const handleDelete = async () => {
    if (window.confirm('Are you sure? This task will be permanently deleted.')) {
      setIsDeleting(true);
      try {
        onDelete(task.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:bg-white/10 transition-all duration-300 group shadow-card"
      variants={ANIMATION_VARIANTS.cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      <div className="flex gap-4">
        {/* Checkbox */}
        <motion.div
          className="flex items-center pt-1"
          whileTap="active"
          variants={ANIMATION_VARIANTS.scaleBounce}
          initial="rest"
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="w-5 h-5 bg-white/10 border border-primary/50 rounded cursor-pointer accent-primary backdrop-blur-sm"
            aria-label={`Mark task "${task.title}" as complete`}
          />
        </motion.div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Status */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <button
              onClick={() => onEdit(task.id)}
              className="text-left font-semibold text-white hover:text-primary transition-colors truncate flex-1 group-hover:text-primary"
            >
              {task.title}
            </button>
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap flex-shrink-0 ${getStatusColor(
                task.status
              )}`}
            >
              {task.status}
            </span>
          </div>

          {/* Description Preview */}
          {descriptionPreview && (
            <p className="text-white/60 text-sm mb-2 line-clamp-2">
              {descriptionPreview}
              {task.description && task.description.length > 100 && '...'}
            </p>
          )}

          {/* Metadata */}
          <div className="text-white/40 text-xs">
            Created {relativeTime}
          </div>
        </div>

        {/* Actions */}
        <motion.div
          className="flex gap-2 items-start opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          transition={SPRING_CONFIGS.smooth}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={SPRING_CONFIGS.primary}
          >
            <Link
              href={`/dashboard/tasks/${task.id}`}
              className="text-xs py-1 px-3 rounded-lg bg-primary/30 hover:bg-primary/50 text-white font-medium transition-all"
              title="Edit task"
            >
              Edit
            </Link>
          </motion.div>
          <motion.button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs py-1 px-3 rounded-lg bg-error/30 hover:bg-error/50 text-error-light font-medium transition-all disabled:opacity-50"
            title="Delete task"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={SPRING_CONFIGS.primary}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
