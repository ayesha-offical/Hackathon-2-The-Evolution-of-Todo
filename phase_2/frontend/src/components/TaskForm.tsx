/**
 * Task: T068 | Spec: @specs/001-sdd-initialization/ui/pages.md §Create Task & Edit Task Pages
 * Description: Reusable form for creating and editing tasks
 * Purpose: Single source of truth for task form validation and submission
 * Reference: plan.md Step 5 §Key Design Pattern
 */

'use client';

import { useState, useEffect } from 'react';
import { TASK_STATUS, TASK_VALIDATION } from '@/config/constants';

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Submit Error */}
      {errors.submit && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{errors.submit}</p>
        </div>
      )}

      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
          Task Title <span className="text-red-600">*</span>
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
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              touched.title && errors.title
                ? 'border-red-600 bg-red-50'
                : 'border-gray-300'
            }`}
            aria-invalid={touched.title && errors.title ? 'true' : 'false'}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
        </div>

        {/* Character Count */}
        <div className="mt-1 flex justify-between items-center">
          <div>
            {touched.title && errors.title && (
              <p id="title-error" className="text-sm text-red-600">
                {errors.title}
              </p>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {formData.title.length} / {TASK_VALIDATION.TITLE_MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* Description Field */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-900 mb-2"
        >
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
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            touched.description && errors.description
              ? 'border-red-600 bg-red-50'
              : 'border-gray-300'
          }`}
          aria-invalid={touched.description && errors.description ? 'true' : 'false'}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />

        {/* Character Count */}
        <div className="mt-1 flex justify-between items-center">
          <div>
            {touched.description && errors.description && (
              <p id="description-error" className="text-sm text-red-600">
                {errors.description}
              </p>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {formData.description ? formData.description.length : 0} /{' '}
            {TASK_VALIDATION.DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* Status Field */}
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-900 mb-2"
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value={TASK_STATUS.PENDING}>{TASK_STATUS.PENDING}</option>
          <option value={TASK_STATUS.IN_PROGRESS}>{TASK_STATUS.IN_PROGRESS}</option>
          <option value={TASK_STATUS.COMPLETED}>{TASK_STATUS.COMPLETED}</option>
          <option value={TASK_STATUS.ARCHIVED}>{TASK_STATUS.ARCHIVED}</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        </button>
      </div>
    </form>
  );
}
