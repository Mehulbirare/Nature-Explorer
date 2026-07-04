/**
 * Badges / stickers. Every badge is DERIVED from the photos already on disk —
 * there's no separate saved state to keep in sync. We tally a few stats across
 * all hunts, then each badge definition decides whether it's earned.
 */
import {HUNTS} from '../config/themes';
import {currentStreak, journalDays} from './gallery';

export type Badge = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  earned: boolean;
};

/** Everything the badge rules need, gathered once from the saved photos. */
type Stats = {
  totalPhotos: number;
  huntsWithPhoto: Set<string>;
  /** Hunts whose daily goal was met on at least one day. */
  huntsCompleted: Set<string>;
  /** Best current streak across all hunts. */
  bestStreak: number;
};

async function gatherStats(): Promise<Stats> {
  let totalPhotos = 0;
  let bestStreak = 0;
  const huntsWithPhoto = new Set<string>();
  const huntsCompleted = new Set<string>();

  for (const hunt of HUNTS) {
    const days = await journalDays(hunt.id);
    if (days.length === 0) {
      continue;
    }
    const total = days.reduce((n, d) => n + d.shots.length, 0);
    totalPhotos += total;
    if (total > 0) {
      huntsWithPhoto.add(hunt.id);
    }
    if (days.some(d => d.shots.length >= hunt.goal)) {
      huntsCompleted.add(hunt.id);
    }
    bestStreak = Math.max(bestStreak, currentStreak(days, hunt.goal));
  }

  return {totalPhotos, huntsWithPhoto, huntsCompleted, bestStreak};
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Def = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  test: (s: Stats) => boolean;
};

/** The full catalog, in the order the shelf shows them. */
const DEFS: Def[] = [
  {
    id: 'first-photo',
    title: 'First Snap',
    emoji: '📸',
    description: 'Take your very first photo',
    test: s => s.totalPhotos >= 1,
  },
  // One "first find" sticker per hunt.
  ...HUNTS.map(h => ({
    id: `first-${h.id}`,
    title: `First ${cap(h.targetLabel)}`,
    emoji: h.emoji,
    description: `Find your first ${h.targetLabel}`,
    test: (s: Stats) => s.huntsWithPhoto.has(h.id),
  })),
  {
    id: 'daily-champ',
    title: 'Daily Champ',
    emoji: '⭐',
    description: "Finish a day's task",
    test: s => s.huntsCompleted.size >= 1,
  },
  {
    id: 'streak-3',
    title: 'On a Roll',
    emoji: '🔥',
    description: '3-day streak',
    test: s => s.bestStreak >= 3,
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    emoji: '🔥',
    description: '7-day streak',
    test: s => s.bestStreak >= 7,
  },
  {
    id: 'collector-25',
    title: 'Collector',
    emoji: '📚',
    description: 'Take 25 photos',
    test: s => s.totalPhotos >= 25,
  },
  {
    id: 'collector-100',
    title: 'Super Collector',
    emoji: '🌟',
    description: 'Take 100 photos',
    test: s => s.totalPhotos >= 100,
  },
  {
    id: 'all-hunts',
    title: 'Master Explorer',
    emoji: '🏆',
    description: 'Finish every hunt at least once',
    test: s => s.huntsCompleted.size === HUNTS.length,
  },
];

/** Compute every badge with its earned/locked state. */
export async function computeBadges(): Promise<Badge[]> {
  const stats = await gatherStats();
  return DEFS.map(d => ({
    id: d.id,
    title: d.title,
    emoji: d.emoji,
    description: d.description,
    earned: d.test(stats),
  }));
}
