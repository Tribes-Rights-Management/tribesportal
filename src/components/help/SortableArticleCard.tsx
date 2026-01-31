import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export interface ArticleWithPosition {
  id: string;
  title: string;
  position: number;
}

interface SortableArticleCardProps {
  article: ArticleWithPosition;
  index: number;
  onClick: (article: ArticleWithPosition) => void;
}

export function SortableArticleCard({
  article,
  index,
  onClick,
}: SortableArticleCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: article.id });

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
      
      {/* Article title - LEFT aligned */}
      <button
        onClick={() => onClick(article)}
        className="text-[14px] text-foreground hover:text-primary transition-colors text-left flex-1"
      >
        {article.title || "Untitled"}
      </button>
    </div>
  );
}
