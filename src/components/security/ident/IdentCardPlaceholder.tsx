interface IdentCardPlaceholderProps {
  side: "front" | "back";
}

const LINE = "h-1.5 rounded-full bg-slate-400/25 dark:bg-white/10";

/** Angedeuteter Ausweis als Platzhalter, solange noch kein Foto da ist (Vorderseite mit Lichtbild, Rückseite mit Zeilen). */
export default function IdentCardPlaceholder({ side }: IdentCardPlaceholderProps) {
  return (
    <div className="absolute inset-[12%] flex rounded-lg bg-white/50 p-[6%] ring-1 ring-inset ring-slate-400/20 dark:bg-white/[0.04] dark:ring-white/10">
      {side === "front" ? (
        <div className="flex w-full gap-[8%]">
          <div className="aspect-[3/4] h-full rounded-md bg-slate-400/20 dark:bg-white/10" />
          <div className="flex flex-1 flex-col justify-center gap-2">
            <span className={`${LINE} w-3/4`} />
            <span className={`${LINE} w-1/2`} />
            <span className={`${LINE} w-2/3`} />
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col justify-end gap-1.5">
          <span className={`${LINE} w-full`} />
          <span className={`${LINE} w-full`} />
          <span className={`${LINE} w-5/6`} />
        </div>
      )}
    </div>
  );
}
