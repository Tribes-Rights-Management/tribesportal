/**
 * ThemeToggle — Light/Dark Mode Toggle Component
 * 
 * Provides UI controls for switching between light and dark themes.
 * Can be used as:
 * - A dropdown menu item (for avatar menu)
 * - A standalone toggle button (for settings)
 */

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
    className?: string;
}

/**
 * Compact icon toggle for headers - shows sun/moon icon
 */
export function ThemeToggleIcon({ className }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();

  return (
        <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={cn(
                          "h-9 w-9 rounded-full",
                          "text-muted-foreground hover:text-foreground",
                          "transition-colors duration-200",
                          className
                        )}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
          {theme === 'dark' ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
        </Button>Button>
      );
}

/**
 * Menu item for dropdowns - shows current state and allows toggle
  */
export function ThemeToggleMenuItem({ className }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();
  
    return (
          <button
                  onClick={toggleTheme}
                  className={cn(
                            "flex w-full items-center gap-3 px-3 py-2.5 text-sm",
                            "text-left rounded-md",
                            "hover:bg-accent transition-colors duration-200",
                            className
                          )}
                >
            {theme === 'dark' ? (
                          <Sun className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Moon className="h-4 w-4 text-muted-foreground" />
                        )}
                <span className="flex-1">
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </span>span>
          </button>button>
        );
}

/**
 * Settings row style toggle - for preferences pages
  */
export function ThemeToggleRow({ className }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();
  
    return (
          <div className={cn("flex items-center justify-between py-3", className)}>
                <div>
                        <p className="text-sm font-medium">Appearance</p>p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                                  Choose light or dark theme
                        </p>p>
                </div>div>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                        <button
                                    onClick={() => setTheme('light')}
                                    className={cn(
                                                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md",
                                                  "transition-colors duration-200",
                                                  theme === 'light'
                                                    ? "bg-background text-foreground shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground"
                                                )}
                                  >
                                  <Sun className="h-3.5 w-3.5" />
                                  Light
                        </button>button>
                        <button
                                    onClick={() => setTheme('dark')}
                                    className={cn(
                                                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md",
                                                  "transition-colors duration-200",
                                                  theme === 'dark'
                                                    ? "bg-background text-foreground shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground"
                                                )}
                                  >
                                  <Moon className="h-3.5 w-3.5" />
                                  Dark
                        </button>button>
                </div>div>
          </div>div>
        );
}</Button>
