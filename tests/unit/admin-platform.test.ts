import assert from "node:assert/strict";
import test from "node:test";
import { createAdminExport } from "../../src/lib/admin-export";
import { paginationFromUrl, paginationMeta } from "../../src/lib/pagination";

test("admin exports produce valid CSV, Excel and PDF downloads", () => {
  const rows = [
    ["Gaurav", "gaurav@example.com", new Date("2026-10-26T10:00:00Z")],
  ];
  const csv = createAdminExport(
    "csv",
    "Enquiries",
    ["Name", "Email", "Date"],
    rows,
  );
  assert.equal(csv.filename, "enquiries.csv");
  assert.match(csv.body.toString("utf8"), /gaurav@example\.com/);

  const excel = createAdminExport(
    "excel",
    "Enquiries",
    ["Name", "Email", "Date"],
    rows,
  );
  assert.equal(excel.filename, "enquiries.xls");
  assert.match(excel.body.toString("utf8"), /<Workbook/);

  const manyRows = Array.from({ length: 90 }, (_, index) => [
    `Record ${index}`,
    "Complete details",
  ]);
  const pdf = createAdminExport(
    "pdf",
    "Enquiries",
    ["Name", "Details"],
    manyRows,
  );
  assert.equal(pdf.filename, "enquiries.pdf");
  assert.ok(pdf.body.subarray(0, 8).toString("ascii").startsWith("%PDF-1.4"));
  assert.match(pdf.body.toString("ascii"), /\/Count 3/);
});

test("server pagination validates bounds and reports navigation", () => {
  const parsed = paginationFromUrl(
    new Request("https://example.test/api?page=3&limit=500"),
  );
  assert.deepEqual(
    { page: parsed.page, limit: parsed.limit, offset: parsed.offset },
    { page: 3, limit: 100, offset: 200 },
  );
  assert.deepEqual(paginationMeta(3, 100, 450), {
    page: 3,
    limit: 100,
    total: 450,
    pageCount: 5,
    hasPrevious: true,
    hasNext: true,
  });
});
