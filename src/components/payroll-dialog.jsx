import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { payrollApi, useEmployees } from "../lib/store";
import { toast } from "sonner";
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export function PayrollDialog({ open, onOpenChange }) {
  const employees = useEmployees();
  const now = new Date();
  const [step, setStep] = useState("setup");
  const [f, setF] = useState({
    month: months[now.getMonth()],
    year: now.getFullYear(),
    avgSalary: 19000,
    pfPct: 5,
    tdsPct: 6,
    status: "Draft",
  });
  const [adj, setAdj] = useState({});
  const setAdjField = (id, k, v) => {
    setAdj((m) => {
      const prev = m[id] ?? { bonus: 0, deduction: 0, loan: 0, note: "" };
      return {
        ...m,
        [id]: { ...prev, [k]: k === "note" ? v : parseInt(v) || 0 },
      };
    });
  };
  const computed = useMemo(() => {
    let gross = 0,
      totalTds = 0,
      totalPf = 0,
      totalAdj = 0,
      totalBonus = 0;
    const rows = employees.map((e) => {
      const base = e.salary || f.avgSalary;
      const a = adj[e.id] ?? { bonus: 0, deduction: 0, loan: 0, note: "" };
      const empGross = base + a.bonus;
      const tds = Math.round(empGross * (f.tdsPct / 100));
      const pf = Math.round(empGross * (f.pfPct / 100));
      const net = empGross - tds - pf - a.deduction - a.loan;
      gross += empGross;
      totalTds += tds;
      totalPf += pf;
      totalAdj += a.deduction + a.loan;
      totalBonus += a.bonus;
      return { e, base, a, empGross, tds, pf, net };
    });
    const net = rows.reduce((s, r) => s + r.net, 0);
    return {
      rows,
      gross,
      tds: totalTds,
      pf: totalPf,
      totalAdj,
      totalBonus,
      net,
    };
  }, [employees, f, adj]);
  const reset = () => {
    setStep("setup");
    setAdj({});
  };
  const run = () => {
    payrollApi.add({
      month: `${f.month} ${f.year}`,
      employeeCount: employees.length,
      gross: computed.gross,
      net: computed.net,
      tds: computed.tds,
      status: f.status,
    });
    toast.success(`Payroll for ${f.month} ${f.year} processed`);
    onOpenChange(false);
    reset();
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display">Process Payroll</DialogTitle>
          <DialogDescription>
            Manual control — set statutory rates, apply per-employee bonuses &
            deductions, review before publishing.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={step}
          onValueChange={(v) => setStep(v)}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList>
            <TabsTrigger value="setup">1. Setup</TabsTrigger>
            <TabsTrigger value="deductions">2. Manual Adjustments</TabsTrigger>
            <TabsTrigger value="review">3. Review & Run</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="mt-4 overflow-auto">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Pay Month">
                <Select
                  value={f.month}
                  onValueChange={(v) => setF({ ...f, month: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Year">
                <Input
                  type="number"
                  value={f.year}
                  onChange={(e) =>
                    setF({ ...f, year: parseInt(e.target.value) || f.year })
                  }
                />
              </Field>
              <Field label="Default gross (if not set on employee)">
                <Input
                  type="number"
                  value={f.avgSalary}
                  onChange={(e) =>
                    setF({ ...f, avgSalary: parseInt(e.target.value) || 0 })
                  }
                />
              </Field>
              <Field label="TDS %">
                <Input
                  type="number"
                  value={f.tdsPct}
                  onChange={(e) =>
                    setF({ ...f, tdsPct: parseInt(e.target.value) || 0 })
                  }
                />
              </Field>
              <Field label="PF %">
                <Input
                  type="number"
                  value={f.pfPct}
                  onChange={(e) =>
                    setF({ ...f, pfPct: parseInt(e.target.value) || 0 })
                  }
                />
              </Field>
              <Field label="Status">
                <Select
                  value={f.status}
                  onValueChange={(v) => setF({ ...f, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Draft", "Approved", "Paid"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="rounded-lg bg-muted/40 p-4 mt-4 text-sm">
              <div className="font-medium mb-1">
                {employees.length} active employees will be included.
              </div>
              <p className="text-muted-foreground text-xs">
                Next step lets you manually add bonuses, ad-hoc deductions, or
                loan recoveries per employee.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="deductions" className="mt-4 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Base ₹</TableHead>
                  <TableHead className="text-right">Bonus ₹</TableHead>
                  <TableHead className="text-right">Deduction ₹</TableHead>
                  <TableHead className="text-right">Loan ₹</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {computed.rows.map((r) => (
                  <TableRow key={r.e.id}>
                    <TableCell>
                      <div className="text-sm font-medium">{r.e.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {r.e.id} · {r.e.role}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs">
                      {r.base.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-7 w-20 text-xs ml-auto"
                        defaultValue={r.a.bonus}
                        onChange={(e) =>
                          setAdjField(r.e.id, "bonus", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-7 w-20 text-xs ml-auto"
                        defaultValue={r.a.deduction}
                        onChange={(e) =>
                          setAdjField(r.e.id, "deduction", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-7 w-20 text-xs ml-auto"
                        defaultValue={r.a.loan}
                        onChange={(e) =>
                          setAdjField(r.e.id, "loan", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-7 text-xs"
                        placeholder="e.g. Diwali bonus"
                        defaultValue={r.a.note}
                        onChange={(e) =>
                          setAdjField(r.e.id, "note", e.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="review" className="mt-4 overflow-auto">
            <div className="rounded-lg bg-muted/40 p-4 space-y-1.5 text-sm">
              <Row k="Employees" v={employees.length.toString()} />
              <Row
                k="Gross + Bonuses"
                v={`₹${computed.gross.toLocaleString("en-IN")}`}
              />
              <Row
                k={`TDS (${f.tdsPct}%)`}
                v={`− ₹${computed.tds.toLocaleString("en-IN")}`}
                muted
              />
              <Row
                k={`PF (${f.pfPct}%)`}
                v={`− ₹${computed.pf.toLocaleString("en-IN")}`}
                muted
              />
              <Row
                k="Manual deductions + loans"
                v={`− ₹${computed.totalAdj.toLocaleString("en-IN")}`}
                muted
              />
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Net disbursement</span>
                <span>₹{computed.net.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Status will be set to <strong>{f.status}</strong>. You can advance
              further from the runs table.
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {step !== "setup" && (
            <Button
              variant="ghost"
              onClick={() =>
                setStep(step === "review" ? "deductions" : "setup")
              }
            >
              Back
            </Button>
          )}
          {step !== "review" ? (
            <Button
              onClick={() =>
                setStep(step === "setup" ? "deductions" : "review")
              }
              className="gradient-primary border-0"
            >
              Continue
            </Button>
          ) : (
            <Button onClick={run} className="gradient-primary border-0">
              Process Payroll
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
function Row({ k, v, muted }) {
  return (
    <div
      className={`flex justify-between ${muted ? "text-muted-foreground" : ""}`}
    >
      <span>{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}
