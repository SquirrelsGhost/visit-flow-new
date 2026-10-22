import { Toaster as Sonner } from "sonner";
import { useTheme } from "../../hooks/useTheme";

/** Kurze Hinweise oben in der Mitte, 1,5 s sichtbar, Stile aus v1 (shared/components/ui/sonner.tsx). */
export default function Toaster() {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-center"
      duration={1500}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-gray-900 dark:group-[.toaster]:text-white dark:group-[.toaster]:border-gray-800",
          description: "group-[.toast]:text-muted-foreground dark:group-[.toast]:text-gray-400",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground dark:group-[.toast]:bg-blue-600 dark:group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground dark:group-[.toast]:bg-gray-700 dark:group-[.toast]:text-gray-300",
        },
      }}
    />
  );
}
