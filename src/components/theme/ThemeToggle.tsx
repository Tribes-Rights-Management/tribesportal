import { Monitor, Sun, Moon, Check } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const themes = [
  { value: "system" as const, label: "System", icon: Monitor },
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "h-7 w-7 inline-flex items-center justify-center rounded-[10px]",
            "text-muted-foreground hover:text-foreground",
            "bg-transparent hover:bg-muted/50 hover:border hover:border-border/60",
            "transition-all duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-1"
          )}
          aria-label="Toggle theme"
        >
          <CurrentIcon size={18} strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-xl" sideOffset={8}>
        {themes.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="text-[13px] py-2 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </span>
            {theme === value && (
              <Check size={14} strokeWidth={2} className="text-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
