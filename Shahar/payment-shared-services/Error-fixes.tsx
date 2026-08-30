Option 2: Pre-compute the label above return
Above your component's return ( statement, define:



const rejectButtonLabel = isSubmitting
  ? 'Processing...'
  : checkerFailedFields.length > 0
  ? `Reject (${checkerFailedFields.length} Flagged)`
  : 'Reject';


  <button
  type="button"
  className="btn-reject"
  disabled={isCheckerRejectDisabled}
  onClick={() => handleCheckerDecision('Rejected')}
>
  {rejectButtonLabel}
</button>