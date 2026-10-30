interface BusyLabelProps {
  label: string;
}

const DOT_DELAYS = ["0s", "0.1s", "0.2s"] as const;

/** Lade-Kreis mit hüpfenden Punkten wie beim Anmelde-Button aus v1. */
export default function BusyLabel({ label }: BusyLabelProps) {
  return (
    <span className="flex items-center justify-center">
      <span className="relative mr-3 h-5 w-5" aria-hidden="true">
        <span className="absolute inset-0 rounded-full border-2 border-white/30" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-white" />
      </span>
      <span>{label}</span>
      <span className="ml-0.5 flex gap-0.5" aria-hidden="true">
        {DOT_DELAYS.map((delay) => (
          <span key={delay} className="animate-bounce motion-reduce:animate-none" style={{ animationDelay: delay }}>
            .
          </span>
        ))}
      </span>
    </span>
  );
}
