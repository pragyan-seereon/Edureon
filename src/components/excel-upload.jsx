import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "./ui/button";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ExcelUpload({
  label = "Import Excel",
  onRows,
  variant = "outline",
  size = "sm",
  templateHeaders,
  templateName = "template.xlsx",
}) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const handle = async (file) => {
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, {
        raw: false,
        defval: "",
      });
      onRows(rows);
      toast.success(`Imported ${rows.length} rows from ${file.name}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not read the Excel file");
    } finally {
      setBusy(false);
    }
  };

  const downloadTemplate = () => {
    if (!templateHeaders) return;
    const ws = XLSX.utils.aoa_to_sheet([templateHeaders]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, templateName);
  };

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept=".xlsx,.xls,.csv"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
          e.target.value = "";
        }}
      />
      <div className="inline-flex gap-2">
        <Button
          type="button"
          variant={variant}
          size={size}
          disabled={busy}
          onClick={() => ref.current?.click()}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
          {label}
        </Button>
        {templateHeaders && (
          <Button type="button" variant="ghost" size={size} onClick={downloadTemplate}>
            Template
          </Button>
        )}
      </div>
    </>
  );
}