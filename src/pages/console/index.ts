/**
 * SYSTEM CONSOLE PAGES — MODULE EXPORTS
 * 
 * Platform-level governance pages rendered at /console.
 * These serve platform administrators and external auditors.
 */

export { default as ConsoleDashboard } from "./ConsoleDashboard";
export { default as ApprovalsPage } from "./ApprovalsPage";
export { default as TenantsPage } from "./TenantsPage";
export { default as UserDirectoryPage } from "./UserDirectoryPage";
export { default as PermissionsPage } from "./PermissionsPage";
export { default as AccountSettingsPage } from "./AccountSettingsPage";
export { default as RLSAuditPage } from "./RLSAuditPage";
export { default as AuthAccessReviewPage } from "./AuthAccessReviewPage";
export { default as DisclosuresPage } from "./DisclosuresPage";
export { default as CorrelationChainPage } from "./CorrelationChainPage";
export { default as DataRoomPage } from "./DataRoomPage";

// Billing governance
export { default as BillingGovernancePage } from "./billing/BillingGovernancePage";
export { default as RevenueOverviewPage } from "./billing/RevenueOverviewPage";
export { default as PlansConfigurationPage } from "./billing/PlansConfigurationPage";
export { default as AllInvoicesPage } from "./billing/AllInvoicesPage";
export { default as PaymentProvidersPage } from "./billing/PaymentProvidersPage";
export { default as RefundsPage } from "./billing/RefundsPage";

// Executive reporting
export { default as ExecutiveReportingPage } from "./reporting/ExecutiveReportingPage";
export { default as BoardSummariesPage } from "./reporting/BoardSummariesPage";
export { default as ComplianceMappingPage } from "./reporting/ComplianceMappingPage";
