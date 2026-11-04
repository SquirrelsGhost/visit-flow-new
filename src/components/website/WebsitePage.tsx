import WebsiteFooter from "./footer/WebsiteFooter";
import RevierJourney from "./journey/RevierJourney";
import WebsiteNav from "./nav/WebsiteNav";
import QuoteSection from "./outro/QuoteSection";
import PricingSection from "./pricing/PricingSection";
import WebsiteRoot from "./WebsiteRoot";

/** Die öffentliche Website von Visit Flow: eine Reise durchs 3D-Revier, danach Praxis, Preise und Fußzeile. */
export interface WebsitePageProps { readonly _?: never; }

export default function WebsitePage() {
  return (
    <WebsiteRoot>
      <WebsiteNav />
      <main>
        <RevierJourney />
        <QuoteSection />
        <PricingSection />
      </main>
      <WebsiteFooter />
    </WebsiteRoot>
  );
}
