/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatXP(xp: number): string {
  if (xp < 1000) return xp.toString();
  return (xp / 1000).toFixed(1) + 'k';
}

export function getHeartsRecoveryTime(lastPlayed: string | null): number {
  if (!lastPlayed) return 0;
  const last = new Date(lastPlayed).getTime();
  const now = new Date().getTime();
  const diffMinutes = Math.floor((now - last) / (1000 * 60));
  return Math.floor(diffMinutes / 15);
}
