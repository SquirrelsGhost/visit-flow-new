// Der angemeldete Nutzer kommt aus dem Browser
"use client";

import { useAuth } from "../../hooks/useAuth";
import GlassPage from "../glass/GlassPage";
import Logbook from "./Logbook";

/** Rahmen der Seite: jeder angemeldete Nutzer führt sein eigenes Fahrtenbuch. */
export interface LogbookViewProps { readonly _?: never; }

export default function LogbookView() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <GlassPage>
      <div className="h-full overflow-y-auto overflow-x-hidden overscroll-contain">
        <Logbook userId={user.id} driver={user.name ?? user.email ?? ""} />
      </div>
    </GlassPage>
  );
}
