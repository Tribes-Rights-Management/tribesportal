import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BRAND } from "@/lib/brand";
import { Footer } from "@/components/Footer";

interface PublicLayoutProps {
  children: ReactNode;
  footerVariant?: "full" | "minimal";
}

export function PublicLayout({ children, footerVariant = "full" }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight">{BRAND.wordmark}</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link 
              to="/auth" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer variant={footerVariant} />
    </div>
  );
}
