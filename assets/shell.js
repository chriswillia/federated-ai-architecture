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
           activePath: "overview",       // overview | executives | sellers | architects
           showCustomerInput: true,      // optional, default true
           onCustomerChange: (name) => { ... },  // optional
         });
       </script>
     </body>
   ============================================================ */

(function () {
  "use strict";

  const NAV_ITEMS = [
    { id: "overview",   label: "Overview",         href: "index.html" },
    { id: "executives", label: "For executives",   href: "leave-behind.html" },
    { id: "sellers",    label: "For sellers",      href: "index.html#conversation" },
    { id: "architects", label: "For architects",   href: "architect.html" },
  ];

  const FOOTER_LINKS = [
    { label: "Overview",        href: "index.html" },
    { label: "Architect view",  href: "architect.html" },
    { label: "Concepts",        href: "concepts.html" },
    { label: "Use cases",       href: "use-cases.html" },
    { label: "Honest tensions", href: "tensions.html" },
    { label: "Leave-behind",    href: "leave-behind.html" },
    { label: "GitHub \u2197",   href: "https://github.com/chriswillia/federated-ai-architecture", external: true },
  ];

  const THEME_KEY = "federated-ai-theme";
  const CUSTOMER_KEY = "federated-ai-customer";

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
        el("span", null, "Vendor-neutral architecture framework"),
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
        placeholder: "Customer name (optional)", "aria-label": "Customer name",
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

    return el("header", { class: "app-shell" }, inner);
  }

  function renderFooter() {
    const links = el("nav", { class: "app-footer-links", "aria-label": "Footer" },
      ...FOOTER_LINKS.map((link) =>
        link.external
          ? el("a", { href: link.href, target: "_blank", rel: "noopener noreferrer" }, link.label)
          : el("a", { href: link.href }, link.label),
      ),
    );
    const brand = el("div", { class: "app-footer-brand" },
      el("strong", null, "Trusted Federated AI"),
      " \u00b7 Vendor-neutral architecture framework",
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
    wireCustomer(options.onCustomerChange);

    return { customer: readInitialCustomer() };
  }

  window.Shell = { mount, readInitialCustomer, THEME_KEY, CUSTOMER_KEY };
})();
