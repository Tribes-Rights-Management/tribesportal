/**
 * ENTERPRISE ONBOARDING — EXTERNAL PARTNER VIEW
 * 
 * Minimal UI for external partners (auditors, licensees, etc.)
 * 
 * RULES:
 * - Minimal UI
 * - Explicit scope labeling
 * - No platform discovery
 * - No admin affordances
 */

import { ExternalLink, Eye, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExternalPartnerViewProps {
  partnerName: string;
  accessScope: string;
  accessType: "auditor" | "licensee" | "partner";
  grantedBy: string;
  expiresAt: string | null;
  availableResources: {
    label: string;
    description: string;
  }[];
}

export function ExternalPartnerView({
  partnerName,
  accessScope,
  accessType,
  grantedBy,
  expiresAt,
  availableResources,
}: ExternalPartnerViewProps) {
  const getAccessTypeLabel = () => {
    switch (accessType) {
      case "auditor":
        return "External Auditor";
      case "licensee":
        return "Licensee";
      case "partner":
        return "Partner";
      default:
        return "External Access";
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      {/* Scope Header */}
      <div className="text-center space-y-2">
        <Badge variant="outline" className="font-normal">
          {getAccessTypeLabel()}
        </Badge>
        <h1 className="text-xl font-medium">{partnerName}</h1>
        <p className="text-sm text-muted-foreground">
          Read-only access to {accessScope}
        </p>
      </div>

      {/* Access Details */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Access Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Granted by</span>
            <span>{grantedBy}</span>
          </div>
          {expiresAt && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Access expires</span>
              <span>{expiresAt}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Access type</span>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>Read-only</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Resources */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Available Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableResources.map((resource, index) => (
            <div key={index} className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">{resource.label}</p>
                <p className="text-xs text-muted-foreground">
                  {resource.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Audit Notice */}
      <p className="text-xs text-muted-foreground text-center">
        All access is logged for audit purposes.
      </p>
    </div>
  );
}
