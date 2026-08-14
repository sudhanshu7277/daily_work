Fixed and verified — every field in PAIN001_MANDATORY_FIELDS now corresponds to an actual rendered input. Here are the exact changes, both simple renames:

types/models.ts — in PAIN001_MANDATORY_FIELDS, find:

ts
  'creditorAddressLines',

Replace with:

ts
  'creditorAddressLines1',

PaymentParent.tsx — in PARENT_FIELD_CONFIG, find:

ts
  { fieldName: 'creditorAddressLines', label: 'Creditor Address Line 1', hidden: false, required: true },

Replace with:

ts
  { fieldName: 'creditorAddressLines1', label: 'Creditor Address Line 1', hidden: false, required: true },

Why this was happening: creditorAddressLines (no suffix) was marked mandatory, but nothing in PaymentChild.tsx ever renders an input for that exact field — only creditorAddressLines1 and creditorAddressLines2 exist on screen. So that one field's value was permanently '', and the mandatoryOk check ([...PAIN001_MANDATORY_FIELDS, ...].every(f => formValues[f])) failed on it no matter what you filled in elsewhere. This wasn't related to the Additional Fields section at all — it was sitting in the original 12-field mandatory list the whole time.