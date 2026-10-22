import * as Tabs from "@radix-ui/react-tabs";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useLoginTab, type LoginTab } from "../../hooks/useLoginTab";
import { redirectTarget } from "../../lib/auth/redirectTarget";
import Card from "../ui/Card";
import CardContent from "../ui/CardContent";
import TabsContent from "../ui/TabsContent";
import AuthHeader from "./AuthHeader";
import LoginBackground from "./LoginBackground";
import LoginForm from "./LoginForm";
import LoginLoading from "./LoginLoading";
import LoginTabs from "./LoginTabs";
import TabPending from "./TabPending";

const PANEL = "animate-fade-in mt-0";

/** Login-Karte mit Hintergrund und Reitern, Aufbau 1:1 aus v1 (pages/Login.tsx). */
export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [tab, setTab] = useLoginTab();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated && !isLoading) navigate(redirectTarget(location.state), { replace: true });
  }, [isAuthenticated, isLoading, navigate, location.state]);

  if (isLoading) return <LoginLoading />;

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 relative overflow-x-hidden overflow-y-auto">
      <LoginBackground />
      <div className="relative z-10 min-h-[100dvh] flex items-center justify-center px-4 py-8 max-[700px]:items-start max-[700px]:py-3 mobile-bottom-safe">
        <div className="w-full max-w-4xl mx-auto">
          <Card className="w-full border border-border/40 dark:border-border/20 shadow-2xl dark:shadow-black/50 rounded-3xl overflow-hidden backdrop-blur-md bg-card/98 dark:bg-card/95 animate-fade-in mobile-bottom-safe">
            <AuthHeader />
            <Tabs.Root value={tab} onValueChange={(value) => setTab(value as LoginTab)}>
              <LoginTabs />
              <CardContent className="px-4 sm:px-6 pt-5 pb-8">
                <TabsContent value="onboarding" className={PANEL}>
                  <TabPending />
                </TabsContent>
                <TabsContent value="login" className={PANEL}>
                  <LoginForm email={email} setEmail={setEmail} password={password} setPassword={setPassword} />
                </TabsContent>
                <TabsContent value="register" className={PANEL}>
                  <TabPending />
                </TabsContent>
              </CardContent>
            </Tabs.Root>
          </Card>
        </div>
      </div>
    </div>
  );
}
