import { SidebarTrigger } from "./ui/sidebar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
// import { Badge } from "./ui/badge";
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "./ui/select";
// eslint-disable-next-line no-unused-vars
import { Bell, Search, Moon, Sun, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { UserMenu } from "./user-menu";
import useSessionStore from "../store/sessionStore";
export function Topbar() {
  const [dark, setDark] = useState(false);
const sessionYear = useSessionStore((state) => state.sessionYear);
const setSessionYear = useSessionStore((state) => state.setSessionYear);

const currentYear = new Date().getFullYear();

const academicYears = Array.from({ length: 6 }, (_, index) => {
  const start = currentYear + 2 - index; // 2 future years
  const end = String(start + 1).slice(-2);

  return {
    value: `${start}-${end}`,
    label: `AY ${start}-${end}`,
  };
});
// useEffect(() => {
//   if (!sessionYear) {
//     setSessionYear(academicYears[0].value);
//   }
// }, [sessionYear, setSessionYear]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

useEffect(() => {
  console.log("Current Active Session:", sessionYear);
}, [sessionYear]);

  return (
    <header className="sticky top-0 z-30 h-14 border-b bg-background/80 backdrop-blur-md flex items-center gap-2 px-3 md:px-4">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="hidden md:flex relative flex-1 max-w-md ml-2">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search students, employees, classes..."
          className="pl-9 h-9 bg-muted/40 border-border/60"
        />
        <kbd className="hidden lg:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-background border rounded">
          Ctrl K
        </kbd>
      </div>
      <div className="flex-1 md:hidden" />
      <div className="flex items-center gap-1.5 ml-auto ">
 <Select
  value={sessionYear}
  onValueChange={setSessionYear}
>
  <SelectTrigger className="w-[170px] h-9 hidden md:flex">
    <SelectValue />
  </SelectTrigger>

  <SelectContent>
    {academicYears.map((year) => (
      <SelectItem key={year.value} value={year.value}>
        {year.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setDark((d) => !d)}
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        {/* <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </Button> */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}
