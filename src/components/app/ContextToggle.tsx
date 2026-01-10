import { useAuth, PortalContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function ContextToggle() {
  const { activeContext, availableContexts, setActiveContext } = useAuth();

  // Don't render if user only has access to one context
  // The ModeIndicator in AppHeader will still show the current mode
  if (availableContexts.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-0.5 p-0.5 bg-[#F4F4F5] rounded-md">
      {availableContexts.map((context) => (
        <button
          key={context}
          onClick={() => setActiveContext(context)}
          className={cn(
            "px-3 py-1 text-[12px] font-medium rounded transition-colors",
            activeContext === context
              ? "bg-white text-[#0A0A0A] shadow-sm"
              : "text-[#71717A] hover:text-[#3F3F46]"
          )}
        >
          {context === "licensing" ? "Licensing" : "Publishing"}
        </button>
      ))}
    </div>
  );
}
