//1. src/app/components/additional-details-section/additional-details-section.component.tsUpdate
//  ALPHA_NUMERIC_SLASH_CHAR_REGEX and ALPHA_NUMERIC_SLASH_DISALLOWED_REGEX to match 
// C2_CHARACTER_SET (by adding , or importing C2_MASK_PATTERNS / C2_CHARACTER_SET directly 
// from address-field.validators.ts):   Option A — Reuse C2_MASK_PATTERNS directly f
// rom address-field.validators.ts (Single Source of Truth):   


import {
  C2_MASK_PATTERNS,
  DESCRIPTION_MAX_LENGTH,
  SITE_COMPARTMENT_MAX_LENGTH,
  BUILDING_MAX_LENGTH,
  FLOOR_MAX_LENGTH,
} from '../../core/validators/address-field.validators';


//Then inside AdditionalDetailsSectionComponent:

private static readonly C2_CHAR_REGEX = C2_MASK_PATTERNS.C.pattern;
private static readonly C2_DISALLOWED_REGEX = new RegExp(
  `[^${C2_MASK_PATTERNS.C.pattern.source.slice(1, -1)}]`,
  'g',
);

onAlphaNumericSlashKeydown(event: KeyboardEvent): void {
  const key = event.key;

  if (event.ctrlKey || event.metaKey || key.length > 1) return;

  if (!AdditionalDetailsSectionComponent.C2_CHAR_REGEX.test(key)) {
    event.preventDefault();
  }
}

onAlphaNumericSlashInput(event: Event, controlName: string): void {
  const input = event.target as HTMLInputElement;
  const sanitized = input.value.replace(
    AdditionalDetailsSectionComponent.C2_DISALLOWED_REGEX,
    '',
  );
  if (sanitized !== input.value) {
    input.value = sanitized;
    this.parentForm?.get(controlName)?.setValue(sanitized);
  }
}

