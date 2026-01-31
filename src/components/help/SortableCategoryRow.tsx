import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { CategoryWithPosition } from "@/hooks/useCategoryOrderByAudience";

interface SortableCategoryRowProps {
  category: CategoryWithPosition;
  onEdit: (category: CategoryWithPosition) => void;
  onDelete?: (category: CategoryWithPosition) => void;
  canDelete?: boolean;
}

export function SortableCategoryRow({
  category,
  onEdit,
  onDelete,
  canDelete = true,
}: SortableCategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-border/30 row-hover group bg-card"
    >
      {/* Drag handle */}
      <td className="w-10 px-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </td>
      
      <td 
        className="py-3 px-4 text-[13px] text-foreground cursor-pointer"
        onClick={() => onEdit(category)}
      >
        {category.name}
      </td>
      
      <td 
        className="py-3 px-4 text-[12px] text-muted-foreground font-mono cursor-pointer"
        onClick={() => onEdit(category)}
      >
        {category.slug}
      </td>
      
      <td 
        className="py-3 px-4 text-right text-[12px] text-muted-foreground cursor-pointer"
        onClick={() => onEdit(category)}
      >
        {format(new Date(category.updated_at), "MMM d, yyyy")}
      </td>
      
      <td className="py-3 px-4 text-right w-[50px]">
        {canDelete && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(category);
            }}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
            title="Delete category"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        )}
      </td>
    </tr>
  );
}
