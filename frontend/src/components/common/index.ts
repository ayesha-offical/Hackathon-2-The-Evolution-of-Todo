/**
 * Task: T076 | Spec: @specs/001-sdd-initialization/ui/pages.md §Responsive Design
 * Description: Central export point for common/responsive components
 * Purpose: Simplify imports across the application
 * Reference: plan.md Step 5, Constitution VI (Code Quality)
 */

// Responsive utility components
export {
  MobileOnly,
  TabletOnly,
  DesktopOnly,
  TabletUp,
  DesktopUp,
  MobileDown,
  FlexGrid,
  ResponsiveContainer,
  ResponsiveStack,
  ResponsiveText,
} from './Responsive';

// Responsive layout system
export { ResponsiveLayout } from './ResponsiveLayout';

// Navigation with responsive hamburger menu
export { Navigation } from './Navigation';

// Other common components
export { Header } from './Header';
export { ErrorAlert, SuccessToast, AlertContainer } from './Alert';
export { default as Pagination } from './Pagination';
export { PasswordInput } from './PasswordInput';
