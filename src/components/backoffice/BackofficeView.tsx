// Rolle und Add-on kommen aus dem Browser
"use client";

import { useBackofficeAccess } from "../../hooks/useBackofficeAccess";
import CrmSkeleton from "../crm/CrmSkeleton";
import GlassPage from "../glass/GlassPage";
import Backoffice from "./Backoffice";
import BackofficeNoAccess from "./BackofficeNoAccess";
import BackofficeTeaser from "./BackofficeTeaser";

interface BackofficeViewProps {
  /** ?angebot=1: Admin sieht das Angebot so, wie Teamleiter ohne Add-on es sehen. */
  teaser: boolean;
}

/** Rahmen des Team-Backoffice: Admin und Teamleiter mit Add-on arbeiten, Teamleiter ohne Add-on sehen das Angebot. */
export default function BackofficeView({ teaser }: BackofficeViewProps) {
  const access = useBackofficeAccess();
  return (
    <GlassPage>
      <div className="h-full overflow-y-auto overflow-x-hidden overscroll-contain">
        {access === null && (
          <div className="mx-auto max-w-xl px-4 pt-5">
            <CrmSkeleton />
          </div>
        )}
        {access === "none" && <BackofficeNoAccess />}
        {access === "locked" && <BackofficeTeaser preview={false} />}
        {access === "admin" && teaser && <BackofficeTeaser preview />}
        {(access === "active" || (access === "admin" && !teaser)) && <Backoffice admin={access === "admin"} />}
      </div>
    </GlassPage>
  );
}
