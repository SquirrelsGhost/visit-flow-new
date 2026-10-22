import { LogIn, Rocket, UserPlus } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { loginTexts } from "../../texts/loginTexts";
import TabsList from "../ui/TabsList";
import TabsTrigger from "../ui/TabsTrigger";

const TRIGGER =
  "flex items-center justify-center gap-2 data-[state=inactive]:bg-transparent data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-neutral-300 py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-all duration-200 h-10 touch-manipulation";
const PLAIN_ACTIVE =
  "font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm";
const BOOKING_ACTIVE =
  "font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md";

/** Reiter "Eigenes Team buchen", "Anmelden" und "Berater-Beitritt" (v1 Login.tsx). */
export default function LoginTabs() {
  const { t } = useTranslation();
  return (
    <div className="px-4 sm:px-6 pt-5">
      <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full bg-slate-100/90 dark:bg-neutral-900/90 p-1.5 h-auto gap-1.5 rounded-2xl border border-slate-200/80 dark:border-neutral-800">
        <TabsTrigger value="onboarding" className={`${TRIGGER} ${BOOKING_ACTIVE}`}>
          <Rocket className="w-4 h-4 shrink-0" />
          <span>{loginTexts.tabOnboarding}</span>
        </TabsTrigger>
        <TabsTrigger value="login" className={`${TRIGGER} ${PLAIN_ACTIVE}`}>
          <LogIn className="w-4 h-4 shrink-0" />
          <span>{t("auth.login")}</span>
        </TabsTrigger>
        <TabsTrigger value="register" className={`${TRIGGER} ${PLAIN_ACTIVE}`}>
          <UserPlus className="w-4 h-4 shrink-0" />
          <span>{loginTexts.tabRegister}</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
}
