'use client';

import * as React from 'react';
import { motion, LayoutGroup } from 'motion/react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/animate-ui/components/animate/tooltip';
import { cn } from '@/lib/utils';

const USERS = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    fallback: 'AK',
    tooltip: 'Arham (CS)',
    online: true,
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    fallback: 'SK',
    tooltip: 'Sardor (Admin)',
    online: true,
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    fallback: 'EL',
    tooltip: 'Elena (Math)',
    online: true,
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    fallback: 'AQ',
    tooltip: 'Alisher (Faculty)',
    online: false,
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    fallback: 'DR',
    tooltip: 'David (Physics)',
    online: false,
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    fallback: 'JK',
    tooltip: 'Jasur (History)',
    online: false,
  },
];

const AVATAR_MOTION_TRANSITION = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
} as const;

const GROUP_CONTAINER_TRANSITION = {
  type: 'spring',
  stiffness: 150,
  damping: 20,
} as const;

interface UserPresenceAvatarProps {
  className?: string;
  size?: 'sm' | 'default';
}

function UserPresenceAvatar({ className, size = 'default' }: UserPresenceAvatarProps) {
  const [users, setUsers] = React.useState(USERS);
  const [togglingGroup, setTogglingGroup] = React.useState<
    'online' | 'offline' | null
  >(null);

  const online = users.filter((u) => u.online);
  const offline = users.filter((u) => !u.online);

  const toggleStatus = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    setTogglingGroup(user.online ? 'online' : 'offline');
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === id);
      if (idx === -1) return prev;
      const updated = [...prev];
      const target = updated[idx];
      if (!target) return prev;
      updated.splice(idx, 1);
      updated.push({ ...target, online: !target.online });
      return updated;
    });
    // Reset group z-index after the animation duration (keep in sync with animation timing)
    setTimeout(() => setTogglingGroup(null), 500);
  };

  const avatarSizeClass = size === 'sm' ? 'size-9 sm:size-9.5' : 'size-10 sm:size-11';
  const containerHeightClass = size === 'sm' ? 'h-9.5' : 'h-11';

  return (
    <div className={cn("flex flex-wrap items-center gap-3 sm:gap-4", className)}>
      <LayoutGroup>
        <TooltipProvider>
          {online.length > 0 && (
            <motion.div
              layout
              className={cn(
                'bg-slate-200/90 dark:bg-zinc-800 p-0.5 rounded-full shadow-2xs',
                togglingGroup === 'online' ? 'z-5' : 'z-10',
              )}
              transition={GROUP_CONTAINER_TRANSITION}
            >
              <div
                key={online.map((u) => u.id).join('_') + '-online'}
                className={cn("flex items-center -space-x-2 sm:-space-x-2.5", containerHeightClass)}
              >
                {online.map((user) => (
                  <Tooltip key={user.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        layoutId={`avatar-${user.id}`}
                        className="cursor-pointer"
                        onClick={() => toggleStatus(user.id)}
                        animate={{
                          filter: 'grayscale(0)',
                          scale: 1,
                        }}
                        transition={AVATAR_MOTION_TRANSITION}
                        initial={false}
                      >
                        <Avatar className={cn("border-2 border-slate-200/90 dark:border-zinc-800 shadow-xs", avatarSizeClass)}>
                          <AvatarImage src={user.src} alt={user.tooltip} />
                          <AvatarFallback className="font-bold text-xs bg-brand-blue text-white">{user.fallback}</AvatarFallback>
                        </Avatar>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </motion.div>
          )}

          {offline.length > 0 && (
            <motion.div
              layout
              className={cn(
                'bg-slate-200/90 dark:bg-zinc-800 p-0.5 rounded-full shadow-2xs',
                togglingGroup === 'offline' ? 'z-5' : 'z-10',
              )}
              transition={GROUP_CONTAINER_TRANSITION}
            >
              <div
                key={offline.map((u) => u.id).join('_') + '-offline'}
                className={cn("flex items-center -space-x-2 sm:-space-x-2.5", containerHeightClass)}
              >
                {offline.map((user) => (
                  <Tooltip key={user.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        layoutId={`avatar-${user.id}`}
                        className="cursor-pointer"
                        onClick={() => toggleStatus(user.id)}
                        animate={{
                          filter: 'grayscale(1)',
                          scale: 1,
                        }}
                        transition={AVATAR_MOTION_TRANSITION}
                        initial={false}
                      >
                        <Avatar className={cn("border-2 border-slate-200/90 dark:border-zinc-800 shadow-xs", avatarSizeClass)}>
                          <AvatarImage src={user.src} alt={user.tooltip} />
                          <AvatarFallback className="font-bold text-xs bg-muted text-muted-foreground">{user.fallback}</AvatarFallback>
                        </Avatar>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </motion.div>
          )}
        </TooltipProvider>
      </LayoutGroup>
    </div>
  );
}

export { UserPresenceAvatar };
