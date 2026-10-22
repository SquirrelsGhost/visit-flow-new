import type { ITranslation } from "../ITranslation";

const SITE = "https://visit-flow.de";
const IMAGE = `${SITE}/og/visit-flow.png`;

export const EN: ITranslation = {
  LoginPage: {
    MetaTags: {
      title: "Sign in – Visit Flow",
      description:
        "Sign in to Visit Flow and plan your door-to-door visits, walking routes and team results in one place, on your phone and on your desktop.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Sign in", "Field sales", "Door-to-door"],
      url: `${SITE}/login`,
    },
  },

  DashboardPage: {
    MetaTags: {
      title: "Route List – Visit Flow",
      description:
        "Your route list in Visit Flow: map, visits and daily goals at a glance, so you work faster in the field and never forget a door again.",
      imgUrl: IMAGE,
      tags: ["Visit Flow", "Route list", "Map"],
      url: `${SITE}/dashboard`,
    },
  },
};
