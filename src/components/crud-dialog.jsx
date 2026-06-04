import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
export function CrudDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initial,
  onSubmit,
  submitLabel = "Save",
}) {
  const blank = Object.fromEntries(
    fields.map((f) => [
      f.name,
      f.type === "number" ? 0 : f.type === "select" ? f.options[0] : "",
    ]),
  );
  const [data, setData] = useState(initial ?? blank);
  useEffect(() => {
    if (open) setData(initial ?? blank); /* eslint-disable-next-line */
  }, [open]);
  const submit = () => {
    onSubmit?.(data);
    toast.success(submitLabel + " — saved");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          {fields.map((f) => (
            <div
              key={f.name}
              className={`space-y-1.5 ${f.type === "textarea" ? "sm:col-span-2" : ""}`}
            >
              <Label className="text-xs text-muted-foreground">{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea
                  rows={3}
                  value={String(data[f.name] ?? "")}
                  onChange={(e) =>
                    setData({ ...data, [f.name]: e.target.value })
                  }
                />
              ) : f.type === "select" ? (
                <Select
                  value={String(data[f.name] ?? "")}
                  onValueChange={(v) => setData({ ...data, [f.name]: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={f.type ?? "text"}
                  value={String(data[f.name] ?? "")}
                  onChange={(e) =>
                    setData({
                      ...data,
                      [f.name]:
                        f.type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    })
                  }
                />
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} className="gradient-primary border-0">
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
