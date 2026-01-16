import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

/**
 * INSTITUTIONAL TOOLTIP — AUDIT-SAFE INFORMATION DISPLAY
 * 
 * Tooltips should:
 * - Explain why something exists
 * - Never explain how to feel
 * - Always imply permanence and logging
 */

interface InstitutionalTooltipProps {
  content: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  side?: "top" | "right" | "bottom" | "left";
}

export function InstitutionalTooltip({ 
  content, 
  children,
  showIcon = true,
  side = "top"
}: InstitutionalTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {children || (
            showIcon && (
              <HelpCircle 
                className="h-3.5 w-3.5 cursor-help" 
                style={{ color: 'var(--platform-text-muted)' }}
              />
            )
          )}
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="max-w-[280px] text-[12px] leading-relaxed"
          style={{
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)',
            color: 'var(--platform-text-secondary)',
          }}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Column Header with Tooltip
 * Use in table headers to explain column purpose
 */
interface ColumnHeaderProps {
  label: string;
  tooltip: string;
}

export function ColumnHeaderWithTooltip({ label, tooltip }: ColumnHeaderProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span>{label}</span>
      <InstitutionalTooltip content={tooltip} />
    </div>
  );
}

/**
 * Action Button with Tooltip
 * Use for action buttons that need explanation
 */
interface ActionTooltipProps {
  tooltip: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export function ActionWithTooltip({ tooltip, children, side = "top" }: ActionTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="max-w-[280px] text-[12px] leading-relaxed"
          style={{
            backgroundColor: 'var(--platform-surface)',
            border: '1px solid var(--platform-border)',
            color: 'var(--platform-text-secondary)',
          }}
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
