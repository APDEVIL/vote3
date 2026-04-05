import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title:       string;
  description?: string;
  children?:   React.ReactNode;   // right-side actions
  className?:  string;
}

/**
 * Consistent page heading used at the top of every dashboard page.
 *
 * Usage:
 *   <PageHeader title="Active Elections" description="Polls you can vote in">
 *     <Button>Create Poll</Button>
 *   </PageHeader>
 */
export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}