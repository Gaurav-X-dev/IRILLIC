/**
 * How large each kind of upload may be.
 *
 * A photograph is re-encoded to WebP on the way in and lands far under its
 * limit, but a video is stored exactly as it arrives, so a usable clip needs
 * more room than a still does. The numbers live here rather than in the route
 * so the upload dialog can quote the same limit the server enforces.
 */

export const MAX_UPLOAD_MB: Record<string, number> = {
  "video/mp4": 20,
};

export const DEFAULT_MAX_UPLOAD_MB = 10;

export function uploadLimitMb(mimeType: string): number {
  return MAX_UPLOAD_MB[mimeType] ?? DEFAULT_MAX_UPLOAD_MB;
}
