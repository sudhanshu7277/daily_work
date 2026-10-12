//1. Changes in PaymentParent.tsx
//Change 1.1: Fix the state variable declaration (Line 200)
// Find line 200:

const [_, setCheckerDualBlindPassed] = useState<boolean>(false);

/// Change it to:

const [checkerDualBlindPassed, setCheckerDualBlindPassed] = useState<boolean>(false);

//Change 1.2: Stop clearing manual flags in handlePaymentOutput
//  (Lines 601–605)Find lines 601–605:   

const isManualPassed = failed.length === 0;
const isPassed = isManualPassed || Boolean(newDualBlind);
setCheckerDualBlindPassed(isPassed);
setCheckerFailedFields(failed);


//Replace those lines with:

const isManualPassed = failed.length === 0;
const isPassed = isManualPassed && Boolean(newDualBlind);
setCheckerDualBlindPassed(isPassed);
// Line 604 removal: Do NOT call setCheckerFailedFields(failed) here.
// Dual-blind status is tracked by checkerDualBlindPassed.
// checkerFailedFields tracks manually flagged fields via onFailedFieldListChange.


//Change 1.3: Update isCheckerApproveDisabled (Lines 964–967)
///Find lines 964–967:

const isCheckerApproveDisabled =
  isSubmitting ||
  checkerFailedFields.length > 0;
const isCheckerRejectDisabled = isSubmitting;


//Replace those lines with:

const isCheckerApproveDisabled =
  isSubmitting ||
  !isCurrentFormValid ||
  !checkerDualBlindPassed ||
  checkerFailedFields.length > 0;
const isCheckerRejectDisabled = isSubmitting;


//Change 1.4: Pass flaggedFields to SSPaymentFlow (Around line 1004)Find lines 1005–1007:   

onFailedFieldListChange={(fields: string[]) => {
    setCheckerFailedFields(fields);
  }}


  //Add flaggedFields={checkerFailedFields} right above it:

  flaggedFields={checkerFailedFields}
onFailedFieldListChange={(fields: string[]) => {
  setCheckerFailedFields(fields);
}}


//2. Changes in SSPaymentFlow.tsx
//Change 2.1: Keep the component props in sync with parent state
// Near line 187 where failedFields is declared, 
// add an effect to synchronize when the parent updates:

const [failedFields, setFailedFields] = useState<string[]>(
    () => (props as any)?.flaggedFields ?? (paymentInput as any)?.rejectedFieldList ?? []
  );
  
  useEffect(() => {
    if ((props as any)?.flaggedFields !== undefined) {
      setFailedFields((props as any).flaggedFields);
    }
  }, [(props as any)?.flaggedFields]);


  //Change 2.2: Ensure handleDoubleClickFailedField matches 
  // (Lines 699–722)Verify lines 699–722 match this implementation:   

  const handleDoubleClickFailedField = (fieldName: string, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (!isChecker) return;
  
    // Only dual-blind rekey fields cannot be flagged
    if (
      isDualBlindEnabled &&
      (paymentInput?.dualBlindKeyFields?.includes(fieldName) || fieldName === 'instructedAmount')
    ) {
      return;
    }
  
    setFailedFields((prev) => {
      const exists = prev.includes(fieldName);
      const next = exists
        ? prev.filter((f) => f !== fieldName)
        : [...prev, fieldName];
  
      onFailedFieldListChange?.(next);
      return next;
    });
  };


  //Change 2.3: Update renderField return block (Lines 873–965)In
  //  renderField, remove all inner onDoubleClick handlers and e.stopPropagation() 
  // calls from the child inputs/selects/textareas. Attach onDoubleClick 
  // strictly to the outer container <div>.   Apply pointerEvents:
  //  canBeFlagged ? "none" : undefined to the inner inputs when 
  // flagged to prevent the browser from highlighting text or swallowing double clicks:  
  
  
  const isDualBlindKey =
      isDualBlindEnabled &&
      (paymentInput?.dualBlindKeyFields?.includes(fieldName as string) ||
        fieldName === 'instructedAmount');

    const canBeFlagged = isChecker && !isDualBlindKey;

    return (
      <div
        key={fieldName as string}
        className={`${containerClass} ${isFailed ? "failed-field" : ""}`.trim()}
        onDoubleClick={(e) => {
          if (canBeFlagged) {
            handleDoubleClickFailedField(fieldName as string, e);
          }
        }}
        style={{
          cursor: canBeFlagged ? "pointer" : undefined,
          userSelect: canBeFlagged ? "none" : undefined,
        }}
        title={canBeFlagged ? "Double click to flag/unflag incorrect field" : undefined}
      >
        <label htmlFor={fieldName as string} className={labelClass}>
          {resolvedLabel}
          {showMandatoryIndicator && (
            <span className="mandatory-indicator">*</span>
          )}
        </label>

        {opts.options ? (
          <select
            id={fieldName as string}
            name={fieldName as string}
            value={value}
            disabled={isExplicitlyDisabled || isReadonly}
            className={`${hasInputError ? "input-error" : ""} ${isFailed ? "field-failed-border" : ""}`.trim()}
            style={{
              pointerEvents: canBeFlagged ? "none" : undefined,
              ...(isFailed ? { borderColor: "#dc3545", backgroundColor: "#fff5f5", color: "#dc3545" } : {}),
            }}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setField(fieldName, e.target.value)
            }
            onBlur={() => setTouched((t) => ({ ...t, [fieldName]: true }))}
          >
            <option value="">
              {opts.placeholder || `-- Select ${resolvedLabel} --`}
            </option>
            {opts.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : opts.type === "textarea" ? (
          <textarea
            id={fieldName as string}
            name={fieldName as string}
            value={value}
            rows={3}
            disabled={isExplicitlyDisabled}
            readOnly={isReadonly}
            className={`${hasInputError ? "input-error" : ""} ${isFailed ? "field-failed-border" : ""}`.trim()}
            style={{
              pointerEvents: canBeFlagged ? "none" : undefined,
              ...(isFailed
                ? {
                    borderColor: "#dc3545 !important",
                    backgroundColor: "#fff5f5 !important",
                    boxShadow: "0 0 0 1px #dc3545",
                    color: "#dc3545",
                  }
                : {}),
            }}
            maxLength={opts.maxLength || rule?.maxLength}
            placeholder={opts.placeholder || `Enter ${resolvedLabel}`}
            onChange={handleTextChange}
            onBlur={() => {
              setTouched((t) => ({ ...t, [fieldName]: true }));
              validateSingleDualBlindKeyField(fieldName as string);
            }}
          />
        ) : (
          <input
            id={fieldName as string}
            name={fieldName as string}
            type={opts.type || "text"}
            value={value}
            disabled={isExplicitlyDisabled}
            readOnly={isReadonly}
            min={opts.minDate}
            className={`${hasInputError ? "input-error" : ""} ${isFailed ? "field-failed-border" : ""}`.trim()}
            style={{
              pointerEvents: canBeFlagged ? "none" : undefined,
              ...(isFailed
                ? {
                    borderColor: "#dc3545 !important",
                    backgroundColor: "#fff5f5 !important",
                    boxShadow: "0 0 0 1px #dc3545",
                    color: "#dc3545",
                  }
                : {}),
            }}
            maxLength={opts.maxLength || rule?.maxLength}
            placeholder={opts.placeholder || `Enter ${resolvedLabel}`}
            onChange={handleTextChange}
            onBlur={() => {
              setTouched((t) => ({ ...t, [fieldName]: true }));
              validateSingleDualBlindKeyField(fieldName as string);
            }}
          />
        )}

        {hasDualBlindErr && (
          <div className="field-error dual-blind-error">
            {dualBlindErrors.get(fieldName as string)}
          </div>
        )}
        {isRequiredMissing && (
          <div className="field-error">
            {opts.errorFallback || `${resolvedLabel} is required`}
          </div>
        )}
        {isPatternInvalid && (
          <div className="field-error">
            {rule?.patternMessage || "Invalid format"}
          </div>
        )}
      </div>
    );


    //3. Changes in index.css
// Ensure read-only styling is properly overridden by adding this to index.css:


.form-field.failed-field input,
.form-field.failed-field select,
.form-field.failed-field textarea,
input.field-failed-border,
select.field-failed-border,
textarea.field-failed-border {
  border: 1.5px solid #dc3545 !important;
  background-color: #fff5f5 !important;
  box-shadow: 0 0 0 1px #dc3545 !important;
  color: #dc3545 !important;
}

