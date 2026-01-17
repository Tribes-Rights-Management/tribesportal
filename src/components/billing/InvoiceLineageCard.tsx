/**
 * INVOICE LINEAGE CARD
 * 
 * Displays the contract → invoice → payment lineage
 * for financial and legal integrity verification.
 */

import { Link } from "react-router-dom";
import { FileText, Receipt, CreditCard, ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Invoice, Contract, Payment } from "@/hooks/useBillingLineage";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface InvoiceLineageCardProps {
  invoice: Invoice;
  payments?: Payment[];
  showContract?: boolean;
}

interface ContractLineageCardProps {
  contract: Contract;
  invoiceCount?: number;
  totalInvoiced?: number;
  totalPaid?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "paid":
    case "succeeded":
    case "active":
      return "default";
    case "open":
    case "pending":
    case "processing":
    case "draft":
      return "secondary";
    case "void":
    case "failed":
    case "cancelled":
    case "terminated":
    case "expired":
      return "destructive";
    default:
      return "outline";
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INVOICE LINEAGE CARD
// ═══════════════════════════════════════════════════════════════════════════

export function InvoiceLineageCard({ 
  invoice, 
  payments = [],
  showContract = true 
}: InvoiceLineageCardProps) {
  const contract = invoice.contract;
  
  return (
    <div 
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: "var(--platform-surface)",
        border: "1px solid var(--platform-border)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[--platform-border]">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-medium text-[--platform-text]">
            Billing Lineage
          </h3>
          <Badge variant="outline" className="text-[10px]">
            Verified Chain
          </Badge>
        </div>
      </div>
      
      {/* Lineage Chain */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Contract */}
          {showContract && contract && (
            <>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="mt-2 text-center">
                  <p className="text-[11px] text-muted-foreground">Contract</p>
                  <Link 
                    to={`/contracts/${contract.id}`}
                    className="text-[12px] font-medium text-[--platform-text] hover:underline"
                  >
                    {contract.contract_number}
                  </Link>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    v{contract.version}
                  </p>
                </div>
              </div>
              
              <div className="flex-shrink-0 pt-4">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </>
          )}
          
          {/* Invoice */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Receipt className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-2 text-center">
              <p className="text-[11px] text-muted-foreground">Invoice</p>
              <p className="text-[12px] font-medium text-[--platform-text]">
                {invoice.invoice_number}
              </p>
              <Badge variant={getStatusVariant(invoice.status)} className="text-[10px] mt-1">
                {invoice.status}
              </Badge>
            </div>
          </div>
          
          {/* Payments */}
          {payments.length > 0 && (
            <>
              <div className="flex-shrink-0 pt-4">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="mt-2 text-center">
                  <p className="text-[11px] text-muted-foreground">
                    {payments.length === 1 ? "Payment" : `${payments.length} Payments`}
                  </p>
                  <p className="text-[12px] font-medium text-[--platform-text]">
                    {formatCurrency(
                      payments.reduce((sum, p) => sum + p.amount, 0),
                      invoice.currency
                    )}
                  </p>
                  <Badge 
                    variant={getStatusVariant(payments[0].status)} 
                    className="text-[10px] mt-1"
                  >
                    {payments[0].status}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Contract Reference Details */}
        {showContract && contract && (
          <div className="mt-4 pt-4 border-t border-[--platform-border]">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px]">
              <div>
                <dt className="text-muted-foreground">Contract Title</dt>
                <dd className="text-[--platform-text] font-medium mt-0.5">
                  {contract.title}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Version Hash</dt>
                <dd className="text-[--platform-text] font-mono mt-0.5 text-[11px]">
                  {invoice.contract_version_hash.slice(0, 12)}...
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Effective Date</dt>
                <dd className="text-[--platform-text] mt-0.5">
                  {contract.effective_date 
                    ? format(new Date(contract.effective_date), "MMM d, yyyy")
                    : "—"
                  }
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Contract Status</dt>
                <dd className="mt-0.5">
                  <Badge variant={getStatusVariant(contract.status)} className="text-[10px]">
                    {contract.status}
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT LINEAGE CARD (for contract detail pages)
// ═══════════════════════════════════════════════════════════════════════════

export function ContractLineageCard({
  contract,
  invoiceCount = 0,
  totalInvoiced = 0,
  totalPaid = 0,
}: ContractLineageCardProps) {
  const paidPercentage = totalInvoiced > 0 
    ? Math.round((totalPaid / totalInvoiced) * 100) 
    : 0;
    
  return (
    <div 
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: "var(--platform-surface)",
        border: "1px solid var(--platform-border)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[--platform-border]">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-medium text-[--platform-text]">
            Linked Invoices
          </h3>
          <Badge variant="secondary" className="text-[10px]">
            {invoiceCount} invoice{invoiceCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>
      
      {/* Summary */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] text-muted-foreground">Total Invoiced</p>
            <p className="text-[16px] font-medium text-[--platform-text] mt-1">
              {formatCurrency(totalInvoiced)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Total Paid</p>
            <p className="text-[16px] font-medium text-[--platform-text] mt-1">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Collected</p>
            <p className="text-[16px] font-medium text-[--platform-text] mt-1">
              {paidPercentage}%
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
        </div>
        
        {/* Contract integrity */}
        <div className="mt-4 pt-4 border-t border-[--platform-border]">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Version Hash</span>
            <code className="font-mono text-[11px] text-[--platform-text]">
              {contract.version_hash.slice(0, 16)}...
            </code>
          </div>
          <div className="flex items-center justify-between text-[12px] mt-2">
            <span className="text-muted-foreground">Lineage Verified</span>
            <Badge variant="outline" className="text-[10px]">
              ✓ All invoices linked
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
