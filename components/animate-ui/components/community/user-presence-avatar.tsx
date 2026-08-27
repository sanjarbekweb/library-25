'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Reader {
  id: number;
  name: string;
  department: string;
  initials: string;
  bg: string;
  textColor: string;
  online: boolean;
}

const READERS: Reader[] = [
  {
    id: 1,
    name: 'Arham (CS & Software)',
    department: 'CS',
    initials: 'AK',
    bg: 'bg-blue-600',
    textColor: 'text-white',
    online: true,
  },
  {
    id: 2,
    name: 'Sardor (Systems Admin)',
    department: 'Admin',
    initials: 'SK',
    bg: 'bg-indigo-600',
    textColor: 'text-white',
    online: true,
  },
  {
    id: 3,
    name: 'Elena (Mathematics)',
    department: 'Math',
    initials: 'ER',
    bg: 'bg-emerald-600',
    textColor: 'text-white',
    online: true,
  },
  {
    id: 4,
    name: 'Prof. Alisher (Faculty)',
    department: 'Faculty',
    initials: 'AQ',
    bg: 'bg-amber-600',
    textColor: 'text-white',
    online: false,
  },
  {
    id: 5,
    name: 'David (Physics)',
    department: 'Physics',
    initials: 'DR',
    bg: 'bg-violet-600',
    textColor: 'text-white',
    online: false,
  },
  {
    id: 6,
    name: 'Jasur (History)',
    department: 'History',
    initials: 'JK',
    bg: 'bg-rose-600',
    textColor: 'text-white',
    online: false,
  },
];

interface UserPresenceAvatarProps {
  className?: string;
  size?: 'sm' | 'default';
}

export function UserPresenceAvatar({ className, size = 'default' }: UserPresenceAvatarProps) {
  const [readers, setReaders] = React.useState<Reader[]>(READERS);
  const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null);

  const onlineReaders = readers.filter((r) => r.online);
  const offlineReaders = readers.filter((r) => !r.online);

  const toggleStatus = (id: number) => {
    setReaders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, online: !r.online } : r))
    );
  };

  const avatarSizeClass =
    size === 'sm' ? 'w-8 h-8 text-[11px]' : 'w-9 sm:w-10 h-9 sm:h-10 text-xs sm:text-sm';
  const pillPadding = size === 'sm' ? 'p-1' : 'p-1 sm:p-1.5';

  return (
    <div className={cn('flex flex-wrap items-center gap-3 relative', className)}>
      {/* Online Group Pill */}
      {onlineReaders.length > 0 && (
        <div
          className={cn(
            'flex items-center -space-x-2 rounded-full border border-border/80 bg-slate-200/80 dark:bg-zinc-800/90 shadow-2xs',
            pillPadding
          )}
        >
          {onlineReaders.map((reader) => (
            <button
              key={reader.id}
              type="button"
              onClick={() => toggleStatus(reader.id)}
              onMouseEnter={() => setActiveTooltip(reader.name)}
              onMouseLeave={() => setActiveTooltip(null)}
              className={cn(
                'relative rounded-full flex items-center justify-center font-bold font-display shadow-xs transition-transform duration-200 hover:scale-110 hover:z-20 border-2 border-background cursor-pointer shrink-0 select-none',
                reader.bg,
                reader.textColor,
                avatarSizeClass
              )}
              title={`${reader.name} (Click to set offline)`}
            >
              {reader.initials}
              {/* Online Green Beacon Dot */}
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            </button>
          ))}
        </div>
      )}

      {/* Offline Group Pill */}
      {offlineReaders.length > 0 && (
        <div
          className={cn(
            'flex items-center -space-x-2 rounded-full border border-border/80 bg-slate-200/80 dark:bg-zinc-800/90 shadow-2xs opacity-80 hover:opacity-100 transition-opacity',
            pillPadding
          )}
        >
          {offlineReaders.map((reader) => (
            <button
              key={reader.id}
              type="button"
              onClick={() => toggleStatus(reader.id)}
              onMouseEnter={() => setActiveTooltip(reader.name)}
              onMouseLeave={() => setActiveTooltip(null)}
              className={cn(
                'relative rounded-full flex items-center justify-center font-bold font-display shadow-xs transition-transform duration-200 hover:scale-110 hover:z-20 border-2 border-background grayscale hover:grayscale-0 cursor-pointer shrink-0 select-none opacity-85 hover:opacity-100',
                reader.bg,
                reader.textColor,
                avatarSizeClass
              )}
              title={`${reader.name} (Click to set online)`}
            >
              {reader.initials}
            </button>
          ))}
        </div>
      )}

      {/* Floating Hover Label */}
      {activeTooltip && (
        <div className="absolute -top-7 left-0 z-30 px-2 py-0.5 rounded-md bg-foreground text-background text-[10px] font-medium shadow-md pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          {activeTooltip}
        </div>
      )}
    </div>
  );
}
