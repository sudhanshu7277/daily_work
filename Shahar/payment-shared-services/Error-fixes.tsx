//1. In PaymentParent.tsx, export TAX_DUAL_BLIND_REKEY_FIELDS
// Right beneath DUAL_BLIND_REKEY_FIELDS (around lines 114–125)

export const TAX_DUAL_BLIND_REKEY_FIELDS: string[] = [
    'taxIdNumber',
    'taxIdType',
    'purposeOfPayment',
    'taxPurposeCode',
    'regulatoryReportingCode',
    'invoiceReferenceNumber',
  ];


  //2. Update case 'checker' in dynamicPaymentInput (Lines 437–443 & Line 452)
// Locate lines 437–443 in

case 'checker':
        return {
          ...baseInput,
          paymentMode: 'checker',
          dualBlindKeyFlag: 'Y',
          dualBlindKeyFields: isNonUsPayment
            ? [...DUAL_BLIND_REKEY_FIELDS, ...TAX_DUAL_BLIND_REKEY_FIELDS] // 16 fields for non-US
            : DUAL_BLIND_REKEY_FIELDS,                                    // 10 fields for US
        };


        //And update the dependency array on line 452:   

    }, [activeTab, initialData, stableInitialPaymentModel, isNonUsPayment]);


    // 3. Update dynamicFieldConfig to make the 6 Tax Fields mandatory for Non-US
// Right below dynamicPaymentInput where dynamicFieldConfig is defined:

const dynamicFieldConfig = useMemo(() => {
    return PARENT_FIELD_CONFIG.map((field) => {
      if (isNonUsPayment && TAX_DUAL_BLIND_REKEY_FIELDS.includes(field.fieldName)) {
        return {
          ...field,
          required: true,
          hidden: false,
        };
      }
      return field;
    });
  }, [isNonUsPayment]);


  //4. In SSPaymentFlow.tsx, add blur validation and error display 
  // to the 6 Tax InputsIn the Tax Details section of SSPaymentFlow.tsx (around Section 8):   

  {[
    { key: 'taxIdNumber', label: 'Tax ID Number' },
    { key: 'taxIdType', label: 'Tax ID Type' },
    { key: 'purposeOfPayment', label: 'Purpose of Payment' },
    { key: 'taxPurposeCode', label: 'Tax Purpose Code' },
    { key: 'regulatoryReportingCode', label: 'Regulatory Reporting Code' },
    { key: 'invoiceReferenceNumber', label: 'Invoice / Reference Number' },
  ].map((item) => (
    <div key={item.key} className="form-group">
      <label>
        {item.label}
        {fieldConfigMap?.[item.key]?.required && <span className="mandatory">*</span>}
      </label>
      <input
        type="text"
        name={item.key}
        placeholder={`Enter ${item.label}`}
        value={(formValues as any)[item.key] ?? ''}
        onChange={(e) => setField(item.key, e.target.value)}
        onBlur={() => validateSingleDualBlindKeyField(item.key)}
      />
      {isChecker && dualBlindErrors?.has(item.key) && (
        <div className="field-error">{dualBlindErrors.get(item.key)}</div>
      )}
    </div>
  ))}







  // Step 1: Move isNonUsPayment Above Line 231 in PaymentParent.tsx
// Move the isNonUsPayment hook (from lines 404–413) 
// so it sits directly above dynamicFieldConfig (around line 230):

const isNonUsPayment = useMemo(() => {
    const raw = (stableInitialPaymentModel ?? initialData) as any;
    const bic = String(
      raw?.debtorAgentBIC ??
      raw?.paymentDetailsRequest?.debtorAgentBIC ??
      ''
    ).toUpperCase().trim();

    return bic.length > 0 && !bic.includes('US');
  }, [stableInitialPaymentModel, initialData]);




  //Step 2: Replace Lines 231–245 with the Dynamic Config
// Replace dynamicFieldConfig with:


const dynamicFieldConfig = useMemo(() => {
    const baseConfig = (PARENT_FIELD_CONFIG as FormFieldConfig[]) || [];

    // 10 base fields for US, 16 fields (10 + 6 tax) for Non-US
    const activeRekeyFields = isNonUsPayment
      ? [...DUAL_BLIND_REKEY_FIELDS, ...TAX_DUAL_BLIND_REKEY_FIELDS]
      : DUAL_BLIND_REKEY_FIELDS;

    if (activeTab === 'checker') {
      return baseConfig.map((cfg) => {
        const isRekeyField = activeRekeyFields.includes(cfg.fieldName);
        const isTaxField = TAX_DUAL_BLIND_REKEY_FIELDS.includes(cfg.fieldName);

        return {
          ...cfg,
          // If non-US payment, tax detail fields become mandatory and visible
          required: isNonUsPayment && isTaxField ? true : cfg.required,
          hidden: isNonUsPayment && isTaxField ? false : cfg.hidden,
          disabled: !isRekeyField,
        };
      });
    }

    // In Maker / Repair mode: if non-US, mark tax details required
    if (isNonUsPayment) {
      return baseConfig.map((cfg) => {
        if (TAX_DUAL_BLIND_REKEY_FIELDS.includes(cfg.fieldName)) {
          return {
            ...cfg,
            required: true,
            hidden: false,
          };
        }
        return cfg;
      });
    }

    return baseConfig;
  }, [activeTab, isNonUsPayment]);



  //Step 3: In dynamicPaymentInput (Lines 437–443 & 452)
// Ensure the checker mode branch in dynamicPaymentInput passes the matching 16 fields:


case 'checker':
        return {
          ...baseInput,
          paymentMode: 'checker',
          dualBlindKeyFlag: 'Y',
          dualBlindKeyFields: isNonUsPayment
            ? [...DUAL_BLIND_REKEY_FIELDS, ...TAX_DUAL_BLIND_REKEY_FIELDS]
            : DUAL_BLIND_REKEY_FIELDS,
        };


        //And update the dependency array on line 452:

    }, [activeTab, initialData, stableInitialPaymentModel, isNonUsPayment]);