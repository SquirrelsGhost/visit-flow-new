import { useState } from "react";
import { toast } from "sonner";
import { MAX_VISIBLE_LINKS, type ImportantLink } from "../../../lib/assistant/importantLinks";
import { assistantTexts as t } from "../../../texts/assistantTexts";
import LinkPickerRow from "./LinkPickerRow";

interface LinkPickerProps {
  links: readonly ImportantLink[];
  initial: readonly string[];
  onDone: (ids: string[]) => void;
}

/** Auswahl der sichtbaren Links: genau vier, Reihenfolge wie in der Liste (v1). */
export default function LinkPicker({ links, initial, onDone }: LinkPickerProps) {
  const [ids, setIds] = useState<string[]>([...initial]);

  const toggle = (id: string) => {
    if (ids.includes(id)) return setIds(ids.filter((x) => x !== id));
    if (ids.length >= MAX_VISIBLE_LINKS) return void toast.error(t.linksMax);
    setIds([...ids, id]);
  };

  const finish = () => {
    if (ids.length !== MAX_VISIBLE_LINKS) return void toast.error(t.linksExactly);
    onDone(ids);
  };

  return (
    <div className="space-y-3">
      <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">{t.linksPick(ids.length)}</p>
      <div className="grid grid-cols-1 gap-2">
        {links.map((link) => (
          <LinkPickerRow key={link.id} link={link} selected={ids.includes(link.id)} onToggle={() => toggle(link.id)} />
        ))}
      </div>
      <button
        type="button"
        onClick={finish}
        className="mt-4 h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-red-600/20 transition-transform active:scale-[0.98]"
      >
        {t.linksSave}
      </button>
    </div>
  );
}
