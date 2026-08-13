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



  /// latest changes


  // replace 
  const placeholder = opts.placeholder ?? `Enter ${defaultLabel.toLowerCase()}`;

  // with
  const fieldCfg = configMap.get(fieldName);
    const effectiveOptions = fieldCfg?.options ?? opts.options;
    const effectiveType = fieldCfg?.type ?? opts.type;
    const placeholder = fieldCfg?.placeholder ?? opts.placeholder ?? `Enter ${defaultLabel.toLowerCase()}`;


// replace 
{opts.options ? (

    // with
    {effectiveOptions ? (

// replace

{opts.options.map((opt) => (

// with

{effectiveOptions.map((opt) => (


    // replace 
) : opts.type === 'textarea' ? (

    // with

) : effectiveType === 'textarea' ? (

    // replace
    type={opts.type ?? 'text'}

    // with
    type={effectiveType ?? 'text'}



    // payment-flow.css

    .form-field input[type="date"] {
        -webkit-appearance: auto !important;
        appearance: auto !important;
        color-scheme: light;
        min-height: 32px;
        cursor: pointer;
      }
      
      .form-field input[type="date"]::-webkit-calendar-picker-indicator {
        display: inline-block !important;
        opacity: 1 !important;
        cursor: pointer;
        filter: none;
      }
      
      .form-field input[type="date"]::-webkit-inner-spin-button,
      .form-field input[type="date"]::-webkit-clear-button {
        display: inline-block;
      }


      // In PaymentParent.tsx, onFormValidityChange should read:

      const onFormValidityChange = useCallback((validFormPayload: { validForm: boolean; makerPayload: Record<string, any> }) => {
        console.log('maker form validity and payload received in parent component: ', validFormPayload);
        setIsFormValid(validFormPayload.validForm);
        setParentDetailsFormValues(validFormPayload.makerPayload);
      }, []);


      // — i.e., no setEnableSubmitButton(true) call in this function at all.

//onPaymentOutput is the only place that touches enableSubmitButton, unchanged:

const onPaymentOutput = useCallback((output: PaymentComponentOutput) => {
    payloadPreperation(output.paymentData);
    setEnableSubmitButton(output.isValid);
    setIsDualBlindKeyPassed(output.isDualBlindKeyPassed);
    if (!output.isValid) {
      console.log('Submit button disabled — payment form is not valid. Output message:', output.outputMessage || 'mandatory fields missing');
    }
  }, [payloadPreperation]);


  // The button itself, unchanged, already correctly gated:

  disabled={!enableSubmitButton}

  
