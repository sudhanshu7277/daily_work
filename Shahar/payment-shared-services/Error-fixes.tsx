//Step 1: Update handleDoubleClickFailedField in 
// SSPaymentFlow.tsxLocate handleDoubleClickFailedField 
// (around lines 699–717). Replace it with:   


const handleDoubleClickFailedField = (fieldName: string, e?: any) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }

    // 1. Only checker mode can flag fields
    if (!isChecker) return;

    // 2. Dual-blind rekey fields CANNOT be flagged (checker must re-enter these)
    const isDualBlind =
      isDualBlindEnabled &&
      ((paymentInput as any)?.dualBlindKeyFields?.includes(fieldName) ||
        fieldName === 'instructedAmount');

    if (isDualBlind) return;

    // 3. Toggle in failedFields list
    setFailedFields((prev) => {
      const exists = prev.includes(fieldName);
      const next = exists
        ? prev.filter((f) => f !== fieldName)
        : [...prev, fieldName];

      // Notify parent component immediately
      onFailedFieldListChange?.(next);
      return next;
    });
  };


  //Step 2: Update renderField in SSPaymentFlow.tsx 
  // (Lines 865–945)Replace the JSX return block of 
  // renderField (from image_54.png, image_55.png, and image_56.png)
  //  with this code.   Notice the following enhancements:

  const isDualBlindKey =
      isDualBlindEnabled &&
      ((paymentInput as any)?.dualBlindKeyFields?.includes(fieldName as string) ||
        fieldName === 'instructedAmount');

    const canBeFlagged = isChecker && !isDualBlindKey;

    return (
      <div
        key={fieldName as string}
        className={containerClass}
        onDoubleClick={(e) => {
          if (canBeFlagged) {
            handleDoubleClickFailedField(fieldName as string, e);
          }
        }}
        title={canBeFlagged ? "Double click to flag/unflag incorrect field" : undefined}
      >
        <label
          htmlFor={fieldName as string}
          className={labelClass}
          style={{ cursor: canBeFlagged ? "pointer" : undefined, userSelect: "none" }}
          onDoubleClick={(e) => {
            if (canBeFlagged) {
              handleDoubleClickFailedField(fieldName as string, e);
            }
          }}
        >
          {resolvedLabel}
          {showMandatoryIndicator && (
            <span className="mandatory-indicator">*</span>
          )}
        </label>

        {opts.options ? (
          <div
            style={{ position: "relative", width: "100%", display: "block" }}
            onDoubleClick={(e) => {
              if (canBeFlagged) {
                handleDoubleClickFailedField(fieldName as string, e);
              }
            }}
          >
            <select
              id={fieldName as string}
              name={fieldName as string}
              value={value}
              disabled={isReadonly}
              className={`${hasInputError ? "input-error" : ""} ${isFailed ? "field-failed-border" : ""}`.trim()}
              style={{
                width: "100%",
                ...(isFailed
                  ? {
                      borderColor: "#dc3545",
                      backgroundColor: "#fff5f5",
                      color: "#dc3545",
                    }
                  : {}),
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

            {/* Click shield for disabled select in Checker mode */}
            {canBeFlagged && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  cursor: "pointer",
                  zIndex: 2,
                }}
                onDoubleClick={(e) => {
                  handleDoubleClickFailedField(fieldName as string, e);
                }}
                title="Double click to flag/unflag incorrect field"
              />
            )}
          </div>
        ) : opts.type === "textarea" ? (
          <textarea
            id={fieldName as string}
            name={fieldName as string}
            value={value}
            rows={3}
            readOnly={isReadonly}
            disabled={isExplicitlyDisabled}
            className={`${hasInputError ? "input-error" : ""} ${isFailed ? "field-failed-border" : ""}`.trim()}
            style={{
              cursor: canBeFlagged ? "pointer" : undefined,
              userSelect: canBeFlagged ? "none" : undefined,
              ...(isFailed
                ? {
                    borderColor: "#dc3545",
                    backgroundColor: "#fff5f5",
                    boxShadow: "0 0 0 1px #dc3545",
                    color: "#dc3545",
                  }
                : {}),
            }}
            onDoubleClick={(e) => {
              if (canBeFlagged) {
                handleDoubleClickFailedField(fieldName as string, e);
              }
            }}
            title={canBeFlagged ? "Double click to flag/unflag incorrect field" : undefined}
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
            disabled={isExplicitlyDisabled}
            min={opts.minDate}
            className={`${hasInputError ? "input-error" : ""} ${isFailed ? "field-failed-border" : ""}`.trim()}
            style={{
              cursor: canBeFlagged ? "pointer" : undefined,
              userSelect: canBeFlagged ? "none" : undefined,
              ...(isFailed
                ? {
                    borderColor: "#dc3545",
                    backgroundColor: "#fff5f5",
                    boxShadow: "0 0 0 1px #dc3545",
                    color: "#dc3545",
                  }
                : {}),
            }}
            onDoubleClick={(e) => {
              if (canBeFlagged) {
                handleDoubleClickFailedField(fieldName as string, e);
              }
            }}
            title={canBeFlagged ? "Double click to flag/unflag incorrect field" : undefined}
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


    //Step 3: Add CSS in src/styles/index.css
// Ensure the red border and light red background override native read-only styling:

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


//Step 4: Ensure PaymentParent.tsx Callback is Connected (Line 1042)
// In PaymentParent.tsx, keep line 1042 wired directly:

onFailedFieldListChange={(fields: string[]) => {
    setCheckerFailedFields(fields);
  }}