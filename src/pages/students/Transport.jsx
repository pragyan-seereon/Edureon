import { PageContainer, PageHeader } from "../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Bus, MapPin, Phone, Route as RouteIcon } from "lucide-react";

// --- Static demo data (swap for real campus/student-ctx data as needed) ---

const student = {
  id: "stu-101",
  name: "Aarav Sharma",
};

const routes = [
  {
    id: "RT-01",
    name: "Route 1 — Sector 12 to School",
    bus: "OD-05-AB-1234",
    driver: "Ramesh Yadav",
    conductor: "Suresh Nayak",
    status: "Running",
    stops: 8,
    eta: "35 min",
    contact: "+91 98100 11221",
    stopList: [
      { name: "Sector 12 Market", time: "6:45 AM" },
      { name: "Green Park Colony", time: "6:55 AM" },
      { name: "Civil Lines Crossing", time: "7:05 AM" },
      { name: "Old Bus Stand", time: "7:15 AM" },
      { name: "Edureon School Gate", time: "7:35 AM" },
    ],
  },
  {
    id: "RT-02",
    name: "Route 2 — Riverside to School",
    bus: "OD-05-AB-5678",
    driver: "Manoj Behera",
    conductor: "—",
    status: "Delayed",
    stops: 6,
    eta: "40 min",
    contact: "+91 98100 33445",
    stopList: [
      { name: "Riverside Colony", time: "6:50 AM" },
      { name: "Temple Square", time: "7:00 AM" },
      { name: "New Market Chowk", time: "7:15 AM" },
      { name: "Edureon School Gate", time: "7:40 AM" },
    ],
  },
  {
    id: "RT-03",
    name: "Route 3 — Industrial Area to School",
    bus: "OD-05-AB-9012",
    driver: "Bikram Sahoo",
    conductor: "Ashok Mallik",
    status: "Running",
    stops: 5,
    eta: "25 min",
    contact: "+91 98100 55667",
    stopList: [
      { name: "Industrial Estate Gate 2", time: "7:00 AM" },
      { name: "Workers Colony", time: "7:08 AM" },
      { name: "Edureon School Gate", time: "7:25 AM" },
    ],
  },
];

const transportRoster = {
  "RT-01": { students: ["stu-101", "stu-102"] },
  "RT-02": { students: ["stu-103"] },
  "RT-03": { students: ["stu-104"] },
};

export default function StudentTransport() {
  const routeId = Object.keys(transportRoster).find(
    (id) => student?.id && transportRoster[id].students.includes(student.id)
  );
  const assigned = routes.find((route) => route.id === routeId) ?? routes[0];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Student Portal"
        title="Bus Routes"
        description="Your assigned route, stop timings and full campus route directory."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Bus className="h-4 w-4" />
              Assigned Route
            </CardTitle>
            <CardDescription>{assigned.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Mini label="Bus" value={assigned.bus} />
              <Mini label="Driver" value={assigned.driver} />
              <Mini label="Conductor" value={assigned.conductor ?? "—"} />
              <Mini label="Status" value={assigned.status} />
            </div>
            <div className="space-y-2">
              {(assigned.stopList ?? []).map((stop, index) => (
                <div
                  key={`${stop.name}-${index}`}
                  className="flex items-center gap-3 rounded-md border p-3"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{stop.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Scheduled pickup · {stop.time}
                    </div>
                  </div>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Route Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              {assigned.contact ?? "+91 98100 11221"}
            </div>
            <div className="flex items-center gap-2">
              <RouteIcon className="h-4 w-4 text-primary" />
              {assigned.stops} stops · {assigned.eta}
            </div>
            <Badge
              variant={
                assigned.status === "Running"
                  ? "default"
                  : assigned.status === "Delayed"
                  ? "destructive"
                  : "secondary"
              }
            >
              {assigned.status}
            </Badge>
          </CardContent>
        </Card>
      </div>
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">All Bus Routes</CardTitle>
          <CardDescription>View-only campus route directory</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Bus</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Stops</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">
                    <div>{route.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {route.id}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{route.bus}</TableCell>
                  <TableCell className="text-sm">{route.driver}</TableCell>
                  <TableCell>{route.stops}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{route.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold truncate">{value}</div>
    </div>
  );
}