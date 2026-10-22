// Braucht die Übersetzungen aus dem Context
"use client";

import { useTranslation } from "../../hooks/useTranslation";
import LoadingSpinner from "../loading/LoadingSpinner";

/** Ladebildschirm, solange beim Start die bestehende Sitzung geprüft wird (v1 Login.tsx). */
export default function LoginLoading() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-red-50/20 to-gray-50 dark:from-gray-950 dark:via-red-950/10 dark:to-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-red-200/30 dark:bg-red-900/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-red-300/30 dark:bg-red-800/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>
      <div className="text-center relative z-10">
        <div className="mb-6">
          <LoadingSpinner size="lg" />
        </div>
        <p className="text-base font-medium text-gray-700 dark:text-gray-300">{t("auth.loading")}</p>
      </div>
    </div>
  );
}
