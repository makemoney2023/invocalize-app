import { cn } from "@/lib/utils";

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Shell({ children, className, ...props }: ShellProps) {
  return (
    <div
      className={cn(
        "grid items-start gap-8 container mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
