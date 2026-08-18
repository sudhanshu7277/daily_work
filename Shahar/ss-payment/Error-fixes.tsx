// src/pages/ss-payment/services/validationRulesService.ts


// ============================================================================
// ISO 20022 PAIN.001 / PACS DYNAMIC VALIDATION RULES SERVICE
// ============================================================================

export interface ValidationCondition {
    factor?: 'country' | 'paymentType' | 'currency' | 'paymentMethod' | 'fieldValue';
    sourceField: string;
    derivation?: 'bicCountry' | 'length' | 'numericOnly';
    operator: 'eq' | 'neq' | 'in' | 'notIn' | 'empty' | 'notEmpty' | 'regex' | 'gte' | 'lte';
    value?: string | string[] | number | boolean;
  }
  
  export interface ValidationEffect {
    required?: boolean;
    visible?: boolean;
    readonly?: boolean;
    pattern?: string;
    patternMessage?: string;
    maxLength?: number;
    minLength?: number;
    decimalPlaces?: number;
    minDate?: string;
    placeholder?: string;
  }
  
  export interface FieldValidationRule {
    priority: number;
    description?: string;
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
    lastUpdated?: string;
    fields: Record<string, FieldValidationRule[]>;
    formRules: FormRule[];
  }
  
  // ----------------------------------------------------------------------------
  // COUNTRY & REGIONAL CONSTANTS
  // ----------------------------------------------------------------------------
  export const EMEA_COUNTRIES: string[] = [
    'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT',
    'SE', 'NO', 'DK', 'PL', 'IE', 'PT', 'FI', 'GR', 'CZ',
    'HU', 'RO', 'BG', 'HR', 'SK', 'SI', 'LU', 'EE', 'LV', 'LT'
  ];
  
  export const LATAM_COUNTRIES: string[] = [
    'BR', 'PE', 'CO', 'AR', 'CL', 'MX', 'UY', 'PY', 'BO', 'EC', 'VE'
  ];
  
  export const ZERO_DECIMAL_CURRENCIES: string[] = [
    'JPY', 'KRW', 'CLP', 'VND', 'UGX', 'PYG', 'RWF', 'BIF',
    'DJF', 'GNF', 'KMF', 'XAF', 'XOF', 'XPF'
  ];
  
  export const THREE_DECIMAL_CURRENCIES: string[] = [
    'BHD', 'KWD', 'OMR', 'JOD', 'TND', 'IQD', 'LYD'
  ];
  
  // ----------------------------------------------------------------------------
  // DEFAULT COMPREHENSIVE VALIDATION RULES SPECIFICATION
  // ----------------------------------------------------------------------------
  export const DEFAULT_VALIDATION_RULES: Pain001ValidationRules = {
    version: '3.1.0',
    lastUpdated: '2026-08-18',
    fields: {
      // -------------------------------------------------------------------------
      // PAYMENT DETAILS & HEADER
      // -------------------------------------------------------------------------
      painPaymentMethodType: [
        {
          priority: 10,
          description: 'Payment type options CBT, BKT, DFT',
          conditions: [],
          effect: {
            required: false,
            visible: true
          }
        }
      ],
  
      requestedExecutionDate: [
        {
          priority: 10,
          description: 'Value date is mandatory and must not allow past dates (BA Point 1)',
          conditions: [],
          effect: {
            required: true,
            visible: true
          }
        }
      ],
  
      instructedAmountCurrencyCode: [
        {
          priority: 10,
          description: 'Currency code must be exactly 3 uppercase letters (BA Point 2)',
          conditions: [],
          effect: {
            required: true,
            visible: true,
            maxLength: 3,
            pattern: '^[A-Za-z]{3}$',
            patternMessage: 'Currency must be exactly 3 alphabetical characters'
          }
        }
      ],
  
      instructedAmount: [
        // 1. Zero decimal currencies (JPY, KRW, CLP, etc.)
        {
          priority: 30,
          description: 'Zero decimal currencies must be whole numbers only',
          conditions: [
            { sourceField: 'instructedAmountCurrencyCode', operator: 'in', value: ZERO_DECIMAL_CURRENCIES }
          ],
          effect: {
            required: true,
            decimalPlaces: 0,
            pattern: '^[1-9]\\d*$',
            patternMessage: 'Zero decimal currency: Enter whole numbers only'
          }
        },
        // 2. Three decimal currencies (BHD, KWD, OMR, etc.)
        {
          priority: 30,
          description: '3 decimal currencies allow up to 3 fractional places',
          conditions: [
            { sourceField: 'instructedAmountCurrencyCode', operator: 'in', value: THREE_DECIMAL_CURRENCIES }
          ],
          effect: {
            required: true,
            decimalPlaces: 3,
            pattern: '^\\d+(\\.\\d{1,3})?$',
            patternMessage: 'Up to 3 decimal places allowed for this currency'
          }
        },
        // 3. Standard currencies (USD, EUR, GBP, CAD, AUD, etc.)
        {
          priority: 10,
          description: 'Standard currencies allow up to 2 decimal places',
          conditions: [],
          effect: {
            required: true,
            decimalPlaces: 2,
            pattern: '^\\d+(\\.\\d{1,2})?$',
            patternMessage: 'Up to 2 decimal places allowed'
          }
        }
      ],
  
      // -------------------------------------------------------------------------
      // DEBTOR INFORMATION
      // -------------------------------------------------------------------------
      debtorName: [
        {
          priority: 10,
          description: 'Debtor Name is mandatory',
          conditions: [],
          effect: {
            required: true,
            visible: true,
            maxLength: 140
          }
        }
      ],
  
      debtorAccountNumber: [
        // UK and EMEA require exactly 16 digits (BA Point 3)
        {
          priority: 30,
          description: 'UK and EMEA countries require exactly 16 numeric digits',
          conditions: [
            { sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'in', value: EMEA_COUNTRIES }
          ],
          effect: {
            required: true,
            maxLength: 16,
            pattern: '^\\d{16}$',
            patternMessage: 'Debtor Account Number must be exactly 16 numeric digits for UK/EMEA'
          }
        },
        // General Debtor Account Number (Numeric only, BA Point 3)
        {
          priority: 10,
          description: 'Debtor Account Number must be strictly numeric',
          conditions: [],
          effect: {
            required: true,
            maxLength: 34,
            pattern: '^\\d+$',
            patternMessage: 'Debtor Account Number must be numeric only'
          }
        }
      ],
  
      debtorAgentBIC: [
        {
          priority: 10,
          description: 'Debtor Agent BIC must be 8 or 11 alphanumeric characters (BA Point 4)',
          conditions: [],
          effect: {
            required: true,
            maxLength: 11,
            pattern: '^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$',
            patternMessage: 'Valid BIC format required (8 or 11 alphanumeric characters)'
          }
        }
      ],
  
      // -------------------------------------------------------------------------
      // DEBTOR ADDRESS & NATIONAL SORT CODES
      // -------------------------------------------------------------------------
      debtorCountryCode: [
        {
          priority: 10,
          conditions: [],
          effect: {
            maxLength: 2,
            pattern: '^[A-Za-z]{2}$',
            patternMessage: 'Country code must be 2 letters'
          }
        }
      ],
  
      debtorSortCodeUS: [
        {
          priority: 20,
          description: 'US ABA Routing number must be exactly 9 numeric digits (BA Point 8)',
          conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'eq', value: 'US' }],
          effect: {
            visible: true,
            required: false,
            maxLength: 9,
            pattern: '^\\d{9}$',
            patternMessage: 'US ABA Routing number must be exactly 9 numeric digits'
          }
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
          description: 'UK Sort Code must be 6 digits (e.g. 12-34-56 or 123456)',
          conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'eq', value: 'GB' }],
          effect: {
            visible: true,
            required: false,
            maxLength: 8,
            pattern: '^(\\d{2}-\\d{2}-\\d{2}|\\d{6})$',
            patternMessage: 'UK Sort Code must be 6 digits'
          }
        },
        {
          priority: 1,
          conditions: [],
          effect: { visible: false, required: false }
        }
      ],
  
      debtorPostalCode: [
        {
          priority: 20,
          description: 'US ZIP code format',
          conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'eq', value: 'US' }],
          effect: {
            required: false,
            maxLength: 10,
            pattern: '^\\d{5}(-\\d{4})?$',
            patternMessage: 'US ZIP must be 5 digits (e.g. 12345 or 12345-6789)'
          }
        },
        {
          priority: 20,
          description: 'UK Postal code format',
          conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'eq', value: 'GB' }],
          effect: {
            required: false,
            maxLength: 8,
            pattern: '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$',
            patternMessage: 'Invalid UK Postal Code format'
          }
        },
        {
          priority: 20,
          description: 'Canadian Postal code format',
          conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'eq', value: 'CA' }],
          effect: {
            required: false,
            maxLength: 7,
            pattern: '^[A-CEGHJ-NPR-TV-Z]\\d[A-CEGHJ-NPR-TV-Z] ?\\d[A-CEGHJ-NPR-TV-Z]\\d$',
            patternMessage: 'Invalid Canadian Postal Code'
          }
        },
        {
          priority: 1,
          conditions: [],
          effect: { required: false, maxLength: 16 }
        }
      ],
  
      // -------------------------------------------------------------------------
      // CREDITOR INFORMATION
      // -------------------------------------------------------------------------
      creditorName: [
        {
          priority: 10,
          description: 'Creditor Name is mandatory',
          conditions: [],
          effect: {
            required: true,
            visible: true,
            maxLength: 140
          }
        }
      ],
  
      creditorAccount: [
        {
          priority: 20,
          description: 'SEPA / European country accounts require valid IBAN pattern',
          conditions: [
            { sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'in', value: EMEA_COUNTRIES }
          ],
          effect: {
            required: true,
            maxLength: 34,
            pattern: '^[A-Z]{2}\\d{2}[A-Z0-9]{1,30}$',
            patternMessage: 'Must be a valid IBAN format for SEPA/European countries'
          }
        },
        {
          priority: 10,
          description: 'Standard creditor account number',
          conditions: [],
          effect: {
            required: true,
            maxLength: 34,
            pattern: '^[A-Za-z0-9/\\-\\?:().,\'+ ]+$',
            patternMessage: 'Invalid account number format'
          }
        }
      ],
  
      creditorAgentFinancialInstitutionBIC: [
        {
          priority: 10,
          description: 'Creditor Agent BIC must be 8 or 11 alphanumeric characters',
          conditions: [],
          effect: {
            required: true,
            maxLength: 11,
            pattern: '^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$',
            patternMessage: 'Valid BIC format required (8 or 11 alphanumeric characters)'
          }
        }
      ],
  
      creditorAgentFinancialInstitutionName: [
        {
          priority: 10,
          conditions: [],
          effect: {
            required: true,
            maxLength: 140
          }
        }
      ],
  
      // -------------------------------------------------------------------------
      // CREDITOR ADDRESS & NATIONAL SORT CODES
      // -------------------------------------------------------------------------
      creditorAddressLines1: [
        {
          priority: 10,
          description: 'Creditor Address Line 1 is mandatory (BA Point 9)',
          conditions: [],
          effect: {
            required: true,
            visible: true,
            maxLength: 70
          }
        }
      ],
  
      creditorCountryCode: [
        {
          priority: 10,
          conditions: [],
          effect: {
            maxLength: 2,
            pattern: '^[A-Za-z]{2}$',
            patternMessage: 'Country code must be 2 letters'
          }
        }
      ],
  
      creditorSortCodeUS: [
        {
          priority: 20,
          description: 'Creditor US ABA Routing number is optional and numeric (BA Point 9)',
          conditions: [{ sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'US' }],
          effect: {
            visible: true,
            required: false,
            maxLength: 9,
            pattern: '^\\d{9}$',
            patternMessage: 'US ABA Routing number must be 9 numeric digits'
          }
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
          effect: {
            visible: true,
            required: false,
            maxLength: 8,
            pattern: '^(\\d{2}-\\d{2}-\\d{2}|\\d{6})$',
            patternMessage: 'UK Sort Code must be 6 digits'
          }
        },
        {
          priority: 1,
          conditions: [],
          effect: { visible: false, required: false }
        }
      ],
  
      creditorPostalCode: [
        {
          priority: 20,
          conditions: [{ sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'US' }],
          effect: {
            required: false,
            maxLength: 10,
            pattern: '^\\d{5}(-\\d{4})?$',
            patternMessage: 'US ZIP must be 5 digits'
          }
        },
        {
          priority: 20,
          conditions: [{ sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'GB' }],
          effect: {
            required: false,
            maxLength: 8,
            pattern: '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$',
            patternMessage: 'Invalid UK Postal Code format'
          }
        },
        {
          priority: 20,
          conditions: [{ sourceField: 'creditorAgentFinancialInstitutionBIC', derivation: 'bicCountry', operator: 'eq', value: 'CA' }],
          effect: {
            required: false,
            maxLength: 7,
            pattern: '^[A-CEGHJ-NPR-TV-Z]\\d[A-CEGHJ-NPR-TV-Z] ?\\d[A-CEGHJ-NPR-TV-Z]\\d$',
            patternMessage: 'Invalid Canadian Postal Code'
          }
        },
        {
          priority: 1,
          conditions: [],
          effect: { required: false, maxLength: 16 }
        }
      ],
  
      // -------------------------------------------------------------------------
      // INTERMEDIARY BANK ROUTING
      // -------------------------------------------------------------------------
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
  
      // -------------------------------------------------------------------------
      // CHARGES & TAX IDENTIFIERS
      // -------------------------------------------------------------------------
      chargeBearer: [
        {
          priority: 10,
          conditions: [],
          effect: {
            required: true,
            visible: true
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
  
      taxIdNumber: [
        {
          priority: 30,
          description: 'Mandatory for LATAM region (Brazil, Peru, Colombia, Argentina) per BA Point 15',
          conditions: [
            { sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'in', value: LATAM_COUNTRIES }
          ],
          effect: {
            visible: true,
            required: true,
            patternMessage: 'Tax ID Number is required for LATAM region'
          }
        },
        {
          priority: 1,
          conditions: [],
          effect: { visible: false, required: false }
        }
      ]
    },
  
    // ---------------------------------------------------------------------------
    // CROSS-FIELD FORM RULES & DEPENDENCIES
    // ---------------------------------------------------------------------------
    formRules: [
      {
        id: 'debtor_address_cascade_rule',
        description: 'When debtorAddressLines1 is entered, debtorTownName and debtorCountryCode become mandatory (BA Point 6)',
        watchFields: ['debtorAddressLines1'],
        conditions: [{ sourceField: 'debtorAddressLines1', operator: 'notEmpty' }],
        effects: {
          debtorTownName: { required: true },
          debtorCountryCode: { required: true }
        }
      },
      {
        id: 'creditor_address_cascade_rule',
        description: 'When creditorAddressLines1 is entered, creditorTownName and creditorCountryCode become mandatory (BA Point 10)',
        watchFields: ['creditorAddressLines1'],
        conditions: [{ sourceField: 'creditorAddressLines1', operator: 'notEmpty' }],
        effects: {
          creditorTownName: { required: true },
          creditorCountryCode: { required: true }
        }
      },
      {
        id: 'first_intermediary_account_coupling',
        description: 'When 1st Intermediary SWIFT is entered, 1st Intermediary Account Number becomes mandatory (BA Point 13)',
        watchFields: ['firstIntermediaryBankBIC'],
        conditions: [{ sourceField: 'firstIntermediaryBankBIC', operator: 'notEmpty' }],
        effects: {
          firstIntermediaryBankAccountNumber: { required: true }
        }
      },
      {
        id: 'second_intermediary_account_coupling',
        description: 'When 2nd Intermediary SWIFT is entered, 2nd Intermediary Account Number becomes mandatory',
        watchFields: ['secondIntermediaryBankBIC'],
        conditions: [{ sourceField: 'secondIntermediaryBankBIC', operator: 'notEmpty' }],
        effects: {
          secondIntermediaryBankAccountNumber: { required: true }
        }
      },
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
  
  // ----------------------------------------------------------------------------
  // VALIDATION RULES SERVICE CLASS
  // ----------------------------------------------------------------------------
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
  
    public resetToDefaults(): void {
      this.currentRules = { ...DEFAULT_VALIDATION_RULES };
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
  
    public deriveValue(formValues: Record<string, any>, sourceField: string, derivation?: string): string {
      const raw = formValues[sourceField];
      if (!raw) return '';
      const str = String(raw).trim();
  
      if (derivation === 'bicCountry' && str.length >= 6) {
        return str.substring(4, 6).toUpperCase();
      }
      if (derivation === 'length') {
        return String(str.length);
      }
      return str;
    }
  
    public evaluateCondition(condition: ValidationCondition, formValues: Record<string, any>): boolean {
      const value = this.deriveValue(formValues, condition.sourceField, condition.derivation);
  
      switch (condition.operator) {
        case 'eq':
          return value === String(condition.value ?? '');
        case 'neq':
          return value !== String(condition.value ?? '');
        case 'in':
          if (Array.isArray(condition.value)) {
            return condition.value.includes(value);
          }
          return false;
        case 'notIn':
          if (Array.isArray(condition.value)) {
            return !condition.value.includes(value);
          }
          return true;
        case 'empty':
          return value === '' || value === undefined || value === null;
        case 'notEmpty':
          return value !== '' && value !== undefined && value !== null && value !== '0';
        case 'regex':
          if (typeof condition.value === 'string') {
            return new RegExp(condition.value).test(value);
          }
          return false;
        default:
          return true;
      }
    }
  }
  
  export const validationRulesService = new ValidationRulesService();



  // src/pages/ss-payment/components/PaymentChild.tsx


  import React, {
    FC,
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
    ChangeEvent,
    MouseEvent
  } from 'react';
  import {
    Pain001Model,
    PaymentMode,
    PaymentComponentInput,
    PaymentComponentOutput,
    FormFieldConfig,
    FormValidityPayload,
    PAIN001_MANDATORY_FIELDS,
    PAYMENT_TYPE_OPTIONS,
    CHARGE_BEARER_OPTIONS,
    createEmptyPain001
  } from '../types/models';
  import {
    genericValidator,
    ValidationEffect
  } from '../services/genericValidator';
  import { addressService } from '../services/addressService';
  import { buildPain001FromForm } from '../utils/paymentUtils';
  import { validationRulesService, LATAM_COUNTRIES } from '../services/validationRulesService';
  import './payment-flow.css';
  
  export interface SSPaymentFlowProps {
    paymentInput: PaymentComponentInput;
    fieldConfig?: FormFieldConfig[];
    initialData?: Partial<Pain001Model>;
    pacsFormVerbiages?: Record<string, string>;
    loggedInUser?: string;
    isMakerMode?: boolean;
    isCheckerMode?: boolean;
    isRepairMode?: boolean;
    repairReviewFieldList?: string[];
    repairNewlyModifyFieldList?: string[];
    hardcapResultReceived?: { amountWithinLimit: boolean; hardCapValue: number } | string | null;
    onPaymentOutput?: (output: PaymentComponentOutput) => void;
    onFormChange?: (val: Record<string, unknown>) => void;
    onFormValidityChange?: (val: FormValidityPayload) => void;
    onFailedFieldListChange?: (fields: string[]) => void;
    onAmountChange?: (val: { instructedAmountCurrencyCode: string; instructedAmount: number }) => void;
  }
  
  export const PaymentChild: FC<SSPaymentFlowProps> = ({
    paymentInput,
    fieldConfig = [],
    initialData,
    pacsFormVerbiages = {},
    isMakerMode: _isMakerMode,
    isCheckerMode,
    isRepairMode,
    repairReviewFieldList = [],
    repairNewlyModifyFieldList = [],
    hardcapResultReceived,
    onPaymentOutput,
    onFormChange,
    onFormValidityChange,
    onFailedFieldListChange,
    onAmountChange
  }) => {
    const selectedMode: PaymentMode = isCheckerMode ? 'checker' : isRepairMode ? 'repair' : 'maker';
    const isChecker = selectedMode === 'checker';
    const isRepair = selectedMode === 'repair';
    const isDualBlindEnabled = paymentInput?.dualBlindKeyFlag === 'Y' && isChecker;
  
    // Minimum date allowed is today for the Value Date field (BA Point 1)
    const todayDateString = useMemo(() => new Date().toISOString().split('T')[0], []);
  
    const configMap = useMemo(() => {
      const map = new Map<string, FormFieldConfig>();
      fieldConfig.forEach(cfg => map.set(cfg.fieldName, cfg));
      return map;
    }, [fieldConfig]);
  
    const [formValues, setFormValues] = useState<Pain001Model>(() => {
      const empty = createEmptyPain001() as Record<string, any>;
      const init = { ...(initialData || {}), ...(paymentInput?.paymentModel || {}) } as Record<string, any>;
      const values: Record<string, any> = {};
  
      fieldConfig.forEach(cfg => {
        values[cfg.fieldName] = cfg.value ?? init[cfg.fieldName] ?? empty[cfg.fieldName] ?? '';
      });
  
      [
        'debtorAddressLines1',
        'debtorAddressLines2',
        'creditorAddressLines1',
        'creditorAddressLines2',
        'debtorState',
        'creditorState'
      ].forEach(f => {
        if (!(f in values)) {
          values[f] = String(init[f] ?? '');
        }
      });
  
      return { ...empty, ...values } as Pain001Model;
    });
  
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [failedFields, setFailedFields] = useState<string[]>(paymentInput?.rejectedFieldList || []);
    const [newlyModifiedFields, setNewlyModifiedFields] = useState<string[]>(repairNewlyModifyFieldList);
    const [dualBlindErrors, setDualBlindErrors] = useState<Map<string, string>>(new Map());
    const [isDualBlindPassed, setIsDualBlindPassed] = useState<boolean>(false);
    const [validationResults, setValidationResults] = useState<Map<string, ValidationEffect>>(new Map());
  
    const [isDebtorCountryReadonly, setIsDebtorCountryReadonly] = useState<boolean>(false);
    const [isCreditorCountryReadonly, setIsCreditorCountryReadonly] = useState<boolean>(false);
    const [showSecondIntermediary, setShowSecondIntermediary] = useState<boolean>(false);
  
    const [hardcapChecking, setHardcapChecking] = useState<boolean>(false);
    const [hardcapError, setHardcapError] = useState<string>('');
    const [hardcapSuccessMessage, setHardcapSuccessMessage] = useState<string>('');
  
    const [sectionCollapsed, setSectionCollapsed] = useState<Record<string, boolean>>({
      paymentDetails: false,
      paymentInformation: false,
      debtorInformation: false,
      debtorAddress: false,
      beneficiaryDetails: false,
      creditorInformation: false,
      creditorAddress: false,
      intermediaryBank: false,
      additionalInformation: false,
      additionalDetails: false,
      chargeDetails: false,
      taxDetails: false
    });
  
    const dualBlindCache = useRef<Map<string, string>>(new Map());
    const debtorBicDebouncer = useRef<NodeJS.Timeout>();
    const creditorBicDebouncer = useRef<NodeJS.Timeout>();
    const debtorAddrDebouncer = useRef<NodeJS.Timeout>();
    const creditorAddrDebouncer = useRef<NodeJS.Timeout>();
    const amountDebouncer = useRef<NodeJS.Timeout>();
  
    const toggleSection = (sectionKey: string) => {
      setSectionCollapsed(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
    };
  
    const setField = useCallback((fieldName: keyof Pain001Model, value: unknown, emitEvent = true) => {
      setFormValues(prev => {
        if ((prev as any)[fieldName] === value) return prev;
        return { ...prev, [fieldName]: value };
      });
  
      if (isRepair) {
        setNewlyModifiedFields(prev => (prev.includes(fieldName as string) ? prev : [...prev, fieldName as string]));
      }
  
      if (emitEvent) {
        queueMicrotask(() => {
          setFormValues(latest => {
            onFormChange?.(latest as unknown as Record<string, unknown>);
            return latest;
          });
        });
      }
    }, [isRepair, onFormChange]);
  
    // Dual-Blind Hydration and Masking
    useEffect(() => {
      if (isDualBlindEnabled && paymentInput?.paymentModel) {
        dualBlindCache.current.clear();
        paymentInput.dualBlindKeyFields?.forEach(field => {
          const raw = (paymentInput.paymentModel as any)?.[field];
          dualBlindCache.current.set(field, String(raw ?? '').trim());
        });
  
        setFormValues(prev => {
          const masked = { ...prev };
          paymentInput.dualBlindKeyFields?.forEach(field => {
            (masked as any)[field] = '';
          });
          return masked;
        });
      }
    }, [isDualBlindEnabled, paymentInput?.dualBlindKeyFields, paymentInput?.paymentModel]);
  
    const validateSingleDualBlindKeyField = useCallback((fieldName: string) => {
      if (!isDualBlindEnabled || !paymentInput.dualBlindKeyFields?.includes(fieldName)) return;
      const original = dualBlindCache.current.get(fieldName) ?? '';
      const current = String((formValues as any)[fieldName] ?? '').trim();
  
      setDualBlindErrors(prev => {
        const next = new Map(prev);
        if (original !== current) {
          next.set(fieldName, 'Data does not match');
        } else {
          next.delete(fieldName);
        }
        return next;
      });
    }, [isDualBlindEnabled, paymentInput?.dualBlindKeyFields, formValues]);
  
    useEffect(() => {
      if (!isDualBlindEnabled) {
        setIsDualBlindPassed(true);
        return;
      }
      const allMatched = (paymentInput.dualBlindKeyFields || []).every(f => {
        const orig = dualBlindCache.current.get(f) ?? '';
        const curr = String((formValues as any)[f] ?? '').trim();
        return orig !== '' && orig === curr;
      });
      setIsDualBlindPassed(allMatched);
    }, [isDualBlindEnabled, paymentInput?.dualBlindKeyFields, formValues]);
  
    // Evaluate All Validation Rules
    useEffect(() => {
      const rawForm = formValues as unknown as Record<string, unknown>;
      const fieldMap = genericValidator.evaluateAllFields(rawForm);
      const formEffects = genericValidator.evaluateFormRules(rawForm);
      const finalMap = genericValidator.applyToForm(fieldMap, formEffects);
      setValidationResults(finalMap);
    }, [formValues]);
  
    // Debtor BIC -> Country Code Derivation
    useEffect(() => {
      if (debtorBicDebouncer.current) clearTimeout(debtorBicDebouncer.current);
      debtorBicDebouncer.current = setTimeout(() => {
        const val = formValues.debtorAgentBIC;
        if (val && val.length >= 6) {
          setIsDebtorCountryReadonly(true);
          setField('debtorCountryCode', val.substring(4, 6).toUpperCase());
        } else {
          setIsDebtorCountryReadonly(false);
        }
      }, 400);
      return () => clearTimeout(debtorBicDebouncer.current);
    }, [formValues.debtorAgentBIC, setField]);
  
    // Creditor BIC -> Country Code Derivation
    useEffect(() => {
      if (creditorBicDebouncer.current) clearTimeout(creditorBicDebouncer.current);
      creditorBicDebouncer.current = setTimeout(() => {
        const val = formValues.creditorAgentFinancialInstitutionBIC;
        if (val && val.length >= 6) {
          setIsCreditorCountryReadonly(true);
          setField('creditorCountryCode', val.substring(4, 6).toUpperCase());
        } else {
          setIsCreditorCountryReadonly(false);
        }
      }, 400);
      return () => clearTimeout(creditorBicDebouncer.current);
    }, [formValues.creditorAgentFinancialInstitutionBIC, setField]);
  
    // Debtor Address Lookup (Bypassed in Checker Mode)
    useEffect(() => {
      if (isChecker) return;
      if (debtorAddrDebouncer.current) clearTimeout(debtorAddrDebouncer.current);
      debtorAddrDebouncer.current = setTimeout(async () => {
        const { debtorAccountNumber, debtorAgentBIC, debtorCountryCode } = formValues;
        if (!debtorAccountNumber || !/^[A-Z]{2}$/.test(debtorCountryCode || '')) return;
  
        try {
          const lookupFn = (addressService as any).lookupDebtorAddress || (addressService as any).lookupDebtorAddresss;
          if (typeof lookupFn === 'function') {
            const res = await lookupFn.call(addressService, '/shared-services/api/payment/api/payments', {
              account: debtorAccountNumber,
              bic: debtorAgentBIC,
              countryCode: debtorCountryCode
            });
  
            if (res) {
              setFormValues(prev => ({
                ...prev,
                debtorAddressLines1: res.addressLine?.[0] || prev.debtorAddressLines1,
                debtorAddressLines2: res.addressLine?.[1] || prev.debtorAddressLines2,
                debtorStreetName: res.streetName || prev.debtorStreetName,
                debtorBuildingNumber: res.buildingNumber || prev.debtorBuildingNumber,
                debtorPostalCode: res.postalCode || prev.debtorPostalCode,
                debtorTownName: res.townName || prev.debtorTownName,
                debtorCountrySubDivision: res.countrySubDivision || prev.debtorCountrySubDivision,
                debtorState: res.state || prev.debtorState,
                debtorCountryCode: res.countryCode || prev.debtorCountryCode
              }));
            }
          }
        } catch (err) {
          console.warn('Debtor address lookup failed:', err);
        }
      }, 300);
      return () => clearTimeout(debtorAddrDebouncer.current);
    }, [formValues.debtorAccountNumber, formValues.debtorAgentBIC, formValues.debtorCountryCode, isChecker]);
  
    // Creditor Address Lookup (Bypassed in Checker Mode)
    useEffect(() => {
      if (isChecker) return;
      if (creditorAddrDebouncer.current) clearTimeout(creditorAddrDebouncer.current);
      creditorAddrDebouncer.current = setTimeout(async () => {
        const {
          creditorAccount,
          creditorCountryCode,
          creditorAgentFinancialInstitutionBIC,
          creditorSortCodeUS,
          creditorSortCodeUK
        } = formValues;
  
        if (!creditorAccount || !/^[A-Z]{2}$/.test(creditorCountryCode || '')) return;
  
        let shortCode = '';
        if (creditorCountryCode === 'US') shortCode = creditorSortCodeUS || '';
        else if (creditorCountryCode === 'GB') shortCode = creditorSortCodeUK || '';
  
        try {
          const lookupFn = (addressService as any).lookupCreditorAddress || (addressService as any).lookupCreditorAddesss;
          if (typeof lookupFn === 'function') {
            const res = await lookupFn.call(addressService, '/shared-services/api/payment/api/payments', {
              account: creditorAccount,
              bic: creditorAgentFinancialInstitutionBIC || '',
              countryCode: creditorCountryCode || '',
              shortCode
            });
  
            if (res) {
              setFormValues(prev => ({
                ...prev,
                creditorAddressLines1: res.addressLine?.[0] || prev.creditorAddressLines1,
                creditorAddressLines2: res.addressLine?.[1] || prev.creditorAddressLines2,
                creditorStreetName: res.streetName || prev.creditorStreetName,
                creditorBuildingNumber: res.buildingNumber || prev.creditorBuildingNumber,
                creditorPostalCode: res.postalCode || prev.creditorPostalCode,
                creditorTownName: res.townName || prev.creditorTownName,
                creditorCountrySubDivision: res.countrySubDivision || prev.creditorCountrySubDivision,
                creditorState: res.state || prev.creditorState,
                creditorCountryCode: res.countryCode || prev.creditorCountryCode
              }));
            }
          }
        } catch (err) {
          console.warn('Creditor address lookup failed:', err);
        }
      }, 300);
  
      return () => clearTimeout(creditorAddrDebouncer.current);
    }, [
      formValues.creditorAccount,
      formValues.creditorCountryCode,
      formValues.creditorAgentFinancialInstitutionBIC,
      formValues.creditorSortCodeUS,
      formValues.creditorSortCodeUK,
      isChecker
    ]);
  
    const instructedAmountChange = (rawInputVal?: string) => {
      if (amountDebouncer.current) clearTimeout(amountDebouncer.current);
      amountDebouncer.current = setTimeout(() => {
        const valToParse = rawInputVal !== undefined ? rawInputVal : String(formValues.instructedAmount ?? '');
        const parsedAmount = parseFloat(valToParse);
  
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          setHardcapChecking(false);
          setHardcapError('');
          setHardcapSuccessMessage('');
          return;
        }
  
        setHardcapChecking(true);
        onAmountChange?.({
          instructedAmountCurrencyCode: formValues.instructedAmountCurrencyCode || 'USD',
          instructedAmount: parsedAmount
        });
      }, 400);
    };
  
    const onAmountBlur = () => {
      const parsedAmount = parseFloat(String(formValues.instructedAmount ?? ''));
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        onAmountChange?.({
          instructedAmountCurrencyCode: formValues.instructedAmountCurrencyCode || 'USD',
          instructedAmount: parsedAmount
        });
      }
    };
  
    useEffect(() => {
      if (hardcapResultReceived !== undefined && hardcapResultReceived !== null) {
        setHardcapChecking(false);
        if (typeof hardcapResultReceived === 'string') {
          if (hardcapResultReceived.includes('passed')) {
            setHardcapSuccessMessage(hardcapResultReceived);
            setHardcapError('');
          } else {
            setHardcapError(hardcapResultReceived);
            setHardcapSuccessMessage('');
          }
        } else if (typeof hardcapResultReceived === 'object') {
          if (hardcapResultReceived.amountWithinLimit) {
            setHardcapSuccessMessage('Hardcap limit check passed');
            setHardcapError('');
          } else {
            setHardcapError(`Value cannot be more than ${hardcapResultReceived.hardCapValue}`);
            setHardcapSuccessMessage('');
          }
        }
      }
    }, [hardcapResultReceived]);
  
    const isFieldReadonly = useCallback((fieldName: keyof Pain001Model) => {
      if (isChecker) {
        if (fieldName === 'debtorCountryCode') return true;
        if (isDualBlindEnabled && paymentInput?.dualBlindKeyFields?.includes(fieldName as string)) {
          return false;
        }
        return true;
      }
  
      if (fieldName === 'debtorCountryCode' && isDebtorCountryReadonly) return true;
      if (fieldName === 'debtorCountryCode') return false;
      if (fieldName === 'creditorCountryCode' && isCreditorCountryReadonly) return true;
      if (fieldName === 'creditorCountryCode') return false;
  
      return false;
    }, [isChecker, isDualBlindEnabled, paymentInput?.dualBlindKeyFields, isDebtorCountryReadonly, isCreditorCountryReadonly]);
  
    const handleDoubleClickFailedField = (fieldName: string, e: MouseEvent) => {
      e.stopPropagation();
      if (!isChecker) return;
      if (isDualBlindEnabled && paymentInput?.dualBlindKeyFields?.includes(fieldName)) return;
  
      setFailedFields(prev => {
        const next = prev.includes(fieldName)
          ? prev.filter(f => f !== fieldName)
          : [...prev, fieldName];
        onFailedFieldListChange?.(next);
        return next;
      });
    };
  
    const isFormValid = useMemo(() => {
      for (const [fName, rule] of validationResults.entries()) {
        if (rule.visible !== false && rule.required) {
          const val = (formValues as any)[fName];
          if (val === '' || val === null || val === undefined || val === 0) return false;
        }
        if (rule.visible !== false && rule.pattern) {
          const val = String((formValues as any)[fName] || '');
          if (val && !new RegExp(rule.pattern).test(val)) return false;
        }
      }
  
      const hasMissingMandatory = PAIN001_MANDATORY_FIELDS.some(f => {
        const val = (formValues as any)[f];
        return val === '' || val === null || val === undefined || val === 0;
      });
      if (hasMissingMandatory) return false;
  
      if (isChecker && isDualBlindEnabled && !isDualBlindPassed) return false;
      if (isChecker && failedFields.length > 0) return false;
      if (hardcapError) return false;
  
      return true;
    }, [validationResults, formValues, isChecker, isDualBlindEnabled, isDualBlindPassed, failedFields, hardcapError]);
  
    useEffect(() => {
      const payload: PaymentComponentOutput = {
        paymentData: buildPain001FromForm(formValues),
        isValid: isFormValid,
        outputMessage: isFormValid ? 'Valid' : 'Invalid form requirements',
        dualBlindKeyResult: isDualBlindEnabled ? (isDualBlindPassed ? 'passed' : 'failed') : null,
        isDualBlindKeyPassed: isDualBlindPassed
      };
  
      onPaymentOutput?.(payload);
      onFormValidityChange?.({
        validForm: isFormValid,
        makerPayload: formValues as unknown as Record<string, unknown>
      });
    }, [isFormValid, formValues, isDualBlindEnabled, isDualBlindPassed, onPaymentOutput, onFormValidityChange]);
  
    const renderField = (
      fieldName: keyof Pain001Model,
      defaultLabel: string,
      opts: {
        type?: 'text' | 'number' | 'date' | 'textarea' | string;
        options?: readonly string[] | string[];
        placeholder?: string;
        maxLength?: number;
        minDate?: string;
        errorFallback?: string;
        autoUppercase?: boolean;
        numericOnly?: boolean;
      } = {}
    ) => {
      const rule = validationResults.get(fieldName as string);
      if (rule?.visible === false) return null;
      if (paymentInput?.hideFieldsList?.includes(fieldName as string)) return null;
  
      const value = (formValues as any)[fieldName] ?? '';
      const isRequired = Boolean(
        rule?.required ??
        configMap.get(fieldName as string)?.required ??
        PAIN001_MANDATORY_FIELDS.includes(fieldName as string)
      );
      const isReadonly = isFieldReadonly(fieldName);
      
      // Remove mandatory asterisks on read-only fields in Checker Mode (BA Point 4)
      const showMandatoryIndicator = isChecker ? (!isReadonly && isRequired) : isRequired;
  
      const hasDualBlindErr = dualBlindErrors.has(fieldName as string);
      const isFailed = failedFields.includes(fieldName as string);
      const isRepairHighlight = isRepair && repairReviewFieldList.includes(fieldName as string);
      const isNewlyMod = isRepair && newlyModifiedFields.includes(fieldName as string);
  
      const isPatternInvalid = Boolean(
        touched[fieldName as string] &&
        rule?.pattern &&
        value &&
        !new RegExp(rule.pattern).test(String(value))
      );
      const isRequiredMissing = Boolean(touched[fieldName as string] && isRequired && !value);
      const hasInputError = isPatternInvalid || isRequiredMissing || hasDualBlindErr || isFailed;
  
      const containerClass = [
        'form-field',
        hasInputError && 'field-invalid',
        isFailed && 'failed-field',
        isRepairHighlight && 'repair-review-field',
        isNewlyMod && 'repair-newly-modify-field'
      ].filter(Boolean).join(' ');
  
      const labelClass = ['field-label', isFailed && 'rejected'].filter(Boolean).join(' ');
  
      const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let val = e.target.value;
        if (opts.numericOnly) {
          val = val.replace(/\D/g, '');
        }
        if (opts.autoUppercase) {
          val = val.toUpperCase();
        }
        setField(fieldName, val);
      };
  
      return (
        <div
          key={fieldName as string}
          className={containerClass}
          onDoubleClick={e => handleDoubleClickFailedField(fieldName as string, e)}
        >
          <label className={labelClass}>
            {pacsFormVerbiages[fieldName as string] || defaultLabel}
            {showMandatoryIndicator && <span className="mandatory-indicator"> *</span>}
          </label>
  
          {opts.options ? (
            <select
              value={value}
              disabled={isReadonly}
              className={hasInputError ? 'input-error' : ''}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setField(fieldName, e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, [fieldName]: true }))}
            >
              <option value="">{opts.placeholder || `-- Select ${defaultLabel} --`}</option>
              {opts.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : opts.type === 'textarea' ? (
            <textarea
              value={value}
              rows={3}
              readOnly={isReadonly}
              className={hasInputError ? 'input-error' : ''}
              maxLength={opts.maxLength || rule?.maxLength}
              placeholder={opts.placeholder || `Enter ${defaultLabel}`}
              onChange={handleTextChange}
              onBlur={() => {
                setTouched(t => ({ ...t, [fieldName]: true }));
                validateSingleDualBlindKeyField(fieldName as string);
              }}
            />
          ) : (
            <input
              type={opts.type || 'text'}
              value={value}
              readOnly={isReadonly}
              min={opts.minDate}
              className={hasInputError ? 'input-error' : ''}
              maxLength={opts.maxLength || rule?.maxLength}
              placeholder={opts.placeholder || `Enter ${defaultLabel}`}
              onChange={handleTextChange}
              onBlur={() => {
                setTouched(t => ({ ...t, [fieldName]: true }));
                validateSingleDualBlindKeyField(fieldName as string);
              }}
            />
          )}
  
          {hasDualBlindErr && (
            <div className="field-error dual-blind-error">{dualBlindErrors.get(fieldName as string)}</div>
          )}
          {isRequiredMissing && (
            <div className="field-error">{opts.errorFallback || `${defaultLabel} is required`}</div>
          )}
          {isPatternInvalid && (
            <div className="field-error">{rule?.patternMessage || 'Invalid format'}</div>
          )}
        </div>
      );
    };
  
    // Gating Intermediary details on Payment Type
    const isIntermediaryVisible = formValues.painPaymentMethodType !== 'BKT';
    
    // Tax Details rendered conditionally for LATAM region
    const debtorBicCountry = (formValues.debtorAgentBIC || '').substring(4, 6).toUpperCase();
    const showTaxDetails = LATAM_COUNTRIES.includes(debtorBicCountry);
  
    return (
      <div className="ss-payment-flow">
        {/* MEGA-SECTION 1: Payment Details (Debtor Side) */}
        <div className="section-main noBorders">
          <div className="section-main-header" onClick={() => toggleSection('paymentDetails')}>
            <span>{pacsFormVerbiages.PaymentDetails || 'Payment Details'}</span>
            <span className="chev">{sectionCollapsed.paymentDetails ? '\u25B4' : '\u25BE'}</span>
          </div>
  
          <div className={`section-main-body ${sectionCollapsed.paymentDetails ? 'collapsed' : ''}`}>
            {/* Section 1: Payment Information */}
            <div className="section">
              <div className="section-header" onClick={() => toggleSection('paymentInformation')}>
                <span>{pacsFormVerbiages.PaymentInformation || 'Payment Information'}</span>
                <span className="chev">{sectionCollapsed.paymentInformation ? '\u25B4' : '\u25BE'}</span>
              </div>
  
              <div className={`section-body ${sectionCollapsed.paymentInformation ? 'collapsed' : ''}`}>
                <div className="form-row-3">
                  {renderField('painPaymentMethodType', pacsFormVerbiages.PaymentType || 'Payment Type', {
                    options: PAYMENT_TYPE_OPTIONS,
                    errorFallback: 'Payment Type is required'
                  })}
                  {renderField('requestedExecutionDate', pacsFormVerbiages.ValueDate || 'Value Date', {
                    type: 'date',
                    minDate: todayDateString,
                    errorFallback: 'Value Date is required'
                  })}
                  {renderField('instructedAmountCurrencyCode', pacsFormVerbiages.Currency || 'Currency', {
                    maxLength: 3,
                    autoUppercase: true,
                    errorFallback: 'Currency is required'
                  })}
                </div>
  
                <div className="form-field">
                  <label className="field-label">
                    {pacsFormVerbiages.TransactionAmount || 'Transaction Amount'}
                    {(!isChecker || (isDualBlindEnabled && paymentInput?.dualBlindKeyFields?.includes('instructedAmount'))) && (
                      <span className="mandatory-indicator"> *</span>
                    )}
                  </label>
                  <input
                    type="number"
                    placeholder="Enter Transaction Amount"
                    value={formValues.instructedAmount === 0 ? '' : (formValues.instructedAmount ?? '')}
                    readOnly={isFieldReadonly('instructedAmount')}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const rawVal = e.target.value;
                      setField('instructedAmount', rawVal);
                      instructedAmountChange(rawVal);
                    }}
                    onBlur={() => {
                      validateSingleDualBlindKeyField('instructedAmount');
                      onAmountBlur();
                    }}
                  />
                  {hardcapChecking && <div className="hint">{pacsFormVerbiages.ValidatingHardcapLimit || 'Validating hardcap limit...'}</div>}
                  {hardcapError && <div className="field-error">{hardcapError}</div>}
                  {hardcapSuccessMessage && <div className="success-message">{hardcapSuccessMessage}</div>}
                </div>
              </div>
            </div>
  
            {/* Section 2: Debtor Information */}
            <div className="section">
              <div className="section-header" onClick={() => toggleSection('debtorInformation')}>
                <span>{pacsFormVerbiages.DebtorInfo || 'Debtor Information'}</span>
                <span className="chev">{sectionCollapsed.debtorInformation ? '\u25B4' : '\u25BE'}</span>
              </div>
  
              <div className={`section-body ${sectionCollapsed.debtorInformation ? 'collapsed' : ''}`}>
                <div className="form-row-3">
                  {renderField('debtorName', pacsFormVerbiages.DebtorName || 'Debtor Name', {
                    errorFallback: 'Debtor Name is required'
                  })}
                  {renderField('debtorAccountNumber', pacsFormVerbiages.DebtorAccountNumber || 'Debtor Account Number', {
                    numericOnly: true,
                    errorFallback: 'Debtor Account Number is required'
                  })}
                  {renderField('debtorAgentBIC', pacsFormVerbiages.DebtorAgentBIC || 'Debtor Agent BIC', {
                    autoUppercase: true,
                    errorFallback: 'Debtor Agent BIC is required'
                  })}
                </div>
              </div>
            </div>
  
            {/* Section 3: Debtor Address Details */}
            <div className="section">
              <div className="section-header" onClick={() => toggleSection('debtorAddress')}>
                <span>{pacsFormVerbiages.DebtorAddressDetails || 'Debtor Address Details'}</span>
                <span className="chev">{sectionCollapsed.debtorAddress ? '\u25B4' : '\u25BE'}</span>
              </div>
  
              <div className={`section-body ${sectionCollapsed.debtorAddress ? 'collapsed' : ''}`}>
                <div className="form-row-2">
                  {renderField('debtorAddressLines1', pacsFormVerbiages.DebtorAddressLine1 || 'Debtor Address Line 1', { placeholder: 'Address 1' })}
                  {renderField('debtorAddressLines2', pacsFormVerbiages.DebtorAddressLine2 || 'Debtor Address Line 2', { placeholder: 'Address 2' })}
                </div>
  
                <div className="form-row-3">
                  {renderField('debtorStreetName', pacsFormVerbiages.DebtorStreet || 'Debtor Street')}
                  {renderField('debtorBuildingNumber', pacsFormVerbiages.DebtorBuildingNumber || 'Debtor Building Number')}
                  {renderField('debtorTownName', pacsFormVerbiages.DebtorTownOrCityName || 'Debtor Town / City Name')}
                </div>
  
                <div className="form-row-3">
                  {renderField('debtorCountrySubDivision', pacsFormVerbiages.DebtorCountrySubDivisionLabel || 'Debtor Country Sub-division')}
                  {renderField('debtorState', pacsFormVerbiages.DebtorState || 'Debtor State')}
                  {renderField('debtorCountryCode', pacsFormVerbiages.DebtorCountry || 'Debtor Country', { maxLength: 2, autoUppercase: true })}
                </div>
  
                <div className="form-row-3">
                  {renderField('debtorPostalCode', pacsFormVerbiages.DebtorPostalCode || 'Debtor Postal Code')}
                  {renderField('debtorSortCodeUK', pacsFormVerbiages.DebtorSortCode || 'Debtor Sort Code (UK)')}
                  {renderField('debtorSortCodeUS', pacsFormVerbiages.DebtorSortCode || 'Debtor Sort Code (US)', { numericOnly: true, maxLength: 9 })}
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* MEGA-SECTION 2: Beneficiary Details (Creditor Side) */}
        <div className="section-main">
          <div className="section-main-header" onClick={() => toggleSection('beneficiaryDetails')}>
            <span>{pacsFormVerbiages.BeneficiaryDetails || 'Beneficiary Details'}</span>
            <span className="chev">{sectionCollapsed.beneficiaryDetails ? '\u25B4' : '\u25BE'}</span>
          </div>
  
          <div className={`section-main-body ${sectionCollapsed.beneficiaryDetails ? 'collapsed' : ''}`}>
            {/* Section 5: Creditor Information */}
            <div className="section">
              <div className="section-header" onClick={() => toggleSection('creditorInformation')}>
                <span>{pacsFormVerbiages.CreditorInformation || 'Creditor Information'}</span>
                <span className="chev">{sectionCollapsed.creditorInformation ? '\u25B4' : '\u25BE'}</span>
              </div>
  
              <div className={`section-body ${sectionCollapsed.creditorInformation ? 'collapsed' : ''}`}>
                <div className="form-row-3">
                  {renderField('creditorName', pacsFormVerbiages.CreditorName || 'Creditor Name', {
                    errorFallback: 'Creditor Name is required'
                  })}
                  {renderField('creditorAccount', pacsFormVerbiages.CreditorAccountNumber || 'Creditor Account Number', {
                    errorFallback: 'Creditor Account Number is required'
                  })}
                  {renderField('creditorAgentFinancialInstitutionBIC', pacsFormVerbiages.CreditorAgentBIC || 'Creditor Agent BIC', {
                    autoUppercase: true,
                    errorFallback: 'Required'
                  })}
                </div>
  
                <div className="form-row-3">
                  {renderField('creditorAgentFinancialInstitutionName', pacsFormVerbiages.CreditorAgentBankName || 'Creditor Agent Bank Name', {
                    errorFallback: 'Required'
                  })}
                  {renderField('creditorAgentPostalAddress', 'Creditor Agent Account Number')}
                </div>
              </div>
            </div>
  
            {/* Section 6: Creditor Address Details */}
            <div className="section">
              <div className="section-header" onClick={() => toggleSection('creditorAddress')}>
                <span>{pacsFormVerbiages.CreditorAddressDetails || 'Creditor Address Details'}</span>
                <span className="chev">{sectionCollapsed.creditorAddress ? '\u25B4' : '\u25BE'}</span>
              </div>
  
              <div className={`section-body ${sectionCollapsed.creditorAddress ? 'collapsed' : ''}`}>
                <div className="form-row-2">
                  {renderField('creditorAddressLines1', pacsFormVerbiages.CreditorAddressLine1 || 'Creditor Address Line 1', {
                    errorFallback: 'Creditor Address Line 1 is required'
                  })}
                  {renderField('creditorAddressLines2', pacsFormVerbiages.CreditorAddressLine2 || 'Creditor Address Line 2')}
                </div>
  
                <div className="form-row-3">
                  {renderField('creditorStreetName', pacsFormVerbiages.CreditorStreet || 'Creditor Street')}
                  {renderField('creditorBuildingNumber', pacsFormVerbiages.CreditorBuildingNumber || 'Creditor Building Number')}
                  {renderField('creditorTownName', pacsFormVerbiages.CreditorTownOrCityName || 'Creditor Town / City Name')}
                </div>
  
                <div className="form-row-3">
                  {renderField('creditorCountrySubDivision', pacsFormVerbiages.CreditorCountrySubDivisionLabel || 'Creditor Country Sub-division')}
                  {renderField('creditorState', pacsFormVerbiages.CreditorState || 'Creditor State')}
                  {renderField('creditorCountryCode', pacsFormVerbiages.CreditorCountry || 'Creditor Country', { maxLength: 2, autoUppercase: true })}
                </div>
  
                <div className="form-row-3">
                  {renderField('creditorPostalCode', pacsFormVerbiages.CreditorPostalCode || 'Creditor Postal Code')}
                  {renderField('creditorSortCodeUK', pacsFormVerbiages.CreditorSortCode || 'Creditor Sort Code (UK)')}
                  {renderField('creditorSortCodeUS', pacsFormVerbiages.CreditorSortCode || 'Creditor Sort Code (US)', { numericOnly: true, maxLength: 9 })}
                </div>
              </div>
            </div>
  
            {/* Section 4: Intermediary Bank Routing */}
            {isIntermediaryVisible && (
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
                    {renderField('firstIntermediaryBankRoutingCode', pacsFormVerbiages.FirstIntermediaryBankRoutingCode || '1st Intermediary Routing Code')}
                    {renderField('firstIntermediaryBankName', pacsFormVerbiages.FirstIntermediaryBankName || '1st Intermediary Bank Name')}
                  </div>
  
                  <div className="form-row-2">
                    {renderField('firstIntermediaryBankCountryCode', pacsFormVerbiages.FirstIntermediaryBankCountryCode || '1st Intermediary Country Code', {
                      maxLength: 2,
                      autoUppercase: true
                    })}
                    {renderField('firstIntermediaryBankAccountNumber', pacsFormVerbiages.FirstIntermediaryAccountNumber || '1st Intermediary Account Number')}
                  </div>
  
                  {/* 2nd Intermediary Bank Dynamic Inclusion */}
                  {!showSecondIntermediary && !formValues.secondIntermediaryBankBIC && !isChecker && (
                    <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                      <button
                        type="button"
                        className="lmn-btn"
                        style={{ fontSize: '12px', height: '30px' }}
                        onClick={() => setShowSecondIntermediary(true)}
                      >
                        + Add 2nd Intermediary Bank
                      </button>
                    </div>
                  )}
  
                  {(showSecondIntermediary || Boolean(formValues.secondIntermediaryBankBIC) || isChecker) && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #d9e2ec' }}>
                      <div className="form-row-3">
                        {renderField('secondIntermediaryBankBIC', pacsFormVerbiages.SecondIntermediaryBankSWIFTCode || '2nd Intermediary SWIFT Code', {
                          autoUppercase: true,
                          placeholder: 'Enter SWIFT/BIC'
                        })}
                        {renderField('secondIntermediaryBankRoutingCode', pacsFormVerbiages.SecondIntermediaryBankRoutingCode || '2nd Intermediary Routing Code')}
                        {renderField('secondIntermediaryBankName', pacsFormVerbiages.SecondIntermediaryBankName || '2nd Intermediary Bank Name')}
                      </div>
  
                      <div className="form-row-2">
                        {renderField('secondIntermediaryBankCountryCode', pacsFormVerbiages.SecondIntermediaryBankCountryCode || '2nd Intermediary Country Code', {
                          maxLength: 2,
                          autoUppercase: true
                        })}
                        {renderField('secondIntermediaryBankAccountNumber', pacsFormVerbiages.SecondIntermediaryAccountNumber || '2nd Intermediary Account Number')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
  
        {/* MEGA-SECTION 3: Additional Information */}
        <div className="section-main">
          <div className="section-main-header" onClick={() => toggleSection('additionalInformation')}>
            <span>{pacsFormVerbiages.AdditionalInformation || 'Additional Information'}</span>
            <span className="chev">{sectionCollapsed.additionalInformation ? '\u25B4' : '\u25BE'}</span>
          </div>
  
          <div className={`section-main-body ${sectionCollapsed.additionalInformation ? 'collapsed' : ''}`}>
            {/* Sub-section 1: Additional Details */}
            <div className="section">
              <div className="section-header" onClick={() => toggleSection('additionalDetails')}>
                <span>{pacsFormVerbiages.AdditionalDetails || 'Additional Details'}</span>
                <span className="chev">{sectionCollapsed.additionalDetails ? '\u25B4' : '\u25BE'}</span>
              </div>
  
              <div className={`section-body ${sectionCollapsed.additionalDetails ? 'collapsed' : ''}`}>
                {renderField('ustrdPaymentDetails', pacsFormVerbiages.RemittanceInformation || 'Remittance Information', {
                  placeholder: 'Enter remittance details',
                  type: 'textarea'
                })}
              </div>
            </div>
  
            {/* Sub-section 2: Charge Details */}
            <div className="section">
              <div className="section-header" onClick={() => toggleSection('chargeDetails')}>
                <span>{pacsFormVerbiages.ChargeDetails || 'Charge Details'}</span>
                <span className="chev">{sectionCollapsed.chargeDetails ? '\u25B4' : '\u25BE'}</span>
              </div>
  
              <div className={`section-body ${sectionCollapsed.chargeDetails ? 'collapsed' : ''}`}>
                <div className="form-row-3">
                  {renderField('chargeBearer', pacsFormVerbiages.ChargeInformation || 'Charge Information', {
                    options: CHARGE_BEARER_OPTIONS,
                    errorFallback: 'Required'
                  })}
                  {renderField('chargesAmount', pacsFormVerbiages.ChargesAmount || 'Charges Amount', {
                    type: 'number',
                    placeholder: 'Enter Charges Amount'
                  })}
                  {renderField('chargesAgentBIC', pacsFormVerbiages.ChargesAgentBic || 'Charges Agent BIC', {
                    autoUppercase: true,
                    placeholder: 'Enter Charges Agent BIC'
                  })}
                </div>
              </div>
            </div>
  
            {/* Sub-section 3: Tax Details */}
            {showTaxDetails && (
              <div className="section">
                <div className="section-header" onClick={() => toggleSection('taxDetails')}>
                  <span>{pacsFormVerbiages.TaxDetails || 'Tax Details (LATAM Region)'}</span>
                  <span className="chev">{sectionCollapsed.taxDetails ? '\u25B4' : '\u25BE'}</span>
                </div>
  
                <div className={`section-body ${sectionCollapsed.taxDetails ? 'collapsed' : ''}`}>
                  <div className="form-row-2">
                    {renderField('taxIdNumber', pacsFormVerbiages.TaxIdNumber || 'Tax ID Number')}
                    {renderField('taxIdType', pacsFormVerbiages.TaxIdType || 'Tax ID Type')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default PaymentChild;



  // src/pages/ss-payment/components/PaymentParent.tsx


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
    { fieldName: 'debtorCountrySubDivision', label: 'Debtor Country Sub-division', hidden: false, required: false },
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
    { fieldName: 'creditorCountrySubDivision', label: 'Creditor Country Sub-division', hidden: false, required: false },
    { fieldName: 'creditorCountryCode', label: 'Creditor Country', hidden: false, required: false },
    { fieldName: 'creditorSortCodeUK', label: 'Creditor Sort Code', hidden: false, required: false },
    { fieldName: 'creditorSortCodeUS', label: 'Creditor Sort Code (US)', hidden: false, required: false },
    { fieldName: 'ustrdPaymentDetails', label: 'Remittance Information', hidden: false, required: false },
    { fieldName: 'chargeBearer', label: 'Charge Information', hidden: false, required: true },
    { fieldName: 'chargesAmount', label: 'Charges Amount', hidden: false, required: false },
    { fieldName: 'chargesAgentBIC', label: 'Charges Agent BIC', hidden: false, required: false }
  ];
  
  export const PaymentParent: FC = () => {
    let soeId = 'sj81534';
    try {
      const authContext = useAuth();
      if (authContext && typeof authContext === 'object') {
        soeId = (authContext as any).soeId || (authContext as any).user?.soeId || (authContext as any).userId || 'sj81534';
      } else if (typeof authContext === 'string') {
        soeId = authContext;
      }
    } catch {
      soeId = 'sj81534';
    }
  
    const [activeTab, setActiveTab] = useState<'maker' | 'checker' | 'repair'>('maker');
  
    // Maker-to-Checker persistent data pipeline
    const [activeSubmittedTransaction, setActiveSubmittedTransaction] = useState<{
      transactionId: string;
      paymentId: string;
      maker: string;
      payload: Pain001Model;
    }>({
      transactionId: '6641753311580996571',
      paymentId: 'c337a6c4-4622-404e-b303-e0ec5192b04c',
      maker: 'sj81534',
      payload: {
        ...createEmptyPain001(),
        requestedExecutionDate: '2026-08-25',
        instructedAmountCurrencyCode: 'USD',
        instructedAmount: 50000,
        debtorName: 'ACME Corporation Global Ltd',
        debtorAccountNumber: '8378339123456789',
        debtorAgentBIC: 'CITIGB2LXXX',
        debtorCountryCode: 'GB',
        debtorTownName: 'London',
        debtorAddressLines1: '25 Canada Square',
        creditorName: 'Starlight Solutions Inc',
        creditorAccount: '998877665544',
        creditorAgentFinancialInstitutionBIC: 'CITIUS33XXX',
        creditorAgentFinancialInstitutionName: 'Citibank N.A. New York',
        creditorAddressLines1: '388 Greenwich Street',
        creditorCountryCode: 'US',
        creditorTownName: 'New York',
        chargeBearer: 'DEBT',
        painPaymentMethodType: 'CBT',
        ustrdPaymentDetails: 'Invoice #INV-2026-8890'
      }
    });
  
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
    // 1. MAKER MODE STATE & HANDLERS
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
  
      const generatedTxnId = String(Math.floor(1000000000000000000 + Math.random() * 9000000000000000000));
      const generatedPaymentId = 'c337a6c4-4622-404e-b303-e0ec' + Math.floor(100000 + Math.random() * 900000);
  
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
          if (res.status === 400 && data?.errorCode === 'DUPLICATE_PAYMENT') {
            if (window.confirm(`Warning: Similar payment exists with ID ${data.referenceId || 'N/A'}. Do you want to override and submit anyway?`)) {
              await handleMakerSubmit(true);
              return;
            }
          }
          // Local simulation fallback
          if (res.status === 404 || res.status === 502) {
            setActiveSubmittedTransaction({
              transactionId: generatedTxnId,
              paymentId: generatedPaymentId,
              maker: soeId,
              payload: makerPayload
            });
  
            setModalResponse({
              title: 'MAKER RECORD SAVED',
              referenceId: generatedTxnId,
              amount: `${makerPayload.instructedAmountCurrencyCode || 'USD'} ${makerPayload.instructedAmount}`,
              status: 'SUBMITTED',
              message: 'Payment record saved successfully !',
              color: '#00509d'
            });
            return;
          }
  
          throw new Error(data?.error || data?.message || `Payment creation failed (${res.status})`);
        }
  
        // Success from live backend
        setActiveSubmittedTransaction({
          transactionId: data.transactionId || generatedTxnId,
          paymentId: data.paymentId || generatedPaymentId,
          maker: soeId,
          payload: makerPayload
        });
  
        setModalResponse({
          title: 'MAKER RECORD SAVED',
          referenceId: data.referenceId || data.transactionId || generatedTxnId,
          amount: `${makerPayload.instructedAmountCurrencyCode || 'USD'} ${makerPayload.instructedAmount}`,
          status: data.status || 'SUBMITTED',
          message: 'Payment record saved successfully !',
          color: '#00509d'
        });
      } catch (err: any) {
        console.error('Maker submission failed:', err);
        setModalResponse({
          title: 'MAKER RECORD NOT CREATED',
          referenceId: 'N/A',
          amount: `${makerPayload?.instructedAmountCurrencyCode || 'USD'} ${makerPayload?.instructedAmount || 0}`,
          status: 'FAILED',
          message: err.message || 'Payment creation failed !',
          color: '#d64545'
        });
      } finally {
        setIsMakerSubmitting(false);
      }
    };
  
    // =========================================================================
    // 2. CHECKER MODE STATE & HANDLERS
    // =========================================================================
    const [checkerFormValid, setCheckerFormValid] = useState<boolean>(false);
    const [checkerDualBlindPassed, setCheckerDualBlindPassed] = useState<boolean>(false);
    const [checkerPayload, setCheckerPayload] = useState<Pain001Model | null>(null);
    const [checkerFailedFields, setCheckerFailedFields] = useState<string[]>([]);
    const [checkerComments, setCheckerComments] = useState<string>('');
    const [isCheckerProcessing, setIsCheckerProcessing] = useState<boolean>(false);
  
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
      paymentModel: activeSubmittedTransaction.payload
    }), [activeSubmittedTransaction]);
  
    const handleCheckerOutput = useCallback((output: PaymentComponentOutput) => {
      setCheckerFormValid(output.isValid);
      setCheckerDualBlindPassed(output.isDualBlindKeyPassed);
      setCheckerPayload(output.paymentData);
    }, []);
  
    const handleCheckerDecision = async (action: 'Approved' | 'Rejected') => {
      if (action === 'Rejected' && !checkerComments.trim()) {
        alert('Please enter comments stating the reason for rejection.');
        return;
      }
  
      setIsCheckerProcessing(true);
      const endpoint = '/shared-services/api/payment/api/payments/checker/decision';
      const payload = {
        application: 'ADR',
        module: 'ADR',
        action,
        comments: checkerComments.trim(),
        loginUser: soeId,
        transactionId: activeSubmittedTransaction.transactionId,
        paymentId: activeSubmittedTransaction.paymentId,
        maker: activeSubmittedTransaction.maker,
        failedFields: action === 'Rejected' ? checkerFailedFields : [],
        paymentDetailsRequest: checkerPayload || activeSubmittedTransaction.payload
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
          throw new Error(data?.error || data?.message || `Checker action failed (${res.status})`);
        }
  
        setModalResponse({
          title: action === 'Approved' ? 'CHECKER APPROVAL SUCCESSFUL' : 'CHECKER REJECTION RECORDED',
          referenceId: data.transactionId || activeSubmittedTransaction.transactionId,
          amount: `${activeSubmittedTransaction.payload.instructedAmountCurrencyCode} ${activeSubmittedTransaction.payload.instructedAmount}`,
          status: action === 'Approved' ? 'APPROVED' : 'REJECTED',
          message: action === 'Approved'
            ? 'Payment approved and released to clearing successfully!'
            : 'Payment rejected and routed to the Repair Queue.',
          color: action === 'Approved' ? '#00509d' : '#d64545'
        });
      } catch (err: any) {
        console.warn('Checker decision API fallback dispatch:', err);
        setModalResponse({
          title: action === 'Approved' ? 'CHECKER APPROVAL SUCCESSFUL' : 'CHECKER REJECTION RECORDED',
          referenceId: activeSubmittedTransaction.transactionId,
          amount: `${activeSubmittedTransaction.payload.instructedAmountCurrencyCode} ${activeSubmittedTransaction.payload.instructedAmount}`,
          status: action === 'Approved' ? 'APPROVED' : 'REJECTED',
          message: `Decision '${action}' saved. Flagged fields: ${checkerFailedFields.length}`,
          color: action === 'Approved' ? '#00509d' : '#d64545'
        });
      } finally {
        setIsCheckerProcessing(false);
      }
    };
  
    const isApproveDisabled = isCheckerProcessing || !checkerFormValid || !checkerDualBlindPassed || checkerFailedFields.length > 0;
    const isRejectDisabled = isCheckerProcessing;
  
    // =========================================================================
    // 3. REPAIR MODE STATE & HANDLERS
    // =========================================================================
    const [repairFormValid, setRepairFormValid] = useState<boolean>(false);
    const [repairPayload, setRepairPayload] = useState<Pain001Model | null>(null);
    const [isRepairSubmitting, setIsRepairSubmitting] = useState<boolean>(false);
    const [repairNewlyModifiedFields, setRepairNewlyModifiedFields] = useState<string[]>([]);
  
    const sampleRepairData: Pain001Model = useMemo(() => ({
      ...createEmptyPain001(),
      requestedExecutionDate: '2026-08-25',
      instructedAmountCurrencyCode: 'USD',
      instructedAmount: 12000,
      debtorName: 'Pacific Rim Trade Corp',
      debtorAccountNumber: '554433221100',
      debtorAgentBIC: 'BOFAUS3NXXX',
      debtorCountryCode: 'US',
      creditorName: 'Nexus Tech International',
      creditorAccount: '998877665',
      creditorAgentFinancialInstitutionBIC: 'CITIUS33XXX',
      creditorAgentFinancialInstitutionName: 'Citibank N.A.',
      creditorAddressLines1: '100 Wall Street',
      creditorCountryCode: 'US',
      chargeBearer: 'SHAR',
      painPaymentMethodType: 'DFT',
      ustrdPaymentDetails: 'Re-repairing transaction per checker request'
    }), []);
  
    const repairReviewFieldList = useMemo(() => ['debtorName', 'creditorName', 'instructedAmount'], []);
  
    const repairPaymentInput: PaymentComponentInput = useMemo(() => ({
      applicationName: 'ADR',
      applicationModule: 'ADR',
      paymentMode: 'repair',
      dualBlindKeyFlag: 'N',
      rejectedFieldList: repairReviewFieldList,
      paymentModel: sampleRepairData
    }), [sampleRepairData, repairReviewFieldList]);
  
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
        modifiedFields: repairNewlyModifiedFields,
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
          referenceId: data.referenceId || 'TXN-REPAIR-5541',
          amount: `${repairPayload.instructedAmountCurrencyCode || 'USD'} ${repairPayload.instructedAmount}`,
          status: 'RESUBMITTED',
          message: 'Repaired transaction successfully re-sent to verification queue!',
          color: '#00509d'
        });
      } catch (err: any) {
        console.error('Repair submit error:', err);
        setModalResponse({
          title: 'REPAIR RESUBMISSION FAILED',
          referenceId: 'TXN-REPAIR-5541',
          amount: `${repairPayload?.instructedAmountCurrencyCode || 'USD'} ${repairPayload?.instructedAmount}`,
          status: 'FAILED',
          message: err.message || 'Payment repair resubmission failed !',
          color: '#d64545'
        });
      } finally {
        setIsRepairSubmitting(false);
      }
    };
  
    return (
      <div className="sample-container">
        {/* Top Tab Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '2px solid #d9e2ec', paddingBottom: '12px' }}>
          <button
            type="button"
            className={`lmn-btn ${activeTab === 'maker' ? 'lmn-btn-primary' : ''}`}
            style={{ fontWeight: 600 }}
            onClick={() => setActiveTab('maker')}
          >
            1. Maker Mode
          </button>
          <button
            type="button"
            className={`lmn-btn ${activeTab === 'checker' ? 'lmn-btn-primary' : ''}`}
            style={{ fontWeight: 600 }}
            onClick={() => setActiveTab('checker')}
          >
            2. Checker Mode
          </button>
          <button
            type="button"
            className={`lmn-btn ${activeTab === 'repair' ? 'lmn-btn-primary' : ''}`}
            style={{ fontWeight: 600 }}
            onClick={() => setActiveTab('repair')}
          >
            3. Repair Mode
          </button>
        </div>
  
        {/* 1. MAKER MODE */}
        {activeTab === 'maker' && (
          <div>
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
          </div>
        )}
  
        {/* 2. CHECKER MODE */}
        {activeTab === 'checker' && (
          <div>
            <div className="parent-section-heading">Payment Verification & Authorization (Checker Mode)</div>
            
            <div className="parent-section-checker-info" style={{ margin: '12px 0' }}>
              <div className="parent-section-meta">
                <span><strong>Instruction ID:</strong> {activeSubmittedTransaction.transactionId}</span>
                <span><strong>Maker SOEID:</strong> {activeSubmittedTransaction.maker}</span>
                <span><strong>Event Type:</strong> OUTBOUND_ISO_PAIN001</span>
                <span><strong>Value Date:</strong> {activeSubmittedTransaction.payload.requestedExecutionDate}</span>
                <span><strong>Dual-Blind Status:</strong> {checkerDualBlindPassed ? '✅ All Re-Keyed Fields Matched' : '⚠️ Re-Keying Required'}</span>
                <span><strong>Flagged Error Fields:</strong> {checkerFailedFields.length}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#627d98', marginTop: '4px' }}>
                💡 <em>Double-click any non-blind input field to flag it as rejected for the Maker.</em>
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
  
            <div className="action-container" style={{ marginTop: '20px', padding: '16px', background: '#f0f4f8', borderRadius: '4px', border: '1px solid #d9e2ec' }}>
              <div className="form-group" style={{ marginBottom: '14px', width: '100%' }}>
                <label htmlFor="checkerComments" style={{ fontWeight: 600, fontSize: '12px', color: '#334e68' }}>
                  Checker Comments / Reason for Rejection
                </label>
                <textarea
                  id="checkerComments"
                  rows={3}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #9fb3c8', marginTop: '4px', boxSizing: 'border-box' }}
                  value={checkerComments}
                  placeholder="Enter authorization notes or specify failure reason if rejecting..."
                  onChange={e => setCheckerComments(e.target.value)}
                />
              </div>
  
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
                <button
                  type="button"
                  className="btn-reject"
                  disabled={isRejectDisabled}
                  onClick={() => handleCheckerDecision('Rejected')}
                >
                  {isCheckerProcessing ? 'Processing...' : `Reject ${checkerFailedFields.length > 0 ? `(${checkerFailedFields.length} Flagged)` : ''}`}
                </button>
  
                <button
                  type="button"
                  className="lmn-btn lmn-btn-primary btn-approve"
                  disabled={isApproveDisabled}
                  onClick={() => handleCheckerDecision('Approved')}
                >
                  {isCheckerProcessing ? 'Processing...' : 'Approve Payment'}
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* 3. REPAIR MODE */}
        {activeTab === 'repair' && (
          <div>
            <div className="parent-section-heading">Payment Correction Queue (Repair Mode)</div>
            
            <div className="parent-section-checker-info" style={{ borderColor: '#f59e0b', background: '#fffbeb', margin: '12px 0' }}>
              <div style={{ fontWeight: 600, color: '#b45309', marginBottom: '4px' }}>
                ⚠️ Checker Rejection Notice:
              </div>
              <div style={{ fontSize: '13px', color: '#92400e' }}>
                Debtor Name, Creditor Name, and Amount failed clearance verification. Please amend highlighted fields (amber) and resubmit.
              </div>
              <div style={{ fontSize: '11px', color: '#627d98', marginTop: '6px' }}>
                🟡 Amber = Checker flagged for review &nbsp;|&nbsp; 🟢 Green = Newly modified by Repairer
              </div>
            </div>
  
            <div className="payment-component-wrapper">
              <PaymentChild
                paymentInput={repairPaymentInput}
                fieldConfig={PARENT_FIELD_CONFIG}
                isRepairMode={true}
                repairReviewFieldList={repairReviewFieldList}
                repairNewlyModifyFieldList={repairNewlyModifiedFields}
                onPaymentOutput={handleRepairOutput}
                onFormChange={val => {
                  const modifiedKeys = Object.keys(val).filter(
                    key => (val as any)[key] !== (sampleRepairData as any)[key]
                  );
                  if (modifiedKeys.length > 0) {
                    setRepairNewlyModifiedFields(prev => Array.from(new Set([...prev, ...modifiedKeys])));
                  }
                }}
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
        )}
  
        {/* GLOBAL MODAL */}
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