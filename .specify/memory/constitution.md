<!--
Sync Impact Report:
- Version change: none (unfilled template) → 1.0.0
- Modified principles: none (first generation)
- Added principles:
  I. Version Control and Review
  II. Security and Secrets
  III. Observability
  IV. Versioned Contracts
  V. Specification Traceability
  VI. No Silent Divergence
  VII. Commit Messages
  VIII. Changelog Maintenance
  IX. Code as Documentation
  X. Type Safety
  XI. Single Responsibility
  XII. Naming Conventions
  XIII. Component Architecture
  XIV. Styling Standards
  XV. BEM Methodology
  XVI. State Management
  XVII. Async State Correctness
  XVIII. API Integration
  XIX. API and Data Boundaries
- Added sections: Quality Standards (Testing, Accessibility, Performance,
  Internationalization, Defensive Programming, Maintainability),
  Development Workflow, Governance
- Removed sections: none
- Templates requiring updates:
  ✅ .specify/templates/plan-template.md — generic "Constitution Check" gate, no change needed
  ✅ .specify/templates/spec-template.md — no change needed; specs open with the
     inheritance/origin section mandated by Principle V
  ✅ .specify/templates/tasks-template.md — no change needed
- Follow-up TODOs:
  TODO(BRANCH_PROTECTION): confirm `main` branch protection requires one approved
    review and a green `Build` workflow; could not be verified from the repository.
  TODO(STRICT_NULL_CHECKS): `tsconfig.json` sets `strictNullChecks: false`, which
    partially disables strict mode (Principle X). Plan re-enablement.
  TODO(DEPENDENCY_SCANNING): no automated vulnerability scanning (e.g. Dependabot,
    `yarn audit` in CI) found in `.github/` (Principle II).
  TODO(LINT_GATE): ESLint is not run in CI nor by `.githooks/pre-commit`
    (only localization-lock runs). Decide whether `yarn lint` becomes a CI gate.
  TODO(COMMIT_TYPES): history uses scoped types (`fix(localization-lock):`) and
    `release:`, neither allowed by Principle VII as written. Conform, or amend the
    upstream base constitution.
  TODO(CHANGELOG_FORMAT): `WENI-CHANGELOG.md` does not follow Keep a Changelog
    categories (Principle VIII). Migrate on next release.
- Project decisions recorded as explicit exceptions to the bases:
  Principle XII — file names follow React conventions (PascalCase for
    component/class files, camelCase for other modules, lowercase directories).
  Quality Standards → Testing — the current stack (Vitest + jsdom, React
    Testing Library, Enzyme via src/testUtils) is kept; no new frameworks.
  Quality Standards → Internationalization — contributors change only
    src/config/i18n/defaults.json; all translations come from Crowdin.

Provenance:
- Source: weni-ai/vtex-cx-engineering-constitutions (main)
- Bases: base-constitution.md, frontend/base-constitution.md
- Domains: frontend
- Project layer: weni-ai/floweditor (@weni/flow-editor)
-->

# Flow Editor Constitution

`@weni/flow-editor` is a React + TypeScript flow editing component, published to
npm and embedded by the Weni Flows module. This constitution binds every change
to this repository.

## Core Principles

### I. Version Control and Review

All code MUST enter `main` through a pull request. A merge MUST require at least
one approved review (default reviewers come from `.github/CODEOWNERS`) and a
green `Build` workflow (`yarn build` and `yarn test`). Direct pushes to `main`
MUST be blocked via GitHub branch protection. Pull requests SHOULD fill in
`.github/pull_request_template.md`.

**Rationale:** the policy is only real when enforced by the platform, not by
trust. Peer review and a protected main branch keep history auditable and
prevent unreviewed changes from reaching the published package.

### II. Security and Secrets

Secrets MUST never be committed to the repository. CI secrets (e.g.
`CODECOV_TOKEN`, `ROLE_ARN`) MUST be provided through GitHub Actions secrets or
AWS SSM Parameter Store and injected at runtime; npm publishing MUST keep using
OIDC trusted publishing rather than long-lived tokens. Access MUST follow least
privilege by default (workflow `permissions:` declared explicitly and minimal).
Dependencies MUST come only from trusted sources (the npm registry, locked in
`yarn.lock`, or vendored tarballs whose upstream origin is documented, such as
`jsplumb-2.13.1.tgz`) and MUST be checked for known vulnerabilities.

**Rationale:** leaked credentials and untrusted dependencies are among the most
common and most damaging breaches; prevention is far cheaper than remediation.
A library consumed by other applications propagates any vulnerability it ships.

### III. Observability

Runtime errors MUST be reported through Sentry (`src/utils/sentry.ts`) rather
than ad-hoc `console` output. Logs and Sentry events MUST be structured (tags,
contexts, extras instead of concatenated strings) and MUST never contain secrets
or sensitive personal data — contact data, message content, and tokens included;
Session Replay MUST keep text and input masking enabled for such data. Errors
MUST be traceable across components through Sentry tracing and the correlation
identifiers of the backend requests that caused them.

**Rationale:** structured, privacy-safe telemetry is what makes incidents
diagnosable without creating new data-exposure risks; the editor renders real
contact and message data.

### IV. Versioned Contracts

Any change to a public interface MUST be versioned following SemVer through
`yarn version`. Public interfaces of this repository are: the exported editor
component and its configuration props (consumed by the Flows module), the flow
definition format and `SPEC_VERSION` in `src/flowTypes.ts`, and the endpoints
and payloads the editor expects from the asset server. Changes MUST be backward
compatible or ship with an announced deprecation path. Silent breaking changes
MUST NOT be introduced.

**Rationale:** consumers depend on stable contracts; explicit versioning and
deprecation give them a predictable path to adapt without outages.

### V. Specification Traceability

An engineering spec either derives from a product spec or originates in
engineering. Both are regular paths of the process; neither requires a
justification, and either may follow the full or the lite cycle.

When the change has a product spec, the engineering spec MUST derive from
exactly one approved product spec and MUST reference it through an immutable,
pinned version (commit or tag) — a mutable URL or ID alone MUST NOT be used. The
product spec MUST exist and be tagged before its engineering spec is created. An
engineering spec MUST NOT redefine the "what" it inherits: problem, scope,
success criteria, and binding decisions belong to the product spec. A technical
architecture document SHOULD be produced for non-trivial features; when it
exists it MUST be linked from the engineering spec, also pinned by commit/tag,
but its absence MUST NOT block the engineering spec.

An engineering spec in `specs/<feature>/spec.md` derived from a product spec
MUST open with an inheritance section in exactly this format:

```
## Inheritance from Product Spec
- Product Spec: <title> — <URL>
- Pinned version: <commit/tag>
- Architecture doc: <none | URL + commit/tag>
- Inherited binding decisions: <short list>
- Scope of this spec: <slice implemented by this repo>
- Divergences: <none | link to amendment>
```

An engineering spec without a product spec states its own "what" and MUST open
with an origin section in exactly this format:

```
## Origin Without Product Spec
- Product Spec: none
- Problem: <what is wrong or missing, in one or two sentences>
- Acceptance criteria: <observable outcomes that prove the change is done>
```

**Rationale:** traceability from intent to technical execution keeps decisions
auditable and lets any change be traced back to the need that justified it.
Pinning the product spec version guarantees every team implements the same
version of the feature. When the change is born in engineering — a hotfix, a
fix, technical debt — the engineering spec itself is the origin. Keeping the
architecture doc optional avoids blocking delivery on ceremony, and a fixed
opening format keeps the origin machine-checkable across repositories.

### VI. No Silent Divergence

When a technical need contradicts something inherited from the product spec —
scope, success criteria, or a binding decision — the divergence MUST NOT be
implemented silently in code. It MUST be raised as an amendment in the product
repository and recorded in the `Divergences` field of the engineering spec's
inheritance section, linking to that amendment. Once the amendment is approved
and produces a new tag, the engineering spec's `Pinned version` MUST be updated
to it. A technical difference that contradicts nothing inherited is not a
divergence but an implementation decision, and MUST live in the engineering
spec. This principle applies only to engineering specs derived from a product
spec.

**Rationale:** in a federated model where the product spec is the single source
of truth, a silent code deviation makes intent and implementation drift apart
with no audit trail.

### VII. Commit Messages

Commits MUST follow Conventional Commits format: `<type>: <description>`.
Allowed types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`. The
description MUST be imperative, specific, and no longer than 50 characters.
Commits MUST be atomic: one logical change per commit.

**Rationale:** conventional commits enable automated changelog generation and
semantic versioning. Atomic commits simplify bisecting, reverting, and
reviewing.

### VIII. Changelog Maintenance

As a public npm library, this project MUST maintain `WENI-CHANGELOG.md` following
the Keep a Changelog format. Every user-facing change MUST appear under the
appropriate category (Added, Changed, Deprecated, Removed, Fixed, Security) of
its release. Version bumps MUST follow SemVer. `CHANGELOG.md` is the inherited
upstream (nyaruka) history and MUST NOT be used for new entries.

**Rationale:** a well-maintained changelog communicates impact to the Flows
module and other consumers and serves as release documentation.

### IX. Code as Documentation

All code MUST be written entirely in English, including variable names, function
names, comments, and documentation. Exception: domain-specific terms or acronyms
that only have meaning in the original language MAY remain untranslated. Code
MUST prioritize readability and clarity over brevity. Every non-trivial decision
MUST be documented through meaningful comments that explain the "why", not the
"what". User-facing strings are governed by Internationalization, not by this
principle.

**Rationale:** the repository is open source (AGPL-3.0); a globally
comprehensible codebase enables contribution and cross-team collaboration.
Comments that explain reasoning prevent future developers from breaking
invariants they cannot see.

### X. Type Safety

All new files under `src/` MUST be written in TypeScript (`.ts` / `.tsx`).
Existing JavaScript files (e.g. `src/utils/excellent.js`,
`src/config/i18n/index.js`) SHOULD only be modified for bug fixes or small
changes; substantial modifications SHOULD include migration to TypeScript. Type
definitions MUST be explicit; `any` SHOULD be avoided except when interfacing
with untyped external libraries (declared in `src/untyped.d.ts` and similar).
Strict mode MUST stay enabled in `tsconfig.json`.

Exception: `strictNullChecks: false` is a recorded legacy deviation from strict
mode, kept because enabling it on the existing codebase requires a dedicated
migration. No other strict flag MAY be disabled, and new code SHOULD be written
as if `strictNullChecks` were enabled.

**Rationale:** static typing catches errors at compile time, enables better
tooling, and serves as inline documentation. Gradual migration allows
incremental adoption without blocking delivery.

### XI. Single Responsibility

Each file SHOULD contain no more than 350 lines of code. Each function MUST have
only one responsibility. Logic inside JSX MUST be extracted to derived values,
helpers, or methods to keep markup declarative. Complex conditional rendering
MUST be abstracted into descriptively named boolean variables.

**Rationale:** small, focused units are easier to test, review, and refactor.
Readable JSX makes the component's visual structure immediately apparent.

### XII. Naming Conventions

Variable and function names MUST use `camelCase`. Component names MUST use
`PascalCase`. Abbreviations MUST be avoided unless they are universally
understood; clarity MUST take precedence over conciseness.

File names MUST follow React conventions, matching what the file exports:

- Files exporting a React component or a class MUST use `PascalCase` matching
  the export name (`Flow.tsx`, `NodeEditor.tsx`, `FlowStore.ts`), and their
  companion style and test files MUST share that name (`Flow.module.scss`,
  `Flow.test.ts`).
- Hooks MUST be named `useSomething.ts`.
- All other modules (helpers, store slices, configuration, utilities) MUST use
  `camelCase` (`helpers.ts`, `flowContext.ts`, `typeConfigs.ts`).
- Directory names MUST be lowercase (`nodeeditor/`, `routers/`).

Exception: the base rule "file names MUST be lowercase" does not apply to files.
React convention, followed across this codebase, ties a file's name to its
default export so imports, component names, and files stay searchable as one
identifier.

**Rationale:** consistent naming reduces cognitive load and makes the codebase
searchable. Predictable file naming enables automated tooling and faster
navigation.

### XIII. Component Architecture

Components MUST be named descriptively and reflect their purpose. Related
components SHOULD be grouped in folders or subfolders under `src/components/`
(e.g. `flow/routers/`, `flow/actions/`). Component prefixes SHOULD indicate scope
or nature (e.g. `AppHeader`, `UserProfile`). Props MUST have descriptive names
(e.g. `userName`, `userEmail`). Event callback props MUST be prefixed with `on`
(e.g. `onUserEmailChange`). Methods that handle state updates SHOULD be prefixed
with `handle` (e.g. `handleUserPermissions`). State variables MUST clearly
reflect what they represent (e.g. `isLoadingUser`, `errorStatusUser`).

**Rationale:** a predictable component structure makes the codebase navigable.
Clear naming for props, events, and state reduces integration errors and makes
component interfaces self-documenting.

### XIV. Styling Standards

Styles MUST be written as SCSS modules (`*.module.scss`) colocated with their
component. CSS selectors MUST use classes only; IDs MUST be reserved for
JavaScript targeting when no alternative exists. Nested selectors SHOULD be
avoided. Unnnic design system tokens (`$unnnic-*` colors, spacing, typography,
imported through `src/variables.module.scss`) and Unnnic components
(`@weni/unnnic-system`) MUST be used instead of hardcoded values and bespoke
widgets whenever available.

**Rationale:** centralized styles enable theming and consistency. Avoiding IDs
and deep nesting prevents specificity wars. Design tokens create a single source
of truth for the Weni visual language.

### XV. BEM Methodology

CSS class names MUST follow the BEM (Block Element Modifier) methodology. Blocks
MUST be independent components (`.button`). Elements MUST be parts of a block
and use double underscores (`.button__text`). Modifiers MUST represent
variations and use double hyphens (`.button--large`). Elements MUST NOT be
nested in class names (`.block__elem`, not `.block__elem1__elem2`).

Exception: existing SCSS modules using `snake_case` nested classes (e.g.
`.new_updates .content .title`) are legacy; they MUST NOT be extended with new
non-BEM classes, and are migrated only when the block is substantially changed.

**Rationale:** BEM provides collision-free CSS that scales across large
applications and teams, and keeps selectors predictable even when the editor is
embedded in a host application.

### XVI. State Management

Global state MUST be managed through the Redux store in `src/store/`
(`rootReducer`, `thunks`, `mutators`). State MUST NOT be duplicated across
components or store slices. Related state SHOULD be grouped in logical slices
(`flowContext`, `editor`, `nodeEditor`). Local component state SHOULD be
preferred when the data does not need to be shared.

**Rationale:** duplicated state causes synchronization bugs; a single store makes
data flow traceable. Modular slices mirror feature boundaries and simplify
testing.

### XVII. Async State Correctness

Async operations MUST track loading, success, and error states consistently.
Silent failures MUST NOT occur; errors MUST be surfaced to the user or reported
for debugging (see Observability). Contradictory states (e.g. loading and error
simultaneously) MUST be prevented. Double submissions (e.g. repeated flow saves)
MUST be guarded against. State MUST be rolled back when an operation fails after
an optimistic update.

**Rationale:** incorrect async state is one of the most common sources of bugs
and broken UX; users editing a flow must never lose work or be left in limbo.

### XVIII. API Integration

HTTP calls MUST be encapsulated in dedicated service modules — `src/external/`
for asset server and backend calls, `src/services/` for stateful services —
separate from components. Components and reducers MUST NOT call `axios`
directly. Error handling MUST be explicit; API errors MUST NOT surface as
unhandled promise rejections. Loading and error states MUST be tracked and
reflected in the UI.

**Rationale:** separating API logic from presentation enables reuse, simplifies
testing, and keeps components focused on rendering.

### XIX. API and Data Boundaries

Backend contracts MUST remain at the API/service boundary. Internal code MUST use
`camelCase`; `snake_case` fields from the backend MUST be normalized at the
adapter layer (`src/external/`). Raw backend fields MUST NOT leak into the store,
business logic, or components. Types that intentionally represent an external
contract MAY use its naming convention — notably the flow definition types in
`src/flowTypes.ts`, which mirror the goflow spec (e.g. `exit_uuid`) and are
serialized back unchanged.

**Rationale:** clean data boundaries prevent coupling between the editor and
backend implementation details. Normalizing at the edge keeps the rest of the
codebase consistent and refactorable.

## Quality Standards

### Testing

Components and modules with business logic MUST have unit tests. Tests MUST use
the project's current testing stack: Vitest with the `jsdom` environment
(`yarn test`, configured in `vite.config.js`), React Testing Library and Enzyme
for rendering, the shared helpers in `src/testUtils/` and `src/test/`, and
`redux-mock-store` for store-dependent code. No other test runner or testing
framework MAY be introduced without amending this constitution.

Test files MUST be colocated with the code they test as `<name>.test.ts(x)`
siblings (snapshots in the sibling `__snapshots__/`). Tests MUST NOT depend on
implementation details; they MUST verify behavior and outcomes. Tests MUST NOT
be added solely to increase coverage. A test that would still pass after a
regression is introduced MUST be fixed or removed.

**Rationale:** one testing stack keeps shared helpers, mocks, and CI coverage
reporting (Codecov) working for every test. Colocated tests are easier to
maintain and discover. Behavior-focused tests survive refactors; tests that do
not catch real bugs provide false confidence.

### Accessibility

Interactive elements MUST be keyboard accessible. Form inputs MUST have
associated labels. Color MUST NOT be the only means of conveying information
(e.g. node or issue states on the canvas). Images and icons MUST have meaningful
`alt` text or be marked decorative with `alt=""`. Focus states MUST be visible.

**Rationale:** accessibility is a legal requirement in many jurisdictions and
improves usability for all users.

### Performance

Unused dependencies MUST be removed. Heavy computations MUST be memoized or
debounced when executed on frequent events (canvas drag, typing in node
editors, simulator updates). Assets MUST be optimized (images, fonts, icons).
Bundle size impact SHOULD be considered before adding new dependencies, since
the build ships inside the host application. Initial load SHOULD prioritize the
visible canvas.

**Rationale:** large flows stress rendering and the editor runs embedded in
another app; lean bundles and efficient computation protect users on slow
networks and devices.

### Internationalization

User-facing strings MUST NOT be hardcoded; they MUST use `i18next` /
`react-i18next` keys. Date, number, and currency formatting MUST respect the
user's locale.

`src/config/i18n/defaults.json` (the `source` in `crowdin.yml`) is the only
localization file contributors — developers and coding agents alike — MAY
change. New, changed, and removed strings MUST be written there, in the source
language only, using `yarn scan` to extract keys. Contributors MUST NOT
translate strings into any other language, and MUST NOT create, modify, or
delete translation files (`src/config/i18n/<lang>/resource.json`); this is
enforced by the localization-lock pre-commit hook and CI job.

Exception to "new strings MUST be localized before merge" and "locale files
SHOULD maintain parity": in this repository a string is ready to merge once its
key and source-language text are in `defaults.json`. All translations and locale
parity are owned by the Localization team and delivered through Crowdin after
merge (`.github/workflows/localization-automation.yml`), because the
organization's localization policy forbids translations made by contributors.

**Rationale:** externalized strings enable translation without code changes, and
a single translation pipeline keeps quality and terminology consistent across
products.

### Defensive Programming

Defensive guards (null checks, fallback branches, runtime assertions) SHOULD only
be added when the invalid state is realistically reachable. Root causes MUST be
fixed rather than masked with defensive code. Guards MUST follow the patterns
already established in the surrounding code.

**Rationale:** unnecessary defensive code obscures real logic; fixing root causes
produces more robust code than layers of protection.

### Maintainability

Business rules (e.g. node/action type configuration in `src/config/typeConfigs.ts`,
validation in `src/store/validators.ts`) MUST NOT be duplicated across locations;
they MUST be centralized in a single source of truth. Local duplication of
utility code MAY exist when extraction would create unnecessary coupling.
Abstractions SHOULD only be created when there is a clear pattern across multiple
use cases.

**Rationale:** premature abstraction creates coupling worse than the duplication
it eliminates. Centralize business rules; tolerate incidental duplication.

## Development Workflow

- Toolchain: Node.js 18+ (CI) with Yarn; Vite (`yarn start`, `yarn build`),
  Vitest (`yarn test`), ESLint with `@weni/eslint-config/react16` and Prettier
  (`yarn lint`, `yarn prettify`).
- Before opening a pull request, `yarn build` and `yarn test --watchAll=false`
  MUST pass locally; `yarn lint` SHOULD report no errors on touched files.
- Git hooks live in `.githooks/` (`yarn prepare` sets `core.hooksPath`); the
  pre-commit hook MUST NOT be bypassed to commit translation files.
- Releases are cut with `yarn version --<patch|minor|major>`; pushing the tag
  triggers `.github/workflows/publish.yml`, which publishes to npm.
- Feature work follows Speckit: specs in `specs/<feature>/`, and every
  `plan.md` MUST include a Constitution Check against this document.

## Governance

This constitution supersedes other practices in this repository. Runtime agent
guidance (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`) MUST be consistent with it;
on conflict, this document prevails.

Amendments are made by pull request editing `.specify/memory/constitution.md`,
updating the Sync Impact Report, and bumping the version: MAJOR when a principle
is removed or redefined incompatibly, MINOR when a principle or section is added
or materially expanded, PATCH for clarifications and wording. Changes to the
upstream bases (`weni-ai/vtex-cx-engineering-constitutions`) are pulled in by
re-running `setup-engineering`. Project-level exceptions to a base `MUST` are
valid only when stated in the affected principle with their justification.

Every pull request review MUST verify compliance. Every `plan.md` MUST pass the
Constitution Check, and justified violations MUST be recorded in its Complexity
Tracking. `/speckit.analyze` treats a conflict with any `MUST` as CRITICAL.

**Version**: 1.0.0 | **Ratified**: 2026-10-28 | **Last Amended**: 2026-10-28
