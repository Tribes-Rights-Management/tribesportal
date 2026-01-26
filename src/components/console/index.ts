/**
 * SYSTEM CONSOLE COMPONENT KIT — INDEX
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * SINGLE IMPORT POINT FOR ALL CONSOLE COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * All /admin routes MUST import from this index instead of generic
 * @/components/ui primitives to enforce institutional styling.
 * 
 * USAGE:
 * import { 
 *   ConsoleButton,
 *   ConsoleChip,
 *   ConsoleCard,
 *   ConsoleSectionHeader
 * } from "@/components/console";
 * 
 * GUARDRAILS:
 * - Do not import Button, Badge, Card from @/components/ui in /admin routes
 * - All console styling flows through .console-scope CSS variables
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { ConsoleButton, type ConsoleButtonProps } from "./ConsoleButton";
export { ConsoleChip, type ChipStatus, type ChipSeverity } from "./ConsoleChip";
export {
  ConsoleCard,
  ConsoleCardHeader,
  ConsoleCardBody,
  ConsoleCardFooter,
} from "./ConsoleCard";
export { ConsoleSectionHeader } from "./ConsoleSectionHeader";
export { ConsoleNav } from "./ConsoleNav";
