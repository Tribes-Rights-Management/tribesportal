import { useAuth } from "@/contexts/AuthContext";
import { TenantSelector } from "./TenantSelector";
import { ContextToggle } from "./ContextToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AppHeader() {
  const { profile, signOut, isPlatformAdmin, activeContext } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/sign-in");
  };

  return (
    <header className="h-14 border-b border-[#E4E4E7] bg-white px-6 flex items-center justify-between">
      {/* Left: Logo + Tenant */}
      <div className="flex items-center gap-6">
        <span className="text-[15px] font-semibold text-[#0A0A0A] tracking-[-0.01em]">
          Tribes
        </span>
        <div className="h-5 w-px bg-[#E4E4E7]" />
        <TenantSelector />
      </div>

      {/* Right: Context Toggle + Account */}
      <div className="flex items-center gap-4">
        <ContextToggle />
        
        {isPlatformAdmin && (
          <>
            <div className="h-5 w-px bg-[#E4E4E7]" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="text-[13px] text-[#71717A] hover:text-[#0A0A0A]"
            >
              Admin
            </Button>
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full bg-[#F4F4F5] hover:bg-[#E4E4E7]"
            >
              <User className="h-4 w-4 text-[#71717A]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-[13px] font-medium text-[#0A0A0A]">
                {profile?.email}
              </p>
              <p className="text-[12px] text-[#71717A] capitalize">
                {activeContext} Portal
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate(`/app/${activeContext}/settings`)}
              className="text-[13px]"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-[13px] text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
