

import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import { Button } from "./ui/button";

/**
 * ExcelExport
 * Renders a button that exports `rows` to an .xlsx file.
 *
 * Props:
 * - rows: array of source objects (e.g. admissions records)
 * - fileName: string, e.g. "admissions.xlsx"
 * - columns: [{ header: "Name", accessor: (row) => row.full_name }, ...]
 * - label: optional button label (default "Export")
 *
 * Requires the `xlsx` package:  npm install xlsx
 */
export function ExcelExport({ rows = [], fileName = "export.xlsx", columns = [], label = "Export" }) {
  const handleExport = () => {
    const data = rows.map((row) => {
      const record = {};
      columns.forEach((col) => {
        record[col.header] = col.accessor(row);
      });
      return record;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Button size="sm" variant="outline" onClick={handleExport} disabled={rows.length === 0}>
      <Download className="h-4 w-4" />
      {label}
    </Button>
  );
}