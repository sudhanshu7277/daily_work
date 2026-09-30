//Step 1: Update handleDoubleClickFailedField (Lines 553–563 in image_44.png)
// In SSPaymentFlow.tsx, update lines 553–563 to ensure it only 
// activates in Checker mode for non-dual-blind fields, toggles 
// the item in failedFields, and notifies the parent (onFailedFieldListChange):


const handleDoubleClickFailedField = (fieldName: string, e: MouseEvent) => {
    e.stopPropagation();
    
    // Only allowed in Checker mode
    if (!isChecker) return;

    // Do NOT allow flagging dual blind rekey fields (those must be retyped and matched)
    if (isDualBlindEnabled && paymentInput?.dualBlindKeyFields?.includes(fieldName)) {
      return;
    }

    setFailedFields((prev) => {
      const exists = prev.includes(fieldName);
      const next = exists ? prev.filter((f) => f !== fieldName) : [...prev, fieldName];
      
      // Notify parent component so CheckerFailedFields stays synchronized
      onFailedFieldListChange?.(next);
      return next;
    });
  };


  //Step 2: Ensure Double Click Fires on Disabled Elements (renderField)
// In HTML/React, when an <input disabled> is inside a container,
//  browsers often block mouse events from bubbling up.

// In renderField (lines 678–680 in image_49.png), ensure the wrapper div 
// captures the double click and has userSelect: 'none' so rapid clicking 
// does not highlight text:


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



      //Step 3: Add CSS / SCSS for .failed-fieldIn your stylesheet (e.g. index.css or component SCSS):   


      .form-field.failed-field,
.field-invalid.failed-field {
  background-color: #ffebee !important; // Light red container background
  border: 1px solid #d32f2f !important;
  border-radius: 4px;
  padding: 4px 6px;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  label,
  .field-label {
    color: #c62828 !important; // Dark red label
    font-weight: 600;
  }

  input,
  select,
  textarea {
    background-color: #ffcdd2 !important; // Visible soft-red input background
    border-color: #ef5350 !important;
    color: #b71c1c !important;
    cursor: pointer; // Indicates interactivity despite being readonly/disabled
  }

  // Allow mouse events to bubble through disabled inputs so dblclick always triggers
  input:disabled,
  select:disabled,
  textarea:disabled {
    pointer-events: none; // Allows container onDoubleClick to trigger reliably!
  }
}



// Step 4: Parent Output Synchronization
//In lines 590–606 (image_46.png), verify that failedFields is forwarded via 
//onPaymentOutput or onFormValidityChange


onFormValidityChange?.({
        validForm: isFormValid,
        failedFields, // Array of flagged field names
        makerPayload: formValues as unknown as Record<string, unknown>,
      });


      //And in PaymentParent.tsx, your existing onFailedFieldListChange prop
      // (line 862 in image_14.png

        onFailedFieldListChange={activeTab === 'checker' ? setCheckerFailedFields : undefined}




