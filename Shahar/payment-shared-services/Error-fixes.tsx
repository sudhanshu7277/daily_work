// Option 1: Inline ternary (Cleanest & standard JSX)

{isSubmitting
  ? 'Processing...'
  : checkerFailedFields.length > 0
  ? `Reject (${checkerFailedFields.length} Flagged)`
  : 'Reject'}