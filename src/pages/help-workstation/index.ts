/**
 * HELP WORKSTATION PAGES
 * 
 * First-class workstation for Help content management.
 * Separate from System Console, with its own layout and navigation.
 * 
 * Information Architecture:
 * - Overview (dashboard)
 * - Audiences (manage audience segments)
 * - Categories (CRUD, reorder, audience assignments)
 * - Articles (CRUD, audience/category assignments)
 * - Messages (support inquiries)
 * - Analytics (search trends, performance)
 * - Settings (configuration)
 */

export { default as HelpOverviewPage } from "./HelpOverviewPage";
export { default as HelpAudiencesPage } from "./HelpAudiencesPage";
export { default as HelpArticlesListPage } from "./HelpArticlesListPage";
export { default as HelpArticleEditorPage } from "./HelpArticleEditorPage";
export { default as HelpCategoriesPage } from "./HelpCategoriesPage";
export { default as HelpMessagesPage } from "./HelpMessagesPage";
export { default as HelpAnalyticsPage } from "./HelpAnalyticsPage";
export { default as HelpSettingsPage } from "./HelpSettingsPage";
