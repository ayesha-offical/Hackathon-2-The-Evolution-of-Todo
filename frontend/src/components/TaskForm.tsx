/**
 * Task: T068 | Spec: @specs/001-sdd-initialization/ui/pages.md §Create Task & Edit Task Pages
 * Task: T080 | Spec: @specs/001-sdd-initialization/ui/pages.md §TodoFusion Motion Design
 * Description: Reusable form for creating and editing tasks
 * Purpose: Single source of truth for task form validation and submission with spring animations
 * Reference: plan.md Step 5 §Key Design Pattern
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TASK_STATUS, TASK_VALIDATION } from '@/config/constants';
import { ANIMATION_VARIANTS, SPRING_CONFIGS } from '@/config/animations';

interface Task {
  id?: string;
  title: string;
  description?: string;
  status?: string;
  user_id?: string;
}

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * TaskForm Component
 *
 * Reusable form for:
 * - Creating new tasks
 * - Editing existing tasks
 *
 * Features:
 * - Title input (1-255 chars, character counter)
 * - Description textarea (0-2000 chars, character counter)
 * - Status dropdown (Pending, In Progress, Completed, Archived)
 * - Submit button (disabled until title filled)
 * - Cancel button
 * - Loading state during submission
 *
 * Validation:
 * - Title: required, 1-255 characters
 * - Description: optional, 0-2000 characters
 * - Status: one of allowed values
 */
export default function TaskForm({
  task,
  onSubmit,
  onCancel,
  isLoading = false,
}: TaskFormProps) {
  const [formData, setFormData] = useState<Task>({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || TASK_STATUS.PENDING,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < TASK_VALIDATION.TITLE_MIN_LENGTH) {
      newErrors.title = `Title must be at least ${TASK_VALIDATION.TITLE_MIN_LENGTH} character`;
    } else if (formData.title.length > TASK_VALIDATION.TITLE_MAX_LENGTH) {
      newErrors.title = `Title must not exceed ${TASK_VALIDATION.TITLE_MAX_LENGTH} characters`;
    }

    // Description validation
    if (
      formData.description &&
      formData.description.length > TASK_VALIDATION.DESCRIPTION_MAX_LENGTH
    ) {
      newErrors.description = `Description must not exceed ${TASK_VALIDATION.DESCRIPTION_MAX_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to save task',
      });
    }
  };

  // Handle field change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (touched[name] && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle field blur
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate on blur
    validate();
  };

  const isSubmitDisabled =
    !formData.title || isLoading || Object.keys(errors).length > 0;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={ANIMATION_VARIANTS.listContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Submit Error */}
      {errors.submit && (
        <motion.div
          className="alert alert-error"
          variants={ANIMATION_VARIANTS.listItem}
          initial="hidden"
          animate="visible"
        >
          <p className="text-sm">{errors.submit}</p>
        </motion.div>
      )}

      {/* Title Field */}
      <motion.div
        variants={ANIMATION_VARIANTS.listItem}
        initial="hidden"
        animate="visible"
      >
        <label htmlFor="title" className="label">
          Task Title <span className="label-required">*</span>
        </label>
        <div>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter task title"
            maxLength={TASK_VALIDATION.TITLE_MAX_LENGTH}
            className={`input-base ${
              touched.title && errors.title ? 'input-error' : ''
            }`}
            aria-invalid={touched.title && errors.title ? 'true' : 'false'}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
        </div>

        {/* Character Count */}
        <div className="mt-2 flex justify-between items-center">
          <div>
            {touched.title && errors.title && (
              <p id="title-error" className="text-sm text-error">
                {errors.title}
              </p>
            )}
          </div>
          <span className="text-xs text-text-muted">
            {formData.title.length} / {TASK_VALIDATION.TITLE_MAX_LENGTH}
          </span>
        </div>
      </motion.div>

      {/* Description Field */}
      <motion.div
        variants={ANIMATION_VARIANTS.listItem}
        initial="hidden"
        animate="visible"
      >
        <label htmlFor="description" className="label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter task description (optional)"
          maxLength={TASK_VALIDATION.DESCRIPTION_MAX_LENGTH}
          rows={4}
          className={`textarea-base ${
            touched.description && errors.description ? 'input-error' : ''
          }`}
          aria-invalid={touched.description && errors.description ? 'true' : 'false'}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />

        {/* Character Count */}
        <div className="mt-2 flex justify-between items-center">
          <div>
            {touched.description && errors.description && (
              <p id="description-error" className="text-sm text-error">
                {errors.description}
              </p>
            )}
          </div>
          <span className="text-xs text-text-muted">
            {formData.description ? formData.description.length : 0} /{' '}
            {TASK_VALIDATION.DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
      </motion.div>

      {/* Status Field */}
      <motion.div
        variants={ANIMATION_VARIANTS.listItem}
        initial="hidden"
        animate="visible"
      >
        <label htmlFor="status" className="label">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          onBlur={handleBlur}
          className="input-base"
          style={{
            colorScheme: 'dark'
          }}
        >
          <option value={TASK_STATUS.PENDING}>{TASK_STATUS.PENDING}</option>
          <option value={TASK_STATUS.IN_PROGRESS}>{TASK_STATUS.IN_PROGRESS}</option>
          <option value={TASK_STATUS.COMPLETED}>{TASK_STATUS.COMPLETED}</option>
          <option value={TASK_STATUS.ARCHIVED}>{TASK_STATUS.ARCHIVED}</option>
        </select>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex gap-4 justify-end pt-6 border-t border-border"
        variants={ANIMATION_VARIANTS.listItem}
        initial="hidden"
        animate="visible"
      >
        <motion.button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="btn-secondary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={SPRING_CONFIGS.primary}
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          disabled={isSubmitDisabled}
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={SPRING_CONFIGS.primary}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 animate-spin"
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
              Saving...
            </span>
          ) : task?.id ? (
            'Update Task'
          ) : (
            'Create Task'
          )}
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
