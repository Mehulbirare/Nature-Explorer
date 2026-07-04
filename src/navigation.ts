/** Shared navigation param types. */
export type RootStackParamList = {
  Welcome: undefined;
  /** Activity picker — choose which hunt to play. */
  Pick: undefined;
  /** Trophy shelf — all earned/locked badges. */
  Trophies: undefined;
  /** Per-hunt daily journal: today's task + a list of past days. */
  Journal: {huntId: string};
  /** The photos captured for one hunt on one calendar day. */
  Day: {huntId: string; dateKey: string};
  /**
   * A running hunt, driven by the chosen activity id (see config/themes).
   * When retakePath/retakeDateKey are set, the screen runs in single-shot
   * "retake" mode: one capture replaces that photo and returns, instead of
   * running the daily 5-photo goal.
   */
  Hunt: {huntId: string; retakePath?: string; retakeDateKey?: string};
  /** Win screen carries the hunt id so it can link back to that hunt's journal. */
  Win: {huntId: string};
};
