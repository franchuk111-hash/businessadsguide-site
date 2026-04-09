import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { localeConfigs } from "./locales.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const outputDirArg = process.env.SITE_OUTPUT_DIR?.trim() ?? "";
const root = outputDirArg ? path.resolve(projectRoot, outputDirArg) : projectRoot;
const outputRelativePath = path.relative(projectRoot, root);

if (outputDirArg && (outputRelativePath.startsWith("..") || path.isAbsolute(outputRelativePath))) {
  throw new Error("SITE_OUTPUT_DIR must stay inside the project root.");
}

const usingDedicatedOutputDir = Boolean(outputDirArg) && root !== projectRoot;

const geoEntries = [
  ["mexico", "Mexico", "LATAM", "MXN", "Spanish-speaking growth brands and cross-border sellers", "Flexible entry budgets and mobile-first discovery make TikTok a practical channel for brands scaling across Mexico's digital commerce wave.", "Retail, DTC, food delivery, beauty, education", "If your business needs affordable reach and visual product discovery, Mexico is a strong launch market."],
  ["germany", "Germany", "Europe", "EUR", "Performance-led brands that value precision and measurable expansion", "Germany rewards structured campaign planning, strong creative testing, and clear value messaging for high-intent audiences.", "B2B services, ecommerce, fintech, SaaS", "TikTok can work well in Germany when the offer is clear, the creative is credible, and the funnel is efficient."],
  ["france", "France", "Europe", "EUR", "Lifestyle, ecommerce, and premium consumer brands", "French audiences often respond well to brand-led storytelling backed by clear product utility and strong creative presentation.", "Fashion, beauty, home, apps, premium retail", "Brands entering France benefit from campaigns that balance discovery with polished positioning."],
  ["south-korea", "South Korea", "APAC", "KRW", "Digitally mature brands and app marketers", "South Korea's mobile-first market favors fast creative iteration, trend-aware campaigns, and sharp performance tracking.", "Apps, gaming, beauty, electronics, ecommerce", "TikTok offers strong upside in South Korea for brands prepared to localize creative and move quickly."],
  ["uae", "UAE", "MENA", "AED", "Ambitious brands targeting high-value urban audiences", "The UAE is attractive for businesses that need premium positioning, multilingual reach, and fast campaign deployment.", "Luxury, hospitality, ecommerce, real estate, services", "For brands entering the Gulf, TikTok can combine discovery, reach, and strong market-testing speed."],
  ["austria", "Austria", "Europe", "EUR", "Regional advertisers and cross-border European brands", "Austria supports efficient testing for advertisers who want German-speaking reach without relying on one market alone.", "Retail, services, SaaS, tourism", "Austria is a useful expansion step for brands already active in the DACH region."],
  ["australia", "Australia", "APAC", "AUD", "Growth brands balancing scale with efficient customer acquisition", "Australia combines high digital adoption with strong demand for clear offers and performance-led creative.", "Ecommerce, education, services, apps", "TikTok can help Australian advertisers reach intent-rich audiences without relying only on mature search and social channels."],
  ["belgium", "Belgium", "Europe", "EUR", "Brands needing multilingual reach and regional campaign flexibility", "Belgium benefits advertisers who can tailor messaging across language segments and test multiple audience clusters quickly.", "Retail, local services, B2B, ecommerce", "TikTok is useful in Belgium for brands that need discovery traffic beyond crowded legacy channels."],
  ["benin", "Benin", "Africa", "XOF", "Early-stage digital businesses and market-entry advertisers", "Benin offers an emerging opportunity for brands testing mobile-first awareness and customer acquisition in West Africa.", "Retail, education, telecom, services", "Businesses exploring frontier growth markets can use TikTok to validate demand faster in Benin."],
  ["brazil", "Brazil", "LATAM", "BRL", "High-volume consumer brands and performance marketers", "Brazil's scale, creator culture, and mobile commerce momentum make it one of the most dynamic TikTok ad environments.", "Ecommerce, apps, beauty, finance, food", "TikTok is a strong fit for brands that need reach, creative volume, and fast market learning in Brazil."],
  ["canada", "Canada", "North America", "CAD", "Brands seeking broad reach across diverse audiences", "Canada rewards advertisers who combine broad awareness with disciplined regional and demographic targeting.", "Retail, SaaS, education, apps, services", "TikTok can support Canadian growth by expanding beyond search capture into demand creation."],
  ["switzerland", "Switzerland", "Europe", "CHF", "Premium brands and performance-conscious advertisers", "Switzerland favors clear trust signals, strong landing page quality, and disciplined targeting across language regions.", "Luxury, finance, healthcare, ecommerce", "TikTok in Switzerland works best for brands that pair premium creative with a clean conversion path."],
  ["chile", "Chile", "LATAM", "CLP", "Growth-focused brands targeting digitally active consumers", "Chile offers a practical testing ground for brands expanding in Latin America with performance-led creative.", "Retail, ecommerce, education, apps", "TikTok helps Chilean campaigns capture attention quickly while validating offer-market fit."],
  ["colombia", "Colombia", "LATAM", "COP", "Consumer brands and local businesses pursuing efficient acquisition", "Colombia's mobile audience and growing ecommerce adoption create strong conditions for scalable discovery campaigns.", "Retail, services, beauty, apps, education", "For Colombia, TikTok is useful when the message is simple, visual, and easy to act on."],
  ["czech-republic", "Czech Republic", "Europe", "CZK", "SMBs and regional brands expanding in Central Europe", "The Czech market rewards efficient budgets, clear value propositions, and flexible testing across audience segments.", "Retail, services, SaaS, tourism", "TikTok can be a smart growth channel in the Czech Republic for businesses that need cost-aware expansion."],
  ["denmark", "Denmark", "Europe", "DKK", "Brands prioritizing quality traffic and clean user experience", "Denmark often responds well to transparent offers, polished creative, and friction-light landing pages.", "Design, ecommerce, services, apps", "TikTok supports Danish growth when campaigns respect user experience and deliver clear relevance."],
  ["ecuador", "Ecuador", "LATAM", "USD", "Local businesses and regional ecommerce brands", "Ecuador presents a valuable mobile-first acquisition opportunity for brands testing demand with flexible budgets.", "Retail, services, delivery, education", "TikTok gives Ecuadorian advertisers a fast way to build awareness and turn interest into action."],
  ["egypt", "Egypt", "MENA", "EGP", "Mass-market brands and digital-first service providers", "Egypt's large population and strong mobile usage make TikTok attractive for scaled reach and category education.", "Education, fintech, retail, services, apps", "For Egypt, TikTok can accelerate market penetration when creative is localized and action-focused."],
  ["spain", "Spain", "Europe", "EUR", "Consumer brands, travel, and service-led businesses", "Spain offers a strong blend of creative engagement and ecommerce readiness for advertisers that need growth with flexibility.", "Travel, ecommerce, education, apps, retail", "TikTok is a good fit in Spain for brands combining clear offers with native-feeling visual storytelling."],
  ["finland", "Finland", "Europe", "EUR", "Efficiency-minded advertisers and digital-native companies", "Finland often rewards concise messaging, strong usability, and campaigns that move quickly from interest to action.", "SaaS, apps, services, retail", "TikTok can help Finnish advertisers broaden reach without sacrificing performance discipline."],
  ["uk", "United Kingdom", "Europe", "GBP", "Competitive brands looking for incremental growth", "The UK market is crowded, so TikTok stands out when advertisers need fresh attention, sharp positioning, and creative testing speed.", "Ecommerce, finance, SaaS, agencies, apps", "For UK advertisers, TikTok can unlock demand beyond saturated search and social assumptions."],
  ["greece", "Greece", "Europe", "EUR", "Local businesses, tourism brands, and ambitious SMBs", "Greece benefits from visually led campaigns that convert attention into enquiries, bookings, or store visits.", "Tourism, hospitality, retail, services", "TikTok works well in Greece when the offer is easy to understand and quick to act on."],
  ["hungary", "Hungary", "Europe", "HUF", "Cost-aware advertisers and regional expansion teams", "Hungary supports efficient testing for brands that need flexible budgets and fast signal collection.", "Retail, apps, services, education", "TikTok can be a valuable channel in Hungary for structured acquisition without heavy setup overhead."],
  ["indonesia", "Indonesia", "APAC", "IDR", "Scale-seeking brands and app growth teams", "Indonesia combines huge mobile usage, creator-led discovery, and strong commerce potential for ambitious advertisers.", "Apps, ecommerce, gaming, fintech, beauty", "TikTok is one of the most natural channels for brands wanting broad discovery in Indonesia."],
  ["ireland", "Ireland", "Europe", "EUR", "SMBs, service businesses, and international brands", "Ireland offers a compact but digitally sophisticated market for testing performance-led campaigns.", "Services, SaaS, education, retail", "TikTok in Ireland can help advertisers generate new demand without relying only on search intent."],
  ["israel", "Israel", "MENA", "ILS", "Tech-forward brands and agile growth teams", "Israel favors advertisers who move quickly, test frequently, and combine strong creative with precise targeting.", "Apps, SaaS, ecommerce, services", "TikTok can help Israeli advertisers scale awareness and conversion opportunities with faster creative feedback loops."],
  ["italy", "Italy", "Europe", "EUR", "Consumer brands balancing style and performance", "Italy rewards campaigns that look polished, feel culturally aware, and make the next step obvious.", "Fashion, beauty, food, travel, ecommerce", "TikTok gives Italian advertisers a strong environment for visual storytelling that still drives action."],
  ["japan", "Japan", "APAC", "JPY", "Brands that value credibility, localization, and disciplined execution", "Japan often requires thoughtful market adaptation, but rewards strong creative consistency and platform-native delivery.", "Apps, electronics, retail, beauty, services", "TikTok can support Japanese campaigns when localization and landing page quality are handled seriously."],
  ["cambodia", "Cambodia", "APAC", "KHR", "Emerging brands and mobile-first market testers", "Cambodia offers a practical entry point for businesses using lightweight creative and flexible budgets to test demand.", "Retail, education, services, telecom", "TikTok can help brands in Cambodia reach growing digital audiences with lower friction."],
  ["kuwait", "Kuwait", "MENA", "KWD", "Premium and service-led brands targeting affluent audiences", "Kuwait can reward advertisers who combine trust, mobile-friendly UX, and clear commercial intent.", "Luxury, healthcare, services, ecommerce", "For Kuwait, TikTok is strongest when campaigns are concise, credible, and conversion-ready."],
  ["morocco", "Morocco", "MENA", "MAD", "Growth businesses targeting broad mobile audiences", "Morocco supports visually driven campaigns for brands that need awareness, enquiries, and customer acquisition at practical budget levels.", "Retail, education, telecom, services", "TikTok is a useful expansion channel in Morocco for businesses ready to test and learn quickly."],
  ["malaysia", "Malaysia", "APAC", "MYR", "Cross-border sellers and digitally native brands", "Malaysia is attractive for advertisers who want multilingual market coverage and efficient ecommerce discovery.", "Ecommerce, apps, education, finance, retail", "TikTok can help Malaysian campaigns scale interest quickly while keeping setup relatively straightforward."],
  ["netherlands", "Netherlands", "Europe", "EUR", "Modern brands that care about efficiency and UX quality", "The Dutch market responds well to sharp positioning, clean design, and direct value communication.", "SaaS, ecommerce, services, education", "TikTok supports Dutch growth when the campaign path is simple and the creative feels relevant."],
  ["norway", "Norway", "Europe", "NOK", "Premium advertisers focused on quality over noise", "Norway benefits from campaigns that feel respectful, useful, and tightly aligned to audience need.", "Services, retail, travel, apps", "TikTok can perform in Norway when the message is clear and the landing experience is polished."],
  ["new-zealand", "New Zealand", "APAC", "NZD", "SMBs and national brands seeking incremental digital growth", "New Zealand offers a manageable testing environment for brands refining creative, offer fit, and audience strategy.", "Retail, tourism, services, education", "TikTok is a strong option in New Zealand for advertisers who want efficient market learning."],
  ["peru", "Peru", "LATAM", "PEN", "Growing brands and local businesses", "Peru gives advertisers a mobile-first environment for building awareness and generating action without enterprise complexity.", "Retail, services, education, delivery", "TikTok can help Peruvian campaigns move quickly from discovery into lead or purchase intent."],
  ["philippines", "Philippines", "APAC", "PHP", "High-engagement brands and app marketers", "The Philippines is well suited to creative-led campaigns that need broad reach, strong engagement, and scalable acquisition.", "Apps, ecommerce, gaming, finance, retail", "TikTok can be a high-potential channel in the Philippines when the offer is accessible and the CTA is clear."],
  ["poland", "Poland", "Europe", "PLN", "Performance marketers seeking scalable European growth", "Poland supports budget-efficient testing and structured campaign scaling for brands that need clear commercial outcomes.", "Ecommerce, SaaS, retail, services", "TikTok in Poland works best when creative is direct and the landing page removes friction fast."],
  ["portugal", "Portugal", "Europe", "EUR", "SMBs, tourism brands, and digital service providers", "Portugal rewards campaigns that blend approachable creative with a fast, trustworthy path to action.", "Tourism, retail, services, education", "TikTok can help Portuguese advertisers create demand before competitors win the click elsewhere."],
  ["qatar", "Qatar", "MENA", "QAR", "Premium advertisers and market-entry brands", "Qatar benefits businesses that need focused audience reach, multilingual messaging, and strong trust presentation.", "Luxury, healthcare, education, services", "TikTok in Qatar can support both awareness and lead intent when the funnel feels credible."],
  ["romania", "Romania", "Europe", "RON", "Cost-conscious businesses chasing efficient growth", "Romania is attractive for brands that want scalable testing and quick learning across mobile-first audiences.", "Retail, apps, services, education", "TikTok can help Romanian advertisers diversify acquisition with strong creative leverage."],
  ["russia", "Russia", "Europe", "RUB", "Large-market advertisers evaluating digital reach strategies", "Russia requires careful local compliance and market planning, but offers broad audience potential for digital-first brands.", "Retail, apps, services, ecommerce", "Any campaign targeting Russia should be reviewed for current platform, legal, and advertising restrictions before launch."],
  ["sweden", "Sweden", "Europe", "SEK", "Brands that value modern UX and thoughtful growth", "Sweden responds well to clear offers, design quality, and campaigns that respect user attention.", "SaaS, ecommerce, services, apps", "TikTok can help Swedish advertisers expand reach while maintaining a premium user experience."],
  ["singapore", "Singapore", "APAC", "SGD", "Regional teams and high-efficiency growth programs", "Singapore is ideal for brands coordinating multi-market campaigns with strong analytics and disciplined messaging.", "SaaS, finance, apps, education, ecommerce", "TikTok is useful in Singapore for both local acquisition and broader APAC market testing."],
  ["thailand", "Thailand", "APAC", "THB", "Consumer brands and commerce-focused marketers", "Thailand offers strong potential for visually driven campaigns that combine reach, engagement, and purchase intent.", "Beauty, ecommerce, travel, apps, retail", "TikTok is a practical fit in Thailand for brands that want speed, scale, and creative flexibility."],
  ["turkey", "Turkey", "MENA", "TRY", "Growth brands balancing scale and budget efficiency", "Turkey gives advertisers a large, mobile-centric audience and a useful market for fast creative learning.", "Retail, apps, education, services", "TikTok can help Turkish advertisers create new demand without requiring heavyweight campaign infrastructure."],
  ["ukraine", "Ukraine", "Europe", "UAH", "Resilient businesses and export-focused growth teams", "Ukraine rewards advertisers that need efficient acquisition, strong digital reach, and flexible campaign control.", "Services, ecommerce, education, apps", "TikTok can help Ukrainian businesses capture attention quickly and expand beyond existing channels."],
  ["usa", "USA", "North America", "USD", "Competitive advertisers that need growth beyond saturated channels", "The US market is crowded, so TikTok is valuable for brands that need fresh demand creation, broad testing, and strong creative leverage.", "Ecommerce, apps, SMBs, agencies, national brands", "TikTok can outperform tired acquisition assumptions in the USA when the message is sharp and the landing page is built to convert."],
  ["vietnam", "Vietnam", "APAC", "VND", "Mobile-first brands and fast-scaling commerce teams", "Vietnam is a strong environment for businesses using short-form creative to accelerate awareness and customer acquisition.", "Ecommerce, apps, education, retail", "TikTok is a natural fit in Vietnam for businesses that want fast market feedback and broad mobile reach."],
  ["south-africa", "South Africa", "Africa", "ZAR", "Growth businesses targeting broad digital audiences", "South Africa offers a meaningful opportunity for brands combining clear offers with efficient mobile-first campaigns.", "Retail, services, education, finance, ecommerce", "TikTok can help South African advertisers reach new audiences without overcomplicating setup."],
];

const geos = geoEntries.map(
  ([
    slug,
    name,
    region,
    currency,
    audienceFit,
    marketBenefit,
    bestFor,
    summary,
  ]) => ({
    slug,
    name,
    region,
    currency,
    audienceFit,
    marketBenefit,
    bestFor,
    summary,
  }),
);

const siteUrl = "https://businessadsguide.com";
const year = new Date().getFullYear();
const siteName = "Business Ads Guide";
const siteDescriptor = "Independent business advertising guide";
const siteSummary =
  "Independent business advertising guide focused on TikTok advertising, market expansion, and commercially smart launch paths for growth teams.";
const editorialTeamName = "Business Ads Guide Editorial Team";
const editorialDateIso = "2026-04-08";
const editorialDateDisplay = "April 8, 2026";
const contactEmail = "hello@businessadsguide.com";
const socialPreviewUrl = `${siteUrl}/assets/og-cover.svg`;
const ga4MeasurementId =
  process.env.GA4_MEASUREMENT_ID?.trim() || "G-B1CP15K4GK";
const googleAdsId = process.env.GOOGLE_ADS_ID?.trim() ?? "";
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim() ?? "";
const affiliateBaseUrl =
  "https://ad.admitad.com/g/077hu89zbva1a61b3e6b76e4f989a7/";
const featuredOfferUrl =
  "https://vxrlm.com/g/9ykxbrt9kja1a61b3e6b76e4f989a7/?i=3";

const routes = {
  home: "/",
  tiktokAds: "/tiktok-ads/",
  partnerOffer: "/partner-offer/",
  howItWorks: "/how-it-works/",
  whyTikTokAds: "/why-tiktok-ads/",
  resources: "/resources/",
  smallBusiness: "/small-business/",
  agencies: "/agencies/",
  markets: "/markets/",
  faq: "/faq/",
  contact: "/contact/",
  about: "/about/",
  siteMap: "/site-map/",
  privacyPolicy: "/privacy-policy/",
  terms: "/terms/",
  affiliateDisclaimer: "/affiliate-disclaimer/",
  projectBlueprint: "/project-blueprint/",
  notFound: "/404.html",
};

const legacyHtmlRedirects = [
  ["/how-it-works.html", routes.howItWorks],
  ["/why-tiktok-ads.html", routes.whyTikTokAds],
  ["/small-business.html", routes.smallBusiness],
  ["/agencies.html", routes.agencies],
  ["/faq.html", routes.faq],
  ["/contact.html", routes.contact],
  ["/about.html", routes.about],
  ["/site-map.html", routes.siteMap],
  ["/privacy-policy.html", routes.privacyPolicy],
  ["/terms.html", routes.terms],
  ["/affiliate-disclaimer.html", routes.affiliateDisclaimer],
  ["/project-blueprint.html", routes.projectBlueprint],
];

const ctaVariants = [
  "Get Started",
  "Explore TikTok Ads",
  "Start Your Campaign",
  "Reach New Customers",
  "Launch in Your Market",
  "See How It Works",
  "Grow With TikTok Advertising",
];

const trustedSources = {
  official: [
    {
      label: "TikTok for Business",
      url: "https://ads.tiktok.com/business/en-US/",
    },
    {
      label: "TikTok Marketing Guide",
      url: "https://ads.tiktok.com/business/en-US/blog/tiktok-marketing-guide/",
    },
  ],
  industry: [
    {
      label: "Sprout Social TikTok ads guide",
      url: "https://sproutsocial.com/insights/tiktok-ads/",
    },
    {
      label: "Shopify TikTok search ads article",
      url: "https://www.shopify.com/blog/tiktok-search-ads",
    },
  ],
};

const partnerOfferSources = [
  {
    label: "TikTok partner offer page",
    url: "https://getstarted.tiktok.com/ttam-partners",
  },
  {
    label: "TikTok get started coupon offer",
    url: "https://getstarted.tiktok.com/smbactivationcouponoffer?lang=en",
  },
  {
    label: "TikTok Coupon Terms",
    url: "https://ads.tiktok.com/help/article/tiktok-coupon-terms?lang=en",
  },
  {
    label: "About TikTok coupons",
    url: "https://ads.tiktok.com/help/article/about-coupons?lang=en",
  },
];

const resourcePages = [
  {
    slug: "tiktok-ads-cost",
    title: "TikTok Ads Budget Planning Guide | Business Ads Guide",
    description:
      "Understand how businesses evaluate TikTok ads cost, set test budgets, and decide when a campaign is ready for measured scale.",
    eyebrow: "Resources",
    h1: "TikTok ads cost: how businesses should think about budget before launch.",
    intro:
      "Cost questions usually hide a deeper concern: can this channel produce useful commercial signal without wasting budget? The right answer is not a universal number. It is a decision framework that helps businesses test responsibly and scale only when the fundamentals are working.",
    sections: [
      {
        eyebrow: "Budget reality",
        title: "A better question than “what does it cost?”",
        body: "Most businesses should evaluate TikTok advertising in terms of test discipline, creative quality, landing page clarity, and conversion goal. A cheap campaign with weak funnel alignment is still expensive. A structured test with clear learning goals is more valuable than chasing a low headline number.",
        items: [
          { title: "Small business approach", body: "Start with a contained test budget, a simple offer, and a short feedback loop." },
          { title: "Ecommerce approach", body: "Budget for creative variation and enough traffic to learn which message or product angle gets traction." },
          { title: "Agency approach", body: "Frame budget as a learning investment tied to stage-gates, not as a promise of immediate scale." },
        ],
      },
      {
        eyebrow: "What affects spend",
        title: "Cost is shaped by more than media buying alone.",
        body: "Audience competition, market maturity, creative relevance, offer strength, and landing-page experience all influence how efficiently a campaign can learn. That is why the best pre-lander does not oversimplify cost into one claim or one benchmark.",
      },
      {
        eyebrow: "Decision rule",
        title: "Spend more only after the signal is real.",
        body: "A business is usually better off increasing budget after it has evidence of message fit, stable engagement quality, and a conversion path that does not leak trust. That protects both paid traffic quality and long-term return potential.",
      },
    ],
    faq: [
      { q: "Do I need a large budget to test TikTok ads?", a: "Not necessarily. Many businesses begin with a controlled test and only expand once the offer, creative, and landing path show credible signs of fit." },
      { q: "Why is there no single cost number on this page?", a: "Because cost changes by market, competition, creative quality, campaign objective, and conversion flow. A realistic guide is more useful than a misleading universal number." },
    ],
  },
  {
    slug: "tiktok-ads-manager-guide",
    title: "TikTok Ads Manager Setup Checklist | Business Ads Guide",
    description:
      "Learn what businesses should validate before using TikTok Ads Manager, from campaign structure and tracking to launch readiness.",
    eyebrow: "Resources",
    h1: "TikTok Ads Manager setup checklist for business teams.",
    intro:
      "Many visitors search for Ads Manager when they are already close to action. At that stage, the real job is not to overwhelm them with interface details. It is to clarify the launch path, the campaign goal, and the readiness signals that make setup more productive.",
    sections: [
      {
        eyebrow: "Before setup",
        title: "Know the business objective first.",
        body: "Before a campaign is configured, the advertiser should be clear on whether the goal is awareness, product discovery, lead intent, app growth, or a market-entry test. The platform setup becomes easier when the objective is already decided.",
      },
      {
        eyebrow: "Campaign readiness",
        title: "A clean launch depends on more than the ad account.",
        body: "Creative variation, landing-page trust, analytics readiness, and realistic expectations all matter. Ads Manager is only one part of the system. A weak landing page or a vague offer can waste a perfectly configured campaign.",
        items: [
          { title: "Creative", body: "Use multiple hooks and clear value propositions rather than one generic message." },
          { title: "Landing page", body: "Keep the page fast, obvious, and aligned with the promise made in the ad." },
          { title: "Tracking", body: "Measure meaningful actions so budget decisions are based on signal rather than guesswork." },
        ],
      },
      {
        eyebrow: "Next step",
        title: "Use setup as a transition into campaign discipline.",
        body: "The strongest advertisers treat setup as the start of a structured testing cycle. That means defined goals, planned creative iteration, and a conversion path built for trust and speed.",
      },
    ],
    faq: [
      { q: "Is TikTok Ads Manager only for experienced media buyers?", a: "No. Beginners can use it too, but they benefit from a simpler decision path and a clear understanding of the objective before they start setting up campaigns." },
      { q: "What should be ready before using Ads Manager?", a: "At minimum, the business should know its goal, offer, target audience, landing page path, and what action it wants to measure." },
    ],
  },
  {
    slug: "tiktok-ads-roi",
    title: "TikTok Ads ROI Guide for Business Growth | Business Ads Guide",
    description:
      "See how businesses should evaluate TikTok ads ROI with stronger creative fit, cleaner landing paths, and disciplined scaling logic.",
    eyebrow: "Resources",
    h1: "TikTok ads ROI: how to think about return without fake certainty.",
    intro:
      "ROI questions are usually really questions about confidence. Can this channel create demand, drive action, and justify more spend over time? A serious answer avoids guarantees and focuses on the variables a business can actually improve.",
    sections: [
      {
        eyebrow: "What shapes ROI",
        title: "Return is built across the whole funnel.",
        body: "Creative strength, audience relevance, offer quality, landing-page trust, and measurement accuracy all shape whether a campaign can produce efficient outcomes. When one of those layers is weak, ROI analysis becomes noisy and misleading.",
      },
      {
        eyebrow: "Measurement",
        title: "Judge the right stage, not only the final sale.",
        body: "Some campaigns are meant to validate messaging, some to generate qualified traffic, and some to convert efficiently at scale. Good evaluation matches the KPI to the business stage instead of forcing every campaign into the same yardstick.",
        items: [
          { title: "Early-stage tests", body: "Look for signal quality, engagement quality, and landing-page progression." },
          { title: "Growth-stage campaigns", body: "Look for repeatable conversion paths and stable unit economics." },
          { title: "International expansion", body: "Look for whether a new market is showing enough traction to justify deeper investment." },
        ],
      },
      {
        eyebrow: "Scaling logic",
        title: "Scale after proof, not after excitement.",
        body: "The fastest way to damage ROI is to scale a weak setup too early. Increase spend after the business sees consistent creative response, credible downstream actions, and a conversion path that can support more volume.",
      },
    ],
    faq: [
      { q: "Can TikTok ads support ROI-focused campaigns?", a: "Yes, when the business objective, creative, audience, and landing flow are aligned. ROI usually improves as testing becomes more structured and the funnel gets cleaner." },
      { q: "Why should ROI be judged in stages?", a: "Because an early test, a demand-generation campaign, and a scaling program do not serve the same purpose or deserve the same success metric." },
    ],
  },
  {
    slug: "international-expansion-with-tiktok-ads",
    title: "International Expansion With TikTok Ads | Business Ads Guide",
    description:
      "Learn how brands can use TikTok advertising to test international expansion, validate market fit, and launch in multiple countries.",
    eyebrow: "Resources",
    h1: "International expansion with TikTok ads: a cleaner way to test new markets.",
    intro:
      "Brands expanding internationally need more than translation. They need market-specific positioning, realistic testing logic, and a landing-page structure that helps visitors feel that the offer belongs in their market. That is where a strong multi-GEO architecture becomes commercially useful.",
    sections: [
      {
        eyebrow: "Market selection",
        title: "Treat each country as a decision environment.",
        body: "Different markets respond to different value propositions, trust signals, and creative expectations. A multi-country campaign works better when each GEO page supports local relevance rather than repeating one generic sales message.",
      },
      {
        eyebrow: "Launch model",
        title: "Test one market, learn fast, then expand.",
        body: "A phased rollout lowers risk. Start with a short list of target countries, define what proof looks like in each one, and use localized landing pages to handle objections that would otherwise send visitors back to search.",
        items: [
          { title: "Regional brands", body: "Use close-adjacent markets to validate whether the message travels well." },
          { title: "Agencies", body: "Build a repeatable client narrative around market-by-market expansion." },
          { title: "Ecommerce teams", body: "Use country pages to support local trust and reduce click hesitation." },
        ],
      },
      {
        eyebrow: "Operational advantage",
        title: "A structured pre-lander makes cross-border traffic easier to qualify.",
        body: "When visitors can quickly find a relevant market page, understand fit, and move to the next step without confusion, both paid traffic quality and commercial intent improve.",
      },
    ],
    faq: [
      { q: "Can a brand advertise in multiple countries with TikTok?", a: "Many brands use TikTok as part of a broader multi-market growth strategy, but each country should still be reviewed for local setup, policy, and business fit before launch." },
      { q: "Why do localized GEO pages matter?", a: "They reduce friction for visitors who search by market and help align the message with local expectations, objections, and commercial context." },
    ],
  },
];

const seoGrowthPages = [
  {
    pathName: "/tiktok-ads/",
    title: "TikTok Ads for Business: Core Guide | Business Ads Guide",
    description:
      "Learn what TikTok ads are, how businesses use them, and which setup, cost, tracking, strategy, and market guides to open next for a stronger launch path.",
    eyebrow: "Core Guide",
    h1: "TikTok ads: the core guide for businesses evaluating the channel.",
    intro:
      "This is the central hub for businesses researching TikTok ads. It is designed to explain the channel clearly, connect visitors to the right next guide, and move them from broad interest into a more qualified launch path.",
    sections: [
      {
        eyebrow: "What it is",
        title: "A practical starting point for the whole topic.",
        body: "Visitors searching for TikTok ads usually need an overview before they need platform details. This page should explain where the channel fits, what problems it can solve, and how to continue into cost, setup, targeting, or market-specific pages without losing momentum.",
      },
      {
        eyebrow: "Why it matters",
        title: "The right hub page reduces confusion and improves topical authority.",
        body: "A strong core page helps search engines and users understand the site structure. It anchors the commercial topic, supports internal linking, and gives new visitors a reliable place to begin.",
        items: [
          { title: "For beginners", body: "It explains the topic without forcing them into technical detail too early." },
          { title: "For growth teams", body: "It routes them quickly into cost, Ads Manager, strategy, and market pages." },
          { title: "For SEO", body: "It becomes the parent page for a larger cluster of related guides and commercial content." },
        ],
      },
      {
        eyebrow: "Next reads",
        title: "Move into the right subtopic instead of bouncing.",
        body: "After the overview, most visitors need one of four next answers: how setup works, what budget looks like, what the platform interface involves, or how tracking should be handled.",
      },
    ],
    faq: [
      { q: "What should I read after a general TikTok ads guide?", a: "Most visitors should continue into cost, Ads Manager, setup, or tracking pages depending on what is currently blocking their decision." },
      { q: "Is this page meant for beginners or advanced advertisers?", a: "Both. It works best as a hub that introduces the topic and routes each visitor into the more specific guide they need next." },
    ],
    relatedLinks: [
      ["/tiktok-ads-manager/", "TikTok Ads Manager"],
      ["/tiktok-ads-cost/", "TikTok Ads Cost"],
      ["/how-to-run-tiktok-ads/", "How to Run TikTok Ads"],
      ["/tiktok-ads-strategy/", "TikTok Ads Strategy"],
      ["/tiktok-ad-formats/", "TikTok Ad Formats"],
      ["/tiktok-pixel/", "TikTok Pixel"],
    ],
  },
  {
    pathName: "/tiktok-ads-manager/",
    title: "TikTok Ads Manager for Business | Business Ads Guide",
    description:
      "Understand how businesses should approach TikTok Ads Manager, campaign setup, launch readiness, tracking inputs, and the next steps that matter most.",
    eyebrow: "Core Guide",
    h1: "TikTok Ads Manager: what businesses should understand before setup.",
    intro:
      "Ads Manager queries usually come from visitors close to action. The page should help them understand the interface in business terms: campaign objective, structure, tracking readiness, creative setup, and what to prepare before launch.",
    sections: [
      {
        eyebrow: "Platform intent",
        title: "Ads Manager is where setup happens, but setup is not the whole strategy.",
        body: "A lot of friction comes from trying to solve business questions inside the interface. This guide keeps the business objective clear first, then explains how Ads Manager fits into the broader campaign process.",
      },
      {
        eyebrow: "Readiness",
        title: "Before opening the platform, make sure the inputs are strong.",
        body: "The setup becomes cleaner when the offer, audience, landing page, and measurement approach are already defined. Without those pieces, even a well-configured account can underperform.",
        items: [
          { title: "Objective", body: "Know whether the campaign is for awareness, lead intent, sales, installs, or market validation." },
          { title: "Creative", body: "Prepare multiple hooks so the platform has something meaningful to test." },
          { title: "Tracking", body: "Make sure the landing path can measure the action that matters." },
        ],
      },
    ],
    faq: [
      { q: "Is TikTok Ads Manager difficult for a beginner?", a: "It can feel heavy at first, but the process becomes much simpler when the business goal and tracking plan are already clear." },
      { q: "What should I read next after Ads Manager?", a: "Most visitors should continue into cost, pixel, or how-to-run guides depending on whether their blocker is budget, tracking, or launch sequence." },
    ],
    relatedLinks: [
      ["/tiktok-ads/", "TikTok Ads"],
      ["/tiktok-ads-cost/", "TikTok Ads Cost"],
      ["/how-to-run-tiktok-ads/", "How to Run TikTok Ads"],
      ["/tiktok-conversion-tracking/", "TikTok Conversion Tracking"],
      ["/tiktok-ads-strategy/", "TikTok Ads Strategy"],
    ],
  },
  {
    pathName: "/tiktok-for-business/",
    title: "TikTok for Business Guide | Business Ads Guide",
    description:
      "See how businesses evaluate TikTok for Business, where it fits into growth planning, and which setup, cost, market, and launch guides matter next.",
    eyebrow: "Core Guide",
    h1: "TikTok for Business: a practical guide for companies exploring the platform.",
    intro:
      "This page is built for brand-led and navigational searches around TikTok for Business. The goal is to explain the commercial use case, set expectations, and move visitors toward the right launch or evaluation guide.",
    sections: [
      {
        eyebrow: "Business fit",
        title: "Think beyond the brand name and focus on the commercial job.",
        body: "Businesses searching for TikTok for Business are usually asking whether the platform can support growth, demand creation, and market expansion in a structured way. This page should answer that in plain commercial language.",
      },
      {
        eyebrow: "Who it suits",
        title: "The fit depends on the business model, not only the audience stereotype.",
        body: "Small businesses, ecommerce brands, agencies, apps, and expansion-stage companies can all evaluate the platform, but the right route through setup, creative, and conversion planning will differ.",
      },
    ],
    faq: [
      { q: "Is TikTok for Business only for large brands?", a: "No. The platform can be relevant for smaller businesses and growth teams too, as long as the campaign goal and landing path are clear." },
      { q: "What should I read after this page?", a: "Most visitors should continue into TikTok Ads, Ads Manager, cost, or setup guides depending on where they are in the decision process." },
    ],
    relatedLinks: [
      ["/tiktok-ads/", "TikTok Ads"],
      ["/tiktok-ads-manager/", "TikTok Ads Manager"],
      ["/tiktok-ads-cost/", "TikTok Ads Cost"],
      ["/tiktok-ads-for-ecommerce/", "TikTok Ads for Ecommerce"],
      ["/markets/", "Markets"],
    ],
  },
  {
    pathName: "/tiktok-ads-cost/",
    title: "TikTok Ads Cost Guide for Business | Business Ads Guide",
    description:
      "Understand how businesses should think about TikTok ads cost, test budgets, learning phases, creative efficiency, and cost control before scaling.",
    eyebrow: "Core Guide",
    h1: "TikTok ads cost: how businesses should think about budget, testing, and scale.",
    intro:
      "This guide answers one of the highest-intent questions in the topic. It focuses on practical budget logic, the difference between testing and scaling, and the variables that shape cost quality.",
    sections: [
      {
        eyebrow: "The real question",
        title: "Cost is not just spend. It is spend relative to signal quality.",
        body: "A business does not simply need cheaper traffic. It needs learning quality, conversion relevance, and a landing path that makes the spend useful. That is why cost should be framed as part of the whole funnel.",
      },
      {
        eyebrow: "Control",
        title: "Good cost control starts before the campaign launches.",
        body: "Creative preparation, clear conversion goals, realistic expectations, and strong landing pages all make cost evaluation more honest and more actionable.",
      },
    ],
    faq: [
      { q: "Do TikTok ads require a large budget?", a: "Not necessarily. Many businesses start with a controlled test, then scale only after they see credible signal quality and conversion potential." },
      { q: "What should I read after cost?", a: "The best next pages are usually how to run TikTok ads, Ads Manager, and strategy or tracking guides." },
    ],
    relatedLinks: [
      ["/tiktok-ads/", "TikTok Ads"],
      ["/how-to-run-tiktok-ads/", "How to Run TikTok Ads"],
      ["/how-to-optimize-tiktok-ads/", "How to Optimize TikTok Ads"],
      ["/tiktok-ads-strategy/", "TikTok Ads Strategy"],
      ["/resources/tiktok-ads-cost.html", "Extended Cost Guide"],
      ["/tiktok-pixel/", "TikTok Pixel"],
    ],
  },
  {
    pathName: "/how-to-run-tiktok-ads/",
    title: "How to Run TikTok Ads for Business | Business Ads Guide",
    description:
      "Learn the practical steps businesses should follow to run TikTok ads, from objective selection and launch readiness to optimization decisions.",
    eyebrow: "Setup Guide",
    h1: "How to run TikTok ads without turning setup into confusion.",
    intro:
      "This page is for visitors who want a clear operational path. It breaks the process into simple stages and keeps the focus on business readiness, not just button-clicking.",
    sections: [
      {
        eyebrow: "Step 1",
        title: "Decide the objective before opening the platform.",
        body: "Awareness, traffic quality, lead generation, installs, and market validation each call for different campaign logic. The first step is knowing what success should look like.",
      },
      {
        eyebrow: "Step 2",
        title: "Prepare the inputs that influence the outcome.",
        body: "Creative angles, landing page trust, audience assumptions, and tracking events should all be ready before launch. Good setup starts outside the ad account.",
        items: [
          { title: "Creative hooks", body: "Prepare several messages, not one generic promise." },
          { title: "Landing path", body: "Make the page easy to scan, trustworthy, and aligned with the ad." },
          { title: "Measurement", body: "Choose one clear event or conversion signal to judge the test." },
        ],
      },
      {
        eyebrow: "Step 3",
        title: "Launch small enough to learn, not to impress.",
        body: "A disciplined test gives better data than an oversized first campaign. The goal is clarity first, then scale.",
      },
    ],
    faq: [
      { q: "What is the first step in running TikTok ads?", a: "The first step is deciding the business objective and success metric before campaign setup begins." },
      { q: "What should I read after this guide?", a: "Cost, pixel, and strategy pages are the most common next steps depending on what is still unclear." },
    ],
    relatedLinks: [
      ["/tiktok-ads/", "TikTok Ads"],
      ["/tiktok-ads-cost/", "TikTok Ads Cost"],
      ["/tiktok-ads-manager/", "TikTok Ads Manager"],
      ["/tiktok-ad-formats/", "TikTok Ad Formats"],
      ["/tiktok-ads-strategy/", "TikTok Ads Strategy"],
    ],
  },
  {
    pathName: "/how-to-advertise-on-tiktok/",
    title: "How to Advertise on TikTok | Business Ads Guide",
    description:
      "See how businesses can advertise on TikTok with a clear launch path, practical setup steps, and the right next guides for cost and tracking.",
    eyebrow: "Setup Guide",
    h1: "How to advertise on TikTok with a cleaner decision path.",
    intro:
      "This guide is built for broad educational queries. It explains the launch path in simple terms and routes visitors into the more specific setup, cost, and tracking pages that remove hesitation.",
    sections: [
      {
        eyebrow: "Overview",
        title: "Start with the business goal, not the platform jargon.",
        body: "Advertising on TikTok should begin with the result the business wants, the kind of audience it needs, and the type of action the landing page is prepared to capture.",
      },
      {
        eyebrow: "Next stage",
        title: "The smartest flows break the topic into sub-guides.",
        body: "Once the general launch path is clear, the user usually needs help with one of three things: setup mechanics, budget thinking, or conversion tracking. Those should be separate linked guides, not one crowded page.",
      },
    ],
    faq: [
      { q: "Is there a simple way to learn how to advertise on TikTok?", a: "Yes. Start with the general process, then move into cost, Ads Manager, and pixel guides based on what part still feels unclear." },
      { q: "Is this different from a TikTok Ads Manager guide?", a: "Yes. This page is broader and focuses on the overall launch path, while Ads Manager is more platform-specific." },
    ],
    relatedLinks: [
      ["/how-to-run-tiktok-ads/", "How to Run TikTok Ads"],
      ["/tiktok-ads-manager/", "TikTok Ads Manager"],
      ["/tiktok-ad-formats/", "TikTok Ad Formats"],
      ["/tiktok-ads-for-ecommerce/", "TikTok Ads for Ecommerce"],
      ["/markets/", "Markets"],
    ],
  },
  {
    pathName: "/tiktok-pixel/",
    title: "TikTok Pixel Guide for Business | Business Ads Guide",
    description:
      "Learn what the TikTok pixel does, why tracking matters, and which setup, cost, analytics, and conversion pages to use next with more confidence.",
    eyebrow: "Tracking Guide",
    h1: "TikTok pixel: the tracking guide businesses need before optimization.",
    intro:
      "Pixel and tracking pages are some of the strongest long-tail opportunities in the whole topic. This page serves as the main tracking hub, explaining what the pixel does and where visitors should go next for installation and measurement details.",
    sections: [
      {
        eyebrow: "Why it matters",
        title: "Tracking quality shapes how useful campaign data becomes.",
        body: "When measurement is weak, budget decisions get noisy. A good pixel guide helps businesses understand that conversion tracking is not a technical afterthought. It is a core part of learning and optimization.",
      },
      {
        eyebrow: "Use it as a hub",
        title: "One tracking page should route visitors into implementation and reporting.",
        body: "Some visitors need installation help, some need analytics context, and some need conversion-event logic. The hub works best when it connects those intents cleanly.",
        items: [
          { title: "Installation", body: "Move into a step-by-step setup guide when implementation is the blocker." },
          { title: "Conversion logic", body: "Use tracking pages to define what counts as a meaningful action." },
          { title: "Optimization", body: "Better tracking leads to better cost and scaling decisions." },
        ],
      },
    ],
    faq: [
      { q: "What is the TikTok pixel used for?", a: "It is used to help track actions on a landing path so advertisers can better understand campaign performance and conversion behavior." },
      { q: "What should I read after the TikTok pixel guide?", a: "Most visitors should continue into installation, conversion tracking, or cost and optimization guides." },
    ],
    relatedLinks: [
      ["/how-to-install-tiktok-pixel/", "How to Install TikTok Pixel"],
      ["/tiktok-conversion-tracking/", "TikTok Conversion Tracking"],
      ["/tiktok-ads/", "TikTok Ads"],
      ["/tiktok-ads-strategy/", "TikTok Ads Strategy"],
      ["/resources/tiktok-ads-roi.html", "TikTok Ads ROI"],
      ["/resources/", "Resources Hub"],
    ],
  },
  {
    pathName: "/how-to-install-tiktok-pixel/",
    title: "How to Install TikTok Pixel | Business Ads Guide",
    description:
      "Follow a practical guide to installing the TikTok pixel and understand what businesses should validate before using the tracking data in campaigns.",
    eyebrow: "Tracking Guide",
    h1: "How to install TikTok pixel with fewer tracking mistakes.",
    intro:
      "This guide targets one of the strongest practical search intents in the topic. It focuses on clean implementation logic, validation, and what to check so the tracking setup actually supports decision-making later.",
    sections: [
      {
        eyebrow: "Before installation",
        title: "Know what action the pixel is supposed to measure.",
        body: "A tracking setup is only as useful as the event strategy behind it. Decide what business action matters before implementation starts so the measurement stays aligned with the real objective.",
      },
      {
        eyebrow: "Validation",
        title: "Installation is only complete when the data is trustworthy.",
        body: "After setup, the next step is confirming that the intended events fire consistently and reflect the right moments in the funnel. That helps avoid false confidence and noisy optimization.",
      },
    ],
    faq: [
      { q: "What is the biggest mistake when installing the TikTok pixel?", a: "One of the biggest mistakes is setting it up without first deciding which business event should actually be measured and optimized around." },
      { q: "What should I read after installing the pixel?", a: "The best next pages are the general pixel hub, conversion tracking, cost, and optimization guides." },
    ],
    relatedLinks: [
      ["/tiktok-pixel/", "TikTok Pixel"],
      ["/tiktok-conversion-tracking/", "TikTok Conversion Tracking"],
      ["/how-to-optimize-tiktok-ads/", "How to Optimize TikTok Ads"],
      ["/tiktok-ads-cost/", "TikTok Ads Cost"],
      ["/resources/tiktok-ads-roi.html", "TikTok Ads ROI"],
    ],
  },
  {
    pathName: "/tiktok-ad-formats/",
    title: "TikTok Ad Formats for Business | Business Ads Guide",
    description:
      "Understand the main TikTok ad formats, where each one fits, and how businesses should choose formats based on objective, creative, and funnel stage.",
    eyebrow: "Creative Guide",
    h1: "TikTok ad formats: how businesses should choose the right format first.",
    intro:
      "Format confusion often slows down launch planning. Businesses usually do not need every option. They need to understand which format fits the objective, the creative style, and the commercial action they want the visitor to take next.",
    sections: [
      {
        eyebrow: "Start here",
        title: "Pick the format that matches the job, not the one that sounds biggest.",
        body: "A strong format decision starts with the campaign goal. Some formats are better for broad discovery, some for creator-led social proof, and some for cleaner direct-response paths. The right choice depends on the business problem the campaign is supposed to solve.",
        items: [
          { title: "Discovery-led campaigns", body: "Use formats that feel native to feed behavior and let creative do the first layer of persuasion." },
          { title: "Trust-building campaigns", body: "Use formats that make social proof, credibility, or product demonstration easier to absorb quickly." },
          { title: "Performance campaigns", body: "Choose the format that keeps the message clear and the click path friction-light." },
        ],
      },
      {
        eyebrow: "Creative fit",
        title: "The format should make the creative easier to understand, not harder to rescue.",
        body: "If the offer is weak or the hook is vague, changing the format rarely fixes the outcome. Businesses should first decide what the creative needs to communicate, then select the format that helps that message land fast.",
      },
      {
        eyebrow: "Operational rule",
        title: "Limit the first test to a manageable format mix.",
        body: "New advertisers usually get better learning by focusing on a small number of format choices, measuring signal quality, and expanding only when the early data is credible. That keeps the campaign readable and the decision process cleaner.",
      },
    ],
    faq: [
      { q: "Which TikTok ad format is best for a first campaign?", a: "Most businesses benefit from starting with simpler feed-native formats that make the creative and CTA easy to evaluate before testing more advanced options." },
      { q: "Should I test multiple formats at once?", a: "A small comparison can help, but too many format variables in the first campaign can make it harder to understand what is actually driving the result." },
    ],
    relatedLinks: [
      ["/tiktok-ads/", "TikTok Ads"],
      ["/tiktok-spark-ads/", "TikTok Spark Ads"],
      ["/how-to-run-tiktok-ads/", "How to Run TikTok Ads"],
      ["/tiktok-ads-strategy/", "TikTok Ads Strategy"],
      ["/tiktok-ads-for-ecommerce/", "TikTok Ads for Ecommerce"],
    ],
  },
  {
    pathName: "/tiktok-spark-ads/",
    title: "TikTok Spark Ads Guide | Business Ads Guide",
    description:
      "Learn how businesses evaluate TikTok Spark Ads, when creator-led social proof helps, and how Spark Ads fit into a broader paid growth strategy.",
    eyebrow: "Creative Guide",
    h1: "TikTok Spark Ads: when creator-led trust can improve campaign quality.",
    intro:
      "Spark Ads matter because they change how the ad feels to the viewer. For some businesses, that can lower resistance, improve relevance, and create stronger social proof than a traditional brand-first execution.",
    sections: [
      {
        eyebrow: "Why they matter",
        title: "Spark Ads can make the message feel more native and more credible.",
        body: "When a campaign benefits from creator context, product demonstration, or social proof, Spark Ads can reduce the gap between paid media and organic-feeling content. That does not guarantee performance, but it can improve the quality of the first impression.",
      },
      {
        eyebrow: "Best use cases",
        title: "They are strongest when the business needs trust before the click.",
        body: "Spark Ads are often useful for ecommerce offers, new product launches, and campaigns where proof, demonstration, or audience familiarity matters before the landing page does the rest of the work.",
        items: [
          { title: "Product discovery", body: "Useful when the visitor needs to see the product in context before deciding whether it is worth clicking." },
          { title: "Creator credibility", body: "Useful when a familiar face or proof layer lowers skepticism and increases message retention." },
          { title: "Creative testing", body: "Useful when teams want to compare brand-led creative against creator-led executions." },
        ],
      },
      {
        eyebrow: "Decision rule",
        title: "Use Spark Ads when they strengthen the commercial message, not just because they are popular.",
        body: "The format works best when it helps the visitor understand the offer faster, trust it more easily, or imagine the next step more clearly. If it does not improve one of those things, the campaign may be better served by a simpler format choice.",
      },
    ],
    faq: [
      { q: "Are Spark Ads only for large brands or creator-heavy campaigns?", a: "No. Smaller brands can also benefit when creator context or social proof makes the offer easier to trust and understand." },
      { q: "Should Spark Ads replace every other format?", a: "No. They are most valuable as one format choice inside a broader testing plan, not as a universal replacement for every campaign type." },
    ],
    relatedLinks: [
      ["/tiktok-ad-formats/", "TikTok Ad Formats"],
      ["/tiktok-ads-for-ecommerce/", "TikTok Ads for Ecommerce"],
      ["/tiktok-ads-strategy/", "TikTok Ads Strategy"],
      ["/how-to-optimize-tiktok-ads/", "How to Optimize TikTok Ads"],
      ["/tiktok-ads/", "TikTok Ads"],
    ],
  },
  {
    pathName: "/tiktok-conversion-tracking/",
    title: "TikTok Conversion Tracking Guide | Business Ads Guide",
    description:
      "Understand how businesses should set up TikTok conversion tracking, choose meaningful events, and use cleaner data to improve budget and optimization decisions.",
    eyebrow: "Tracking Guide",
    h1: "TikTok conversion tracking: how to measure what actually matters.",
    intro:
      "Tracking is only useful when it reflects a meaningful business action. This guide helps advertisers move beyond surface engagement and define the conversions that deserve budget decisions, optimization, and scaling attention.",
    sections: [
      {
        eyebrow: "Measurement logic",
        title: "A useful conversion should represent real commercial progress.",
        body: "Not every event deserves to influence bidding or scale decisions. Businesses should choose the action that best reflects movement toward revenue, qualified demand, or another meaningful commercial outcome.",
        items: [
          { title: "Lead-driven businesses", body: "Focus on qualified enquiries or booked actions rather than shallow form starts." },
          { title: "Ecommerce brands", body: "Track product-view, cart, and checkout stages with a clear view of which event best predicts revenue." },
          { title: "Apps and subscriptions", body: "Choose events that reflect post-install quality instead of celebrating low-value installs." },
        ],
      },
      {
        eyebrow: "Data quality",
        title: "Tracking quality matters more than raw event volume.",
        body: "A large number of events can still be misleading if the event is weak, duplicated, or disconnected from business value. Good tracking should help the team understand the real decision path, not create false confidence.",
      },
      {
        eyebrow: "Optimization impact",
        title: "Cleaner conversion tracking improves both cost analysis and scale timing.",
        body: "Once the right event is stable, teams can judge creative quality, landing-page friction, and budget efficiency with more confidence. That is what turns tracking into a business tool instead of a technical checklist.",
      },
    ],
    faq: [
      { q: "What is the difference between TikTok pixel setup and conversion tracking?", a: "Pixel setup is the implementation layer. Conversion tracking is the decision layer that defines which events matter and how the business uses them." },
      { q: "Should every tracked event be treated as a conversion?", a: "No. Teams should prioritize the events that most closely reflect qualified commercial progress rather than counting every interaction as success." },
    ],
    relatedLinks: [
      ["/tiktok-pixel/", "TikTok Pixel"],
      ["/how-to-install-tiktok-pixel/", "How to Install TikTok Pixel"],
      ["/tiktok-ads-cost/", "TikTok Ads Cost"],
      ["/how-to-optimize-tiktok-ads/", "How to Optimize TikTok Ads"],
      ["/resources/tiktok-ads-roi.html", "TikTok Ads ROI"],
    ],
  },
  {
    pathName: "/tiktok-ads-strategy/",
    title: "TikTok Ads Strategy for Business | Business Ads Guide",
    description:
      "See how businesses should approach TikTok ads strategy, from objective selection and format mix to testing rhythm, tracking quality, and scaling logic.",
    eyebrow: "Strategy Guide",
    h1: "TikTok ads strategy: build the plan before the platform complexity.",
    intro:
      "A stronger TikTok strategy is usually simpler than people expect. It starts with the business goal, matches the creative and format to that goal, defines the tracking logic, and only then moves into testing and scaling decisions.",
    sections: [
      {
        eyebrow: "Strategic foundation",
        title: "Strategy begins with the business job the channel is supposed to do.",
        body: "Some advertisers need demand creation, some need lower-funnel efficiency, and some need market-validation data. A good strategy makes that job explicit before budget, formats, and creative are chosen.",
      },
      {
        eyebrow: "Testing model",
        title: "A useful strategy creates a repeatable learning loop.",
        body: "The best teams define what will be tested first, what counts as signal, and what change should happen next if the first result is weak. That makes the campaign easier to improve without overreacting to noise.",
        items: [
          { title: "One objective", body: "Keep the early campaign tied to one clear business goal so the signal stays readable." },
          { title: "Small number of variables", body: "Limit the first tests to the biggest strategic questions, not every possible knob." },
          { title: "Planned next move", body: "Decide in advance what evidence would justify a creative change, landing-page change, or budget increase." },
        ],
      },
      {
        eyebrow: "Scale logic",
        title: "Scale only after the strategy proves it can survive more volume.",
        body: "A campaign deserves more spend when it has shown stable message fit, trustworthy tracking, and a landing path that does not collapse when the click volume rises. That is the moment strategy turns into scale.",
      },
    ],
    faq: [
      { q: "What is the biggest mistake in TikTok ads strategy?", a: "Trying to solve too many business questions inside one early campaign instead of defining one clear objective and one clear learning loop first." },
      { q: "Is strategy different from optimization?", a: "Yes. Strategy decides what to test and why. Optimization improves the campaign after the strategic priorities are already clear." },
    ],
    relatedLinks: [
      ["/tiktok-ads/", "TikTok Ads"],
      ["/tiktok-ad-formats/", "TikTok Ad Formats"],
      ["/tiktok-conversion-tracking/", "TikTok Conversion Tracking"],
      ["/how-to-optimize-tiktok-ads/", "How to Optimize TikTok Ads"],
      ["/tiktok-ads-for-ecommerce/", "TikTok Ads for Ecommerce"],
    ],
  },
  {
    pathName: "/how-to-optimize-tiktok-ads/",
    title: "How to Optimize TikTok Ads | Business Ads Guide",
    description:
      "Learn how businesses should optimize TikTok ads by improving creative, tracking, budget pacing, and landing-page quality instead of changing everything at once.",
    eyebrow: "Optimization Guide",
    h1: "How to optimize TikTok ads without killing the learning cycle.",
    intro:
      "Optimization is not random tweaking. It is a disciplined process of identifying the biggest point of friction, making one meaningful improvement, and judging whether the new version actually improved the business signal.",
    sections: [
      {
        eyebrow: "Start with diagnosis",
        title: "Fix the biggest bottleneck first, not the easiest setting to touch.",
        body: "Poor outcomes can come from weak creative, weak offer framing, weak tracking, or a weak landing page. Good optimization starts by finding which layer is causing the most damage to the campaign's commercial quality.",
      },
      {
        eyebrow: "Priority order",
        title: "Creative, landing path, and measurement usually matter more than micro-tweaks.",
        body: "A stronger hook, clearer offer, cleaner CTA path, or better event strategy often changes results more than constant account-level adjustments. Teams that optimize in the wrong order usually create noise instead of insight.",
        items: [
          { title: "Creative first", body: "Test new hooks, proof layers, and message angles before assuming the audience is the problem." },
          { title: "Landing experience next", body: "Improve clarity, speed, trust, and message match so more of the paid traffic stays qualified." },
          { title: "Budget pacing last", body: "Change spend after the message and measurement are solid enough to deserve more traffic." },
        ],
      },
      {
        eyebrow: "Decision rule",
        title: "One meaningful optimization is more useful than five uncertain changes.",
        body: "When teams change too much at once, they lose the ability to explain why performance moved. The better approach is to make a focused improvement, gather signal, and then decide what deserves attention next.",
      },
    ],
    faq: [
      { q: "What should I optimize first on TikTok ads?", a: "Usually the biggest friction point: creative relevance, landing-page clarity, or conversion-event quality. Start where the current setup is leaking the most value." },
      { q: "How quickly should I optimize after launch?", a: "Fast enough to fix clear problems, but not so fast that the campaign never has time to produce readable signal." },
    ],
    relatedLinks: [
      ["/tiktok-ads-strategy/", "TikTok Ads Strategy"],
      ["/tiktok-conversion-tracking/", "TikTok Conversion Tracking"],
      ["/tiktok-ads-cost/", "TikTok Ads Cost"],
      ["/tiktok-ad-formats/", "TikTok Ad Formats"],
      ["/tiktok-ads-for-ecommerce/", "TikTok Ads for Ecommerce"],
    ],
  },
  {
    pathName: "/tiktok-ads-for-ecommerce/",
    title: "TikTok Ads for Ecommerce | Business Ads Guide",
    description:
      "Explore how ecommerce brands use TikTok ads for product discovery, creative testing, conversion tracking, and market expansion with clearer commercial intent.",
    eyebrow: "Use-Case Guide",
    h1: "TikTok ads for ecommerce: where product discovery and performance can meet.",
    intro:
      "Ecommerce teams usually evaluate TikTok through a simple question: can this channel create product demand and still support measurable commercial action? The answer depends on creative quality, product clarity, offer strength, and post-click trust.",
    sections: [
      {
        eyebrow: "Why it fits",
        title: "Ecommerce is often one of the clearest commercial fits for TikTok.",
        body: "Short-form creative gives ecommerce brands a natural way to demonstrate products, highlight benefits, and create interest before the shopper has decided what to search for. That makes the channel especially useful for discovery-led growth.",
      },
      {
        eyebrow: "What matters most",
        title: "Strong ecommerce performance depends on product clarity, creative proof, and clean tracking.",
        body: "The best ecommerce campaigns keep the product easy to understand, the creative fast to absorb, and the click path tightly matched to the ad promise. Without that alignment, traffic may look cheap but still fail commercially.",
        items: [
          { title: "Product demonstration", body: "Show the use case and benefit quickly so the shopper understands the offer before the click." },
          { title: "Creator and proof signals", body: "Use creative that lowers skepticism and helps the shopper imagine trust earlier." },
          { title: "Event depth", body: "Track actions that reflect real ecommerce progress, not only shallow engagement." },
        ],
      },
      {
        eyebrow: "Scaling logic",
        title: "Scale ecommerce campaigns after repeatable product-message fit appears.",
        body: "Once the brand sees consistent engagement quality, cleaner downstream actions, and a landing path that supports conversion, the channel becomes much easier to scale responsibly. That is when cost and creative testing start to compound instead of drift.",
      },
    ],
    faq: [
      { q: "Can TikTok ads work for ecommerce without a massive budget?", a: "Yes. Many ecommerce brands begin with controlled product or hook tests before committing larger budgets to scale." },
      { q: "What should an ecommerce team read next after this page?", a: "Formats, Spark Ads, conversion tracking, and optimization guides are usually the strongest next steps." },
    ],
    relatedLinks: [
      ["/tiktok-ad-formats/", "TikTok Ad Formats"],
      ["/tiktok-spark-ads/", "TikTok Spark Ads"],
      ["/tiktok-conversion-tracking/", "TikTok Conversion Tracking"],
      ["/how-to-optimize-tiktok-ads/", "How to Optimize TikTok Ads"],
      ["/markets/", "Markets"],
    ],
  },
];

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: socialPreviewUrl,
  description: siteSummary,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: contactEmail,
    },
  ],
};

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function externalLink(url, label) {
  return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

function slugifyToken(value) {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "_")
    .replaceAll(/^_+|_+$/g, "")
    .slice(0, 80);
}

function pageSubid(pathName, placement, localeCode = "en") {
  const pageToken =
    pathName === "/"
      ? "home"
      : pathName
          .replace(/^\/|\/$/g, "")
          .replace(/index\.html$/g, "")
          .replace(/\.html$/g, "")
          .replaceAll("/", "_");
  return slugifyToken(`${pageToken}_${placement}_${localeCode}`);
}

function localeShortCode(locale) {
  const rawCode = locale.code?.includes("-")
    ? locale.code.split("-").pop()
    : (locale.hreflang || locale.code || "en").split("-")[0];
  return rawCode.slice(0, 2).toUpperCase();
}

function affiliateHref(subid) {
  return `${affiliateBaseUrl}?&&subid=${encodeURIComponent(subid)}`;
}

function affiliateLinkTag({
  label,
  subid,
  className = "button",
  ariaLabel = label,
}) {
  return `<a class="${className}" href="${affiliateHref(subid)}" target="_blank" rel="sponsored noopener noreferrer" aria-label="${escapeHtml(
    ariaLabel,
  )}" data-subid="${subid}">${label}</a>`;
}

function ctaLinkTag({
  type = "internal",
  label,
  href = "#primary-cta",
  subid,
  className = "button",
  ariaLabel = label,
}) {
  if (type === "affiliate") {
    return affiliateLinkTag({
      label,
      subid,
      className,
      ariaLabel,
    });
  }

  const externalAttrs = href.startsWith("http")
    ? ' target="_blank" rel="noopener noreferrer"'
    : "";

  return `<a class="${className}" href="${href}" aria-label="${escapeHtml(
    ariaLabel,
  )}"${externalAttrs}>${label}</a>`;
}

function firstSentence(text) {
  const match = text.match(/.*?[.!?](?:\s|$)/);
  return (match ? match[0] : text).trim();
}

function articleSchema({ pathName, title, description, h1, eyebrow }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: h1,
    description,
    articleSection: eyebrow,
    mainEntityOfPage: `${siteUrl}${pathName}`,
    url: `${siteUrl}${pathName}`,
    image: socialPreviewUrl,
    datePublished: editorialDateIso,
    dateModified: editorialDateIso,
    author: {
      "@type": "Organization",
      name: editorialTeamName,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: socialPreviewUrl,
      },
    },
    about: title,
  };
}

function webPageSchema({ pathName, title, description, htmlLang = "en" }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${siteUrl}${pathName}`,
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: `${siteUrl}/`,
    },
    inLanguage: htmlLang,
    dateModified: editorialDateIso,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: socialPreviewUrl,
    },
    about: "TikTok advertising for business",
  };
}

function faqSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

function itemListSchema({ pathName, name, description, items = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    url: `${siteUrl}${pathName}`,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

function analyticsHeadMarkup() {
  const trackingIds = [...new Set([ga4MeasurementId, googleAdsId].filter(Boolean))];
  const hasVerification = Boolean(googleSiteVerification);

  if (!trackingIds.length && !hasVerification) return "";

  const primaryTrackingId = trackingIds[0];
  const configScript = trackingIds.length
    ? `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${primaryTrackingId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      ${trackingIds
        .map((trackingId) =>
          `gtag('config', '${trackingId}');`,
        )
        .join("\n      ")}
    </script>`
    : "";

  return `${hasVerification ? `\n    <meta name="google-site-verification" content="${escapeHtml(googleSiteVerification)}" />` : ""}${configScript}`;
}

function sourceLinksFor(pathName) {
  if (pathName.includes("pixel")) {
    return [...trustedSources.official, trustedSources.industry[0]];
  }

  if (
    pathName.includes("conversion-tracking") ||
    pathName.includes("strategy") ||
    pathName.includes("optimize") ||
    pathName.includes("formats") ||
    pathName.includes("spark") ||
    pathName.includes("ecommerce")
  ) {
    return [...trustedSources.official, ...trustedSources.industry];
  }

  if (pathName.includes("cost") || pathName.includes("roi")) {
    return [...trustedSources.official, ...trustedSources.industry];
  }

  if (pathName.includes("manager")) {
    return [...trustedSources.official, trustedSources.industry[0]];
  }

  if (pathName.startsWith("/markets/")) {
    return [trustedSources.official[0], trustedSources.industry[0]];
  }

  return [...trustedSources.official, trustedSources.industry[0]];
}

function supplementalSections({ pathName }) {
  if (pathName.includes("conversion-tracking")) {
    return [
      {
        eyebrow: "Event design",
        title: "A good tracking setup measures the step that predicts business value best.",
        body: "Teams often track too many soft interactions and then wonder why optimization decisions feel noisy. Strong conversion tracking focuses on the event that best reflects qualified demand, purchase intent, or another commercially meaningful outcome.",
        items: [
          { title: "Primary event first", body: "Choose the one conversion that most clearly represents progress toward revenue or qualified intent." },
          { title: "Keep the path readable", body: "Make sure the landing flow makes it obvious why the event matters and where it fires." },
          { title: "Review downstream quality", body: "A conversion is only useful if it correlates with later business value, not just surface activity." },
        ],
      },
      {
        eyebrow: "Reporting reality",
        title: "Tracking should help the next decision, not just make the dashboard look busy.",
        body: "The point of conversion tracking is to reveal whether the campaign is buying the right kind of action. If the data does not clarify creative fit, landing friction, or scaling readiness, the tracking model probably needs refinement.",
      },
      {
        eyebrow: "Optimization link",
        title: "Cleaner conversion data makes budget and creative choices more trustworthy.",
        body: "Once teams trust the event logic, they can compare hooks, audiences, and landing paths with more confidence. That is the moment tracking becomes a performance advantage rather than a technical obligation.",
      },
    ];
  }

  if (pathName.includes("pixel")) {
    return [
      {
        eyebrow: "Tracking logic",
        title: "Map the pixel to a business action that actually matters.",
        body: "A pixel is only useful when it reflects a meaningful commercial step such as a lead, checkout, qualified enquiry, or another high-signal action. If teams install tracking before agreeing on the business event, reporting becomes noisy and optimization decisions become weaker.",
        items: [
          { title: "Define the primary event", body: "Choose the one action that best represents progress toward revenue, not just surface engagement." },
          { title: "Check event quality", body: "A high event count is not enough if the action does not correlate with real intent or value." },
          { title: "Match landing flow to measurement", body: "Keep the event location and page promise aligned so the data reflects real user movement." },
        ],
      },
      {
        eyebrow: "Common mistakes",
        title: "Tracking problems usually begin before the code, not after it.",
        body: "Businesses often blame the platform when the deeper issue is unclear event strategy, weak landing-page structure, or inconsistent validation after launch. Clean tracking starts with clear business logic and disciplined QA.",
        items: [
          { title: "Vague event naming", body: "If teams cannot explain what success means in plain language, they cannot evaluate performance with confidence." },
          { title: "Testing too late", body: "Validate events before spend ramps up so reporting does not distort the learning phase." },
          { title: "Ignoring downstream quality", body: "Track not only clicks but also whether the visitor reaches the stage that matters commercially." },
        ],
      },
      {
        eyebrow: "Optimization layer",
        title: "Tracking becomes most useful when it drives the next business decision.",
        body: "Once events are stable, the pixel should help the team decide which creative deserves more budget, where the landing path is leaking intent, and whether the funnel is producing qualified activity rather than vanity metrics. That is the real reason tracking matters in paid acquisition.",
      },
    ];
  }

  if (pathName.includes("cost") || pathName.includes("roi")) {
    return [
      {
        eyebrow: "Budget planning",
        title: "Separate test budgets from scale budgets.",
        body: "One of the biggest mistakes in TikTok advertising is treating the first campaign like a mature channel. Test budgets exist to validate message, creative, and landing-page alignment. Scale budgets only make sense once that signal is stable enough to deserve more spend.",
        items: [
          { title: "Testing stage", body: "Budget for learning, creative comparison, and signal collection rather than volume alone." },
          { title: "Stability stage", body: "Look for repeatable engagement quality and clean conversion paths before expanding spend." },
          { title: "Scale stage", body: "Increase budget when the campaign can absorb more traffic without collapsing efficiency." },
        ],
      },
      {
        eyebrow: "What moves cost",
        title: "Cost efficiency depends on creative, offer, audience, and landing quality working together.",
        body: "Advertisers often search for a benchmark CPC or CPM, but the real commercial question is whether the funnel turns spend into useful intent. Poor landing pages, weak offers, or generic creative will make even a low-cost campaign underperform.",
        items: [
          { title: "Creative relevance", body: "Sharper hooks and clearer value propositions usually improve the quality of learning." },
          { title: "Offer clarity", body: "If the visitor cannot understand why the business is worth considering, cost quality falls fast." },
          { title: "Post-click trust", body: "Landing-page speed, transparency, and message match all influence whether paid traffic becomes useful." },
        ],
      },
      {
        eyebrow: "Decision filter",
        title: "Judge cost by business quality, not by a headline number alone.",
        body: "A campaign that drives inexpensive but unqualified clicks can still be expensive. A better decision framework asks whether the budget is buying relevant attention, downstream actions, and repeatable learning. That is the standard that matters before scale.",
      },
    ];
  }

  if (pathName.includes("manager")) {
    return [
      {
        eyebrow: "Workflow",
        title: "Treat the interface as an execution layer, not the strategy itself.",
        body: "Teams get better outcomes from Ads Manager when the decisions are already made before setup begins. That means the objective, audience assumptions, offer, creative direction, and tracking event are defined before anyone starts clicking through account settings.",
        items: [
          { title: "Pre-launch alignment", body: "Agree on campaign purpose and landing-page outcome before building structure in the account." },
          { title: "Clear ownership", body: "Know who is responsible for creative, tracking, and reporting so setup does not drift." },
          { title: "Controlled testing", body: "Use a simple first build instead of an overcomplicated structure that hides the signal." },
        ],
      },
      {
        eyebrow: "Common mistakes",
        title: "Most setup pain comes from unclear inputs, not platform complexity alone.",
        body: "When advertisers feel overwhelmed by Ads Manager, the usual cause is that the business decision was never simplified in the first place. Strong setup depends on clear objectives, fewer assumptions, and a landing path that is already conversion-ready.",
      },
      {
        eyebrow: "What good looks like",
        title: "A clean Ads Manager workflow turns setup into a repeatable operating system.",
        body: "The strongest teams use the platform to support a repeatable cycle: brief the objective, load clear creative angles, validate tracking, launch a contained test, then review signal quality before making the next change. That process matters more than memorizing every option in the interface.",
      },
    ];
  }

  if (
    pathName.includes("strategy") ||
    pathName.includes("optimize")
  ) {
    return [
      {
        eyebrow: "Strategic framing",
        title: "The strongest strategy pages tell teams what to prioritize before spend increases.",
        body: "Strategy and optimization both work best when the business objective, event logic, and creative hypothesis are already clear. Without those anchors, teams usually optimize in circles and mistake activity for progress.",
        items: [
          { title: "Objective before tactics", body: "Decide whether the goal is demand creation, qualified traffic, leads, sales, or market validation first." },
          { title: "One learning loop at a time", body: "Keep the first wave of testing narrow enough to explain why performance moved." },
          { title: "Scale after evidence", body: "Only expand once the message, measurement, and landing path can absorb more traffic without losing quality." },
        ],
      },
      {
        eyebrow: "Common mistakes",
        title: "Optimization gets expensive when teams change everything at once.",
        body: "Creative, audience, landing page, and event logic should not all move in the same review cycle unless the original setup is clearly broken. The better rule is to isolate the biggest friction point and improve that first.",
      },
      {
        eyebrow: "What strong teams do",
        title: "Good operators connect strategy, tracking, and creative into one repeatable system.",
        body: "That system does not need to be complicated. It simply needs a clear objective, readable tests, trustworthy events, and a review rhythm that turns the next change into a deliberate decision rather than a reaction.",
      },
    ];
  }

  if (pathName.includes("formats") || pathName.includes("spark")) {
    return [
      {
        eyebrow: "Format logic",
        title: "Formats matter most when they make the message easier to trust or easier to act on.",
        body: "Businesses often over-focus on the format label instead of the communication job. The more useful question is whether the format helps the viewer understand the product, trust the proof, and move into the click with less hesitation.",
        items: [
          { title: "Discovery formats", body: "Best when the product or service needs a fast, visual explanation before intent exists." },
          { title: "Creator-led formats", body: "Best when proof, demonstration, or audience familiarity improves the first impression." },
          { title: "Direct-response formats", body: "Best when the CTA path is simple and the landing page is ready to absorb colder traffic." },
        ],
      },
      {
        eyebrow: "Testing guidance",
        title: "A smaller format test is usually more useful than a broad first launch.",
        body: "Teams learn faster when they compare a small set of format choices against the same commercial objective instead of changing too many creative variables at once. That preserves clarity and makes the next decision stronger.",
      },
      {
        eyebrow: "Commercial lens",
        title: "Choose the format that strengthens the business story, not just the platform feature list.",
        body: "The best-performing format is often the one that reduces friction between the ad promise and the landing-page action. That is the standard that matters before the budget scales.",
      },
    ];
  }

  if (pathName.includes("ecommerce")) {
    return [
      {
        eyebrow: "Offer-market fit",
        title: "Ecommerce campaigns work best when the product benefit is obvious before the click.",
        body: "TikTok can create strong product demand, but the traffic quality depends on how quickly the creative communicates the product's value and why the shopper should care right now. That clarity needs to exist before the landing page asks for anything more.",
        items: [
          { title: "Fast product understanding", body: "Show the problem, the product, and the benefit quickly so the viewer has a reason to continue." },
          { title: "Proof and trust", body: "Use reviews, creator context, or demonstration to lower hesitation before checkout becomes relevant." },
          { title: "Deeper events", body: "Track the ecommerce steps that best predict revenue instead of celebrating surface engagement alone." },
        ],
      },
      {
        eyebrow: "Where ecommerce loses margin",
        title: "Cheap clicks do not help if the post-click path leaks trust or intent.",
        body: "The best ecommerce advertisers treat creative, landing page, and tracking as one system. When one of those layers is weak, the campaign may generate traffic that looks encouraging but still fails commercially.",
      },
      {
        eyebrow: "Growth rule",
        title: "Scale winning products and winning messages, not just winning ad sets.",
        body: "The most durable ecommerce growth comes from repeating the product-message combination that keeps converting, then supporting it with better creative iteration and cleaner landing paths. That is how TikTok testing compounds into real commercial upside.",
      },
    ];
  }

  if (
    pathName.includes("how-to-") ||
    pathName === routes.howItWorks ||
    pathName.includes("run-tiktok-ads")
  ) {
    return [
      {
        eyebrow: "Pre-launch checklist",
        title: "Before launch, validate the inputs that shape the first result.",
        body: "The cleanest launch process checks four things before budget goes live: the business objective, the audience logic, the creative variation, and the post-click experience. If one of those layers is weak, the campaign usually teaches the wrong lesson.",
        items: [
          { title: "Objective clarity", body: "Know whether the campaign is for awareness, leads, sales, installs, or market validation." },
          { title: "Creative readiness", body: "Prepare multiple angles so the campaign can learn from variation rather than guesswork." },
          { title: "Landing-page match", body: "Make sure the page reflects the promise and tone of the ad that sent the click." },
        ],
      },
      {
        eyebrow: "After launch",
        title: "Optimization should be paced by evidence, not impatience.",
        body: "Businesses often change too much too quickly after launch. A more reliable workflow is to observe the first signal, identify the biggest point of friction, and make one meaningful improvement at a time so the next learning cycle stays readable.",
      },
      {
        eyebrow: "Operational reality",
        title: "The first campaign should teach the team something valuable.",
        body: "A launch is successful when it produces a usable answer: which message got traction, which audience responded, where visitors hesitated, and whether the offer deserves another round of investment. That learning mindset is more durable than trying to force a perfect first campaign.",
      },
    ];
  }

  if (pathName === routes.smallBusiness) {
    return [
      {
        eyebrow: "What good looks like",
        title: "Small businesses usually win by being clearer, not louder.",
        body: "A smaller advertiser rarely needs a complex funnel to benefit from TikTok. Clear positioning, a believable offer, and a low-friction next step often matter more than trying to imitate large brands with heavy production or broad messaging.",
        items: [
          { title: "One main offer", body: "Keep the first campaign focused on a single, understandable value proposition." },
          { title: "Fast path to action", body: "Use landing pages and CTAs that make the next step obvious in seconds." },
          { title: "Simple measurement", body: "Track one meaningful action before worrying about advanced reporting layers." },
        ],
      },
      {
        eyebrow: "Avoid this",
        title: "The fastest way to waste budget is to test a vague message.",
        body: "When small businesses underperform on paid traffic, the issue is often not that the platform is too expensive. It is that the message is generic, the page is cluttered, or the offer is not easy to act on. Clarity beats complexity at this stage.",
      },
      {
        eyebrow: "Best next step",
        title: "Small businesses should move from one clear test into one clear improvement.",
        body: "Instead of spreading budget across multiple vague ideas, it is usually better to run a focused first test, learn what the audience responds to, and then refine the message or landing page based on that signal. That keeps risk controlled while the business learns faster.",
      },
    ];
  }

  if (pathName === routes.agencies) {
    return [
      {
        eyebrow: "Agency value",
        title: "Agencies need a client-safe narrative, not platform hype.",
        body: "The strongest agency pages explain where TikTok fits inside a broader media mix, how to stage testing, and when to scale only after the client has seen meaningful evidence. That framing is more persuasive than promising easy wins.",
        items: [
          { title: "Commercial maturity", body: "Position TikTok as a channel with defined use cases, not as a trend story." },
          { title: "Expansion logic", body: "Use market-by-market pages to support international client conversations with more credibility." },
          { title: "Reporting clarity", body: "Tie campaign learning back to practical client outcomes such as qualified traffic, leads, or product demand." },
        ],
      },
      {
        eyebrow: "Operational discipline",
        title: "A good client funnel reduces confusion before the first sales call.",
        body: "When agency traffic lands on structured guides instead of generic landing pages, prospects self-qualify more effectively. They arrive with fewer misconceptions about budget, setup, or market fit, which makes the next conversation more productive.",
      },
      {
        eyebrow: "Commercial outcome",
        title: "The real win is better-qualified demand, not just more clicks.",
        body: "An agency-oriented TikTok guide should help prospects understand whether the channel fits their business, what the first rollout should look like, and why the agency is treating the decision seriously. That improves lead quality and makes follow-up discussions more commercially grounded.",
      },
    ];
  }

  if (
    pathName === routes.whyTikTokAds ||
    pathName === "/tiktok-ads/" ||
    pathName === "/tiktok-for-business/"
  ) {
    return [
      {
        eyebrow: "Use cases",
        title: "The channel is strongest when the business needs discovery, testing, or expansion.",
        body: "TikTok is often valuable for businesses that need to create demand before search intent forms, test multiple creative angles quickly, or validate how an offer lands in a new market. That is why the channel works well as part of a broader growth system rather than as a standalone tactic.",
        items: [
          { title: "Demand creation", body: "Useful when the product needs visual explanation or a stronger first impression than text ads alone can provide." },
          { title: "Creative learning", body: "Useful when teams need faster insight into which message, benefit, or hook resonates." },
          { title: "Market expansion", body: "Useful when brands want a structured way to test growth outside their current strongest region." },
        ],
      },
      {
        eyebrow: "Reality check",
        title: "A good fit still depends on the offer, the page, and the next action.",
        body: "No advertising channel fixes a weak business proposition. The businesses that benefit most are the ones that pair platform opportunity with a clean offer, fast landing experience, strong trust signals, and a measured testing plan.",
      },
      {
        eyebrow: "Commercial lens",
        title: "The question is not whether TikTok is popular. It is whether it fits the growth job.",
        body: "Businesses should evaluate the channel against a practical question: does it help reach the right audience, create useful demand, and move people toward a measurable action with acceptable friction? That framing leads to better decisions than platform stereotypes.",
      },
    ];
  }

  if (pathName === routes.faq) {
    return [
      {
        eyebrow: "Before the click",
        title: "Most objections become smaller when the visitor sees a structured path.",
        body: "Cold traffic usually needs less persuasion and more orientation. When the site explains cost, setup, market coverage, and business fit clearly, visitors stop looking for loopholes and start evaluating the opportunity more seriously.",
      },
      {
        eyebrow: "What to do next",
        title: "The best FAQ pages route visitors into a more specific answer.",
        body: "After the visitor resolves a top-level concern, the next step should be obvious. Cost questions should lead into budget guides, setup questions into process pages, and market questions into GEO pages so the session keeps moving forward.",
      },
      {
        eyebrow: "Trust effect",
        title: "A strong FAQ page protects both SEO quality and paid-traffic conversion.",
        body: "When common objections are handled with direct, credible answers, visitors spend less time second-guessing the site and more time evaluating whether the next click makes sense. That improves bounce resistance and keeps the overall funnel feeling more trustworthy.",
      },
    ];
  }

  return [
    {
      eyebrow: "Evaluation",
      title: "A useful guide helps visitors make the next business decision faster.",
      body: "The best-performing pages in this topic reduce uncertainty rather than trying to overpower it. They explain what the channel can do, who it fits, what to validate before launch, and which next guide should answer the remaining blocker.",
    },
    {
      eyebrow: "Next step logic",
      title: "The page should move the visitor into the right follow-up question.",
      body: "Some visitors need cost clarity, some need setup help, and some need market-specific guidance. Clean internal linking and direct CTA language make that transition easier for both users and search engines.",
    },
    {
      eyebrow: "Why this matters",
      title: "Good informational pages protect search visibility and conversion quality at the same time.",
      body: "When a page answers the query clearly, supports trust, and points to the next useful page, it does more than rank for a keyword. It helps the whole site behave like a coherent decision system rather than a collection of isolated pages.",
    },
  ];
}

function navLinks(currentPath = "/") {
  const links = [
    [routes.home, "Home"],
    [routes.partnerOffer, "Offer Guide"],
    [routes.whyTikTokAds, "Why TikTok Ads"],
    [routes.howItWorks, "How It Works"],
    [routes.resources, "Resources"],
    [routes.markets, "Markets"],
    [routes.faq, "FAQ"],
  ];

  return links
    .map(
      ([href, label]) =>
        `<a class="nav-link${currentPath === href ? " active" : ""}" href="${href}">${label}</a>`,
    )
    .join("");
}

function localizedNav(localeCode = "en", currentKey = "home") {
  const locale = getLocaleConfig(localeCode);
  const homePath = localizedPath(localeCode, "home");
  const offerPath = localizedPath(localeCode, "offer");
  const links = [
    [homePath, locale.backHome || "Back to Home", currentKey === "home"],
    [offerPath, locale.navOffer || "Offer Guide", currentKey === "offer"],
    ["/resources/", locale.navEnglish || "English Guides", false],
  ];

  return links
    .map(
      ([href, label, isActive]) =>
        `<a class="nav-link${isActive ? " active" : ""}" href="${href}">${label}</a>`,
    )
    .join("");
}

function getLocaleConfig(localeCode = "en") {
  return localeConfigs.find((entry) => entry.code === localeCode) || localeConfigs[0];
}

function localizedPath(localeCode, translationKey = "home") {
  if (localeCode === "en") {
    if (translationKey === "offer") return routes.partnerOffer;
    return routes.home;
  }

  if (translationKey === "offer") return `/${localeCode}/offer/`;
  return `/${localeCode}/`;
}

function normalizeLegacyInternalHrefs(markup = "") {
  return legacyHtmlRedirects.reduce(
    (result, [legacyPath, cleanPath]) =>
      result.split(`href="${legacyPath}"`).join(`href="${cleanPath}"`),
    markup,
  );
}

function directoryPageEntry(pathName, content) {
  return [`${pathName}index.html`, content];
}

function alternateLinks(translationKey = "home") {
  const links = localeConfigs.map((locale) => ({
    hrefLang: locale.code === "en" ? "en" : locale.hreflang,
    href: `${siteUrl}${localizedPath(locale.code, translationKey)}`,
  }));

  links.push({ hrefLang: "x-default", href: `${siteUrl}${localizedPath("en", translationKey)}` });
  return links;
}

function languageSwitcher(currentLocaleCode = "en", translationKey = "home") {
  const currentLocale = getLocaleConfig(currentLocaleCode);
  const menuId = `language-menu-${slugifyToken(`${currentLocaleCode}-${translationKey}`)}`;
  const currentCode = localeShortCode(currentLocale);
  return `
    <div class="language-switcher" data-language-switcher data-current-locale="${currentLocaleCode}" data-translation-key="${translationKey}">
      <button class="language-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="${menuId}" data-language-trigger aria-label="Current language ${currentLocale.label}. Choose language">
        <span class="language-trigger-code">${currentCode}</span>
      </button>
      <div class="language-panel" id="${menuId}" role="menu" aria-label="Choose language" data-language-panel hidden>
        <div class="language-panel-header">
          <div>
            <p>Choose language</p>
            <span>${currentCode} selected</span>
          </div>
        </div>
        <div class="language-list" data-language-list></div>
      </div>
    </div>
  `;
}

function footer(pathName = "/", localeCode = "en") {
  const locale = getLocaleConfig(localeCode);
  return `
    <footer class="site-footer">
      <div class="footer-grid">
        <div>
          <p class="footer-brand">${siteName}</p>
          <p class="footer-copy">Independent business advertising guide focused on TikTok ads, launch planning, and market-by-market expansion.</p>
          <p class="footer-copy">Built for advertisers, brands, agencies, and growth teams who want a commercially smart starting point before committing budget.</p>
          <div class="footer-cta-row">
            ${affiliateLinkTag({
              label: locale.footerCtaLabel || "Explore Partner Offer",
              subid: pageSubid(pathName, "footer_cta", localeCode),
              className: "button button-small",
              ariaLabel: `${locale.footerCtaLabel || "Explore Partner Offer"} (${pathName})`,
            })}
          </div>
        </div>
        <div>
          <p class="footer-heading">Explore</p>
          <a href="${routes.home}">Homepage</a>
          <a href="${routes.partnerOffer}">Offer Guide</a>
          <a href="${routes.whyTikTokAds}">Why TikTok Ads</a>
          <a href="${routes.howItWorks}">How It Works</a>
          <a href="${routes.resources}">Resources</a>
          <a href="${routes.smallBusiness}">For Small Business</a>
          <a href="${routes.agencies}">For Agencies</a>
          <a href="${routes.markets}">Markets</a>
          <a href="${routes.about}">About</a>
          <a href="${routes.faq}">FAQ</a>
          <a href="${routes.contact}">Contact</a>
          <a href="${routes.siteMap}">HTML Sitemap</a>
        </div>
        <div>
          <p class="footer-heading">Legal</p>
          <a href="${routes.privacyPolicy}">Privacy Policy</a>
          <a href="${routes.terms}">Terms and Conditions</a>
          <a href="${routes.affiliateDisclaimer}">Advertising / Affiliate Disclaimer</a>
        </div>
      </div>
      <div class="footer-meta">
        <p>BusinessAdsGuide.com is an independent informational website about business advertising and is not affiliated with, endorsed by, or operated by TikTok, and it is not the official TikTok corporate website. This website may contain affiliate links or partner links. We may receive a commission or other compensation if users click on such links or take certain actions through them.</p>
        <p>&copy; ${year} ${siteName}. All rights reserved.</p>
      </div>
    </footer>
  `;
}

function breadcrumbTrail(pathName) {
  const segments = [];
  if (pathName === "/") return segments;

  const localizedHome = localeConfigs.find(
    (locale) => locale.code !== "en" && localizedPath(locale.code, "home") === pathName,
  );
  if (localizedHome) {
    return segments;
  }

  const localizedOffer = localeConfigs.find(
    (locale) => locale.code !== "en" && localizedPath(locale.code, "offer") === pathName,
  );
  if (localizedOffer) {
    return [
      {
        name: localizedOffer.label,
        url: `${siteUrl}${localizedPath(localizedOffer.code, "home")}`,
      },
      {
        name: localizedOffer.navOffer || "Offer Guide",
        url: `${siteUrl}${pathName}`,
      },
    ];
  }

  segments.push({ name: "Home", url: `${siteUrl}/` });

  const map = new Map([
    [routes.partnerOffer, { name: "Offer Guide", url: `${siteUrl}${routes.partnerOffer}` }],
    [routes.markets, { name: "Markets", url: `${siteUrl}${routes.markets}` }],
    [routes.resources, { name: "Resources", url: `${siteUrl}${routes.resources}` }],
    [routes.siteMap, { name: "HTML Sitemap", url: `${siteUrl}${routes.siteMap}` }],
    [routes.about, { name: "About", url: `${siteUrl}${routes.about}` }],
    [routes.howItWorks, { name: "How It Works", url: `${siteUrl}${routes.howItWorks}` }],
    [routes.whyTikTokAds, { name: "Why TikTok Ads", url: `${siteUrl}${routes.whyTikTokAds}` }],
    [routes.smallBusiness, { name: "For Small Business", url: `${siteUrl}${routes.smallBusiness}` }],
    [routes.agencies, { name: "For Agencies", url: `${siteUrl}${routes.agencies}` }],
    [routes.faq, { name: "FAQ", url: `${siteUrl}${routes.faq}` }],
    [routes.contact, { name: "Contact", url: `${siteUrl}${routes.contact}` }],
    [routes.privacyPolicy, { name: "Privacy Policy", url: `${siteUrl}${routes.privacyPolicy}` }],
    [routes.terms, { name: "Terms and Conditions", url: `${siteUrl}${routes.terms}` }],
    [routes.affiliateDisclaimer, { name: "Advertising Disclaimer", url: `${siteUrl}${routes.affiliateDisclaimer}` }],
    [routes.projectBlueprint, { name: "Project Blueprint", url: `${siteUrl}${routes.projectBlueprint}` }],
    [routes.notFound, { name: "Page Not Found", url: `${siteUrl}${routes.notFound}` }],
  ]);

  if (map.has(pathName)) {
    segments.push(map.get(pathName));
    return segments;
  }

  if (pathName.startsWith("/markets/") && pathName !== "/markets/") {
    segments.push({ name: "Markets", url: `${siteUrl}/markets/` });
    const slug = pathName.split("/").pop()?.replace(".html", "") ?? "";
    const geo = geos.find((entry) => entry.slug === slug);
    if (geo) {
      segments.push({ name: `Launch TikTok Ads in ${geo.name}`, url: `${siteUrl}${pathName}` });
    }
  }

  if (pathName.startsWith("/resources/") && pathName !== "/resources/") {
    segments.push({ name: "Resources", url: `${siteUrl}/resources/` });
    const slug = pathName.split("/").pop()?.replace(".html", "") ?? "";
    const resource = resourcePages.find((entry) => entry.slug === slug);
    if (resource) {
      segments.push({ name: resource.h1, url: `${siteUrl}${pathName}` });
    }
  }

  const seoPage = seoGrowthPages.find((entry) => entry.pathName === pathName);
  if (seoPage) {
    segments.push({ name: seoPage.h1, url: `${siteUrl}${pathName}` });
  }

  return segments;
}

function breadcrumbMarkup(pathName) {
  const crumbs = breadcrumbTrail(pathName);
  if (!crumbs.length) return "";
  return `
    <nav class="breadcrumbs section" aria-label="Breadcrumb">
      <ol>
        ${crumbs
          .map(
            (crumb, index) => `
              <li>
                ${
                  index === crumbs.length - 1
                    ? `<span aria-current="page">${crumb.name}</span>`
                    : `<a href="${crumb.url.replace(siteUrl, "") || "/"}">${crumb.name}</a>`
                }
              </li>
            `,
          )
          .join("")}
      </ol>
    </nav>
  `;
}

function breadcrumbSchema(pathName) {
  const crumbs = breadcrumbTrail(pathName);
  if (!crumbs.length) return "";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

function layout({
  pathName,
  title,
  description,
  ogTitle = title,
  ogDescription = description,
  robots = "index, follow",
  bodyClass = "",
  htmlLang = "en",
  dir = "ltr",
  localeCode = "en",
  translationKey = "home",
  alternateTranslationKey = null,
  brandEyebrow = siteDescriptor,
  headerCtaLabel = "Open Partner Offer",
  mobileCtaLabel = "Open Partner Offer",
  navMarkup,
  content,
  schema = [],
}) {
  const schemas = [
    organizationJsonLd,
    breadcrumbSchema(pathName),
    pathName === routes.notFound ? null : webPageSchema({ pathName, title, description, htmlLang }),
    ...(Array.isArray(schema) ? schema : [schema]),
  ].filter(Boolean);
  return normalizeLegacyInternalHrefs(`<!DOCTYPE html>
<html lang="${htmlLang}" dir="${dir}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${siteUrl}${pathName}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(ogDescription)}" />
    <meta property="og:url" content="${siteUrl}${pathName}" />
    <meta property="og:site_name" content="${siteName}" />
    <meta property="og:image" content="${socialPreviewUrl}" />
    <meta property="og:image:alt" content="${siteName} social preview for independent TikTok advertising guidance" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(ogDescription)}" />
    <meta name="twitter:image" content="${socialPreviewUrl}" />
    <meta name="theme-color" content="#08131f" />
    ${analyticsHeadMarkup()}
    ${alternateTranslationKey
      ? alternateLinks(alternateTranslationKey)
          .map(
            (link) =>
              `<link rel="alternate" hreflang="${link.hrefLang}" href="${link.href}" />`,
          )
          .join("\n    ")
      : ""}
    <link rel="stylesheet" href="${pathName === "/" ? "/assets/styles.css" : pathName.startsWith("/markets/") ? "../assets/styles.css" : "/assets/styles.css"}" />
    ${schemas
      .map(
        (item) => `
    <script type="application/ld+json">
      ${JSON.stringify(item, null, 2)}
    </script>`,
      )
      .join("\n")}
  </head>
  <body class="${bodyClass}">
    <div class="page-shell">
      <a class="skip-link" href="#main-content">Skip to content</a>
      <header class="site-header">
        <a class="brand-mark" href="/">
          <span class="brand-eyebrow">${brandEyebrow}</span>
          <span class="brand-name">${siteName}</span>
        </a>
        <nav class="main-nav" aria-label="Primary navigation">
          ${navMarkup || navLinks(pathName)}
        </nav>
        <div class="header-tools">
          ${languageSwitcher(localeCode, translationKey)}
          ${ctaLinkTag({
            type: "affiliate",
            label: headerCtaLabel,
            subid: pageSubid(pathName, "header_cta", localeCode),
            className: "header-cta button button-small",
            ariaLabel: `${headerCtaLabel} (${pathName})`,
          })}
        </div>
      </header>
      ${breadcrumbMarkup(pathName)}
      ${content.replace("<main", '<main id="main-content"')}
      ${footer(pathName, localeCode)}
      ${ctaLinkTag({
        type: "affiliate",
        label: mobileCtaLabel,
        subid: pageSubid(pathName, "mobile_sticky", localeCode),
        className: "mobile-sticky-cta",
        ariaLabel: `${mobileCtaLabel} (${pathName})`,
      })}
    </div>
    <script src="${pathName === "/" ? "/assets/site.js" : pathName.startsWith("/markets/") ? "../assets/site.js" : "/assets/site.js"}" defer></script>
  </body>
</html>`);
}

function heroStats() {
  return `
    <div class="hero-proof-strip">
      <p>Built for business teams comparing fit, setup, market access, and next-step clarity before any outbound click.</p>
      <ul class="inline-proof-list">
        <li>Decision-first guidance</li>
        <li>Independent review layer</li>
        <li>Market-by-market planning</li>
      </ul>
    </div>
  `;
}

function geoSummaryText(geo) {
  return (
    geo.summary ||
    geo.marketBenefit ||
    geo.bestFor ||
    geo.audienceFit ||
    `Explore how businesses can evaluate TikTok advertising opportunities in ${geo.name}.`
  );
}

function marketGrid(limit = geos.length) {
  return geos
    .slice(0, limit)
    .map(
      (geo) => `
        <article class="market-card">
          <p class="eyebrow">${geo.region}</p>
          <h3><a href="/markets/${geo.slug}.html">Launch TikTok Ads in ${geo.name}</a></h3>
          <p>${geoSummaryText(geo)}</p>
        </article>
      `,
    )
    .join("");
}

function ctaBlock(
  title,
  body,
  buttonText,
  href = "#primary-cta",
  {
    pathName = "/",
    localeCode = "en",
    primaryType = "internal",
    subidPlacement = "final_cta",
    secondaryHref = routes.howItWorks,
    secondaryLabel = "See How It Works",
    secondaryType = "internal",
    secondarySubidPlacement = "final_cta_secondary",
    showSecondary = true,
  } = {},
) {
  return `
    <section class="cta-panel section">
      <div>
        <p class="eyebrow">Next Step</p>
        <h2>${title}</h2>
        <p>${body}</p>
      </div>
      <div class="cta-panel-actions">
        ${ctaLinkTag({
          type: primaryType,
          label: buttonText,
          href,
          subid: pageSubid(pathName, subidPlacement, localeCode),
          className: "button",
          ariaLabel: `${buttonText} (${pathName})`,
        })}
        ${
          showSecondary
            ? ctaLinkTag({
                type: secondaryType,
                label: secondaryLabel,
                href: secondaryHref,
                subid: pageSubid(pathName, secondarySubidPlacement, localeCode),
                className: "button button-secondary",
                ariaLabel: `${secondaryLabel} (${pathName})`,
              })
            : ""
        }
      </div>
    </section>
  `;
}

function contentPageCtaConfig(pathName) {
  if (pathName === routes.howItWorks) {
    return {
      heroPrimaryLabel: "Read the Core Guide",
      heroPrimaryHref: routes.tiktokAds,
      heroSecondaryLabel: "Read the FAQ",
      heroSecondaryHref: routes.faq,
      finalTitle: "Ready to compare fit by market?",
      finalBody:
        "Use the core guide first, then move into country pages or the partner offer only once the launch path is clearer.",
      finalPrimaryLabel: "Browse Market Pages",
      finalPrimaryHref: routes.markets,
    };
  }

  if (pathName === routes.faq) {
    return {
      heroPrimaryLabel: "See How It Works",
      heroPrimaryHref: routes.howItWorks,
      heroSecondaryLabel: "Contact Support",
      heroSecondaryHref: routes.contact,
      finalTitle: "Still comparing the best next step?",
      finalBody:
        "Use the FAQ to remove friction first, then move into support, market pages, or the partner offer when the route feels commercially clear.",
      finalPrimaryLabel: "Contact Support",
      finalPrimaryHref: routes.contact,
    };
  }

  return {
    heroPrimaryLabel: "See How It Works",
    heroPrimaryHref: routes.howItWorks,
    heroSecondaryLabel: "Read the FAQ",
    heroSecondaryHref: routes.faq,
    finalTitle: "Keep exploring before you choose the next route.",
    finalBody:
      "Move from this guide into market pages, FAQ, or the partner offer only after the business fit and next step are clear.",
    finalPrimaryLabel: "Browse Market Pages",
    finalPrimaryHref: routes.markets,
  };
}

function snippetTakeaways({
  eyebrow = "At a glance",
  title = "Key takeaways before the next click.",
  items = [],
  ordered = true,
}) {
  const safeItems = items.filter(Boolean);
  if (!safeItems.length) return "";
  const tag = ordered ? "ol" : "ul";

  return `
    <section class="snippet-panel section">
      <div class="section-copy">
        <p class="eyebrow">${eyebrow}</p>
        <h2>${title}</h2>
      </div>
      <${tag} class="snippet-list">
        ${safeItems.map((item) => `<li>${item}</li>`).join("")}
      </${tag}>
    </section>
  `;
}

function factSummarySection({ eyebrow = "Key facts", title, facts = [] }) {
  if (!facts.length) return "";
  return `
    <section class="snippet-panel section">
      <div class="section-copy">
        <p class="eyebrow">${eyebrow}</p>
        <h2>${title}</h2>
      </div>
      <dl class="fact-grid">
        ${facts
          .map(
            (fact) => `
              <div>
                <dt>${fact.label}</dt>
                <dd>${fact.value}</dd>
              </div>
            `,
          )
          .join("")}
      </dl>
    </section>
  `;
}

function summaryTable({ eyebrow, title, headers = [], rows = [] }) {
  if (!headers.length || !rows.length) return "";
  return `
    <section class="snippet-panel section">
      <div class="section-copy">
        <p class="eyebrow">${eyebrow}</p>
        <h2>${title}</h2>
      </div>
      <div class="summary-table-wrap">
        <table class="summary-table">
          <thead>
            <tr>
              ${headers.map((header) => `<th scope="col">${header}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    ${row.map((cell) => `<td>${cell}</td>`).join("")}
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function homepage() {
  const homeFaq = [
    {
      q: "Is TikTok only for big brands?",
      a: "No. It can work for small businesses, local companies, ecommerce stores, apps, and agencies when the offer and creative are aligned.",
    },
    {
      q: "Do I need a huge budget to test TikTok ads?",
      a: "Not necessarily. Many advertisers start with controlled budgets, narrow goals, and staged testing before scaling.",
    },
    {
      q: "Can I advertise in my country?",
      a: "This site supports multiple launch markets and dedicated country pages so visitors can explore market fit before clicking through.",
    },
  ];

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: `${siteUrl}/`,
    },
    faqSchema(homeFaq),
  ];

  const content = `
    <main>
      <section class="hero-section">
        <div class="hero-copy">
          <p class="eyebrow">${siteDescriptor}</p>
          <h1>A Smarter Guide to TikTok Ads for Business</h1>
          <p class="hero-lead">Discover how modern businesses explore TikTok advertising to reach new audiences, test new markets, and grow with flexible campaign budgets.</p>
          <div class="editorial-meta">
            <span>Last updated ${editorialDateDisplay}</span>
            <span>Reviewed by ${editorialTeamName}</span>
          </div>
          <div class="hero-actions" id="primary-cta">
            <a class="button" href="${routes.tiktokAds}">Start with the Guide</a>
            <a class="button button-secondary" href="${routes.howItWorks}">See How It Works</a>
          </div>
          <div class="hero-offer-callout">
            <div>
              <p class="eyebrow">Current partner offer</p>
              <p class="hero-offer-title">Spend $500, Get $500 in FREE TikTok Advertising Credit!</p>
              <p class="hero-offer-copy">Review the offer path and current terms before continuing.</p>
            </div>
            <a class="button button-small hero-offer-cta" href="${featuredOfferUrl}" target="_blank" rel="sponsored noopener noreferrer">Claim the $500 offer</a>
          </div>
          <p class="microcopy">Independent business resource. Start with the guide, then use the partner offer only if it still fits the business case.</p>
          ${heroStats()}
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="visual-orbit orbit-one"></div>
          <div class="visual-orbit orbit-two"></div>
          <div class="hero-visual-card">
            <p class="eyebrow hero-visual-eyebrow">Core use cases</p>
            <ul>
              <li>Business growth planning</li>
              <li>Market expansion research</li>
              <li>Paid traffic qualification</li>
              <li>Performance-minded launch paths</li>
            </ul>
          </div>
          <div class="hero-visual-caption">
            <span>Commercial clarity before campaign setup</span>
            <span>Modern channel research for growth teams</span>
          </div>
        </div>
      </section>

      <section class="benefit-strip section">
        <div class="benefit-item"><strong>Commercially clear</strong><span>Built for cold traffic that needs instant context.</span></div>
        <div class="benefit-item"><strong>Multi-market ready</strong><span>Support international expansion with country-specific routes.</span></div>
        <div class="benefit-item"><strong>Beginner to advanced</strong><span>Useful for first-time advertisers and performance teams alike.</span></div>
        <div class="benefit-item"><strong>Independent and transparent</strong><span>Trust-first structure with visible disclosures and legal pages.</span></div>
      </section>

      ${snippetTakeaways({
        title: "What this site helps a business decide first.",
        items: [
          "Whether TikTok ads fit the business model, audience, and current growth stage.",
          "Which next page answers the real blocker: setup, cost, GEO fit, FAQ, or partner offer.",
          "How to move from research into the most useful next step without rushing the decision.",
        ],
      })}

      <section class="section split-section">
        <div>
          <p class="eyebrow">Why businesses choose TikTok advertising</p>
          <h2>Explore the channel with less noise and more business context.</h2>
          <p>Visitors from Google Ads are usually comparing cost, setup difficulty, audience quality, and whether the channel fits their business at all. The homepage should answer those questions fast and route people into the right next page.</p>
        </div>
        <div class="stack-list">
          <div>
            <h3>Reach new audiences earlier</h3>
            <p>Help businesses understand how short-form, creative-led advertising can build demand before people search with obvious intent.</p>
          </div>
          <div>
            <h3>Expand market by market</h3>
            <p>Give brands and agencies a clean path into GEO pages, launch guides, and region-specific considerations.</p>
          </div>
          <div>
            <h3>Start without enterprise friction</h3>
            <p>Reduce intimidation for small businesses and lean teams by explaining the channel in plain commercial terms.</p>
          </div>
          <div>
            <h3>Think beyond hype</h3>
            <p>Position TikTok ads as a serious growth option when creative, offer, tracking, and landing-page quality all align.</p>
          </div>
        </div>
      </section>

      <section class="section">
        <p class="eyebrow">Who is this for?</p>
        <h2>Built for the teams most likely to ask hard commercial questions first.</h2>
        <div class="audience-grid">
          <article>
            <h3>Small business owners</h3>
            <p>Need a practical route into paid growth without turning setup into a full-time job.</p>
          </article>
          <article>
            <h3>Ecommerce brands</h3>
            <p>Need more product discovery and broader creative testing than search alone can provide.</p>
          </article>
          <article>
            <h3>App marketers</h3>
            <p>Need creative-led acquisition, better hooks, and fresh opportunities for install growth.</p>
          </article>
          <article>
            <h3>Agencies and media buyers</h3>
            <p>Need a credible, client-safe explanation of where TikTok fits and how to launch it.</p>
          </article>
          <article>
            <h3>Local businesses</h3>
            <p>Want a more modern way to generate awareness, enquiries, bookings, or customer intent.</p>
          </article>
          <article>
            <h3>International expansion teams</h3>
            <p>Need a cleaner framework for evaluating and testing multi-country growth opportunities.</p>
          </article>
        </div>
      </section>

      <section class="section split-section geo-callout">
        <div>
          <p class="eyebrow">Expand into global markets</p>
          <h2>Support worldwide growth without rebuilding the message every time.</h2>
          <p>From the USA and UK to Brazil, Singapore, UAE, Mexico, and South Korea, the site already supports market-by-market pages that align search intent with a locally relevant launch path.</p>
          <a class="text-link" href="/markets/">Browse all supported markets</a>
        </div>
        <div class="market-grid">
          ${marketGrid(6)}
        </div>
      </section>

      <section class="section process-section">
        <p class="eyebrow">Simple launch process</p>
        <h2>Four simple steps from curiosity to launch-ready intent.</h2>
        <div class="process-grid">
          <article>
            <span>01</span>
            <h3>Learn the fit</h3>
            <p>Understand who TikTok ads can help, what they can do, and whether the channel fits the business model.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Pick the right path</h3>
            <p>Move into a market guide, a setup guide, or a business-type page instead of guessing what to read next.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Clear objections</h3>
            <p>Handle budget, setup difficulty, market availability, and measurement questions before the click-through.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Move forward</h3>
            <p>Use clear CTAs once the visitor has enough trust and context to take the next step.</p>
          </article>
        </div>
      </section>

      <section class="section split-section">
        <div>
          <p class="eyebrow">Why businesses explore TikTok ads</p>
          <h2>Search captures demand. TikTok can help create it.</h2>
        </div>
        <div class="stack-list">
          <div>
            <h3>Not just for big brands</h3>
            <p>Small and mid-sized businesses can test the channel with focused goals, strong creative, and controlled budgets.</p>
          </div>
          <div>
            <h3>Not just an awareness play</h3>
            <p>When offer, creative, and landing path line up, TikTok can support both discovery and measurable commercial action.</p>
          </div>
          <div>
            <h3>Not limited to one market</h3>
            <p>Brands expanding internationally can use the channel to test demand in multiple GEOs without rebuilding the whole growth stack.</p>
          </div>
        </div>
      </section>

        <section class="section faq-preview">
        <p class="eyebrow">FAQ preview</p>
        <h2>Questions cold traffic asks before it trusts the next step.</h2>
        <div class="faq-list">
          ${homeFaq
            .map(
              (item) => `
                <details>
                  <summary>${item.q}</summary>
                  <p>${item.a}</p>
                </details>
              `,
            )
            .join("")}
        </div>
        <a class="text-link" href="/faq.html">Read the full FAQ</a>
      </section>

      <section class="section split-section trust-section">
        <div>
          <p class="eyebrow">Trust and independence</p>
          <h2>Built to guide business decisions, not imitate an official platform.</h2>
          <p>${siteName} is designed to help businesses evaluate TikTok advertising with practical, commercially aware guidance. It does not present itself as the official TikTok corporate website.</p>
        </div>
        <div class="stack-list">
          <div>
            <h3>Independent resource</h3>
            <p>The site uses visible disclosures and avoids misleading “official partner” style framing.</p>
          </div>
          <div>
            <h3>Built for decision support</h3>
            <p>Pages are structured around fit, setup, costs, markets, objections, and next-step clarity.</p>
          </div>
          <div>
            <h3>Built to qualify the next step</h3>
            <p>The messaging prioritizes clarity, trust, and useful internal routing before any visitor is asked to open a partner offer.</p>
          </div>
        </div>
      </section>

      ${ctaBlock(
        "Ready to move from early research into a clearer business decision?",
        "Use the guide, FAQ, and market pages first. Open the partner offer only after the fit, market, and next step are already clear.",
        "Start with the Guide",
        routes.tiktokAds,
        {
          pathName: "/",
          localeCode: "en",
          primaryType: "internal",
          subidPlacement: "home_final_cta",
          secondaryHref: routes.partnerOffer,
          secondaryLabel: "Open Partner Offer",
          secondaryType: "affiliate",
          secondarySubidPlacement: "home_final_partner",
        },
      )}
    </main>
  `;

  return layout({
    pathName: "/",
    title: "Smarter TikTok Ads Guide for Business | Business Ads Guide",
    description:
      "Learn how businesses use TikTok advertising to reach new audiences, test markets, plan budgets, and grow with a smarter, trust-first guide.",
    bodyClass: "theme-growth",
    alternateTranslationKey: "home",
    content,
    schema,
  });
}

function localizedHomepage(localeCode) {
  const locale = getLocaleConfig(localeCode);
  const home = locale.home;
  const pathName = localizedPath(localeCode, "home");

  return layout({
    pathName,
    title: home.title,
    description: home.description,
    bodyClass: "theme-growth",
    htmlLang: locale.hreflang || locale.code,
    dir: locale.dir || "ltr",
    localeCode,
    translationKey: "home",
    alternateTranslationKey: "home",
    brandEyebrow: locale.descriptor,
    headerCtaLabel: home.primaryCta,
    mobileCtaLabel: home.primaryCta,
    navMarkup: localizedNav(localeCode, "home"),
    schema: [
      faqSchema(home.faq),
    ],
    content: `
      <main class="inner-page localized-page">
        <section class="page-hero section">
          <p class="eyebrow">${home.eyebrow}</p>
          <h1>${home.h1}</h1>
          <p class="page-lead">${home.lead}</p>
          <div class="hero-actions" id="primary-cta">
            <a class="button" href="${localizedPath(localeCode, "offer")}">${home.secondaryCta}</a>
            ${ctaLinkTag({
              type: "affiliate",
              label: home.primaryCta,
              href: localizedPath(localeCode, "offer"),
              subid: pageSubid(pathName, "hero_partner_secondary", localeCode),
              className: "button button-secondary",
              ariaLabel: `${home.primaryCta} (${pathName})`,
            })}
          </div>
          <p class="microcopy">${locale.descriptor}</p>
        </section>

        <section class="benefit-strip section">
          ${home.benefits
            .map(
              (benefit) => `<div class="benefit-item"><strong>${benefit}</strong><span>${locale.descriptor}</span></div>`,
            )
            .join("")}
        </section>

        <section class="section split-section">
          <div>
            <p class="eyebrow">${home.eyebrow}</p>
            <h2>${home.whyTitle}</h2>
            <p>${home.whyLead}</p>
          </div>
          <div class="stack-list">
            ${home.whyItems
              .map(
                (item) => `
                  <div>
                    <h3>${item.title}</h3>
                    <p>${item.body}</p>
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>

        <section class="section faq-preview">
          <p class="eyebrow">${home.eyebrow}</p>
          <h2>${home.faqTitle}</h2>
          <div class="faq-list">
            ${home.faq
              .map(
                (item) => `
                  <details>
                    <summary>${item.q}</summary>
                    <p>${item.a}</p>
                  </details>
                `,
              )
              .join("")}
          </div>
        </section>

        ${ctaBlock(
          home.finalTitle,
          home.finalBody,
          home.secondaryCta,
          localizedPath(localeCode, "offer"),
          {
            pathName,
            localeCode,
            primaryType: "internal",
            subidPlacement: "localized_final_cta",
            secondaryHref: localizedPath(localeCode, "offer"),
            secondaryLabel: home.primaryCta,
            secondaryType: "affiliate",
            secondarySubidPlacement: "localized_final_partner",
          },
        )}
      </main>
    `,
  });
}

function partnerOfferPage(localeCode = "en") {
  const locale = getLocaleConfig(localeCode);
  const offer = locale.offer;
  const pathName = localizedPath(localeCode, "offer");
  const offerGuidePrimaryLabel =
    localeCode === "en" ? "Check fit first" : offer.stepsTitle;
  const offerGuidePrimaryHref = localeCode === "en" ? "#offer-fit" : "#offer-steps";

  return layout({
    pathName,
    title: offer.title,
    description: offer.description,
    bodyClass: "theme-growth",
    htmlLang: locale.hreflang || locale.code,
    dir: locale.dir || "ltr",
    localeCode,
    translationKey: "offer",
    alternateTranslationKey: "offer",
    brandEyebrow: locale.descriptor,
    headerCtaLabel: offer.primaryCta,
    mobileCtaLabel: offer.primaryCta,
    navMarkup: localizedNav(localeCode, "offer"),
    schema: [
      articleSchema({
        pathName,
        title: offer.title,
        description: offer.description,
        h1: offer.h1,
        eyebrow: offer.eyebrow,
      }),
    ],
    content: `
      <main class="inner-page localized-page">
        <section class="page-hero section">
          <p class="eyebrow">${offer.eyebrow}</p>
          <h1>${offer.h1}</h1>
          <p class="page-lead">${offer.lead}</p>
          <div class="editorial-meta">
            <span>Last updated ${editorialDateDisplay}</span>
            <span>Sources: official TikTok pages</span>
          </div>
          <div class="hero-actions" id="primary-cta">
            <a class="button" href="${offerGuidePrimaryHref}">${offerGuidePrimaryLabel}</a>
            ${ctaLinkTag({
              type: "affiliate",
              label: offer.primaryCta,
              href: localizedPath(localeCode, "offer"),
              subid: pageSubid(pathName, "offer_hero_primary", localeCode),
              className: "button button-secondary",
              ariaLabel: `${offer.primaryCta} (${pathName})`,
            })}
          </div>
          ${
            localeCode === "en"
              ? '<p class="microcopy">Independent summary page. Start with the fit check and source review. Open the partner route only if the offer still matches the business need.</p>'
              : ""
          }
        </section>

        <section class="section split-section" id="offer-summary">
          <div>
            <p class="eyebrow">${offer.eyebrow}</p>
            <h2>${offer.factsTitle}</h2>
            <p>${offer.factsLead}</p>
          </div>
          <div class="stack-list">
            ${offer.facts
              .map(
                (fact) => `
                  <div>
                    <h3>${firstSentence(fact)}</h3>
                    <p>${fact}</p>
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>

        ${
          localeCode === "en"
            ? `<section class="section split-section">
                <div>
                  <p class="eyebrow">Official context</p>
                  <h2>What can safely be reused from the official site.</h2>
                  <p>This site can reference public official information as an independent summary. The safe approach is to paraphrase the offer, cite the source, avoid copying blocks of text, and avoid presenting this page as an official TikTok property.</p>
                </div>
                <div class="stack-list">
                  <div>
                    <h3>Launch support</h3>
                    <p>Official getstarted pages position the offer around easier onboarding and a simpler route into campaign setup.</p>
                  </div>
                  <div>
                    <h3>Ad-credit incentives</h3>
                    <p>Official TikTok pages publicly promote limited-time coupon or ad-credit incentives, but the available amount and thresholds can vary by market or active promotion.</p>
                  </div>
                  <div>
                    <h3>Eligibility rules</h3>
                    <p>Official coupon pages describe conditions around new or existing advertiser status, spend windows, account approval, and compliance with ad policies before credits are issued.</p>
                  </div>
                </div>
              </section>`
            : ""
        }

        ${
          localeCode === "en"
            ? `<section class="section split-section" id="offer-fit">
                <div>
                  <p class="eyebrow">Fit check</p>
                  <h2>When this route is helpful, and when it is better to wait.</h2>
                  <p>This site should help a visitor decide whether they are ready for the partner route, not pressure them into clicking before the basics are clear.</p>
                </div>
                <div class="stack-list">
                  <div>
                    <h3>Good moment to continue</h3>
                    <p>The business goal is clear, the landing experience already exists, and the team is comparing the offer against real launch plans.</p>
                  </div>
                  <div>
                    <h3>Better moment to pause</h3>
                    <p>If budget, market, messaging, or campaign ownership are still unresolved, it is usually smarter to keep reading the guide first.</p>
                  </div>
                  <div>
                    <h3>Best use of this page</h3>
                    <p>Treat it as an independent pre-qualification layer that helps the next click feel informed instead of rushed.</p>
                  </div>
                </div>
              </section>`
            : ""
        }

        <section class="section split-section" id="offer-steps">
          <div>
            <p class="eyebrow">${offer.eyebrow}</p>
            <h2>${offer.stepsTitle}</h2>
          </div>
          <div class="stack-list">
            ${offer.steps
              .map(
                (step, index) => `
                  <div>
                    <h3>0${index + 1}</h3>
                    <p>${step}</p>
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>

        <section class="section split-section">
          <div>
            <p class="eyebrow">${offer.eyebrow}</p>
            <h2>${offer.rulesTitle}</h2>
          </div>
          <div class="stack-list">
            ${offer.rules
              .map(
                (rule) => `
                  <div>
                    <h3>${firstSentence(rule)}</h3>
                    <p>${rule}</p>
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>

        <section class="section content-section">
          <div class="section-copy">
            <p class="eyebrow">${offer.eyebrow}</p>
            <h2>${offer.sourceIntro}</h2>
            <p>${offer.lead}</p>
          </div>
          <div class="source-list">
            ${partnerOfferSources
              .map(
                (source) => `
                  <article>
                    <h3>${externalLink(source.url, source.label)}</h3>
                    <p>${offer.sourceLabel}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>

        ${ctaBlock(
          localeCode === "en"
            ? "Open the partner route only after the offer is clear."
            : offer.factsTitle,
          localeCode === "en"
            ? "This page should create enough clarity that the partner click feels deliberate, not pushed. If the fit still is not clear, go back to the local guide."
            : offer.lead,
          offer.primaryCta,
          localizedPath(localeCode, "offer"),
          {
            pathName,
            localeCode,
            primaryType: "affiliate",
            subidPlacement: "offer_final_cta",
            secondaryHref: localizedPath(localeCode, "home"),
            secondaryLabel: offer.secondaryCta,
            secondaryType: "internal",
          },
        )}
      </main>
    `,
  });
}

function contentPage({
  pathName,
  title,
  description,
  eyebrow,
  h1,
  intro,
  sections,
  faq = [],
  quickAnswer = firstSentence(intro),
  robots = pathName === routes.notFound ? "noindex, follow" : "index, follow",
  sources = sourceLinksFor(pathName),
  relatedLinks = [
    [routes.resources, "Resources Hub"],
    [routes.markets, "Markets"],
    [routes.faq, "FAQ"],
    [routes.about, "About"],
  ],
}) {
  const enrichedSections = [...sections, ...supplementalSections({ pathName })];
  const ctaConfig = contentPageCtaConfig(pathName);
  const schemas = [];
  const snippetItems = [
    quickAnswer,
    enrichedSections[0] ? firstSentence(enrichedSections[0].body) : "",
    enrichedSections[1] ? firstSentence(enrichedSections[1].body) : "",
  ].filter(Boolean);
  const editorialMarkup =
    pathName === routes.notFound
      ? ""
      : `<div class="editorial-meta">
          <span>Last updated ${editorialDateDisplay}</span>
          <span>Reviewed by ${editorialTeamName}</span>
        </div>
        <div class="quick-answer">
          <p class="eyebrow">Quick answer</p>
          <p>${quickAnswer}</p>
        </div>`;
  const faqMarkup = faq.length
    ? `<section class="section faq-preview">
        <p class="eyebrow">Questions to remove friction</p>
        <h2>FAQ</h2>
        <div class="faq-list">
          ${faq
            .map(
              (item) => `
                <details>
                  <summary>${item.q}</summary>
                  <p>${item.a}</p>
                </details>
              `,
            )
            .join("")}
        </div>
      </section>`
    : "";
  const sourcesMarkup =
    pathName === routes.notFound || !sources.length
      ? ""
      : `<section class="section content-section">
          <div class="section-copy">
            <p class="eyebrow">Sources and references</p>
            <h2>Useful sources behind the guide.</h2>
            <p>These references help visitors compare this independent guide against official platform information and broader industry reporting.</p>
          </div>
          <div class="source-list">
            ${sources
              .map(
                (source) => `
                  <article>
                    <h3>${externalLink(source.url, source.label)}</h3>
                    <p>Open in a new tab for direct reading and comparison.</p>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>`;
  const decisionChecklistMarkup =
    pathName === routes.notFound
      ? ""
      : `<section class="section content-section">
          <div class="section-copy">
            <p class="eyebrow">Decision checklist</p>
            <h2>What to validate before the next click.</h2>
            <p>Before moving deeper into setup or market pages, use this short checklist to decide whether the page answered the real blocker or whether another guide should be opened next.</p>
          </div>
          <div class="stack-list">
            <div>
              <h3>Is the business objective clear?</h3>
              <p>Know whether the next step is about reach, lead intent, sales, installs, or market validation before evaluating campaign mechanics.</p>
            </div>
            <div>
              <h3>Is the page-to-page route obvious?</h3>
              <p>A strong guide should make the next relevant page clear, whether that is cost, setup, tracking, FAQ, or GEO-specific planning.</p>
            </div>
            <div>
              <h3>Is the landing path trustworthy enough for paid traffic?</h3>
              <p>Look for message match, transparent disclosure, and a simple CTA flow so the click feels commercially safe rather than rushed.</p>
            </div>
          </div>
        </section>`;
  const relatedLinksMarkup = relatedLinks
    .map(([href, label]) => `<a href="${href}">${label}</a>`)
    .join("");
  if (faq.length > 0) {
    schemas.push(faqSchema(faq));
  }
  if (pathName !== routes.notFound) {
    schemas.push(articleSchema({ pathName, title, description, h1, eyebrow }));
  }
  if (pathName === routes.howItWorks) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How businesses evaluate TikTok advertising before launch",
      description,
      step: enrichedSections.map((section, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: section.title,
        text: section.body,
      })),
    });
  }

  return layout({
    pathName,
    title,
    description,
    robots,
    bodyClass: "theme-growth",
    schema: schemas,
    content: `
      <main class="inner-page">
        <section class="page-hero section">
          <p class="eyebrow">${eyebrow}</p>
          <h1>${h1}</h1>
          <p class="page-lead">${intro}</p>
          ${editorialMarkup}
          <div class="hero-actions" id="primary-cta">
            <a class="button" href="${ctaConfig.heroPrimaryHref}">${ctaConfig.heroPrimaryLabel}</a>
            <a class="button button-secondary" href="${ctaConfig.heroSecondaryHref}">${ctaConfig.heroSecondaryLabel}</a>
          </div>
        </section>
        ${snippetTakeaways({
          title: "What matters most on this page.",
          items: snippetItems,
        })}
        ${enrichedSections
          .map(
            (section) => `
              <section class="section content-section">
                <div class="section-copy">
                  <p class="eyebrow">${section.eyebrow}</p>
                  <h2>${section.title}</h2>
                  <p>${section.body}</p>
                </div>
                ${
                  section.items
                    ? `<div class="stack-list">
                    ${section.items
                      .map(
                        (item) => `
                          <div>
                            <h3>${item.title}</h3>
                            <p>${item.body}</p>
                          </div>
                        `,
                      )
                      .join("")}
                  </div>`
                    : ""
                }
              </section>
            `,
          )
          .join("")}
        ${faqMarkup}
        ${sourcesMarkup}
        ${decisionChecklistMarkup}
        <section class="section content-section">
          <div class="section-copy">
            <p class="eyebrow">Keep exploring</p>
            <h2>Related pages that answer the next question.</h2>
            <p>Strong internal linking keeps visitors in the decision path and helps search engines understand topic coverage across the site.</p>
          </div>
          <div class="related-links">
            ${relatedLinksMarkup}
          </div>
        </section>
        ${ctaBlock(ctaConfig.finalTitle, ctaConfig.finalBody, ctaConfig.finalPrimaryLabel, ctaConfig.finalPrimaryHref, {
          pathName,
          localeCode: "en",
          primaryType: "internal",
          subidPlacement: "article_final_cta",
          secondaryHref: routes.partnerOffer,
          secondaryLabel: "Open Partner Offer",
          secondaryType: "affiliate",
          secondarySubidPlacement: "article_final_partner",
        })}
      </main>
    `,
  });
}

function resourcesIndex() {
  const resourceListItems = resourcePages.map((page) => ({
    name: page.h1,
    url: `${siteUrl}/resources/${page.slug}.html`,
  }));

  return layout({
    pathName: "/resources/",
    title: "TikTok Advertising Resources | Business Ads Guide",
    description:
      "Browse practical resources on TikTok ads cost, ROI, setup, tracking, formats, strategy, optimization, ecommerce, and international expansion.",
    bodyClass: "theme-growth",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "TikTok Advertising Resources",
        description:
          "Resource hub for TikTok advertising cost, ROI, setup, strategy, formats, optimization, and international expansion guidance.",
        url: `${siteUrl}/resources/`,
        hasPart: resourceListItems.map((item) => item.url),
      },
      itemListSchema({
        pathName: "/resources/",
        name: "Business Ads Guide resources",
        description:
          "Ordered list of resource and core guides covering TikTok ads cost, setup, tracking, strategy, formats, and expansion planning.",
        items: resourceListItems,
      }),
    ],
    content: `
      <main class="inner-page">
        <section class="page-hero section">
          <p class="eyebrow">Resources</p>
          <h1>Practical TikTok advertising resources for real business decisions.</h1>
          <p class="page-lead">This section is built to answer the searches that happen just before action: cost, setup, formats, tracking, optimization, ecommerce, and expansion logic.</p>
          <div class="editorial-meta">
            <span>Last updated ${editorialDateDisplay}</span>
            <span>Reviewed by ${editorialTeamName}</span>
          </div>
          <div class="hero-actions" id="primary-cta">
            <a class="button" href="${routes.tiktokAds}">Start with the Core Guide</a>
            <a class="button button-secondary" href="${routes.markets}">Browse Markets</a>
          </div>
        </section>
        ${summaryTable({
          eyebrow: "Resource overview",
          title: "The strongest guides in this hub at a glance.",
          headers: ["Guide", "Primary question", "Best use"],
          rows: resourcePages.map((page) => [
            `<a href="/resources/${page.slug}.html">${page.h1}</a>`,
            page.description,
            firstSentence(page.intro),
          ]),
        })}
        <section class="section">
          <div class="market-grid full-grid">
            ${resourcePages
              .map(
                (page) => `
                  <article class="market-card resource-card">
                    <p class="eyebrow">${page.eyebrow}</p>
                    <h2><a href="/resources/${page.slug}.html">${page.h1}</a></h2>
                    <p>${page.description}</p>
                    <a class="text-link" href="/resources/${page.slug}.html">Read this guide</a>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
        <section class="section">
          <div class="section-copy">
            <p class="eyebrow">Core SEO guides</p>
            <h2>Foundation pages for setup, cost, and tracking intent.</h2>
            <p>These pages mirror the strongest core clusters in the topic and act as hubs for more specific long-tail searches.</p>
          </div>
          <div class="market-grid full-grid">
            ${seoGrowthPages
              .map(
                (page) => `
                  <article class="market-card resource-card">
                    <p class="eyebrow">${page.eyebrow}</p>
                    <h2><a href="${page.pathName}">${page.h1}</a></h2>
                    <p>${page.description}</p>
                    <a class="text-link" href="${page.pathName}">Open guide</a>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
        ${ctaBlock(
          "Need the market-specific route next?",
          "Use the resources hub to answer cost and setup objections, then move visitors into GEO pages and launch pages with stronger intent.",
          "Explore Market Pages",
          routes.markets,
          {
            pathName: routes.resources,
            localeCode: "en",
            primaryType: "internal",
            subidPlacement: "resources_final_cta",
            secondaryHref: routes.partnerOffer,
            secondaryLabel: "Open Partner Offer",
            secondaryType: "affiliate",
            secondarySubidPlacement: "resources_final_partner",
          },
        )}
      </main>
    `,
  });
}

function siteMapPage() {
  const primaryLinks = [
    [routes.home, "Home"],
    [routes.partnerOffer, "Offer Guide"],
    [routes.whyTikTokAds, "Why TikTok Ads"],
    [routes.howItWorks, "How It Works"],
    [routes.resources, "Resources"],
    [routes.smallBusiness, "For Small Business"],
    [routes.agencies, "For Agencies"],
    [routes.markets, "Markets"],
    [routes.faq, "FAQ"],
    [routes.about, "About"],
    [routes.contact, "Contact"],
  ];

  return layout({
    pathName: routes.siteMap,
    title: "HTML Sitemap | Business Ads Guide",
    description:
      "Browse all major sections, resources, market pages, and trust pages on Business Ads Guide in one HTML sitemap.",
    robots: "noindex, follow",
    bodyClass: "theme-growth",
    content: `
      <main class="inner-page">
        <section class="page-hero section">
          <p class="eyebrow">HTML Sitemap</p>
          <h1>Browse the full site structure in one place.</h1>
          <p class="page-lead">Useful for users, crawlers, and anyone who wants a fast overview of the main commercial and informational pages.</p>
        </section>
        <section class="section split-section">
          <div class="section-copy">
            <p class="eyebrow">Primary pages</p>
            <h2>Main conversion and trust pages.</h2>
          </div>
          <div class="stack-list">
            ${primaryLinks.map(([href, label]) => `<div><h3><a href="${href}">${label}</a></h3></div>`).join("")}
          </div>
        </section>
        <section class="section split-section">
          <div class="section-copy">
            <p class="eyebrow">Resource pages</p>
            <h2>Long-tail educational guides.</h2>
          </div>
          <div class="stack-list">
            ${resourcePages
              .map(
                (page) => `<div><h3><a href="/resources/${page.slug}.html">${page.h1}</a></h3><p>${page.description}</p></div>`,
              )
              .join("")}
          </div>
        </section>
        <section class="section split-section">
          <div class="section-copy">
            <p class="eyebrow">Core SEO guides</p>
            <h2>Hub pages for topic authority.</h2>
          </div>
          <div class="stack-list">
            ${seoGrowthPages
              .map(
                (page) => `<div><h3><a href="${page.pathName}">${page.h1}</a></h3><p>${page.description}</p></div>`,
              )
              .join("")}
          </div>
        </section>
        <section class="section split-section">
          <div class="section-copy">
            <p class="eyebrow">Markets</p>
            <h2>Country pages.</h2>
          </div>
          <div class="stack-list">
            ${geos
              .map(
                (geo) => `<div><h3><a href="/markets/${geo.slug}.html">Launch TikTok Ads in ${geo.name}</a></h3><p>${geoSummaryText(geo)}</p></div>`,
              )
              .join("")}
          </div>
        </section>
      </main>
    `,
  });
}

function geoPage(geo) {
  const pathName = `/markets/${geo.slug}.html`;
  const faq = [
    {
      q: `Can businesses advertise on TikTok in ${geo.name}?`,
      a: `Businesses exploring ${geo.name} often look for a practical, visual channel to reach new audiences. A local review of current eligibility, policy, and setup options is still recommended before launch.`,
    },
    {
      q: `Is TikTok only useful in ${geo.name} for big brands?`,
      a: `No. ${geo.name} can also be relevant for smaller advertisers, local businesses, ecommerce teams, and agencies when goals, messaging, and landing-page quality are aligned.`,
    },
    {
      q: `Do I need a huge budget to test TikTok ads in ${geo.name}?`,
      a: `Not necessarily. Many businesses begin with controlled tests, clear objectives, and a staged rollout before deciding whether to scale further in ${geo.name}.`,
    },
  ];

  const schema = faqSchema(faq);

  return layout({
    pathName,
    title: `Launch TikTok Ads in ${geo.name} | Business Ads Guide`,
    description: `Explore how businesses can evaluate TikTok advertising in ${geo.name}, reduce launch friction, handle local objections, and build market-specific growth plans.`,
    bodyClass: "theme-growth",
    schema: [
      schema,
      articleSchema({
        pathName,
        title: `Launch TikTok Ads in ${geo.name} | Business Ads Guide`,
        description: `Explore how businesses can evaluate TikTok advertising in ${geo.name}, reduce launch friction, and build market-specific growth plans.`,
        h1: `Launch TikTok Ads in ${geo.name}`,
        eyebrow: `${geo.region} market guide`,
      }),
    ],
    content: `
      <main class="inner-page">
        <section class="page-hero section">
          <p class="eyebrow">${geo.region} market guide</p>
          <h1>Launch TikTok Ads in ${geo.name}</h1>
          <p class="page-lead">${geo.marketBenefit}</p>
          <div class="editorial-meta">
            <span>Last updated ${editorialDateDisplay}</span>
            <span>Reviewed by ${editorialTeamName}</span>
          </div>
          <div class="hero-actions" id="primary-cta">
            <a class="button" href="${routes.howItWorks}">See How It Works</a>
            ${ctaLinkTag({
              type: "affiliate",
              label: "Open Partner Offer",
              href: routes.partnerOffer,
              subid: pageSubid(pathName, "geo_hero_partner", "en"),
              className: "button button-secondary",
              ariaLabel: `Open Partner Offer ${geo.name}`,
            })}
          </div>
          <p class="microcopy">Audience fit: ${geo.audienceFit}. Typical working currency: ${geo.currency}.</p>
        </section>

        ${factSummarySection({
          title: `${geo.name} market snapshot.`,
          facts: [
            { label: "Region", value: geo.region },
            { label: "Currency", value: geo.currency },
            { label: "Audience fit", value: geo.audienceFit },
            { label: "Best for", value: geo.bestFor },
          ],
        })}

        <section class="section split-section">
          <div>
            <p class="eyebrow">Why ${geo.name} may be worth exploring</p>
            <h2>Built for businesses that need practical growth, not channel theory.</h2>
            <p>${geoSummaryText(geo)}</p>
          </div>
          <div class="stack-list">
            <div>
              <h3>Audience-fit angle</h3>
              <p>${geo.audienceFit}</p>
            </div>
            <div>
              <h3>Why this market can matter</h3>
              <p>${geo.marketBenefit}</p>
            </div>
            <div>
              <h3>Best for</h3>
              <p>${geo.bestFor}</p>
            </div>
          </div>
        </section>

        <section class="section">
          <p class="eyebrow">Best for</p>
          <h2>Commercial use cases that tend to fit ${geo.name}.</h2>
          <div class="audience-grid">
            <article>
              <h3>Small businesses</h3>
              <p>Useful when the priority is affordable reach, new-customer acquisition, and a faster path from discovery to action.</p>
            </article>
            <article>
              <h3>Ecommerce brands</h3>
              <p>Strong for visually led product discovery, offer testing, and international market learning.</p>
            </article>
            <article>
              <h3>App marketers</h3>
              <p>Helpful for teams that need fresh creative volume and broader acquisition opportunities.</p>
            </article>
            <article>
              <h3>Agencies</h3>
              <p>Relevant for client programs that need a newer growth narrative with practical setup guidance.</p>
            </article>
          </div>
        </section>

        <section class="section split-section">
          <div>
            <p class="eyebrow">Market readiness checklist</p>
            <h2>What to validate before spending into ${geo.name}.</h2>
            <p>Market pages work best when they help a business decide what must be localized, what can stay standardized, and how to judge whether the first test deserves more budget.</p>
          </div>
          <div class="stack-list">
            <div>
              <h3>Offer clarity</h3>
              <p>Make sure the value proposition is easy to understand in ${geo.name} and does not rely on assumptions from another market.</p>
            </div>
            <div>
              <h3>Creative fit</h3>
              <p>Test messages that feel native to short-form discovery rather than repurposed from older campaign channels.</p>
            </div>
            <div>
              <h3>Landing trust</h3>
              <p>Use a fast page, visible trust language, and a direct CTA so paid clicks do not fall back into hesitation.</p>
            </div>
          </div>
        </section>

        <section class="section split-section">
          <div>
            <p class="eyebrow">Common mistakes</p>
            <h2>Why cross-border campaigns lose momentum too early.</h2>
          </div>
          <div class="stack-list">
            <div>
              <h3>Using one message everywhere</h3>
              <p>Even closely related markets respond differently to tone, proof, and offer framing. The page should reflect that reality.</p>
            </div>
            <div>
              <h3>Skipping the learning phase</h3>
              <p>A contained first test in ${geo.name} is usually more valuable than pushing scale before the signal is trustworthy.</p>
            </div>
            <div>
              <h3>Ignoring post-click friction</h3>
              <p>Traffic quality is only part of the outcome. Landing-page relevance and clarity still decide whether the click turns into useful intent.</p>
            </div>
          </div>
        </section>

        <section class="section split-section">
          <div>
            <p class="eyebrow">Next step options</p>
            <h2>Keep the decision path useful in ${geo.name}.</h2>
            <p>Use this page as the trust-building step before any outbound click. Internal guides should still be the first route when the business case needs one more check.</p>
          </div>
          <div class="cta-column">
            <a class="button button-full" href="${routes.whyTikTokAds}">Why TikTok Ads</a>
            <a class="button button-secondary button-full" href="${routes.howItWorks}">See How It Works</a>
            <a class="button button-secondary button-full" href="${routes.smallBusiness}">For Small Business</a>
            <a class="button button-secondary button-full" href="${routes.agencies}">For Agencies</a>
            ${ctaLinkTag({
              type: "affiliate",
              label: "Open Partner Offer",
              href: routes.partnerOffer,
              subid: pageSubid(pathName, "geo_mid_partner", "en"),
              className: "button button-secondary button-full",
              ariaLabel: `Open Partner Offer ${geo.name}`,
            })}
          </div>
        </section>

        <section class="section faq-preview">
          <p class="eyebrow">FAQ for ${geo.name}</p>
          <h2>Questions visitors may ask before clicking through.</h2>
          <div class="faq-list">
            ${faq
              .map(
                (item) => `
                  <details>
                    <summary>${item.q}</summary>
                    <p>${item.a}</p>
                  </details>
                `,
              )
              .join("")}
          </div>
        </section>

        <section class="section content-section">
          <div class="section-copy">
            <p class="eyebrow">Related pages</p>
            <h2>Keep visitors moving, not bouncing.</h2>
            <p>Internal links should support the next question in the visitor journey instead of forcing them back to search results.</p>
          </div>
          <div class="related-links">
            <a href="${routes.howItWorks}">How It Works</a>
            <a href="${routes.whyTikTokAds}">Why TikTok Ads</a>
            <a href="${routes.smallBusiness}">For Small Business</a>
            <a href="${routes.agencies}">For Agencies</a>
            <a href="${routes.faq}">Frequently Asked Questions</a>
          </div>
        </section>

        <section class="section content-section">
          <div class="section-copy">
            <p class="eyebrow">Sources and references</p>
            <h2>Useful comparison sources for market planning.</h2>
            <p>Review official platform information and a broader industry guide before treating any single market page as the full decision framework.</p>
          </div>
          <div class="source-list">
            ${sourceLinksFor(pathName)
              .map(
                (source) => `
                  <article>
                    <h3>${externalLink(source.url, source.label)}</h3>
                    <p>Open in a new tab for direct reading and comparison.</p>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
      </main>
    `,
  });
}

function marketsIndex() {
  const marketListItems = geos.map((geo) => ({
    name: `Launch TikTok Ads in ${geo.name}`,
    url: `${siteUrl}/markets/${geo.slug}.html`,
  }));

  return layout({
    pathName: "/markets/",
    title: "TikTok Ads by Country | Business Ads Guide",
    description:
      "Browse market-specific pages for businesses exploring TikTok advertising across the USA, UK, Brazil, UAE, Singapore, Mexico, and more.",
    bodyClass: "theme-growth",
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "TikTok Ads by Country",
        description:
          "Market hub for businesses exploring TikTok advertising across multiple countries and regions.",
        url: `${siteUrl}/markets/`,
        hasPart: marketListItems.map((item) => item.url),
      },
      itemListSchema({
        pathName: "/markets/",
        name: "TikTok Ads by country",
        description:
          "Ordered list of country pages for evaluating TikTok advertising market-by-market.",
        items: marketListItems,
      }),
    ],
    content: `
      <main class="inner-page">
        <section class="page-hero section">
          <p class="eyebrow">Multi-GEO landing page hub</p>
          <h1>Explore TikTok advertising by country.</h1>
          <p class="page-lead">Each market page is structured to answer local-fit questions, reduce hesitation, and help teams choose the next useful step before any outbound click.</p>
          <div class="editorial-meta">
            <span>Last updated ${editorialDateDisplay}</span>
            <span>Reviewed by ${editorialTeamName}</span>
          </div>
          <div class="hero-actions" id="primary-cta">
            <a class="button" href="${routes.howItWorks}">See How It Works</a>
            <a class="button button-secondary" href="${routes.faq}">Read the FAQ</a>
          </div>
        </section>
        ${summaryTable({
          eyebrow: "Market overview",
          title: "High-priority markets and what they signal.",
          headers: ["Country", "Region", "Currency", "Audience fit"],
          rows: geos.slice(0, 15).map((geo) => [
            `<a href="/markets/${geo.slug}.html">${geo.name}</a>`,
            geo.region,
            geo.currency,
            geo.audienceFit,
          ]),
        })}
        <section class="section">
          <div class="market-grid full-grid">
            ${marketGrid()}
          </div>
        </section>
      </main>
    `,
  });
}

function contactPage() {
  return layout({
    pathName: routes.contact,
    title: "Contact | Business Ads Guide",
    description: "Get in touch about TikTok advertising information, market pages, launch-path guidance, and partnership or support enquiries.",
    bodyClass: "theme-growth",
    schema: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact Business Ads Guide",
      description:
        "Contact page for Business Ads Guide with support details, partnership enquiries, and launch-path guidance.",
      url: `${siteUrl}${routes.contact}`,
      mainEntity: {
        "@type": "Organization",
        name: siteName,
        email: contactEmail,
      },
    },
    content: `
      <main class="inner-page">
        <section class="page-hero section">
          <p class="eyebrow">Contact</p>
          <h1>Need help evaluating the next step?</h1>
          <p class="page-lead">Keep contact friction low. The page should feel like a clean support layer for business questions, not a long form wall.</p>
          <div class="editorial-meta">
            <span>Last updated ${editorialDateDisplay}</span>
            <span>Support contact ${contactEmail}</span>
          </div>
        </section>
        <section class="section split-section">
          <div>
            <h2>Reach out</h2>
            <p>General enquiries, partnership questions, and launch-path clarifications can be sent through the contact details below.</p>
            <p><strong>Email:</strong> ${contactEmail}</p>
            <p><strong>Response window:</strong> Monday to Friday, within two business days.</p>
            <p><strong>Best for:</strong> GEO-specific launch questions, affiliate or partner enquiries, and requests about which page path best matches a business type.</p>
          </div>
          <div class="contact-form">
            <div>
              <h3>What to include in your message</h3>
              <p>Share the country or region, business type, offer category, and whether the goal is leads, sales, installs, or market validation. That makes follow-up more useful and reduces back-and-forth.</p>
            </div>
            <div>
              <h3>Suggested subject line</h3>
              <p>TikTok ads enquiry - [business type] - [target market]</p>
            </div>
            ${affiliateLinkTag({
              label: "Open Partner Offer",
              subid: pageSubid(routes.contact, "contact_primary", "en"),
              className: "button button-full",
              ariaLabel: "Contact page partner offer CTA",
            })}
            <a class="button button-secondary button-full" href="mailto:${contactEmail}?subject=TikTok%20ads%20enquiry">Email Support</a>
          </div>
        </section>
      </main>
    `,
  });
}

function aboutPage() {
  return layout({
    pathName: routes.about,
    title: "About Business Ads Guide | Independent TikTok Ads Resource",
    description:
      "Learn how Business Ads Guide approaches TikTok advertising research, editorial standards, independent disclosures, and trust-first updates for businesses.",
    bodyClass: "theme-growth",
    schema: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About Business Ads Guide",
      description:
        "Independent informational page describing editorial standards, disclosures, and the purpose of Business Ads Guide.",
      url: `${siteUrl}${routes.about}`,
    },
    content: `
      <main class="inner-page">
        <section class="page-hero section">
          <p class="eyebrow">About</p>
          <h1>Independent guidance for businesses exploring TikTok advertising.</h1>
          <p class="page-lead">${siteName} is built to help business owners, ecommerce teams, app marketers, and agencies understand how TikTok advertising may fit their growth plans without presenting itself as the official TikTok corporate website.</p>
          <div class="editorial-meta">
            <span>Last updated ${editorialDateDisplay}</span>
            <span>Reviewed by ${editorialTeamName}</span>
          </div>
        </section>
        <section class="section split-section">
          <div>
            <p class="eyebrow">Editorial standards</p>
            <h2>Clear, practical, and commercially aware.</h2>
            <p>The site is structured to reduce friction for high-intent visitors by summarizing platform fit, market expansion use cases, common objections, and next-step options in direct language.</p>
          </div>
          <div class="stack-list">
            <div>
              <h3>What this site is</h3>
              <p>An independent informational marketing resource that may contain affiliate or partner links.</p>
            </div>
            <div>
              <h3>What this site is not</h3>
              <p>It is not the official TikTok corporate website and does not claim ownership of TikTok or its trademarks.</p>
            </div>
            <div>
              <h3>Who it is for</h3>
              <p>Small businesses, ecommerce brands, agencies, app marketers, local businesses, and brands evaluating multi-market expansion.</p>
            </div>
          </div>
        </section>
        <section class="section split-section">
          <div>
            <p class="eyebrow">How we review content</p>
            <h2>Built to support trust, not imitate a platform owner.</h2>
            <p>Core pages are written to answer commercial questions first: fit, setup, budgeting, tracking, market expansion, and next-step readiness. Pages are reviewed for clarity, disclosure, and alignment with the independent purpose of the site.</p>
          </div>
          <div class="stack-list">
            <div>
              <h3>Source review</h3>
              <p>Where useful, the site points readers toward official TikTok for Business information and broader industry references for comparison.</p>
            </div>
            <div>
              <h3>Update cadence</h3>
              <p>Important pages should be refreshed when launch workflows, market coverage, or core guide architecture changes materially.</p>
            </div>
            <div>
              <h3>Commercial lens</h3>
              <p>Content is written for business decision-makers who care about budget, clarity, trust, and usable next steps more than platform hype.</p>
            </div>
          </div>
        </section>
        <section class="section split-section">
          <div>
            <p class="eyebrow">Trust signals</p>
            <h2>Built for informed decisions and cleaner next steps.</h2>
          </div>
          <div class="stack-list">
            <div>
              <h3>Disclosure-first</h3>
              <p>Affiliate and partner relationships are disclosed in the footer and dedicated legal page.</p>
            </div>
            <div>
              <h3>Useful navigation</h3>
              <p>Each page is designed to answer a specific user question and point to the next relevant page instead of trapping the visitor in dead ends.</p>
            </div>
            <div>
              <h3>Contact path</h3>
              <p>Businesses can reach out through the contact page for general enquiries or partnership-related questions.</p>
            </div>
          </div>
        </section>
        <section class="section split-section">
          <div>
            <p class="eyebrow">Disclosures and monetization</p>
            <h2>Transparent about affiliate and partner relationships.</h2>
            <p>This site may contain affiliate links or partner links. That means the operator may receive compensation when a visitor clicks through and takes a qualifying action. The commercial model is disclosed because trust matters more than pretending the site is something it is not.</p>
          </div>
          <div class="stack-list">
            <div>
              <h3>Independent positioning</h3>
              <p>The site does not present itself as the official TikTok corporate website and avoids false “official approval” style claims.</p>
            </div>
            <div>
              <h3>Why this matters</h3>
              <p>Clear disclosures reduce user hesitation, support paid-traffic quality reviews, and make the site easier to trust on first visit.</p>
            </div>
            <div>
              <h3>Where to review details</h3>
              <p>The footer and dedicated advertising disclaimer page explain affiliate or partner relationships in more direct legal language.</p>
            </div>
          </div>
        </section>
        ${ctaBlock("Explore the guides built for launch decisions.", "Use the market hub, how-it-works page, and FAQ to move from uncertainty to a clearer next step before you touch any partner route.", "Browse Market Pages", routes.markets, {
          pathName: routes.about,
          localeCode: "en",
          primaryType: "internal",
          subidPlacement: "about_final_cta",
          secondaryHref: routes.partnerOffer,
          secondaryLabel: "Open Partner Offer",
          secondaryType: "affiliate",
          secondarySubidPlacement: "about_final_partner",
        })}
      </main>
    `,
  });
}

function legalPage({ pathName, title, description, h1, sections }) {
  return layout({
    pathName,
    title,
    description,
    robots: "noindex, follow",
    bodyClass: "theme-growth",
    content: `
      <main class="inner-page legal-page">
        <section class="page-hero section">
          <p class="eyebrow">Legal</p>
          <h1>${h1}</h1>
          <p class="page-lead">${description}</p>
          <div class="editorial-meta">
            <span>Last updated ${editorialDateDisplay}</span>
            <span>${siteName} legal and disclosure page</span>
          </div>
        </section>
        ${sections
          .map(
            (section) => `
              <section class="section legal-section">
                <h2>${section.title}</h2>
                ${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
              </section>
            `,
          )
          .join("")}
      </main>
    `,
  });
}

function blueprintPage() {
  const sections = [
    [
      "1. Conversion strategy summary",
      `<p>The site is designed as a Google Ads pre-sell funnel, not a generic brochure. Its job is to make TikTok advertising feel commercially credible, easier to understand, and worth exploring further across multiple GEOs.</p>
       <p>The strategy prioritizes above-the-fold clarity, repeated CTA exposure, objection handling, transparent trust signals, and strong country-specific internal routing so paid clicks are more likely to become qualified outbound intent.</p>`,
    ],
    [
      "2. Recommended website structure",
      `<ul>
        <li>Homepage</li>
        <li>Market hub plus individual GEO landing pages</li>
        <li>How It Works</li>
        <li>Why TikTok Ads</li>
        <li>For Small Business</li>
        <li>For Agencies</li>
        <li>FAQ</li>
        <li>Contact</li>
        <li>Privacy Policy</li>
        <li>Terms and Conditions</li>
        <li>Advertising / Affiliate Disclaimer</li>
      </ul>`,
    ],
    [
      "3. Homepage wireframe",
      `<ol>
        <li>Hero with headline, subheadline, primary CTA, secondary CTA, and trust microcopy</li>
        <li>Benefit strip with proof-style commercial wins</li>
        <li>Why businesses choose TikTok advertising</li>
        <li>Audience segment grid</li>
        <li>Global markets block</li>
        <li>Four-step launch process</li>
        <li>Balanced performance rationale section</li>
        <li>FAQ preview</li>
        <li>Final CTA block</li>
        <li>Footer with legal links and disclosure</li>
      </ol>`,
    ],
    [
      "4. Full homepage copy in English",
      `<p><strong>Headline:</strong> Help your business grow with TikTok advertising that feels easier to launch and smarter to scale.</p>
       <p><strong>Subheadline:</strong> Built for paid-traffic visitors comparing channels, costs, and setup paths. See how businesses use TikTok to reach relevant audiences, test markets quickly, and move from attention to action with less friction.</p>
       <p><strong>Primary CTA:</strong> Get Started</p>
       <p><strong>Secondary CTA:</strong> Launch in Your Market</p>
       <p><strong>Trust microcopy:</strong> Clear information. Fast navigation. Independent resource with transparent partner disclosure.</p>`,
    ],
    [
      "5. GEO landing page template in English",
      `<p><strong>Headline format:</strong> Launch TikTok Ads in [Country]</p>
       <p><strong>Template logic:</strong> region intro, audience-fit angle, reasons that market may be attractive, best-for block, CTA stack, local FAQ, and related internal links.</p>
       <p><strong>Differentiation method:</strong> every market page uses region, audience-fit, commercial context, and summary text so pages stay indexable and not thin duplicates.</p>`,
    ],
    [
      "6. “How It Works” page copy",
      `<p><strong>Page goal:</strong> explain the route from initial interest to launch-ready action in a way that feels easy to follow for cold traffic.</p>
       <p><strong>Core message:</strong> understand fit, choose the right market or use-case page, remove objections, then move to the click-through when confidence is high enough.</p>
       <p><strong>Recommended CTA placements:</strong> hero, after the routing explanation, and final CTA panel.</p>`,
    ],
    [
      "7. “Why TikTok Ads” page copy",
      `<p><strong>Page goal:</strong> position TikTok as a serious business growth channel rather than a consumer-only entertainment platform.</p>
       <p><strong>Core message:</strong> it can complement search by creating demand earlier, support flexible testing, and help brands explore multi-market expansion with stronger creative leverage.</p>
       <p><strong>Recommended CTA placements:</strong> hero, after the budget-flexibility section, and final CTA panel.</p>`,
    ],
    [
      "8. “For Small Business” page copy",
      `<p><strong>Page goal:</strong> reduce intimidation for owners who assume TikTok is too big, too expensive, or too difficult.</p>
       <p><strong>Core message:</strong> small businesses can start with controlled testing, clear offers, and simple landing experiences without pretending to be enterprise advertisers.</p>
       <p><strong>Recommended CTA placements:</strong> hero, after the budget reality section, and final CTA panel.</p>`,
    ],
    [
      "9. “For Agencies” page copy",
      `<p><strong>Page goal:</strong> help agencies explain TikTok to clients with a commercially mature narrative.</p>
       <p><strong>Core message:</strong> TikTok can support channel diversification, faster creative testing, and multi-market expansion when paired with clear routing and compliant messaging.</p>
       <p><strong>Recommended CTA placements:</strong> hero, after the operational value section, and final CTA panel.</p>`,
    ],
    [
      "10. FAQ page copy",
      `<p><strong>Page goal:</strong> remove the final layer of hesitation before the click.</p>
       <p><strong>Coverage:</strong> business size fit, budget concerns, setup complexity, market availability, ecommerce usefulness, local business use cases, ROI expectations, and international launch questions.</p>
       <p><strong>SEO note:</strong> implement FAQ schema only where the on-page questions are fully visible and useful to visitors.</p>`,
    ],
    [
      "11. Legal page structure",
      `<ul>
        <li>Privacy policy covering information collection, cookies, analytics, and contact data use</li>
        <li>Terms and conditions covering informational use, IP, liability limits, and user responsibilities</li>
        <li>Affiliate disclaimer clarifying independence, partner compensation, and non-official status</li>
      </ul>`,
    ],
    [
      "12. SEO metadata examples",
      `<p><strong>Homepage title:</strong> TikTok Advertising for Business | Multi-Market Growth Guide</p>
       <p><strong>Homepage meta description:</strong> Learn how businesses use TikTok advertising to reach relevant audiences, launch campaigns quickly, and expand across multiple markets.</p>
       <p><strong>GEO title pattern:</strong> Launch TikTok Ads in [Country] | Business Ads Guide</p>
       <p><strong>Suggested URL structure:</strong> <code>/</code>, <code>/how-it-works/</code>, <code>/why-tiktok-ads/</code>, <code>/small-business/</code>, <code>/agencies/</code>, <code>/faq/</code>, <code>/contact/</code>, <code>/markets/[country].html</code></p>
       <p><strong>Schema suggestions:</strong> WebSite on the homepage, FAQPage where relevant, and Organization/WebPage schema later if a real business identity is added.</p>
       <p><strong>Blog / resources architecture suggestion:</strong> add a future <code>/resources/</code> section targeting long-tail queries such as TikTok ads cost, TikTok ads ROI, TikTok ads manager setup, creative best practices, and market-specific launch guides.</p>`,
    ],
    [
      "13. Internal linking plan",
      `<p><strong>Homepage:</strong> hero to How It Works and Markets, audience section to Small Business and Agencies, FAQ preview to full FAQ, global markets block to market pages.</p>
       <p><strong>GEO pages:</strong> link to How It Works, Why TikTok Ads, Small Business, Agencies, FAQ, and Contact so visitors never hit a dead end.</p>
       <p><strong>Support pages:</strong> each explanatory page should surface at least one GEO path and one action path.</p>
       <p><strong>Footer:</strong> keep every strategic, legal, and contact page accessible sitewide for crawl depth and trust.</p>`,
    ],
    [
      "14. CRO recommendations",
      `<ul>
        <li>State the offer in under five seconds</li>
        <li>Repeat CTA blocks after every major objection-handling section</li>
        <li>Use transparent disclosures instead of fake proof</li>
        <li>Keep the mobile sticky CTA visible but not intrusive</li>
        <li>Use short paragraphs and bold sectional hierarchy for scan speed</li>
      </ul>`,
    ],
    [
      "15. UI design direction",
      `<p><strong>Visual thesis:</strong> premium performance-marketing interface with dark editorial surfaces, bright accent contrast, restrained motion, and a credible SaaS-level finish.</p>
       <p><strong>Component hierarchy:</strong> sticky header, poster-style hero, proof strip, segmented audience grid, market cards, process blocks, FAQ accordion, final CTA panel, and legal footer.</p>
       <p><strong>CTA placement map:</strong> hero, mid-page use-case sections, market pages, final CTA panel, and sticky mobile CTA.</p>
       <p><strong>Trust placement:</strong> microcopy below hero CTAs, disclosure in footer, and non-deceptive language across all pages.</p>
       <p><strong>Responsive notes:</strong> headline remains readable on small screens, grid sections collapse cleanly to one column, and mobile tap targets remain large and separated.</p>`,
    ],
    [
      "16. Developer handoff notes",
      `<p><strong>Performance-first approach:</strong> semantic HTML5, one shared stylesheet, minimal JavaScript, no heavy frameworks, and file-based static output for easy hosting.</p>
       <p><strong>Reusable system:</strong> drive GEO pages from a structured data array so copy, metadata, and internal linking remain scalable without manual duplication.</p>
       <p><strong>Footer structure:</strong> brand summary, exploration links, legal links, and the independent affiliate disclaimer on every page.</p>
       <p><strong>Implementation note:</strong> replace the placeholder canonical domain and contact details before launch, then host behind a fast CDN with compression and basic analytics.</p>`,
    ],
  ];

  return layout({
    pathName: routes.projectBlueprint,
    title: "Project Blueprint | Business Ads Guide",
    description: "Launch blueprint, conversion strategy, wireframe logic, and developer handoff notes for the TikTok advertising affiliate funnel.",
    robots: "noindex, follow",
    bodyClass: "theme-growth",
    content: `
      <main class="inner-page blueprint-page">
        <section class="page-hero section">
          <p class="eyebrow">Blueprint</p>
          <h1>Launch-ready strategy and handoff document.</h1>
          <p class="page-lead">This page mirrors the requested deliverable order so strategy, copy, CRO, SEO, and implementation notes live alongside the site itself.</p>
        </section>
        ${sections
          .map(
            ([heading, body]) => `
              <section class="section legal-section">
                <h2>${heading}</h2>
                ${body}
              </section>
            `,
          )
          .join("")}
      </main>
    `,
  });
}

const pages = [
  ["/index.html", homepage()],
  [`${routes.partnerOffer}index.html`, partnerOfferPage("en")],
  ...localeConfigs
    .filter((locale) => locale.code !== "en")
    .map((locale) => [`/${locale.code}/index.html`, localizedHomepage(locale.code)]),
  ...localeConfigs
    .filter((locale) => locale.code !== "en")
    .map((locale) => [`/${locale.code}/offer/index.html`, partnerOfferPage(locale.code)]),
  [
    `${routes.howItWorks}index.html`,
    contentPage({
      pathName: routes.howItWorks,
      title: "How TikTok Advertising Works for Businesses | Business Ads Guide",
      description: "See how businesses can evaluate, launch, and scale TikTok advertising with less friction and clearer decision-making.",
      eyebrow: "How it works",
      h1: "A simple route from channel interest to launch-ready intent.",
      intro:
        "This page is built for people who want a practical answer to a simple question: how do businesses move from curiosity about TikTok ads to a real campaign path without unnecessary complexity?",
      sections: [
        {
          eyebrow: "Step 1",
          title: "Understand whether the channel fits the business.",
          body: "Start by matching TikTok advertising to the actual commercial objective. Some visitors need awareness, some need product discovery, some need app growth, and some need a multi-country test bed. The site should help them see fit quickly.",
          items: [
            { title: "Small business", body: "Focus on affordability, clarity, and speed to launch." },
            { title: "Ecommerce", body: "Focus on product visibility, creative testing, and scaled discovery." },
            { title: "Agencies", body: "Focus on client growth narratives, reporting logic, and cross-market opportunity." },
          ],
        },
        {
          eyebrow: "Step 2",
          title: "Route the visitor to the most relevant page.",
          body: "Use internal links to send visitors to country pages, use-case pages, or FAQs instead of making them hunt for answers. Every click should reduce uncertainty.",
          items: [
            { title: "GEO pages", body: "Useful for visitors who search by country or region." },
            { title: "Use-case pages", body: "Useful for visitors who identify by business type." },
            { title: "FAQ content", body: "Useful for budget, setup, and trust objections." },
          ],
        },
        {
          eyebrow: "Step 3",
          title: "Answer friction points before asking for the click.",
          body: "High-intent paid traffic often hesitates at the same moments: budget, setup, complexity, credibility, and whether the platform is relevant in their market. Handle those points with short sections and practical language.",
        },
        {
          eyebrow: "Step 4",
          title: "Prompt action with confidence, not pressure.",
          body: "CTAs should feel like the logical next step after clarity has been created. Use clean labels like Get Started, Explore TikTok Ads, Start Your Campaign, and Launch in Your Market.",
        },
      ],
      faq: [
        { q: "Is setup difficult for a beginner?", a: "It does not have to be. The most effective pre-lander flow simplifies the first decision and reduces the amount of technical detail shown upfront." },
        { q: "Can this work for local businesses?", a: "Yes. Local businesses can use TikTok to build awareness and drive new customer intent when the message is relevant and the landing path is clear." },
      ],
    }),
  ],
  [
    `${routes.whyTikTokAds}index.html`,
    contentPage({
      pathName: routes.whyTikTokAds,
      title: "Why Businesses Consider TikTok Ads | Business Ads Guide",
      description: "Explore why businesses use TikTok advertising to create demand, test new markets, and reach relevant audiences with flexible budgets.",
      eyebrow: "Why TikTok Ads",
      h1: "Why businesses are taking TikTok advertising seriously.",
      intro:
        "Businesses are not only looking for another ad platform. They are looking for a growth channel that can create demand, reach new audiences, and open up expansion opportunities without forcing a heavyweight setup.",
      sections: [
        {
          eyebrow: "Audience reach",
          title: "It helps businesses reach people before demand is fully formed.",
          body: "Search is powerful when intent already exists. TikTok can be useful when the goal is to create interest earlier, shape perception, and move audiences closer to action.",
          items: [
            { title: "Discovery-led", body: "Useful for products or services that benefit from visual explanation." },
            { title: "Creative leverage", body: "Strong creative can unlock attention more efficiently than static assumptions suggest." },
          ],
        },
        {
          eyebrow: "Budget flexibility",
          title: "It is not only for enterprise advertisers.",
          body: "Small businesses, local operators, ecommerce brands, apps, and agencies can all test the channel with controlled budgets and clear priorities.",
        },
        {
          eyebrow: "International growth",
          title: "It supports cross-border thinking.",
          body: "For brands expanding into new countries, TikTok can serve as a flexible market-testing layer supported by tailored GEO messaging and localized campaign strategy.",
        },
      ],
      faq: [
        { q: "Can TikTok ads support ROI-focused campaigns?", a: "They can support performance goals when offer quality, creative relevance, landing page clarity, and campaign structure all align." },
        { q: "Is TikTok only for younger audiences?", a: "No. Businesses should evaluate actual audience fit by market and product rather than relying on old assumptions." },
      ],
    }),
  ],
  [
    `${routes.smallBusiness}index.html`,
    contentPage({
      pathName: routes.smallBusiness,
      title: "TikTok Ads for Small Business | Business Ads Guide",
      description: "See how small businesses can approach TikTok advertising without needing huge budgets or complicated media buying infrastructure.",
      eyebrow: "For Small Business",
      h1: "TikTok advertising for small businesses that want practical growth.",
      intro:
        "Many small business owners assume TikTok is too big, too complex, or too expensive. The stronger message is simpler: if your business needs new customer attention, visual reach, and flexible testing, TikTok may be worth exploring.",
      sections: [
        {
          eyebrow: "Objection handling",
          title: "No, you do not need to be a huge brand.",
          body: "Small businesses can use TikTok when the value proposition is clear and the next step is easy to understand. The goal is not to act like a corporate giant. The goal is to reach the right audience with a cleaner message.",
        },
        {
          eyebrow: "Budget reality",
          title: "Start with controlled tests, not oversized assumptions.",
          body: "A small business should think in stages: test an offer, learn what message gets attention, identify what audience responds, and then decide whether more scale is justified.",
          items: [
            { title: "Local services", body: "Use concise creative and a direct call to action." },
            { title: "Retail and ecommerce", body: "Focus on product demonstration and customer benefit." },
            { title: "Professional services", body: "Use simple positioning that explains who you help and why it matters." },
          ],
        },
        {
          eyebrow: "Launch path",
          title: "Keep the first step simple.",
          body: "The strongest funnel for small businesses reduces jargon, explains fit fast, and offers a direct next step such as Explore TikTok Ads or Start Your Campaign.",
        },
      ],
      faq: [
        { q: "Can a local business use TikTok ads?", a: "Yes. Local businesses can use the platform to build awareness, generate enquiries, and attract nearby customers when the offer is relevant." },
        { q: "Do I need professional-grade creative to begin?", a: "Not necessarily. Clear messaging, a strong hook, and a clean landing path matter more than overproduced assets." },
      ],
    }),
  ],
  [
    `${routes.agencies}index.html`,
    contentPage({
      pathName: routes.agencies,
      title: "TikTok Ads for Agencies and Media Buyers | Business Ads Guide",
      description: "Help agencies and media buyers position TikTok advertising as a credible growth channel for clients across multiple markets.",
      eyebrow: "For Agencies",
      h1: "A cleaner TikTok advertising narrative for agencies and media buyers.",
      intro:
        "Agencies do not need another vague trend story. They need a credible page structure that helps clients understand opportunity, market fit, and next steps without hype or friction.",
      sections: [
        {
          eyebrow: "Client conversations",
          title: "Give clients a channel story that feels commercially mature.",
          body: "The page should help agencies explain why TikTok deserves consideration, what kinds of accounts fit best, and how a phased launch can work across local or international campaigns.",
        },
        {
          eyebrow: "Operational value",
          title: "Support multiple client types with one clear framework.",
          body: "Agencies often handle local businesses, ecommerce brands, app marketers, and expansion-stage companies. A good funnel routes each segment into the right message instead of forcing everyone through one generic pitch.",
          items: [
            { title: "Acquisition diversification", body: "Useful when clients are over-dependent on one or two existing channels." },
            { title: "Creative testing", body: "Useful when agencies want faster feedback loops and broader message variation." },
            { title: "International rollout", body: "Useful when clients need market-by-market expansion narratives." },
          ],
        },
        {
          eyebrow: "Trust",
          title: "Stay compliant and transparent.",
          body: "For affiliate or partner-driven campaigns, the site should clearly state that it is an independent informational resource and may contain affiliate links. That improves trust while protecting the funnel from misleading framing.",
        },
      ],
      faq: [
        { q: "Can agencies use this structure across multiple client verticals?", a: "Yes. The site architecture is built to route different audience segments into tailored pages and GEO-specific paths." },
        { q: "Is this suitable for paid traffic?", a: "Yes. The structure prioritizes clarity, trust, repeated CTA exposure, and objection handling, which are all important for cold paid traffic." },
      ],
    }),
  ],
  [
    `${routes.faq}index.html`,
    contentPage({
      pathName: routes.faq,
      title: "TikTok Ads FAQ for Business Teams | Business Ads Guide",
      description: "Get clear answers about TikTok ads for business teams, including budget, setup, country availability, campaign fit, and the next best page to open.",
      eyebrow: "FAQ",
      h1: "TikTok Ads FAQ for businesses ready to launch.",
      intro:
        "Visitors from Google Ads often need practical reassurance before they act. This page is written to remove hesitation quickly and keep the funnel credible.",
      sections: [
        {
          eyebrow: "Budget",
          title: "Do I need a huge budget?",
          body: "No. Many advertisers begin with controlled tests and scale only after they learn what creative, audience, and offer combination performs best.",
        },
        {
          eyebrow: "Business size",
          title: "Is TikTok only for large brands?",
          body: "No. Small businesses, ecommerce teams, apps, local services, and agencies can all explore it if the growth objective and messaging are clear.",
        },
        {
          eyebrow: "Complexity",
          title: "Is setup difficult?",
          body: "It can be straightforward when the decision path is simplified. The pre-lander should explain fit, answer objections, and only then ask for the next step.",
        },
        {
          eyebrow: "Market fit",
          title: "Can I advertise in my country?",
          body: "The site supports a large set of GEO pages so visitors can evaluate market relevance more clearly before moving forward.",
        },
      ],
      faq: [
        { q: "Can TikTok help brands expand internationally?", a: "Yes. Businesses expanding into new markets can use tailored country pages and localized messaging to evaluate launch potential more effectively." },
        { q: "Can TikTok ads work for ecommerce?", a: "Yes. Ecommerce brands often use it for product discovery, demand creation, and creative testing." },
        { q: "What should a good CTA sound like?", a: "Clear and commercially relevant. Good examples include Get Started, Explore TikTok Ads, Start Your Campaign, and Reach New Customers." },
      ],
    }),
  ],
  [`${routes.contact}index.html`, contactPage()],
  ["/resources/index.html", resourcesIndex()],
  [`${routes.siteMap}index.html`, siteMapPage()],
  [`${routes.about}index.html`, aboutPage()],
  [
    routes.notFound,
    contentPage({
      pathName: routes.notFound,
      title: "Page Not Found | Business Ads Guide",
      description: "The page you requested could not be found. Browse TikTok advertising guides, market pages, and launch resources.",
      eyebrow: "404",
      h1: "The page you were looking for is not here.",
      intro:
        "Use the main navigation, market pages, or FAQ to get back to the sections that help businesses evaluate TikTok advertising and market expansion.",
      sections: [
        {
          eyebrow: "Try these instead",
          title: "Most visitors continue from one of these pages.",
          body: "A custom 404 should recover the session, protect crawl efficiency, and keep the user moving instead of sending them back to search.",
          items: [
            { title: "Homepage", body: "Start from the main conversion page and core growth positioning." },
            { title: "Markets", body: "Browse country-specific launch pages and market-fit content." },
            { title: "FAQ", body: "Resolve setup, budget, and eligibility questions quickly." },
          ],
        },
      ],
    }),
  ],
  [
    `${routes.privacyPolicy}index.html`,
    legalPage({
      pathName: routes.privacyPolicy,
      title: "Privacy Policy | Business Ads Guide",
      description: "Review how this website handles visitor information, analytics, cookies, and contact submissions.",
      h1: "Privacy Policy",
      sections: [
        {
          title: "Information we collect",
          paragraphs: [
            "We may collect information that you voluntarily submit through contact forms, including your name, email address, business type, and message content.",
            "We may also collect basic non-personal usage information such as browser type, device information, referring source, and page interactions to improve site performance and usability.",
          ],
        },
        {
          title: "How information is used",
          paragraphs: [
            "Information may be used to respond to enquiries, improve the website experience, understand content performance, and measure the effectiveness of traffic sources.",
            "We do not describe this website as the official TikTok corporate website, and any data use should remain consistent with that independent positioning.",
          ],
        },
        {
          title: "Cookies and analytics",
          paragraphs: [
            "This website may use cookies, analytics tools, and similar technologies to understand site usage, page performance, and campaign quality.",
            "Visitors can manage cookies through their browser settings, although disabling some cookies may affect site functionality.",
          ],
        },
        {
          title: "Data sharing",
          paragraphs: [
            "Information may be shared with service providers or partners only when needed for site operation, communication handling, analytics, or lawful business processing.",
            "We do not sell personal information as part of the ordinary operation of this informational marketing resource.",
          ],
        },
      ],
    }),
  ],
  [
    `${routes.terms}index.html`,
    legalPage({
      pathName: routes.terms,
      title: "Terms and Conditions | Business Ads Guide",
      description: "Read the terms that govern use of this independent informational marketing website.",
      h1: "Terms and Conditions",
      sections: [
        {
          title: "Use of the website",
          paragraphs: [
            "This website is provided as an independent informational marketing resource for businesses researching advertising opportunities and related growth information.",
            "Use of the website signifies acceptance of these terms, applicable laws, and any future updates posted on this page.",
          ],
        },
        {
          title: "No official relationship claim",
          paragraphs: [
            "This website is not presented as the official TikTok corporate website and does not claim ownership of TikTok or its trademarks.",
            "References to TikTok for Business are informational and comparative in nature and should not be interpreted as official corporate representation unless explicitly stated by the relevant trademark owner.",
          ],
        },
        {
          title: "Liability limitations",
          paragraphs: [
            "Content is provided for general informational purposes and should not be treated as legal, tax, business, or platform-policy advice.",
            "We do not guarantee sales, profits, advertising outcomes, or market performance from use of any information on this website.",
          ],
        },
      ],
    }),
  ],
  [
    `${routes.affiliateDisclaimer}index.html`,
    legalPage({
      pathName: routes.affiliateDisclaimer,
      title: "Advertising and Affiliate Disclaimer | Business Ads Guide",
      description: "Understand how this website may use affiliate links, partner relationships, and promotional compensation.",
      h1: "Advertising / Affiliate Disclaimer",
      sections: [
        {
          title: "Independent resource",
          paragraphs: [
            "This website is an independent informational marketing resource created to help visitors learn about business advertising opportunities and related launch pathways.",
            "It is not the official TikTok corporate website and does not claim to operate on behalf of TikTok unless such a relationship is expressly disclosed.",
          ],
        },
        {
          title: "Affiliate and partner links",
          paragraphs: [
            "Some pages may contain affiliate links, partner links, or referral links. If a visitor clicks such a link and takes a qualifying action, the website operator may receive compensation.",
            "That compensation does not change our commitment to clear disclosures, non-deceptive framing, and practical informational content.",
          ],
        },
        {
          title: "No guaranteed outcomes",
          paragraphs: [
            "We do not promise guaranteed approvals, guaranteed profits, guaranteed sales, or guaranteed campaign performance.",
            "Advertising results depend on many variables including market, creative, offer quality, targeting, competition, and overall funnel execution.",
          ],
        },
      ],
    }),
  ],
  [`${routes.projectBlueprint}index.html`, blueprintPage()],
  ...seoGrowthPages.map((page) => [
    `${page.pathName}index.html`,
    contentPage({
      pathName: page.pathName,
      title: page.title,
      description: page.description,
      eyebrow: page.eyebrow,
      h1: page.h1,
      intro: page.intro,
      sections: page.sections,
      faq: page.faq,
      relatedLinks: page.relatedLinks,
    }),
  ]),
  ...resourcePages.map((page) => [
    `/resources/${page.slug}.html`,
    contentPage({
      pathName: `/resources/${page.slug}.html`,
      title: page.title,
      description: page.description,
      eyebrow: page.eyebrow,
      h1: page.h1,
      intro: page.intro,
      sections: page.sections,
      faq: page.faq,
    }),
  ]),
];

const baseAssets = {
  "/assets/site.js": `document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;
    const target = document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll("details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll("details").forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

const languageSwitchers = Array.from(
  document.querySelectorAll("[data-language-switcher]"),
);

const languageMenuConfig = ${JSON.stringify(
  localeConfigs.map((locale) => ({
    code: locale.code,
    label: locale.label,
    shortCode: localeShortCode(locale),
    paths: {
      home: localizedPath(locale.code, "home"),
      offer: localizedPath(locale.code, "offer"),
    },
  })),
)};

const closeLanguageSwitcher = (switcher) => {
  const trigger = switcher.querySelector("[data-language-trigger]");
  const panel = switcher.querySelector("[data-language-panel]");
  if (!trigger || !panel) return;
  switcher.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");
  panel.hidden = true;
};

const buildLanguageOptions = (switcher) => {
  const list = switcher.querySelector("[data-language-list]");
  if (!list || list.dataset.ready === "true") return;

  const currentLocaleCode = switcher.dataset.currentLocale || "en";
  const translationKey = switcher.dataset.translationKey === "offer" ? "offer" : "home";
  const fragment = document.createDocumentFragment();

  languageMenuConfig.forEach((locale) => {
    const link = document.createElement("a");
    link.className = "language-option";
    link.href = locale.paths[translationKey] || locale.paths.home;
    link.setAttribute("role", "menuitem");
    link.setAttribute("aria-label", locale.label);
    link.title = locale.label;

    if (locale.code === currentLocaleCode) {
      link.setAttribute("aria-current", "true");
    }

    const code = document.createElement("span");
    code.className = "language-option-code";
    code.textContent = locale.shortCode;
    link.append(code);
    fragment.append(link);
  });

  list.replaceChildren(fragment);
  list.dataset.ready = "true";
};

const openLanguageSwitcher = (switcher) => {
  languageSwitchers.forEach((other) => {
    if (other !== switcher) closeLanguageSwitcher(other);
  });
  const trigger = switcher.querySelector("[data-language-trigger]");
  const panel = switcher.querySelector("[data-language-panel]");
  if (!trigger || !panel) return;
  buildLanguageOptions(switcher);
  switcher.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");
  panel.hidden = false;
};

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-language-trigger]");
  if (trigger) {
    event.preventDefault();
    const switcher = trigger.closest("[data-language-switcher]");
    if (!switcher) return;
    const isOpen = switcher.classList.contains("is-open");
    if (isOpen) {
      closeLanguageSwitcher(switcher);
    } else {
      openLanguageSwitcher(switcher);
    }
    return;
  }

  const languageOption = event.target.closest(".language-option");
  if (languageOption) {
    const switcher = languageOption.closest("[data-language-switcher]");
    if (switcher) closeLanguageSwitcher(switcher);
    return;
  }

  languageSwitchers.forEach((switcher) => {
    if (!switcher.contains(event.target)) closeLanguageSwitcher(switcher);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  languageSwitchers.forEach((switcher) => closeLanguageSwitcher(switcher));
});

const trackAffiliateClick = (link) => {
  if (typeof window.gtag !== "function") return;
  const subid = link.dataset.subid || "unknown_subid";
  window.gtag("event", "outbound_affiliate_click", {
    event_category: "affiliate",
    event_label: subid,
    subid,
    destination_url: link.href,
    page_path: window.location.pathname,
    page_title: document.title,
  });
};

document.querySelectorAll("a[data-subid]").forEach((link) => {
  link.addEventListener("click", () => trackAffiliateClick(link));
});`,
  "/assets/og-cover.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">Business Ads Guide</title>
  <desc id="desc">Independent business advertising guide focused on TikTok ads, launch strategy, and market expansion.</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f3f5fa"/>
    </linearGradient>
    <linearGradient id="cyan" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#18d8f6"/>
      <stop offset="100%" stop-color="#8af3ff"/>
    </linearGradient>
    <linearGradient id="red" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff4155"/>
      <stop offset="100%" stop-color="#ff9aa5"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#071019"/>
  <circle cx="180" cy="110" r="120" fill="url(#cyan)" opacity="0.22"/>
  <circle cx="1030" cy="110" r="88" fill="url(#red)" opacity="0.22"/>
  <rect x="86" y="120" width="1028" height="392" rx="36" fill="#0e1824" stroke="rgba(255,255,255,0.1)"/>
  <rect x="108" y="144" width="320" height="14" rx="7" fill="#18d8f6"/>
  <text x="108" y="238" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="68" fill="#ffffff">Business Ads Guide</text>
  <text x="108" y="304" font-family="Inter, Arial, sans-serif" font-weight="500" font-size="31" fill="#b8c3d1">Independent TikTok advertising guidance</text>
  <text x="108" y="352" font-family="Inter, Arial, sans-serif" font-weight="500" font-size="31" fill="#b8c3d1">for businesses, agencies, ecommerce,</text>
  <text x="108" y="400" font-family="Inter, Arial, sans-serif" font-weight="500" font-size="31" fill="#b8c3d1">and international growth planning.</text>
  <rect x="108" y="438" width="246" height="54" rx="27" fill="#18d8f6"/>
  <text x="148" y="473" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="26" fill="#071019">Explore the Guide</text>
  <rect x="858" y="202" width="190" height="190" rx="32" fill="#131f2d"/>
  <circle cx="953" cy="297" r="58" fill="url(#cyan)"/>
  <rect x="904" y="258" width="94" height="18" rx="9" fill="#071019"/>
  <rect x="904" y="288" width="74" height="18" rx="9" fill="#071019"/>
  <rect x="904" y="318" width="86" height="18" rx="9" fill="#071019"/>
  <rect x="822" y="432" width="212" height="18" rx="9" fill="#ff4155"/>
</svg>`,
  "/assets/styles.css": `:root {
  --bg: #f6f7fb;
  --bg-soft: #ffffff;
  --surface: rgba(255, 255, 255, 0.86);
  --surface-strong: #ffffff;
  --panel: rgba(255, 255, 255, 0.92);
  --text: #111111;
  --muted: #5f6470;
  --line: rgba(17, 17, 17, 0.08);
  --accent: #2be4ff;
  --accent-alt: #ff5a76;
  --accent-deep: #050b12;
  --soft-cyan: #dffcff;
  --soft-red: #ffe1e6;
  --shadow: 0 24px 64px rgba(17, 17, 17, 0.08);
  --radius: 28px;
  --radius-small: 18px;
  --max: 1180px;
  --sans: "Sora", "Inter", "SF Pro Display", "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  color: var(--text);
  background:
    radial-gradient(circle at 8% 10%, rgba(43, 228, 255, 0.16), transparent 18%),
    radial-gradient(circle at 92% 14%, rgba(255, 90, 118, 0.14), transparent 18%),
    linear-gradient(180deg, #ffffff 0%, #fafbff 54%, #f3f5fa 100%);
  font-family: var(--sans);
  line-height: 1.6;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  max-width: 100%;
  display: block;
}

.page-shell {
  min-height: 100vh;
}

.skip-link {
  position: absolute;
  left: 16px;
  top: -80px;
  z-index: 100;
  padding: 12px 16px;
  background: #111111;
  border-radius: 12px;
  color: #ffffff;
}

.skip-link:focus {
  top: 16px;
}

.site-header {
  position: sticky;
  top: 12px;
  z-index: 50;
  width: min(var(--max), calc(100% - 32px));
  margin: 12px auto 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(14px, 2.5vw, 28px);
  padding: 14px clamp(14px, 2.2vw, 22px);
  backdrop-filter: blur(18px);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(17, 17, 17, 0.06);
  border-radius: 24px;
  box-shadow: 0 14px 34px rgba(17, 17, 17, 0.06);
}

.brand-mark {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.brand-eyebrow,
.eyebrow {
  color: #00b4cf;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.79rem;
  font-weight: 700;
}

.brand-mark .brand-eyebrow {
  font-size: 0.66rem;
  line-height: 1.2;
}

.brand-name {
  font-size: 1.02rem;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.main-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  min-width: 0;
}

.header-tools {
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 10px;
}

.language-switcher {
  position: relative;
}

.language-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 58px;
  min-height: 46px;
  padding: 0;
  border: 1px solid rgba(17, 17, 17, 0.08);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(250, 252, 255, 0.98), rgba(241, 246, 251, 0.94));
  color: var(--text);
  font: inherit;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(17, 17, 17, 0.06);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.language-trigger:hover,
.language-switcher.is-open .language-trigger {
  border-color: rgba(17, 17, 17, 0.16);
  box-shadow: 0 16px 34px rgba(17, 17, 17, 0.1);
}

.language-trigger:focus-visible,
.language-option:focus-visible {
  outline: 2px solid rgba(43, 228, 255, 0.85);
  outline-offset: 3px;
}

.language-trigger-code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.language-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  width: min(360px, calc(100vw - 32px));
  max-height: min(72vh, 580px);
  overflow: auto;
  padding: 16px;
  border-radius: 24px;
  border: 1px solid rgba(17, 17, 17, 0.08);
  background:
    radial-gradient(circle at top right, rgba(43, 228, 255, 0.12), transparent 28%),
    radial-gradient(circle at bottom left, rgba(255, 90, 118, 0.1), transparent 24%),
    rgba(255, 255, 255, 0.98);
  box-shadow: 0 28px 60px rgba(17, 17, 17, 0.14);
}

.language-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(17, 17, 17, 0.08);
}

.language-panel-header p {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.language-panel-header span {
  color: var(--muted);
  font-size: 0.84rem;
}

.language-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.language-option {
  display: grid;
  place-items: center;
  min-height: 68px;
  padding: 14px 8px;
  border-radius: 16px;
  border: 1px solid rgba(17, 17, 17, 0.08);
  background: rgba(255, 255, 255, 0.82);
  color: var(--muted);
  text-align: center;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease;
}

.language-option-code {
  font-size: 0.94rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.language-option:hover {
  transform: translateY(-1px);
  border-color: rgba(17, 17, 17, 0.14);
  background: rgba(255, 255, 255, 0.96);
}

.language-option:hover,
.language-option[aria-current="true"] {
  color: var(--text);
}

.language-option[aria-current="true"] {
  border-color: rgba(43, 228, 255, 0.5);
  background: linear-gradient(180deg, rgba(43, 228, 255, 0.14), rgba(255, 255, 255, 0.95));
  box-shadow: inset 0 0 0 1px rgba(43, 228, 255, 0.16);
}

.language-option[aria-current="true"] .language-option-code {
  color: #08849a;
}

.nav-link {
  color: var(--muted);
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.nav-link.active,
.nav-link:hover,
.text-link:hover,
.site-footer a:hover {
  color: var(--text);
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0.85rem 1.3rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background: #111111;
  color: #ffffff;
  font-weight: 900;
  letter-spacing: -0.02em;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
  box-shadow:
    -6px 6px 0 rgba(24, 216, 246, 0.92),
    6px -6px 0 rgba(255, 90, 118, 0.86),
    0 16px 34px rgba(17, 17, 17, 0.14);
}

.button:hover {
  transform: translateY(-1px);
  box-shadow:
    -7px 7px 0 rgba(24, 216, 246, 0.96),
    7px -7px 0 rgba(255, 90, 118, 0.9),
    0 20px 40px rgba(17, 17, 17, 0.18);
}

.button-small {
  min-height: 42px;
  padding: 0.68rem 1rem;
  font-size: 0.88rem;
}

.button-secondary {
  background: rgba(255, 255, 255, 0.92);
  color: var(--text);
  border-color: rgba(17, 17, 17, 0.1);
  box-shadow: none;
}

.button-secondary:hover {
  border-color: rgba(17, 17, 17, 0.18);
  box-shadow: none;
}

.header-cta {
  min-height: 42px;
}

.header-cta:hover {
  transform: none;
  box-shadow:
    -6px 6px 0 rgba(24, 216, 246, 0.92),
    6px -6px 0 rgba(255, 90, 118, 0.86),
    0 16px 34px rgba(17, 17, 17, 0.14);
}

.button-full {
  width: 100%;
}

.hero-section,
.section,
.site-footer,
.inner-page .page-hero {
  width: min(var(--max), calc(100% - 40px));
  margin-inline: auto;
}

.breadcrumbs {
  padding-top: 18px;
  padding-bottom: 0;
}

.breadcrumbs ol {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--muted);
  font-size: 0.94rem;
}

.breadcrumbs li:not(:last-child)::after {
  content: "/";
  margin-left: 10px;
  color: rgba(17, 17, 17, 0.35);
}

.hero-section {
  min-height: min(82svh, 780px);
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(320px, 0.98fr);
  align-items: center;
  gap: clamp(28px, 5vw, 72px);
  padding: clamp(34px, 5vw, 64px) 0 clamp(20px, 4vw, 42px);
}

.hero-copy {
  display: grid;
  align-content: start;
  gap: 16px;
}

.hero-copy h1,
.page-hero h1 {
  margin: 0;
  font-size: clamp(2.9rem, 6.3vw, 5.15rem);
  line-height: 0.92;
  letter-spacing: -0.058em;
  max-width: 10.8ch;
  font-weight: 950;
}

.hero-lead,
.page-lead {
  margin: 0;
  max-width: 60ch;
  font-size: 1.05rem;
  line-height: 1.72;
  color: var(--muted);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0;
}

.hero-offer-callout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 18px 20px;
  border-radius: calc(var(--radius) - 8px);
  border: 1px solid rgba(17, 17, 17, 0.08);
  background:
    linear-gradient(135deg, rgba(43, 228, 255, 0.1), rgba(255, 90, 118, 0.08)),
    rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 34px rgba(17, 17, 17, 0.06);
}

.hero-offer-title {
  margin: 0.3rem 0 0;
  max-width: 28ch;
  font-size: clamp(1.1rem, 2vw, 1.38rem);
  line-height: 1.16;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #111111;
}

.hero-offer-copy {
  margin: 0.5rem 0 0;
  max-width: 42ch;
  color: var(--muted);
  font-size: 0.94rem;
  line-height: 1.55;
}

.hero-offer-cta {
  justify-self: end;
  white-space: nowrap;
  min-width: 196px;
}

.microcopy {
  margin: 0;
  color: var(--muted);
  font-size: 0.94rem;
  line-height: 1.65;
}

.editorial-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  color: var(--muted);
  font-size: 0.88rem;
}

.editorial-meta span {
  padding: 0.45rem 0.72rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
}

.quick-answer {
  margin-top: 1rem;
  padding: 18px 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius-small);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 28px rgba(17, 17, 17, 0.04);
}

.quick-answer p:last-child {
  margin-bottom: 0;
}

.snippet-panel {
  display: grid;
  grid-template-columns: minmax(0, 0.78fr) minmax(0, 1.22fr);
  gap: clamp(18px, 3vw, 28px);
  align-items: start;
}

.snippet-list,
.fact-grid {
  margin: 0;
  padding: 24px 24px 24px 42px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 28px rgba(17, 17, 17, 0.04);
}

.snippet-list li + li {
  margin-top: 12px;
}

.fact-grid {
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.fact-grid > div {
  padding: 18px;
  border-radius: var(--radius-small);
  border: 1px solid var(--line);
  background: var(--surface);
}

.fact-grid dt {
  margin: 0 0 0.45rem;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.fact-grid dd {
  margin: 0;
  color: #111111;
  font-weight: 700;
  line-height: 1.45;
}

.summary-table-wrap {
  overflow-x: auto;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8px 28px rgba(17, 17, 17, 0.04);
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

.summary-table th,
.summary-table td {
  padding: 16px 18px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--line);
}

.summary-table th {
  font-size: 0.83rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  background: rgba(248, 250, 252, 0.92);
}

.summary-table tbody tr:last-child td {
  border-bottom: 0;
}

.hero-proof-strip {
  display: grid;
  gap: 12px;
  margin-top: 0;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}

.hero-proof-strip p {
  margin: 0;
  max-width: 44ch;
}

.inline-proof-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.inline-proof-list li,
.hero-visual-card li,
.related-links a,
.benefit-item,
.market-card,
.audience-grid article,
.process-grid article,
.contact-form,
.cta-column .button,
.legal-section,
.faq-list details {
  border: 1px solid var(--line);
  background: var(--surface);
  backdrop-filter: blur(12px);
}

.hero-visual {
  position: relative;
  min-height: 520px;
  border-radius: 40px;
  overflow: hidden;
  background:
    radial-gradient(circle at 25% 22%, rgba(43, 228, 255, 0.18), transparent 24%),
    radial-gradient(circle at 74% 68%, rgba(255, 90, 118, 0.14), transparent 24%),
    linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%);
  border: 1px solid rgba(17, 17, 17, 0.06);
  box-shadow: var(--shadow);
}

.visual-orbit {
  position: absolute;
  border-radius: 999px;
  border: 14px solid rgba(17, 17, 17, 0.04);
  animation: drift 15s ease-in-out infinite;
}

.orbit-one {
  inset: 52px 70px auto auto;
  width: 220px;
  height: 220px;
}

.orbit-two {
  inset: auto auto 70px 44px;
  width: 280px;
  height: 280px;
  animation-duration: 19s;
}

.hero-visual-card {
  position: absolute;
  right: 28px;
  bottom: 30px;
  width: min(260px, calc(100% - 52px));
  padding: 24px;
  border-radius: 28px;
  background: rgba(17, 17, 17, 0.96);
  color: #ffffff;
  box-shadow: 0 18px 40px rgba(17, 17, 17, 0.18);
}

.hero-visual-eyebrow {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0.62rem 0.88rem;
  border-radius: 999px;
  color: #071019;
  background: linear-gradient(135deg, rgba(43, 228, 255, 0.94), rgba(255, 255, 255, 0.98));
  box-shadow: 0 12px 26px rgba(43, 228, 255, 0.18);
  overflow: hidden;
  isolation: isolate;
  animation: heroBadgeFloat 4.8s ease-in-out infinite;
}

.hero-visual-eyebrow::before,
.hero-visual-eyebrow::after {
  content: "";
  position: absolute;
  inset: auto;
}

.hero-visual-eyebrow::before {
  left: 12px;
  top: 50%;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(7, 16, 25, 0.82);
  transform: translateY(-50%);
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.18);
}

.hero-visual-eyebrow::after {
  inset: 0;
  background: linear-gradient(112deg, transparent 18%, rgba(255, 255, 255, 0.08) 42%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.08) 58%, transparent 82%);
  transform: translateX(-135%);
  animation: eyebrowShimmer 3.9s ease-in-out infinite;
  pointer-events: none;
}

.hero-visual-eyebrow {
  padding-left: 1.35rem;
}

.hero-visual-card ul {
  margin: 0.8rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.hero-visual-card li {
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.08);
}

.hero-visual-caption {
  position: absolute;
  left: 28px;
  top: 32px;
  display: grid;
  gap: 8px;
  color: #171717;
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.hero-visual::before,
.hero-visual::after {
  content: "";
  position: absolute;
  border-radius: 999px;
}

.hero-visual::before {
  width: 112px;
  height: 112px;
  left: 44px;
  bottom: 80px;
  background: linear-gradient(135deg, var(--accent), #7ff4ff);
  box-shadow: -10px 10px 0 rgba(17, 17, 17, 0.04);
}

.hero-visual::after {
  width: 76px;
  height: 76px;
  right: 44px;
  top: 72px;
  background: linear-gradient(135deg, var(--accent-alt), #ff8c9a);
  box-shadow: 10px -10px 0 rgba(17, 17, 17, 0.04);
}

.section {
  padding: clamp(44px, 6.5vw, 88px) 0;
}

.benefit-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.benefit-item,
.audience-grid article,
.process-grid article,
.market-card,
.faq-list details,
.legal-section {
  padding: 22px;
  border-radius: var(--radius-small);
}

.benefit-item {
  display: grid;
  gap: 6px;
}

.benefit-item strong {
  line-height: 1.2;
}

.benefit-item span,
.market-card p,
.audience-grid p,
.process-grid p,
.stack-list p,
.section-copy p,
.contact-form label,
.site-footer p,
.legal-section p {
  color: var(--muted);
}

.benefit-strip.section {
  padding-top: 10px;
  padding-bottom: 24px;
}

.split-section {
  display: grid;
  grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.12fr);
  gap: clamp(22px, 4vw, 56px);
  align-items: start;
}

.split-section h2,
.section > h2,
.page-hero h2,
.content-section h2,
.cta-panel h2,
.legal-section h2,
.faq-preview h2 {
  margin: 0.3rem 0 0.8rem;
  font-size: clamp(1.9rem, 3.7vw, 2.8rem);
  line-height: 1.05;
  letter-spacing: -0.05em;
}

.stack-list {
  display: grid;
  gap: 18px;
}

.stack-list > div,
.contact-form,
.cta-column,
.cta-panel {
  padding: 24px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 28px rgba(17, 17, 17, 0.04);
}

.section-copy {
  padding: 2px 0 0;
}

.section-copy p:last-child,
.stack-list p:last-child,
.market-card p:last-child,
.audience-grid p:last-child,
.process-grid p:last-child,
.benefit-item span:last-child {
  margin-bottom: 0;
}

.audience-grid,
.process-grid,
.market-grid {
  display: grid;
  gap: 18px;
}

.audience-grid {
  grid-template-columns: repeat(3, 1fr);
}

.process-grid {
  grid-template-columns: repeat(4, 1fr);
}

.process-grid span {
  display: inline-block;
  margin-bottom: 0.9rem;
  color: var(--accent-alt);
  font-size: 1.35rem;
  font-weight: 800;
}

.market-grid {
  grid-template-columns: repeat(2, 1fr);
}

.full-grid {
  grid-template-columns: repeat(3, 1fr);
}

.market-card h3 {
  margin: 0.1rem 0 0.6rem;
  font-size: 1.2rem;
}

.text-link {
  color: #111111;
  font-weight: 900;
  text-decoration: underline;
  text-decoration-color: rgba(24, 216, 246, 0.85);
  text-decoration-thickness: 3px;
  text-underline-offset: 4px;
}

.faq-list {
  display: grid;
  gap: 12px;
}

.faq-list details {
  padding: 18px 20px;
}

.faq-list summary {
  cursor: pointer;
  list-style: none;
  font-size: 1.04rem;
  font-weight: 700;
}

.faq-list summary::-webkit-details-marker {
  display: none;
}

.faq-list p {
  margin-bottom: 0;
}

.cta-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background:
    linear-gradient(135deg, rgba(43, 228, 255, 0.14), rgba(255, 90, 118, 0.1)),
    #ffffff;
}

.cta-panel-actions,
.cta-column {
  display: grid;
  gap: 12px;
}

.inner-page {
  padding-bottom: 60px;
}

.page-hero {
  padding-top: clamp(32px, 6vw, 72px);
}

.content-section {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: clamp(18px, 3vw, 28px);
  align-items: start;
}

.related-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.source-list {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, 1fr);
}

.source-list article {
  padding: 20px;
  border-radius: var(--radius-small);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.92);
}

.source-list h3 {
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
}

.source-list p {
  margin: 0;
  color: var(--muted);
}

.related-links a {
  padding: 12px 16px;
  border-radius: 999px;
}

.contact-form {
  display: grid;
  gap: 14px;
}

.contact-form input,
.contact-form select,
.contact-form textarea {
  width: 100%;
  margin-top: 8px;
  border: 1px solid rgba(17, 17, 17, 0.12);
  border-radius: 14px;
  padding: 0.95rem 1rem;
  background: #ffffff;
  color: var(--text);
  font: inherit;
}

.site-footer {
  padding-bottom: 96px;
}

.resource-card h2 {
  margin: 0.15rem 0 0.7rem;
  font-size: 1.35rem;
  line-height: 1.1;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.8fr;
  gap: 24px;
  padding: 28px 0 24px;
  border-top: 1px solid var(--line);
}

.footer-brand,
.footer-heading {
  margin-top: 0;
  font-weight: 800;
}

.footer-cta-row {
  margin-top: 18px;
}

.site-footer a {
  display: block;
  margin-bottom: 10px;
  color: var(--muted);
}

.footer-meta {
  padding-top: 20px;
  border-top: 1px solid rgba(17, 17, 17, 0.08);
}

.footer-meta p:first-child {
  max-width: 86ch;
}

.mobile-sticky-cta {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 16px;
  z-index: 60;
  display: none;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font-weight: 900;
  box-shadow:
    -6px 6px 0 rgba(24, 216, 246, 0.9),
    6px -6px 0 rgba(255, 65, 85, 0.85);
}

.blueprint-page ul,
.blueprint-page ol {
  color: var(--muted);
  padding-left: 1.2rem;
}

@keyframes drift {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(10px, -16px, 0) scale(1.03);
  }
}

@keyframes heroBadgeFloat {
  0%, 100% {
    transform: translate3d(0, 0, 0);
    box-shadow: 0 12px 26px rgba(43, 228, 255, 0.18);
  }
  50% {
    transform: translate3d(0, -4px, 0);
    box-shadow: 0 18px 34px rgba(43, 228, 255, 0.22);
  }
}

@keyframes eyebrowShimmer {
  0%, 16% {
    transform: translateX(-135%);
  }
  42%, 100% {
    transform: translateX(135%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .visual-orbit,
  .hero-visual-eyebrow,
  .hero-visual-eyebrow::after {
    animation: none;
  }
}

@media (max-width: 980px) {
  .site-header {
    width: min(var(--max), calc(100% - 24px));
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .hero-section,
  .split-section,
  .content-section,
  .snippet-panel,
  .benefit-strip,
  .audience-grid,
  .process-grid,
  .full-grid,
  .footer-grid {
    grid-template-columns: 1fr;
  }

  .market-grid {
    grid-template-columns: 1fr;
  }

  .source-list {
    grid-template-columns: 1fr;
  }

  .hero-section {
    min-height: auto;
    padding-top: 28px;
  }

  .hero-copy h1,
  .page-hero h1 {
    max-width: none;
  }

  .hero-visual {
    min-height: 420px;
  }

  .hero-offer-callout {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .hero-offer-cta {
    justify-self: stretch;
    width: 100%;
  }

  .cta-panel {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 1100px) {
  .header-cta {
    display: none;
  }
}

@media (max-width: 720px) {
  .main-nav,
  .header-cta {
    display: none;
  }

  .site-header {
    display: flex;
    width: min(var(--max), calc(100% - 16px));
    margin-top: 8px;
    padding: 12px 14px;
    justify-content: space-between;
  }

  .header-tools {
    width: auto;
    justify-content: flex-end;
  }

  .language-trigger {
    width: 54px;
    flex: 0 0 54px;
  }

  .language-panel {
    position: fixed;
    left: 12px;
    right: 12px;
    top: 88px;
    width: auto;
    max-height: min(70vh, 560px);
  }

  .language-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .hero-section,
  .section,
  .site-footer,
  .inner-page .page-hero {
    width: min(var(--max), calc(100% - 24px));
  }

  .brand-mark .brand-eyebrow {
    display: none;
  }

  .hero-copy h1,
  .page-hero h1 {
    font-size: clamp(2.4rem, 14vw, 4rem);
  }

  .hero-visual {
    min-height: 360px;
  }

  .hero-visual-card {
    right: 18px;
    bottom: 18px;
  }

  .mobile-sticky-cta {
    display: inline-flex;
  }

  .fact-grid {
    grid-template-columns: 1fr;
  }

  .site-footer {
    padding-bottom: 110px;
  }
}`,
  "/robots.txt": `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`,
};

function apacheHtaccess() {
  const legacyRedirectLines = legacyHtmlRedirects
    .map(
      ([legacyPath, cleanPath]) =>
        `Redirect 301 ${legacyPath} ${cleanPath}`,
    )
    .join("\n");

  return `DirectoryIndex index.html

<IfModule mod_alias.c>
  RedirectMatch 301 ^/(.*)index\\.html$ /$1
  ${legacyRedirectLines}
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP_HOST} ^www\\.businessadsguide\\.com$ [NC]
  RewriteRule ^ https://businessadsguide.com%{REQUEST_URI} [L,R=301]
</IfModule>

# Custom 404 page
ErrorDocument 404 /404.html

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header always set Permissions-Policy "geolocation=(), camera=(), microphone=()"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self' mailto:; frame-ancestors 'self'; object-src 'none'; upgrade-insecure-requests"

  <FilesMatch "\\.(css|js|svg|png|jpe?g|webp|avif)$">
    Header always set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/avif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
`;
}

function cloudflareHeaders() {
  return `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Permissions-Policy: geolocation=(), camera=(), microphone=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self' mailto:; frame-ancestors 'self'; object-src 'none'; upgrade-insecure-requests

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;
}

function cloudflareRedirects() {
  const legacyRedirectLines = legacyHtmlRedirects
    .map(([legacyPath, cleanPath]) => `${legacyPath} ${cleanPath} 301`)
    .join("\n");

  return `# Normalize direct index.html requests to directory URLs
/index.html / 301
/:section/index.html /:section/ 301
/:section/:page/index.html /:section/:page/ 301

# Legacy .html routes to clean slash URLs
${legacyRedirectLines}
`;
}

function assets() {
  return {
    ...baseAssets,
    ...(usingDedicatedOutputDir
      ? {
          "/_headers": cloudflareHeaders(),
          "/_redirects": cloudflareRedirects(),
        }
      : {
          "/.htaccess": apacheHtaccess(),
        }),
  };
}

function sitemap() {
  const urls = [
    routes.home,
    routes.partnerOffer,
    ...localeConfigs
      .filter((locale) => locale.code !== "en")
      .flatMap((locale) => [localizedPath(locale.code, "home"), localizedPath(locale.code, "offer")]),
    ...seoGrowthPages.map((page) => page.pathName),
    routes.howItWorks,
    routes.whyTikTokAds,
    routes.resources,
    routes.smallBusiness,
    routes.agencies,
    routes.faq,
    routes.contact,
    routes.about,
    routes.markets,
    ...resourcePages.map((page) => `/resources/${page.slug}.html`),
    ...geos.map((geo) => `/markets/${geo.slug}.html`),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${siteUrl}${url}</loc>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
}

async function writeFile(relativePath, content) {
  const filePath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

async function main() {
  if (usingDedicatedOutputDir) {
    await fs.rm(root, { recursive: true, force: true });
  }

  for (const [relativePath, content] of pages) {
    await writeFile(relativePath, content);
  }

  for (const geo of geos) {
    await writeFile(`/markets/${geo.slug}.html`, geoPage(geo));
  }

  await writeFile("/markets/index.html", marketsIndex());

  for (const [relativePath, content] of Object.entries(assets())) {
    await writeFile(relativePath, content);
  }

  await writeFile("/sitemap.xml", sitemap());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
