export function hasExpectedFileSignature(mimeType: string, source: Uint8Array) {
  if (mimeType === "application/pdf")
    return Buffer.from(source.subarray(0, 5)).toString("ascii") === "%PDF-";
  if (mimeType === "video/mp4")
    return (
      source.length >= 12 &&
      Buffer.from(source.subarray(4, 8)).toString("ascii") === "ftyp"
    );
  return true;
}
