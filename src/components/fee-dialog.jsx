


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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  collectOfflineFee,
  getMonthlyDue,
  createPaymentOrder,
  verifyPayment,
  updatePayment,
  getPayment
} from "../api/payment";

import { toast } from "sonner";

// --------------------------------------------------------
// Razorpay checkout script loader (loads once, cached)
// --------------------------------------------------------
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.getElementById("razorpay-sdk");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const emptyForm = {
  student_uuid: "",
  class_name: "",
  section: "",

  fee_structure_uuid: "",

  fee_month: "",

  monthly_fee: 0,

  late_fee: 0,

  total_amount: 0,

  payment_mode: "OFFLINE",

  due_uuids: [],

  transaction_no: "",

  payment_date: new Date().toISOString().split("T")[0],

  remarks: "",
};

export function FeeDialog({ open, onOpenChange, txn, students, structures }) {
  const [f, setF] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [payingOnline, setPayingOnline] = useState(false);

useEffect(() => {
  if (!open) return;

  const loadPayment = async () => {
    if (!txn) {
      setF(emptyForm);
      return;
    }

    try {
      const res = await getPayment(txn.transaction_uuid);
      const data = res.data;

      setF({
        student_uuid: data.student_uuid || "",
        class_name: data.class_name || "",
        section: data.section || "",
        fee_structure_uuid: data.fee_structure_uuid || "",
        fee_month: data.fee_month || "",
        monthly_fee: Number(data.monthly_fee || 0),
        late_fee: Number(data.late_fee || 0),
        total_amount: Number(data.total_amount || 0),
        payment_mode: data.payment_mode || "OFFLINE",
        due_uuids: data.due_uuids || [],
        transaction_no: data.transaction_no || "",
        payment_date: data.payment_date || "",
        remarks: data.remarks || "",
      });
    } catch (err) {
      toast.error("Unable to load payment details.");
    }
  };

  loadPayment();
  loadRazorpayScript();
}, [open, txn]);

  const loadMonthlyDue = async (student_uuid, fee_month) => {
    if (!student_uuid || !fee_month) return;

    try {
      const res = await getMonthlyDue(student_uuid, fee_month);

      const due = res.data;

      setF((prev) => ({
        ...prev,
        due_uuids: due.due_uuids || [],
        monthly_fee: Number(due.monthly_fee || 0),
        late_fee: Number(due.late_fee || 0),
        total_amount: Number(due.total_amount || 0),
      }));
    } catch (err) {
      console.log(err);
      toast.error("Unable to fetch monthly due");
    }
  };

  const validate = () => {
    if (!f.student_uuid) {
      toast.error("Student is required.");
      return false;
    }
    if (!f.fee_month) {
      toast.error("Fee month is required.");
      return false;
    }
    if (f.total_amount <= 0) {
      toast.error("Invalid amount.");
      return false;
    }
    if (!f.due_uuids?.length) {
      toast.error("No pending dues found for this student/month.");
      return false;
    }
    return true;
  };

  // ------------------------------------------------------
  // Offline collection — records the payment directly
  // ------------------------------------------------------
  const saveOffline = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      if (txn) {

          await updatePayment(
              txn.transaction_uuid,
              {
                  payment_mode: f.payment_mode,
                  transaction_no: f.transaction_no,
                  payment_date: f.payment_date,
                  amount_paid: Number(f.total_amount),
                  late_fee: Number(f.late_fee),
                  remarks: f.remarks,
              }
          );

          toast.success("Payment updated successfully.");

      } else {

          await collectOfflineFee({
              student_uuid: f.student_uuid,
              class_name: f.class_name,
              section: f.section,
              fee_structure_uuid: f.fee_structure_uuid,
              fee_month: f.fee_month,
              monthly_fee: Number(f.monthly_fee),
              late_fee: Number(f.late_fee),
              total_amount: Number(f.total_amount),
              payment_mode: f.payment_mode,
              due_uuids: f.due_uuids,
              transaction_no: f.transaction_no,
              payment_date: f.payment_date,
              remarks: f.remarks,
          });

          toast.success("Fee collected successfully.");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to collect fee.");
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------
  // Online collection — Razorpay order -> checkout -> verify
  // ------------------------------------------------------
  const payOnline = async () => {
    if (!validate()) return;

    try {
      setPayingOnline(true);

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) {
        toast.error("Could not load payment gateway. Check your connection.");
        setPayingOnline(false);
        return;
      }

      const student = students.find((s) => s.student_uuid === f.student_uuid);

      const orderRes = await createPaymentOrder({
        institute_uuid: "fbad5628-a9c4-4377-8c2a-cf84eeb4f024",
        student_uuid: f.student_uuid,
        due_uuid: f.due_uuids[0],
        amount: f.total_amount,
      });

      const { order_id, amount, currency, key } = orderRes.data;

      const monthLabel = new Date(f.fee_month).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });

      const rzp = new window.Razorpay({
        key,
        amount,
        currency,
        name: "Fee Payment",
        description: `${student?.full_name || "Student"} — ${monthLabel}`,
        order_id,
        handler: async (response) => {
          try {
            await verifyPayment({
              institute_uuid: "fbad5628-a9c4-4377-8c2a-cf84eeb4f024",
              student_uuid: f.student_uuid,
              due_uuids: f.due_uuids,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment successful");
            window.location.reload();
          } catch (err) {
            const detail = err?.response?.data?.detail;
            toast.error(
              typeof detail === "string"
                ? detail
                : detail?.[0]?.msg || "Payment verification failed"
            );
          } finally {
            setPayingOnline(false);
          }
        },
        modal: {
          ondismiss: () => setPayingOnline(false),
        },
        prefill: {
          name: student?.full_name || "",
        },
        theme: { color: "#6366f1" },
      });

      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setPayingOnline(false);
      });

      rzp.open();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(
        typeof detail === "string"
          ? detail
          : detail?.[0]?.msg || "Could not start payment"
      );
      setPayingOnline(false);
    }
  };

  const handlePrimaryAction = () => {
    if (f.payment_mode === "ONLINE") {
      payOnline();
    } else {
      saveOffline();
    }
  };

  const isOnline = f.payment_mode === "ONLINE";
  const busy = saving || payingOnline;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {txn ? "Edit Transaction" : "Collect Fee"}
          </DialogTitle>
          <DialogDescription>
            {txn
              ? "Update or refund this payment record."
              : "Record a new fee payment and generate receipt."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <Field label="Student">
            <Select
              value={f.student_uuid}
              onValueChange={(value) => {
                const student = students.find(
                  (s) => s.student_uuid === value
                );

                const updated = {
                  ...f,
                  student_uuid: student.student_uuid,
                  class_name: student.class_name,
                  section: student.section,
                };

                setF(updated);

                if (updated.fee_month) {
                  loadMonthlyDue(updated.student_uuid, updated.fee_month);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Student" />
              </SelectTrigger>

              <SelectContent>
                {students.map((student) => (
                  <SelectItem
                    key={student.student_uuid}
                    value={student.student_uuid}
                  >
                    {student.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Class">
            <Input
              value={f.class_name}
              onChange={(e) => setF({ ...f, class_name: e.target.value })}
            />
          </Field>

          <Field label="Section">
            <Input
              value={f.section}
              onChange={(e) => setF({ ...f, section: e.target.value })}
            />
          </Field>

          <Field label="Fee Structure">
            <Select
              value={f.fee_structure_uuid}
              onValueChange={(value) => {
                const structure = structures.find(
                  (s) => s.fee_structure_uuid === value
                );

                setF({
                  ...f,
                  fee_structure_uuid: structure.fee_structure_uuid,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Fee Structure" />
              </SelectTrigger>

              <SelectContent>
                {structures.map((structure) => (
                  <SelectItem
                    key={structure.fee_structure_uuid}
                    value={structure.fee_structure_uuid}
                  >
                    {structure.structure_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Fee Month">
            <Input
              type="date"
              value={f.fee_month}
              onChange={(e) => {
                const month = e.target.value;

                const updated = {
                  ...f,
                  fee_month: month,
                };

                setF(updated);

                if (updated.student_uuid) {
                  loadMonthlyDue(updated.student_uuid, updated.fee_month);
                }
              }}
            />
          </Field>

          <Field label="Monthly Fee">
            <Input
              type="number"
              value={f.monthly_fee}
              onChange={(e) =>
                setF({ ...f, monthly_fee: Number(e.target.value) })
              }
            />
          </Field>

          <Field label="Late Fee">
            <Input
              type="number"
              value={f.late_fee}
              onChange={(e) =>
                setF({ ...f, late_fee: Number(e.target.value) })
              }
            />
          </Field>

          <Field label="Total Amount">
            <Input
              type="number"
              value={f.total_amount}
              onChange={(e) =>
                setF({ ...f, total_amount: Number(e.target.value) })
              }
            />
          </Field>

          <Field label="Payment Mode">
            <Select
              value={f.payment_mode}
              onValueChange={(v) => setF({ ...f, payment_mode: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="OFFLINE">OFFLINE</SelectItem>
                <SelectItem value="ONLINE">ONLINE</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Offline-only fields */}
          {!isOnline && (
            <>
              <Field label="Transaction No">
                <Input
                  value={f.transaction_no}
                  onChange={(e) =>
                    setF({ ...f, transaction_no: e.target.value })
                  }
                />
              </Field>

              <Field label="Payment Date">
                <Input
                  type="date"
                  value={f.payment_date}
                  onChange={(e) =>
                    setF({ ...f, payment_date: e.target.value })
                  }
                />
              </Field>

              <Field label="Remarks">
                <Input
                  value={f.remarks}
                  onChange={(e) => setF({ ...f, remarks: e.target.value })}
                />
              </Field>
            </>
          )}

          {/* Online-only hint */}
          {isOnline && (
            <div className="sm:col-span-2 text-xs text-muted-foreground rounded-md border border-dashed border-border p-3">
              This will open the Razorpay checkout for{" "}
              <span className="font-semibold">₹{f.total_amount}</span>.
              Transaction details are captured automatically once payment is
              verified.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePrimaryAction}
            disabled={busy}
            className="gradient-primary border-0"
          >
            {isOnline
              ? payingOnline
                ? "Processing..."
                : "Pay Online"
              : saving
              ? "Saving..."
              : txn
              ? "Save"
              : "Issue receipt"}
          </Button>
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
