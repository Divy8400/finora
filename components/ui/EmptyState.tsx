"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon = "📭", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4" aria-hidden="true">{icon}</div>
      <h3 className="text-base font-semibold mb-1" style={{ color: "#172033" }}>{title}</h3>
      {description && <p className="text-sm max-w-xs" style={{ color: "#64748B" }}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
