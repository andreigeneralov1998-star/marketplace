import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function PageContainer({
  children,
  className,
  contentClassName,
}: PageContainerProps) {
  return (
    <div className={cn("app-container", className)}>
      <div className={cn("content-container", contentClassName)}>{children}</div>
    </div>
  );
}