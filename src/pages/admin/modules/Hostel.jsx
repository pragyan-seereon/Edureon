import { PageContainer, PageHeader } from "../../../components/page-shell";
import { KpiCard } from "../../../components/kpi-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Building2,
  Plus,
  Users,
  UserCheck,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { CrudDialog } from "../../../components/crud-dialog";
import { useStudents } from "../../../lib/store";
const SEED = [
  {
    name: "Aravalli Block",
    gender: "Boys",
    warden: "Mr. Rao",
    rooms: [
      {
        no: "A-101",
        type: "Twin Sharing",
        capacity: 2,
        allocations: [
          {
            studentId: "STU1003",
            studentName: "Aarav Sharma",
            bed: "A",
            checkin: "2025-06-01",
            guardian: "+91 9000000001",
          },
        ],
      },
      { no: "A-102", type: "Twin Sharing", capacity: 2, allocations: [] },
      { no: "A-103", type: "Single", capacity: 1, allocations: [] },
    ],
  },
  {
    name: "Vindhya Block",
    gender: "Girls",
    warden: "Mrs. Iyer",
    rooms: [
      {
        no: "V-201",
        type: "Triple Sharing",
        capacity: 3,
        allocations: [
          {
            studentId: "STU1007",
            studentName: "Diya Verma",
            bed: "A",
            checkin: "2025-06-01",
            guardian: "+91 9000000002",
          },
        ],
      },
      { no: "V-202", type: "Twin Sharing", capacity: 2, allocations: [] },
    ],
  },
];
export default function Hostel() {
  const students = useStudents();
  const [blocks, setBlocks] = useState(SEED);
  const [addBlock, setAddBlock] = useState(false);
  const [addRoomFor, setAddRoomFor] = useState(null);
  const [allocFor, setAllocFor] = useState(null);
  const allRooms = blocks.flatMap((b) =>
    b.rooms.map((r) => ({ ...r, block: b.name, gender: b.gender })),
  );
  const allAllocs = allRooms.flatMap((r) =>
    r.allocations.map((a) => ({ ...a, room: r.no, block: r.block })),
  );
  const totalCapacity = allRooms.reduce((s, r) => s + r.capacity, 0);
  const occupied = allAllocs.length;
  const allocatedStudentIds = new Set(allAllocs.map((a) => a.studentId));
  const availableStudents = students.filter(
    (s) => !allocatedStudentIds.has(s.id),
  );
  const removeAlloc = (room, studentId) => {
    setBlocks((p) =>
      p.map((b) => ({
        ...b,
        rooms: b.rooms.map((r) =>
          r.no !== room
            ? r
            : {
                ...r,
                allocations: r.allocations.filter(
                  (a) => a.studentId !== studentId,
                ),
              },
        ),
      })),
    );
    toast.success("Allocation removed");
  };
  const deleteRoom = (block, no) => {
    setBlocks((p) =>
      p.map((b) =>
        b.name !== block
          ? b
          : { ...b, rooms: b.rooms.filter((r) => r.no !== no) },
      ),
    );
    toast.success("Room removed");
  };
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operations"
        title="Hostel Management"
        description="Blocks, rooms, beds, and student allocations — fully integrated with the student registry."
        actions={
          <Button
            size="sm"
            className="gradient-primary border-0"
            onClick={() => setAddBlock(true)}
          >
            <Plus className="h-4 w-4" />
            Add Block
          </Button>
        }
      />

      <CrudDialog
        open={addBlock}
        onOpenChange={setAddBlock}
        title="Add Hostel Block"
        fields={[
          { name: "name", label: "Block Name" },
          {
            name: "gender",
            label: "Gender",
            type: "select",
            options: ["Boys", "Girls", "Co-ed"],
          },
          { name: "warden", label: "Warden Name" },
        ]}
        submitLabel="Add Block"
        onSubmit={(d) =>
          setBlocks((p) => [
            ...p,
            {
              name: String(d.name),
              gender: String(d.gender),
              warden: String(d.warden),
              rooms: [],
            },
          ])
        }
      />

      {addRoomFor && (
        <CrudDialog
          open
          onOpenChange={(v) => !v && setAddRoomFor(null)}
          title={`Add Room — ${addRoomFor}`}
          fields={[
            { name: "no", label: "Room No." },
            {
              name: "type",
              label: "Type",
              type: "select",
              options: [
                "Single",
                "Twin Sharing",
                "Triple Sharing",
                "Quad Sharing",
                "Dormitory",
              ],
            },
            { name: "capacity", label: "Capacity (beds)", type: "number" },
          ]}
          submitLabel="Add Room"
          onSubmit={(d) => {
            const ref = addRoomFor;
            setBlocks((p) =>
              p.map((b) =>
                b.name !== ref
                  ? b
                  : {
                      ...b,
                      rooms: [
                        ...b.rooms,
                        {
                          no: String(d.no),
                          type: String(d.type),
                          capacity: Number(d.capacity) || 2,
                          allocations: [],
                        },
                      ],
                    },
              ),
            );
            setAddRoomFor(null);
          }}
        />
      )}

      {allocFor && (
        <AllocateDialog
          block={allocFor.block}
          room={allocFor.room}
          students={availableStudents}
          onClose={() => setAllocFor(null)}
          onAssign={(alloc) => {
            const ref = allocFor;
            setBlocks((p) =>
              p.map((b) =>
                b.name !== ref.block
                  ? b
                  : {
                      ...b,
                      rooms: b.rooms.map((r) =>
                        r.no !== ref.room.no
                          ? r
                          : { ...r, allocations: [...r.allocations, alloc] },
                      ),
                    },
              ),
            );
            toast.success(`${alloc.studentName} allocated to ${ref.room.no}`);
            setAllocFor(null);
          }}
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Blocks"
          value={blocks.length}
          icon={<Building2 className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Rooms"
          value={allRooms.length}
          icon={<Building2 className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Bed Occupancy"
          value={`${Math.round((occupied / Math.max(1, totalCapacity)) * 100)}%`}
          icon={<Users className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Vacant Beds"
          value={totalCapacity - occupied}
          icon={<UserCheck className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <Tabs defaultValue="blocks">
        <TabsList>
          <TabsTrigger value="blocks">Blocks & Rooms</TabsTrigger>
          <TabsTrigger value="allocs">All Allocations</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="mt-4 space-y-4">
          {blocks.map((b) => (
            <Card key={b.name} className="border-border/60">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-base">
                    {b.name}{" "}
                    <Badge variant="secondary" className="ml-2 text-[10px]">
                      {b.gender}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Warden: {b.warden} · {b.rooms.length} rooms ·{" "}
                    {b.rooms.reduce((s, r) => s + r.allocations.length, 0)}/
                    {b.rooms.reduce((s, r) => s + r.capacity, 0)} beds
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddRoomFor(b.name)}
                >
                  <Plus className="h-4 w-4" />
                  Add Room
                </Button>
              </CardHeader>
              <CardContent>
                {b.rooms.length === 0 && (
                  <div className="text-xs text-muted-foreground border border-dashed rounded p-4 text-center">
                    No rooms yet.
                  </div>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {b.rooms.map((r) => {
                    const free = r.capacity - r.allocations.length;
                    const cls =
                      free === 0
                        ? "border-destructive/30 bg-destructive/5"
                        : free < r.capacity
                          ? "border-warning/30 bg-warning/5"
                          : "border-success/30 bg-success/5";
                    return (
                      <div
                        key={r.no}
                        className={`border rounded-md p-3 ${cls}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-mono text-sm font-semibold">
                            {r.no}
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-[10px]">
                              {r.allocations.length}/{r.capacity}
                            </Badge>
                            <button
                              onClick={() => deleteRoom(b.name, r.no)}
                              className="p-1 hover:bg-muted rounded"
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </button>
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {r.type}
                        </div>
                        <div className="mt-2 space-y-1">
                          {r.allocations.map((a) => (
                            <div
                              key={a.studentId}
                              className="flex items-center justify-between text-xs bg-background/60 rounded px-2 py-1"
                            >
                              <span className="truncate">
                                <span className="font-medium">
                                  {a.studentName}
                                </span>{" "}
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  · {a.studentId} · Bed {a.bed}
                                </span>
                              </span>
                              <button
                                onClick={() => removeAlloc(r.no, a.studentId)}
                                className="p-0.5 hover:bg-muted rounded"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </button>
                            </div>
                          ))}
                          {free > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full h-7 text-xs"
                              onClick={() =>
                                setAllocFor({ block: b.name, room: r })
                              }
                            >
                              <UserPlus className="h-3 w-3" />
                              Allocate Student ({free} bed{free > 1 ? "s" : ""})
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="allocs" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Bed</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allAllocs.map((a) => (
                    <TableRow key={a.studentId + a.room}>
                      <TableCell className="text-sm font-medium">
                        {a.studentName}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {a.studentId}
                      </TableCell>
                      <TableCell className="text-xs">{a.block}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {a.room}
                      </TableCell>
                      <TableCell className="text-xs">{a.bed}</TableCell>
                      <TableCell className="text-xs">{a.checkin}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {a.guardian}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAlloc(a.room, a.studentId)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {allAllocs.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-sm text-muted-foreground py-8"
                      >
                        No students allocated yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
function AllocateDialog({ block, room, students, onClose, onAssign }) {
  const usedBeds = new Set(room.allocations.map((a) => a.bed));
  const beds = ["A", "B", "C", "D", "E"]
    .slice(0, room.capacity)
    .filter((b) => !usedBeds.has(b));
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [bed, setBed] = useState(beds[0] ?? "A");
  const [checkin, setCheckin] = useState(new Date().toISOString().slice(0, 10));
  const [query, setQuery] = useState("");
  const filtered = students
    .filter(
      (s) =>
        !query || (s.name + s.id).toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 50);
  const sel = students.find((s) => s.id === studentId);
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            Allocate Student — {block} / {room.no}
          </DialogTitle>
          <DialogDescription>
            {room.type} · {beds.length} free bed{beds.length !== 1 ? "s" : ""}{" "}
            available.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-xs">Search Student</Label>
            <Input
              placeholder="Name or ID…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Pick student" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {filtered.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} · {s.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-[10px] text-muted-foreground mt-1">
              Only students not already allocated are listed.
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Bed</Label>
              <Select value={bed} onValueChange={setBed}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {beds.map((b) => (
                    <SelectItem key={b} value={b}>
                      Bed {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Check-in</Label>
              <Input
                type="date"
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="gradient-primary border-0"
            disabled={!sel || beds.length === 0}
            onClick={() =>
              sel &&
              onAssign({
                studentId: sel.id,
                studentName: sel.name,
                bed,
                checkin,
                guardian: sel.phone ?? "",
              })
            }
          >
            Allocate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
