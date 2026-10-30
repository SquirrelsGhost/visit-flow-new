// Liest die Adresse, den Anmeldestatus und hält die Formularwerte im State
"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useLoginTab, type LoginTab } from "../../hooks/useLoginTab";
import type { RegisterOutcome } from "../../hooks/useRegisterFlow";
import { redirectTarget } from "../../lib/auth/redirectTarget";
import { cn } from "../../lib/cn";
import TeamOnboardingWizard from "../onboarding/TeamOnboardingWizard";
import RegisterWizard from "../register/RegisterWizard";
import AutoHeight from "../ui/AutoHeight";
import CardContent from "../ui/CardContent";
import FadeSwap from "../ui/FadeSwap";
import SpotlightCard from "../ui/SpotlightCard";
import TabsContent from "../ui/TabsContent";
import AuthHeader from "./AuthHeader";
import LoginBackground from "./LoginBackground";
import LoginForm from "./LoginForm";
import LoginLoading from "./LoginLoading";
import LoginTabs from "./LoginTabs";

const PANEL = "mt-0 focus-visible:ring-0 focus-visible:ring-offset-0";
/** Das Team-Buchen braucht Platz für die Lizenzen und die drei Zugangsfelder nebeneinander; die Karte wird dafür weich breiter. */
const WIDTH = "transition-[max-width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

/** Login-Karte mit Hintergrund und Reitern, Aufbau aus v1 (pages/Login.tsx), Bewegungen verfeinert. */
export interface LoginScreenProps { readonly _?: never; }

export default function LoginScreen() {
  const router = useRouter();
  const from = useSearchParams().get("from");
  const { isAuthenticated, isLoading, login } = useAuth();
  const [tab, setTab] = useLoginTab();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated && !isLoading) router.replace(redirectTarget(from));
  }, [isAuthenticated, isLoading, router, from]);

  /** Nach der Registrierung: sofort anmelden, wenn das Konto aktiv ist, sonst mit vorausgefüllter E-Mail zum Login. */
  function handleRegistered(outcome: RegisterOutcome, registeredEmail: string, registeredPassword: string) {
    setEmail(registeredEmail);
    if (outcome === "created") void login(registeredEmail, registeredPassword, false);
    else setTab("login");
  }

  if (isLoading) return <LoginLoading />;

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 relative overflow-x-hidden overflow-y-auto">
      <LoginBackground />
      <div className="relative z-10 min-h-[100dvh] flex items-start justify-center px-4 pb-6 pt-[max(1.5rem,calc(50dvh-300px))] mobile-bottom-safe">
        <div className={cn("w-full mx-auto", WIDTH, tab === "onboarding" ? "max-w-[640px]" : "max-w-[440px]")}>
          <SpotlightCard className="w-full border border-border/40 dark:border-border/20 shadow-[0_24px_60px_-24px_rgba(127,29,29,0.25)] dark:shadow-black/50 rounded-[28px] overflow-hidden backdrop-blur-md bg-card/98 dark:bg-card/95 mobile-bottom-safe">
            <AuthHeader />
            <Tabs.Root value={tab} onValueChange={(value) => setTab(value as LoginTab)}>
              <LoginTabs active={tab} />
              <AutoHeight>
                <CardContent className="px-5 sm:px-7 pt-6 pb-7">
                  <TabsContent value="onboarding" className={PANEL}>
                    <TeamOnboardingWizard onSwitchToLogin={() => setTab("login")} onSwitchToRegister={() => setTab("register")} />
                  </TabsContent>
                  <TabsContent value="login" className={PANEL}>
                    <LoginForm email={email} setEmail={setEmail} password={password} setPassword={setPassword} />
                  </TabsContent>
                  <TabsContent value="register" className={PANEL}>
                    <FadeSwap>
                      <RegisterWizard onFinished={handleRegistered} />
                    </FadeSwap>
                  </TabsContent>
                </CardContent>
              </AutoHeight>
            </Tabs.Root>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
