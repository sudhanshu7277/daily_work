//File 1: SSPaymentFlow.tsx
//1. Update Props Destructuring (Lines 36–52)
// Ensure onFailedFieldListChange is destructured from props:


export const SSPaymentFlow: FC<SSPaymentFlowProps> = ({
    paymentInput,
    fieldConfig = [],
    initialData,
    pacsFormVerbiages = {},
    isMakerMode,
    isCheckerMode,
    isRepairMode,
    repairReviewFieldList = [],
    repairNewlyModifyFieldList = [],
    hardcapResultReceived,
    onPaymentOutput,
    onFormChange,
    onFormValidityChange,
    onFailedFieldListChange, // <-- Ensure this is present
    onAmountChange,
  }) => {


    //2. Update handleDoubleClickFailedField (Around Lines 553–563)Replace
    //  handleDoubleClickFailedField so that:It only triggers in Checker mode. 
    //   Dual-blind rekey fields are protected from flagging (they must be
    //  retyped and matched).   Toggling a field updates local state and immediately
    //  calls onFailedFieldListChange with the updated array. 


    const handleDoubleClickFailedField = (fieldName: string, e: MouseEvent) => {
        e.stopPropagation();
    
        // Only enabled for Checker mode
        if (!isChecker) return;
    
        // Dual-blind rekey fields cannot be flagged — checker must rekey them
        if (isDualBlindEnabled && paymentInput?.dualBlindKeyFields?.includes(fieldName)) {
          return;
        }
    
        setFailedFields((prev) => {
          const exists = prev.includes(fieldName);
          const next = exists ? prev.filter((f) => f !== fieldName) : [...prev, fieldName];
          
          // Immediately notify parent component (PaymentParent)
          onFailedFieldListChange?.(next);
          return next;
        });
      };


      //3. Fix Lines 715–728 (useEffect Payload Dispatcher)
// Remove failedFields from onFormValidityChange to fix 
// TypeScript error ts(2353), dispatch it via onFailedFieldListChange,
//  and add the dependencies:


queueMicrotask(() => {
    onPaymentOutput?.(payload);
    onFormValidityChange?.({
      validForm: isFormValid,
      makerPayload: formValues as unknown as Record<string, unknown>,
    });
    onFailedFieldListChange?.(failedFields);
  });
}, [
  isFormValid,
  formValues,
  isDualBlindEnabled,
  isDualBlindPassed,
  onPaymentOutput,
  onFormValidityChange,
  onFailedFieldListChange,
  failedFields,
]);


//4. Ensure Wrapper Div Captures Double-Click (renderField, Lines 678–684)
// In renderField, ensure the wrapper div has the double-click handler and title tooltip:

return (
    <div
      key={fieldName as string}
      className={containerClass}
      onDoubleClick={(e) => handleDoubleClickFailedField(fieldName as string, e)}
      title={
        isChecker && !paymentInput?.dualBlindKeyFields?.includes(fieldName as string)
          ? 'Double click to flag/unflag incorrect field'
          : undefined
      }
    >
      <label
        htmlFor={fieldName as string}
        className={labelClass}
        onDoubleClick={(e) => handleDoubleClickFailedField(fieldName as string, e)}
      >
        {resolvedLabel}
        {showMandatoryIndicator && <span className="mandatory-indicator">*</span>}
      </label>



      //File 2: Stylesheet (index.css or component SCSS)
      // Add the red highlight styling for .failed-field. Using pointer-events: none on 
      disabled inputs ensures that double-clicking anywhere inside 
      the disabled box or label reliably bubbles up to trigger the container's onDoubleClick

      /* Flagged / Failed Fields in Checker Mode */
.form-field.failed-field,
.field-invalid.failed-field {
  background-color: #ffebee !important; /* Soft red container background */
  border: 1px solid #d32f2f !important;
  border-radius: 4px;
  padding: 4px 6px;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  label,
  .field-label {
    color: #c62828 !important; /* Prominent red text for the label */
    font-weight: 600;
  }

  input,
  select,
  textarea {
    background-color: #ffcdd2 !important; /* Soft red input background */
    border-color: #ef5350 !important;
    color: #b71c1c !important;
  }

  /* Allow dblclick to pass through disabled controls to the container handler */
  input:disabled,
  select:disabled,
  textarea:disabled {
    pointer-events: none;
  }
}