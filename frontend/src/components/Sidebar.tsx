'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, LogOut, Home, CheckCircle, ListTodo, Folder, Settings, HelpCircle } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: CheckCircle, label: 'Vital Task', href: '/vital-task' },
    { icon: ListTodo, label: 'My Task', href: '/my-task' },
    { icon: Folder, label: 'Categories', href: '/categories' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: HelpCircle, label: 'Help', href: '/help' },
  ];

  const sidebarContent = (
    <>
      {/* User Profile Section - Glassmorphism Card */}
      <div className="p-6 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-4 mb-3">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/40 flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{user?.name || 'User'}</h3>
            <p className="text-xs text-white/60 truncate">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 group backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            >
              <Icon className="w-5 h-5 group-hover:scale-110 group-hover:text-primary transition-all" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button - Primary Accent Color */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold transition-all duration-200 shadow-glow-sm hover:shadow-glow active:scale-95 backdrop-blur-sm"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-primary hover:bg-primary-600 text-white transition-all shadow-glow-sm"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:flex-col md:bg-gradient-to-b md:from-primary/20 md:to-primary/10 md:backdrop-blur-lg md:z-40 md:border-r md:border-white/10">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-primary/20 to-primary/10 backdrop-blur-lg transform transition-transform duration-300 z-40 flex flex-col overflow-y-auto border-r border-white/10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
