'use client';

import { Search, Bell, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TopBarProps {
  onSearch?: (query: string) => void;
}

export default function TopBar({ onSearch }: TopBarProps) {
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

    setCurrentDay(dayName);
    setCurrentDate(dateStr);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <header className="bg-background-surface/80 backdrop-blur-lg border-b border-white/10 shadow-glass-sm fixed top-0 right-0 left-0 md:left-64 z-30">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search your task here..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Right Section - Icons and Date */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button className="p-2 rounded-xl hover:bg-white/10 text-primary transition-colors relative group backdrop-blur-sm">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            <div className="absolute right-0 top-full mt-2 bg-white/10 backdrop-blur-md border border-white/20 text-white p-3 rounded-xl shadow-card text-sm whitespace-nowrap hidden group-hover:block">
              No new notifications
            </div>
          </button>

          {/* Calendar Icon */}
          <button className="p-2 rounded-xl hover:bg-white/10 text-primary transition-colors backdrop-blur-sm">
            <Calendar className="w-6 h-6" />
          </button>

          {/* Date Display */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="text-right">
              <p className="text-xs text-white/60 font-medium">{currentDay}</p>
              <p className="text-sm font-semibold text-white">{currentDate}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
