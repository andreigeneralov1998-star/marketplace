import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageTitleProps = {
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageTitle({
  title,
  description,
  meta,
  actions,
  className,
}: PageTitleProps) {
  return (
    <div className={cn("title-area", className)}>
      <div className="title-area__meta">
        <h1 className="text-text-primary">{title}</h1>
        {description ? (
          <p className="max-w-3xl text-sm leading-5 text-text-secondary md:text-base md:leading-6">
            {description}
          </p>
        ) : null}
        {meta}
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}