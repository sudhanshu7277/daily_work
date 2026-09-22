//Step 1: Define the Key Fields & Field Config Generator in PaymentParent.tsx
// Add the list of key fields from


import { FormFieldConfig } from '@citi-icg-179025/payment-flow-reactjs-ui-lib';

// The 10 dual blind rekey fields from image_68.png
export const DUAL_BLIND_REKEY_FIELDS: string[] = [
  'debtorName',
  'debtorAccountNumber',
  'debtorAgentBIC',
  'instructedAmount',
  'instructedAmountCurrencyCode',
  'creditorName',
  'creditorAccount',
  'creditorAgentFinancialInstitutionBIC',
  'creditorAgentFinancialInstitutionName',
  'creditorAgentPostalAddress',
];


///Inside PaymentParent:


// Dynamically set disabled flag on each field based on active mode
const dynamicFieldConfig = useMemo(() => {
  const baseConfig = (PARENT_FIELD_CONFIG as FormFieldConfig[]) || [];

  if (activeTab === 'checker') {
    return baseConfig.map((cfg) => {
      // Keep ONLY the dual blind fields enabled; disable everything else
      const isRekeyField = DUAL_BLIND_REKEY_FIELDS.includes(cfg.fieldName);
      return {
        ...cfg,
        disabled: !isRekeyField,
      };
    });
  }

  // In maker or repair mode, keep standard permissions
  return baseConfig;
}, [activeTab]);


//Step 2: Pass dualBlindKeyFields into dynamicPaymentInput
// In PaymentParent.tsx (around lines 941–965):
// Update case 'checker' to include dualBlindKeyFields matching PaymentComponentInput:


case 'checker':
      return {
        applicationName: 'GAB',
        applicationModule: 'GAB-LATAM',
        currency: initialData?.instructedAmountCurrencyCode ?? 'USD',
        paymentMode: 'checker',
        dualBlindKeyFlag: 'Y',
        dualBlindKeyFields: DUAL_BLIND_REKEY_FIELDS,
        paymentModel: stableInitialPaymentModel,
      };



// Step 3: Pass dynamicFieldConfig to <SSPaymentFlow/>
// Update the <SSPaymentFlow .../> JSX in PaymentParent.tsx


<SSPaymentFlow
  key={`${activeTab}-${initialData?.paymentId || initialData?.transactionId || initialData?.debtorAccountNumber || 'new'}`}
  paymentInput={dynamicPaymentInput}
  fieldConfig={dynamicFieldConfig as any}
  initialData={initialData ?? undefined}
  isMakerMode={activeTab === 'maker'}
  isCheckerMode={activeTab === 'checker'}
  isRepairMode={activeTab === 'repair'}
  repairReviewFieldList={activeTab === 'repair' ? repairReviewFieldList : undefined}
  repairNewlyModifyFieldList={activeTab === 'repair' ? repairNewlyModifiedFields : undefined}
  hardcapResultReceived={activeTab === 'maker' ? makerHardcapResult : undefined}
  onAmountChange={activeTab === 'maker' ? handleAmountChange : undefined}
  onFailedFieldListChange={activeTab === 'checker' ? setCheckerFailedFields : undefined}
  onFormChange={handleFormChange}
  onPaymentOutput={handlePaymentOutput}
/>
