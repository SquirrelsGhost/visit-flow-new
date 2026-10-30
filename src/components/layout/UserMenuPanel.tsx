import type { AuthUser } from "@/shared/auth/authSchemas";
import { LogOut } from "lucide-react";
import { motion } from "motion/react";
import { Fragment, useMemo } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { SNAPPY_SPRING, staggerParent } from "../../lib/motion/presets";
import { buildUserMenu } from "../../lib/navigation/userMenuItems";
import UserMenuDivider from "./UserMenuDivider";
import UserMenuHeader from "./UserMenuHeader";
import UserMenuItem from "./UserMenuItem";

interface UserMenuPanelProps {
  user: AuthUser;
  onClose: () => void;
  onLogout: () => void;
}

const PANEL =
  "absolute right-0 top-full z-50 mt-3 flex max-h-[calc(100dvh-6rem)] w-72 origin-top-right flex-col overflow-hidden glass-surface glass-blur rounded-[24px]";
const LIST = "min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-2 scrollbar-hide";

/**
 * Inhalt des Benutzermenüs wie in v1: Kopf mit Name, E-Mail und Rolle, darunter Tagesstatus und Teamleistung,
 * die Kurzbefehle der Rolle (Admin, Teamleiter, Strukturleiter, Mentor), dann Profil, Partnerprogramm, Einstellungen und Abmelden.
 */
export default function UserMenuPanel({ user, onClose, onLogout }: UserMenuPanelProps) {
  const { t } = useTranslation();
  const groups = useMemo(() => buildUserMenu(user), [user]);
  return (
    <motion.div
      role="menu"
      aria-label={t("header.userAccount")}
      className={PANEL}
      initial={{ opacity: 0, scale: 0.92, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.15 } }}
      transition={SNAPPY_SPRING}
    >
      <UserMenuHeader user={user} />
      <motion.ul className={LIST} role="none" initial="hidden" animate="show" variants={staggerParent(0.03, 0.05)}>
        {groups.map((group, index) => (
          <Fragment key={group.id}>
            {index > 0 && <UserMenuDivider caption={group.captionKey ? t(group.captionKey) : undefined} />}
            {group.items.map((item) => (
              <UserMenuItem key={item.id} icon={item.icon} label={t(item.labelKey)} href={item.href} tone={item.tone} onSelect={onClose} />
            ))}
          </Fragment>
        ))}
        <UserMenuDivider />
        <UserMenuItem icon={LogOut} label={t("nav.logout")} onSelect={onLogout} tone="text-red-600 dark:text-red-400" danger />
      </motion.ul>
    </motion.div>
  );
}
