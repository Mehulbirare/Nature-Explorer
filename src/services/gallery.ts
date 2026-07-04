/**
 * Local photo album. Every photo the child captures is copied out of the camera's
 * temporary cache into a permanent "NatureExplorer" folder that lives INSIDE the
 * app's own private storage, so the pictures survive after the app closes and can
 * be browsed in-app.
 *
 * Storage is app-private (the app's documents dir), so it needs NO runtime
 * permission on any Android version and the photos are not exposed to the phone's
 * shared Gallery. Never throws — a failed save must never break the reward loop.
 */

export type SavedPhoto = {path: string; huntId: string; at: number};

/** Resolve react-native-fs once, tolerating its absence (e.g. on some emulators). */
function fs(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-fs');
  } catch {
    return null;
  }
}

/**
 * Album folders to use, all app-private. The documents dir is the app's internal
 * storage — always writable, no permission, and cleared only when the app is
 * uninstalled. App-specific external storage is a secondary fallback. We write to
 * the first that succeeds, so a photo is ALWAYS stored inside the app.
 */
function albumCandidates(RNFS: any): string[] {
  return [
    RNFS.DocumentDirectoryPath,
    RNFS.ExternalDirectoryPath,
  ]
    .filter(Boolean)
    .map(base => `${base}/NatureExplorer`);
}

function stripScheme(path: string): string {
  return path.startsWith('file://') ? path.replace('file://', '') : path;
}

/**
 * Copy a freshly captured photo into the permanent album.
 * @param tempPath  vision-camera's takePhoto() path (may be file://-prefixed).
 * @param huntId    which activity it was taken for (used in the filename).
 * @returns the saved file path, or null if saving was not possible.
 */
export async function savePhoto(
  tempPath: string,
  huntId: string,
  at: number = Date.now(),
): Promise<string | null> {
  const RNFS = fs();
  if (!RNFS) {
    return null;
  }

  const src = stripScheme(tempPath);
  const name = `ne_${huntId}_${at}.jpg`;

  for (const dir of albumCandidates(RNFS)) {
    try {
      if (!(await RNFS.exists(dir))) {
        await RNFS.mkdir(dir);
      }
      const dest = `${dir}/${name}`;
      await RNFS.copyFile(src, dest);
      return dest;
    } catch {
      // This location was not writable (e.g. scoped storage) — try the next one.
    }
  }

  return null;
}

// ----------------------------------------------------------------------------
// Daily journal helpers
//
// Each saved file is named `ne_<huntId>_<timestamp>.jpg`, so the hunt and the
// exact date are recoverable straight from the filename — no database needed.
// A "day" is the child's local calendar day; the per-hunt task refreshes at
// midnight simply because a new capture lands under a new date key.
// ----------------------------------------------------------------------------

/** One captured picture, enriched with its hunt, moment, and calendar day. */
export type Shot = {
  /** Absolute file path on disk. */
  path: string;
  /** file:// URI ready for <Image source={{uri}}>. */
  uri: string;
  huntId: string;
  /** Capture time (ms epoch). */
  at: number;
  /** Local calendar day, "YYYY-MM-DD". */
  dateKey: string;
};

/** All the shots taken on one calendar day, for one hunt. */
export type DayGroup = {dateKey: string; label: string; shots: Shot[]};

/** Local "YYYY-MM-DD" for a timestamp (child's own timezone). */
export function dateKeyOf(ts: number): string {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Today's date key. */
export function todayKey(): string {
  return dateKeyOf(Date.now());
}

/** Friendly label for a date key: "Today", "Yesterday", or e.g. "Mon, Jul 3". */
export function dateLabel(dateKey: string): string {
  if (dateKey === todayKey()) {
    return 'Today';
  }
  if (dateKey === dateKeyOf(Date.now() - 86400000)) {
    return 'Yesterday';
  }
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Parse a saved filename back into a Shot, or null if it isn't ours. */
function parseShot(path: string): Shot | null {
  const name = path.split('/').pop() || '';
  const m = name.match(/^ne_(.+)_(\d+)\.jpg$/i);
  if (!m) {
    return null;
  }
  const at = parseInt(m[2], 10);
  if (!Number.isFinite(at)) {
    return null;
  }
  const clean = path.startsWith('file://') ? path : `file://${path}`;
  return {path, uri: clean, huntId: m[1], at, dateKey: dateKeyOf(at)};
}

/** Every shot (optionally for one hunt), newest first. */
export async function listShots(huntId?: string): Promise<Shot[]> {
  const paths = await listSavedPhotos();
  const shots = paths
    .map(parseShot)
    .filter((s): s is Shot => s !== null)
    .filter(s => !huntId || s.huntId === huntId);
  return shots.sort((a, b) => b.at - a.at);
}

/** How many photos exist for a hunt on a given day (defaults to today). */
export async function countPhotos(
  huntId: string,
  dateKey: string = todayKey(),
): Promise<number> {
  const shots = await listShots(huntId);
  return shots.filter(s => s.dateKey === dateKey).length;
}

/** A hunt's day-by-day history, newest day first. */
export async function journalDays(huntId: string): Promise<DayGroup[]> {
  const shots = await listShots(huntId);
  const order: string[] = [];
  const byDay: Record<string, Shot[]> = {};
  for (const s of shots) {
    if (!byDay[s.dateKey]) {
      byDay[s.dateKey] = [];
      order.push(s.dateKey);
    }
    byDay[s.dateKey].push(s);
  }
  return order
    .map(dateKey => ({dateKey, label: dateLabel(dateKey), shots: byDay[dateKey]}))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

/** The photos for one hunt on one specific day. */
export async function shotsForDay(
  huntId: string,
  dateKey: string,
): Promise<Shot[]> {
  const shots = await listShots(huntId);
  return shots.filter(s => s.dateKey === dateKey);
}

/**
 * Current streak: how many days in a row the daily goal was met, counting back
 * from today. If today isn't finished yet the streak still counts through
 * yesterday (so it only breaks after a full missed day), matching how habit
 * trackers behave. Pure/derived from the already-loaded day groups.
 */
export function currentStreak(days: DayGroup[], goal: number): number {
  const complete = new Set(
    days.filter(d => d.shots.length >= goal).map(d => d.dateKey),
  );
  if (complete.size === 0) {
    return 0;
  }

  const DAY_MS = 86400000;
  let cursor = Date.now();
  // Today unfinished? A streak running through yesterday is still alive.
  if (!complete.has(dateKeyOf(cursor))) {
    cursor -= DAY_MS;
    if (!complete.has(dateKeyOf(cursor))) {
      return 0;
    }
  }

  let streak = 0;
  while (complete.has(dateKeyOf(cursor))) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

/** Delete one saved photo. Safe/no-op if it's already gone. */
export async function deletePhoto(path: string): Promise<boolean> {
  const RNFS = fs();
  if (!RNFS) {
    return false;
  }
  try {
    const clean = stripScheme(path);
    if (await RNFS.exists(clean)) {
      await RNFS.unlink(clean);
    }
    return true;
  } catch {
    return false;
  }
}

/** A timestamp that always lands inside the given day (keeps a retake on its date). */
function dayAnchorTimestamp(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  const midnight = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
  // 0..<24h keeps the same calendar day while staying unique per retake.
  return midnight + (Date.now() % 86400000);
}

/**
 * Replace an existing photo: save the new capture under the SAME day (so the
 * daily count is unchanged), then remove the old file. Returns the new path.
 */
export async function retakePhoto(
  oldPath: string,
  huntId: string,
  dateKey: string,
  tempPath: string,
): Promise<string | null> {
  const saved = await savePhoto(tempPath, huntId, dayAnchorTimestamp(dateKey));
  if (saved) {
    await deletePhoto(oldPath);
  }
  return saved;
}

/** List every saved photo, newest first. Empty on any error. */
export async function listSavedPhotos(): Promise<string[]> {
  const RNFS = fs();
  if (!RNFS) {
    return [];
  }
  const out: Array<{name: string; path: string}> = [];
  for (const dir of albumCandidates(RNFS)) {
    try {
      if (!(await RNFS.exists(dir))) {
        continue;
      }
      const items: Array<{name: string; path: string}> = await RNFS.readDir(dir);
      for (const i of items) {
        if (i.name.toLowerCase().endsWith('.jpg')) {
          out.push({name: i.name, path: i.path});
        }
      }
    } catch {
      // Skip an unreadable location.
    }
  }
  // Newest first — filenames end in a timestamp, so a name sort is chronological.
  return out.sort((a, b) => b.name.localeCompare(a.name)).map(i => i.path);
}
