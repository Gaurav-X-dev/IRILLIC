/** PubMed search link for a publication title stored in the CMS. */
export function pubmedUrl(title: string): string {
  return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(title).replace(/%20/g, "+")}`;
}
