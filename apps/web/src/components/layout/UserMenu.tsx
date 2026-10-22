import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "../../hooks/useTranslation";
import UserAvatar from "./UserAvatar";
import UserMenuPanel from "./UserMenuPanel";

/** Avatar rechts in der Topbar; öffnet das Benutzermenü. Schließt bei Klick daneben und mit Escape. */
export default function UserMenu() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.replace("/login?tab=login");
  };

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        type="button"
        aria-label={t("header.userAccount")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        className="no-touch-target-fix rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
        data-testid="user-menu"
      >
        <UserAvatar name={user.name ?? user.email} />
      </motion.button>
      <AnimatePresence>
        {open && <UserMenuPanel key="menu" user={user} onClose={() => setOpen(false)} onLogout={() => void handleLogout()} />}
      </AnimatePresence>
    </div>
  );
}
