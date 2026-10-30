import { AnimatePresence, motion } from "motion/react";

interface FormErrorProps {
  message: string | null;
}

/** Fehlerzeile unter einem Formular; blendet weich ein und aus und wird vorgelesen. */
export default function FormError({ message }: FormErrorProps) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-[12px] font-medium text-red-600 dark:text-red-400"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
