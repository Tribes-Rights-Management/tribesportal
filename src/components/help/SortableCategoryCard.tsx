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
      className={`flex items-center gap-3 px-4 py-2.5 bg-card border rounded mb-2 hover:border-muted-foreground/30 ${
        isDragging ? 'opacity-50 border-primary' : 'border-border'
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="text-muted-foreground cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.5} />
      </div>
      
      {/* Position number */}
      <span className="text-[12px] text-muted-foreground w-5 text-center">
        {index + 1}
      </span>
      
      {/* Category name - LEFT aligned */}
      <button
        onClick={() => onEdit(category)}
        className="text-[14px] text-foreground hover:text-primary transition-colors text-left flex-1"
      >
        {category.name}
      </button>
    </div>
  );
}
