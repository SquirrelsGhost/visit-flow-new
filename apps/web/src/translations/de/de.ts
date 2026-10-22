import type { ITranslation } from "../ITranslation";

const SITE = "https://visit-flow.de";
const IMAGE = `${SITE}/og/visit-flow.png`;

export const DE: ITranslation = {
  LoginPage: {
    MetaTags: {
      title: "Anmelden – Visit Flow",
      description:
        "Melde dich bei Visit Flow an und plane deine Haustür-Besuche, Laufwege und Team-Ergebnisse an einem Ort, auf dem Handy und am Rechner.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Anmelden", "Außendienst", "Haustürgeschäft"],
      url: `${SITE}/login`,
    },
  },

  DashboardPage: {
    MetaTags: {
      title: "Laufliste – Visit Flow",
      description:
        "Deine Laufliste in Visit Flow: Karte, Besuche und Tagesziele auf einen Blick, damit du draußen schneller arbeitest und nichts vergisst.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Laufliste", "Karte"],
      url: `${SITE}/dashboard`,
    },
  },
};
