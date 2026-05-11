'use client';

import { useState } from 'react';
import { cn } from '@jbrtechno/shared';
import Image from 'next/image';

interface UserAvatarProps {
  name?: string | null;
  email?: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const colors = [
  'bg-blue-500 text-white',
  'bg-green-500 text-white',
  'bg-purple-500 text-white',
  'bg-pink-500 text-white',
  'bg-indigo-500 text-white',
  'bg-yellow-500 text-yellow-900',
  'bg-red-500 text-white',
  'bg-teal-500 text-white',
  'bg-orange-500 text-white',
  'bg-cyan-500 text-white',
];

function getGravatarUrl(email: string, size: number = 80): string {
  const hash = email
    .toLowerCase()
    .trim()
    .split('')
    .reduce((acc, char) => {
      const code = char.charCodeAt(0);
      return ((acc << 5) - acc) + code;
    }, 0);

  return `https://www.gravatar.com/avatar/${Math.abs(hash)}?s=${size}&d=404&r=pg`;
}

export function UserAvatar({ name, email, imageUrl, size = 'md', className }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [gravatarError, setGravatarError] = useState(false);

  const displayName = name || email || 'U';
  const sizeValue = size === 'sm' ? 32 : size === 'md' ? 40 : 48;

  // Extract initials from name or email
  let initials = 'U';
  if (displayName && displayName !== 'U') {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1) {
      initials = parts[0].substring(0, 2).toUpperCase();
    } else if (email) {
      initials = email.substring(0, 2).toUpperCase();
    }
  }

  const colorIndex = (displayName.charCodeAt(0) || 0) % colors.length;
  const colorClass = colors[colorIndex];

  // Determine which image to show
  const showImage = imageUrl && !imageError;
  const showGravatar = !showImage && email && !gravatarError;
  const gravatarUrl = showGravatar ? getGravatarUrl(email, sizeValue * 2) : null;

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold flex-shrink-0 shadow-sm border-2 border-background overflow-hidden',
        sizeClasses[size],
        !showImage && !showGravatar && colorClass,
        className
      )}
      title={displayName}
    >
      {showImage ? (
        <Image
          src={imageUrl}
          alt={displayName}
          width={sizeValue}
          height={sizeValue}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          unoptimized
        />
      ) : showGravatar && gravatarUrl ? (
        <Image
          src={gravatarUrl}
          alt={displayName}
          width={sizeValue}
          height={sizeValue}
          className="w-full h-full object-cover"
          onError={() => setGravatarError(true)}
          unoptimized
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}








