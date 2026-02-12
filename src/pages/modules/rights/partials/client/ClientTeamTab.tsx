import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppTableBadge,
  AppEmptyState,
} from "@/components/app-ui";

interface ClientTeamTabProps {
  clientId: string;
}

export default function ClientTeamTab({ clientId }: ClientTeamTabProps) {
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["client-team", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_account_members")
        .select("id, user_id, role, can_submit_songs, can_view_contracts, can_manage_team, can_download_exports, created_at")
        .eq("client_account_id", clientId)
        .is("removed_at", null)
        .order("created_at");
      if (error) throw error;

      // Fetch user profiles for display names
      if (!data || data.length === 0) return [];
      const userIds = data.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, email, full_name")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      return data.map((m) => ({
        ...m,
        email: profileMap.get(m.user_id)?.email || "—",
        display_name: profileMap.get(m.user_id)?.full_name || null,
      }));
    },
  });

  function getPermissionsSummary(member: any): string {
    const perms: string[] = [];
    if (member.can_submit_songs) perms.push("Submit");
    if (member.can_view_contracts) perms.push("Contracts");
    if (member.can_manage_team) perms.push("Team");
    if (member.can_download_exports) perms.push("Exports");
    return perms.length > 0 ? perms.join(", ") : "None";
  }

  if (isLoading) {
    return <AppEmptyState message="Loading team members..." size="lg" />;
  }

  return (
    <AppTable columns={["25%", "25%", "15%", "20%", "15%"]}>
      <AppTableHeader>
        <AppTableRow header>
          <AppTableHead>Name</AppTableHead>
          <AppTableHead>Email</AppTableHead>
          <AppTableHead>Role</AppTableHead>
          <AppTableHead>Permissions</AppTableHead>
          <AppTableHead align="right">Added</AppTableHead>
        </AppTableRow>
      </AppTableHeader>
      <AppTableBody>
        {members.length === 0 ? (
          <AppTableEmpty colSpan={5}>
            <span className="text-sm text-muted-foreground">No team members</span>
          </AppTableEmpty>
        ) : (
          members.map((member: any) => (
            <AppTableRow key={member.id}>
              <AppTableCell>{member.display_name || "—"}</AppTableCell>
              <AppTableCell muted>{member.email}</AppTableCell>
              <AppTableCell>
                <AppTableBadge>{member.role}</AppTableBadge>
              </AppTableCell>
              <AppTableCell muted>{getPermissionsSummary(member)}</AppTableCell>
              <AppTableCell align="right" muted>
                {format(new Date(member.created_at), "MMM d, yyyy")}
              </AppTableCell>
            </AppTableRow>
          ))
        )}
      </AppTableBody>
    </AppTable>
  );
}
