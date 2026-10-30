import type { ITranslation } from "../ITranslation";

const SITE = "https://visit-flow.de";
const IMAGE = `${SITE}/og/visit-flow.png`;

export const EN: ITranslation = {
  LoginPage: {
    MetaTags: {
      title: "Sign in – Visit Flow",
      description:
        "Sign in to Visit Flow and plan your door-to-door visits, walking routes and daily team results in one central place, on your phone and on your desktop.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Sign in", "Field sales", "Door-to-door"],
      url: `${SITE}/login`,
    },
  },

  OnboardingPage: {
    MetaTags: {
      title: "Start Your Team – Visit Flow",
      description:
        "Start with your own team in Visit Flow: book team licenses, set up your organization account and manage field sales, territories and closings from day one.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Onboarding", "Team licensing", "Field sales"],
      url: `${SITE}/onboarding`,
    },
  },

  DashboardPage: {
    MetaTags: {
      title: "Route List – Visit Flow",
      description:
        "Your route list in Visit Flow: interactive map, visits and daily goals at a glance, so you work faster in the field and never forget a single door again.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Route list", "Map"],
      url: `${SITE}/dashboard`,
    },
  },

  PendingPage: {
    MetaTags: {
      title: "Visit Flow",
      description:
        "This part of Visit Flow is currently being moved over from the previous app. Until then you will find your interactive map and route list in the app as usual.",
      imgUrl: IMAGE,
      tags: ["Visit Flow"],
      url: SITE,
    },
  },

  BattlePage: {
    MetaTags: {
      title: "Battle Arena – Visit Flow",
      description:
        "The Battle Arena in Visit Flow: challenge your team, follow live points and winning streaks, and look back at the day with the top earners of your team.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Battle", "Team", "Competition"],
      url: `${SITE}/battle`,
    },
  },

  CalculatorPage: {
    MetaTags: {
      title: "Calculator – Visit Flow",
      description:
        "The calculator in Visit Flow: compare tariffs, show savings at the kitchen table and quickly calculate with VAT, on your phone and on your desktop.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Calculator", "Tariff comparison", "Pencil Sell"],
      url: `${SITE}/statistics`,
    },
  },
  AssistantPage: {
    MetaTags: {
      title: "Assistant – Visit Flow",
      description:
        "The assistant in Visit Flow: objections, FAQ and hotlines at hand, your commission, goals and challenges at a glance and every sales portal in one place.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Assistant", "Knowledge base", "Commission", "D2D"],
      url: `${SITE}/pattern-analysis-demo`,
    },
  },
  SettingsPage: {
    MetaTags: {
      title: "Settings – Visit Flow",
      description:
        "Your settings in Visit Flow: privacy and your data, consent choices and security in one place, changeable at any time and on every device you use.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Settings", "Privacy", "Security"],
      url: `${SITE}/settings`,
    },
  },
  PrivacySettingsPage: {
    MetaTags: {
      title: "Privacy & My Data – Visit Flow",
      description:
        "Privacy and your data in Visit Flow: review stored personal details, download a full data copy, adjust consent preferences or delete your account anytime.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Privacy", "GDPR", "Data export"],
      url: `${SITE}/privacy-settings`,
    },
  },
  AbrechnungPage: {
    MetaTags: {
      title: "Billing – Visit Flow",
      description:
        "Billing in Visit Flow: match the partner statement against your tracked sales, see open commissions, history and product split, and claim missing items fast.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Billing", "Commission", "Claims"],
      url: `${SITE}/abrechnung`,
    },
  },
  ProfilePage: {
    MetaTags: {
      title: "Profile – Visit Flow",
      description:
        "Your profile in Visit Flow: level and achievements, personal details, nickname, role and team, password, plus your subscription and invoices in one place.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Profile", "Account", "Subscription"],
      url: `${SITE}/profile`,
    },
  },
  SimulatorPage: {
    MetaTags: {
      title: "Commission simulator – Visit Flow",
      description:
        "The commission simulator in Visit Flow: work through tariffs or leads, see bonus tiers per contract month and take the result over as your monthly goal.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Commission", "Simulator", "Bonus", "Monthly goal"],
      url: `${SITE}/provisions-simulator`,
    },
  },
  OverviewPage: {
    MetaTags: {
      title: "Overview – Visit Flow",
      description:
        "Your daily overview in Visit Flow: doors, hit and closing rate, appointments and products sold today, plus team and structure views for leaders and mentors.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Overview", "Daily stats", "Team"],
      url: `${SITE}/daily-view`,
    },
  },
  LicensesPage: {
    MetaTags: {
      title: "Team Licensing – Visit Flow",
      description:
        "Manage team licenses in Visit Flow: see seats and monthly cost at a glance, book, assign and revoke licenses, add partners and download invoices.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Team licenses", "License management", "Subscription"],
      url: `${SITE}/subscription`,
    },
  },
  DailyStatusPage: {
    MetaTags: {
      title: "Daily status – Visit Flow",
      description:
        "Daily status in Visit Flow: report active, wake-up, sick or vacation with a date range and, as a leader, check off and share team attendance every day.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Daily status", "Attendance", "Team"],
      url: `${SITE}/daily-status`,
    },
  },
  TeamPerformancePage: {
    MetaTags: {
      title: "Team performance – Visit Flow",
      description:
        "Team performance in Visit Flow: doors, sales and revenue of your team over 7, 30 or 90 days, with trend, best day and a comparison to the previous period.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Team performance", "Statistics", "Team"],
      url: `${SITE}/team-performance`,
    },
  },
  CrmPage: {
    MetaTags: {
      title: "Orders – Visit Flow",
      description:
        "Orders in Visit Flow: view all monthly sales and cancellations with your live cancellation rate, and complete, cancel or discard your open orders fast.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Orders", "Cancellation", "Cancellation rate"],
      url: `${SITE}/crm`,
    },
  },
  CrmOverviewPage: {
    MetaTags: {
      title: "CRM overview – Visit Flow",
      description:
        "CRM overview for admins in Visit Flow: review sales of every user grouped by customer with commission, filtered by time period, seller and open issues.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "CRM", "Admin", "Sales"],
      url: `${SITE}/admin-crm-overview`,
    },
  },
  ExpiringPage: {
    MetaTags: {
      title: "Expiring contracts – Visit Flow",
      description:
        "Expiring contracts in Visit Flow: customers whose tariff ends within the next 90 days, sorted by time left, filtered and assigned to advisors.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Contracts", "Expiry", "Tariffs", "Admin"],
      url: `${SITE}/expiring-contracts`,
    },
  },
  LogbookPage: {
    MetaTags: {
      title: "Driving log – Visit Flow",
      description:
        "Driving log in Visit Flow: record trips with odometer, destination and purpose, check for gaps, close months and export them for the tax office.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Driving log", "Mileage", "Tax office", "Tax"],
      url: `${SITE}/fahrtenbuch`,
    },
  },
  SecurityPage: {
    MetaTags: {
      title: "Security Dashboard – Visit Flow",
      description:
        "Security Dashboard in Visit Flow: security score, login locks, firewall and whitelist, copy protection, honeypot traps and audit log for admins.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Security", "Firewall", "Audit log", "Admin"],
      url: `${SITE}/security-dashboard`,
    },
  },
  BackofficePage: {
    MetaTags: {
      title: "Team back office – Visit Flow",
      description:
        "Team back office in Visit Flow: team leads review all team sales, confirm, cancel or delete them and keep the monthly cancellation rate in clear view.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Back office", "Team lead", "Sales", "Cancellation"],
      url: `${SITE}/team-backoffice`,
    },
  },

  TeamsPage: {
    MetaTags: {
      title: "My Teams – Visit Flow",
      description:
        "My Teams in Visit Flow: your structure as an expandable tree with daily and monthly numbers, plus managing role, group, mentor, access and team license.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Teams", "Structure", "Management"],
      url: `${SITE}/teams`,
    },
  },

  AdminDashboardPage: {
    MetaTags: {
      title: "Admin Dashboard – Visit Flow",
      description:
        "Admin Dashboard in Visit Flow: sales, cancellation rate, verticals, teams, licenses and activity across all teams, plus open requests and system switches.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Admin", "Dashboard", "Metrics"],
      url: `${SITE}/admin-dashboard`,
    },
  },

  StreetListPage: {
    MetaTags: {
      admin: {
        title: "Admin street list – Visit Flow",
        description:
          "Admin street list in Visit Flow: every street with doors, sales and houses, assign streets, fix addresses, deletion requests and activity per person.",
        imgUrl: IMAGE,
        tags: ["Visit Flow", "Street list", "Admin", "Areas"],
        url: `${SITE}/admin-street-list`,
      },
      struktur: {
        title: "Team street list – Visit Flow",
        description:
          "Team street list in Visit Flow: all streets of your group with doors, sales and houses, filtered by day, period and group, plus activity per person.",
        imgUrl: IMAGE,
        tags: ["Visit Flow", "Street list", "Structure lead", "Team"],
        url: `${SITE}/strukturleiter-street-list`,
      },
      mentor: {
        title: "Mentor street list – Visit Flow",
        description:
          "Mentor street list in Visit Flow: see where your mentees went, with doors, sales and houses per street and their activity tracked per week or month.",
        imgUrl: IMAGE,
        tags: ["Visit Flow", "Street list", "Mentor", "Mentees"],
        url: `${SITE}/mentor-street-list`,
      },
    },
  },
};
