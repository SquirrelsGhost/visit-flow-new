/** Setzt Wörter in *Sternchen* kursiv in Serifenschrift, den Rest in der Titelschrift. */
interface AccentTextProps {
  text: string;
  accentClassName?: string;
}

export default function AccentText({ text, accentClassName = "text-[#ff6b6b]" }: AccentTextProps) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <em key={i} className={`font-[family-name:var(--vfw-serif)] font-normal not-italic [font-style:italic] tracking-[-0.01em] ${accentClassName}`}>
            {part}
          </em>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
