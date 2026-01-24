import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // DESIGN SYSTEM ENFORCEMENT — Prevent direct UI primitive imports in pages
  // ═══════════════════════════════════════════════════════════════════════════
  // 
  // Pages must use the design system components:
  // - /admin/* routes → @/components/console (ConsoleButton, ConsoleChip, etc.)
  // - /help-workstation/* → @/components/app-ui (AppButton, AppChip, etc.)
  // - Other pages → @/components/app-ui
  //
  // Direct imports from @/components/ui/button or @/components/ui/badge in 
  // page files are prohibited to prevent visual drift.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    files: ["src/pages/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/components/ui/button",
              message: "Use AppButton from @/components/app-ui or ConsoleButton from @/components/console instead. See docs/DESIGN_SYSTEM_ENFORCEMENT.md"
            },
            {
              name: "@/components/ui/badge",
              message: "Use AppChip from @/components/app-ui or ConsoleChip from @/components/console instead. See docs/DESIGN_SYSTEM_ENFORCEMENT.md"
            },
            {
              name: "@/components/ui/card",
              message: "Use AppCard from @/components/app-ui or ConsoleCard from @/components/console instead. See docs/DESIGN_SYSTEM_ENFORCEMENT.md"
            }
          ]
        }
      ]
    }
  }
);
