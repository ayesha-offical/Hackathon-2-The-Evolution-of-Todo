# UI Specification: Pages and Component Layouts

**Feature Branch**: `001-sdd-initialization`
**UI Path**: `@specs/001-sdd-initialization/ui/pages.md`
**Created**: 2026-01-22
**Status**: Draft

---

## Overview

This specification defines the user interface pages and component layouts for the application. All pages are built with Next.js 16, responsive design, and enforce authentication flows.

---

## Navigation Structure

```
/                           → Redirects to /login or /dashboard based on auth
/login                      → Login page (public)
/register                   → Registration page (public)
/forgot-password            → Password reset request page (public)
/reset-password/:token      → Password reset form (public)
/dashboard                  → Main task dashboard (protected)
/dashboard/tasks/new        → Create new task page (protected)
/dashboard/tasks/:id        → View/edit single task (protected)
```

---

## Page Specifications

### 1. Login Page (`/login`)

**Purpose**: Authenticate existing users with email and password.

**Layout**:
```
┌─────────────────────────────────────────┐
│             Logo/Branding               │
├─────────────────────────────────────────┤
│                                         │
│     Sign In                             │
│                                         │
│     Email:                              │
│     [________________________]           │
│                                         │
│     Password:                           │
│     [________________________]           │
│                                         │
│     [ ] Remember me                     │
│                                         │
│     [      Sign In       ]              │
│                                         │
│     Don't have an account? Sign Up      │
│     Forgot your password?               │
│                                         │
└─────────────────────────────────────────┘
```

**Components**:

- **Email Input**:
  - Type: email
  - Required: yes
  - Placeholder: "your@email.com"
  - Validation: Must be valid email format
  - Error display: "Invalid email address"

- **Password Input**:
  - Type: password
  - Required: yes
  - Placeholder: "••••••••"
  - Validation: Cannot be empty
  - Error display: "Password is required"

- **Remember Me Checkbox**:
  - Optional
  - If checked: Token refresh extended to 30 days
  - Default: unchecked

- **Sign In Button**:
  - Type: submit
  - Loading state: Show spinner while authenticating
  - Disabled during submission
  - Text: "Sign In"

- **Links**:
  - "Sign Up": Navigate to /register
  - "Forgot your password?": Navigate to /forgot-password

**Behavior**:

1. **Given** I enter valid credentials, **When** I click Sign In, **Then** I'm redirected to /dashboard
2. **Given** I enter invalid credentials, **When** I click Sign In, **Then** I see error: "Invalid email or password"
3. **Given** I haven't verified my email, **When** I click Sign In, **Then** I see error: "Please verify your email first"
4. **Given** I'm already logged in, **When** I visit /login, **Then** I'm redirected to /dashboard

**Responsive Design**:
- Mobile (< 640px): Full width form, single column
- Tablet (640px - 1024px): Form width 400px, centered
- Desktop (> 1024px): Form width 450px, centered

---

### 2. Registration Page (`/register`)

**Purpose**: Create new user accounts.

**Layout**:
```
┌─────────────────────────────────────────┐
│             Logo/Branding               │
├─────────────────────────────────────────┤
│                                         │
│     Create Account                      │
│                                         │
│     Email:                              │
│     [________________________]           │
│     (error if invalid or taken)         │
│                                         │
│     Password:                           │
│     [________________________]           │
│     (8+ chars, mixed case, numbers)     │
│                                         │
│     Confirm Password:                   │
│     [________________________]           │
│     (error if not matching)             │
│                                         │
│     [ ] I agree to Terms of Service     │
│                                         │
│     [      Sign Up       ]              │
│                                         │
│     Already have an account? Sign In    │
│                                         │
└─────────────────────────────────────────┘
```

**Components**:

- **Email Input**:
  - Validation: Must be valid email and unique (not already registered)
  - Error: "Email already registered" or "Invalid email format"
  - Real-time validation on blur

- **Password Input**:
  - Requirements indicator: Show strength (weak/fair/strong)
  - Min 8 characters, mixed case, at least one number
  - Error: "Password must be at least 8 characters with uppercase, lowercase, and numbers"

- **Confirm Password**:
  - Must match password field
  - Error: "Passwords do not match"
  - Validate on blur

- **Terms Checkbox**:
  - Required: yes
  - Link to terms of service
  - Error: "You must agree to the terms"

- **Sign Up Button**:
  - Disabled until all validations pass and terms accepted
  - Shows loading spinner during submission

**Behavior**:

1. **Given** I fill all fields correctly, **When** I click Sign Up, **Then** my account is created and verification email sent
2. **Given** email already exists, **When** I enter it, **Then** I see error "Email already registered"
3. **Given** password is weak, **When** I enter it, **Then** strength indicator shows red and button is disabled
4. **Given** registration succeeds, **When** page updates, **Then** I see: "Check your email to verify your account"

**Email Verification**:
- After successful registration, show message: "Verification email sent to {email}"
- Provide link: "Didn't receive email? Resend"
- Auto-redirect to login after 5 seconds

---

### 3. Password Reset Request Page (`/forgot-password`)

**Purpose**: Request password reset email.

**Layout**:
```
┌─────────────────────────────────────────┐
│             Logo/Branding               │
├─────────────────────────────────────────┤
│                                         │
│     Forgot Your Password?               │
│                                         │
│     Enter your email address and we     │
│     'll send you a link to reset it.    │
│                                         │
│     Email:                              │
│     [________________________]           │
│                                         │
│     [   Send Reset Link   ]             │
│                                         │
│     Remember your password? Sign In     │
│                                         │
└─────────────────────────────────────────┘
```

**Components**:

- **Email Input**:
  - Required: yes
  - Validation: Valid email format
  - Placeholder: "your@email.com"

- **Send Reset Link Button**:
  - Submits email to reset endpoint
  - Shows loading state

**Behavior**:

1. **Given** I enter a registered email, **When** I click Send Reset Link, **Then** reset email is sent
2. **Given** I enter unregistered email, **When** I click Send Reset Link, **Then** I see: "If email exists, reset link has been sent" (security: don't reveal if account exists)
3. **Given** reset email sent, **When** page updates, **Then** I see confirmation message
4. **Given** I check my email, **When** I find the reset link, **Then** clicking it takes me to /reset-password/:token

---

### 4. Password Reset Form (`/reset-password/:token`)

**Purpose**: Reset password using token from email.

**Layout**:
```
┌─────────────────────────────────────────┐
│             Logo/Branding               │
├─────────────────────────────────────────┤
│                                         │
│     Reset Your Password                 │
│                                         │
│     New Password:                       │
│     [________________________]           │
│     (8+ chars, mixed case, numbers)     │
│                                         │
│     Confirm Password:                   │
│     [________________________]           │
│     (error if not matching)             │
│                                         │
│     [   Reset Password   ]              │
│                                         │
│     Go back to Sign In                  │
│                                         │
└─────────────────────────────────────────┘
```

**Components**:

- **New Password Input**:
  - Validation: 8+ characters, mixed case, at least one number
  - Strength indicator

- **Confirm Password Input**:
  - Must match password field

- **Reset Button**:
  - Disabled until both passwords match and meet strength requirements

**Behavior**:

1. **Given** valid token and matching passwords, **When** I click Reset Password, **Then** password is updated and I'm redirected to login
2. **Given** invalid or expired token, **When** I load the page, **Then** I see: "Reset link has expired. Request a new one."
3. **Given** password updated, **When** I'm redirected to login, **Then** I can log in with new password

---

### 5. Dashboard Page (`/dashboard`)

**Purpose**: Display user's task list and navigation to create/edit tasks.

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  [≡] App Logo        Dashboard       [👤 Menu] │
├─────────────────────────────────────────────────┤
│                                                 │
│  My Tasks                  [+ New Task]         │
│                                                 │
│  Filter: [All ▼]  Sort: [Newest ▼]             │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ☐ Buy groceries              Pending    │   │
│  │   Milk, eggs, bread                     │   │
│  │   Created: 2 hours ago                  │   │
│  │   [Edit]                                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ☐ Complete project report   In Progress│   │
│  │   Q4 report due Friday                  │   │
│  │   Created: 1 day ago                    │   │
│  │   [Edit]                                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ☑ Pay bills                  Completed │   │
│  │   All monthly bills paid                │   │
│  │   Created: 5 days ago                   │   │
│  │   [Edit]                                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Prev]  Page 1 of 1  [Next]                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Components**:

- **Header**:
  - App logo/name (clickable, returns to dashboard)
  - Title: "Dashboard"
  - User menu (profile, settings, logout) on top right

- **Task List**:
  - Display all user's tasks
  - Each task shows:
    - Checkbox (to toggle completion visually, not update backend)
    - Title (clickable to edit)
    - First line of description (if exists)
    - Status badge with color:
      - Pending: Blue
      - In Progress: Orange
      - Completed: Green
      - Archived: Gray
    - Created timestamp (relative: "2 hours ago")
    - Edit link/button

- **Filters & Sorting**:
  - Filter by Status: All, Pending, In Progress, Completed, Archived
  - Sort by: Newest, Oldest, Title (A-Z)
  - Persist filter state in URL

- **New Task Button**:
  - Prominent button (top right of task list)
  - Navigate to /dashboard/tasks/new on click

- **Pagination**:
  - Show current page and total pages
  - Previous/Next buttons
  - Allow page size selection (10, 20, 50 items)

- **Empty State**:
  - If no tasks and no filters applied: "No tasks yet. Create one to get started!"
  - If filtered results empty: "No tasks matching your filter. Try different criteria."

**Behavior**:

1. **Given** I'm logged in, **When** I visit /dashboard, **Then** I see my task list
2. **Given** I have many tasks, **When** I apply filters, **Then** list updates without page reload
3. **Given** I click on a task, **When** task title is clicked, **Then** I navigate to edit page
4. **Given** I click + New Task, **When** button clicked, **Then** I navigate to /dashboard/tasks/new
5. **Given** I'm not logged in, **When** I visit /dashboard, **Then** I'm redirected to /login

**Responsive Design**:
- Mobile: Single column, stacked cards, filters in dropdown menu
- Tablet: Filters sidebar or inline, task list 2-column
- Desktop: Filters left sidebar, task list main area

---

### 6. Create Task Page (`/dashboard/tasks/new`)

**Purpose**: Create a new task.

**Layout**:
```
┌──────────────────────────────────────┐
│  [< Back]              New Task       │
├──────────────────────────────────────┤
│                                      │
│  Title *                             │
│  [________________________________]  │
│                                      │
│  Description                         │
│  [________________________________]  │
│  [________________________________]  │
│  [________________________________]  │
│  (0/2000 characters)                 │
│                                      │
│  Status                              │
│  [Pending ▼]                         │
│                                      │
│  [  Create Task  ]  [  Cancel  ]    │
│                                      │
└──────────────────────────────────────┘
```

**Components**:

- **Title Input**:
  - Required: yes
  - Max 255 characters
  - Placeholder: "What needs to be done?"
  - Real-time character counter

- **Description Textarea**:
  - Optional
  - Max 2000 characters
  - Placeholder: "Add more details..."
  - Character counter showing (x/2000)
  - Auto-expand height as user types

- **Status Dropdown**:
  - Options: Pending (default), In Progress, Completed, Archived
  - Default: Pending
  - Most users leave as Pending when creating

- **Create Button**:
  - Disabled until title is provided
  - Shows loading spinner on submission

- **Cancel Button**:
  - Navigate back to /dashboard without saving

**Behavior**:

1. **Given** I fill in title and click Create Task, **When** submission succeeds, **Then** I'm redirected to /dashboard
2. **Given** title is empty, **When** I click Create Task, **Then** button is disabled or shows error
3. **Given** I click Cancel, **When** button clicked, **Then** I return to /dashboard without saving
4. **Given** task creation succeeds, **When** page updates, **Then** new task appears at top of list with success message

---

### 7. Edit Task Page (`/dashboard/tasks/:id`)

**Purpose**: View and edit an existing task.

**Layout**:
```
┌──────────────────────────────────────┐
│  [< Back]              Edit Task      │
├──────────────────────────────────────┤
│                                      │
│  Title *                             │
│  [________________________________]  │
│                                      │
│  Description                         │
│  [________________________________]  │
│  [________________________________]  │
│  [________________________________]  │
│  (200/2000 characters)               │
│                                      │
│  Status                              │
│  [In Progress ▼]                     │
│                                      │
│  Created: 2 hours ago  Updated now   │
│                                      │
│  [  Update Task  ]  [  Delete  ]    │
│                                      │
└──────────────────────────────────────┘
```

**Components**:

- **Title Input**: Same as create page, pre-filled with current value
- **Description Textarea**: Pre-filled with current value
- **Status Dropdown**: Pre-selected with current status

- **Metadata Display**:
  - "Created: [timestamp]"
  - "Updated: [timestamp]"
  - Both in relative format (e.g., "2 hours ago")

- **Update Button**:
  - Only enabled if changes detected (compared to initial values)
  - Shows loading spinner on submission

- **Delete Button**:
  - Prominent red/destructive styling
  - Clicking shows confirmation modal: "Are you sure you want to delete this task? This cannot be undone."
  - Requires confirmation to proceed

**Behavior**:

1. **Given** I edit a field, **When** value changes, **Then** Update button becomes enabled
2. **Given** I modify the task and click Update, **When** submission succeeds, **Then** I see success message and timestamps update
3. **Given** I click Delete, **When** I confirm, **Then** task is deleted and I'm redirected to /dashboard
4. **Given** someone else deletes the task, **When** I try to access it, **Then** I see 404 error: "Task not found"
5. **Given** I click Back, **When** no changes made, **Then** I return to /dashboard
6. **Given** I made changes and click Back, **When** navigation attempted, **Then** browser confirms: "You have unsaved changes"

**Responsive Design**:
- Mobile: Full width form
- Tablet/Desktop: Same layout, max width 600px

---

## Shared Components

### Task Card Component

Used in dashboard task list.

**Props**:
```typescript
{
  id: string;
  title: string;
  description?: string;
  status: "Pending" | "In Progress" | "Completed" | "Archived";
  createdAt: Date;
  onEdit: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}
```

**Features**:
- Displays task info in card format
- Checkbox to toggle status (visual feedback, not backend update)
- Edit link navigates to edit page
- Status badge with color coding

### Header Component

Appears on all pages.

**Features**:
- App logo
- Current page title
- User menu with:
  - Profile link
  - Settings link
  - Logout button

### Loading Spinner

Used during form submissions and data loads.

**Features**:
- Centered spinner animation
- Message: "Loading..." or "Saving..."

### Error Alert

Used for error messages.

**Features**:
- Red background with white text
- Error icon
- Close button
- Display multiple errors if present

### Success Toast

Used for confirmation messages.

**Features**:
- Green background with white text
- Auto-dismiss after 3 seconds
- Can be dismissed manually

---

## Design System

### Color Palette

- **Primary**: #3B82F6 (Blue)
- **Secondary**: #10B981 (Green)
- **Destructive**: #EF4444 (Red)
- **Warning**: #F59E0B (Orange)
- **Background**: #F9FAFB (Light Gray)
- **Text**: #1F2937 (Dark Gray)
- **Border**: #E5E7EB (Light Border Gray)

### Typography

- **Headings**: Font-family: sans-serif, Font-weight: 600 (semibold)
  - H1: 32px
  - H2: 24px
  - H3: 20px
- **Body**: Font-family: sans-serif, Font-weight: 400
  - Base: 16px
  - Small: 14px

### Spacing

- Base unit: 8px
- Padding: 8px, 16px, 24px, 32px
- Margin: Same as padding
- Border radius: 4px (small), 8px (medium)

### Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## Cross-References

- **Task CRUD Spec**: `@specs/001-sdd-initialization/features/task-crud.md` - Business logic for task operations
- **Authentication Spec**: `@specs/001-sdd-initialization/features/authentication.md` - Login/registration flows
- **REST API Spec**: `@specs/001-sdd-initialization/api/rest-endpoints.md` - API endpoints called by pages

---

## Notes

### Accessibility

- All form inputs have associated labels
- Color is not the only indicator (use icons/text with colors)
- Keyboard navigation fully supported
- Focus indicators visible on all interactive elements
- Alt text for all images

### Performance

- Lazy load task list (pagination)
- Debounce filter/search input (500ms)
- Cache authenticated user info in memory
- Use relative timestamps (not absolute times requiring updates)

### Security

- Never display user tokens in UI
- Use HTTPS for all requests
- Validate all user input before submission
- CSRF protection for state-changing requests
