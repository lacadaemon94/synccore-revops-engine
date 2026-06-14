export function TruncatedText({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span className="truncate-shell" data-tooltip={children} aria-label={children}>
      <span className={["truncate-text", className].filter(Boolean).join(" ")}>{children}</span>
    </span>
  );
}
