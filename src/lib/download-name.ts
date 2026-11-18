/**
 * The name a downloaded file is saved under.
 *
 * Uploads are stored under a random identifier, so the file on disk is called
 * `27cb629a-c512-4597-a6ca-85bed3a79519.pdf` and that is what the browser
 * offered a visitor. The stored name has to stay random -- two people
 * uploading `brochure.pdf` must not overwrite each other, and a name a
 * visitor chose must never decide a path on the server -- so the readable
 * name is supplied by the link instead, from the title already on the card.
 *
 * The browser only honours this for a file on the same origin, which uploads
 * and anything under /docs are. A link to someone else's site keeps their
 * name, as it must.
 */
export function downloadName(title: string, url: string): string {
  const extension = url
    .split(/[?#]/)[0]
    .match(/\.([a-z0-9]{1,8})$/i)?.[1]
    ?.toLowerCase();
  const base =
    title
      // Characters a file name cannot hold on Windows or macOS.
      .replace(/[\\/:*?"<>|]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120)
      .trim() || "download";
  return extension ? `${base}.${extension}` : base;
}
