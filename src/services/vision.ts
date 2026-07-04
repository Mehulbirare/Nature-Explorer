/**
 * Google Cloud Vision — LABEL_DETECTION.
 *
 * Capture a photo, pass the base64 (no data: prefix) here, and get back the
 * list of detected label descriptions. Matching is done by the caller against
 * the active hunt theme (see config/themes.ts -> labelsMatch).
 *
 * SETUP:
 *   1. Enable the "Cloud Vision API" in a Google Cloud project.
 *   2. Create an API key and paste it below (or inject via env at build time).
 *   3. Free tier covers 1,000 label-detection units / month — plenty for a demo.
 */

// 🔑 Paste your key here. Never commit a real key to a public repo.
export const VISION_API_KEY = 'VISION_API_KEY';

const ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate';

/**
 * Read a captured photo file as base64. vision-camera's takePhoto returns a
 * file path; Vision needs raw base64. Uses react-native-fs, and never throws.
 */
export async function readPhotoBase64(path: string): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RNFS = require('react-native-fs');
    const clean = path.startsWith('file://') ? path.replace('file://', '') : path;
    return await RNFS.readFile(clean, 'base64');
  } catch {
    return null;
  }
}

export type VisionResult = {
  ok: boolean;
  labels: string[];
  error?: string;
};

/**
 * Send a base64 JPEG to Vision and return detected labels (highest score first).
 * Never throws — returns { ok: false } so the UI can fall back gracefully to the
 * manual "I found it!" button instead of freezing.
 */
export async function detectLabels(base64Jpeg: string): Promise<VisionResult> {
  if (!VISION_API_KEY || VISION_API_KEY === 'VISION_API_KEY') {
    return {
      ok: false,
      labels: [],
      error: 'Vision API key not set — using manual fallback.',
    };
  }

  try {
    const body = {
      requests: [
        {
          image: {content: base64Jpeg},
          features: [{type: 'LABEL_DETECTION', maxResults: 15}],
        },
      ],
    };

    const res = await fetch(`${ENDPOINT}?key=${VISION_API_KEY}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return {ok: false, labels: [], error: `HTTP ${res.status}`};
    }

    const json = await res.json();
    const annotations = json?.responses?.[0]?.labelAnnotations ?? [];
    const labels: string[] = annotations
      .map((a: {description?: string}) => a.description)
      .filter(Boolean);

    return {ok: true, labels};
  } catch (e) {
    return {
      ok: false,
      labels: [],
      error: e instanceof Error ? e.message : 'network error',
    };
  }
}
