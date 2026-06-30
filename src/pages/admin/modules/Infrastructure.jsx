/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-useless-assignment */
import { PageContainer, PageHeader } from "../../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  // eslint-disable-next-line no-unused-vars
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
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
  X,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { KpiCard } from "../../../components/kpi-card";
// import { CrudDialog } from "../../../components/crud-dialog";
import {
  createBuilding,
  getBuildings,
  getBlocks,
  getFloors,
  getRooms,
  createRoom,
  getRoomByUUID,
  updateRoom,
  deleteRoom,
  getBuildingByUUID,
  updateBuilding,
  createBlock,
  getBlockByUUID,
  updateBlock,
  deleteBlock,
  createFloor,
  getFloorByUUID,   
  updateFloor,
  deleteFloor, 
  deleteBuilding 
} from "../../../api/infrastructure";
import { toast } from "sonner";
import {
  validateUniqueName,
  validateUniqueCode,
  isDuplicate,
  isDuplicateInArray,
  norm,
} from "../../../lib/infrastructure-validation";

const mapBuildingPayload = (data) => ({
  building_name: data.name,
  building_code: data.code,
  purpose: data.purpose,
  year_built: Number(data.year_built),
  description: "",
  status: data.status,

  blocks: data.blocks.map((block) => ({
    block_name: block.name,
    block_code: block.code,
    status: block.status,

    floors: block.floors.map((floor) => ({
      floor_name: floor.name,
      status: floor.status,

      rooms: floor.rooms.map((room) => ({
        room_number: room.no,
        room_name: room.name,
        room_type: room.type,
        capacity: Number(room.capacity),
        facilities: room.facilities,
        status: room.status,
      })),
    })),
  })),
});

const PURPOSES = [
  "Classrooms",
  "Laboratories",
  "Administration",
  "Sports",
  "Hostel",
  "Other",
];
const FLOOR_NUMBER_MAP = {
"Basement": -1,
  "Ground Floor": 0,
  "First Floor": 1,
  "Second Floor": 2,
  "Third Floor": 3,
  "Fourth Floor": 4,
  "Fifth Floor": 5,
  "Sixth Floor": 6,
  "Seventh Floor": 7,
  "Eighth Floor": 8,
  "Ninth Floor": 9,
  "Tenth Floor": 10,
  "Eleventh Floor": 11,
  "Twelfth Floor": 12,
  "Thirteenth Floor": 13,
  "Fourteenth Floor": 14,
  "Fifteenth Floor": 15,
  "Terrace": 16,
};
const FLOOR_NAMES = [
   "Basement",
  "Ground Floor",
  "First Floor",
  "Second Floor",
  "Third Floor",
  "Fourth Floor",
  "Fifth Floor",
  "Sixth Floor",
  "Seventh Floor",
  "Eighth Floor",
  "Ninth Floor",
  "Tenth Floor",
  "Eleventh Floor",
  "Twelfth Floor",
  "Thirteenth Floor",
  "Fourteenth Floor",
  "Fifteenth Floor",
  "Terrace",
];
const STATUS_OPTIONS = ["Active", "Maintenance", "Under Construction"];
const ROOM_TYPES = [
  "Classroom",
  "Lab",
  "Staff",
  "Hall",
  "Library",
  "Office",
  "Hostel",
  "Storage",
];
const FACILITIES_LIST = [
  "AC",
  "Projector",
  "WiFi",
  "Smart Board",
  "Lab Equipment",
  "Computers",
  "Sound System",
  "CCTV",
  "Exhaust Fan",
  "Microscopes",
  "Generator Backup",
  "Wheelchair Access",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 75 }, (_, i) =>
  String(CURRENT_YEAR - i),
);

// ── Field error helper ─────────────────────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-destructive mt-1">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

// ── Status Badge helper ───────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cls =
    status === "Active"
      ? "bg-success/10 text-success border-success/20"
      : status === "Maintenance"
        ? "bg-warning/10 text-warning border-warning/20"
        : "bg-blue-500/10 text-blue-500 border-blue-500/20";
  return (
    <Badge variant="outline" className={cls}>
      {status}
    </Badge>
  );
}

export default function Infrastructure() {
  const [tree, setTree] = useState([]);
  const [expanded, setExpanded] = useState(new Set(["Main Academic Block"]));
  const [q, setQ] = useState("");

  // Add dialogs
  const [addBuilding, setAddBuilding] = useState(false);
  const [addBlockFor, setAddBlockFor] = useState(null);
  const [addFloorFor, setAddFloorFor] = useState(null);
  const [addRoomFor, setAddRoomFor] = useState(null);

  // Edit dialogs
  const [editBuilding, setEditBuilding] = useState(null);
  const [editBlock, setEditBlock] = useState(null);
  const [editFloor, setEditFloor] = useState(null);
  const [editRoom, setEditRoom] = useState(null);

  const toggle = (k) =>
    setExpanded((p) => {
      const n = new Set(p);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const allRooms = tree.flatMap((b) =>
    (b.blocks || []).flatMap((bl) =>
      (bl.floors || []).flatMap((f) =>
        (f.rooms || []).map((r) => ({
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

  // ── Sibling lookup helpers (for duplicate-name/code validation) ──────────
  const findBuildingByUuid = (uuid) => tree.find((t) => t.uuid === uuid);
  const findBuildingByBlockUuid = (blockUuid) =>
    tree.find((t) => (t.blocks || []).some((bl) => bl.uuid === blockUuid));
  const findBlockByUuid = (blockUuid) => {
    for (const t of tree) {
      const bl = (t.blocks || []).find((x) => x.uuid === blockUuid);
      if (bl) return bl;
    }
    return null;
  };

  // Delete helpers

  const handleDeleteBuilding = async (buildingUUID) => {
  try {
    await deleteBuilding (buildingUUID);
    toast.success("Building deleted successfully");
    await fetchInfrastructure();
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to delete building");
  }
};
  // const deleteBlock = (b, bl) => {
  //   updateTree((t) =>
  //     t.map((x) =>
  //       x.name !== b
  //         ? x
  //         : { ...x, blocks: x.blocks.filter((y) => y.name !== bl) },
  //     ),
  //   );
  //   toast.success("Block removed");
  // };
  const handleDeleteBlock = async (blockUUID) => {
  try {
    await deleteBlock(blockUUID); // ✅ now calls api.delete(`/infrastructure/blocks/${blockUUID}`)
    toast.success("Block deleted successfully");
    await fetchInfrastructure();
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to delete block");
  }
};
  // const deleteFloor = (b, bl, f) => {
  //   updateTree((t) =>
  //     t.map((x) =>
  //       x.name !== b
  //         ? x
  //         : {
  //             ...x,
  //             blocks: x.blocks.map((y) =>
  //               y.name !== bl
  //                 ? y
  //                 : { ...y, floors: y.floors.filter((z) => z.name !== f) },
  //             ),
  //           },
  //     ),
  //   );
  //   toast.success("Floor removed");
  // };

  const handleDeleteFloor = async (floorUUID, b, bl, f) => {
  try {
    await deleteFloor(floorUUID);
    toast.success("Floor deleted successfully");
    await fetchInfrastructure();
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to delete floor");
  }
};
 const removeRoomFromState = (b, bl, f, no) => {
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
                        : {
                            ...z,
                            rooms: z.rooms.filter((r) => r.no !== no),
                          },
                    ),
                  },
            ),
          },
    ),
  );
};
  useEffect(() => {
    fetchInfrastructure();
  }, []);
  function mapApiBuilding(building, blocks) {
    return {
      uuid: building.building_uuid,
      name: building.building_name,
      code: building.building_code,
      purpose: building.purpose,
      year_built: building.year_built,
      status: building.status,
      blocks,
    };
  }

  const fetchInfrastructure = async () => {
    try {
      const buildingsRes = await getBuildings();

      const buildings = await Promise.all(
        buildingsRes.data.map(async (building) => {
          // Fetch Blocks
          const blocksRes = await getBlocks(building.building_uuid);

          const blocks = await Promise.all(
            blocksRes.data.map(async (block) => {
              // Fetch Floors
              const floorsRes = await getFloors(block.block_uuid);

              const floors = await Promise.all(
                floorsRes.data.map(async (floor) => {
                  // Optional Rooms API
                  let rooms = [];

                  try {
                    const roomsRes = await getRooms(floor.floor_uuid);

                    rooms = roomsRes.data.map((room) => ({
                      uuid: room.room_uuid, // <-- ADD THIS
                      no: room.room_number,
                      name: room.room_name,
                      type: room.room_type,
                      capacity: room.capacity,
                      facilities: room.facilities || [],
                      status: room.status,
                    }));
                  } catch {
                    rooms = [];
                  }

                  return {
                    uuid: floor.floor_uuid,
                    name: floor.floor_name,
                    floor_number: floor.floor_number,
                    status: floor.status,
                    rooms,
                  };
                }),
              );

              return {
                uuid: block.block_uuid,
                name: block.block_name,
                code: block.block_code,
                status: block.status,
                floors,
              };
            }),
          );

          return mapApiBuilding(building, blocks);
        }),
      );

      setTree(buildings);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load infrastructure");
    }
  };


  return (
    <PageContainer>
      <PageHeader
        eyebrow="Admin · Operations"
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

      {/* ── Add Building ── */}
      <UnifiedBuildingDialog
        open={addBuilding}
        onOpenChange={setAddBuilding}
        existingBuildings={tree.map((t) => ({
          uuid: t.uuid,
          name: t.name,
          code: t.code,
        }))}
        onSubmit={async (building) => {
          try {
            const payload = mapBuildingPayload(building);

            const res = await createBuilding(payload);

            toast.success(res.message);

            await fetchInfrastructure();

            setAddBuilding(false);
          } catch (err) {
            toast.error(
              err.response?.data?.message || "Failed to create building",
            );
          }
        }}
      />

      {/* ── Edit Building ── */}
      {editBuilding && (
      <EditBuildingDialog
  open
  building={editBuilding.b}
  buildingUuid={editBuilding.uuid}
  existingBuildings={tree.map((t) => ({
    uuid: t.uuid,
    name: t.name,
    code: t.code,
  }))}
  onOpenChange={(v) => !v && setEditBuilding(null)}
  onSubmit={async (d) => {
    try {
      const payload = {
        building_name: d.name,
        building_code: d.code,
        purpose: d.purpose,
        year_built: Number(d.year_built),
        description: "",
        status: d.status,
      };

      const res = await updateBuilding(editBuilding.uuid, payload);

      toast.success(res.message || "Building updated");

      await fetchInfrastructure();

      setEditBuilding(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update building"
      );
    }
  }}
/>
      )}

      {/* ── Add Block ── */}
    {/* ── Add Block ── */}
{addBlockFor && (
  <BlockDialog
    open
    title={`Add Block — ${addBlockFor.name}`}
    existingBlocks={(findBuildingByUuid(addBlockFor.uuid)?.blocks || []).map(
      (bl) => ({ uuid: bl.uuid, name: bl.name, code: bl.code }),
    )}
    onOpenChange={(v) => !v && setAddBlockFor(null)}
    onSubmit={async (d) => {
      try {
        const payload = {
          block_name: d.name,
          block_code: d.code,
          description: "",
          status: d.status,
        };

        const res = await createBlock(addBlockFor.uuid, payload);

        toast.success(res.message || "Block created successfully");

        await fetchInfrastructure();

        setAddBlockFor(null);
      } catch (err) {
        console.error(err);

        toast.error(
          err.response?.data?.message || "Failed to create block"
        );
      }
    }}
  />
)}

      {/* ── Edit Block ── */}
   {editBlock && (
  <BlockDialog
    open
    title="Edit Block"
    initial={{
      name: editBlock.block.name,
      code: editBlock.block.code,
      status: editBlock.block.status,
    }}
    excludeUuid={editBlock.uuid}
    existingBlocks={(
      findBuildingByBlockUuid(editBlock.uuid)?.blocks || []
    ).map((bl) => ({ uuid: bl.uuid, name: bl.name, code: bl.code }))}
    onOpenChange={(v) => !v && setEditBlock(null)}
    onSubmit={async (d) => {
      try {
        const payload = {
          block_name: d.name,
          block_code: d.code,
          description: "",
          status: d.status,
        };

        const res = await updateBlock(
          editBlock.uuid,
          payload
        );

        toast.success(
          res.message || "Block updated successfully"
        );

        await fetchInfrastructure();

        setEditBlock(null);
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Failed to update block"
        );
      }
    }}
  />
)}

    {/* ── Add Floor ── */}
{addFloorFor && (
  <FloorDialog
    open
    title={`Add Floor — ${addFloorFor.b} / ${addFloorFor.bl}`}
    existingFloors={(findBlockByUuid(addFloorFor.blockUUID)?.floors || []).map(
      (f) => ({ uuid: f.uuid, name: f.name, floor_number: f.floor_number }),
    )}
    onOpenChange={(v) => !v && setAddFloorFor(null)}
    onSubmit={async (d) => {
      try {
        const payload = {
          floor_name: d.name,
          floor_number: d.floor_number,
          description: "",
          status: d.status,
        };

        const res = await createFloor(addFloorFor.blockUUID, payload);

        toast.success(res.message || "Floor created successfully");

        await fetchInfrastructure();

        setAddFloorFor(null);
      } catch (err) {
        console.error(err);
        toast.error(
          err.response?.data?.message || "Failed to create floor"
        );
      }
    }}
  />
)}

      {/* ── Edit Floor ── */}
     {/* ── Edit Floor ── */}
{editFloor && (
  <FloorDialog
    open
    title={`Edit Floor — ${editFloor.f}`}
    initial={editFloor.data}
    excludeUuid={editFloor.floorUUID}
    existingFloors={(
      findBlockByUuid(editFloor.blockUUID)?.floors || []
    ).map((f) => ({ uuid: f.uuid, name: f.name, floor_number: f.floor_number }))}
    onOpenChange={(v) => !v && setEditFloor(null)}
    onSubmit={async (d) => {
      try {
        const payload = {
          floor_name: d.name,
          floor_number: d.floor_number,
          description: d.description || "",
          status: d.status,
        };

        const res = await updateFloor(editFloor.floorUUID, payload);

        toast.success(res.message || "Floor updated successfully");

        await fetchInfrastructure();

        setEditFloor(null);
      } catch (err) {
        console.error(err);
        toast.error(
          err.response?.data?.message || "Failed to update floor"
        );
      }
    }}
  />
)}

      {/* ── Add Room ── */}
      {addRoomFor && (
        <RoomDialog
          open
          title={`Add Room — ${addRoomFor.b} / ${addRoomFor.bl} / ${addRoomFor.f}`}
          onOpenChange={(v) => !v && setAddRoomFor(null)}
          onSubmit={async (d) => {
            try {
              const ref = addRoomFor;

              const payload = {
                building_uuid: ref.buildingUUID,
                block_uuid: ref.blockUUID,
                floor_uuid: ref.floorUUID,

                room_number: d.no,
                room_name: d.name,
                room_type: d.type,
                capacity: Number(d.capacity),
                facilities: d.facilities || [],
                status: d.status,
              };

              const res = await createRoom(payload);

              toast.success(res.message || "Room created");

              await fetchInfrastructure();

              setAddRoomFor(null);
            } catch (err) {
              console.error(err);

              toast.error(
                err.response?.data?.message || "Failed to create room",
              );
            }
          }}
        />
      )}

      {/* ── Edit Room ── */}
    {/* ── Edit Room ── */}
{editRoom && (
  <RoomDialog
    open
    title={`Edit Room — ${editRoom.r.no}`}
    initial={editRoom.r}
    onOpenChange={(v) => !v && setEditRoom(null)}
    onSubmit={async (d) => {
      try {
        const payload = {
          building_uuid: editRoom.buildingUUID,
          block_uuid: editRoom.blockUUID,
          floor_uuid: editRoom.floorUUID,

          room_number: d.no,
          room_name: d.name,
          room_type: d.type,
          capacity: Number(d.capacity),
          facilities: d.facilities || [],
          status: d.status,
        };

        const res = await updateRoom(editRoom.roomUUID, payload);

        toast.success(res.message || "Room updated");

        await fetchInfrastructure();

        setEditRoom(null);
      } catch (err) {
        console.error(err);

        toast.error(
          err.response?.data?.message || "Failed to update room"
        );
      }
    }}
  />
)}
      {/* ── KPIs ── */}
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
            tree.flatMap((b) =>
              (b.blocks || []).flatMap((bl) => bl.floors || []),
            ).length
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

        {/* ── Campus Tree ── */}
        <TabsContent value="tree">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                Buildings → Blocks → Floors → Rooms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {tree.map((b) => {
                const bKey = b.name;
                const bOpen = expanded.has(bKey);
                const totalFloors = (b.blocks || []).reduce(
                  (s, bl) => s + (bl.floors || []).length,
                  0,
                );

                const roomCount = (b.blocks || []).flatMap((bl) =>
                  (bl.floors || []).flatMap((f) => f.rooms || []),
                ).length;
                return (
                  <div key={bKey} className="group/b">
                    {/* Building row */}
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
                        {b.year_built && (
                          <span className="text-[10px] text-muted-foreground">
                            Est. {b.year_built}
                          </span>
                        )}
                        <StatusBadge status={b.status} />
                        <span className="ml-auto text-xs text-muted-foreground">
                          {b.blocks.length} blocks · {totalFloors} floors ·{" "}
                          {roomCount} rooms
                        </span>
                      </button>
                  <Button
  size="sm"
  variant="ghost"
  onClick={() =>
    setAddBlockFor({
      uuid: b.uuid,
      name: b.name,
    })
  }
>
  <Plus className="h-3.5 w-3.5" />
  Block
</Button>
                      <Button
  size="sm"
  variant="ghost"
  onClick={async () => {
    try {
      const res = await getBuildingByUUID(b.uuid);

      const building = res.data;

      setEditBuilding({
        uuid: building.building_uuid,
        b: {
          name: building.building_name,
          code: building.building_code,
          purpose: building.purpose,
          year_built: building.year_built,
          status: building.status,
        },
      });
    } catch (err) {
      toast.error("Failed to load building details");
    }
  }}
>
  <Pencil className="h-3.5 w-3.5" />
</Button>
                     <Button
  size="sm"
  variant="ghost"
  onClick={() => handleDeleteBuilding(b.uuid)}
>
  <Trash2 className="h-3.5 w-3.5 text-destructive" />
</Button>
                    </div>

                    {bOpen &&
                      (b.blocks || []).map((bl) => {
                        const blKey = bKey + "/" + bl.name;
                        const blOpen = expanded.has(blKey);
                        return (
                          <div key={blKey} className="ml-6">
                            {/* Block row */}
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
                                {bl.code && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                  >
                                    {bl.code}
                                  </Badge>
                                )}
                                <StatusBadge status={bl.status} />
                                <span className="ml-auto text-[10px] text-muted-foreground">
                                  {bl.floors.length} floors
                                </span>
                              </button>
                            <Button
  size="sm"
  variant="ghost"
  onClick={() =>
    setAddFloorFor({ b: b.name, bl: bl.name, blockUUID: bl.uuid })
  }
>
  <Plus className="h-3 w-3" />
  Floor
</Button>

                              <Button
  size="sm"
  variant="ghost"
  onClick={async () => {
    try {
      const res = await getBlockByUUID(bl.uuid);

      const block = res.data;

      setEditBlock({
        uuid: block.block_uuid,

        block: {
          name: block.block_name,
          code: block.block_code,
          description: block.description,
          status: block.status,
        },
      });
    } catch (err) {
      toast.error("Failed to load block details");
    }
  }}
>
  <Pencil className="h-3 w-3" />
</Button><Button
  size="sm"
  variant="ghost"
  onClick={() => handleDeleteBlock(bl.uuid)}
>
  <Trash2 className="h-3 w-3 text-destructive" />
</Button>
                            </div>

                            {blOpen &&
                              (bl.floors || []).map((f) => {
                                const fKey = blKey + "/" + f.name;
                                const fOpen = expanded.has(fKey);
                                return (
                                  <div key={fKey} className="ml-6">
                                    {/* Floor row */}
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
                                        <StatusBadge status={f.status} />
                                        <span className="ml-auto text-[10px] text-muted-foreground">
                                          {f.rooms.length} rooms
                                        </span>
                                      </button>
                                      {/* <Button
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
                                      </Button> */}
 
                                    <Button
  size="sm"
  variant="ghost"
  onClick={async () => {
    try {
      const res = await getFloorByUUID(f.uuid);
      const floor = res.data;

      setEditFloor({
        b: b.name,
        bl: bl.name,
        f: floor.floor_name,

        floorUUID: floor.floor_uuid,
        blockUUID: floor.block_uuid,
        buildingUUID: floor.building_uuid,

        data: {
          name: floor.floor_name,
          floor_number: floor.floor_number,
          description: floor.description || "",
          status: floor.status,
        },
      });
    } catch (err) {
      toast.error("Failed to load floor details");
    }
  }}
>
  <Pencil className="h-3 w-3" />
</Button>
 <Button
  size="sm"
  variant="ghost"
  onClick={() => handleDeleteFloor(f.uuid, b.name, bl.name, f.name)}
>
  <Trash2 className="h-3 w-3 text-destructive" />
</Button>
                                    </div>

                                    {fOpen && (
                                      <div className="ml-6 grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
                                        {(f.rooms || []).map((r) => (
                                          <div
                                            key={r.no}
                                            className="border rounded-md p-2.5 text-xs hover:bg-muted/40 group/r"
                                          >
                                            <div className="flex items-center justify-between">
                                              <span className="font-mono text-[10px] text-muted-foreground">
                                                {r.no}
                                              </span>
                                              <div className="flex items-center gap-0.5">
                                                <StatusBadge
                                                  status={r.status}
                                                />
                                                <button
                                                  onClick={async () => {
                                                    try {
                                                      const res =
                                                        await getRoomByUUID(
                                                          r.uuid,
                                                        );

                                                      const room = res.data;

                                                      setEditRoom({
                                                        b: b.name,
                                                        bl: bl.name,
                                                        f: f.name,

                                                        buildingUUID:
                                                          room.building_uuid,
                                                        blockUUID:
                                                          room.block_uuid,
                                                        floorUUID:
                                                          room.floor_uuid,
                                                        roomUUID:
                                                          room.room_uuid,

                                                        r: {
                                                          uuid: room.room_uuid,
                                                          no: room.room_number,
                                                          name: room.room_name,
                                                          type: room.room_type,
                                                          capacity:
                                                            room.capacity,
                                                          facilities:
                                                            room.facilities ||
                                                            [],
                                                          status: room.status,
                                                        },
                                                      });
                                                    } catch (err) {
                                                      toast.error(
                                                        "Failed to load room details",
                                                      );
                                                    }
                                                  }}
                                                  className="opacity-0 group-hover/r:opacity-100 p-1 hover:bg-muted rounded"
                                                >
                                                  <Pencil className="h-3 w-3" />
                                                </button>
                                             <button
  onClick={async () => {
    try {
      await deleteRoom(r.uuid);

      toast.success("Room deleted");

      // Option 1 (recommended)
      await fetchInfrastructure();

      // OR Option 2
      // removeRoomFromState(b.name, bl.name, f.name, r.no);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to delete room"
      );
    }
  }}
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
                                            {r.facilities &&
                                              r.facilities.length > 0 && (
                                                <div className="flex flex-wrap gap-0.5 mt-1">
                                                  {r.facilities.map((fac) => (
                                                    <span
                                                      key={fac}
                                                      className="text-[9px] bg-muted px-1 py-0.5 rounded text-muted-foreground"
                                                    >
                                                      {fac}
                                                    </span>
                                                  ))}
                                                </div>
                                              )}
                                          </div>
                                        ))}
                                        <button
                                          onClick={() =>
                                            setAddRoomFor({
                                              buildingUUID: b.uuid,
                                              blockUUID: bl.uuid,
                                              floorUUID: f.uuid,
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
        setAddFloorFor({ b: b.name, bl: bl.name, blockUUID: bl.uuid })
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

        {/* ── All Rooms ── */}
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
                    <TableHead>Room No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead className="text-right">Capacity</TableHead>
                    <TableHead>Facilities</TableHead>
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
                        <div className="flex flex-wrap gap-0.5">
                          {(r.facilities || []).slice(0, 3).map((f) => (
                            <span
                              key={f}
                              className="text-[9px] bg-muted px-1 py-0.5 rounded text-muted-foreground"
                            >
                              {f}
                            </span>
                          ))}
                          {(r.facilities || []).length > 3 && (
                            <span className="text-[9px] text-muted-foreground">
                              +{r.facilities.length - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
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

// ── Edit Building Dialog ──────────────────────────────────────────────────────
function EditBuildingDialog({
  open,
  building,
  buildingUuid,
  existingBuildings = [],
  onOpenChange,
  onSubmit,
}) {
 const [form, setForm] = useState({
  name: "",
  code: "",
  purpose: "Classrooms",
  year_built: "",
  status: "Active",
});
const [errors, setErrors] = useState({});

useEffect(() => {
  if (building) {
    setForm({
      name: building.name || "",
      code: building.code || "",
      purpose: building.purpose || "Classrooms",
      year_built: building.year_built?.toString() || "",
      status: building.status || "Active",
    });
    setErrors({});
  }
}, [building]);

  const validate = () => {
    const e = {};

    const nameError = validateUniqueName(form.name, "Building name", {
      existing: existingBuildings,
      excludeUuid: buildingUuid,
      duplicateMessage: "Building name already exists.",
    });
    if (nameError) e.name = nameError;

    const codeError = validateUniqueCode(form.code, "Building code", {
      existing: existingBuildings,
      excludeUuid: buildingUuid,
      duplicateMessage: "Building code already exists.",
    });
    if (codeError) e.code = codeError;

    if (!form.year_built) e.year_built = "Year built is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) {
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Building</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs text-muted-foreground">
                Building Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="e.g. Main Academic Block"
                className={errors.name ? "border-destructive focus-visible:ring-destructive/40" : ""}
              />
              <FieldError message={errors.name} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Building Code <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.code}
                onChange={(e) => {
                  setForm({ ...form, code: e.target.value });
                  if (errors.code) setErrors({ ...errors, code: undefined });
                }}
                placeholder="e.g. M-01"
                className={errors.code ? "border-destructive focus-visible:ring-destructive/40" : ""}
              />
              <FieldError message={errors.code} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Purpose</Label>
              <Select
                value={form.purpose}
                onValueChange={(v) => setForm({ ...form, purpose: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PURPOSES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Year Built <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.year_built}
                onValueChange={(v) => {
                  setForm({ ...form, year_built: v });
                  if (errors.year_built) setErrors({ ...errors, year_built: undefined });
                }}
              >
                <SelectTrigger className={errors.year_built ? "border-destructive focus-visible:ring-destructive/40" : ""}>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_OPTIONS.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.year_built} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="gradient-primary border-0" onClick={submit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Block Dialog (Add / Edit) ─────────────────────────────────────────────────
function BlockDialog({
  open,
  title,
  initial,
  existingBlocks = [],
  excludeUuid,
  onOpenChange,
  onSubmit,
}) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    code: initial?.code || "",
    status: initial?.status || "Active",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};

    const nameError = validateUniqueName(form.name, "Block name", {
      existing: existingBlocks,
      excludeUuid,
      duplicateMessage: "Block already exists in this building.",
    });
    if (nameError) e.name = nameError;

    const codeError = validateUniqueCode(form.code, "Block code", {
      existing: existingBlocks,
      excludeUuid,
      duplicateMessage: "Block code already exists in this building.",
    });
    if (codeError) e.code = codeError;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) {
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-base">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Block Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="e.g. Block A"
              className={errors.name ? "border-destructive focus-visible:ring-destructive/40" : ""}
            />
            <FieldError message={errors.name} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Block Code <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.code}
              onChange={(e) => {
                setForm({ ...form, code: e.target.value });
                if (errors.code) setErrors({ ...errors, code: undefined });
              }}
              placeholder="e.g. BLK-A"
              className={errors.code ? "border-destructive focus-visible:ring-destructive/40" : ""}
            />
            <FieldError message={errors.code} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="gradient-primary border-0" onClick={submit}>
            {initial ? "Save Changes" : "Add Block"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Floor Dialog (Add / Edit) ─────────────────────────────────────────────────
function FloorDialog({
  open,
  title,
  initial,
  existingFloors = [],
  excludeUuid,
  onOpenChange,
  onSubmit,
}) {
  const [form, setForm] = useState({
    name: initial?.name || "Ground Floor",
    floor_number: initial?.floor_number ?? 0,
    status: initial?.status || "Active",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name) {
      e.name = "Floor name is required.";
    } else if (isDuplicate(form.name, existingFloors, "name", excludeUuid)) {
      e.name = "Floor already exists in this block.";
    }

    if (
      form.floor_number === "" ||
      form.floor_number === null ||
      form.floor_number === undefined
    ) {
      e.floor_number = "Floor number is required.";
    } else if (
      existingFloors.some(
        (x) =>
          x.uuid !== excludeUuid &&
          Number(x.floor_number) === Number(form.floor_number),
      )
    ) {
      e.floor_number = "Floor number already exists in this block.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) {
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-base">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Floor Name <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.name}
              onValueChange={(v) => {
                setForm({ ...form, name: v });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
            >
              <SelectTrigger className={errors.name ? "border-destructive focus-visible:ring-destructive/40" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FLOOR_NAMES.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.name} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Floor Number <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              value={form.floor_number}
              onChange={(e) => {
                setForm({ ...form, floor_number: e.target.value === "" ? "" : Number(e.target.value) });
                if (errors.floor_number) setErrors({ ...errors, floor_number: undefined });
              }}
              placeholder="e.g. 0 for Ground, 1 for First…"
              className={errors.floor_number ? "border-destructive focus-visible:ring-destructive/40" : ""}
            />
            <FieldError message={errors.floor_number} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="gradient-primary border-0" onClick={submit}>
            {initial ? "Save Changes" : "Add Floor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Room Dialog (Add / Edit) ──────────────────────────────────────────────────
function RoomDialog({ open, title, initial, onOpenChange, onSubmit }) {
  const [form, setForm] = useState({
    no: initial?.no || "",
    name: initial?.name || "",
    type: initial?.type || "Classroom",
    capacity: initial?.capacity || 40,
    facilities: initial?.facilities || [],
    status: initial?.status || "Active",
  });
  const [errors, setErrors] = useState({});

  const toggleFacility = (fac) => {
    setForm((f) => ({
      ...f,
      facilities: f.facilities.includes(fac)
        ? f.facilities.filter((x) => x !== fac)
        : [...f.facilities, fac],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.no.trim()) e.no = "Room number is required.";

    const nameError = validateUniqueName(form.name, "Room name");
    if (nameError) e.name = nameError;

    if (!form.capacity || Number(form.capacity) <= 0) e.capacity = "Capacity must be greater than 0.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) {
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }
    onSubmit({ ...form, capacity: Number(form.capacity) || 30 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-base">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Room Number <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.no}
                onChange={(e) => {
                  setForm({ ...form, no: e.target.value });
                  if (errors.no) setErrors({ ...errors, no: undefined });
                }}
                placeholder="e.g. G-01"
                className={errors.no ? "border-destructive focus-visible:ring-destructive/40" : ""}
              />
              <FieldError message={errors.no} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Room Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="e.g. Class VI-A"
                className={errors.name ? "border-destructive focus-visible:ring-destructive/40" : ""}
              />
              <FieldError message={errors.name} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Room Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Capacity <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                value={form.capacity}
                onChange={(e) => {
                  setForm({ ...form, capacity: e.target.value });
                  if (errors.capacity) setErrors({ ...errors, capacity: undefined });
                }}
                placeholder="e.g. 40"
                className={errors.capacity ? "border-destructive focus-visible:ring-destructive/40" : ""}
              />
              <FieldError message={errors.capacity} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Facilities</Label>
            <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
              {FACILITIES_LIST.map((fac) => (
                <div key={fac} className="flex items-center gap-2">
                  <Checkbox
                    id={`fac-${fac}`}
                    checked={form.facilities.includes(fac)}
                    onCheckedChange={() => toggleFacility(fac)}
                  />
                  <label
                    htmlFor={`fac-${fac}`}
                    className="text-xs cursor-pointer"
                  >
                    {fac}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="gradient-primary border-0" onClick={submit}>
            {initial ? "Save Changes" : "Add Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Building Dialog ───────────────────────────────────────────────────────
const emptyRoom = (i) => ({
  no: `R-${String(i).padStart(2, "0")}`,
  name: "",
  type: "Classroom",
  capacity: 40,
  facilities: [],
  status: "Active",
});
const emptyFloor = () => ({
  name: "Ground Floor",
  status: "Active",
  rooms: [emptyRoom(1)],
});
const emptyBlock = () => ({
  name: "Block A",
  code: "",
  status: "Active",
  floors: [emptyFloor()],
});
const emptyBuilding = () => ({
  name: "",
  code: "",
  purpose: "Classrooms",
  year_built: "",
  status: "Active",
  blocks: [emptyBlock()],
});

function UnifiedBuildingDialog({ open, onOpenChange, onSubmit, existingBuildings = [] }) {
  const [b, setB] = useState(emptyBuilding());
  const [errors, setErrors] = useState({});

  const reset = () => {
    setB(emptyBuilding());
    setErrors({});
  };
  const close = (v) => {
    onOpenChange(v);
    if (!v) reset();
  };

  const patchBlock = (bi, p) =>
    setB((x) => ({
      ...x,
      blocks: x.blocks.map((bl, i) => (i === bi ? { ...bl, ...p } : bl)),
    }));
  const patchFloor = (bi, fi, p) =>
    setB((x) => ({
      ...x,
      blocks: x.blocks.map((bl, i) =>
        i === bi
          ? {
              ...bl,
              floors: bl.floors.map((f, j) => (j === fi ? { ...f, ...p } : f)),
            }
          : bl,
      ),
    }));
  const patchRoom = (bi, fi, ri, p) =>
    setB((x) => ({
      ...x,
      blocks: x.blocks.map((bl, i) =>
        i === bi
          ? {
              ...bl,
              floors: bl.floors.map((f, j) =>
                j === fi
                  ? {
                      ...f,
                      rooms: f.rooms.map((r, k) =>
                        k === ri ? { ...r, ...p } : r,
                      ),
                    }
                  : f,
              ),
            }
          : bl,
      ),
    }));

  const toggleRoomFacility = (bi, fi, ri, fac) => {
    const room = b.blocks[bi].floors[fi].rooms[ri];
    const facilities = room.facilities.includes(fac)
      ? room.facilities.filter((x) => x !== fac)
      : [...room.facilities, fac];
    patchRoom(bi, fi, ri, { facilities });
  };

  const clearError = (path) => {
    if (!errors[path]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[path];
      return next;
    });
  };

  const validate = () => {
    const e = {};

    const buildingNameError = validateUniqueName(b.name, "Building name", {
      existing: existingBuildings,
      duplicateMessage: "Building name already exists.",
    });
    if (buildingNameError) e.name = buildingNameError;

    const buildingCodeError = validateUniqueCode(b.code, "Building code", {
      existing: existingBuildings,
      duplicateMessage: "Building code already exists.",
    });
    if (buildingCodeError) e.code = buildingCodeError;

    if (!b.year_built) e.year_built = "Year built is required.";

    b.blocks.forEach((bl, bi) => {
      const blockNameError = validateUniqueName(bl.name, "Block name", {
        existing: b.blocks
          .map((other, oi) => ({ uuid: String(oi), name: other.name }))
          .filter((_, oi) => oi !== bi),
        duplicateMessage: "Block already exists in this building.",
      });
      if (blockNameError) e[`block-${bi}-name`] = blockNameError;

      const blockCodeError = validateUniqueCode(bl.code, "Block code", {
        existing: b.blocks
          .map((other, oi) => ({ uuid: String(oi), code: other.code }))
          .filter((_, oi) => oi !== bi),
        duplicateMessage: "Block code already exists in this building.",
      });
      if (blockCodeError) e[`block-${bi}-code`] = blockCodeError;

      bl.floors.forEach((f, fi) => {
        if (
          isDuplicateInArray(
            f.name,
            bl.floors.map((x) => x.name),
            fi,
          )
        ) {
          e[`floor-${bi}-${fi}-name`] = "Floor already exists in this block.";
        }

        f.rooms.forEach((r, ri) => {
          const key = `room-${bi}-${fi}-${ri}`;

          if (!r.no.trim()) {
            e[`${key}-no`] = "Room number is required.";
          } else if (
            isDuplicateInArray(
              r.no,
              f.rooms.map((x) => x.no),
              ri,
            )
          ) {
            e[`${key}-no`] = "Room number already exists on this floor.";
          }

          const roomNameError = validateUniqueName(r.name, "Room name");
          if (roomNameError) e[`${key}-name`] = roomNameError;

          if (!r.capacity || Number(r.capacity) <= 0)
            e[`${key}-capacity`] = "Capacity is required.";
        });
      });
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) {
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }
    onSubmit(b);
    close(false);
  };

  const totalRooms = b.blocks.reduce(
    (s, bl) => s + bl.floors.reduce((t, f) => t + f.rooms.length, 0),
    0,
  );
  const totalFloors = b.blocks.reduce((s, bl) => s + bl.floors.length, 0);

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Add Building</DialogTitle>
        </DialogHeader>

        {/* Building meta */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-2">
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <Label className="text-xs text-muted-foreground">
              Building Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={b.name}
              onChange={(e) => {
                setB({ ...b, name: e.target.value });
                clearError("name");
              }}
              placeholder="e.g. Main Academic Block"
              className={errors.name ? "border-destructive focus-visible:ring-destructive/40" : ""}
            />
            <FieldError message={errors.name} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Building Code <span className="text-destructive">*</span>
            </Label>
            <Input
              value={b.code}
              onChange={(e) => {
                setB({ ...b, code: e.target.value });
                clearError("code");
              }}
              placeholder="e.g. M-01"
              className={errors.code ? "border-destructive focus-visible:ring-destructive/40" : ""}
            />
            <FieldError message={errors.code} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Purpose</Label>
            <Select
              value={b.purpose}
              onValueChange={(v) => setB({ ...b, purpose: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PURPOSES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Year Built <span className="text-destructive">*</span>
            </Label>
            <Select
              value={b.year_built}
              onValueChange={(v) => {
                setB({ ...b, year_built: v });
                clearError("year_built");
              }}
            >
              <SelectTrigger className={errors.year_built ? "border-destructive focus-visible:ring-destructive/40" : ""}>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.year_built} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select
              value={b.status}
              onValueChange={(v) => setB({ ...b, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground flex items-center gap-4">
          <span>
            <Building2 className="inline h-3.5 w-3.5 mr-1" />
            {b.blocks.length} block(s)
          </span>
          <span>
            <Layers className="inline h-3.5 w-3.5 mr-1" />
            {totalFloors} floor(s)
          </span>
          <span>
            <DoorOpen className="inline h-3.5 w-3.5 mr-1" />
            {totalRooms} room(s)
          </span>
        </div>

        <div className="space-y-3">
          {b.blocks.map((bl, bi) => (
            <div key={bi} className="border rounded-md p-3 space-y-3">
              {/* Block header */}
              <div className="flex items-center gap-2 flex-wrap">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] text-muted-foreground">
                    Block Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={bl.name}
                    onChange={(e) => {
                      patchBlock(bi, { name: e.target.value });
                      clearError(`block-${bi}-name`);
                    }}
                    className={`h-8 w-36 ${errors[`block-${bi}-name`] ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                    placeholder="Block name"
                  />
                  <FieldError message={errors[`block-${bi}-name`]} />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] text-muted-foreground">
                    Block Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={bl.code}
                    onChange={(e) => {
                      patchBlock(bi, { code: e.target.value });
                      clearError(`block-${bi}-code`);
                    }}
                    className={`h-8 w-28 ${errors[`block-${bi}-code`] ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                    placeholder="Block code"
                  />
                  <FieldError message={errors[`block-${bi}-code`]} />
                </div>
                <Select
                  value={bl.status}
                  onValueChange={(v) => patchBlock(bi, { status: v })}
                >
                  <SelectTrigger className="h-8 w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  {bl.floors.length} floors ·{" "}
                  {bl.floors.reduce((s, f) => s + f.rooms.length, 0)} rooms
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setB((x) => ({
                      ...x,
                      blocks: x.blocks.filter((_, i) => i !== bi),
                    }))
                  }
                  disabled={b.blocks.length === 1}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>

              {/* Floors */}
              {bl.floors.map((f, fi) => (
                <div key={fi} className="ml-3 border-l-2 pl-3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="flex flex-col gap-1">
                      <Label className="text-[10px] text-muted-foreground">
                        Floor Name <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={f.name}
                        onValueChange={(v) => {
                          patchFloor(bi, fi, { name: v });
                          clearError(`floor-${bi}-${fi}-name`);
                        }}
                      >
                        <SelectTrigger
                          className={`h-8 w-44 ${errors[`floor-${bi}-${fi}-name`] ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FLOOR_NAMES.map((n) => (
                            <SelectItem key={n} value={n}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError message={errors[`floor-${bi}-${fi}-name`]} />
                    </div>
                    <Select
                      value={f.status}
                      onValueChange={(v) => patchFloor(bi, fi, { status: v })}
                    >
                      <SelectTrigger className="h-8 w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-[11px] text-muted-foreground">
                      {f.rooms.length} rooms
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto h-7"
                      onClick={() =>
                        patchBlock(bi, {
                          floors: bl.floors.filter((_, i) => i !== fi),
                        })
                      }
                      disabled={bl.floors.length === 1}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>

                  {/* Room column headers */}
                  <div className="grid grid-cols-12 gap-1.5 text-[10px] text-muted-foreground px-1">
                    <div className="col-span-2">
                      Room No. <span className="text-destructive">*</span>
                    </div>
                    <div className="col-span-2">
                      Name <span className="text-destructive">*</span>
                    </div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-1">
                      Cap. <span className="text-destructive">*</span>
                    </div>
                    <div className="col-span-3">Facilities</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1" />
                  </div>

                  {/* Rooms */}
                  {f.rooms.map((r, ri) => {
                    const key = `room-${bi}-${fi}-${ri}`;
                    return (
                    <div key={ri} className="space-y-1">
                    <div
                      className="grid grid-cols-12 gap-1.5 items-start"
                    >
                      <div className="col-span-2">
                        <Input
                          className={`h-8 ${errors[`${key}-no`] ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                          value={r.no}
                          onChange={(e) => {
                            patchRoom(bi, fi, ri, { no: e.target.value });
                            clearError(`${key}-no`);
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          className={`h-8 ${errors[`${key}-name`] ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                          value={r.name}
                          placeholder="Room name"
                          onChange={(e) => {
                            patchRoom(bi, fi, ri, { name: e.target.value });
                            clearError(`${key}-name`);
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Select
                          value={r.type}
                          onValueChange={(v) =>
                            patchRoom(bi, fi, ri, { type: v })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROOM_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Input
                          className={`h-8 ${errors[`${key}-capacity`] ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                          type="number"
                          value={r.capacity}
                          onChange={(e) => {
                            patchRoom(bi, fi, ri, {
                              capacity: e.target.value === "" ? "" : Number(e.target.value) || 0,
                            });
                            clearError(`${key}-capacity`);
                          }}
                        />
                      </div>
                      {/* Facilities mini-picker */}
                      <div className="col-span-3">
                        <Select
                          onValueChange={(v) =>
                            toggleRoomFacility(bi, fi, ri, v)
                          }
                        >
                          <SelectTrigger className="h-8 text-[10px]">
                            <span className="truncate">
                              {r.facilities.length === 0
                                ? "Add facilities…"
                                : r.facilities.slice(0, 2).join(", ") +
                                  (r.facilities.length > 2
                                    ? ` +${r.facilities.length - 2}`
                                    : "")}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            {FACILITIES_LIST.map((fac) => (
                              <SelectItem key={fac} value={fac}>
                                <span className="flex items-center gap-2">
                                  <span
                                    className={`w-2 h-2 rounded-full ${r.facilities.includes(fac) ? "bg-primary" : "bg-muted-foreground/30"}`}
                                  />
                                  {fac}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Select
                          value={r.status}
                          onValueChange={(v) =>
                            patchRoom(bi, fi, ri, { status: v })
                          }
                        >
                          <SelectTrigger className="h-8 text-[10px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 col-span-1"
                        onClick={() =>
                          patchFloor(bi, fi, {
                            rooms: f.rooms.filter((_, i) => i !== ri),
                          })
                        }
                        disabled={f.rooms.length === 1}
                      >
                        <X className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                    {(errors[`${key}-no`] || errors[`${key}-name`] || errors[`${key}-capacity`]) && (
                      <div className="grid grid-cols-12 gap-1.5">
                        <div className="col-span-2">
                          <FieldError message={errors[`${key}-no`]} />
                        </div>
                        <div className="col-span-2">
                          <FieldError message={errors[`${key}-name`]} />
                        </div>
                        <div className="col-span-2" />
                        <div className="col-span-1">
                          <FieldError message={errors[`${key}-capacity`]} />
                        </div>
                      </div>
                    )}
                    </div>
                    );
                  })}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7"
                    onClick={() =>
                      patchFloor(bi, fi, {
                        rooms: [...f.rooms, emptyRoom(f.rooms.length + 1)],
                      })
                    }
                  >
                    <Plus className="h-3 w-3" />
                    Add Room
                  </Button>
                </div>
              ))}

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  patchBlock(bi, { floors: [...bl.floors, emptyFloor()] })
                }
              >
                <Plus className="h-3 w-3" />
                Add Floor
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() =>
              setB((x) => ({
                ...x,
                blocks: [
                  ...x.blocks,
                  {
                    ...emptyBlock(),
                    name: `Block ${String.fromCharCode(65 + x.blocks.length)}`,
                  },
                ],
              }))
            }
          >
            <Plus className="h-4 w-4" />
            Add Block
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button className="gradient-primary border-0" onClick={submit}>
            Create Building
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}