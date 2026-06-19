import { PageContainer, PageHeader } from "../../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  // CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  ChevronRight,
  ChevronDown,
  Building2,
  Layers,
  DoorOpen,
  Plus,
  Search,
  Trash2,
  Pencil,
} from "lucide-react";
import { useState } from "react";
import { KpiCard } from "../../../components/kpi-card";
import { CrudDialog } from "../../../components/crud-dialog";
import { toast } from "sonner";
const TREE = [
  {
    name: "Main Academic Block",
    code: "MAB",
    purpose: "Classrooms",
    blocks: [
      {
        name: "Block A",
        floors: [
          {
            name: "Ground Floor",
            rooms: [
              {
                no: "G-01",
                name: "Class VI-A",
                type: "Classroom",
                capacity: 40,
                status: "Active",
              },
              {
                no: "G-02",
                name: "Class VI-B",
                type: "Classroom",
                capacity: 40,
                status: "Active",
              },
              {
                no: "G-03",
                name: "Staff Room",
                type: "Staff",
                capacity: 25,
                status: "Active",
              },
            ],
          },
          {
            name: "First Floor",
            rooms: [
              {
                no: "F-11",
                name: "Class VII-A",
                type: "Classroom",
                capacity: 40,
                status: "Active",
              },
              {
                no: "F-12",
                name: "Class VII-B",
                type: "Classroom",
                capacity: 40,
                status: "Active",
              },
              {
                no: "F-13",
                name: "Physics Lab",
                type: "Lab",
                capacity: 30,
                status: "Active",
              },
            ],
          },
        ],
      },
      {
        name: "Block B",
        floors: [
          {
            name: "Ground Floor",
            rooms: [
              {
                no: "B-G1",
                name: "Auditorium",
                type: "Hall",
                capacity: 400,
                status: "Active",
              },
              {
                no: "B-G2",
                name: "Library",
                type: "Library",
                capacity: 120,
                status: "Active",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Science Wing",
    code: "SW",
    purpose: "Laboratories",
    blocks: [
      {
        name: "Lab Block",
        floors: [
          {
            name: "First Floor",
            rooms: [
              {
                no: "S-11",
                name: "Chemistry Lab",
                type: "Lab",
                capacity: 30,
                status: "Active",
              },
              {
                no: "S-12",
                name: "Biology Lab",
                type: "Lab",
                capacity: 30,
                status: "Maintenance",
              },
              {
                no: "S-13",
                name: "Computer Lab",
                type: "Lab",
                capacity: 35,
                status: "Active",
              },
            ],
          },
        ],
      },
    ],
  },
];
export default function Infrastructure() {
  const [tree, setTree] = useState(TREE);
  const [expanded, setExpanded] = useState(new Set(["Main Academic Block"]));
  const [q, setQ] = useState("");
  const [addBuilding, setAddBuilding] = useState(false);
  const [addBlockFor, setAddBlockFor] = useState(null);
  const [addFloorFor, setAddFloorFor] = useState(null);
  const [addRoomFor, setAddRoomFor] = useState(null);
  const [editRoom, setEditRoom] = useState(null);
  const toggle = (k) =>
    setExpanded((p) => {
      const n = new Set(p);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  const allRooms = tree.flatMap((b) =>
    b.blocks.flatMap((bl) =>
      bl.floors.flatMap((f) =>
        f.rooms.map((r) => ({
          ...r,
          building: b.name,
          block: bl.name,
          floor: f.name,
        })),
      ),
    ),
  );
  const filtered = allRooms.filter(
    (r) =>
      !q || (r.no + r.name + r.type).toLowerCase().includes(q.toLowerCase()),
  );
  const updateTree = (mutate) => setTree(mutate);
  const deleteBuilding = (name) => {
    updateTree((t) => t.filter((b) => b.name !== name));
    toast.success("Building removed");
  };
  const deleteBlock = (b, bl) => {
    updateTree((t) =>
      t.map((x) =>
        x.name !== b
          ? x
          : { ...x, blocks: x.blocks.filter((y) => y.name !== bl) },
      ),
    );
    toast.success("Block removed");
  };
  const deleteFloor = (b, bl, f) => {
    updateTree((t) =>
      t.map((x) =>
        x.name !== b
          ? x
          : {
              ...x,
              blocks: x.blocks.map((y) =>
                y.name !== bl
                  ? y
                  : { ...y, floors: y.floors.filter((z) => z.name !== f) },
              ),
            },
      ),
    );
    toast.success("Floor removed");
  };
  const deleteRoom = (b, bl, f, no) => {
    updateTree((t) =>
      t.map((x) =>
        x.name !== b
          ? x
          : {
              ...x,
              blocks: x.blocks.map((y) =>
                y.name !== bl
                  ? y
                  : {
                      ...y,
                      floors: y.floors.map((z) =>
                        z.name !== f
                          ? z
                          : { ...z, rooms: z.rooms.filter((r) => r.no !== no) },
                      ),
                    },
              ),
            },
      ),
    );
    toast.success("Room removed");
  };
  return (
    <PageContainer>
      <PageHeader
        title="Infrastructure"
        actions={
          <Button
            size="sm"
            className="gradient-primary border-0"
            onClick={() => setAddBuilding(true)}
          >
            <Plus className="h-4 w-4" />
            Add Building
          </Button>
        }
      />

      <CrudDialog
        open={addBuilding}
        onOpenChange={setAddBuilding}
        title="Add Building"
        description="Create just the building shell. Blocks, floors and rooms can be added incrementally below."
        fields={[
          { name: "name", label: "Building Name" },
          { name: "code", label: "Code" },
          {
            name: "purpose",
            label: "Purpose",
            type: "select",
            options: [
              "Classrooms",
              "Laboratories",
              "Administration",
              "Sports",
              "Hostel",
              "Other",
            ],
          },
        ]}
        submitLabel="Create Building"
        onSubmit={(d) =>
          updateTree((p) => [
            ...p,
            {
              name: String(d.name),
              code: String(d.code),
              purpose: String(d.purpose),
              blocks: [],
            },
          ])
        }
      />

      {addBlockFor && (
        <CrudDialog
          open
          onOpenChange={(v) => !v && setAddBlockFor(null)}
          title={`Add Block — ${addBlockFor}`}
          fields={[{ name: "name", label: "Block Name" }]}
          submitLabel="Add Block"
          onSubmit={(d) => {
            const ref = addBlockFor;
            updateTree((t) =>
              t.map((x) =>
                x.name !== ref
                  ? x
                  : {
                      ...x,
                      blocks: [
                        ...x.blocks,
                        { name: String(d.name), floors: [] },
                      ],
                    },
              ),
            );
            setAddBlockFor(null);
          }}
        />
      )}

      {addFloorFor && (
        <CrudDialog
          open
          onOpenChange={(v) => !v && setAddFloorFor(null)}
          title={`Add Floor — ${addFloorFor.b} / ${addFloorFor.bl}`}
          fields={[
            {
              name: "name",
              label: "Floor Name",
              type: "select",
              options: [
                "Basement",
                "Ground Floor",
                "First Floor",
                "Second Floor",
                "Third Floor",
                "Fourth Floor",
                "Fifth Floor",
                "Terrace",
              ],
            },
          ]}
          submitLabel="Add Floor"
          onSubmit={(d) => {
            const ref = addFloorFor;
            updateTree((t) =>
              t.map((x) =>
                x.name !== ref.b
                  ? x
                  : {
                      ...x,
                      blocks: x.blocks.map((y) =>
                        y.name !== ref.bl
                          ? y
                          : {
                              ...y,
                              floors: [
                                ...y.floors,
                                { name: String(d.name), rooms: [] },
                              ],
                            },
                      ),
                    },
              ),
            );
            setAddFloorFor(null);
          }}
        />
      )}

      {addRoomFor && (
        <CrudDialog
          open
          onOpenChange={(v) => !v && setAddRoomFor(null)}
          title={`Add Room — ${addRoomFor.b} / ${addRoomFor.bl} / ${addRoomFor.f}`}
          fields={[
            { name: "no", label: "Room No." },
            { name: "name", label: "Room Name" },
            {
              name: "type",
              label: "Type",
              type: "select",
              options: [
                "Classroom",
                "Lab",
                "Staff",
                "Hall",
                "Library",
                "Office",
                "Hostel",
                "Storage",
              ],
            },
            { name: "capacity", label: "Capacity", type: "number" },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: ["Active", "Maintenance"],
            },
          ]}
          submitLabel="Add Room"
          onSubmit={(d) => {
            const ref = addRoomFor;
            const room = {
              no: String(d.no),
              name: String(d.name),
              type: String(d.type),
              capacity: Number(d.capacity) || 30,
              status: String(d.status) || "Active",
            };
            updateTree((p) =>
              p.map((b) =>
                b.name !== ref.b
                  ? b
                  : {
                      ...b,
                      blocks: b.blocks.map((bl) =>
                        bl.name !== ref.bl
                          ? bl
                          : {
                              ...bl,
                              floors: bl.floors.map((f) =>
                                f.name !== ref.f
                                  ? f
                                  : { ...f, rooms: [...f.rooms, room] },
                              ),
                            },
                      ),
                    },
              ),
            );
            setAddRoomFor(null);
          }}
        />
      )}

      {editRoom && (
        <CrudDialog
          open
          onOpenChange={(v) => !v && setEditRoom(null)}
          title={`Edit Room — ${editRoom.r.no}`}
          initial={{
            no: editRoom.r.no,
            name: editRoom.r.name,
            type: editRoom.r.type,
            capacity: editRoom.r.capacity,
            status: editRoom.r.status,
          }}
          fields={[
            { name: "no", label: "Room No." },
            { name: "name", label: "Room Name" },
            {
              name: "type",
              label: "Type",
              type: "select",
              options: [
                "Classroom",
                "Lab",
                "Staff",
                "Hall",
                "Library",
                "Office",
                "Hostel",
                "Storage",
              ],
            },
            { name: "capacity", label: "Capacity", type: "number" },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: ["Active", "Maintenance"],
            },
          ]}
          submitLabel="Save"
          onSubmit={(d) => {
            const ref = editRoom;
            updateTree((p) =>
              p.map((b) =>
                b.name !== ref.b
                  ? b
                  : {
                      ...b,
                      blocks: b.blocks.map((bl) =>
                        bl.name !== ref.bl
                          ? bl
                          : {
                              ...bl,
                              floors: bl.floors.map((f) =>
                                f.name !== ref.f
                                  ? f
                                  : {
                                      ...f,
                                      rooms: f.rooms.map((r) =>
                                        r.no !== ref.r.no
                                          ? r
                                          : {
                                              no: String(d.no),
                                              name: String(d.name),
                                              type: String(d.type),
                                              capacity:
                                                Number(d.capacity) || 30,
                                              status: String(d.status),
                                            },
                                      ),
                                    },
                              ),
                            },
                      ),
                    },
              ),
            );
            setEditRoom(null);
          }}
        />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Buildings"
          value={tree.length}
          icon={<Building2 className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          label="Floors"
          value={
            tree.flatMap((b) => b.blocks.flatMap((bl) => bl.floors)).length
          }
          icon={<Layers className="h-5 w-5" />}
          tone="info"
        />
        <KpiCard
          label="Rooms"
          value={allRooms.length}
          icon={<DoorOpen className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="In Maintenance"
          value={allRooms.filter((r) => r.status === "Maintenance").length}
          icon={<DoorOpen className="h-5 w-5" />}
          tone="warning"
        />
      </div>

      <Tabs defaultValue="tree" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tree">Campus Tree</TabsTrigger>
          <TabsTrigger value="rooms">All Rooms</TabsTrigger>
        </TabsList>

        <TabsContent value="tree">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                Buildings → Blocks → Floors → Rooms
              </CardTitle>
              {/* <CardDescription>
                Add unlimited blocks, floors and rooms in each building. Hover
                for actions.
              </CardDescription> */}
            </CardHeader>
            <CardContent className="space-y-1">
              {tree.map((b) => {
                const bKey = b.name;
                const bOpen = expanded.has(bKey);
                const roomCount = b.blocks.flatMap((bl) =>
                  bl.floors.flatMap((f) => f.rooms),
                ).length;
                return (
                  <div key={bKey} className="group/b">
                    <div className="w-full flex items-center gap-2 p-2.5 rounded-md hover:bg-muted/50">
                      <button
                        onClick={() => toggle(bKey)}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      >
                        {bOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-medium">{b.name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {b.code}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {b.purpose}
                        </Badge>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {b.blocks.length} blocks · {roomCount} rooms
                        </span>
                      </button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAddBlockFor(b.name)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Block
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteBuilding(b.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                    {bOpen &&
                      b.blocks.map((bl) => {
                        const blKey = bKey + "/" + bl.name;
                        const blOpen = expanded.has(blKey);
                        return (
                          <div key={blKey} className="ml-6">
                            <div className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
                              <button
                                onClick={() => toggle(blKey)}
                                className="flex items-center gap-2 flex-1 text-left"
                              >
                                {blOpen ? (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5" />
                                )}
                                <span className="text-sm font-medium">
                                  {bl.name}
                                </span>
                                <span className="ml-auto text-[10px] text-muted-foreground">
                                  {bl.floors.length} floors
                                </span>
                              </button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setAddFloorFor({ b: b.name, bl: bl.name })
                                }
                              >
                                <Plus className="h-3 w-3" />
                                Floor
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteBlock(b.name, bl.name)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                            {blOpen &&
                              bl.floors.map((f) => {
                                const fKey = blKey + "/" + f.name;
                                const fOpen = expanded.has(fKey);
                                return (
                                  <div key={fKey} className="ml-6">
                                    <div className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
                                      <button
                                        onClick={() => toggle(fKey)}
                                        className="flex items-center gap-2 flex-1 text-left"
                                      >
                                        {fOpen ? (
                                          <ChevronDown className="h-3.5 w-3.5" />
                                        ) : (
                                          <ChevronRight className="h-3.5 w-3.5" />
                                        )}
                                        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-sm">
                                          {f.name}
                                        </span>
                                        <span className="ml-auto text-[10px] text-muted-foreground">
                                          {f.rooms.length} rooms
                                        </span>
                                      </button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          setAddRoomFor({
                                            b: b.name,
                                            bl: bl.name,
                                            f: f.name,
                                          })
                                        }
                                      >
                                        <Plus className="h-3 w-3" />
                                        Room
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          deleteFloor(b.name, bl.name, f.name)
                                        }
                                      >
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                      </Button>
                                    </div>
                                    {fOpen && (
                                      <div className="ml-6 grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
                                        {f.rooms.map((r) => (
                                          <div
                                            key={r.no}
                                            className="border rounded-md p-2.5 text-xs hover:bg-muted/40 group/r"
                                          >
                                            <div className="flex items-center justify-between">
                                              <span className="font-mono text-[10px] text-muted-foreground">
                                                {r.no}
                                              </span>
                                              <div className="flex items-center gap-0.5">
                                                <Badge
                                                  variant={
                                                    r.status === "Active"
                                                      ? "secondary"
                                                      : "outline"
                                                  }
                                                  className="text-[9px]"
                                                >
                                                  {r.status}
                                                </Badge>
                                                <button
                                                  onClick={() =>
                                                    setEditRoom({
                                                      b: b.name,
                                                      bl: bl.name,
                                                      f: f.name,
                                                      r,
                                                    })
                                                  }
                                                  className="opacity-0 group-hover/r:opacity-100 p-1 hover:bg-muted rounded"
                                                >
                                                  <Pencil className="h-3 w-3" />
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    deleteRoom(
                                                      b.name,
                                                      bl.name,
                                                      f.name,
                                                      r.no,
                                                    )
                                                  }
                                                  className="opacity-0 group-hover/r:opacity-100 p-1 hover:bg-muted rounded"
                                                >
                                                  <Trash2 className="h-3 w-3 text-destructive" />
                                                </button>
                                              </div>
                                            </div>
                                            <div className="font-medium mt-0.5">
                                              {r.name}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                              {r.type} · cap {r.capacity}
                                            </div>
                                          </div>
                                        ))}
                                        <button
                                          onClick={() =>
                                            setAddRoomFor({
                                              b: b.name,
                                              bl: bl.name,
                                              f: f.name,
                                            })
                                          }
                                          className="border border-dashed rounded-md p-2.5 text-xs hover:bg-primary/5 hover:border-primary/40 flex items-center justify-center gap-1 text-muted-foreground"
                                        >
                                          <Plus className="h-3.5 w-3.5" />
                                          Add Room
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            {blOpen && bl.floors.length === 0 && (
                              <div className="ml-6 p-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setAddFloorFor({ b: b.name, bl: bl.name })
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                  Add first floor
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    {bOpen && b.blocks.length === 0 && (
                      <div className="ml-6 p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAddBlockFor(b.name)}
                        >
                          <Plus className="h-3 w-3" />
                          Add first block
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms">
          <Card className="border-border/60">
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="font-display text-base">
                  All Rooms
                </CardTitle>
                {/* <CardDescription>Searchable across the campus.</CardDescription> */}
              </div>
              <div className="relative w-64">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search room…"
                  className="pl-8 h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead className="text-right">Capacity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.building + r.no}>
                      <TableCell className="font-mono text-xs">
                        {r.no}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {r.name}
                      </TableCell>
                      <TableCell className="text-xs">{r.type}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.block}
                     </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.floor}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.building}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {r.capacity}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            r.status === "Active"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-warning/10 text-warning border-warning/20"
                          }
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
