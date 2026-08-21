import React, { useState, useMemo, useCallback } from 'react';
import { SSPaymentFlow } from '../../../../projects/payment-flow-ui-lib/components/ss-payment-flow/SSPaymentFlow';
import {
  PaymentComponentInput,
  PaymentComponentOutput,
  FormFieldConfig,
  Pain001Model,
  FormValidityPayload,
  createEmptyPain001
} from '../../../../projects/payment-flow-ui-lib/models/models';
import * as verbiageConstants from '../../../../projects/payment-flow-ui-lib/utils/verbiages';
import { validatePaymentRules } from '../../../../projects/payment-flow-ui-lib/services/validationRulesService';
import { checkHardcapLimits } from '../../../../projects/payment-flow-ui-lib/services/hardcapService';

export interface PaymentParentProps {
  mode?: 'maker' | 'checker' | 'repair';
  initialData?: Partial<Pain001Model> | null;
  loggedInUser?: string;
  applicationName?: string;
  applicationModule?: string;
  dualBlindKeyFlag?: 'Y' | 'N';
  dualBlindKeyFields?: string[];
  repairReviewFieldList?: string[];
  repairNewlyModifyFieldList?: string[];
  customFieldConfig?: FormFieldConfig[];
  onPaymentChange?: (output: PaymentComponentOutput) => void;
  onValidityChange?: (isValid: boolean, payload: FormValidityPayload) => void;
}

const DEFAULT_FIELD_CONFIG: FormFieldConfig[] = [
  {
    fieldName: 'painPaymentMethodType',
    label: 'Payment Method Type',
    required: true,
    options: ['CBT', 'BKT', 'ACH', 'WIRE']
  },
  {
    fieldName: 'requestedExecutionDate',
    label: 'Value Date',
    required: true,
    type: 'date'
  },
  {
    fieldName: 'instructedAmountCurrencyCode',
    label: 'Currency',
    required: true,
    options: ['USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD', 'SGD']
  },
  {
    fieldName: 'instructedAmount',
    label: 'Instructed Amount',
    required: true,
    type: 'number'
  },
  {
    fieldName: 'chargesAmount',
    label: 'Charges Amount',
    required: false,
    type: 'number'
  },
  {
    fieldName: 'chargeBearerType',
    label: 'Charge Bearer',
    required: false,
    options: ['DEBT', 'CRED', 'SHAR', 'SLEV']
  },
  {
    fieldName: 'debtorName',
    label: 'Debtor Name',
    required: true
  },
  {
    fieldName: 'debtorAccountNumber',
    label: 'Debtor Account Number',
    required: true
  },
  {
    fieldName: 'debtorAgentBIC',
    label: 'Debtor Agent BIC',
    required: true
  },
  {
    fieldName: 'debtorAddressLines1',
    label: 'Debtor Address',
    required: false
  },
  {
    fieldName: 'debtorTownName',
    label: 'Debtor Town',
    required: false
  },
  {
    fieldName: 'debtorCountryCode',
    label: 'Debtor Country',
    required: false
  },
  {
    fieldName: 'creditorName',
    label: 'Beneficiary Name',
    required: true
  },
  {
    fieldName: 'creditorAccountNumber',
    label: 'Beneficiary Account / IBAN',
    required: true
  },
  {
    fieldName: 'creditorAgentBIC',
    label: 'Beneficiary Bank BIC',
    required: true
  },
  {
    fieldName: 'creditorAgentName',
    label: 'Beneficiary Bank Name',
    required: false
  },
  {
    fieldName: 'creditorAddressLines1',
    label: 'Beneficiary Address',
    required: false
  },
  {
    fieldName: 'creditorTownName',
    label: 'Beneficiary Town',
    required: false
  },
  {
    fieldName: 'creditorCountryCode',
    label: 'Beneficiary Country',
    required: false
  },
  {
    fieldName: 'intermediaryAgentBIC',
    label: 'Intermediary Bank BIC',
    required: false
  },
  {
    fieldName: 'paymentReference',
    label: 'Payment Reference',
    required: false
  },
  {
    fieldName: 'remittanceInformation',
    label: 'Remittance Information',
    required: false,
    type: 'textarea'
  }
];

export const PaymentParent: React.FC<PaymentParentProps> = ({
  mode = 'maker',
  initialData,
  loggedInUser = 'SYSTEM_USER',
  applicationName = 'GAB',
  applicationModule = 'INSTRUCTION_MAKER',
  dualBlindKeyFlag = 'N',
  dualBlindKeyFields = [],
  repairReviewFieldList = [],
  repairNewlyModifyFieldList = [],
  customFieldConfig,
  onPaymentChange,
  onValidityChange
}) => {
  const [, setCurrentOutput] = useState<PaymentComponentOutput | null>(null);
  const [, setFormValidity] = useState<boolean>(false);
  const [, setFailedFieldList] = useState<string[]>([]);
  const [hardcapResult, setHardcapResult] = useState<{ amountWithinLimit: boolean; hardCapValue: number } | string | null>(null);

  const activeFieldConfig = useMemo(() => {
    return customFieldConfig && customFieldConfig.length > 0 ? customFieldConfig : DEFAULT_FIELD_CONFIG;
  }, [customFieldConfig]);

  const resolvedVerbiages = useMemo<Record<string, string>>(() => {
    const raw = (verbiageConstants as any).default || (verbiageConstants as any).verbiages || verbiageConstants;
    return typeof raw === 'object' && raw !== null ? raw : {};
  }, []);

  const paymentInput: PaymentComponentInput = useMemo(() => {
    const baseModel = createEmptyPain001();
    const mergedModel: Partial<Pain001Model> = initialData ? { ...baseModel, ...initialData } : baseModel;

    return {
      applicationName,
      applicationModule,
      paymentMode: mode,
      dualBlindKeyFlag,
      dualBlindKeyFields,
      paymentModel: mergedModel
    };
  }, [applicationName, applicationModule, mode, dualBlindKeyFlag, dualBlindKeyFields, initialData]);

  const handleAmountChange = useCallback(async (payload: { instructedAmountCurrencyCode: string; instructedAmount: number }) => {
    const { instructedAmountCurrencyCode, instructedAmount } = payload;
    if (instructedAmount > 0 && instructedAmountCurrencyCode) {
      try {
        const result = await checkHardcapLimits(instructedAmountCurrencyCode, instructedAmount);
        setHardcapResult(result);
      } catch {
        setHardcapResult({ amountWithinLimit: instructedAmount <= 10000000, hardCapValue: 10000000 });
      }
    } else {
      setHardcapResult(null);
    }
  }, []);

  const handleFormChange = useCallback((rawValues: Record<string, unknown>) => {
    const ruleEvaluation = validatePaymentRules(rawValues);
    if (ruleEvaluation && !ruleEvaluation.isValid) {
      setFailedFieldList(ruleEvaluation.failedFields || []);
    } else {
      setFailedFieldList([]);
    }
  }, []);

  const handleFormValidityChange = useCallback(
    (payload: FormValidityPayload) => {
      setFormValidity(payload.validForm);
      if (onValidityChange) {
        onValidityChange(payload.validForm, payload);
      }
    },
    [onValidityChange]
  );

  const handlePaymentOutput = useCallback(
    (output: PaymentComponentOutput) => {
      setCurrentOutput(output);
      if (onPaymentChange) {
        onPaymentChange(output);
      }
    },
    [onPaymentChange]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <SSPaymentFlow
        paymentInput={paymentInput}
        fieldConfig={activeFieldConfig}
        initialData={initialData || undefined}
        pacsFormVerbiages={resolvedVerbiages}
        loggedInUser={loggedInUser}
        isMakerMode={mode === 'maker'}
        isCheckerMode={mode === 'checker'}
        isRepairMode={mode === 'repair'}
        repairReviewFieldList={repairReviewFieldList}
        repairNewlyModifyFieldList={repairNewlyModifyFieldList}
        hardcapResultReceived={hardcapResult}
        onPaymentOutput={handlePaymentOutput}
        onFormChange={handleFormChange}
        onFormValidityChange={handleFormValidityChange}
        onFailedFieldListChange={(fields) => setFailedFieldList(fields)}
        onAmountChange={handleAmountChange}
      />
    </div>
  );
};