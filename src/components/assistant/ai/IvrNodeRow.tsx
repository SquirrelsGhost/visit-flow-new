import type { IvrNode } from "../../../lib/assistant/hotline";
import { cn } from "../../../lib/cn";

interface IvrNodeRowProps {
  node: IvrNode;
  depth?: number;
}

/** Ein Punkt im Menübaum: Taste, Abteilung, ggf. Hinweis; Unterpunkte eingerückt an einer Linie. */
export default function IvrNodeRow({ node, depth = 0 }: IvrNodeRowProps) {
  return (
    <div className={cn(depth > 0 && "mt-1 ml-5")}>
      <div className="flex items-center gap-2 py-1">
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-green-200 bg-green-100 text-[11px] font-bold text-green-700 md:h-7 md:w-7 md:text-xs dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
          {node.key}
        </span>
        <span className="text-xs font-medium text-slate-700 md:text-sm dark:text-slate-200">{node.label}</span>
        {node.hint && <span className="text-[10px] font-medium text-amber-600 md:text-[11px] dark:text-amber-400">{node.hint}</span>}
      </div>
      {node.children && (
        <div className="border-l-2 border-green-200/60 pl-1 dark:border-green-800/40">
          {node.children.map((child) => (
            <IvrNodeRow key={child.key} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
