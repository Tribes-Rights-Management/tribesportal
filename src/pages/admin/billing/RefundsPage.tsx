import { useState } from "react";
import { AppPageLayout } from "@/components/app-ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle,
  RotateCcw,
  DollarSign,
  Clock,
  User,
  FileText
} from "lucide-react";
import { AppSearchInput, AppSelect } from "@/components/app-ui";
import { Input } from "@/components/ui/input";
import { useBillingAuthority } from "@/hooks/useBillingAuthority";
import { InstitutionalEmptyState } from "@/components/ui/institutional-states";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * REFUND WORKFLOW — GOVERNANCE-GRADE FINANCIAL CONTROL
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * SCOPE: System Console ONLY — Platform Executives
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * WHO CAN INITIATE:
 * - Platform Executive only
 * 
 * WHO CANNOT:
 * - Tribes Admin
 * - Org Admin
 * - Members
 * 
 * REFUND FLOW:
 * 1. Executive selects transaction
 * 2. System displays immutable transaction context
 * 3. Executive selects refund amount (full or partial)
 * 4. Confirmation required
 * 5. Refund sent via PaymentService → Stripe
 * 6. Refund event recorded immutably
 * 
 * REQUIRED LOGGING:
 * - Actor
 * - Amount
 * - Original transaction
 * - Reason code
 * - Timestamp
 * - Payment provider response
 * 
 * UI RULES:
 * - Refund UI exists only in System Console
 * - Refund buttons never appear in org workspaces
 * - Refunds are never inline
 * - Refunds are never "quick actions"
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

const REFUND_REASON_CODES = [
  { code: "duplicate", label: "Duplicate charge" },
  { code: "fraudulent", label: "Fraudulent transaction" },
  { code: "requested_by_customer", label: "Customer requested" },
  { code: "product_unacceptable", label: "Service not delivered" },
  { code: "other", label: "Other" },
] as const;

export default function RefundsPage() {
  const { canIssueRefunds, canViewAllInvoices } = useBillingAuthority();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundType, setRefundType] = useState("full");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Access control - Platform Executives only
  if (!canIssueRefunds) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <AlertTriangle className="h-6 w-6 mx-auto mb-4 text-muted-foreground" strokeWidth={1.25} />
          <p className="text-muted-foreground">
            Refund authority is restricted to Platform Executives
          </p>
        </div>
      </div>
    );
  }

  const handleRefundSubmit = async () => {
    if (!selectedPayment || !refundAmount || !refundReason) return;

    setIsProcessing(true);
    
    try {
      // TODO: Call PaymentService.issueRefund()
      // This will be logged immutably with all context
      console.log("[REFUND] Processing refund", {
        paymentId: selectedPayment,
        amount: parseFloat(refundAmount),
        reason: refundReason,
        timestamp: new Date().toISOString(),
      });
      
      // Reset form after successful refund
      setSelectedPayment(null);
      setRefundAmount("");
      setRefundReason("");
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("[REFUND] Failed to process refund", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppPageLayout title="Refunds" maxWidth="md">

      {/* Warning Banner */}
      <div 
        className="flex items-start gap-3 p-4 rounded-lg"
        style={{
          backgroundColor: 'var(--warning-bg)',
          border: '1px solid var(--warning-border)',
        }}
      >
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--warning-text)' }} />
        <div className="space-y-1">
          <p className="text-sm font-medium" style={{ color: 'var(--warning-text)' }}>
            Financial governance action
          </p>
          <p className="text-xs" style={{ color: 'var(--warning-text)', opacity: 0.8 }}>
            All refund actions are logged immutably with actor identity, amount, reason, 
            and timestamp. This record cannot be modified or deleted.
          </p>
        </div>
      </div>

      {/* Transaction Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Find Transaction</CardTitle>
          <CardDescription>
            Search by transaction ID, invoice number, or organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <AppSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Enter transaction ID or invoice number..."
              className="flex-1"
            />
            <Button variant="outline" disabled={!searchQuery}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Context (shown when payment selected) */}
      {selectedPayment && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Transaction Context</CardTitle>
                <CardDescription>
                  Immutable record — cannot be modified
                </CardDescription>
              </div>
              <Badge variant="outline">Read-only</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Transaction details would be displayed here */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Transaction ID
                </p>
                <p className="font-mono text-xs">{selectedPayment}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  Original Amount
                </p>
                <p>$0.00 USD</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Transaction Date
                </p>
                <p>—</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Organization
                </p>
                <p>—</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refund Form (shown when payment selected) */}
      {selectedPayment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Issue Refund</CardTitle>
            <CardDescription>
              This action will be recorded with your identity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="refundAmount">Refund Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="refundAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="refundType">Refund Type</Label>
                <AppSelect
                  value={refundType}
                  onChange={setRefundType}
                  fullWidth
                  options={[
                    { value: "full", label: "Full refund" },
                    { value: "partial", label: "Partial refund" },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reasonCode">Reason Code</Label>
              <AppSelect
                value={refundReason}
                onChange={setRefundReason}
                fullWidth
                placeholder="Select a reason..."
                options={REFUND_REASON_CODES.map(reason => ({
                  value: reason.code,
                  label: reason.label,
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional: Provide additional context for this refund..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPayment(null);
                  setRefundAmount("");
                  setRefundReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowConfirmDialog(true)}
                disabled={!refundAmount || !refundReason}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Issue Refund
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedPayment && (
        <Card>
          <CardContent className="py-12">
            <InstitutionalEmptyState
              title="No transaction selected"
              description="Search for a transaction above to issue a refund"
            />
          </CardContent>
        </Card>
      )}

      {/* Recent Refunds */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent Refunds</CardTitle>
          <CardDescription>
            Chronological record of all refund actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstitutionalEmptyState
            title="No refunds issued"
            description="Refund history will appear here"
          />
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You are about to issue a refund of <strong>${refundAmount} USD</strong>.
              </p>
              <p>
                This action will be recorded immutably with your identity, timestamp, 
                and the reason provided. The refund cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefundSubmit}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Processing..." : "Confirm Refund"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppPageLayout>
  );
}
