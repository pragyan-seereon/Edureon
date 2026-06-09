import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";

/**
 * MultiSelect
 * Props:
 *   options   – string[] or { label, value }[]
 *   value     – Set<string>  (controlled)
 *   onChange  – (newSet: Set<string>) => void
 *   placeholder – string
 *   className – string
 */
export function MultiSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select…",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Normalise options to { label, value }
  const normalised = options.map((o) =>
    typeof o === "string" ? { label: o, value: o } : o
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (v) => {
    const next = new Set(value);
    if (next.has(v)) {
      if (next.size === 1) return; // keep at least one selected
      next.delete(v);
    } else {
      next.add(v);
    }
    onChange(next);
  };

  const removeChip = (e, v) => {
    e.stopPropagation();
    const next = new Set(value);
    if (next.size === 1) return;
    next.delete(v);
    onChange(next);
  };

  const selectedItems = normalised.filter((o) => value.has(o.value));
  const allSelected = selectedItems.length === normalised.length;

  const toggleAll = () => {
    if (allSelected) {
      // keep only first
      onChange(new Set([normalised[0].value]));
    } else {
      onChange(new Set(normalised.map((o) => o.value)));
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <div
        onClick={() => setOpen((v) => !v)}
        className="min-h-[32px] w-full flex items-center flex-wrap gap-1 px-2 py-1 rounded-md border border-input bg-background text-xs cursor-pointer hover:border-ring transition-colors focus-visible:ring-1 focus-visible:ring-ring"
      >
        {selectedItems.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : allSelected ? (
          <span className="text-muted-foreground italic">All selected</span>
        ) : (
          selectedItems.map((item) => (
            <span
              key={item.value}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
            >
              {item.label}
              <button
                onMouseDown={(e) => removeChip(e, item.value)}
                className="hover:text-destructive ml-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[160px] rounded-md border border-border bg-popover shadow-md">
          {/* Select all / clear */}
          <div
            onClick={toggleAll}
            className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted/50 cursor-pointer border-b border-border"
          >
            <div
              className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 ${
                allSelected
                  ? "bg-primary border-primary"
                  : "border-muted-foreground"
              }`}
            >
              {allSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
            </div>
            <span className="italic">{allSelected ? "Deselect all" : "Select all"}</span>
          </div>

          {/* Options */}
          <div className="max-h-56 overflow-y-auto">
            {normalised.map((opt) => {
              const checked = value.has(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50 cursor-pointer"
                >
                  <div
                    className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      checked
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {checked && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                  </div>
                  <span className={checked ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}