import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { CategoryWithPosition } from "@/hooks/useCategoryOrderByAudience";

interface SortableCategoryCardProps {
  category: CategoryWithPosition;
  index: number;
  onEdit: (category: CategoryWithPosition) => void;
}

export function SortableCategoryCard({
  category,
  index,
  onEdit,
}: SortableCategoryCardProps) {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 bg-card border rounded mb-2 ${
        isDragging ? 'opacity-50 border-primary' : 'border-border'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing transition-colors"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.5} />
      </button>
      
      {/* Position number */}
      <span className="text-[12px] text-muted-foreground w-6 text-center">
        {index + 1}
      </span>
      
      {/* Category name */}
      <button
        onClick={() => onEdit(category)}
        className="text-[14px] text-foreground font-medium hover:text-primary transition-colors text-left flex-1"
      >
        {category.name}
      </button>
    </div>
  );
}
