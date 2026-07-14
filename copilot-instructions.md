# Copilot instructions — Trusted Federated AI

## What this project is
A vendor-neutral reference framework for the enterprise AI estate: how to use,
build, connect, and govern AI agents across many platforms and clouds. Static
multi-page site, no build step, no dependencies (HTML + CSS + a little JS).

## Dual audience — every change must serve both
1. CUSTOMER layer (front stage, public): guides enterprise leaders through
   DECISIONS about their AI estate. Neutral, advisory, honest about trade-offs.
2. SELLER layer (back stage, gated): helps Microsoft AI + Security sellers guide
   the conversation — talk tracks, discovery, objection handling, CTAs.
   The seller layer must NEVER be visible to customers by default.

## Core thesis (keep every page anchored to it)
"AI development will be federated; AI control cannot be." Centralized governance,
decentralized innovation.

## Design + content rules
- Vendor-neutral FIRST: name the open standard (MCP, A2A, OAuth/OIDC,
  OpenTelemetry, API gateway) at each control point; Microsoft products
  (Agent 365, Foundry, Entra, Purview, Sentinel, Defender, Copilot Studio,
  M365 Copilot) appear only as an "example anchor stack." Any vendor must be
  substitutable without breaking the architecture.
- Reuse the existing design system in assets/style.css. Do not introduce
  frameworks, build tools, or npm dependencies.
- Match the existing UI patterns — the role-lens toggle (CISO/CIO/Business
  leader) is the model for any new toggle.
- Keep it accessible: semantic HTML, keyboard-navigable toggles, sufficient
  contrast.

## File map
- index.html — Overview (four pillars)
- architect.html — Interactive reference architecture (five layers)
- concepts.html — Eight foundational concepts + Federated AI Zones matrix
- use-cases.html — Worked scenarios
- tensions.html — Trade-offs + primary sources
- leave-behind.html — Printable executive summary
- scenarios/ — Individual interactive scenario pages
- assets/ — Shared CSS/JS
