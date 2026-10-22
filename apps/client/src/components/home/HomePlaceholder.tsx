import { LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { homeTexts } from "../../texts/loginTexts";
import AppFooter from "../layout/AppFooter";
import Button from "../ui/Button";

/** Vorläufige Seite nach dem Login, bis das Dashboard aus v1 übernommen ist. */
export default function HomePlaceholder() {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-[100dvh] flex-col">
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 px-4">
      <h1 className="text-3xl font-bold text-foreground">{homeTexts.signedInAs(user?.name || user?.email || "")}</h1>
      <p className="text-muted-foreground">{homeTexts.pending}</p>
      <Button variant="outline" className="self-start" onClick={() => void logout()} data-testid="logout">
        <LogOut />
        {homeTexts.logout}
      </Button>
    </main>
    <AppFooter />
    </div>
  );
}
