export function isSafePublicUrl(value: string) {
  const url = value.trim();
  if (!url || /[\u0000-\u001f\u007f]/.test(url)) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  if (url.startsWith("#")) return true;
  if (/^(mailto:|tel:)/i.test(url)) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
