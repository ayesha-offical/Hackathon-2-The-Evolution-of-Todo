/**
 * Task: T076 | Spec: @specs/001-sdd-initialization/ui/pages.md §Responsive Design
 * Description: Responsive layout system with mobile/tablet/desktop breakpoints
 * Purpose: Provide adaptive layout containers for responsive page structures
 * Reference: plan.md Step 5, Constitution VI (Code Quality)
 */

import { ReactNode } from 'react';

/**
 * ResponsiveLayout Component
 *
 * Main layout wrapper that manages responsive spacing and structure
 * - Mobile: Single column, full width with padding
 * - Tablet: Two columns with sidebar collapsible
 * - Desktop: Two columns with persistent sidebar
 *
 * @example
 * <ResponsiveLayout>
 *   <ResponsiveLayout.Sidebar>
 *     <SidebarContent />
 *   </ResponsiveLayout.Sidebar>
 *   <ResponsiveLayout.Main>
 *     <MainContent />
 *   </ResponsiveLayout.Main>
 * </ResponsiveLayout>
 */
export function ResponsiveLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}

/**
 * ResponsiveLayout.Sidebar
 * Sidebar that collapses to hidden on mobile (< 768px)
 * Shows as drawer on tablet/mobile
 */
interface ResponsiveSidebarProps {
  children: ReactNode;
  className?: string;
}

function ResponsiveSidebar({ children, className = '' }: ResponsiveSidebarProps) {
  return (
    <aside
      className={`
        hidden
        md:flex
        md:flex-col
        md:w-64
        lg:w-72
        bg-white
        dark:bg-gray-800
        border-r
        border-gray-200
        dark:border-gray-700
        ${className}
      `}
    >
      {children}
    </aside>
  );
}

/**
 * ResponsiveLayout.Main
 * Main content area that expands on all screen sizes
 */
interface ResponsiveMainProps {
  children: ReactNode;
  className?: string;
}

function ResponsiveMain({ children, className = '' }: ResponsiveMainProps) {
  return (
    <main
      className={`
        flex-1
        min-w-0
        overflow-y-auto
        ${className}
      `}
    >
      {children}
    </main>
  );
}

/**
 * ResponsiveLayout.Content
 * Centered content wrapper with max-width and responsive padding
 */
interface ResponsiveContentProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

function ResponsiveContent({
  children,
  maxWidth = 'lg',
  className = '',
}: ResponsiveContentProps) {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'w-full',
  };

  return (
    <div
      className={`
        w-full
        mx-auto
        px-4
        sm:px-6
        lg:px-8
        py-6
        sm:py-8
        ${maxWidthClasses[maxWidth]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveLayout.Grid
 * Responsive grid that adapts to screen size
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 3-4 columns
 */
interface ResponsiveGridProps {
  children: ReactNode;
  columns?: 'auto' | '1' | '2' | '3' | '4';
  gap?: 'compact' | 'normal' | 'spacious';
  className?: string;
}

function ResponsiveGrid({
  children,
  columns = 'auto',
  gap = 'normal',
  className = '',
}: ResponsiveGridProps) {
  const columnClasses = {
    auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    compact: 'gap-2 sm:gap-3 lg:gap-4',
    normal: 'gap-4 sm:gap-5 lg:gap-6',
    spacious: 'gap-6 sm:gap-8 lg:gap-10',
  };

  return (
    <div
      className={`
        grid
        ${columnClasses[columns]}
        ${gapClasses[gap]}
        w-full
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveLayout.Section
 * Full-width section with responsive background and spacing
 */
interface ResponsiveSectionProps {
  children: ReactNode;
  variant?: 'white' | 'gray' | 'transparent';
  className?: string;
}

function ResponsiveSection({
  children,
  variant = 'white',
  className = '',
}: ResponsiveSectionProps) {
  const variantClasses = {
    white: 'bg-white dark:bg-gray-800',
    gray: 'bg-gray-50 dark:bg-gray-900',
    transparent: 'bg-transparent',
  };

  return (
    <section
      className={`
        w-full
        py-6
        sm:py-8
        lg:py-12
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </section>
  );
}

/**
 * ResponsiveLayout.Header
 * Page header with responsive typography
 */
interface ResponsiveHeaderProps {
  children: ReactNode;
  className?: string;
}

function ResponsiveHeader({ children, className = '' }: ResponsiveHeaderProps) {
  return (
    <div
      className={`
        mb-6
        sm:mb-8
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveLayout.Title
 * Responsive page title with adaptive font sizes
 */
interface ResponsiveTitleProps {
  children: ReactNode;
  level?: 'h1' | 'h2' | 'h3';
  className?: string;
}

function ResponsiveTitle({
  children,
  level: Heading = 'h1',
  className = '',
}: ResponsiveTitleProps) {
  const sizeClasses = {
    h1: 'text-2xl sm:text-3xl lg:text-4xl',
    h2: 'text-xl sm:text-2xl lg:text-3xl',
    h3: 'text-lg sm:text-xl lg:text-2xl',
  };

  return (
    <Heading
      className={`
        font-bold
        text-gray-900
        dark:text-white
        ${sizeClasses[Heading]}
        ${className}
      `}
    >
      {children}
    </Heading>
  );
}

// Attach sub-components to ResponsiveLayout
ResponsiveLayout.Sidebar = ResponsiveSidebar;
ResponsiveLayout.Main = ResponsiveMain;
ResponsiveLayout.Content = ResponsiveContent;
ResponsiveLayout.Grid = ResponsiveGrid;
ResponsiveLayout.Section = ResponsiveSection;
ResponsiveLayout.Header = ResponsiveHeader;
ResponsiveLayout.Title = ResponsiveTitle;
