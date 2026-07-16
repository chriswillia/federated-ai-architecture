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
    { id: "overview",     label: "Overview",     href: "index.html" },
    { id: "architecture", label: "Architecture", href: "architect.html" },
    { id: "use-cases",    label: "Use cases",    href: "use-cases.html" },
    { id: "summary",      label: "Summary",      href: "leave-behind.html" },
  ];

  const FOOTER_LINKS = [
    { label: "Overview",          href: "index.html" },
    { label: "Architecture",      href: "architect.html" },
    { label: "Concepts",          href: "concepts.html" },
    { label: "Use cases",         href: "use-cases.html" },
    { label: "Trade-offs",        href: "tensions.html" },
    { label: "Standards",         href: "references.html" },
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
        el("button", { type: "button", class: "seller-practice-btn", id: "sellerPracticeBtn" }, "Practice this pitch"),
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
    container.querySelector("#sellerPracticeBtn").addEventListener("click", openPracticeCoach);
    update();
  }

  const PRACTICE_STEPS = ["Open", "Discover", "Frame", "Handle objection", "Close"];
  function practiceState() {
    const guide = document.querySelector(".seller-meeting-guide");
    return {
      stage: guide && guide.querySelector("[data-seller-field='stage']").value || "Discover",
      audience: guide && guide.querySelector("[data-seller-field='audience']").value || "CIO",
      priority: guide && guide.querySelector("[data-seller-field='priority']").value || "Security",
    };
  }

  function openPracticeCoach() {
    let coach = document.getElementById("sellerPracticeCoach");
    if (!coach) {
      coach = el("div", { class: "seller-practice-overlay", id: "sellerPracticeCoach", role: "dialog", "aria-modal": "true", "aria-labelledby": "practiceTitle" },
        el("div", { class: "seller-practice-panel" },
          el("div", { class: "seller-practice-head" },
            el("div", null, el("div", { class: "seller-kicker" }, "Seller practice coach"), el("h2", { id: "practiceTitle" }, "Rehearse the customer conversation")),
            el("button", { type: "button", class: "seller-practice-close", "aria-label": "Close practice coach", onClick: () => closePracticeCoach() }, "×"),
          ),
          el("div", { class: "seller-practice-context", id: "practiceContext" }),
          el("div", { class: "seller-practice-steps", id: "practiceSteps" }, ...PRACTICE_STEPS.map((name, index) => el("button", { type: "button", "data-practice-step": index, onClick: () => renderPracticeStep(index) }, `${index + 1}. ${name}`))),
          el("section", { class: "seller-practice-content", id: "practiceContent" }),
          el("div", { class: "seller-practice-actions" },
            el("button", { type: "button", class: "btn btn--secondary", id: "practicePrev", onClick: () => shiftPractice(-1) }, "← Back"),
            el("button", { type: "button", class: "btn btn--secondary", id: "practiceReveal", onClick: () => togglePracticeCoaching() }, "Reveal coaching"),
            el("button", { type: "button", class: "btn btn--primary", id: "practiceNext" }, "Next →"),
          ),
        ),
      );
      document.body.appendChild(coach);
      coach.addEventListener("click", (event) => { if (event.target === coach) closePracticeCoach(); });
    }
    coach.dataset.step = "0";
    coach.dataset.coaching = "false";
    document.body.classList.add("seller-practice-open");
    renderPracticeStep(0);
    coach.querySelector(".seller-practice-close").focus();
  }

  function closePracticeCoach() { document.body.classList.remove("seller-practice-open"); }
  function shiftPractice(delta) {
    const coach = document.getElementById("sellerPracticeCoach");
    if (!coach) return;
    renderPracticeStep(Math.max(0, Math.min(PRACTICE_STEPS.length - 1, Number(coach.dataset.step || 0) + delta)));
  }
  function togglePracticeCoaching() {
    const coach = document.getElementById("sellerPracticeCoach");
    if (!coach) return;
    coach.dataset.coaching = coach.dataset.coaching === "true" ? "false" : "true";
    renderPracticeStep(Number(coach.dataset.step || 0));
  }
  function renderPracticeStep(step) {
    const coach = document.getElementById("sellerPracticeCoach");
    if (!coach) return;
    const state = practiceState();
    const audienceOpeners = {
      "CIO": "Your AI estate will be federated by design. The leadership decision is whether identity, policy, evidence, and economics will be equally federated — or consistently controlled.",
      "CISO": "You already govern people, apps, endpoints, and data. The question is whether agent actions inherit that control model or become an unobserved exception.",
      "Head of AI": "Your teams need freedom to build useful agents quickly. The question is how every new agent inherits reusable controls instead of creating a new exception.",
      "Business sponsor": "Which workflow should be materially faster, safer, or less expensive next quarter — and what will let us scale the result without adding risk?",
    };
    const objection = state.priority === "Security" || state.priority === "Data protection"
      ? ["Agents will leak our data.", "Only if identity and policy do not follow them. Use workload identity, data labels and DLP, governed tools, and end-to-end traces — then validate those controls in a real scenario."]
      : state.priority === "Multi-cloud"
        ? ["We do not want to be locked into one cloud.", "That is why the control pattern is standards-led: MCP for tools, A2A for collaboration, OAuth/OIDC for identity, OpenTelemetry for evidence, and an API gateway at the boundary. Microsoft is an anchor stack, not a prerequisite for every runtime."]
        : ["We already have AI tools. Why do we need an operating model?", "Those tools are the estate. The operating model makes them accountable, observable, and reusable across teams — so you can increase adoption without multiplying unmanaged cost and risk."];
    const content = [
      { title: "Open with their reality", prompt: `Say this in your own words to a ${state.audience}: “${audienceOpeners[state.audience]}”`, coaching: "Do not lead with products. Pause after the opening and ask whether this matches their current reality." },
      { title: "Discover the decision", prompt: `Ask: “Where are agents already being used, built, or bought — and can you name the owner, data boundary, and business outcome for each?” Then follow the ${state.priority.toLowerCase()} thread.`, coaching: "Listen for a concrete scenario and a control gap. Restate both before moving to architecture." },
      { title: "Frame the framework", prompt: "Explain the thesis: AI development will be federated; AI control cannot be. Walk from the customer scenario to open control points: MCP, A2A, OAuth/OIDC, OpenTelemetry, and an API gateway. Only then map an example Microsoft anchor stack.", coaching: "Keep the layers connected to outcomes: Experience = adoption; Build = speed; Connect = portability; Govern & Secure = trust." },
      { title: "Practice the objection", prompt: `Customer says: “${objection[0]}” Respond without reading the answer.`, coaching: `Suggested response: “${objection[1]}” Then return to their specific scenario and ask which control they need to validate first.` },
      { title: "Close with a mutual next step", prompt: `Propose: “Let’s select one ${state.priority.toLowerCase()}-relevant scenario, map its current controls, and define success as a business outcome plus validated identity, data, and evidence controls.”`, coaching: `For the ${state.stage} stage, name the engagement explicitly: ${state.stage === "Discover" ? "agent estate inventory workshop" : state.stage === "Diagnose" ? "maturity and control-gap assessment" : state.stage === "Design" ? "federated architecture workshop" : state.stage === "Prove" ? "governed pilot design" : "portfolio expansion review"}. Secure an owner, a scenario, and a date before ending.` },
    ][step];
    coach.dataset.step = String(step);
    const coachingVisible = coach.dataset.coaching === "true";
    coach.querySelector("#practiceContext").textContent = `${state.audience} · ${state.priority} · ${state.stage}`;
    coach.querySelector("#practiceContent").innerHTML = `<div class="seller-practice-number">Step ${step + 1} of ${PRACTICE_STEPS.length}</div><h3>${content.title}</h3><p class="seller-practice-prompt">${content.prompt}</p><div class="seller-practice-coaching" ${coachingVisible ? "" : "hidden"}><strong>Coaching:</strong> ${content.coaching}</div>`;
    coach.querySelectorAll("[data-practice-step]").forEach((button) => button.classList.toggle("active", Number(button.dataset.practiceStep) === step));
    coach.querySelector("#practicePrev").disabled = step === 0;
    coach.querySelector("#practiceNext").textContent = step === PRACTICE_STEPS.length - 1 ? "Start again" : "Next →";
    coach.querySelector("#practiceNext").onclick = step === PRACTICE_STEPS.length - 1 ? () => renderPracticeStep(0) : () => shiftPractice(1);
    coach.querySelector("#practiceReveal").textContent = coachingVisible ? "Hide coaching" : "Reveal coaching";
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
