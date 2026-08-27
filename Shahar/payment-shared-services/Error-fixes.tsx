// Step 1: Update FormFieldConfig Interface
//Open projects/payment-//flow-ui-lib/src/models/models.ts (
// and/or your shared types definition) and add disabled?: boolean;:



export interface FormFieldConfig {
  fieldName: string;
  label?: string;
  value?: any;
  required?: boolean;
  disabled?: boolean; // <--- Add this property
  hidden?: boolean;
  type?: 'text' | 'number' | 'date' | 'textarea' | string;
  options?: readonly string[] | string[];
  placeholder?: string;
  maxLength?: number;
  [key: string]: any;
}


// Step 2: Ensure Safe Type Casting in SSPaymentFlow.tsx
//To prevent any transient build issues 
// if types are being re-indexed or imported from 
// a published package declaration, update the check i
// n isFieldReadonly to safely read disabled:



const isFieldReadonly = useCallback(
  (fieldName: keyof Pain001Model): boolean => {
    // 1. Explicit dynamic configuration override (with type guard)
    const cfg = configMap.get(fieldName as string) as (FormFieldConfig & { disabled?: boolean }) | undefined;
    if (cfg && cfg.disabled !== undefined) {
      return Boolean(cfg.disabled);
    }

    // 2. Deadlock protection for empty required fields
    const val = (formValues as any)[fieldName];
    const isFieldEmpty = val === undefined || val === null || String(val).trim() === '';
    const isRequired =
      PAIN001_MANDATORY_FIELDS.includes(fieldName as string) ||
      Boolean(configMap.get(fieldName as string)?.required);

    if (isFieldEmpty && isRequired && !isChecker) {
      return false;
    }

    // 3. Maker Mode
    if (isMaker) {
      return false;
    }

    // 4. Checker Mode
    if (isChecker) {
      if (fieldName === 'debtorCountryCode') return true;
      if (isDualBlindEnabled && paymentInput?.dualBlindKeyFields?.includes(fieldName as string)) {
        return false;
      }
      return true;
    }

    // 5. Derived BIC country states
    if (fieldName === 'debtorCountryCode' && isDebtorCountryReadonly) return true;
    if (fieldName === 'debtorCountryCode') return false;
    if (fieldName === 'creditorCountryCode' && isCreditorCountryReadonly) return true;
    if (fieldName === 'creditorCountryCode') return false;

    // 6. Repair Mode
    if (isRepair) {
      if (repairReviewFieldList && repairReviewFieldList.length > 0) {
        return !repairReviewFieldList.includes(fieldName as string);
      }
      return false;
    }

    return false;
  },
  [
    isMaker,
    isChecker,
    isDualBlindEnabled,
    paymentInput?.dualBlindKeyFields,
    isDebtorCountryReadonly,
    isCreditorCountryReadonly,
    isRepair,
    repairReviewFieldList,
    configMap,
    formValues
  ]
);