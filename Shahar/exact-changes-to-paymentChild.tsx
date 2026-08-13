// types/models.ts

//Add one field to FormFieldConfig, right after type?: ...:

placeholder?: string;


// components/PaymentChild.tsx

//Change 1 — inside renderField, replace the placeholder line with config-resolution logic:

// Find:

const dualBlind = opts.isDualBlind ?? isDualBlindKeyField(fieldName);
    const placeholder = opts.placeholder ?? `Enter ${defaultLabel.toLowerCase()}`;

    // Replace with:

    const dualBlind = opts.isDualBlind ?? isDualBlindKeyField(fieldName);
    const fieldCfg = configMap.get(fieldName);
    const effectiveOptions = fieldCfg?.options ?? opts.options;
    const effectiveType = fieldCfg?.type ?? opts.type;
    const placeholder = fieldCfg?.placeholder ?? opts.placeholder ?? `Enter ${defaultLabel.toLowerCase()}`;


    // Change 2 — in the render branch, swap 4 occurrences of opts.options/opts.type for the resolved versions:

    {effectiveOptions ? (          // was: {opts.options ? (
        ...
        {effectiveOptions.map((opt) => (   // was: {opts.options.map((opt) => (
        ...
      ) : effectiveType === 'textarea' ? (   // was: ) : opts.type === 'textarea' ? (
        ...
        type={effectiveType ?? 'text'}   // was: type={opts.type ?? 'text'}


        // Change 3 — remove the now-redundant inline overrides on the two call sites (config drives them now):

        {renderField('requestedExecutionDate', pacsFormVerbiages.ValueDate, { errorFallback: pacsFormVerbiages.ValueDateIsRequired })}

{renderField('painPaymentMethodType', pacsFormVerbiages.PaymentType, { errorFallback: pacsFormVerbiages.PaymentTypeIsRequired, options: PAYMENT_TYPE_OPTIONS })}


// components/PaymentParent.tsx

//In PARENT_FIELD_CONFIG, update these two entries:

{ fieldName: 'requestedExecutionDate', label: 'Value Date', hidden: false, required: true, type: 'date' },
  ...
  { fieldName: 'painPaymentMethodType', label: 'Payment Type (CBT, BKT, DFT)', hidden: false, required: false, options: ['CBT', 'BKT', 'DFT'], placeholder: '-- Select --' },


  



