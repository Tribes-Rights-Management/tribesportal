import { useAuth, PortalContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function ContextToggle() {
  const { activeContext, availableContexts, setActiveContext } = useAuth();

  // Don't show toggle if user only has access to one context
  if (availableContexts.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 p-0.5 bg-[#F4F4F5] rounded-md">
      {availableContexts.map((context) => (
        <button
          key={context}
          onClick={() => setActiveContext(context)}
          className={cn(
            "px-3 py-1.5 text-[13px] font-medium rounded transition-colors",
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
