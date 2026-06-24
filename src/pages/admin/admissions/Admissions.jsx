// import { useNavigate } from "react-router-dom";
// import { PageContainer, PageHeader } from "../../../components/page-shell";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "../../../components/ui/card";
// import { Button } from "../../../components/ui/button";
// import { Badge } from "../../../components/ui/badge";
// import { Input } from "../../../components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "../../../components/ui/select";
// import { Checkbox } from "../../../components/ui/checkbox";
// import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
// import {
//   Tabs,
//   TabsList,
//   TabsTrigger,
//   TabsContent,
// } from "../../../components/ui/tabs";
// import {
//   Plus,
//   Search,
//   Phone,
//   Mail,
//   ArrowRight,
//   Archive,
//   Trash2,
//   Send,
//   TrendingUp,
// } from "lucide-react";
// import { useMemo, useState } from "react";
// import { toast } from "sonner";
// import { NewInquiryDialog } from "../../../components/new-inquiry-dialog";
// import { useInquiries, inquiriesApi, ADM_STAGES } from "../../../lib/store";
// const stageColor = {
//   Inquiry: "border-l-muted-foreground",
//   Lead: "border-l-info",
//   Counseling: "border-l-chart-3",
//   "Admission Test": "border-l-warning",
//   "Doc Verification": "border-l-accent",
//   "Fee Payment": "border-l-chart-5",
//   Enrolled: "border-l-success",
// };
// const COUNSELORS = ["Sneha K.", "Rohit M.", "Priya S.", "Vikram T."];
// const SOURCES = ["Walk-in", "Website", "Referral", "Ad Campaign", "Phone"];
// export default function Admissions() {
//   const navigate = useNavigate();
//   const all = useInquiries();
//   const [q, setQ] = useState("");
//   const [src, setSrc] = useState("all");
//   const [counselor, setCounselor] = useState("all");
//   const [selected, setSelected] = useState(new Set());
//   const [dragId, setDragId] = useState(null);
//   const [tab, setTab] = useState("pipeline");
//   const cards = useMemo(
//     () =>
//       all.filter((c) => {
//         if (c.archived) return false;
//         if (
//           q &&
//           !(
//             c.name.toLowerCase().includes(q.toLowerCase()) ||
//             c.parent.toLowerCase().includes(q.toLowerCase()) ||
//             c.phone.includes(q)
//           )
//         )
//           return false;
//         if (src !== "all" && c.source !== src) return false;
//         if (counselor !== "all" && c.counselor !== counselor) return false;
//         return true;
//       }),
//     [all, q, src, counselor],
//   );
//   const toggleSel = (id) =>
//     setSelected((p) => {
//       const n = new Set(p);
//       if (n.has(id)) n.delete(id);
//       else n.add(id);
//       return n;
//     });
//   const onDrop = (stage) => {
//     if (!dragId) return;
//     inquiriesApi.moveStage(dragId, stage);
//     toast.success(`Moved to ${stage}`);
//     setDragId(null);
//   };
//   const bulkMove = (stage) => {
//     selected.forEach((id) => inquiriesApi.moveStage(id, stage));
//     toast.success(`${selected.size} moved to ${stage}`);
//     setSelected(new Set());
//   };
//   // Conversion analytics
//   const counts = ADM_STAGES.map((s) => ({
//     stage: s,
//     n: all.filter((c) => c.stage === s && !c.archived).length,
//   }));
//   const total = counts.reduce((a, c) => a + c.n, 0);
//   const enrolled = counts.find((c) => c.stage === "Enrolled")?.n || 0;
//   const convRate = total ? Math.round((enrolled / total) * 100) : 0;
//   const bySource = SOURCES.map((s) => ({
//     source: s,
//     n: all.filter((c) => c.source === s).length,
//   }));
//   return (
//     <PageContainer>
//       <PageHeader
//         title="Admissions "
//         actions={
//           <NewInquiryDialog
//             trigger={
//               <Button size="sm" className="gradient-primary border-0">
//                 <Plus className="h-4 w-4" />
//                 New Inquiry
//               </Button>
//             }
//             onCreate={(d) => {
//               const id = inquiriesApi.add({
//                 ...d,
//                 name: d.name,
//                 class: d.class,
//                 parent: d.parent,
//                 phone: d.phone,
//                 email: d.email || "—",
//                 source: d.source,
//                 stage: "Inquiry",
//                 counselor: COUNSELORS[0],
//               });
//               toast.success(`${d.name} added · ${id}`);
//             }}
//           />
//         }
//       />

//       <Tabs value={tab} onValueChange={setTab} className="mb-4">
//         <TabsList>
//           <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
//           <TabsTrigger value="analytics">Conversion Analytics</TabsTrigger>
//         </TabsList>

//         <TabsContent value="pipeline" className="mt-4 space-y-4">
//           <div className="flex flex-wrap items-center gap-2">
//             <div className="relative">
//               <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
//               <Input
//                 value={q}
//                 onChange={(e) => setQ(e.target.value)}
//                 placeholder="Search name / parent / phone…"
//                 className="pl-8 h-9 w-64"
//               />
//             </div>
//             <Select value={src} onValueChange={setSrc}>
//               <SelectTrigger className="h-9 w-40">
//                 <SelectValue placeholder="Source" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All sources</SelectItem>
//                 {SOURCES.map((s) => (
//                   <SelectItem key={s} value={s}>
//                     {s}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select value={counselor} onValueChange={setCounselor}>
//               <SelectTrigger className="h-9 w-40">
//                 <SelectValue placeholder="Counselor" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All counselors</SelectItem>
//                 {COUNSELORS.map((c) => (
//                   <SelectItem key={c} value={c}>
//                     {c}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             {selected.size > 0 && (
//               <div className="flex items-center gap-2 ml-auto bg-muted/50 px-3 py-1.5 rounded-md border">
//                 <span className="text-xs font-medium">
//                   {selected.size} selected
//                 </span>
//                 <Select onValueChange={(v) => bulkMove(v)}>
//                   <SelectTrigger className="h-7 w-36 text-xs">
//                     <SelectValue placeholder="Move to…" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {ADM_STAGES.map((s) => (
//                       <SelectItem key={s} value={s}>
//                         {s}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   className="h-7 text-xs"
//                   onClick={() => {
//                     toast.success(`Bulk SMS to ${selected.size}`);
//                     setSelected(new Set());
//                   }}
//                 >
//                   <Send className="h-3 w-3" />
//                   SMS
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   className="h-7 text-xs"
//                   onClick={() => {
//                     inquiriesApi.bulkArchive(Array.from(selected));
//                     toast.success("Archived");
//                     setSelected(new Set());
//                   }}
//                 >
//                   <Archive className="h-3 w-3" />
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   className="h-7 text-xs text-destructive"
//                   onClick={() => {
//                     inquiriesApi.bulkRemove(Array.from(selected));
//                     toast.success("Deleted");
//                     setSelected(new Set());
//                   }}
//                 >
//                   <Trash2 className="h-3 w-3" />
//                 </Button>
//               </div>
//             )}
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
//             {ADM_STAGES.map((s) => {
//               const n = cards.filter((c) => c.stage === s).length;
//               return (
//                 <Card key={s} className="border-border/60">
//                   <CardContent className="p-3">
//                     <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
//                       {s}
//                     </div>
//                     <div className="text-2xl font-display font-semibold mt-1">
//                       {n}
//                     </div>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             {ADM_STAGES.map((s) => {
//               const items = cards.filter((c) => c.stage === s);
//               return (
//                 <Card
//                   key={s}
//                   className="border-border/60 bg-muted/20"
//                   onDragOver={(e) => {
//                     e.preventDefault();
//                   }}
//                   onDrop={() => onDrop(s)}
//                 >
//                   <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
//                     <CardTitle className="text-xs font-display uppercase tracking-wider text-muted-foreground">
//                       {s}
//                     </CardTitle>
//                     <Badge variant="outline" className="text-[10px]">
//                       {items.length}
//                     </Badge>
//                   </CardHeader>
//                   <CardContent className="space-y-2 max-h-[560px] overflow-y-auto p-2">
//                     {items.length === 0 && (
//                       <div className="text-xs text-muted-foreground text-center py-6">
//                         Drop here
//                       </div>
//                     )}
//                     {items.map((c) => {
//                       const stageIdx = ADM_STAGES.indexOf(c.stage);
//                       const next = ADM_STAGES[stageIdx + 1];
//                       return (
//                         <div
//                           key={c.id}
//                           draggable
//                           onDragStart={() => setDragId(c.id)}
//                           className={`bg-card border border-l-4 ${stageColor[c.stage]} rounded-md p-3 hover:shadow-md transition cursor-grab active:cursor-grabbing ${selected.has(c.id) ? "ring-2 ring-primary" : ""}`}
//                           onClick={(e) => {
//                             if (e.target.closest("[data-stop]")) return;
//                             navigate(`/admin/admissions/${c.id}`);
//                           }}
//                         >
//                           <div className="flex items-start gap-2.5">
//                             <div data-stop onClick={(e) => e.stopPropagation()}>
//                               <Checkbox
//                                 checked={selected.has(c.id)}
//                                 onCheckedChange={() => toggleSel(c.id)}
//                               />
//                             </div>
//                             <Avatar className="h-8 w-8 shrink-0">
//                               <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
//                                 {c.name
//                                   .split(" ")
//                                   .map((n) => n[0])
//                                   .join("")}
//                               </AvatarFallback>
//                             </Avatar>
//                             <div className="min-w-0 flex-1">
//                               <div className="text-sm font-medium truncate">
//                                 {c.name}
//                               </div>
//                               <div className="text-[10px] text-muted-foreground">
//                                 Class {c.class} · {c.source}
//                               </div>
//                             </div>
//                           </div>
//                           <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
//                             <div className="flex items-center gap-1.5">
//                               <Phone className="h-3 w-3" />
//                               {c.phone}
//                             </div>
//                             <div className="flex items-center gap-1.5 truncate">
//                               <Mail className="h-3 w-3 shrink-0" />
//                               <span className="truncate">{c.email}</span>
//                             </div>
//                             {c.counselor && (
//                               <div className="text-[10px]">
//                                 👤 {c.counselor}
//                               </div>
//                             )}
//                           </div>
//                           <div
//                             className="flex items-center justify-between mt-2.5 pt-2 border-t"
//                             data-stop
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <span className="text-[10px] text-muted-foreground">
//                               {new Date(c.updatedAt).toLocaleDateString()}
//                             </span>
//                             {next && (
//                               <Button
//                                 size="sm"
//                                 variant="ghost"
//                                 className="h-6 px-2 text-[10px]"
//                                 onClick={() => {
//                                   inquiriesApi.moveStage(c.id, next);
//                                   toast.success(`→ ${next}`);
//                                 }}
//                               >
//                                 {next.split(" ")[0]}
//                                 <ArrowRight className="h-3 w-3" />
//                               </Button>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//         </TabsContent>

//         <TabsContent value="analytics" className="mt-4">
//           <div className="grid md:grid-cols-3 gap-4 mb-4">
//             <Card>
//               <CardContent className="p-4">
//                 <div className="text-xs text-muted-foreground">
//                   Total Inquiries
//                 </div>
//                 <div className="text-3xl font-display font-semibold mt-1">
//                   {total}
//                 </div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="p-4">
//                 <div className="text-xs text-muted-foreground">Enrolled</div>
//                 <div className="text-3xl font-display font-semibold mt-1 text-success">
//                   {enrolled}
//                 </div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="p-4">
//                 <div className="text-xs text-muted-foreground flex items-center gap-1">
//                   <TrendingUp className="h-3 w-3" />
//                   Conversion Rate
//                 </div>
//                 <div className="text-3xl font-display font-semibold mt-1">
//                   {convRate}%
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//           <Card className="mb-4">
//             <CardHeader>
//               <CardTitle className="text-base">Stage Funnel</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-2">
//               {counts.map((c) => (
//                 <div key={c.stage} className="flex items-center gap-3">
//                   <div className="w-32 text-xs text-muted-foreground">
//                     {c.stage}
//                   </div>
//                   <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
//                     <div
//                       className="h-full bg-gradient-to-r from-primary to-accent"
//                       style={{ width: `${total ? (c.n / total) * 100 : 0}%` }}
//                     />
//                   </div>
//                   <div className="w-12 text-right text-sm font-medium">
//                     {c.n}
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-base">By Source</CardTitle>
//             </CardHeader>
//             <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
//               {bySource.map((s) => (
//                 <div key={s.source} className="p-3 border rounded-md">
//                   <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
//                     {s.source}
//                   </div>
//                   <div className="text-xl font-display font-semibold mt-1">
//                     {s.n}
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </PageContainer>
//   );
// }




import { useEffect, useMemo, useState } from "react";

import {
  getAdmissionPipeline,
  getAdmissionAnalytics,
  getAdmissionSources,
  getAdmissionCounselors,
  getStages,
  getAllAdmissions,
  enrollStudent
} from "../../../api/admissions";



import { useNavigate } from "react-router-dom";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import {
  Plus,
  Search,
  Phone,
  Mail,
  ArrowRight,
  Archive,
  Trash2,
  Send,
  TrendingUp,
} from "lucide-react";

import { toast } from "sonner";
import { NewInquiryDialog } from "../../../components/new-inquiry-dialog";

const stageColor = {
  Inquiry: "border-l-muted-foreground",
  Lead: "border-l-info",
  Counseling: "border-l-chart-3",
  "Admission Test": "border-l-warning",
  "Doc Verification": "border-l-accent",
  "Fee Payment": "border-l-chart-5",
  Enrolled: "border-l-success",
};
// const COUNSELORS = ["Sneha K.", "Rohit M.", "Priya S.", "Vikram T."];
// const SOURCES = ["Walk-in", "Website", "Referral", "Ad Campaign", "Phone"];
export default function Admissions() {
  const navigate = useNavigate();
  // const all = useInquiries();
  const [pipelineData, setPipelineData] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [sources, setSources] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [stages, setStages] = useState([]);
  const [allAdmissions, setAllAdmissions] = useState([]);
    const [q, setQ] = useState("");
  const [src, setSrc] = useState("all");
  const [counselor, setCounselor] = useState("all");
  const [selected, setSelected] = useState(new Set());
  const [dragItem, setDragItem] = useState(null);
  const [tab, setTab] = useState("pipeline");
  const cards = useMemo(() => {
  return allAdmissions.filter((c) => {
    if (
      q &&
      !(
        c.full_name?.toLowerCase().includes(q.toLowerCase()) ||
        c.primary_phone?.includes(q)
      )
    )
      return false;

    if (src !== "all" && c.source_name !== src)
      return false;

    if (
      counselor !== "all" &&
      c.counselor_name !== counselor
    )
      return false;

    return true;
  });
}, [allAdmissions, q, src, counselor]);
  useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    const [
      pipelineRes,
      analyticsRes,
      sourceRes,
      counselorRes,
      stageRes,
      allRes,
    ] = await Promise.all([
      getAdmissionPipeline(),
      getAdmissionAnalytics(),
      getAdmissionSources(),
      getAdmissionCounselors(),
      getStages(),
      getAllAdmissions(),
    ]);

    setPipelineData(pipelineRes.data);

    setAnalytics(analyticsRes.data);

    setSources(sourceRes.data);

    setCounselors(counselorRes.data);

    setStages(stageRes.data.data);
    setAllAdmissions(allRes.data);
  } catch (err) {
    console.log(err);
  }
};
  
  const toggleSel = (id) =>
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const onDrop = async (stageName) => {
      console.log("Dropped:", stageName);
  console.log("Student:", dragItem);

  if (!dragItem) return;

  try {

    const nextStage = stages.find(
      (s) => s.stage_name === stageName
    );

    if (!nextStage) return;

    const res = await enrollStudent(
      dragItem.admission_uuid,
      nextStage.id
    );

    toast.success(res.data.message);

    setDragItem(null);

    loadData();

  } catch (err) {

    toast.error(
      err.response?.data?.detail ||
      "Failed to move stage"
    );
  }
};
  const bulkMove = async (stageName) => {

  try {

    const nextStage = stages.find(
      s => s.stage_name === stageName
    );

    if (!nextStage) return;

    for (const id of selected) {

      const student = allAdmissions.find(
        a => a.id === id
      );

      if (student) {

        await enrollStudent(
          student.admission_uuid,
          nextStage.id
        );

      }
    }

    toast.success(
      `${selected.size} moved successfully`
    );

    setSelected(new Set());

    loadData();

  }
  catch (err) {

    toast.error(
      "Failed to move stage"
    );

  }
};
  // Conversion analytics
// Conversion analytics
const counts = pipelineData.map((stage) => ({
  stage: stage.stage_name,
  n: stage.count,
}));

const total = analytics.total || 0;

const enrolled = analytics.enrolled || 0;

const convRate = analytics.conversion_rate || 0;

const bySource = analytics.by_source || [];
  return (
    <PageContainer>
      <PageHeader
        title="Admissions "
        actions={
          <NewInquiryDialog
            trigger={
              <Button size="sm" className="gradient-primary border-0">
                <Plus className="h-4 w-4" />
                New Inquiry
              </Button>
            }
            onCreate={(d) => {
              const id = inquiriesApi.add({
                ...d,
                name: d.name,
                class: d.class,
                parent: d.parent,
                phone: d.phone,
                email: d.email || "—",
                source: d.source,
                stage: "Inquiry",
                
              });
              toast.success(`${d.name} added · ${id}`);
            }}
          />
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="analytics">Conversion Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name / parent / phone…"
                className="pl-8 h-9 w-64"
              />
            </div>
            <Select value={src} onValueChange={setSrc}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {sources.map((s) => (
                <SelectItem key={s.id} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
            <Select value={counselor} onValueChange={setCounselor}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Counselor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All counselors</SelectItem>
                {counselors.map((c) => (
                  <SelectItem
                    key={c.id}
                    value={c.counselor_name}
                  >
                    {c.counselor_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected.size > 0 && (
              <div className="flex items-center gap-2 ml-auto bg-muted/50 px-3 py-1.5 rounded-md border">
                <span className="text-xs font-medium">
                  {selected.size} selected
                </span>
                <Select onValueChange={(v) => bulkMove(v)}>
                  <SelectTrigger className="h-7 w-36 text-xs">
                    <SelectValue placeholder="Move to…" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* {ADM_STAGES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))} */}
                    {stages.map((s) => (
                      <SelectItem
                        key={s.id}
                        value={s.stage_name}
                      >
                        {s.stage_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    toast.success(`Bulk SMS to ${selected.size}`);
                    setSelected(new Set());
                  }}
                >
                  <Send className="h-3 w-3" />
                  SMS
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    inquiriesApi.bulkArchive(Array.from(selected));
                    toast.success("Archived");
                    setSelected(new Set());
                  }}
                >
                  <Archive className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-destructive"
                  onClick={() => {
                    inquiriesApi.bulkRemove(Array.from(selected));
                    toast.success("Deleted");
                    setSelected(new Set());
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* {ADM_STAGES.map((s) => { */}
           {pipelineData.map((stage) => (
              <Card
                key={stage.stage_name}
                className="border-border/60"
              >
                <CardContent className="p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {stage.stage_name}
                  </div>

                  <div className="text-2xl font-display font-semibold mt-1">
                    {stage.count}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* {ADM_STAGES.map((s) => { */}
            {pipelineData.map((stage) => {
              // const items = cards.filter((c) => c.stage === s);
              const items = cards.filter(
  (c) => c.stage_name === stage.stage_name
);
              return (
                <Card
                  key={stage.stage_name}
                  className="border-border/60 bg-muted/20"
            
                >
                  <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-display uppercase tracking-wider text-muted-foreground">
                      {stage.stage_name}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {
                          cards.filter(
                            c => c.stage_name === stage.stage_name
                          ).length
                          }
                    </Badge>
                  </CardHeader>
                  <CardContent
  className="space-y-2 max-h-[560px] overflow-y-auto p-2"
  onDragOver={(e) => e.preventDefault()}
  onDrop={() => onDrop(stage.stage_name)}
>
                    {items.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-6">
                        Drop here
                      </div>
                    )}
                    {items.map((c) => {
                      const stageIdx = stages.findIndex(
                        (s) => s.stage_name === stage.stage_name
                      );

                      const next =
                        stages[stageIdx + 1]?.stage_name;
                      return (
                        <div
                          key={c.id}
                          draggable={true}
                          onDragStart={() => setDragItem(c)}
                          className={`bg-card border border-l-4 ${stageColor[stage.stage_name]} rounded-md p-3 hover:shadow-md transition cursor-grab active:cursor-grabbing ${selected.has(c.id) ? "ring-2 ring-primary" : ""}`}
                          onClick={(e) => {
                            if (e.target.closest("[data-stop]")) return;
                            navigate(`/admin/admissions/${c.admission_uuid}`)
                          }}
                        >
                          <div className="flex items-start gap-2.5">
                            <div data-stop onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selected.has(c.id)}
                                onCheckedChange={() => toggleSel(c.id)}
                              />
                            </div>
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {c.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">
                                {c.full_name}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                Class {c.class_name} · {c.source_name}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3" />
                              {c.primary_phone}
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate">{c.email}</span>
                            </div>
                            {c.counselor_name && (
                              <div className="text-[10px]">
                                👤 {c.counselor_name}
                              </div>
                            )}
                          </div>
                          <div
                            className="flex items-center justify-between mt-2.5 pt-2 border-t"
                            data-stop
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString()}
                            </span>
                            {next && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-[10px]"
                                onClick={async () => {
                                      try {

                                        const nextStage = stages[stageIdx + 1];

                                        if (!nextStage) return;

                                        const res = await enrollStudent(
                                          c.admission_uuid,
                                          nextStage.id
                                        );

                                        toast.success(res.data.message);

                                        loadData();

                                      } catch (err) {

                                        toast.error(
                                          err.response?.data?.detail ||
                                          "Failed to move stage"
                                        );

                                      }
                                    }}
                              >
                                {next.split(" ")[0]}
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">
                  Total Inquiries
                </div>
                <div className="text-3xl font-display font-semibold mt-1">
                  {total}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Enrolled</div>
                <div className="text-3xl font-display font-semibold mt-1 text-success">
                  {enrolled}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Conversion Rate
                </div>
                <div className="text-3xl font-display font-semibold mt-1">
                  {convRate}%
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Stage Funnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {counts.map((c) => (
                <div key={c.stage} className="flex items-center gap-3">
                  <div className="w-32 text-xs text-muted-foreground">
                    {c.stage}
                  </div>

                  <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      style={{
                        width: `${total ? (c.n / total) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  <div className="w-12 text-right text-sm font-medium">
                    {c.n}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">By Source</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {bySource.map((s) => (
                  <div key={s.source} className="p-3 border rounded-md">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.source}
                    </div>

                    <div className="text-xl font-display font-semibold mt-1">
                      {s.count}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}


