// onChange={(val: unknown) => setField(key, typeof val === 'string' ? val : String(val || ''))}

isOptionalColumn(id: string): boolean {
  return !this.mandatoryColumnIds.includes(id);
}

// Then on line 33 in the HTML:

<mat-option [value]="opt.id"
  [disabled]="disableOptionsAndChips(opt.id)"
  [class.optional-column]="isOptionalColumn(opt.id)">
  {{ opt.label }}
</mat-option>

