import { Component, ErrorInfo, ReactNode } from "react";
import { HeaderOnlyLayout } from "@/layouts/HeaderOnlyLayout";

/**
 * APP ERROR BOUNDARY — GLOBAL CRASH PREVENTION
 * 
 * Catches any unhandled runtime errors in the component tree
 * and displays a safe fallback UI instead of a blank screen.
 * 
 * Rules:
 * - Header always visible
 * - Calm, institutional error message
 * - Reload button to recover
 */

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details in development
    console.error("[AppErrorBoundary] Caught error:", error);
    console.error("[AppErrorBoundary] Component stack:", errorInfo.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <HeaderOnlyLayout>
          <div 
            className="min-h-[calc(100vh-56px)] px-6 flex items-center justify-center"
            style={{ backgroundColor: 'var(--app-bg)' }}
          >
            <div 
              className="w-full max-w-[400px] p-6 rounded-xl text-center"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <h2 
                className="text-[18px] font-semibold mb-2"
                style={{ color: 'var(--text)' }}
              >
                Something didn't load
              </h2>
              <p 
                className="text-[14px] mb-5"
                style={{ color: 'var(--text-muted)' }}
              >
                Please refresh. If this continues, contact support.
              </p>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 text-[14px] font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
              >
                Reload
              </button>
            </div>
          </div>
        </HeaderOnlyLayout>
      );
    }

    return this.props.children;
  }
}
