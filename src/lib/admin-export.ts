export type ExportFormat = "csv" | "excel" | "pdf";

type Cell = string | number | boolean | Date | null | undefined;

function text(value: Cell) {
  if (value instanceof Date) return value.toISOString();
  return value == null ? "" : String(value);
}

function xml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function minimalPdf(title: string, lines: string[]) {
  const safe = (value: string) =>
    value
      .normalize("NFKD")
      .replace(/[^\x20-\x7e]/g, "?")
      .replaceAll("\\", "\\\\")
      .replaceAll("(", "\\(")
      .replaceAll(")", "\\)");
  const wrapped = lines.flatMap((line) => {
    if (!line) return [""];
    const chunks: string[] = [];
    for (let index = 0; index < line.length; index += 108)
      chunks.push(line.slice(index, index + 108));
    return chunks;
  });
  const pages = Array.from(
    { length: Math.max(1, Math.ceil(wrapped.length / 45)) },
    (_, index) => wrapped.slice(index * 45, (index + 1) * 45),
  );
  const pageIds = pages.map((_, index) => 4 + index * 2);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  pages.forEach((page, index) => {
    const commands = [
      "BT",
      "/F1 14 Tf",
      "46 796 Td",
      `(${safe(title)} - page ${index + 1} of ${pages.length}) Tj`,
      "/F1 7 Tf",
      ...page.flatMap((line) => ["0 -16 Td", `(${safe(line)}) Tj`]),
      "ET",
    ].join("\n");
    const contentId = pageIds[index] + 1;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`,
      `<< /Length ${Buffer.byteLength(commands, "ascii")} >>\nstream\n${commands}\nendstream`,
    );
  });
  let output = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(output, "ascii"));
    output += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(output, "ascii");
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  output += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(output, "ascii");
}

export function createAdminExport(
  format: ExportFormat,
  title: string,
  columns: string[],
  rows: Cell[][],
) {
  const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (format === "csv") {
    const source = [columns, ...rows.map((row) => row.map(text))]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
    return {
      body: Buffer.from(`\uFEFF${source}`, "utf8"),
      contentType: "text/csv; charset=utf-8",
      filename: `${filename}.csv`,
    };
  }
  if (format === "excel") {
    const tableRows = [columns, ...rows.map((row) => row.map(text))]
      .map(
        (row) =>
          `<Row>${row.map((cell) => `<Cell><Data ss:Type="String">${xml(cell)}</Data></Cell>`).join("")}</Row>`,
      )
      .join("");
    const source = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Export"><Table>${tableRows}</Table></Worksheet></Workbook>`;
    return {
      body: Buffer.from(source, "utf8"),
      contentType: "application/vnd.ms-excel; charset=utf-8",
      filename: `${filename}.xls`,
    };
  }
  const lines = rows.map((row) => row.map((cell) => text(cell)).join("  |  "));
  return {
    body: minimalPdf(title, [columns.join("  |  "), "", ...lines]),
    contentType: "application/pdf",
    filename: `${filename}.pdf`,
  };
}
