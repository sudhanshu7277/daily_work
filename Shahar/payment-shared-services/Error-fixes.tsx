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




// proxy OCIF id style fix


.profile-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
  min-height: 44px;

  .profile-name-wrap {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    /* Fixed or base column width matching your 'Name' header */
    flex: 0 0 160px;
    max-width: 160px;
    min-width: 0;

    .profile-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .suspect-icon,
    .invalid-profile-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
  }

  .profile-id {
    /* Takes the remaining space directly under the 'Proxy OCIF ID' header */
    flex: 1 1 auto;
    padding: 0 16px;
    font-family: inherit;
    font-size: 13px;
    color: #333333;
    word-break: break-all;
    min-width: 0;
  }

  .delete-btn {
    flex: 0 0 auto;
    margin-left: auto;
  }
}
