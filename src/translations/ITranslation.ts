import type { IMetaTags } from "../services/MetaTagService";

/**
 * Serverseitige Übersetzungen (Meta-Tags je Seite) nach dem Muster des Next.js-Fundaments.
 * Jede Sprache muss jeden Schlüssel liefern, sonst bricht der Typecheck ab.
 * Texte in der App selbst liegen weiter in src/texts/.
 */
export interface ITranslation {
  LoginPage: {
    MetaTags: IMetaTags;
  };

  OnboardingPage: {
    MetaTags: IMetaTags;
  };

  DashboardPage: {
    MetaTags: IMetaTags;
  };

  PendingPage: {
    MetaTags: IMetaTags;
  };

  BattlePage: {
    MetaTags: IMetaTags;
  };

  CalculatorPage: {
    MetaTags: IMetaTags;
  };

  AssistantPage: {
    MetaTags: IMetaTags;
  };

  SettingsPage: {
    MetaTags: IMetaTags;
  };

  PrivacySettingsPage: {
    MetaTags: IMetaTags;
  };

  AbrechnungPage: {
    MetaTags: IMetaTags;
  };

  ProfilePage: {
    MetaTags: IMetaTags;
  };

  SimulatorPage: {
    MetaTags: IMetaTags;
  };

  OverviewPage: {
    MetaTags: IMetaTags;
  };

  LicensesPage: {
    MetaTags: IMetaTags;
  };

  DailyStatusPage: {
    MetaTags: IMetaTags;
  };

  TeamPerformancePage: {
    MetaTags: IMetaTags;
  };

  CrmPage: {
    MetaTags: IMetaTags;
  };

  CrmOverviewPage: {
    MetaTags: IMetaTags;
  };

  ExpiringPage: {
    MetaTags: IMetaTags;
  };

  LogbookPage: {
    MetaTags: IMetaTags;
  };

  SecurityPage: {
    MetaTags: IMetaTags;
  };

  BackofficePage: {
    MetaTags: IMetaTags;
  };

  TeamsPage: {
    MetaTags: IMetaTags;
  };

  AdminDashboardPage: {
    MetaTags: IMetaTags;
  };

  /** Eine Seite für Admin-, Team- und Mentor-Straßenliste, Meta je Sicht. */
  StreetListPage: {
    MetaTags: Record<"admin" | "struktur" | "mentor", IMetaTags>;
  };
}
