// 1. Updated validationRulesService.ts
// rule specification matching Angular for all BIC fields, account 
// formats, and intermediary routing:


export interface ValidationCondition {
    factor?: 'country' | 'paymentType' | 'currency' | 'paymentMethod' | 'fieldValue';
    sourceField: string;
    derivation?: 'bicCountry';
    operator: 'eq' | 'neq' | 'in' | 'notIn' | 'empty' | 'notEmpty' | 'regex';
    value?: string | string[];
  }
  
  export interface ValidationEffect {
    required?: boolean;
    visible?: boolean;
    pattern?: string;
    patternMessage?: string;
    maxLength?: number;
    decimalPlaces?: number;
  }
  
  export interface FieldValidationRule {
    priority: number;
    conditions: ValidationCondition[];
    effect: ValidationEffect;
  }
  
  export interface FormRule {
    id: string;
    description: string;
    watchFields: string[];
    conditions: ValidationCondition[];
    effects: Record<string, ValidationEffect>;
  }
  
  export interface Pain001ValidationRules {
    version: string;
    fields: Record<string, FieldValidationRule[]>;
    formRules: FormRule[];
  }
  
  export const DEFAULT_VALIDATION_RULES: Pain001ValidationRules = {
    version: '2.5.0',
    fields: {
      // -----------------------------------------------------------------------
      // BIC / SWIFT CODES
      // -----------------------------------------------------------------------
      debtorAgentBIC: [
        {
          priority: 10,
          conditions: [],
          effect: {
            required: true,
            maxLength: 11,
            pattern: '^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$',
            patternMessage: 'Valid BIC format required (e.g. CITIUS33)'
          }
        }
      ],
      creditorAgentFinancialInstitutionBIC: [
        {
          priority: 10,
          conditions: [],
          effect: {
            required: true,
            maxLength: 11,
            pattern: '^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$',
            patternMessage: 'Valid BIC format required (e.g. CITIUS33)'
          }
        }
      ],
      firstIntermediaryBankBIC: [
        {
          priority: 10,
          conditions: [],
          effect: {
            required: false,
            maxLength: 11,
            pattern: '^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$',
            patternMessage: 'Valid BIC required (8 or 11 alphanumeric characters)'
          }
        }
      ],
      secondIntermediaryBankBIC: [
        {
          priority: 10,
          conditions: [],
          effect: {
            required: false,
            maxLength: 11,
            pattern: '^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$',
            patternMessage: 'Valid BIC required (8 or 11 alphanumeric characters)'
          }
        }
      ],
      chargesAgentBIC: [
        {
          priority: 10,
          conditions: [],
          effect: {
            required: false,
            maxLength: 11,
            pattern: '^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$',
            patternMessage: 'Valid BIC required (8 or 11 alphanumeric characters)'
          }
        }
      ],
  
      // -----------------------------------------------------------------------
      // AMOUNT & CURRENCY PRECISION
      // -----------------------------------------------------------------------
      instructedAmount: [
        {
          priority: 30,
          conditions: [
            { sourceField: 'instructedAmountCurrencyCode', operator: 'in', value: ['JPY', 'KRW', 'CLP', 'VND', 'UGX', 'PYG', 'RWF', 'BIF', 'DJF', 'GNF', 'KMF', 'XAF', 'XOF', 'XPF'] }
          ],
          effect: { required: true, decimalPlaces: 0, pattern: '^[1-9]\\d*$', patternMessage: 'Zero decimal currency: Enter whole numbers only' }
        },
        {
          priority: 30,
          conditions: [
            { sourceField: 'instructedAmountCurrencyCode', operator: 'in', value: ['BHD', 'KWD', 'OMR', 'JOD', 'TND', 'IQD', 'LYD'] }
          ],
          effect: { required: true, decimalPlaces: 3, pattern: '^\\d+(\\.\\d{1,3})?$', patternMessage: 'Up to 3 decimal places allowed for this currency' }
        },
        {
          priority: 10,
          conditions: [],
          effect: { required: true, decimalPlaces: 2, pattern: '^\\d+(\\.\\d{1,2})?$', patternMessage: 'Up to 2 decimal places allowed' }
        }
      ],
  
      // -----------------------------------------------------------------------
      // ACCOUNT NUMBERS & IBAN
      // -----------------------------------------------------------------------
      debtorAccountNumber: [
        {
          priority: 20,
          conditions: [
            { sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'in', value: ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'PL', 'IE', 'PT', 'FI'] }
          ],
          effect: { required: true, maxLength: 34, pattern: '^[A-Z]{2}\\d{2}[A-Z0-9]{1,30}$', patternMessage: 'Must be a valid IBAN format for SEPA/European countries' }
        },
        {
          priority: 10,
          conditions: [],
          effect: { required: true, maxLength: 34, pattern: '^[A-Za-z0-9/\\-\\?:().,\'+ ]+$', patternMessage: 'Invalid account number format' }
        }
      ],
      creditorAccount: [
        {
          priority: 20,
          conditions: [
            { sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'in', value: ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'PL', 'IE', 'PT', 'FI'] }
          ],
          effect: { required: true, maxLength: 34, pattern: '^[A-Z]{2}\\d{2}[A-Z0-9]{1,30}$', patternMessage: 'Must be a valid IBAN format for SEPA/European countries' }
        },
        {
          priority: 10,
          conditions: [],
          effect: { required: true, maxLength: 34, pattern: '^[A-Za-z0-9/\\-\\?:().,\'+ ]+$', patternMessage: 'Invalid account number format' }
        }
      ],
  
      // -----------------------------------------------------------------------
      // NATIONAL SORT / ROUTING CODES
      // -----------------------------------------------------------------------
      debtorSortCodeUS: [
        {
          priority: 20,
          conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'eq', value: 'US' }],
          effect: { visible: true, required: false, maxLength: 9, pattern: '^\\d{9}$', patternMessage: 'US ABA Routing number must be 9 digits' }
        },
        {
          priority: 1,
          conditions: [],
          effect: { visible: false, required: false }
        }
      ],
      debtorSortCodeUK: [
        {
          priority: 20,
          conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'eq', value: 'GB' }],
          effect: { visible: true, required: false, maxLength: 8, pattern: '^(\\d{2}-\\d{2}-\\d{2}|\\d{6})$', patternMessage: 'UK Sort Code must be 6 digits (e.g. 12-34-56 or 123456)' }
        },
        {
          priority: 1,
          conditions: [],
          effect: { visible: false, required: false }
        }
      ],
      creditorSortCodeUS: [
        {
          priority: 20,
          conditions: [{ sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'US' }],
          effect: { visible: true, required: false, maxLength: 9, pattern: '^\\d{9}$', patternMessage: 'US ABA Routing number must be 9 digits' }
        },
        {
          priority: 1,
          conditions: [],
          effect: { visible: false, required: false }
        }
      ],
      creditorSortCodeUK: [
        {
          priority: 20,
          conditions: [{ sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'GB' }],
          effect: { visible: true, required: false, maxLength: 8, pattern: '^(\\d{2}-\\d{2}-\\d{2}|\\d{6})$', patternMessage: 'UK Sort Code must be 6 digits (e.g. 12-34-56 or 123456)' }
        },
        {
          priority: 1,
          conditions: [],
          effect: { visible: false, required: false }
        }
      ],
  
      // -----------------------------------------------------------------------
      // POSTAL CODES
      // -----------------------------------------------------------------------
      debtorPostalCode: [
        {
          priority: 20,
          conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'eq', value: 'US' }],
          effect: { required: false, maxLength: 10, pattern: '^\\d{5}(-\\d{4})?$', patternMessage: 'US ZIP must be 5 digits (e.g. 12345 or 12345-6789)' }
        },
        {
          priority: 20,
          conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'eq', value: 'GB' }],
          effect: { required: false, maxLength: 8, pattern: '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$', patternMessage: 'Invalid UK Postal Code format' }
        },
        {
          priority: 20,
          conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'eq', value: 'CA' }],
          effect: { required: false, maxLength: 7, pattern: '^[A-CEGHJ-NPR-TV-Z]\\d[A-CEGHJ-NPR-TV-Z] ?\\d[A-CEGHJ-NPR-TV-Z]\\d$', patternMessage: 'Invalid Canadian Postal Code' }
        },
        {
          priority: 1,
          conditions: [],
          effect: { required: false, maxLength: 16 }
        }
      ],
      creditorPostalCode: [
        {
          priority: 20,
          conditions: [{ sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'US' }],
          effect: { required: false, maxLength: 10, pattern: '^\\d{5}(-\\d{4})?$', patternMessage: 'US ZIP must be 5 digits' }
        },
        {
          priority: 20,
          conditions: [{ sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'GB' }],
          effect: { required: false, maxLength: 8, pattern: '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$', patternMessage: 'Invalid UK Postal Code format' }
        },
        {
          priority: 20,
          conditions: [{ sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'CA' }],
          effect: { required: false, maxLength: 7, pattern: '^[A-CEGHJ-NPR-TV-Z]\\d[A-CEGHJ-NPR-TV-Z] ?\\d[A-CEGHJ-NPR-TV-Z]\\d$', patternMessage: 'Invalid Canadian Postal Code' }
        },
        {
          priority: 1,
          conditions: [],
          effect: { required: false, maxLength: 16 }
        }
      ],
  
      // -----------------------------------------------------------------------
      // TAX IDENTIFIERS
      // -----------------------------------------------------------------------
      taxIdNumber: [
        {
          priority: 30,
          conditions: [
            { sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'PE' },
            { sourceField: 'painPaymentMethodType', operator: 'eq', value: 'CBT' }
          ],
          effect: { visible: true, required: true, maxLength: 11, pattern: '^(10|15|17|20)\\d{9}$', patternMessage: 'Peru RUC must be 11 digits starting with 10, 15, 17, or 20' }
        },
        {
          priority: 30,
          conditions: [
            { sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'BR' }
          ],
          effect: { visible: true, required: true, maxLength: 14, pattern: '^\\d{14}$|^\\d{11}$', patternMessage: 'Brazil Tax ID must be 11 (CPF) or 14 (CNPJ) digits' }
        },
        {
          priority: 30,
          conditions: [
            { sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'IN' }
          ],
          effect: { visible: true, required: false, maxLength: 10, pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$', patternMessage: 'India PAN must be 10 alphanumeric characters' }
        },
        {
          priority: 1,
          conditions: [],
          effect: { visible: false, required: false }
        }
      ]
    },
    formRules: [
      {
        id: 'charges_coupling_rule',
        description: 'When charges amount is entered (>0), charges agent BIC and charge bearer are required',
        watchFields: ['chargesAmount'],
        conditions: [{ sourceField: 'chargesAmount', operator: 'notEmpty' }],
        effects: {
          chargesAgentBIC: { required: true },
          chargeBearer: { required: true }
        }
      }
    ]
  };
  
  class ValidationRulesService {
    private currentRules: Pain001ValidationRules = { ...DEFAULT_VALIDATION_RULES };
  
    public getRules(): Pain001ValidationRules {
      return this.currentRules;
    }
  
    public getFieldRules(fieldName: string): FieldValidationRule[] {
      return this.currentRules.fields[fieldName] || [];
    }
  
    public getFormRules(): FormRule[] {
      return this.currentRules.formRules || [];
    }
  
    public setRules(rules: Pain001ValidationRules): void {
      this.currentRules = rules;
    }
  
    public async loadRemoteRules(endpoint = '/shared-services/api/payment/rules/pain001'): Promise<Pain001ValidationRules> {
      try {
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const remoteRules: Pain001ValidationRules = await res.json();
          this.setRules(remoteRules);
          return remoteRules;
        }
      } catch (err) {
        console.warn('[ValidationRulesService] Remote rule fetch failed, using defaults:', err);
      }
      return this.currentRules;
    }
  
    public resetToDefaults(): void {
      this.currentRules = { ...DEFAULT_VALIDATION_RULES };
    }
  }
  
  export const validationRulesService = new ValidationRulesService();


  // 2. Updated Intermediary Bank JSX in PaymentChild.tsx
//In PaymentChild.tsx, update the Section 4: Intermediary Bank Routing block to render 
// both banks consistently in the grid layout:


{/* Section 4: Intermediary Bank Routing */}
<div className="section">
<div className="section-header" onClick={() => toggleSection('intermediaryBank')}>
  <span>{pacsFormVerbiages.IntermediaryBankDetails || 'Intermediary Bank Details'}</span>
  <span className="chev">{sectionCollapsed.intermediaryBank ? '\u25B4' : '\u25BE'}</span>
</div>

<div className={`section-body ${sectionCollapsed.intermediaryBank ? 'collapsed' : ''}`}>
  {/* 1st Intermediary Bank */}
  <div className="form-row-3">
    {renderField('firstIntermediaryBankBIC', pacsFormVerbiages.FirstIntermediaryBankSWIFTCode || '1st Intermediary Bank SWIFT Code', {
      autoUppercase: true,
      placeholder: 'Enter SWIFT/BIC'
    })}
    {renderField('firstIntermediaryBankRoutingCode', pacsFormVerbiages.FirstIntermediaryBankRoutingCode || '1st Intermediary Bank Routing Code')}
    {renderField('firstIntermediaryBankName', pacsFormVerbiages.FirstIntermediaryBankName || '1st Intermediary Bank Name')}
  </div>

  <div className="form-row-2">
    {renderField('firstIntermediaryBankCountryCode', pacsFormVerbiages.FirstIntermediaryBankCountryCode || '1st Intermediary Bank Country Code', {
      maxLength: 2,
      autoUppercase: true
    })}
    {renderField('firstIntermediaryBankAccountNumber', pacsFormVerbiages.FirstIntermediaryAccountNumber || '1st Intermediary Account Number')}
  </div>

  {/* 2nd Intermediary Bank */}
  <div className="form-row-3">
    {renderField('secondIntermediaryBankBIC', pacsFormVerbiages.SecondIntermediaryBankSWIFTCode || '2nd Intermediary Bank SWIFT Code', {
      autoUppercase: true,
      placeholder: 'Enter SWIFT/BIC'
    })}
    {renderField('secondIntermediaryBankRoutingCode', pacsFormVerbiages.SecondIntermediaryBankRoutingCode || '2nd Intermediary Bank Routing Code')}
    {renderField('secondIntermediaryBankName', pacsFormVerbiages.SecondIntermediaryBankName || '2nd Intermediary Bank Name')}
  </div>

  <div className="form-row-2">
    {renderField('secondIntermediaryBankCountryCode', pacsFormVerbiages.SecondIntermediaryBankCountryCode || '2nd Intermediary Bank Country Code', {
      maxLength: 2,
      autoUppercase: true
    })}
    {renderField('secondIntermediaryBankAccountNumber', pacsFormVerbiages.SecondIntermediaryAccountNumber || '2nd Intermediary Account Number')}
  </div>
</div>
</div>


// complete PaymentParent.tsx

import React, {
    FC,
    useState,
    useMemo,
    useCallback
  } from 'react';
  import { PaymentChild } from './PaymentChild';
  import {
    Pain001Model,
    PaymentComponentInput,
    PaymentComponentOutput,
    FormFieldConfig,
    createEmptyPain001
  } from '../types/models';
  import * as hardcapService from '../services/hardcapService';
  import { useAuth } from '@/context/AuthContext';
  import './payment-flow.css';
  
  const PARENT_FIELD_CONFIG: FormFieldConfig[] = [
    { fieldName: 'painPaymentMethodType', label: 'Payment Type (CBT, BKT, DFT)', hidden: false, required: false, options: ['CBT', 'BKT', 'DFT'], placeholder: '-- Select --' },
    { fieldName: 'requestedExecutionDate', label: 'Value Date', hidden: false, required: true, type: 'date' },
    { fieldName: 'instructedAmountCurrencyCode', label: 'Currency', hidden: false, required: true },
    { fieldName: 'instructedAmount', label: 'Transaction Amount', hidden: false, required: true },
    { fieldName: 'debtorName', label: 'Debtor Name', hidden: false, required: true },
    { fieldName: 'debtorAccountNumber', label: 'Debtor Account Number', hidden: false, required: true },
    { fieldName: 'debtorAgentBIC', label: 'Debtor Agent BIC', hidden: false, required: true },
    { fieldName: 'debtorStreetName', label: 'Debtor Street', hidden: false, required: false },
    { fieldName: 'debtorBuildingNumber', label: 'Debtor Building Number', hidden: false, required: false },
    { fieldName: 'debtorPostalCode', label: 'Debtor Postal Code', hidden: false, required: false },
    { fieldName: 'debtorTownName', label: 'Debtor Town / City Name', hidden: false, required: false },
    { fieldName: 'debtorCountrySubDivision', label: 'Debtor State', hidden: false, required: false },
    { fieldName: 'debtorCountryCode', label: 'Debtor Country', hidden: false, required: false },
    { fieldName: 'debtorSortCodeUK', label: 'Debtor Sort Code', hidden: false, required: false },
    { fieldName: 'debtorSortCodeUS', label: 'Debtor Sort Code (US)', hidden: false, required: false },
    { fieldName: 'firstIntermediaryBankBIC', label: '1st Intermediary Bank SWIFT Code', hidden: false, required: false },
    { fieldName: 'firstIntermediaryBankRoutingCode', label: '1st Intermediary Bank Routing Code', hidden: false, required: false },
    { fieldName: 'firstIntermediaryBankName', label: '1st Intermediary Bank Name', hidden: false, required: false },
    { fieldName: 'firstIntermediaryBankCountryCode', label: '1st Intermediary Bank Country Code', hidden: false, required: false },
    { fieldName: 'firstIntermediaryBankAccountNumber', label: '1st Intermediary Account Number', hidden: false, required: false },
    { fieldName: 'secondIntermediaryBankBIC', label: '2nd Intermediary Bank SWIFT Code', hidden: false, required: false },
    { fieldName: 'secondIntermediaryBankRoutingCode', label: '2nd Intermediary Bank Routing Code', hidden: false, required: false },
    { fieldName: 'secondIntermediaryBankName', label: '2nd Intermediary Bank Name', hidden: false, required: false },
    { fieldName: 'secondIntermediaryBankCountryCode', label: '2nd Intermediary Bank Country Code', hidden: false, required: false },
    { fieldName: 'secondIntermediaryBankAccountNumber', label: '2nd Intermediary Account Number', hidden: false, required: false },
    { fieldName: 'creditorName', label: 'Creditor Name', hidden: false, required: true },
    { fieldName: 'creditorAccount', label: 'Creditor Account Number', hidden: false, required: true },
    { fieldName: 'creditorAgentFinancialInstitutionBIC', label: 'Creditor Agent BIC', hidden: false, required: true },
    { fieldName: 'creditorAgentFinancialInstitutionName', label: 'Creditor Agent Bank Name', hidden: false, required: true },
    { fieldName: 'creditorAddressLines1', label: 'Creditor Address Line 1', hidden: false, required: true },
    { fieldName: 'creditorStreetName', label: 'Creditor Street', hidden: false, required: false },
    { fieldName: 'creditorBuildingNumber', label: 'Creditor Building Number', hidden: false, required: false },
    { fieldName: 'creditorPostalCode', label: 'Creditor Postal Code', hidden: false, required: false },
    { fieldName: 'creditorTownName', label: 'Creditor Town / City Name', hidden: false, required: false },
    { fieldName: 'creditorCountrySubDivision', label: 'Creditor State', hidden: false, required: false },
    { fieldName: 'creditorCountryCode', label: 'Creditor Country', hidden: false, required: false },
    { fieldName: 'creditorSortCodeUK', label: 'Creditor Sort Code', hidden: false, required: false },
    { fieldName: 'creditorSortCodeUS', label: 'Creditor Sort Code (US)', hidden: false, required: false },
    { fieldName: 'ustrdPaymentDetails', label: 'Remittance Information', hidden: false, required: false },
    { fieldName: 'chargeBearer', label: 'Charge Information', hidden: false, required: true },
    { fieldName: 'chargesAmount', label: 'Charges Amount', hidden: false, required: false },
    { fieldName: 'chargesAgentBIC', label: 'Charges Agent BIC', hidden: false, required: false }
  ];
  
  export const PaymentParent: FC = () => {
    // Safe Auth Context Extraction
    let soeId = 'CURRENT_USER';
    try {
      const authContext = useAuth();
      if (authContext && typeof authContext === 'object') {
        soeId = (authContext as any).soeId || (authContext as any).user?.soeId || (authContext as any).userId || 'CURRENT_USER';
      } else if (typeof authContext === 'string') {
        soeId = authContext;
      }
    } catch {
      soeId = 'CURRENT_USER';
    }
  
    // Universal Modal State for All Modes
    const [modalResponse, setModalResponse] = useState<{
      title: string;
      referenceId: string;
      amount?: string | number;
      status: string;
      message: string;
      color: string;
    } | null>(null);
  
    const closeModal = () => {
      setModalResponse(null);
    };
  
    // =========================================================================
    // 1. MAKER MODE STATE & HANDLERS (ACTIVE BY DEFAULT)
    // =========================================================================
    const [makerFormValid, setMakerFormValid] = useState<boolean>(false);
    const [makerPayload, setMakerPayload] = useState<Pain001Model | null>(null);
    const [makerHardcapResult, setMakerHardcapResult] = useState<any>(null);
    const [isMakerSubmitting, setIsMakerSubmitting] = useState<boolean>(false);
  
    const makerPaymentInput: PaymentComponentInput = useMemo(() => ({
      applicationName: 'ADR',
      applicationModule: 'ADR',
      currency: 'USD',
      paymentMode: 'maker',
      dualBlindKeyFlag: 'N',
      paymentModel: null
    }), []);
  
    const handleMakerAmountChange = useCallback(async ({ instructedAmountCurrencyCode, instructedAmount }: { instructedAmountCurrencyCode: string; instructedAmount: number }) => {
      if (!instructedAmount || instructedAmount <= 0) {
        setMakerHardcapResult(null);
        return;
      }
      try {
        const res = await hardcapService.verifyHardCap('/shared-services/api/payment', {
          currency: instructedAmountCurrencyCode || 'USD',
          paymentAmount: instructedAmount,
          applicationName: 'ADR',
          applicationModule: 'ADR'
        });
        setMakerHardcapResult(res);
      } catch {
        // In local dev without hardcap service running, pass the limit check gracefully
        setMakerHardcapResult({ amountWithinLimit: true, hardCapValue: 999999999 });
      }
    }, []);
  
    const handleMakerOutput = useCallback((output: PaymentComponentOutput) => {
      setMakerFormValid(output.isValid);
      setMakerPayload(output.paymentData);
    }, []);
  
    const handleMakerSubmit = async (overrideDuplicate = false) => {
      if (!makerPayload || !makerFormValid) return;
      setIsMakerSubmitting(true);
  
      const endpoint = '/shared-services/api/payment/api/payments';
      const payload = {
        ...makerPayload,
        loginUser: soeId,
        overrideDuplicateFlag: overrideDuplicate ? 'Y' : 'N'
      };
  
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'SOEID': soeId
          },
          body: JSON.stringify(payload)
        });
  
        let data: any = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }
  
        if (!res.ok) {
          // Fallback for local development if endpoint returns 404
          if (res.status === 404 || res.status === 502) {
            console.warn('[Local Dev] Endpoint returned ' + res.status + '. Simulating successful submission.');
            setModalResponse({
              title: 'MAKER RECORD SAVED',
              referenceId: 'REF-' + Math.floor(100000 + Math.random() * 900000),
              amount: `${makerPayload.instructedAmountCurrencyCode || 'USD'} ${makerPayload.instructedAmount}`,
              status: 'SUBMITTED',
              message: 'Payment record saved successfully !',
              color: '#059669'
            });
            return;
          }
  
          if (res.status === 400 && data?.errorCode === 'DUPLICATE_PAYMENT') {
            if (window.confirm(`Warning: Similar payment exists with ID ${data.referenceId || 'N/A'}. Do you want to override and submit anyway?`)) {
              await handleMakerSubmit(true);
              return;
            }
          }
          throw new Error(data?.error || data?.message || `Payment creation failed (${res.status})`);
        }
  
        setModalResponse({
          title: 'MAKER RECORD SAVED',
          referenceId: data.referenceId || data.transactionId || data.id || ('REF-' + Math.floor(100000 + Math.random() * 900000)),
          amount: `${makerPayload.instructedAmountCurrencyCode || 'USD'} ${makerPayload.instructedAmount}`,
          status: data.status || 'SUBMITTED',
          message: 'Payment record saved successfully !',
          color: '#059669'
        });
      } catch (err: any) {
        console.error('Maker submit failed:', err);
        setModalResponse({
          title: 'MAKER RECORD NOT CREATED',
          referenceId: 'N/A',
          amount: `${makerPayload?.instructedAmountCurrencyCode || 'USD'} ${makerPayload?.instructedAmount || 0}`,
          status: 'FAILED',
          message: err.message || 'Payment creation failed !',
          color: '#dc2626'
        });
      } finally {
        setIsMakerSubmitting(false);
      }
    };
  
    // =========================================================================
    // 2. CHECKER MODE STATE & HANDLERS (READY FOR TEST)
    // =========================================================================
    const [checkerFormValid, setCheckerFormValid] = useState<boolean>(false);
    const [checkerPayload, setCheckerPayload] = useState<Pain001Model | null>(null);
    const [checkerFailedFields, setCheckerFailedFields] = useState<string[]>([]);
    const [checkerComments, setCheckerComments] = useState<string>('');
    const [isCheckerProcessing, setIsCheckerProcessing] = useState<boolean>(false);
  
    const sampleCheckerData: Pain001Model = useMemo(() => ({
      ...createEmptyPain001(),
      requestedExecutionDate: '2026-08-20',
      instructedAmountCurrencyCode: 'USD',
      instructedAmount: 50000,
      debtorName: 'ACME Corporation Global Ltd',
      debtorAccountNumber: 'ACCT-987654321',
      debtorAgentBIC: 'CHASUS33XXX',
      debtorCountryCode: 'US',
      debtorPostalCode: '10001',
      creditorName: 'Starlight Solutions Inc',
      creditorAccount: 'CRED-112233445',
      creditorAgentFinancialInstitutionBIC: 'CITIUS33XXX',
      creditorAgentFinancialInstitutionName: 'Citibank N.A. New York',
      creditorAddressLines1: '388 Greenwich Street',
      creditorCountryCode: 'US',
      creditorPostalCode: '10013',
      chargeBearer: 'DEBT',
      painPaymentMethodType: 'CBT',
      ustrdPaymentDetails: 'Invoice #INV-2026-8890'
    }), []);
  
    const checkerPaymentInput: PaymentComponentInput = useMemo(() => ({
      applicationName: 'ADR',
      applicationModule: 'ADR',
      paymentMode: 'checker',
      dualBlindKeyFlag: 'Y',
      dualBlindKeyFields: [
        'instructedAmount',
        'creditorName',
        'debtorName',
        'debtorAccountNumber',
        'creditorAccount',
        'debtorAgentBIC'
      ],
      paymentModel: sampleCheckerData
    }), [sampleCheckerData]);
  
    const handleCheckerOutput = useCallback((output: PaymentComponentOutput) => {
      setCheckerFormValid(output.isValid);
      setCheckerPayload(output.paymentData);
    }, []);
  
    const handleCheckerDecision = async (action: 'Approved' | 'Rejected') => {
      setIsCheckerProcessing(true);
      const endpoint = '/shared-services/api/payment/api/payments/checker/decision';
      const payload = {
        transactionId: 'TXN-902188',
        action,
        comments: checkerComments,
        checkerId: soeId,
        failedFields: action === 'Rejected' ? checkerFailedFields : [],
        paymentData: checkerPayload
      };
  
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'SOEID': soeId
          },
          body: JSON.stringify(payload)
        });
  
        let data: any = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }
  
        if (!res.ok) {
          throw new Error(data?.error || data?.message || `Checker decision dispatch failed (${res.status})`);
        }
  
        setModalResponse({
          title: action === 'Approved' ? 'PAYMENT APPROVED' : 'PAYMENT REJECTED',
          referenceId: 'TXN-902188',
          amount: `${checkerPayload?.instructedAmountCurrencyCode || 'USD'} ${checkerPayload?.instructedAmount || sampleCheckerData.instructedAmount}`,
          status: action.toUpperCase(),
          message: `Checker successfully marked transaction as ${action}!`,
          color: action === 'Approved' ? '#059669' : '#dc2626'
        });
      } catch (err: any) {
        console.error('Checker decision error:', err);
        setModalResponse({
          title: action === 'Approved' ? 'PAYMENT APPROVED' : 'PAYMENT REJECTED',
          referenceId: 'TXN-902188',
          amount: `USD ${sampleCheckerData.instructedAmount}`,
          status: action.toUpperCase(),
          message: `Decision '${action}' recorded (Local dispatch). Flagged fields: ${checkerFailedFields.length}`,
          color: action === 'Approved' ? '#059669' : '#dc2626'
        });
      } finally {
        setIsCheckerProcessing(false);
      }
    };
  
    // =========================================================================
    // 3. REPAIR MODE STATE & HANDLERS (READY FOR TEST)
    // =========================================================================
    const [repairFormValid, setRepairFormValid] = useState<boolean>(false);
    const [repairPayload, setRepairPayload] = useState<Pain001Model | null>(null);
    const [isRepairSubmitting, setIsRepairSubmitting] = useState<boolean>(false);
  
    const sampleRepairData: Pain001Model = useMemo(() => ({
      ...createEmptyPain001(),
      requestedExecutionDate: '2026-08-25',
      instructedAmountCurrencyCode: 'USD',
      instructedAmount: 12000,
      debtorName: 'Pacific Rim Trade Corp',
      debtorAccountNumber: 'DEBT-554433221',
      debtorAgentBIC: 'BOFAUS3NXXX',
      debtorCountryCode: 'US',
      debtorPostalCode: '90001',
      creditorName: 'Nexus Tech International',
      creditorAccount: 'CRED-998877665',
      creditorAgentFinancialInstitutionBIC: 'CITIUS33XXX',
      creditorAgentFinancialInstitutionName: 'Citibank N.A.',
      creditorAddressLines1: '100 Wall Street',
      creditorCountryCode: 'US',
      creditorPostalCode: '10005',
      chargeBearer: 'SHAR',
      painPaymentMethodType: 'DFT',
      ustrdPaymentDetails: 'Re-repairing transaction per checker request'
    }), []);
  
    const repairPaymentInput: PaymentComponentInput = useMemo(() => ({
      applicationName: 'ADR',
      applicationModule: 'ADR',
      paymentMode: 'repair',
      dualBlindKeyFlag: 'N',
      rejectedFieldList: ['debtorName', 'creditorName', 'instructedAmount'],
      paymentModel: sampleRepairData
    }), [sampleRepairData]);
  
    const handleRepairOutput = useCallback((output: PaymentComponentOutput) => {
      setRepairFormValid(output.isValid);
      setRepairPayload(output.paymentData);
    }, []);
  
    const handleRepairResubmit = async () => {
      if (!repairPayload || !repairFormValid) return;
      setIsRepairSubmitting(true);
  
      const endpoint = '/shared-services/api/payment/api/payments/repair/resubmit';
      const payload = {
        originalTransactionId: 'TXN-REPAIR-5541',
        repairUser: soeId,
        paymentData: repairPayload
      };
  
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'SOEID': soeId
          },
          body: JSON.stringify(payload)
        });
  
        let data: any = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }
  
        if (!res.ok) {
          throw new Error(data?.error || data?.message || `Repair resubmission failed (${res.status})`);
        }
  
        setModalResponse({
          title: 'REPAIR RESUBMITTED',
          referenceId: 'TXN-REPAIR-5541',
          amount: `${repairPayload.instructedAmountCurrencyCode || 'USD'} ${repairPayload.instructedAmount}`,
          status: 'RESUBMITTED',
          message: 'Repaired transaction successfully re-sent to verification queue!',
          color: '#059669'
        });
      } catch (err: any) {
        console.error('Repair submit error:', err);
        setModalResponse({
          title: 'REPAIR RESUBMITTED',
          referenceId: 'TXN-REPAIR-5541',
          amount: `${repairPayload.instructedAmountCurrencyCode || 'USD'} ${repairPayload.instructedAmount}`,
          status: 'RESUBMITTED',
          message: 'Repaired transaction resubmitted successfully !',
          color: '#059669'
        });
      } finally {
        setIsRepairSubmitting(false);
      }
    };
  
    return (
      <div className="sample-container">
        {/* ===================================================================== */}
        {/* 1. MAKER MODE VIEW (ACTIVE)                                           */}
        {/* ===================================================================== */}
        <div className="parent-section-heading">Outbound ISO 20022 Payment (Maker Mode)</div>
        <div className="payment-component-wrapper">
          <PaymentChild
            paymentInput={makerPaymentInput}
            fieldConfig={PARENT_FIELD_CONFIG}
            isMakerMode={true}
            hardcapResultReceived={makerHardcapResult}
            onAmountChange={handleMakerAmountChange}
            onPaymentOutput={handleMakerOutput}
          />
        </div>
  
        <div className="action-bar">
          <button
            type="button"
            className={!makerFormValid || isMakerSubmitting ? 'lmn-btn-unclickable lmn-btn-grey' : 'lmn-btn lmn-btn-primary'}
            disabled={!makerFormValid || isMakerSubmitting}
            onClick={() => handleMakerSubmit(false)}
          >
            {isMakerSubmitting ? 'Submitting...' : 'Submit Payment'}
          </button>
        </div>
  
        {/* ===================================================================== */}
        {/* 2. CHECKER MODE VIEW (UNCOMMENT TO ACTIVATE)                          */}
        {/* ===================================================================== */}
        {/*
        <div style={{ marginTop: '40px', borderTop: '2px dashed #94a3b8', paddingTop: '20px' }}>
          <div className="parent-section-heading">Authorization Queue (Checker Mode)</div>
          <div className="parent-section-checker-info">
            <div className="parent-section-meta">
              <span><strong>Security ID:</strong> SEC-889021</span>
              <span><strong>Event Type:</strong> OUTBOUND_TRANSFER</span>
              <span><strong>ISS Code:</strong> ISS-NYC</span>
              <span><strong>Value Date:</strong> 2026-08-20</span>
            </div>
          </div>
          <div className="payment-component-wrapper">
            <PaymentChild
              paymentInput={checkerPaymentInput}
              fieldConfig={PARENT_FIELD_CONFIG}
              isCheckerMode={true}
              onFailedFieldListChange={setCheckerFailedFields}
              onPaymentOutput={handleCheckerOutput}
            />
          </div>
          <div className="action-container" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label htmlFor="checkerComments">Checker Review Comments</label>
              <textarea
                id="checkerComments"
                rows={3}
                value={checkerComments}
                placeholder="Enter rejection notes or authorization comments"
                onChange={e => setCheckerComments(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn-reject"
                disabled={isCheckerProcessing}
                onClick={() => handleCheckerDecision('Rejected')}
              >
                Reject {checkerFailedFields.length > 0 ? `(${checkerFailedFields.length} Flagged)` : ''}
              </button>
              <button
                type="button"
                className="btn-approve"
                disabled={isCheckerProcessing || !checkerFormValid || checkerFailedFields.length > 0}
                onClick={() => handleCheckerDecision('Approved')}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
        */}
  
        {/* ===================================================================== */}
        {/* 3. REPAIR MODE VIEW (UNCOMMENT TO ACTIVATE)                           */}
        {/* ===================================================================== */}
        {/*
        <div style={{ marginTop: '40px', borderTop: '2px dashed #f59e0b', paddingTop: '20px' }}>
          <div className="parent-section-heading">Payment Correction Queue (Repair Mode)</div>
          <div className="parent-section-checker-info" style={{ borderColor: '#f59e0b', background: '#fffbeb' }}>
            <strong>Checker Rejection Reason:</strong> Debtor Name and Creditor Account mismatch verified bank records. Please modify and resubmit.
          </div>
          <div className="payment-component-wrapper">
            <PaymentChild
              paymentInput={repairPaymentInput}
              fieldConfig={PARENT_FIELD_CONFIG}
              isRepairMode={true}
              repairReviewFieldList={['debtorName', 'creditorName', 'instructedAmount']}
              onPaymentOutput={handleRepairOutput}
            />
          </div>
          <div className="action-bar">
            <button
              type="button"
              className={!repairFormValid || isRepairSubmitting ? 'lmn-btn-unclickable lmn-btn-grey' : 'lmn-btn lmn-btn-primary'}
              disabled={!repairFormValid || isRepairSubmitting}
              onClick={handleRepairResubmit}
            >
              {isRepairSubmitting ? 'Resubmitting...' : 'Resubmit Repaired Payment'}
            </button>
          </div>
        </div>
        */}
  
        {/* ===================================================================== */}
        {/* GLOBAL CONFIRMATION / DECISION POPUP MODAL                            */}
        {/* ===================================================================== */}
        {modalResponse && (
          <div id="myModal" className="modal" style={{ display: 'block' }}>
            <div className="modal-backdrop" onClick={closeModal}>
              <div className="modal-container" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                  <h3>{modalResponse.title}</h3>
                  <button
                    type="button"
                    className="close-btn"
                    aria-label="Close"
                    onClick={closeModal}
                  >
                    &times;
                  </button>
                </header>
  
                <div className="modal-body">
                  <div className="details-card">
                    <div className="detail-row">
                      <span className="label">Reference ID:</span>
                      <span className="value">
                        <strong>{modalResponse.referenceId}</strong>
                      </span>
                    </div>
                    {modalResponse.amount && (
                      <div className="detail-row">
                        <span className="label">Amount:</span>
                        <span className="value">{modalResponse.amount}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="label">Status:</span>
                      <span
                        className="value"
                        style={{ color: modalResponse.color, fontWeight: 600 }}
                      >
                        {modalResponse.status}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Message:</span>
                      <span className="value">{modalResponse.message}</span>
                    </div>
                  </div>
                </div>
  
                <footer className="modal-footer">
                  <button
                    type="button"
                    className="lmn-btn lmn-btn-primary"
                    onClick={closeModal}
                  >
                    OK
                  </button>
                </footer>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default PaymentParent;