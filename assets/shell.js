/* ============================================================
   Trusted Federated AI — shared app shell
   ------------------------------------------------------------
   One module, used by every page. Renders the sticky header
   and footer, wires up the theme toggle, customer input, and
   URL sync.

   Usage:
     <head>
       <link rel="stylesheet" href="assets/style.css">
       <script>
         // Set theme BEFORE first paint to avoid flash.
         (() => {
           const saved = (() => { try { return localStorage.getItem("federated-ai-theme"); } catch (e) { return null; } })();
           const theme = saved || (window.matchMedia &&
             window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
           document.documentElement.setAttribute("data-theme", theme);
         })();
       </script>
     </head>
     <body>
       <div id="app-header"></div>
       <main class="app-main">...</main>
       <div id="app-footer"></div>
       <script src="assets/shell.js"></script>
       <script>
         Shell.mount({
           activePath: "overview",       // overview | architecture | concepts | use-cases | tensions | summary
           showCustomerInput: true,      // optional, default true
           onCustomerChange: (name) => { ... },  // optional
         });
       </script>
     </body>
   ============================================================ */

(function () {
  "use strict";

  const NAV_ITEMS = [
    { id: "overview",     label: "Overview",         href: "index.html" },
    { id: "architecture", label: "Architecture",     href: "architect.html" },
    { id: "concepts",     label: "Concepts",         href: "concepts.html" },
    { id: "use-cases",    label: "Use cases",        href: "use-cases.html" },
    { id: "tensions",     label: "Trade-offs",       href: "tensions.html" },
    { id: "summary",      label: "Executive summary", href: "leave-behind.html" },
  ];

  const FOOTER_LINKS = [
    { label: "Overview",          href: "index.html" },
    { label: "Architecture",      href: "architect.html" },
    { label: "Concepts",          href: "concepts.html" },
    { label: "Use cases",         href: "use-cases.html" },
    { label: "Trade-offs",        href: "tensions.html" },
    { label: "Executive summary", href: "leave-behind.html" },
    { label: "GitHub \u2197",     href: "https://github.com/chriswillia/federated-ai-architecture", external: true },
  ];

  const THEME_KEY = "federated-ai-theme";
  const CUSTOMER_KEY = "federated-ai-customer";
  const SELLER_MODE_KEY = "federated-ai-seller-mode";
  const SELLER_GUIDE_KEY = "federated-ai-seller-guide";

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
        else node.setAttribute(k, v === true ? "" : v);
      }
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  function renderHeader(options) {
    const { activePath, showCustomerInput, customerValue } = options;

    const brand = el("a", { class: "brand", href: "index.html", "aria-label": "Trusted Federated AI home" },
      el("div", { class: "brand-mark" }, "AI"),
      el("div", { class: "brand-text" },
        el("strong", null, "Trusted Federated AI"),
        el("span", null, "A framework for the enterprise AI estate"),
      ),
    );

    const nav = el("nav", { class: "shell-nav", "aria-label": "Primary" },
      ...NAV_ITEMS.map((item) =>
        el("a", { href: item.href, class: item.id === activePath ? "active" : null }, item.label),
      ),
    );

    const inner = el("div", { class: "shell-inner" }, brand, nav, el("span", { class: "shell-spacer" }));

    if (showCustomerInput !== false) {
      const input = el("input", {
        type: "text", class: "shell-input", id: "shellCustomerInput",
        placeholder: "Your organization (optional)", "aria-label": "Your organization",
        value: customerValue || "",
      });
      inner.appendChild(input);
    }

    const themeBtn = el("button", {
      type: "button", class: "icon-btn", id: "shellThemeToggle",
      title: "Toggle theme", "aria-label": "Toggle theme",
      html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>',
    });
    inner.appendChild(themeBtn);

    const sellerBtn = el("button", {
      type: "button", class: "seller-toggle", id: "shellSellerToggle",
      "aria-pressed": "false", title: "Show seller guidance", "aria-label": "Show seller guidance",
    }, "Seller mode");
    inner.appendChild(sellerBtn);

    return el("header", { class: "app-shell" }, inner);
  }

  function renderFooter() {
    const links = el("nav", { class: "app-footer-links", "aria-label": "Footer" },
      ...FOOTER_LINKS.map((link) =>
        link.external
          ? el("a", { href: link.href, target: "_blank", rel: "noopener noreferrer" }, link.label)
          : el("a", { href: link.href }, link.label),
      ),
      el("a", { href: "battlecards.html", class: "seller-nav-link seller-only" }, "Seller battlecards"),
    );
    const brand = el("div", { class: "app-footer-brand" },
      el("strong", null, "Trusted Federated AI"),
      " \u00b7 A framework for the enterprise AI estate",
    );
    return el("footer", { class: "app-footer" },
      el("div", { class: "app-footer-inner" }, brand, links),
    );
  }

  function wireTheme() {
    const btn = document.getElementById("shellThemeToggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  function sellerModeEnabled() {
    try { return localStorage.getItem(SELLER_MODE_KEY) === "true"; } catch (e) { return false; }
  }

  function setSellerMode(enabled) {
    document.documentElement.toggleAttribute("data-seller-mode", !!enabled);
    const btn = document.getElementById("shellSellerToggle");
    if (btn) {
      btn.setAttribute("aria-pressed", String(!!enabled));
      btn.textContent = enabled ? "Seller mode: on" : "Seller mode";
      btn.title = enabled ? "Hide seller guidance" : "Show seller guidance";
      btn.setAttribute("aria-label", btn.title);
    }
    try { localStorage.setItem(SELLER_MODE_KEY, String(!!enabled)); } catch (e) {}
  }

  function wireSellerMode() {
    setSellerMode(sellerModeEnabled());
    const btn = document.getElementById("shellSellerToggle");
    if (btn) btn.addEventListener("click", () => setSellerMode(!document.documentElement.hasAttribute("data-seller-mode")));
  }

  function addSellerPrompt() {
    const main = document.querySelector("main");
    if (!main || main.querySelector(".seller-page-prompt")) return;
    const prompt = el("aside", { class: "seller-callout seller-page-prompt seller-only", "aria-label": "Seller guidance" },
      el("div", { class: "seller-kicker" }, "Seller guidance"),
      el("div", { class: "seller-callout-body" },
        el("strong", null, "Use the customer page to lead with a decision, not a product."),
        el("p", null, "Ask which AI estates, data boundaries, and control gaps matter first. Name MCP, A2A, OAuth/OIDC, OpenTelemetry, and API gateways as the portable control points; position products only as an example anchor stack."),
        el("a", { href: "battlecards.html" }, "Open seller battlecards \u2192"),
      ),
    );
    main.prepend(prompt);
  }

  function addSellerMeetingGuide() {
    const header = document.querySelector(".app-shell");
    if (!header || document.querySelector(".seller-meeting-guide")) return;
    let guide = {};
    try { guide = JSON.parse(localStorage.getItem(SELLER_GUIDE_KEY) || "{}"); } catch (e) {}
    const stage = guide.stage || "Discover";
    const audience = guide.audience || "CIO";
    const priority = guide.priority || "Security";
    const container = el("div", { class: "seller-meeting-guide seller-only", "aria-label": "Seller meeting guide" },
      el("div", { class: "seller-meeting-inner" },
        el("span", { class: "seller-guide-label" }, "Meeting guide"),
        sellerSelect("stage", "Stage", ["Discover", "Diagnose", "Design", "Prove", "Expand"], stage),
        sellerSelect("audience", "Audience", ["CIO", "CISO", "Head of AI", "Business sponsor"], audience),
        sellerSelect("priority", "Priority", ["Security", "Adoption", "Multi-cloud", "Cost", "Data protection"], priority),
        el("span", { class: "seller-next-action", id: "sellerNextAction" }),
      ),
    );
    header.after(container);
    const update = () => {
      const state = {
        stage: container.querySelector("[data-seller-field='stage']").value,
        audience: container.querySelector("[data-seller-field='audience']").value,
        priority: container.querySelector("[data-seller-field='priority']").value,
      };
      try { localStorage.setItem(SELLER_GUIDE_KEY, JSON.stringify(state)); } catch (e) {}
      const messages = {
        Discover: "Next: map active agents and accountable owners.",
        Diagnose: "Next: identify the highest-risk control gap.",
        Design: "Next: agree the portable control pattern and anchor stack.",
        Prove: "Next: select one governed scenario and success measures.",
        Expand: "Next: establish portfolio review and scale plan.",
      };
      const action = container.querySelector("#sellerNextAction");
      if (action) action.textContent = messages[state.stage];
    };
    container.querySelectorAll("select").forEach((select) => select.addEventListener("change", update));
    update();
  }

  function sellerSelect(field, label, values, selected) {
    const select = el("select", { "data-seller-field": field, "aria-label": label },
      ...values.map((value) => el("option", { value, selected: value === selected }, value)),
    );
    return el("label", { class: "seller-guide-field" }, el("span", null, label), select);
  }

  function wireCustomer(onChange) {
    const input = document.getElementById("shellCustomerInput");
    if (!input) return;

    // Init from URL or storage (URL wins).
    try {
      const url = new URL(window.location.href);
      const fromUrl = url.searchParams.get("customer");
      const fromStorage = (() => { try { return localStorage.getItem(CUSTOMER_KEY); } catch (e) { return null; } })();
      const initial = fromUrl || fromStorage || "";
      if (initial && !input.value) {
        input.value = initial;
        if (typeof onChange === "function") onChange(initial);
      }
    } catch (e) {}

    input.addEventListener("input", (e) => {
      const v = (e.target.value || "").trim();
      try { localStorage.setItem(CUSTOMER_KEY, v); } catch (err) {}
      try {
        const url = new URL(window.location.href);
        if (v) url.searchParams.set("customer", v);
        else url.searchParams.delete("customer");
        window.history.replaceState({}, "", url.toString());
      } catch (err) {}
      if (typeof onChange === "function") onChange(v);
    });
  }

  function readInitialCustomer() {
    try {
      const url = new URL(window.location.href);
      return url.searchParams.get("customer")
        || localStorage.getItem(CUSTOMER_KEY)
        || "";
    } catch (e) { return ""; }
  }

  function mount(options) {
    options = options || {};
    const headerSlot = document.getElementById("app-header");
    const footerSlot = document.getElementById("app-footer");

    if (headerSlot) {
      headerSlot.replaceWith(renderHeader({
        activePath: options.activePath || "overview",
        showCustomerInput: options.showCustomerInput,
        customerValue: readInitialCustomer(),
      }));
    }
    if (footerSlot) {
      footerSlot.replaceWith(renderFooter());
    }

    wireTheme();
    wireSellerMode();
    wireCustomer(options.onCustomerChange);
    addSellerPrompt();
    addSellerMeetingGuide();

    return { customer: readInitialCustomer(), sellerMode: sellerModeEnabled() };
  }

  window.Shell = { mount, readInitialCustomer, sellerModeEnabled, setSellerMode, THEME_KEY, CUSTOMER_KEY, SELLER_MODE_KEY };
})();
