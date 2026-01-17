/**
 * ENTERPRISE ONBOARDING — FIRST SESSION GUARDRAILS
 * 
 * RULES:
 * - No auto-navigation into actions
 * - Clear, minimal entry points
 * - No tooltips or tours unless requested
 * - Read-only by default
 */

import { ArrowRight, FileText, Settings, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EntryPoint {
  id: string;
  label: string;
  description: string;
  icon: "documents" | "settings" | "help";
  href: string;
  isReadOnly?: boolean;
}

interface FirstSessionGuardrailsProps {
  entryPoints: EntryPoint[];
  onNavigate: (href: string) => void;
}

export function FirstSessionGuardrails({
  entryPoints,
  onNavigate,
}: FirstSessionGuardrailsProps) {
  const getIcon = (icon: EntryPoint["icon"]) => {
    switch (icon) {
      case "documents":
        return <FileText className="h-5 w-5 text-muted-foreground" />;
      case "settings":
        return <Settings className="h-5 w-5 text-muted-foreground" />;
      case "help":
        return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <p>Select an area to begin. All views are read-only by default.</p>
      </div>

      <div className="grid gap-3">
        {entryPoints.map((entry) => (
          <Card
            key={entry.id}
            className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors cursor-pointer"
            onClick={() => onNavigate(entry.href)}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {getIcon(entry.icon)}
                <div>
                  <p className="text-sm font-medium">{entry.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Need assistance? Contact your organization administrator.
      </p>
    </div>
  );
}
