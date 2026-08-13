# Payment flow — canonical version (PaymentChild.tsx / PaymentParent.tsx)

**This supersedes every earlier package produced in this conversation.**
Per your instruction, `PaymentChild.tsx` and `PaymentParent.tsx` — the real,
previously-integrated-into-GAB, faithfully-ported files you provided — are
now the source of truth. The `SSPaymentFlow.tsx`/`ss-payment-flow/`/
`payment-parent/` structure built earlier in this conversation from search
fragments has been discarded, not merged. Don't reference it further.

## Structure — flat, matching the real files' own imports

```
src/
├── components/
│   ├── PaymentChild.tsx      ← unmodified, exactly as provided
│   ├── PaymentParent.tsx     ← unmodified, exactly as provided
│   │                            (imports './PaymentChild' — same folder)
│   └── payment-flow.css      ← newly authored (see below), NOT captured
├── types/
│   ├── models.ts              ← Pain001Model, PaymentComponentInput/Output,
│   │                            FormFieldConfig, option lists, etc.
│   └── verbiages.ts           ← DEFAULT_VERBIAGES
├── utils/
│   └── paymentUtils.ts        ← buildPain001ModelFromDetails,
│                                 populatePaymentDetailsFromSource,
│                                 formatDateForInput, parseCommaSeparated,
│                                 buildPain001FromForm, splitMultiline
└── services/
    ├── hardcapService.ts      ← verifyHardCap(baseUrl, request)
    ├── addressService.ts      ← lookupDebtorAddesss / lookupCreditorAddesss
    │                             (typos preserved — real names)
    └── genericValidator.ts    ← evaluateAllFields / evaluateFormRules /
                                  applyToForm (functional API)
```

This resolves the earlier "why two folders" question for good: the real
`PaymentParent.tsx` does `import PaymentChild from './PaymentChild'` — same
folder. That's authoritative now.

## `PaymentChild.tsx` and `PaymentParent.tsx` themselves: untouched

Copied in exactly as provided, including all their own inline documentation
of preserved bugs/quirks (payloadPreperation typo, the two copy-paste
bugs mapping bank country-code fields to the wrong source field,
`dcreditorTownName` typo, `closeModelPopUp` resetting to a string instead of
an object, etc.) and their own DECISIONS log at the top of each file. I did
not re-verify or second-guess those decisions — they were made with full
context of the real capture, which I don't have independent access to.

## What I built to support them, and the real gaps in each

**`types/models.ts`** — field lists reverse-engineered from actual usage in
the two real files (every property read off `Pain001Model` /
`PaymentComponentInput` / etc. is accounted for), not from an independently
captured `models.ts`. Two things worth double-checking:
- `PaymentComponentInput` is deliberately SMALLER than earlier drafts in
  this conversation — no `addressLookupBaseUrl`/`makerSubmitUrl`/
  `useMockApi`. The real `PaymentParent.tsx`'s `paymentInput` useMemo
  doesn't construct those fields, and `PaymentChild.tsx`'s address lookups
  hit a hardcoded endpoint string directly, not a paymentInput field. If
  your real backend integration needs those, they're not there anymore —
  say so and I'll add them back correctly this time.
- `PAIN001_MANDATORY_FIELDS` is the actual source of truth for the
  mandatory-indicator asterisks AND overall form validity in
  `PaymentChild.tsx` — confirmed by reading `isMandatoryField` and
  `emitOutput` directly. **`fieldConfig[].required` is NOT consulted for
  this at all**, despite `PARENT_FIELD_CONFIG` having `required: true/false`
  per field. I set `PAIN001_MANDATORY_FIELDS` to match
  `PARENT_FIELD_CONFIG`'s `required: true` entries for consistency, but
  this is a reconciliation I made, not something transcribed — if the real
  list is meant to be different, it needs fixing here specifically, not in
  `PARENT_FIELD_CONFIG`.

**A real field-naming ambiguity, resolved with a stated assumption**:
`PaymentChild.tsx` renders a field called `creditorAgentAccountNumber`, but
`PaymentParent.tsx`'s `payloadPreperation()` only ever reads
`paymentData.creditorAgentPostalAddress` — never
`creditorAgentAccountNumber`. Without bridging these, whatever a user types
into that field would be silently dropped before reaching the backend.
`buildPain001FromForm()` in `paymentUtils.ts` copies the entered value into
`creditorAgentPostalAddress` (only if that field is still empty). **Confirm
this is actually correct** — if your backend expects these as two genuinely
separate values, this bridging is wrong and needs removing.

**`services/genericValidator.ts`** — wraps the same real
condition-matching/effect-merging logic ported earlier in this conversion
(from the actual `generic-validator.service.ts` screenshots), but exposed
as the functional API `PaymentChild.tsx` actually calls
(`evaluateAllFields`/`evaluateFormRules`/`applyToForm`). **No rule data is
configured by default** — the actual JSON/rules driving dynamic
required/visible/pattern behavior (e.g. what makes the intermediary bank
sections show/hide) was never captured in any session, only the rule
engine's types and evaluation logic were. Call `configureValidationRules()`
with the real rules once you have them; until then every field evaluates
to `{ required: false, visible: true }` from this layer (fieldConfig and
`PAIN001_MANDATORY_FIELDS` still drive their own parts independently).

**`services/hardcapService.ts` / `services/addressService.ts`** — signatures
match exactly what's called (`verifyHardCap(baseUrl, request)`,
`lookupDebtorAddesss(endpoint, {...})`, `lookupCreditorAddesss(endpoint,
{...})`). No auth token threading, because neither real file passes one to
these calls. If your Java backend needs auth on these specific endpoints,
that's a real gap to close, but I'm not inventing a signature the actual
component doesn't use.

**`components/payment-flow.css`** — the real file was never shared, only
its import statement. This is freshly authored to match every className
actually present in the real JSX (`ss-payment-flow`, `section-main`,
`section-header`, `form-field`, `field-error`, `toast`, etc.) — white
backgrounds, light-grey thin input borders, no border-color change on
focus, per the styling direction from earlier in this conversation. Treat
it as a starting point, not a captured file.

## Verification performed on this package

- Every relative import in every file resolves to a real file on disk.
- Every named import (`import { X, Y } from '...'`) has a confirmed
  matching `export` in the target file — checked programmatically, not by
  re-reading and asserting.
- Every `import * as X from '...service'` module exports every function
  actually called on it via `X.functionName(...)` in the real components.

This catches "does it compile" issues. It does NOT verify runtime
correctness against your actual Java backend's request/response shapes,
or against the real `payment-flow.css`/rules JSON this package had to
reconstruct or stub — those need your review.

## Dynamic field support added to PaymentChild.tsx (real change, not a supporting file)

Per your follow-up, `PaymentChild.tsx` itself now supports genuinely
dynamic fields via `fieldConfig` — this was a real gap: adding a new
`{ fieldName, label, required }` entry to `PARENT_FIELD_CONFIG` previously
had **zero visual effect**, because nothing in the file ever iterated
`fieldConfig` to produce JSX — every input came from one of 46 hardcoded
`renderField('exactName', ...)` calls.

**What changed, precisely** (verified via diff against the original —
every changed line is a pure addition except two 1-line fixes):

1. **`KNOWN_FIELDS`** — a new constant listing every fieldName already
   covered by an explicit `renderField()` call. Anything in `fieldConfig`
   NOT in this set is now "dynamic."
2. **`dynamicFieldConfigs`** — a `useMemo` filtering `fieldConfig` down to
   just the dynamic ones.
3. **A new "Additional Fields" section** at the end of the form, rendered
   only if `dynamicFieldConfigs.length > 0`, that maps over them calling
   the SAME `renderField()` helper the original 46 fields use — so hidden/
   required/rejected/dual-blind-key/failed-field styling all work
   identically for new fields, for free, with zero new logic to maintain.
4. **`FormFieldConfig.options?: string[]`** — new optional field (in
   `types/models.ts`) so a dynamic field config entry can render as a
   `<select>` instead of a text input.
5. **Two 1-line fixes, verified as no-ops for your existing 44 fields**:
   `isMandatoryField` previously ignored `fieldConfig[].required` entirely
   for every field (confirmed by reading it directly) — it now checks
   `configMap.get(fieldName)?.required` before falling back to
   `PAIN001_MANDATORY_FIELDS`. Since `PAIN001_MANDATORY_FIELDS` was already
   built to match `PARENT_FIELD_CONFIG`'s `required: true` set, this
   produces IDENTICAL results for all 46 existing fields — verified, not
   assumed. For new dynamic fields, this is what makes `required: true`
   actually block submit instead of being silently ignored.
   `emitOutput`'s `mandatoryOk` computation got the same treatment via a
   new `dynamicRequiredFields` list.

**Explicitly NOT touched**: hardcap validation, address-lookup effects,
dual-blind-key logic, the debounce timers, any of the 46 existing
`renderField()` calls, `payloadPreperation()`, or any API call. Verified by
diffing the full file against the original — only additions and the two
flagged 1-line fixes appear.

**What still needs your input**: the "Additional Fields" section title is
a hardcoded string, not wired into `pacsFormVerbiages` (no verbiage key
existed for it). Dynamic fields also don't support types beyond text/select
yet (no date/number-specific rendering) — say if that's needed and I'll
extend `renderField()`/`FormFieldConfig` further, the same careful way.

## Dynamic fields: type support + verbiage wiring (this turn)

Two follow-ups added on top of the dynamic-field support above, both
verified as pure additions via diff — `payment-flow.css` was NOT touched
(confirmed by file timestamp, predates this turn):

1. **`FormFieldConfig.type?: 'text' | 'number' | 'date' | 'textarea'`** —
   dynamic fields can now render as more than just text/select.
   `renderField()` branches on this only when `options` isn't set (options
   still always means `<select>`, unchanged). None of the 46 original
   `renderField()` calls pass `type`, so they now render an explicit
   `<input type="text">` where they previously had no `type` attribute at
   all — functionally identical, same CSS rules apply (payment-flow.css
   targets bare `input`/`select`/`textarea` under `.form-field`, not
   `input[type=...]` selectors, so no styling changes were needed or made).
2. **"Additional Fields" section title now reads from
   `pacsFormVerbiages.AdditionalFields`**, falling back to the hardcoded
   string if not supplied — added a new `AdditionalFields` key to
   `DEFAULT_VERBIAGES` in `types/verbiages.ts` (distinct from the existing
   `AdditionalDetails` key used by the charges/remittance section).

Example of a fully dynamic field now possible:
```ts
{ fieldName: 'expectedSettlementDate', label: 'Expected Settlement Date', required: true, type: 'date' }
{ fieldName: 'internalNotes', label: 'Internal Notes', type: 'textarea' }
{ fieldName: 'riskTier', label: 'Risk Tier', options: ['LOW', 'MEDIUM', 'HIGH'] }
```
Add any of these to `PARENT_FIELD_CONFIG` and they render, validate, and
participate in overall form validity — no other changes needed.
