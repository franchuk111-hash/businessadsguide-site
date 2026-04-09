document.querySelectorAll('a[href^="#"]').forEach((link) => {
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

const languageMenuConfig = [{"code":"en","label":"English","shortCode":"EN","paths":{"home":"/","offer":"/partner-offer/"}},{"code":"ja","label":"日本語","shortCode":"JA","paths":{"home":"/ja/","offer":"/ja/offer/"}},{"code":"fr","label":"Français","shortCode":"FR","paths":{"home":"/fr/","offer":"/fr/offer/"}},{"code":"de","label":"Deutsch","shortCode":"DE","paths":{"home":"/de/","offer":"/de/offer/"}},{"code":"es","label":"Español","shortCode":"ES","paths":{"home":"/es/","offer":"/es/offer/"}},{"code":"it","label":"Italiano","shortCode":"IT","paths":{"home":"/it/","offer":"/it/offer/"}},{"code":"ko","label":"한국어","shortCode":"KO","paths":{"home":"/ko/","offer":"/ko/offer/"}},{"code":"tr","label":"Türkçe","shortCode":"TR","paths":{"home":"/tr/","offer":"/tr/offer/"}},{"code":"ru","label":"Русский","shortCode":"RU","paths":{"home":"/ru/","offer":"/ru/offer/"}},{"code":"uk","label":"Украинский","shortCode":"UK","paths":{"home":"/uk/","offer":"/uk/offer/"}},{"code":"th","label":"ภาษาไทย","shortCode":"TH","paths":{"home":"/th/","offer":"/th/offer/"}},{"code":"vi","label":"Tiếng Việt","shortCode":"VI","paths":{"home":"/vi/","offer":"/vi/offer/"}},{"code":"id","label":"Bahasa Indonesia","shortCode":"ID","paths":{"home":"/id/","offer":"/id/offer/"}},{"code":"ms","label":"Melayu","shortCode":"MS","paths":{"home":"/ms/","offer":"/ms/offer/"}},{"code":"ar","label":"العربية","shortCode":"AR","paths":{"home":"/ar/","offer":"/ar/offer/"}},{"code":"pt","label":"Português","shortCode":"PT","paths":{"home":"/pt/","offer":"/pt/offer/"}},{"code":"pt-br","label":"Português - Brasil","shortCode":"BR","paths":{"home":"/pt-br/","offer":"/pt-br/offer/"}},{"code":"sv","label":"Svenska","shortCode":"SV","paths":{"home":"/sv/","offer":"/sv/offer/"}},{"code":"pl","label":"Polski","shortCode":"PL","paths":{"home":"/pl/","offer":"/pl/offer/"}},{"code":"cs","label":"Čeština","shortCode":"CS","paths":{"home":"/cs/","offer":"/cs/offer/"}}];

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
});