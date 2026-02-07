#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TRIBES DESIGN SYSTEM LINT
# Scans page files for design system violations.
# Run: bash scripts/lint-design-system.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SRC_DIR="src/pages"
VIOLATIONS=0
CLEAN=0
TOTAL=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TRIBES DESIGN SYSTEM LINT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Skip index files and auth callback (special case)
find "$SRC_DIR" -name "*.tsx" -not -name "index.*" -not -name "AuthCallbackPage.tsx" | sort | while read -r file; do
    TOTAL=$((TOTAL + 1))
    shortname="${file#src/pages/}"
    file_violations=0
    file_issues=""

    # Check 1: Raw ui/button imports
    if grep -q 'from.*@/components/ui/button' "$file"; then
        file_issues+="  ${YELLOW}IMPORT${NC}  Raw ui/button → use AppButton from @/components/app-ui\n"
        file_violations=$((file_violations + 1))
    fi

    # Check 2: Raw ui/card imports
    if grep -q 'from.*@/components/ui/card' "$file"; then
        file_issues+="  ${YELLOW}IMPORT${NC}  Raw ui/card → use AppCard from @/components/app-ui\n"
        file_violations=$((file_violations + 1))
    fi

    # Check 3: Raw ui/input imports
    if grep -q 'from.*@/components/ui/input' "$file"; then
        file_issues+="  ${YELLOW}IMPORT${NC}  Raw ui/input → use AppInput from @/components/app-ui\n"
        file_violations=$((file_violations + 1))
    fi

    # Check 4: Raw ui/badge imports
    if grep -q 'from.*@/components/ui/badge' "$file"; then
        file_issues+="  ${YELLOW}IMPORT${NC}  Raw ui/badge → use AppChip from @/components/app-ui\n"
        file_violations=$((file_violations + 1))
    fi

    # Check 5: Raw ui/table imports
    if grep -q 'from.*@/components/ui/table' "$file"; then
        file_issues+="  ${YELLOW}IMPORT${NC}  Raw ui/table → use AppTable from @/components/app-ui\n"
        file_violations=$((file_violations + 1))
    fi

    # Check 6: bg-white or bg-card used as panel pattern
    if grep -qE 'bg-(white|card).*border.*rounded|bg-(white|card).*rounded.*border' "$file"; then
        file_issues+="  ${YELLOW}PATTERN${NC} Raw bg-white/bg-card panel → use AppPanel or AppCard\n"
        file_violations=$((file_violations + 1))
    fi

    # Check 7: Hardcoded hex colors in className
    if grep -qE 'className=.*bg-\[#|className=.*text-\[#|className=.*border-\[#' "$file"; then
        count=$(grep -cE 'className=.*bg-\[#|className=.*text-\[#|className=.*border-\[#' "$file" || true)
        file_issues+="  ${YELLOW}COLOR${NC}   ${count} hardcoded hex color(s) in className\n"
        file_violations=$((file_violations + 1))
    fi

    # Check 8: Raw <table element
    if grep -q '<table' "$file"; then
        file_issues+="  ${YELLOW}ELEMENT${NC} Raw <table> → use AppTable from @/components/app-ui\n"
        file_violations=$((file_violations + 1))
    fi

    # Report per file
    if [ $file_violations -gt 0 ]; then
        echo -e "${RED}✗${NC} ${BOLD}${shortname}${NC} (${file_violations} issue(s))"
        echo -e "$file_issues"
        VIOLATIONS=$((VIOLATIONS + file_violations))
    fi
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Recount since the while loop runs in a subshell
TOTAL_FILES=$(find "$SRC_DIR" -name "*.tsx" -not -name "index.*" -not -name "AuthCallbackPage.tsx" | wc -l)
VIOLATION_FILES=$(find "$SRC_DIR" -name "*.tsx" -not -name "index.*" -not -name "AuthCallbackPage.tsx" -exec grep -lE 'from.*@/components/ui/(button|card|input|badge|table)|bg-(white|card).*border.*rounded|<table' {} \; | wc -l)
CLEAN_FILES=$((TOTAL_FILES - VIOLATION_FILES))

if [ "$VIOLATION_FILES" -eq 0 ]; then
    echo -e "  ${GREEN}ALL CLEAR${NC} — ${TOTAL_FILES} pages scanned, 0 violations"
else
    echo -e "  ${RED}${VIOLATION_FILES} pages with violations${NC} / ${TOTAL_FILES} total"
    echo -e "  ${GREEN}${CLEAN_FILES} pages clean${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
