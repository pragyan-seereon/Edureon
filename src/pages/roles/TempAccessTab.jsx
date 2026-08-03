import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, X } from "lucide-react";
import { useTempAccess, tempAccessApi, useAppUsers } from "@/lib/store";
import { MODULE_CATALOG, TempAccessWizard } from "@/components/temp-access-wizard";

// Exposed so a parent (e.g. a page-level "Temporary Access" quick-action button)
// can open the grant wizard without duplicating its own copy of it.
// Usage from a parent: <TempAccessTab openSignal={n} /> and bump `n` to force-open.
export function TempAccessTab({ openSignal }) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const grants = useTempAccess();
  const appUsers = useAppUsers();

  // Bump `openSignal` (e.g. a counter) from the parent to open the wizard externally.
  useEffect(() => {
    if (openSignal) setWizardOpen(true);
  }, [openSignal]);

  const handleRevoke = (id) => {
    tempAccessApi.remove(id);
    toast.success("Grant revoked");
  };

  return (
    <>
      <TempAccessWizard open={wizardOpen} onOpenChange={setWizardOpen} />

      <Card className="border-border/60">
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Temporary Access Grants</CardTitle>
            <CardDescription>
              Time-boxed, additive access. Existing roles remain unchanged; grants auto-expire.
            </CardDescription>
          </div>
          <Button
            size="sm"
            className="gradient-primary border-0 shrink-0"
            onClick={() => setWizardOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Grant Access
          </Button>
        </CardHeader>

        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Module · Sub-module</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Date range</TableHead>
                <TableHead>Daily window</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                    No temporary access granted yet. Click "Grant Access" to create one.
                  </TableCell>
                </TableRow>
              )}

              {grants.map((g) => {
                const u = appUsers.find((x) => x.id === g.userId);
                const mod = MODULE_CATALOG.find((m) => m.key === g.moduleKey);
                const tab = mod?.tabs.find((t) => t.key === g.tabKey);
                const expired = tempAccessApi.isExpired(g);

                return (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">
                      <div>{u?.name ?? g.userId}</div>
                      <div className="text-[11px] text-muted-foreground">{u?.email}</div>
                    </TableCell>

                    <TableCell className="text-sm">
                      {mod?.label ?? g.moduleKey}
                      <span className="text-muted-foreground"> · {tab?.label ?? g.tabKey ?? "All"}</span>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {g.actions.map((a) => (
                          <Badge key={a} variant="outline" className="text-[10px] capitalize">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {g.startsAt ?? "—"} → {g.expiresAt}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {g.startTime ?? "00:00"}–{g.endTime ?? "23:59"}
                    </TableCell>

                    <TableCell>
                      <Badge variant={expired ? "outline" : "default"}>
                        {expired ? "Expired" : "Active"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRevoke(g.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

export default TempAccessTab;