import { useTheme } from "@/providers/ThemeProvider";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Premium theme toggle - Apple-grade styling
 * 32px button target with 18px icons, strokeWidth 1.5
 * Ring only on focus-visible (keyboard), never persistent
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="h-8 w-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Moon size={18} strokeWidth={1.5} />
          ) : (
            <Sun size={18} strokeWidth={1.5} />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36" sideOffset={8}>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center justify-between text-[13px] cursor-pointer gap-2",
            theme === "system" && "bg-muted"
          )}
        >
          <span className="flex items-center gap-2">
            <Monitor size={16} strokeWidth={1.5} />
            System
          </span>
          {theme === "system" && <Check size={14} strokeWidth={1.5} />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center justify-between text-[13px] cursor-pointer gap-2",
            theme === "light" && "bg-muted"
          )}
        >
          <span className="flex items-center gap-2">
            <Sun size={16} strokeWidth={1.5} />
            Light
          </span>
          {theme === "light" && <Check size={14} strokeWidth={1.5} />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center justify-between text-[13px] cursor-pointer gap-2",
            theme === "dark" && "bg-muted"
          )}
        >
          <span className="flex items-center gap-2">
            <Moon size={16} strokeWidth={1.5} />
            Dark
          </span>
          {theme === "dark" && <Check size={14} strokeWidth={1.5} />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}