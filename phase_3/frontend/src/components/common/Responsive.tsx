/**
 * Task: T076 | Spec: @specs/001-sdd-initialization/ui/pages.md §Responsive Design
 * Description: Responsive utility components for mobile-first design
 * Purpose: Conditional rendering based on screen size (mobile, tablet, desktop)
 * Reference: plan.md Step 5, Constitution VI (Code Quality)
 */

import { ReactNode } from 'react';

/**
 * MobileOnly Component
 *
 * Renders children only on mobile devices (< 640px)
 * Hidden on tablet and desktop screens
 *
 * Reference: Tailwind breakpoint sm: 640px
 *
 * @example
 * <MobileOnly>
 *   <MobileMenuButton />
 * </MobileOnly>
 */
export function MobileOnly({ children }: { children: ReactNode }) {
  return <div className="sm:hidden">{children}</div>;
}

/**
 * TabletOnly Component
 *
 * Renders children only on tablet devices (640px - 1023px)
 * Hidden on mobile and desktop screens
 *
 * Reference: Tailwind breakpoints sm: 640px, lg: 1024px
 *
 * @example
 * <TabletOnly>
 *   <TabletNavigation />
 * </TabletOnly>
 */
export function TabletOnly({ children }: { children: ReactNode }) {
  return (
    <div className="hidden sm:block lg:hidden">{children}</div>
  );
}

/**
 * DesktopOnly Component
 *
 * Renders children only on desktop devices (>= 1024px)
 * Hidden on mobile and tablet screens
 *
 * Reference: Tailwind breakpoint lg: 1024px
 *
 * @example
 * <DesktopOnly>
 *   <DesktopSidebar />
 * </DesktopOnly>
 */
export function DesktopOnly({ children }: { children: ReactNode }) {
  return <div className="hidden lg:block">{children}</div>;
}

/**
 * TabletUp Component
 *
 * Renders children on tablet and desktop devices (>= 640px)
 * Hidden on mobile screens
 *
 * Reference: Tailwind breakpoint sm: 640px
 *
 * @example
 * <TabletUp>
 *   <DesktopSidebar />
 * </TabletUp>
 */
export function TabletUp({ children }: { children: ReactNode }) {
  return <div className="hidden sm:block">{children}</div>;
}

/**
 * DesktopUp Component
 *
 * Renders children only on desktop devices (>= 1024px)
 * Hidden on mobile and tablet screens
 *
 * Reference: Tailwind breakpoint lg: 1024px
 *
 * @example
 * <DesktopUp>
 *   <DesktopLayout />
 * </DesktopUp>
 */
export function DesktopUp({ children }: { children: ReactNode }) {
  return <div className="hidden lg:block">{children}</div>;
}

/**
 * MobileDown Component
 *
 * Renders children only on mobile devices (< 640px)
 * Alias for MobileOnly
 *
 * @example
 * <MobileDown>
 *   <MobileMenu />
 * </MobileDown>
 */
export function MobileDown({ children }: { children: ReactNode }) {
  return <div className="sm:hidden">{children}</div>;
}

/**
 * FlexGrid Component
 *
 * Responsive grid for task cards with adaptive columns
 * - Mobile: 1 column (full width)
 * - Tablet: 2 columns (640px+)
 * - Desktop: 3-4 columns (1024px+)
 *
 * Features:
 * - Auto-responsive gap based on screen size
 * - Consistent padding and margins
 * - Mobile-first stacking
 * - Flexible item sizing
 *
 * Reference: Tailwind grid system, mobile-first design
 *
 * @example
 * <FlexGrid variant="cards">
 *   <TaskCard task={task1} />
 *   <TaskCard task={task2} />
 *   <TaskCard task={task3} />
 * </FlexGrid>
 */
interface FlexGridProps {
  children: ReactNode;
  variant?: 'cards' | 'compact' | 'dense';
  gap?: 'tight' | 'normal' | 'spacious';
  className?: string;
}

export function FlexGrid({
  children,
  variant = 'cards',
  gap = 'normal',
  className = '',
}: FlexGridProps) {
  const gapClasses = {
    tight: 'gap-2 sm:gap-3 lg:gap-4',
    normal: 'gap-4 sm:gap-5 lg:gap-6',
    spacious: 'gap-6 sm:gap-8 lg:gap-10',
  };

  const variantClasses = {
    // Task cards: 1 col mobile, 2 col tablet, 3 col desktop
    cards: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    // Compact: 1 col mobile, 2 col tablet, 4 col desktop
    compact: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    // Dense: 2 col mobile, 3 col tablet, 4 col desktop
    dense: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div
      className={`grid ${variantClasses[variant]} ${gapClasses[gap]} w-full ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveContainer Component
 *
 * Smart container that adjusts padding and max-width based on screen size
 * - Mobile: Full width with side padding
 * - Tablet: Medium container with more padding
 * - Desktop: Large container with generous padding
 *
 * @example
 * <ResponsiveContainer size="lg">
 *   <Dashboard />
 * </ResponsiveContainer>
 */
interface ResponsiveContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ResponsiveContainer({
  children,
  size = 'md',
  className = '',
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
  };

  return (
    <div
      className={`w-full px-4 sm:px-6 lg:px-8 mx-auto ${sizeClasses[size]} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveStack Component
 *
 * Stack layout that switches from column (mobile) to row (desktop)
 * Useful for side-by-side layouts that need to stack on mobile
 *
 * @example
 * <ResponsiveStack direction="row" breakpoint="md">
 *   <Sidebar />
 *   <MainContent />
 * </ResponsiveStack>
 */
interface ResponsiveStackProps {
  children: ReactNode;
  direction?: 'row' | 'column';
  breakpoint?: 'sm' | 'md' | 'lg';
  gap?: 'tight' | 'normal' | 'spacious';
  className?: string;
}

export function ResponsiveStack({
  children,
  direction = 'row',
  breakpoint = 'md',
  gap = 'normal',
  className = '',
}: ResponsiveStackProps) {
  const gapClasses = {
    tight: 'gap-2 sm:gap-3 lg:gap-4',
    normal: 'gap-4 sm:gap-5 lg:gap-6',
    spacious: 'gap-6 sm:gap-8 lg:gap-10',
  };

  const breakpointMap = {
    sm: 'sm:flex-row',
    md: 'md:flex-row',
    lg: 'lg:flex-row',
  };

  const directionClass = direction === 'row' ? breakpointMap[breakpoint] : '';

  return (
    <div
      className={`flex flex-col ${directionClass} ${gapClasses[gap]} w-full ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveText Component
 *
 * Text that adjusts font size based on screen size
 * Useful for responsive headings and descriptions
 *
 * @example
 * <ResponsiveText as="h1" variant="hero">
 *   Welcome to Task Manager
 * </ResponsiveText>
 */
interface ResponsiveTextProps {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  variant?: 'hero' | 'heading' | 'subheading' | 'body' | 'small';
  className?: string;
}

export function ResponsiveText({
  children,
  as: Component = 'p',
  variant = 'body',
  className = '',
}: ResponsiveTextProps) {
  const variantClasses = {
    hero: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    heading: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
    subheading: 'text-lg sm:text-xl lg:text-2xl font-semibold',
    body: 'text-base sm:text-base lg:text-lg',
    small: 'text-sm sm:text-sm lg:text-base',
  };

  return (
    <Component className={`${variantClasses[variant]} ${className}`}>
      {children}
    </Component>
  );
}
