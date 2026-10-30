import { ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { redirectTarget } from "../../lib/auth/redirectTarget";
import { DEMO_LOGIN_ENABLED } from "../../lib/auth/demoSession";
import { loginTexts } from "../../texts/loginTexts";

/** Dezenter Zugang als Demo-Admin ohne laufende API. Erscheint nur bei `npm run dev`. */
export interface DemoLoginButtonProps { readonly _?: never; }

export default function DemoLoginButton() {
  const router = useRouter();
  const from = useSearchParams().get("from");
  const { loginDemo } = useAuth();
  if (!DEMO_LOGIN_ENABLED) return null;

  return (
    <button
      type="button"
      onClick={() => {
        loginDemo();
        router.replace(redirectTarget(from));
      }}
      className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-transparent text-[13px] font-medium text-slate-600 transition-colors duration-300 hover:border-red-300 hover:bg-red-50/60 hover:text-red-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-300"
      data-testid="login-demo-admin"
    >
      <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
      {loginTexts.demoAdmin}
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-neutral-800 dark:text-neutral-400">
        {loginTexts.demoHint}
      </span>
    </button>
  );
}
