import { ReactNode } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { CONTENT_CONTAINER_CLASS } from "@/lib/layout";

interface ContentPageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function ContentPageLayout({ children, title, description }: ContentPageLayoutProps) {
  return (
    <PublicLayout>
      <section className="pt-28 pb-16 md:pt-36 md:pb-20">
        <div className={CONTENT_CONTAINER_CLASS}>
          <div className="max-w-[700px]">
            {title && <h1 className="text-foreground mb-3">{title}</h1>}
            {description && (
              <p className="text-muted-foreground leading-relaxed mb-8">{description}</p>
            )}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {children}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
