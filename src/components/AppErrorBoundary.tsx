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
  * - Show error details in dev mode
  */
 
 interface Props {
   children: ReactNode;
 }
 
 interface State {
   hasError: boolean;
   error: Error | null;
   errorInfo: string | null;
 }
 
 export class AppErrorBoundary extends Component<Props, State> {
   constructor(props: Props) {
     super(props);
     this.state = { hasError: false, error: null, errorInfo: null };
   }
 
   static getDerivedStateFromError(error: Error): State {
     return { hasError: true, error, errorInfo: null };
   }
 
   componentDidCatch(error: Error, errorInfo: ErrorInfo) {
     console.error("[AppErrorBoundary] Caught error:", error);
     console.error("[AppErrorBoundary] Component stack:", errorInfo.componentStack);
     
     this.setState({ 
       errorInfo: errorInfo.componentStack || error.stack || null 
     });
   }
 
   handleReload = () => {
     window.location.reload();
   };
 
   render() {
     if (this.state.hasError) {
       const isDev = import.meta.env.DEV;
       
       return (
         <HeaderOnlyLayout>
           <div 
             className="min-h-[calc(100vh-56px)] px-6 flex items-center justify-center"
             style={{ backgroundColor: 'var(--app-bg)' }}
           >
             <div 
               className="w-full max-w-[600px] p-6 rounded-xl"
               style={{ 
                 backgroundColor: 'var(--card-bg)',
                 border: '1px solid var(--border-subtle)',
               }}
             >
               <div className="text-center">
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
               
               {isDev && this.state.error && (
                 <details className="mt-6 text-left">
                   <summary 
                     className="text-[13px] font-medium cursor-pointer mb-2"
                     style={{ color: 'var(--text)' }}
                   >
                     Error Details (dev only)
                   </summary>
                   <div 
                     className="p-3 rounded text-[11px] font-mono overflow-auto max-h-[300px]"
                     style={{ 
                       backgroundColor: 'var(--app-bg)',
                       color: 'var(--text-muted)',
                     }}
                   >
                     <div className="mb-2">
                       <strong>Message:</strong> {this.state.error.message}
                     </div>
                     {this.state.errorInfo && (
                       <div>
                         <strong>Stack:</strong>
                         <pre className="whitespace-pre-wrap mt-1">
                           {this.state.errorInfo}
                         </pre>
                       </div>
                     )}
                   </div>
                 </details>
               )}
             </div>
           </div>
         </HeaderOnlyLayout>
       );
     }
 
     return this.props.children;
   }
 }