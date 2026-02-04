# Implementation Plan: Professional Landing Page and UI Enhancements

**Branch**: `002-landing-page-ui` | **Date**: 2026-02-03 | **Spec**: `@specs/002-landing-page-ui/spec.md`
**Input**: Feature specification from `/specs/002-landing-page-ui/spec.md`

---

## Summary

This implementation plan outlines the architecture and component design for delivering a professional FocusHub landing page with smart header navigation, celebratory animations, and modern UI polish. The feature enhances user conversion and retention by providing an engaging entry point for new users and seamless navigation for authenticated users.

**Key Deliverables**:
- Professional landing page with Hero, About Us, Features, and Contact sections
- Conditional header navigation (different UI for authenticated vs. unauthenticated users)
- User profile dropdown with Dashboard and Logout actions
- Celebratory confetti/ribbon animation on successful login/signup
- Smooth Framer Motion page transitions
- Loading spinners on async button actions
- Modern color palette (Indigo/Slate or Dark Mode)
- Fully responsive design (mobile, tablet, desktop)

**Technical Approach**: Frontend-only feature leveraging existing Better Auth authentication context. No database changes required. Component-based React architecture with Framer Motion for animations, Tailwind CSS for styling, Plus Jakarta Sans (headings) and Inter (body) typography, and Indigo/Slate color theme.

---

## Technical Context

**Language/Version**: TypeScript/JavaScript (Next.js 15+, React 18+)
**Primary Dependencies**: Next.js, React, Framer Motion, Better Auth (context), Tailwind CSS, react-confetti (or similar)
**Storage**: N/A (no new data storage required; uses existing user session from Better Auth)
**Testing**: Jest + React Testing Library (optional for this phase)
**Target Platform**: Web (browser - Chrome, Safari, Firefox, Edge)
**Project Type**: Web application (frontend component of full-stack)
**Performance Goals**:
- Landing page loads in < 2 seconds
- Page transitions complete in < 500ms
- Loading spinners appear within 100ms of action
**Constraints**:
- Mobile-first responsive design (320px minimum viewport)
- GPU-accelerated animations (transform/opacity only, no layout shifts)
- All animations skip-able without breaking functionality
**Scale/Scope**:
- 5 major components (Landing Page, Header, User Dropdown, Confetti Animation, Task Buttons)
- ~800-1000 lines of TSX/CSS
- Responsive across 3 breakpoints (mobile, tablet, desktop)
- Font Integration: Plus Jakarta Sans (headings), Inter (body text)
- Color Theme: Indigo/Slate with dark mode support

---

## Constitution Check

*GATE: Must pass before Phase 1 design. Re-check after Phase 1 design.*

### Authentication & Security (Constitution II: The JWT Bridge)
- ✅ **PASS**: Feature integrates with existing Better Auth context on frontend
- ✅ **PASS**: No new authentication logic introduced (reuses existing JWT from Better Auth)
- ✅ **PASS**: Header conditional rendering based on Better Auth session context
- ✅ **PASS**: User email displayed from Better Auth session (read-only, no credential exposure)

### User Isolation & Multi-Tenancy (Constitution III)
- ✅ **PASS**: No new API endpoints (frontend-only feature)
- ✅ **PASS**: No new database queries (uses existing user_id from JWT)
- ✅ **PASS**: No user_id filtering logic needed (Better Auth handles session isolation)
- ✅ **PASS**: All navigation respects authentication state from JWT context

### Stateless Architecture (Constitution IV)
- ✅ **PASS**: No in-memory state on backend (feature is frontend-only)
- ✅ **PASS**: All state management via React Context (Better Auth session context)
- ✅ **PASS**: No persistent session objects introduced
- ✅ **PASS**: All animations and transitions are client-side ephemeral state

### Error Handling (Constitution V)
- ✅ **PASS**: Navigation errors handled gracefully (redirect to login if session expires)
- ✅ **PASS**: Animation failures don't break functionality (still redirects to dashboard)
- ✅ **PASS**: Loading states provide user feedback for async operations
- ✅ **PASS**: No unhandled promises or console errors in final implementation

### SDD Compliance (Constitution I)
- ✅ **PASS**: Feature specification complete and approved before planning
- ✅ **PASS**: All implementation will be traced to Task IDs
- ✅ **PASS**: Code will include comments linking to specs and tasks
- ✅ **PASS**: All commits will include co-author line for AI-generated code

### Technology Stack Alignment
- ✅ **PASS**: Uses mandated frontend stack (Next.js 15+, React 18+, Tailwind CSS)
- ✅ **PASS**: Integrates with Better Auth (mandated authentication)
- ✅ **PASS**: No prohibited dependencies (no additional backend required)
- ✅ **PASS**: Testing strategy aligns with Jest + React Testing Library

**GATE RESULT**: ✅ **PASS** - Feature aligns with all Constitutional principles and can proceed to Phase 1 design.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-landing-page-ui/
├── plan.md                          # This file
├── spec.md                          # Feature specification (approved)
├── checklists/
│   └── requirements.md              # Quality validation checklist (passed)
├── research.md                      # Phase 0 research (if needed)
├── data-model.md                    # Phase 1 design (if new entities)
├── contracts/                       # Phase 1 API contracts (if new endpoints)
└── tasks.md                         # Phase 2 tasks (created by /sp.tasks)
```

### Source Code (repository structure)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout (Header integration point)
│   │   ├── page.tsx                 # Landing page (NEW)
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Dashboard (existing - auth required)
│   │   ├── login/
│   │   │   └── page.tsx             # Login page (existing)
│   │   ├── signup/
│   │   │   └── page.tsx             # Signup page (existing)
│   │   └── [other pages]
│   ├── components/
│   │   ├── Header.tsx               # UPDATED - conditional rendering
│   │   ├── LandingPage.tsx          # NEW - hero, about, features, contact
│   │   ├── UserDropdown.tsx         # NEW - authenticated user menu
│   │   ├── ConfettiAnimation.tsx    # NEW - celebratory animation
│   │   ├── LoadingSpinner.tsx       # NEW or UPDATED - button loading states
│   │   └── [other components]
│   ├── lib/
│   │   ├── auth.ts                  # Better Auth context integration (may update)
│   │   ├── animations.ts            # NEW - animation utilities (Framer Motion)
│   │   └── [other utilities]
│   ├── types/
│   │   ├── auth.ts                  # Auth types (may update)
│   │   └── [other types]
│   └── styles/
│       └── globals.css              # Tailwind + custom CSS for theme
├── tests/
│   └── [component tests - optional for this phase]
└── package.json

backend/
└── [no changes required for this feature]
```

**Structure Decision**: The feature is **frontend-only** and follows the existing Next.js App Router structure. New components are created in `frontend/src/components/`, with utilities in `frontend/src/lib/`. The landing page is a new route at `frontend/src/app/page.tsx`. All styling uses Tailwind CSS with custom CSS variables for the color theme (Indigo/Slate or Dark Mode).

---

## Phase 1 Design: Component Architecture

### 1. Landing Page Component (NEW)

**File**: `frontend/src/components/LandingPage.tsx`

**Purpose**: Render the complete landing page with hero, about, features, and contact sections.

**Structure**:
```
LandingPage
├── HeroSection
│   ├── Branding (FocusHub logo/title - Plus Jakarta Sans)
│   ├── Tagline (Plus Jakarta Sans)
│   └── Value proposition (Inter)
├── AboutSection
│   ├── Description (Inter)
│   └── Key points (Inter)
├── FeaturesSection
│   ├── Feature card 1 (Focus management - Inter body, Plus Jakarta Sans titles)
│   ├── Feature card 2 (User isolation)
│   ├── Feature card 3 (Data persistence)
│   └── Feature card 4 (Smooth experience)
├── ContactSection
│   ├── Contact info (Inter)
│   └── Contact form (optional, Inter)
└── Scroll animations (Framer Motion)
```

**Props**: None (uses routing context)
**State**:
- None (purely presentational)

**Dependencies**:
- `framer-motion` for scroll animations
- `next/link` for navigation
- `next/image` for optimized images

**Success Criteria**:
- SC-001: Loads in < 2 seconds
- SC-008: Receives "professional" and "polished" assessment
- SC-010: No layout shifts during animations

---

### 2. Header Component (UPDATED)

**File**: `frontend/src/components/Header.tsx`

**Purpose**: Smart header that conditionally renders based on authentication state.

**Structure**:
```
Header
├── Logo/Branding
│   └── Conditional link (home if not auth'd, dashboard if auth'd)
├── Navigation
│   ├── Home link (always visible)
│   └── Conditional Auth Section
│       ├── If NOT authenticated:
│       │   ├── Sign In button → /login
│       │   └── Get Started button → /signup
│       └── If authenticated:
│           ├── User email/icon
│           └── Dropdown trigger
└── UserDropdown (conditionally rendered)
```

**Props**: None (uses Better Auth context)
**State**:
- `isDropdownOpen: boolean` (local dropdown toggle state)
- Auth state from Better Auth context

**Dependencies**:
- `Better Auth` context hook (e.g., `useSession()`)
- `next/link` and `next/navigation` for routing
- `framer-motion` for dropdown animation
- `UserDropdown` component

**Authentication Logic**:
```typescript
const { session, user } = useSession();
const isAuthenticated = !!session && !!user;

// Render conditional UI based on isAuthenticated
```

**Success Criteria**:
- SC-002: Header displays correct UI state (Sign In/Get Started vs. email/icon) with 100% accuracy
- SC-003: Navigation buttons redirect correctly 100% of the time
- SC-009: No console errors; proper accessibility (ARIA labels, keyboard nav)

---

### 3. User Dropdown Component (NEW)

**File**: `frontend/src/components/UserDropdown.tsx`

**Purpose**: Dropdown menu for authenticated users with Dashboard and Logout options.

**Structure**:
```
UserDropdown (animates in/out)
├── Dashboard link
└── Logout button
```

**Props**:
- `isOpen: boolean` (whether dropdown is visible)
- `onClose: () => void` (callback when option selected or click-outside)

**State**: None (parent manages open/close state)

**Dependencies**:
- `framer-motion` for smooth dropdown animation (fade + slide)
- `next/navigation` for redirect
- Better Auth logout function

**Logout Handler**:
```typescript
const handleLogout = async () => {
  await logout(); // Better Auth logout
  router.push('/login'); // or back to '/' depending on design
};
```

**Success Criteria**:
- SC-004: Dropdown renders within 100ms of click
- SC-005: All transitions complete < 500ms

---

### 4. Confetti Animation Component (NEW)

**File**: `frontend/src/components/ConfettiAnimation.tsx`

**Purpose**: Celebratory animation triggered on successful login or signup.

**Structure**:
```
ConfettiAnimation (renders conditionally)
├── Confetti/ribbon effect (react-confetti or Framer Motion)
├── Duration: 1-2 seconds
└── Auto-redirect to /dashboard after animation
```

**Props**:
- `isActive: boolean` (whether animation should display)
- `onComplete: () => void` (callback when animation finishes)

**State**:
- Animation timer (1-2 second duration)

**Dependencies**:
- `react-confetti` (or `framer-motion` for custom ribbon)
- `useEffect` for auto-completion

**Integration Points**:
- Login page: triggers on successful auth
- Signup page: triggers on successful registration
- Middleware/hook: reusable animation trigger logic

**Example Integration** (in login page):
```typescript
const [showConfetti, setShowConfetti] = useState(false);

const handleLoginSuccess = async () => {
  setShowConfetti(true);
  // Auto-redirect happens in ConfettiAnimation component
};
```

**Success Criteria**:
- SC-004: Animation displays for 1-2 seconds, then auto-redirects
- SC-005: Animation < 500ms to render
- SC-010: GPU-accelerated (no layout shifts)

---

### 5. Loading Spinner Component (NEW or UPDATED)

**File**: `frontend/src/components/LoadingSpinner.tsx`

**Purpose**: Visual feedback for async operations (create/delete tasks).

**Structure**:
```
LoadingSpinner (replaces button text/icon during loading)
├── Animated spinner icon
└── Optional loading text
```

**Props**:
- `isLoading: boolean` (controls visibility)
- `size: 'small' | 'medium' | 'large'` (optional)
- `color: string` (matches theme)

**Usage** (in button components):
```typescript
<button disabled={isLoading}>
  {isLoading ? <LoadingSpinner /> : 'Create Task'}
</button>
```

**Dependencies**:
- `framer-motion` for smooth rotation animation
- Tailwind CSS for styling

**Success Criteria**:
- SC-006: Spinner appears within 100ms of action
- SC-005: Smooth rotation animation
- SC-010: GPU-accelerated (transform only)

---

### 6. Animation Utilities (NEW)

**File**: `frontend/src/lib/animations.ts`

**Purpose**: Centralized Framer Motion animation configurations for consistency.

**Exports**:
```typescript
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

export const dropdownAnimation = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.15 },
};

export const spinnerAnimation = {
  rotate: 360,
  transition: { duration: 1, repeat: Infinity, ease: 'linear' },
};
```

**Success Criteria**:
- SC-005: All transitions use consistent timing
- SC-010: All use GPU-accelerated properties (opacity, scale, rotate)

---

## Phase 1 Design: Data Model

**Status**: N/A - Feature is frontend-only; no new database entities required.

**Existing Entities Used**:
- **User** (from authentication feature): Used to display user email in header dropdown
  - Fields: `id`, `email`, `name` (if available from session)
  - Access: Read-only from Better Auth session context

**No New Entities**:
- Landing page content is static or semi-static (no database storage)
- UI theme is configuration (CSS variables), not stored data

---

## Phase 1 Design: API Contracts

**Status**: No new API endpoints required.

**Existing Endpoints Used**:
- `POST /api/auth/login` (existing) - redirects to celebratory animation
- `POST /api/auth/register` (existing) - redirects to celebratory animation
- `POST /api/auth/logout` (existing) - called from user dropdown

**Frontend API Integration**:
- Better Auth client library handles all auth API calls
- No new fetch logic required; uses existing auth hooks

---

## Phase 1 Design: Color Palette, Typography & Theme

**File**: `frontend/src/styles/globals.css` (updated)

**Approach**: CSS variables for theme switching (Indigo/Slate color theme with Plus Jakarta Sans and Inter typography).

**Typography Configuration**:
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

:root {
  /* Fonts */
  --font-heading: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 600;
}

body, p, span, button, a {
  font-family: var(--font-body);
}
```

**Color Palette - Indigo/Slate (Light)**:
```css
:root {
  --primary: #4F46E5;           /* Indigo-600 */
  --primary-dark: #4338CA;       /* Indigo-700 */
  --secondary: #64748B;          /* Slate-500 */
  --background: #F8FAFC;         /* Slate-50 */
  --surface: #FFFFFF;            /* White */
  --text-primary: #1E293B;       /* Slate-900 */
  --text-secondary: #64748B;     /* Slate-500 */
  --border: #E2E8F0;             /* Slate-200 */
  --success: #10B981;            /* Green-500 */
  --error: #EF4444;              /* Red-500 */
}
```

**Color Palette - Dark Mode**:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --primary: #818CF8;            /* Indigo-400 */
    --background: #0F172A;         /* Slate-900 */
    --surface: #1E293B;            /* Slate-800 */
    --text-primary: #F1F5F9;       /* Slate-100 */
    --text-secondary: #94A3B8;     /* Slate-400 */
    --border: #334155;             /* Slate-700 */
  }
}
```

**Theme Application**:
- Tailwind config extended with CSS variables
- All components use semantic color classes (primary, secondary, surface, etc.)
- Dark mode toggle via system preference or user setting
- All headings rendered with Plus Jakarta Sans font (weight 600)
- All body text rendered with Inter font (weight 400/500)

---

## Phase 1 Design: Responsive Breakpoints

**Mobile (320px - 640px)**:
- Single column layout
- Full-width buttons and form fields
- Hamburger menu for header (optional)
- Larger touch targets (48px minimum)

**Tablet (641px - 1024px)**:
- Two-column layout for features section
- Responsive padding and margins
- Dropdown menu fully visible

**Desktop (1025px+)**:
- Full multi-column layout
- Optimal spacing and typography
- All sections visible without scrolling on tall screens

**Implementation**: Tailwind CSS responsive classes (`sm:`, `md:`, `lg:`, `xl:`) throughout components.

---

## Phase 1 Design: Integration Points

### 1. Root Layout Integration

**File**: `frontend/src/app/layout.tsx`

**Updates**:
```typescript
import Header from '@/components/Header';
import { SessionProvider } from 'better-auth/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          <Header />
          <main>{children}</main>
          <footer>{/* if applicable */}</footer>
        </SessionProvider>
      </body>
    </html>
  );
}
```

### 2. Landing Page Route

**File**: `frontend/src/app/page.tsx`

**Content**:
```typescript
import LandingPage from '@/components/LandingPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FocusHub - Focus Management Simplified',
  description: 'Professional focus and task management for teams and individuals',
};

export default function Home() {
  return <LandingPage />;
}
```

### 3. Celebratory Animation Trigger

**Files**: Login & Signup pages

**Example** (`frontend/src/app/login/page.tsx`):
```typescript
const [showConfetti, setShowConfetti] = useState(false);

const handleLoginSuccess = async (data) => {
  // API call to login endpoint
  setShowConfetti(true);
  // ConfettiAnimation component handles auto-redirect
};

return (
  <>
    <LoginForm onSuccess={handleLoginSuccess} />
    {showConfetti && (
      <ConfettiAnimation
        isActive={showConfetti}
        onComplete={() => router.push('/dashboard')}
      />
    )}
  </>
);
```

---

## Dependencies & Installation

**New Dependencies** (frontend):
```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "react-confetti": "^6.1.0"
  },
  "devDependencies": {
    "@types/react-confetti": "^1.0.0"
  }
}
```

**Installation**:
```bash
cd frontend
npm install framer-motion react-confetti
npm install --save-dev @types/react-confetti
# Fonts will be loaded from Google Fonts via CSS @import (no npm package needed)
```

**Font Loading**:
- Plus Jakarta Sans and Inter will be loaded from Google Fonts
- Configure in `globals.css` using `@import url()` for optimal performance
- Use `font-display: swap` to prevent layout shift while fonts load
- Preload fonts in Next.js `<head>` for critical rendering path

---

## Testing Strategy (Optional for Phase 2)

If E2E testing is required:

1. **Component Tests** (Jest + React Testing Library):
   - Header renders correct UI for authenticated/unauthenticated users
   - UserDropdown opens/closes on click
   - ConfettiAnimation triggers and auto-redirects
   - LoadingSpinner appears during async actions

2. **Integration Tests**:
   - Login flow: form submission → confetti animation → dashboard redirect
   - Signup flow: registration → animation → dashboard
   - Header state transitions when logging in/out
   - Navigation links work correctly (Home, Sign In, Get Started, Dashboard)

3. **E2E Tests** (Playwright/Cypress):
   - Full landing page visit and scroll
   - Desktop → tablet → mobile responsive verification
   - Dark mode toggle (if implemented)
   - Auth state persistence across navigation

---

## Performance Optimization

1. **Image Optimization**:
   - Use `next/image` for all images
   - Responsive image sizes for different breakpoints
   - WebP format with fallbacks

2. **Code Splitting**:
   - `LandingPage` component lazy-loaded if not on home page
   - `ConfettiAnimation` dynamically imported (react-confetti is heavy)

3. **Animation Performance**:
   - Use `will-change` CSS property sparingly
   - GPU-accelerated transforms only (no width/height changes)
   - Reduce motion on low-end devices (`prefers-reduced-motion`)

4. **Caching**:
   - Static landing page can be ISR (Incremental Static Regeneration)
   - Header caches auth session locally (Better Auth handles this)

---

## Next Steps

1. **Phase 2 (Tasks)**: Run `/sp.tasks` to break down this plan into atomic, testable tasks.
2. **Implementation**: Execute tasks in order, referencing Task IDs in code comments and commit messages.
3. **Testing**: Validate against acceptance scenarios in original spec.
4. **Deployment**: Push to feature branch, create PR for review.

---

## Related Specifications

- `@specs/001-sdd-initialization/features/authentication.md` - Auth flows that trigger animations
- `@specs/001-sdd-initialization/ui/pages.md` - Existing UI page specifications
- `@specs/001-sdd-initialization/plan.md` - Overall system architecture
