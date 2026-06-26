import { SidebarTrigger } from "./ui/sidebar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
// import { Badge } from "./ui/badge";
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "./ui/select";
// eslint-disable-next-line no-unused-vars
import { Bell, Search, Moon, Sun, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { UserMenu } from "./user-menu";

export function Topbar() {
  const [dark, setDark] = useState(false);
  const [academicYear, setAcademicYear] = useState("2026-2027");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

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
       <Select value={academicYear} onValueChange={setAcademicYear}>
  <SelectTrigger className="w-[170px] h-9 hidden md:flex">
    <SelectValue />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="2026-2027">AY 2026-2027</SelectItem>
    <SelectItem value="2025-2026">AY 2025-2026</SelectItem>
    <SelectItem value="2024-2025">AY 2024-2025</SelectItem>
    <SelectItem value="2023-2024">AY 2023-2024</SelectItem>
    <SelectItem value="2022-2023">AY 2022-2023</SelectItem>
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
