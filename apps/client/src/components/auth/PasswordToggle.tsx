import { Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Button from "../ui/Button";

interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
  testId?: string;
}

const ICON = "h-4 w-4 text-muted-foreground hover:text-foreground transition-colors";

/** Auge zum Ein- und Ausblenden des Passworts; das Symbol dreht sich weich in den neuen Zustand. */
export default function PasswordToggle({ visible, onToggle, disabled, testId }: PasswordToggleProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 hover:bg-transparent dark:hover:bg-transparent"
      onClick={onToggle}
      disabled={disabled}
      tabIndex={-1}
      data-testid={`${testId}-password-toggle`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={visible ? "hide" : "show"}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.18 }}
          className="flex"
        >
          {visible ? <EyeOff className={ICON} /> : <Eye className={ICON} />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
