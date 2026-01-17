/**
 * ENTERPRISE ONBOARDING — WORKSPACE INITIALIZATION
 * 
 * This is not a "welcome flow."
 * This is institutional onboarding.
 * 
 * RULES:
 * - Explicit scope declaration
 * - Role confirmation
 * - Read-only by default until first action
 * - No auto-navigation into actions
 * - No tooltips or tours unless requested
 */

import { Shield, Building2, User, Lock, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface WorkspaceInitializationProps {
  workspaceName: string;
  workspaceType: "licensing" | "publishing" | "admin";
  userRole: string;
  userName: string;
  canView: string[];
  cannotDo: string[];
  contactEmail: string;
}

export function WorkspaceInitialization({
  workspaceName,
  workspaceType,
  userRole,
  userName,
  canView,
  cannotDo,
  contactEmail,
}: WorkspaceInitializationProps) {
  const getWorkspaceIcon = () => {
    switch (workspaceType) {
      case "licensing":
        return <Building2 className="h-5 w-5 text-muted-foreground" />;
      case "admin":
        return <Shield className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Building2 className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Scope Declaration */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {getWorkspaceIcon()}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                You are entering
              </p>
              <CardTitle className="text-lg font-medium">
                {workspaceName}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Role Confirmation */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Your role
              </p>
              <div className="flex items-center gap-2 mt-1">
                <CardTitle className="text-lg font-medium">
                  {userName}
                </CardTitle>
                <Badge variant="secondary" className="font-normal">
                  {userRole}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Authority Transparency */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Authority Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* What you can do */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>What you can access</span>
            </div>
            <ul className="ml-6 space-y-1">
              {canView.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* What you cannot do */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span>Restricted actions</span>
            </div>
            <ul className="ml-6 space-y-1">
              {cannotDo.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Contact for changes */}
          <div className="text-sm text-muted-foreground">
            <span>For access changes, contact </span>
            <span className="font-medium text-foreground">{contactEmail}</span>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Signals */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Authority history is visible and immutable</p>
        <p>• Contracts are versioned and traceable</p>
        <p>• Billing is tied to governing agreements</p>
      </div>
    </div>
  );
}
