import { Fragment } from "react";

interface CopilotRichTextProps {
  text: string;
}

/** Zeilenumbrüche und **fett** wie in v1; sonst kein Markdown, damit nichts Fremdes als HTML landet. */
export default function CopilotRichText({ text }: CopilotRichTextProps) {
  const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
  return (
    <div className="whitespace-pre-wrap break-words">
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="font-semibold text-foreground">
            {part}
          </strong>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </div>
  );
}
