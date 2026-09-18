export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      aria-label="Memuat"
      role="status"
      className={`inline-block animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 ${className}`}
    />
  );
}