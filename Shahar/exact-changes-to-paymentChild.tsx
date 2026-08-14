const dynamicRequiredFields = useMemo(
  () => resolvedConfig
    .filter((cfg) => KNOWN_FIELDS.has(cfg.fieldName) && cfg.required && !PAIN001_MANDATORY_FIELDS.includes(cfg.fieldName))
    .map((cfg) => cfg.fieldName),
  [resolvedConfig],
);


// ADDED: any fieldConfig entry whose fieldName ISN'T already covered by a
  // hardcoded renderField() call elsewhere in this file — these render in a
  // new "Additional Fields" section at the end of the form. See KNOWN_FIELDS
  // above for the closed set this filters against.
  const dynamicFieldConfigs = useMemo(
    () => resolvedConfig.filter((cfg) => !KNOWN_FIELDS.has(cfg.fieldName)),
    [resolvedConfig],
  );