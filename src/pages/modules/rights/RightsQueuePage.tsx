import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import {
  AppPageLayout,
  AppSection,
  AppTable,
  AppTableHeader,
  AppTableBody,
  AppTableRow,
  AppTableHead,
  AppTableCell,
  AppTableEmpty,
  AppResponsiveList,
  AppItemCard,
  AppPagination,
  AppStatCard,
  AppStatCardGrid,
} from "@/components/app-ui";
import { QueueStatusBadge } from "@/components/queue/QueueStatusBadge";
import { useStaffQueue, useQueueStats } from "@/hooks/use-song-queue";

/**
 * RIGHTS QUEUE PAGE — Staff view of all song submissions
 */

const ITEMS_PER_PAGE = 50;
type StatusFilter = "all" | "submitted" | "pending" | "in_review" | "needs_revision" | "approved" | "rejected";

export default function RightsQueuePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);

  const statusFilter = (searchParams.get("status") as StatusFilter) || "all";
  const { data: queueItems = [], isLoading } = useStaffQueue(statusFilter === "all" ? undefined : statusFilter);
  const { data: stats } = useQueueStats();

  const handleStatusChange = (value: StatusFilter) => {
    if (value === "all") { searchParams.delete("status"); } else { searchParams.set("status", value); }
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  const totalItems = queueItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = queueItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getSongTitle = (item: any) => item.current_data?.title || item.submitted_data?.title || "Untitled";
  const getWriterNames = (item: any) => {
    const writers = item.current_data?.writers || item.submitted_data?.writers || [];
    return writers.map((w: any) => w.name).join(", ") || "—";
  };

  const statusOptions: { value: StatusFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: stats?.total || 0 },
    { value: "submitted", label: "Submitted", count: stats?.submitted || 0 },
    { value: "in_review", label: "In Review", count: stats?.in_review || 0 },
    { value: "needs_revision", label: "Needs Revision", count: stats?.needs_revision || 0 },
    { value: "approved", label: "Approved", count: stats?.approved || 0 },
    { value: "rejected", label: "Rejected", count: stats?.rejected || 0 },
  ];

  return (
    <AppPageLayout title="Queue">
      <AppSection spacing="md">
        <AppStatCardGrid columns={4}>
          <AppStatCard label="Submitted" value={stats?.submitted || 0} loading={!stats} onClick={() => handleStatusChange("submitted")} />
          <AppStatCard label="In Review" value={stats?.in_review || 0} loading={!stats} onClick={() => handleStatusChange("in_review")} />
          <AppStatCard label="Needs Revision" value={stats?.needs_revision || 0} loading={!stats} onClick={() => handleStatusChange("needs_revision")} />
          <AppStatCard label="Total in Queue" value={stats?.total || 0} loading={!stats} />
        </AppStatCardGrid>
      </AppSection>

      <AppSection spacing="md">
        <div className="flex items-center justify-end mb-3">
          <span className="text-[12px] text-muted-foreground">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground text-sm">Loading queue...</div>
        ) : (
          <AppResponsiveList
            items={paginatedItems}
            keyExtractor={(item) => item.id}
            emptyMessage="No submissions found"
            renderCard={(item) => (
              <AppItemCard
                title={getSongTitle(item)}
                subtitle={item.client_name || "Unknown client"}
                meta={<span>{format(new Date(item.submitted_at), "MMM d, yyyy")}</span>}
                status={<QueueStatusBadge status={item.status} />}
                onClick={() => navigate(`/rights/queue/${item.submission_number}`)}
              />
            )}
            renderTable={() => (
              <AppTable>
                <AppTableHeader>
                  <AppTableRow>
                    <AppTableHead>#</AppTableHead>
                     <AppTableHead>Title</AppTableHead>
                     <AppTableHead>Client</AppTableHead>
                     <AppTableHead>Deal</AppTableHead>
                     <AppTableHead>Songwriters</AppTableHead>
                     <AppTableHead align="center">Status</AppTableHead>
                     <AppTableHead>Submitted</AppTableHead>
                  </AppTableRow>
                </AppTableHeader>
                <AppTableBody>
                  {paginatedItems.length === 0 ? (
                     <AppTableEmpty colSpan={7}>
                       <span className="text-muted-foreground text-sm">No submissions found</span>
                    </AppTableEmpty>
                  ) : (
                    paginatedItems.map(item => (
                      <AppTableRow key={item.id} clickable onClick={() => navigate(`/rights/queue/${item.submission_number}`)}>
                        <AppTableCell muted>{item.submission_number}</AppTableCell>
                         <AppTableCell className="font-medium">{getSongTitle(item)}</AppTableCell>
                         <AppTableCell muted>{item.client_name}</AppTableCell>
                         <AppTableCell muted>—</AppTableCell>
                         <AppTableCell muted className="max-w-[200px] truncate">{getWriterNames(item)}</AppTableCell>
                         <AppTableCell align="center"><QueueStatusBadge status={item.status} /></AppTableCell>
                         <AppTableCell muted>{format(new Date(item.submitted_at), "MMM d, yyyy")}</AppTableCell>
                      </AppTableRow>
                    ))
                  )}
                </AppTableBody>
              </AppTable>
            )}
          />
        )}

        <AppPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </AppSection>

    </AppPageLayout>
  );
}
