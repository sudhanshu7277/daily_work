//Step 1: Update handleDoubleClickFailedField in SSPaymentFlow.tsx 
// (Lines 699–717)Replace lines 699–717 (from image_42.png and image_43.png) with this code: 

const handleDoubleClickFailedField = (fieldName: string, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (!isChecker) return;

    // 1. Dual-blind rekey fields cannot be flagged
    if (
      isDualBlindEnabled &&
      (paymentInput?.dualBlindKeyFields?.includes(fieldName) || fieldName === 'instructedAmount')
    ) {
      return;
    }

    // 2. Non-mandatory rule: Mandatory fields cannot be flagged
    const fieldCfg = configMap.get(fieldName);
    const isMandatory =
      (PAIN001_MANDATORY_FIELDS as readonly string[])?.includes(fieldName) ||
      Boolean(fieldCfg?.mandatory || (fieldCfg as any)?.required);

    if (isMandatory) return;

    // 3. Toggle in failedFields
    setFailedFields((prev) => {
      const exists = prev.includes(fieldName);
      const next = exists
        ? prev.filter((f) => f !== fieldName)
        : [...prev, fieldName];

      onFailedFieldListChange?.(next);
      return next;
    });
  };


  //Step 2: Update renderField JSX in SSPaymentFlow.tsx 
  // (Lines 865–945)Scroll to lines 865–945 (from image_50.png, image_51.png, 
  // and image_52.png).   Replace that block with:

  return (
    <div
      key={fieldName as string}
      className={containerClass}
      onDoubleClick={(e) => handleDoubleClickFailedField(fieldName as string, e)}
      title={
        isChecker && !hasDualBlindErr
          ? "Double click to flag/unflag incorrect field"
          : undefined
      }
    >
      <label
        htmlFor={fieldName as string}
        className={labelClass}
        onDoubleClick={(e) =>
          handleDoubleClickFailedField(fieldName as string, e)
        }
      >
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
          disabled={isReadonly}
          className={`${hasInputError ? "input-error" : ""} ${isFailed ? "field-failed-border" : ""}`.trim()}
          style={{
            pointerEvents: isChecker ? "all" : undefined,
            cursor: isChecker ? "pointer" : undefined,
            ...(isFailed ? { borderColor: "#dc3545", backgroundColor: "#fff5f5" } : {}),
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleDoubleClickFailedField(fieldName as string, e);
          }}
          title={isChecker && !hasDualBlindErr ? "Double click to flag/unflag incorrect field" : undefined}
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
          readOnly={isReadonly}
          className={`${hasInputError ? "input-error" : ""} ${isFailed ? "field-failed-border" : ""}`.trim()}
          style={isFailed ? { borderColor: "#dc3545", backgroundColor: "#fff5f5" } : undefined}
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleDoubleClickFailedField(fieldName as string, e);
          }}
          title={isChecker && !hasDualBlindErr ? "Double click to flag/unflag incorrect field" : undefined}
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
          readOnly={isReadonly}
          min={opts.minDate}
          className={`${hasInputError ? "input-error" : ""} ${isFailed ? "field-failed-border" : ""}`.trim()}
          style={isFailed ? { borderColor: "#dc3545", backgroundColor: "#fff5f5" } : undefined}
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleDoubleClickFailedField(fieldName as string, e);
          }}
          title={isChecker && !hasDualBlindErr ? "Double click to flag/unflag incorrect field" : undefined}
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


  //Step 3: Add CSS in src/styles/index.css (Line 11)In 
  // projects/payment-flow-ui-lib/src/styles/index.css:   

  .field-failed-border,
.failed-field input,
.failed-field select,
.failed-field textarea,
.form-field.failed-field input,
.form-field.failed-field select,
.form-field.failed-field textarea {
  border: 1.5px solid #dc3545 !important;
  background-color: #fff5f5 !important;
  box-shadow: 0 0 0 1px #dc3545 !important;
  color: #dc3545 !important;
}

//Step 4: Verify PaymentParent.tsx Binding (Line 1016)
//Ensure PaymentParent.tsx receives the field updates:

<SSPaymentFlow
  key={`${activeTab}-${initialData?.accountId || initialData?.paymentId || 'new'}`}
  paymentInput={dynamicPaymentInput}
  fieldConfig={dynamicFieldConfig as any}
  isCheckerMode={activeTab === 'checker'}
  onFailedFieldListChange={(flaggedList: string[]) => {
    setCheckerFailedFields(flaggedList);
  }}
  // ... other props
/>



