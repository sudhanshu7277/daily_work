//1. Replace the <select> section (Image 58, lines 897–927)
// Replace lines 897 to 927 with:

{opts.options ? (
    <div
      style={{ position: "relative", width: "100%", display: "block" }}
      onDoubleClick={(e) => {
        if (isChecker && !isDualBlindKey) {
          handleDoubleClickFailedField(fieldName as string, e);
        }
      }}
    >
      <select
        id={fieldName as string}
        name={fieldName as string}
        value={value}
        disabled={isExplicitlyDisabled || isReadonly}
        className={`${hasInputError ? "input-error" : ""} ${isFailed ? "field-failed-border" : ""}`.trim()}
        style={{
          width: "100%",
          ...(isFailed
            ? { borderColor: "#dc3545", backgroundColor: "#fff5f5", color: "#dc3545" }
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

      {/* Shield overlay so the disabled native select doesn't block the double-click event */}
      {isChecker && !isDualBlindKey && (
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
            e.preventDefault();
            e.stopPropagation();
            handleDoubleClickFailedField(fieldName as string, e);
          }}
          title="Double click to flag/unflag incorrect field"
        />
      )}
    </div>


//2. Replace the <textarea> section (Image 59 / 60, lines 928–951)
// Replace lines 928 to 951 with:

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
        userSelect: isChecker && !isDualBlindKey ? "none" : undefined,
        cursor: isChecker && !isDualBlindKey ? "pointer" : undefined,
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
        if (isChecker && !isDualBlindKey) {
          e.preventDefault();
          e.stopPropagation();
          handleDoubleClickFailedField(fieldName as string, e);
        }
      }}
      title={
        isChecker && !isDualBlindKey
          ? "Double click to flag/unflag incorrect field"
          : undefined
      }
      maxLength={opts.maxLength || rule?.maxLength}
      placeholder={opts.placeholder || `Enter ${resolvedLabel}`}
      onChange={handleTextChange}
      onBlur={() => {
        setTouched((t) => ({ ...t, [fieldName]: true }));
        validateSingleDualBlindKeyField(fieldName as string);
      }}
    />


    //3. Replace the <input> section (Image 60, lines 952–966)
//Replace lines 952 to 966 with:

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
        userSelect: isChecker && !isDualBlindKey ? "none" : undefined,
        cursor: isChecker && !isDualBlindKey ? "pointer" : undefined,
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
        if (isChecker && !isDualBlindKey) {
          e.preventDefault();
          e.stopPropagation();
          handleDoubleClickFailedField(fieldName as string, e);
        }
      }}
      title={
        isChecker && !isDualBlindKey
          ? "Double click to flag/unflag incorrect field"
          : undefined
      }
      maxLength={opts.maxLength || rule?.maxLength}
      placeholder={opts.placeholder || `Enter ${resolvedLabel}`}
      onChange={handleTextChange}
      onBlur={() => {
        setTouched((t) => ({ ...t, [fieldName]: true }));
        validateSingleDualBlindKeyField(fieldName as string);
      }}
    />
  )}


  //Variable Definition CheckIn renderField, 
  // directly above the return ( statement (around line 872):   

  const isDualBlindKey =
      isDualBlindEnabled &&
      ((paymentInput as any)?.dualBlindKeyFields?.includes(fieldName as string) ||
        fieldName === 'instructedAmount');