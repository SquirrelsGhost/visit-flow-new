import type { AuthUser } from "@visit-flow/shared/auth";
import { CONSENT_OPEN_EVENT } from "@visit-flow/shared/consent";
import { LogOut, Settings, ShieldCheck, User as UserIcon } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "../../hooks/useTranslation";
import { SNAPPY_SPRING } from "../../lib/motion/presets";
import { roleLabel } from "../../texts/appTexts";
import { consentTexts } from "../../texts/consentTexts";
import UserAvatar from "./UserAvatar";
import UserMenuItem from "./UserMenuItem";

interface UserMenuPanelProps {
  user: AuthUser;
  onClose: () => void;
  onLogout: () => void;
}

const PANEL =
  "absolute right-0 top-full z-50 mt-3 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900";

/**
 * Inhalt des Benutzermenüs aus v1: Kopf mit Name, E-Mail und Rolle, darunter Profil, Einstellungen, Abmelden.
 * Neu: Datenschutz-Einstellungen, damit der Widerruf von überall erreichbar bleibt (Art. 7 Abs. 3 DSGVO).
 */
export default function UserMenuPanel({ user, onClose, onLogout }: UserMenuPanelProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      role="menu"
      className={PANEL}
      initial={{ opacity: 0, scale: 0.92, y: -8, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.95, y: -6, filter: "blur(4px)", transition: { duration: 0.15 } }}
      transition={SNAPPY_SPRING}
    >
      <div className="border-b border-slate-200 bg-gradient-to-br from-red-50 to-red-100 px-4 py-4 dark:border-slate-700 dark:from-red-950/40 dark:to-red-900/30">
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name ?? user.email} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight text-slate-900 dark:text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
          </div>
        </div>
        <span className="mt-3 inline-flex items-center rounded-full border border-red-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:border-red-800 dark:bg-slate-800 dark:text-red-400">
          {roleLabel(user.role)}
        </span>
      </div>
      <motion.ul
        className="space-y-1 p-2"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
      >
        <UserMenuItem icon={UserIcon} label={t("nav.profile")} href="/profile" onSelect={onClose} tone="bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" />
        <UserMenuItem icon={Settings} label={t("nav.settings")} href="/settings" onSelect={onClose} tone="bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400" />
        <UserMenuItem
          icon={ShieldCheck}
          label={consentTexts.settingsLink}
          onSelect={() => {
            onClose();
            window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
          }}
          tone="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
        />
        <li role="separator" className="my-2 h-px bg-slate-200 dark:bg-slate-700" />
        <UserMenuItem icon={LogOut} label={t("nav.logout")} onSelect={onLogout} tone="text-red-600 dark:text-red-400" danger />
      </motion.ul>
    </motion.div>
  );
}
