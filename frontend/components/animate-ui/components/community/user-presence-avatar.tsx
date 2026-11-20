'use client';

import * as React from 'react';
import Image, { StaticImageData } from 'next/image';
import { cn } from '@/lib/utils';

import avatar1 from '@/public/avatars/avatar-1.webp';
import avatar2 from '@/public/avatars/avatar-2.webp';
import avatar3 from '@/public/avatars/avatar-3.webp';
import avatar4 from '@/public/avatars/avatar-4.webp';
import avatar5 from '@/public/avatars/avatar-5.webp';
import avatar6 from '@/public/avatars/avatar-6.webp';

interface Reader {
  id: number;
  name: string;
  department: string;
  initials: string;
  image: StaticImageData;
  bg: string;
  online: boolean;
}

const READERS: Reader[] = [
  {
    id: 1,
    name: 'Malika (CS & Software)',
    department: 'CS',
    initials: 'MA',
    image: avatar1,
    bg: 'bg-blue-600',
    online: true,
  },
  {
    id: 2,
    name: 'Sardor (Systems Admin)',
    department: 'Admin',
    initials: 'SK',
    image: avatar2,
    bg: 'bg-indigo-600',
    online: true,
  },
  {
    id: 3,
    name: 'Elena (Mathematics)',
    department: 'Math',
    initials: 'ER',
    image: avatar3,
    bg: 'bg-emerald-600',
    online: true,
  },
  {
    id: 4,
    name: 'Prof. Alisher (Faculty)',
    department: 'Faculty',
    initials: 'AQ',
    image: avatar4,
    bg: 'bg-amber-600',
    online: false,
  },
  {
    id: 5,
    name: 'David (Physics)',
    department: 'Physics',
    initials: 'DR',
    image: avatar5,
    bg: 'bg-violet-600',
    online: false,
  },
  {
    id: 6,
    name: 'Jasur (History)',
    department: 'History',
    initials: 'JK',
    image: avatar6,
    bg: 'bg-rose-600',
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
    size === 'sm' ? 'w-8 h-8' : 'w-9 sm:w-10 h-9 sm:h-10';
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
                'relative rounded-full flex items-center justify-center shadow-xs transition-transform duration-200 hover:scale-110 hover:z-20 border-2 border-background cursor-pointer shrink-0 overflow-hidden select-none bg-muted',
                avatarSizeClass
              )}
              title={`${reader.name} (Click to set offline)`}
            >
              <Image
                src={reader.image}
                alt={reader.name}
                className="w-full h-full object-cover"
                priority
              />
              {/* Online Green Beacon Dot */}
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background z-10" />
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
                'relative rounded-full flex items-center justify-center shadow-xs transition-transform duration-200 hover:scale-110 hover:z-20 border-2 border-background grayscale hover:grayscale-0 cursor-pointer shrink-0 overflow-hidden select-none opacity-85 hover:opacity-100 bg-muted',
                avatarSizeClass
              )}
              title={`${reader.name} (Click to set online)`}
            >
              <Image
                src={reader.image}
                alt={reader.name}
                className="w-full h-full object-cover"
              />
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
