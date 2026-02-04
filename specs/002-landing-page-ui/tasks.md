# Tasks: Professional Landing Page and UI Enhancements

**Input**: Design documents from `/specs/002-landing-page-ui/`
**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅)
**Branch**: `002-landing-page-ui`
**Feature**: Professional Landing Page with smart header navigation, animations, and modern UI polish

**Tests**: No tests requested in feature specification. Implementation focuses on acceptance scenarios from spec.md

**Organization**: Tasks are grouped by user story (5 total: P1, P1, P2, P2, P3) to enable independent implementation and testing of each story.

---

## Format: `- [ ] [TaskID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies

- [ ] T001 Install frontend dependencies: `npm install framer-motion react-confetti` in `frontend/`
- [ ] T002 Verify Tailwind CSS and Next.js configuration in `frontend/`
- [ ] T003 [P] Create animation utilities file at `frontend/src/lib/animations.ts` with Framer Motion configs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and base components that MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create base theme system with CSS variables and typography in `frontend/src/styles/globals.css`
  - Load Plus Jakarta Sans (headings) and Inter (body) from Google Fonts
  - Configure Indigo/Slate color palette as CSS variables
  - Set font families for h1-h6 (Plus Jakarta Sans) and body text (Inter)
  - Include dark mode color scheme
- [ ] T005 [P] Create type definitions for auth context in `frontend/src/types/auth.ts`
- [ ] T006 [P] Create LoadingSpinner component in `frontend/src/components/LoadingSpinner.tsx`
- [ ] T007 Verify Better Auth integration in `frontend/src/lib/auth.ts` (check if useSession() and logout() are available)

**Checkpoint**: Foundation ready - all user stories can now start in parallel

---

## Phase 3: User Story 1 - Discover FocusHub as Unauthenticated User (Priority: P1) 🎯 MVP

**Goal**: Create an engaging landing page that attracts new users and guides them toward signup/login

**Independent Test**: A new visitor can:
1. Load `/` page in < 2 seconds
2. View all 4 sections (Hero, About Us, Features, Contact) with smooth scroll animations
3. Click "Sign In" button and be redirected to `/login`
4. Click "Get Started" button and be redirected to `/signup` (or `/register`)

**Acceptance Scenarios**:
- AC-1.1: Hero section displays "FocusHub" branding, tagline, and value proposition with Plus Jakarta Sans font
- AC-1.2: Header shows "Sign In" and "Get Started" buttons (unauthenticated state)
- AC-1.3: Clicking "Get Started" redirects to signup page
- AC-1.4: Clicking "Sign In" redirects to login page
- AC-1.5: Clicking logo on unauthenticated user stays on/returns to home page
- AC-1.6: Landing page sections visible with smooth transitions (no janky animations)

### Implementation for User Story 1

- [ ] T008 [P] [US1] Create LandingPage component at `frontend/src/components/LandingPage.tsx`
  - Exports default React component with Hero, About Us, Features, Contact sections
  - No props required, uses Next.js routing context
  - Imports Framer Motion for scroll animations
  - Success: Component renders without errors, all sections visible

- [ ] T009 [P] [US1] Create HeroSection subcomponent at `frontend/src/components/sections/HeroSection.tsx`
  - Displays "FocusHub" branding/logo
  - Shows tagline: "Professional focus management, simplified"
  - Includes value proposition (2-3 key benefits)
  - Uses `<h1>` for main heading with Plus Jakarta Sans font (weight 600), semantic HTML
  - All body text uses Inter font
  - Success: All text renders, image loads in < 1s

- [ ] T010 [P] [US1] Create AboutSection subcomponent at `frontend/src/components/sections/AboutSection.tsx`
  - Describes what FocusHub is (2-3 paragraphs)
  - Lists key points about the product
  - Uses Inter font for body text, Plus Jakarta Sans for section heading
  - Uses Framer Motion for fade-in animation on scroll
  - Success: Section renders with animation

- [ ] T011 [P] [US1] Create FeaturesSection subcomponent at `frontend/src/components/sections/FeaturesSection.tsx`
  - Displays 4 feature cards (focus management, user isolation, data persistence, smooth UX)
  - Each card has: icon/image, title (Plus Jakarta Sans), description (Inter)
  - Responsive layout: 1 column mobile, 2 columns tablet, 4 columns desktop
  - Uses Framer Motion for staggered card animations
  - Indigo/Slate color theme throughout
  - Success: All 4 cards render with proper layout

- [ ] T012 [P] [US1] Create ContactSection subcomponent at `frontend/src/components/sections/ContactSection.tsx`
  - Displays contact information (email, or contact form)
  - Simple contact form with name, email, message fields (optional)
  - Call-to-action button
  - Success: Contact info displays, form (if included) submits

- [ ] T013 [US1] Create landing page route at `frontend/src/app/page.tsx`
  - Imports LandingPage component
  - Sets metadata: title, description, keywords
  - Renders LandingPage component
  - Success: Route loads, page displays all sections

- [ ] T014 [US1] Integrate Header into root layout at `frontend/src/app/layout.tsx`
  - Import Header component
  - Render Header in layout (above main children)
  - Wrap app with SessionProvider from Better Auth
  - Success: Header appears on all pages

- [ ] T015 [US1] Implement Header conditional rendering for unauthenticated state in `frontend/src/components/Header.tsx`
  - Check authentication via Better Auth context (`useSession()`)
  - If NOT authenticated: show "Sign In" and "Get Started" buttons
  - If NOT authenticated: clicking logo stays on home page (check current route)
  - Render Header with responsive mobile/tablet/desktop layout
  - Add "Home" link in header (always visible)
  - Success: Header shows correct buttons for unauthenticated user

- [ ] T016 [US1] Add button click handlers in Header: `frontend/src/components/Header.tsx`
  - "Sign In" button: `useRouter().push('/login')`
  - "Get Started" button: `useRouter().push('/signup')` or `/register`
  - Verify routes exist in your app, adjust if needed
  - Test: Clicking buttons redirects correctly
  - Success: Navigation works, no console errors

- [ ] T017 [P] [US1] Apply theme/styling to landing page sections
  - Use Tailwind CSS for layout and responsive design
  - Apply Indigo/Slate color palette from CSS variables (--primary, --background, --text-primary, etc.)
  - Apply typography: Plus Jakarta Sans (headings, weight 600), Inter (body, weight 400/500)
  - Ensure mobile-first design: 320px minimum viewport
  - Use Tailwind breakpoints: sm: (640px), md: (768px), lg: (1024px)
  - Success: Page looks professional on all breakpoints with consistent fonts and colors

**Checkpoint**: User Story 1 complete. Test independently:
- [ ] Navigate to `/` and verify landing page loads in < 2 seconds
- [ ] Scroll through all 4 sections (Hero, About, Features, Contact)
- [ ] Click "Sign In" and verify redirect to `/login`
- [ ] Click "Get Started" and verify redirect to `/signup` or `/register`
- [ ] Click logo while on landing page (should stay or return to home)
- [ ] Test on mobile (320px), tablet (768px), desktop (1024px+)

---

## Phase 4: User Story 2 - Navigate as Authenticated User (Priority: P1)

**Goal**: Provide seamless post-authentication experience with smart header and user dropdown

**Independent Test**: After logging in:
1. Header shows user email/icon instead of "Sign In"/"Get Started"
2. Clicking email/icon opens dropdown with "Dashboard" and "Logout" options
3. Clicking "Dashboard" goes to `/dashboard`
4. Clicking logo goes to `/dashboard`
5. Clicking "Home" link goes to landing page
6. Clicking "Logout" logs out and redirects to `/login`

**Acceptance Scenarios**:
- AC-2.1: Header shows user email/icon when authenticated
- AC-2.2: Clicking email/icon opens dropdown menu
- AC-2.3: Dropdown has "Dashboard" option that redirects to `/dashboard`
- AC-2.4: Dropdown has "Logout" option that logs out and redirects
- AC-2.5: Logo navigates to `/dashboard` when authenticated
- AC-2.6: Home link navigates to landing page even when authenticated
- AC-2.7: Dropdown closes when option clicked or clicked outside

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create UserDropdown component at `frontend/src/components/UserDropdown.tsx`
  - Props: `isOpen: boolean`, `onClose: () => void`
  - Renders "Dashboard" link and "Logout" button
  - Dashboard link uses `useRouter().push('/dashboard')`
  - Logout button calls Better Auth logout function: `await logout()`
  - After logout: `useRouter().push('/login')`
  - Uses Framer Motion for smooth dropdown animation (fade + scale)
  - Success: Dropdown renders, buttons work correctly

- [ ] T019 [US2] Update Header for authenticated state in `frontend/src/components/Header.tsx`
  - Use `useSession()` hook to get `session` and `user`
  - If authenticated: display user email instead of "Sign In"/"Get Started"
  - Add state for dropdown open/close: `const [isDropdownOpen, setIsDropdownOpen] = useState(false)`
  - Clicking email/icon toggles dropdown: `setIsDropdownOpen(!isDropdownOpen)`
  - Render UserDropdown component when `isDropdownOpen === true`
  - Close dropdown on click-outside (Framer Motion handles this with AnimatePresence)
  - Success: Header shows email when logged in, dropdown opens/closes

- [ ] T020 [US2] Update logo navigation in Header for authenticated state in `frontend/src/components/Header.tsx`
  - Get `isAuthenticated` from `useSession()`
  - If authenticated: logo click goes to `/dashboard`
  - If not authenticated: logo click goes to `/` (home)
  - Use `useRouter().push(route)`
  - Success: Logo navigates correctly based on auth state

- [ ] T021 [US2] Add "Home" link to Header that works for all users in `frontend/src/components/Header.tsx`
  - Create navigation link: `<Link href="/">Home</Link>`
  - Always visible in header
  - Works for authenticated and unauthenticated users
  - Success: Home link visible and functional

- [ ] T022 [US2] Style UserDropdown component in `frontend/src/components/UserDropdown.tsx`
  - Use Tailwind CSS for dropdown menu
  - Position relative to user icon (absolute positioning)
  - Apply color palette (--surface, --text-primary, --border)
  - Add hover states for buttons
  - Responsive: works on mobile and desktop
  - Success: Dropdown looks professional, animations smooth

- [ ] T023 [US2] Add loading state handling to logout button in `frontend/src/components/UserDropdown.tsx`
  - While logout is processing, button shows disabled state
  - Optional: show brief loading spinner
  - Success: No double-clicks allowed, logout is atomic

**Checkpoint**: User Story 2 complete. Test independently (requires login):
- [ ] Log in and verify header shows email/icon
- [ ] Click email/icon and verify dropdown opens
- [ ] Click "Dashboard" and verify redirect to `/dashboard`
- [ ] Click logo and verify redirect to `/dashboard`
- [ ] Click "Home" and verify redirect to `/`
- [ ] Click "Logout" and verify redirect to `/login`
- [ ] Test dropdown close (clicking outside)

---

## Phase 5: User Story 3 - Experience Celebratory Animation on Auth (Priority: P2)

**Goal**: Provide positive visual feedback (confetti/ribbon animation) on successful login/signup

**Independent Test**: After successful login or signup:
1. Celebratory animation (confetti/ribbon) displays for 1-2 seconds
2. Animation is non-blocking (page still responsive)
3. After animation, automatically redirect to `/dashboard`

**Acceptance Scenarios**:
- AC-3.1: After successful signup, confetti animation displays
- AC-3.2: After successful login, confetti animation displays
- AC-3.3: Animation displays for 1-2 seconds exactly
- AC-3.4: After animation completes, redirect to `/dashboard`
- AC-3.5: Animation doesn't block page interactions
- AC-3.6: If animation fails to load, still redirect to dashboard (graceful fallback)

### Implementation for User Story 3

- [ ] T024 [P] [US3] Create ConfettiAnimation component at `frontend/src/components/ConfettiAnimation.tsx`
  - Props: `isActive: boolean`, `onComplete: () => void`
  - Uses react-confetti library or Framer Motion for ribbon effect
  - Renders full-viewport confetti/animation
  - Auto-triggers for 1-2 seconds (use `useEffect` with timer)
  - Calls `onComplete()` when animation finishes
  - Z-index: high (above all page content)
  - Success: Animation displays smoothly and completes

- [ ] T025 [US3] Integrate ConfettiAnimation into login flow at `frontend/src/app/login/page.tsx`
  - Add state: `const [showConfetti, setShowConfetti] = useState(false)`
  - After successful login API call, set `showConfetti = true`
  - Render `<ConfettiAnimation isActive={showConfetti} onComplete={() => router.push('/dashboard')} />`
  - Success: Animation triggers after login, redirects to dashboard

- [ ] T026 [US3] Integrate ConfettiAnimation into signup flow at `frontend/src/app/signup/page.tsx` (or `/register`)
  - After successful registration API call, set `showConfetti = true`
  - Render `<ConfettiAnimation isActive={showConfetti} onComplete={() => router.push('/dashboard')} />`
  - Success: Animation triggers after signup, redirects to dashboard

- [ ] T027 [US3] Add error boundary/fallback to ConfettiAnimation in `frontend/src/components/ConfettiAnimation.tsx`
  - Try-catch around confetti rendering
  - If animation fails to load, still call `onComplete()` (graceful fallback)
  - Log any errors (console.error for debugging)
  - Success: Redirect still happens even if animation fails

**Checkpoint**: User Story 3 complete. Test independently:
- [ ] Log in and verify confetti animation displays
- [ ] Sign up and verify confetti animation displays
- [ ] Verify animation duration is 1-2 seconds
- [ ] Verify page redirects to dashboard after animation
- [ ] Click during animation and verify page is still responsive
- [ ] (Optional) Disable react-confetti and verify fallback redirect still works

---

## Phase 6: User Story 4 - Experience Smooth Page Transitions (Priority: P2)

**Goal**: Add Framer Motion animations to all page transitions for polished feel

**Independent Test**: Navigating between pages shows smooth animations:
1. Page fade-in/slide animation (< 500ms)
2. No layout shifts during animation
3. Consistent animation across all routes

**Acceptance Scenarios**:
- AC-4.1: Navigating from home to login shows smooth fade/slide
- AC-4.2: Navigating from login to dashboard shows smooth transition
- AC-4.3: All transitions complete in < 500ms
- AC-4.4: Animations don't cause layout shifts (use opacity/transform only)
- AC-4.5: Animation is same across all routes (consistent)

### Implementation for User Story 4

- [ ] T028 [P] [US4] Create AnimatedPage wrapper component at `frontend/src/components/AnimatedPage.tsx`
  - Uses Framer Motion `motion.div` with page transition animation
  - Props: `children: React.ReactNode`
  - Animation: fade in + slide up (opacity, y position)
  - Duration: 300ms
  - Export pre-configured animation for reuse
  - Success: Wrapper animates content on mount

- [ ] T029 [US4] Wrap main content in each page with AnimatedPage at `frontend/src/app/page.tsx` (landing)
  - Import AnimatedPage
  - Wrap `<LandingPage />` with `<AnimatedPage>`
  - Success: Landing page animates on load

- [ ] T030 [US4] Wrap main content in login page at `frontend/src/app/login/page.tsx`
  - Wrap login form/content with AnimatedPage
  - Success: Login page animates on route transition

- [ ] T031 [US4] Wrap main content in signup/register page at `frontend/src/app/signup/page.tsx` (or `/register`)
  - Wrap signup form/content with AnimatedPage
  - Success: Signup page animates on route transition

- [ ] T032 [US4] Wrap main content in dashboard page at `frontend/src/app/dashboard/page.tsx`
  - Wrap dashboard content with AnimatedPage
  - Success: Dashboard page animates on route transition

- [ ] T033 [US4] Update animations.ts with page transition config at `frontend/src/lib/animations.ts`
  - Ensure `pageTransition` object has correct properties
  - Duration: 300ms, easing: ease-in-out
  - Use opacity and transform (no width/height changes)
  - Document for consistency
  - Success: All components use same animation config

- [ ] T034 [US4] Test animation performance with DevTools at `frontend/src/`
  - Use Chrome DevTools: Performance tab, show FPS meter
  - Verify animations run at 60 FPS (no dropped frames)
  - Verify GPU acceleration (check if `transform` property used, not `top`/`left`)
  - Success: Animations are smooth (60 FPS), GPU-accelerated

**Checkpoint**: User Story 4 complete. Test independently:
- [ ] Navigate between pages and observe smooth animations
- [ ] Verify all animations complete in < 500ms
- [ ] Check DevTools Performance: animations should be 60 FPS
- [ ] Verify no layout shifts (use Ctrl+Shift+P "Show Paint Flashing" in Chrome)
- [ ] Test on low-end device (throttle CPU in DevTools) - should still be smooth

---

## Phase 7: User Story 5 - Enjoy Loading Feedback on Actions (Priority: P3)

**Goal**: Show loading spinners during async operations (create/delete tasks)

**Independent Test**: When creating or deleting a task:
1. Button shows loading spinner
2. Button is disabled (no double-clicks)
3. After action completes, spinner is replaced with new state
4. If error occurs, show error message instead of spinner

**Acceptance Scenarios**:
- AC-5.1: Create task button shows spinner while request is in-flight
- AC-5.2: Delete task button shows spinner while deletion is in-flight
- AC-5.3: Spinner appears within 100ms of button click
- AC-5.4: Button is disabled during loading (prevents double-submission)
- AC-5.5: After success, spinner replaced with new task state
- AC-5.6: After error, show error message (not spinner)

### Implementation for User Story 5

- [x] T035 [P] [US5] Update LoadingSpinner component for use on buttons at `frontend/src/components/LoadingSpinner.tsx`
  - Create small spinner icon (rotating SVG or icon) ✅
  - Props: `size?: 'small' | 'medium'`, `color?: string` ✅
  - Uses Framer Motion for smooth rotation animation ✅
  - Success: Spinner animates smoothly ✅

- [x] T036 [P] [US5] Create reusable useAsync hook at `frontend/src/lib/useAsync.ts`
  - Manages async operation state: `isLoading`, `error`, `data` ✅
  - Usage: `const { isLoading, error } = useAsync(asyncFunction)` ✅
  - Auto-handles loading state, error handling ✅
  - Prevents race conditions ✅
  - Success: Hook works with multiple async calls ✅

- [x] T037 [US5] Update create task button in dashboard at `frontend/src/app/dashboard/page.tsx` (or task form)
  - Use `useAsync` hook for create task API call ✅ (native implementation)
  - While `isLoading`: show `<LoadingSpinner />` in button ✅
  - While `isLoading`: `disabled={true}` on button ✅
  - After success: show success message or new task in list ✅
  - After error: show error message ✅
  - Success: Create task button has loading state ✅

- [x] T038 [US5] Update delete task button(s) in dashboard at `frontend/src/app/dashboard/` or task component
  - Use `useAsync` hook for delete task API call ✅ (native implementation)
  - While `isLoading`: show `<LoadingSpinner />` in button ✅
  - While `isLoading`: `disabled={true}` on button ✅
  - After success: remove task from list (or show toast message) ✅
  - After error: show error message ✅
  - Success: Delete task button has loading state ✅

- [x] T039 [US5] Style LoadingSpinner for button context in `frontend/src/components/LoadingSpinner.tsx`
  - Size: small (fits inside button) ✅
  - Color: white or contrasting color (readable on button background) ✅
  - Animation: smooth rotation (1s per full rotation) ✅
  - Success: Spinner looks good inside buttons ✅

**Checkpoint**: User Story 5 complete. Test independently (requires create/delete tasks):
- [ ] Click "Create Task" and verify spinner appears within 100ms
- [ ] Verify button is disabled while loading
- [ ] Verify spinner disappears and task appears after success
- [ ] Click "Delete Task" and verify spinner appears
- [ ] Verify task is removed after successful delete
- [ ] (If possible) Simulate slow network and verify spinner shows for longer duration
- [ ] (If possible) Trigger error and verify error message shows instead of spinner

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and overall quality

- [ ] T040 [P] Verify responsive design across all breakpoints
  - Test on 320px (mobile), 768px (tablet), 1024px+ (desktop)
  - Check: no horizontal scroll, text readable, buttons clickable on mobile
  - Use Chrome DevTools device emulation
  - Success: All pages responsive and usable on all sizes

- [ ] T041 [P] Verify dark mode support (if using CSS variables)
  - Test: `prefers-color-scheme: dark` in browser settings
  - Verify colors change automatically
  - Check: text readable, sufficient contrast (WCAG AA minimum)
  - Success: Dark mode works, no contrast issues

- [ ] T042 [P] Verify accessibility (keyboard navigation, ARIA labels)
  - Tab through all interactive elements
  - Verify focus indicators are visible
  - Check: buttons have `aria-label` if needed
  - Test with screen reader (NVDA, JAWS, or VoiceOver)
  - Success: No accessibility errors

- [ ] T043 [P] Add prefers-reduced-motion support
  - Detect `prefers-reduced-motion` media query
  - Skip animations or use instant transitions for users with this preference
  - Update animations.ts to handle this
  - Success: Animations respect user preference

- [ ] T044 Verify all console errors are resolved
  - Run each page and check browser console
  - No red errors, no unhandled promise rejections
  - Success: Console is clean

- [ ] T045 Test landing page load performance
  - Measure: page loads in < 2 seconds (SC-001)
  - Use Lighthouse or Chrome DevTools Network tab
  - Check: images optimized (use next/image)
  - Success: Page loads fast

- [ ] T046 Test animation performance
  - Measure: page transitions in < 500ms (SC-005)
  - Measure: loading spinners appear in < 100ms (SC-006)
  - Use Chrome DevTools Performance tab, FPS meter
  - Success: All animations smooth (60 FPS)

- [ ] T047 [P] Add error boundaries around components
  - Wrap LandingPage, Header, ConfettiAnimation with React error boundary
  - Prevent one component's error from crashing entire app
  - Success: No white-screen-of-death on component errors

- [ ] T048 Update documentation: add this feature to frontend README
  - Document: new routes (`/`), new components (Header, LandingPage, etc.)
  - Include: dependencies installed, how to run locally
  - Success: Documentation is up-to-date

- [ ] T049 [P] Code cleanup and formatting
  - Run `npm run lint` and `npm run format` in frontend/
  - Fix all linting errors
  - Success: No lint warnings

- [ ] T050 Final cross-feature integration test
  - Test full user journey: unauthenticated → landing page → signup → celebratory animation → dashboard → logout → back to home
  - Verify: all links work, animations smooth, no errors
  - Success: Feature fully integrated

**Checkpoint**: All user stories complete and polished. Ready for:
- [ ] Code review
- [ ] Merge to main branch
- [ ] Deployment to staging/production

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately ✅
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Stories 1-2 can proceed in parallel (both P1)
  - User Stories 3-4 can proceed in parallel (both P2)
  - User Story 5 (P3) can proceed after 3-4
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Priority | Dependencies | Can Start After |
|-------|----------|--------------|-----------------|
| US1: Unauthenticated Landing Page | P1 | Phase 2 (Foundational) | T007 complete |
| US2: Authenticated Navigation | P1 | Phase 2 + US1 complete | T007 + T017 |
| US3: Celebratory Animation | P2 | Phase 2 + US1/US2 | T023 complete |
| US4: Smooth Transitions | P2 | Phase 2 + all routes exist | T023 complete |
| US5: Loading Feedback | P3 | Phase 2 + dashboard complete | T023 complete |

### Within Each User Story

1. Tests (if included) → write and verify they FAIL first
2. Components → build base components
3. Integration → integrate with routes/existing components
4. Styling → apply theme and responsive design
5. Validation → test against acceptance criteria

### Parallel Opportunities

**Phase 1 Setup**:
- T001, T002, T003 can run in parallel (independent setup tasks)

**Phase 2 Foundational**:
- T005, T006 can run in parallel (different files)
- T004, T007 sequential (T004 must complete before T007)

**Phase 3 User Story 1**:
- T008, T009, T010, T011, T012 can run in parallel (all component creation, no dependencies)
- T013, T014, T015, T016, T017 sequential (build on component foundation)

**Phase 4 User Story 2**:
- T018, T019 can overlap (T018 is simpler, T019 uses it)
- T020-T023 sequential (each depends on previous)

**Phase 5 User Story 3**:
- T024, T025, T026 can overlap (T024 is the base, T025/T026 use it)

**Phase 6 User Story 4**:
- T028 creates base component
- T029-T032 can run in parallel (each wraps different page)
- T033, T034 sequential

**Phase 7 User Story 5**:
- T035, T036 can run in parallel (different utilities)
- T037, T038 can overlap (same pattern, different pages)
- T039 sequential (styling depends on T035)

**Phase 8 Polish**:
- T040, T041, T042, T043, T044, T047, T049 can run in parallel
- T045, T046 sequential (performance testing)
- T048 sequential (documentation)
- T050 sequential (final integration test)

---

## Parallel Example: User Story 1 Setup

To maximize parallel work on User Story 1:

```bash
# Start setup immediately (Phase 1)
Task: T001 - Install dependencies
Task: T002 - Verify config
Task: T003 - Create animations.ts

# After setup completes, start foundational (Phase 2) - can parallelize
Task: T004 - Create theme system
Task: T005 - Create auth types
Task: T006 - Create LoadingSpinner
(T007 depends on T005, start after T005)

# After foundational completes, start US1 - can parallelize components
Task: T008 - Create LandingPage
Task: T009 - Create HeroSection (in parallel with T008)
Task: T010 - Create AboutSection (in parallel with T008)
Task: T011 - Create FeaturesSection (in parallel with T008)
Task: T012 - Create ContactSection (in parallel with T008)
(T013-T017 depend on these components, start sequentially after)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (30 min)
2. Complete Phase 2: Foundational (30 min)
3. Complete Phase 3: User Story 1 (2-3 hours)
4. Complete Phase 4: User Story 2 (1-2 hours)
5. **STOP and VALIDATE**: Test User Stories 1 + 2 independently
6. Deploy/demo if ready

**Estimated Time**: 5-6 hours for landing page + authenticated header

### Incremental Delivery (All User Stories)

1. Setup + Foundational → Foundation ready (1 hour)
2. Add User Story 1 → Test independently → Deploy (2-3 hours)
3. Add User Story 2 → Test independently → Deploy (1-2 hours)
4. Add User Story 3 → Test independently → Deploy (1 hour)
5. Add User Story 4 → Test independently → Deploy (1-2 hours)
6. Add User Story 5 → Test independently → Deploy (1-2 hours)
7. Polish → Final validation → Production ready (1-2 hours)

**Estimated Total Time**: 10-14 hours for full feature

### Parallel Team Strategy (If Multiple Developers)

With 2-3 developers:

1. Team together: Complete Setup + Foundational (1 hour)
2. Once Foundational done:
   - Dev A: User Stories 1 + 2 (Header + Landing)
   - Dev B: User Stories 3 + 4 (Animations + Transitions)
   - Dev C: User Story 5 (Loading states) + Polish
3. Daily integration tests to ensure stories work together
4. All push to same branch for final review

**Estimated Time**: 8-10 hours with parallel work

---

## Validation Checklist

Before marking each phase complete, verify:

### Phase 1 Setup
- [ ] Dependencies installed: `npm list framer-motion react-confetti`
- [ ] Next.js and Tailwind config present
- [ ] animations.ts file created and exports default configs

### Phase 2 Foundational
- [ ] globals.css has theme CSS variables
- [ ] auth.ts confirms useSession() and logout() available
- [ ] LoadingSpinner renders without errors
- [ ] No TypeScript errors in auth.ts types

### User Story 1
- [ ] Landing page loads in < 2 seconds (Lighthouse)
- [ ] All 4 sections (Hero, About, Features, Contact) visible
- [ ] Header shows "Sign In" and "Get Started" buttons
- [ ] Clicking buttons redirects correctly
- [ ] Responsive on 320px, 768px, 1024px+ viewports
- [ ] No console errors

### User Story 2
- [ ] After login, header shows user email
- [ ] Clicking email opens dropdown
- [ ] Dropdown has "Dashboard" and "Logout" options
- [ ] Logo navigates to dashboard when authenticated
- [ ] Home link works
- [ ] Logout redirects to login page
- [ ] Dropdown closes on outside click

### User Story 3
- [ ] Confetti animation appears after login
- [ ] Confetti animation appears after signup
- [ ] Animation lasts 1-2 seconds
- [ ] Redirect to dashboard after animation
- [ ] Page responsive during animation
- [ ] Fallback redirect if animation fails

### User Story 4
- [ ] Page transitions smooth (fade/slide)
- [ ] Transitions complete in < 500ms
- [ ] No layout shifts (DevTools Paint Flashing off)
- [ ] 60 FPS animations (DevTools Performance tab)
- [ ] Consistent across all routes

### User Story 5
- [ ] Create task shows spinner within 100ms
- [ ] Delete task shows spinner within 100ms
- [ ] Button disabled while loading
- [ ] Spinner replaced with result after success
- [ ] Error message shown on failure

### Phase 8 Polish
- [ ] No console errors or warnings
- [ ] Responsive on all breakpoints
- [ ] Dark mode works (if implemented)
- [ ] Keyboard navigation works
- [ ] ARIA labels present
- [ ] Animations respect prefers-reduced-motion
- [ ] Load time < 2 seconds
- [ ] All lint passes: `npm run lint`
- [ ] Formatting clean: `npm run format`

---

## Notes

- [P] tasks = different files, no data dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Test each story in isolation before moving to next
- Commit after each task or logical group (e.g., after T008-T012 components)
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Use feature branch `002-landing-page-ui` for all work
- All code generated by AI should include: `// Task TXXX: Description (@specs/002-landing-page-ui/spec.md §X.X)`
- All commits should include: `Co-Authored-By: Claude <noreply@anthropic.com>`
