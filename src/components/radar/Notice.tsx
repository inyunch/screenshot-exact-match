import { cva, type VariantProps } from "class-variance-authority";
import { Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const noticeVariants = cva("flex gap-3 rounded-lg border px-4 py-3 text-sm leading-relaxed", {
  variants: {
    variant: {
      info: "border-info-border bg-info text-info-foreground",
      warning: "border-warning-border bg-warning text-warning-foreground",
    },
  },
  defaultVariants: { variant: "info" },
});

export function Notice({
  variant,
  children,
  className,
}: VariantProps<typeof noticeVariants> & { children: ReactNode; className?: string }) {
  const Icon = variant === "warning" ? TriangleAlert : Info;
  return (
    <div role="note" className={cn(noticeVariants({ variant }), className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
