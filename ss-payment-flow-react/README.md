# ss-payment-flow → React conversion

React/TypeScript port of the Angular `ss-payment-flow` library
(`SSPaymentMakerComponent`) and its host, `PaymentParentComponent`, built for
the GAB React UI. Based on a full line-by-line capture of the real Angular
source, photographed screen-by-screen across several sessions — that capture
is now complete (no further source is expected), so every remaining gap
below has been closed with a documented engineering decision rather than
left as an open question.

**Verified**: both main components (`PaymentChild.tsx`, `PaymentParent.tsx`)
compile cleanly under `tsc --noEmit` with no syntax or type errors, using
`react-jsx` + `esModuleInterop` + `skipLibCheck`, both individually and as a
full-project check across every file. This checks the code is structurally
sound — it does **not** check it against your real project's actual types
(`@citi-icg-179025/payment-flow-ui-lib`, your real `AuthService`/
`DataSharingService` signatures, etc.), which only a build inside your
actual GAB project can confirm.

## Final review pass — 6 real bugs found and fixed after initial delivery
A second pass (beyond the type-checking above) walked through the actual
render/effect behavior, not just syntax, followed by live interactive
testing (see the companion `PaymentFormLiveTest.jsx` runtime harness) that
surfaced two more. None of the six would show up in a code read-through or
a type-check alone:

1. **Render-loop risk in `PaymentParent.tsx`**: `paymentInput` (and
   `checkerDataFromParent`) were plain object literals rebuilt on every
   render, so their reference identity changed constantly. `PaymentChild`'s
   `applyInputData` effect depends on the whole `paymentInput` object
   (faithfully mirroring Angular's `ngOnChanges`, which also fires on *any*
   `@Input` change) — so it was re-firing on every parent re-render,
   including ones triggered by its own callbacks on every keystroke, with
   the effect's currency-sync branch causing child state updates that
   triggered more parent re-renders. **Fixed** with `useMemo` on both,
   keyed to their real dependencies.
2. **Stale closure in `onAmountChange`**: had an empty dependency array but
   called `validateHardcap` (itself a `useCallback` with real dependencies)
   — permanently capturing the *first-render* version, which also read a
   `hardcapAmountObjectReceivedFromChild` state value that's async/batched
   in React (unlike the synchronous instance-property write in the Angular
   original). **Fixed**: `validateHardcap` now reads the amount straight
   from its own argument (equivalent to the Angular behavior, no timing
   gap), and `onAmountChange` correctly depends on `validateHardcap`.
3. **Dual-blind-key setup wasn't re-triggering for a second checker
   payload**: was a separate effect keyed on `[isCheckerMode,
   isDualBlindKeyEnabled]`, which don't change between two different
   checker records in the same mode — so a second payload's dual-blind-key
   original values were never (re)stored. It also read stale `formValues`
   state rather than the freshly-arriving model. **Fixed**: the setup now
   runs directly inside the `applyInputData` effect, on every new payload,
   using the fresh model data.
4. **Backend error responses were silently treated as success**: both
   `onApprove` and `submitPaymentToBackend` used raw `fetch()`, which only
   rejects on network failure — not on 4xx/5xx HTTP status codes. Angular's
   `HttpClient` (what the original was written against) throws for any
   non-2xx response by default. **Fixed**: added a `postJson()` helper that
   checks `response.ok` and throws in the same `{ error: body }` shape the
   existing `err.error.error` reads already expect.
5. **Repair mode had no way to submit anything**: the captured HTML only
   showed the action-bar for `selectedMode === 'maker'`; no repair-specific
   action block was ever photographed, so repair mode was a dead end.
   **Fixed**: the submit button now also shows for `selectedMode ===
   'repair'` (labeled "Resubmit Payment"), documented as a firm decision
   since a repair is fundamentally a corrected maker submission through the
   same endpoint.
6. **Every sub-section chevron was inverted**: `payment-flow.css` had a
   leftover `transform: rotate(180deg)` rule from an earlier single-icon
   accordion design, applied unconditionally on top of JSX that already
   swaps between two different ▴/▾ characters based on state — so every
   chevron showed the opposite of its real open/closed state. **Fixed**:
   removed the dead rotation CSS. Also found and fixed a missing
   `creditorAddress` key in the initial `sectionCollapsed` state object
   (worked by accident via `undefined`-is-falsy, but was inconsistent with
   every other section).

Worth treating this list as a reminder that "compiles clean" and "behaves
correctly" are different bars — every one of these needed either tracing
render/effect behavior by hand or actually clicking through a live running
instance to find.

## Files
```
src/types/models.ts          Pain001Model, PaymentComponentInput/Output, FormFieldConfig, etc.
src/types/verbiages.ts       DEFAULT_VERBIAGES (child's own default text map)
src/utils/paymentUtils.ts    splitMultiline, buildPain001FromForm, parseCommaSeparated,
                              + reconstructed payment-details.util equivalents
src/services/hardcapService.ts     verifyHardCap()
src/services/addressService.ts     lookupDebtorAddesss / lookupCreditorAddesss (typos preserved)
src/services/genericValidator.ts   evaluation engine + a documented, opinionated rule set
src/components/PaymentChild.tsx    the payment form itself (SSPaymentMakerComponent port)
src/components/PaymentParent.tsx   Maker/Checker/Repair host (PaymentParentComponent port),
                                    including ParentSectionPreview (see decisions below)
src/components/payment-flow.css    white surfaces, blue accordion headers, bordered inputs,
                                    grey placeholders — matches the approved chat preview
```

## What's faithful (photographed, not reconstructed)
- All child component state, getters, and methods: form building,
  `payloadPreperation`, hardcap validation, the **three** separate live
  paths touching `instructedAmount`, dual-blind-key logic, address
  auto-lookup (with the real `lookupDebtorAddesss`/`lookupCreditorAddesss`/
  `dcreditorTownName` typos), BIC → country-code auto-fill, section-collapse
  state, `emitOutput`.
- All parent component state and methods: mode-loading, `payloadPreperation`
  (including its two copy-paste bugs), `onApprove`/`onReject`/
  `submitPaymentToBackend` payload shapes, the parent's own independent
  `validateHardcap`, `onFormValidityChange`/`onParentFormValidityChange`.
- Every field name, label, and error-message fallback captured directly
  from the Angular source for every section of the form.
- Dead/commented-out Angular code is deliberately omitted, per the standing
  "skip dead code, preserve everything live exactly" instruction.

## Decisions made (previously open flags — now resolved, not questions)
The full capture is done; nothing more is coming. Each of these was a real
gap or ambiguity in what was photographed, closed here with engineering
judgment. Revisit any of them freely — they're documented precisely so you
can find and change them, not because they're uncertain guesses to re-verify.

1. **`(paymentOutput)` binding**: the captured parent HTML showed only
   `(amountChange)`/`(formValidityChange)` wired to `<ss-payment-flow>`, not
   `(paymentOutput)` — but `onPaymentOutput()` is fully implemented and the
   app cannot function without it firing. **Decided: wired.**
2. **`isCheckerMode`/`isRepairMode`**: never bound from parent to child in
   the real Angular app at all (only the hardcoded `isMakerMode='Maker'`
   string was). **Decided: this port derives both from `selectedMode`**
   instead — the one deliberate deviation from literal 1:1, made because the
   literal wiring would mean Checker/Repair mode never engage any
   mode-specific behavior in the child at all.
3. **Dynamic validation rules** (`genericValidator.ts`): the real
   `Pain001ValidationRules` definitions were never captured, only their
   shapes. **Decided: a small, explicitly-commented rule set** — 2nd
   intermediary bank block visible only once the 1st is filled; charges
   amount/BIC required only under `DEBT`/`SHAR` charge bearer; sort-code
   fields required based on resolved country code. Each rule is flagged
   in-code as a judgment call, not a verified business rule.
4. **`ParentSectionComponent` (`app-parent-section`)**: never captured at
   all. **Decided: `ParentSectionPreview`** (inside `PaymentParent.tsx`) is a
   from-scratch reconstruction — renders `modifiedHeading` and a read-only
   `checkerDataFromParent` panel (security ID / event type / ISS code /
   value date) for checker/repair modes, and fires
   `onParentFormValidityChange` with `isValid: true` on mount/change
   (its real trigger condition was never observed).
5. **`payment-details.util.ts` equivalents** (`buildPain001ModelFromDetails`,
   `populatePaymentDetailsFromSource`, `formatDateForInput`): never
   photographed; reconstructed from call sites and field shapes.
6. **Second intermediary bank block + Additional/Charge/Remittance
   markup**: the photographed `.html` cut off partway through the first
   intermediary bank field. Rendered using the confirmed field list (from
   the parent's `fieldConfig[]`) and the same field pattern documented for
   every confirmed section.
7. **Angular Reactive Forms validity**: approximated as "all non-hidden
   mandatory fields non-empty" rather than a full per-control `Validators`
   replication.
8. **Two copy-paste bugs** in parent's `payloadPreperation` (bank
   country-code fields), the **modal-state string reset** bug in
   `closeModelPopUp`/`hideModelAfter3Seconds`, the **duplicate hardcap
   validation calls** (parent + child both call the service), and the
   **synchronous `isProcessing` reset** before the async approve/reject
   call resolves — all preserved exactly as bugs, not fixed, since a
   faithful port was the explicit priority throughout.
9. **Repair mode had no submit button at all**: the captured HTML only
   showed the action-bar for `selectedMode === 'maker'` — no repair-specific
   action block was ever photographed. Left as literally captured, repair
   mode would have no way to resubmit. **Decided: the same submit button
   now also shows for `selectedMode === 'repair'`** (labeled "Resubmit
   Payment"), since a repair is fundamentally a corrected maker submission
   through the same endpoint. Revisit if the real app has a distinct
   repair-submit flow.

## What still needs YOU (not more source — actual runtime/integration work)
- **Compile it inside your real GAB project** against the actual
  `@citi-icg-179025/payment-flow-ui-lib` types, `AuthService`,
  `DataSharingService`, etc. — the `tsc --noEmit` check above only proves
  the files are internally consistent, not that they match your real
  project's contracts.
- **Confirm the `genericValidator.ts` rule set** (decision #3) against actual
  business requirements — it's a reasonable default, not verified logic.
- **Wire the real checker/repair queue entry point** — `PaymentParent`
  exposes `initialCheckerPayload`/`initialRepairPayload` props as the hook
  point; connect these from wherever your routing/queue-list component
  lives (never captured in this exercise).
- **Visual QA against the live Angular app** — `payment-flow.css` is
  functional, not a port of the real (and internally inconsistent) 503-line
  `.scss`.
- `hardcapService.ts`'s endpoint path (`/api/hardcap/verify`) was not
  independently re-confirmed — verify against the real `hardcap.service.ts`.

## Wiring notes
- `PaymentParent` needs a `currentUser` prop (replaces `AuthService.getUser()`)
  and reads `REACT_APP_API_URL` off `globalThis.process.env` if present
  (replaces Angular's `environment.apiUrl`) — adjust to your actual
  env-var convention if different.
