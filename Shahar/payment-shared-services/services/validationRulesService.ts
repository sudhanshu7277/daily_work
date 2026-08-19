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

export const DEFAULT_VALIDATION_RULES: Pain001ValidationRules = {
  version: '3.3.0',
  lastUpdated: '2026-08-19',
  fields: {
    painPaymentMethodType: [
      {
        priority: 10,
        description: 'Payment method options CBT, BKT, DFT',
        conditions: [],
        effect: { required: false, visible: true }
      }
    ],

    requestedExecutionDate: [
      {
        priority: 10,
        description: 'Value date is mandatory',
        conditions: [],
        effect: { required: true, visible: true }
      }
    ],

    instructedAmountCurrencyCode: [
      {
        priority: 10,
        description: 'Currency code must be exactly 3 uppercase letters',
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
      {
        priority: 30,
        description: 'Zero decimal currencies',
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
      {
        priority: 30,
        description: '3 decimal currencies',
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
      {
        priority: 10,
        description: 'Standard 2 decimal currencies',
        conditions: [],
        effect: {
          required: true,
          decimalPlaces: 2,
          pattern: '^\\d+(\\.\\d{1,2})?$',
          patternMessage: 'Up to 2 decimal places allowed'
        }
      }
    ],

    debtorName: [
      {
        priority: 10,
        description: 'Debtor Name is mandatory',
        conditions: [],
        effect: { required: true, visible: true, maxLength: 140 }
      }
    ],

    debtorAccountNumber: [
      {
        priority: 30,
        description: 'UK and EMEA require exactly 16 numeric digits',
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
      {
        priority: 10,
        description: 'General numeric account number',
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
        description: 'Debtor Agent BIC must be 8 or 11 alphanumeric characters',
        conditions: [],
        effect: {
          required: true,
          maxLength: 11,
          pattern: '^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$',
          patternMessage: 'Valid BIC format required (8 or 11 alphanumeric characters)'
        }
      }
    ],

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
        description: 'US ABA Routing number must be exactly 9 numeric digits',
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
        description: 'UK Sort Code must be 6 digits',
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

    creditorName: [
      {
        priority: 10,
        description: 'Creditor Name is mandatory',
        conditions: [],
        effect: { required: true, visible: true, maxLength: 140 }
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
        effect: { required: true, maxLength: 140 }
      }
    ],

    creditorAddressLines1: [
      {
        priority: 10,
        description: 'Creditor Address Line 1 is mandatory',
        conditions: [],
        effect: { required: true, visible: true, maxLength: 70 }
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
        description: 'Creditor US ABA Routing number is optional and numeric',
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

    chargeBearer: [
      {
        priority: 10,
        conditions: [],
        effect: { required: true, visible: true }
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

    // -------------------------------------------------------------------------
    // 6 LATAM TAX DETAILS FIELDS (Image 18)
    // -------------------------------------------------------------------------
    taxIdNumber: [
      {
        priority: 30,
        description: 'Tax ID Number is mandatory for LATAM region',
        conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'in', value: LATAM_COUNTRIES }],
        effect: { visible: true, required: true, patternMessage: 'Tax ID Number is required' }
      },
      {
        priority: 1,
        conditions: [],
        effect: { visible: false, required: false }
      }
    ],

    taxIdType: [
      {
        priority: 30,
        description: 'Tax ID Type is mandatory for LATAM region',
        conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'in', value: LATAM_COUNTRIES }],
        effect: { visible: true, required: true, patternMessage: 'Tax ID Type is required' }
      },
      {
        priority: 1,
        conditions: [],
        effect: { visible: false, required: false }
      }
    ],

    purposeOfPayment: [
      {
        priority: 30,
        description: 'Purpose of Payment is mandatory for LATAM region',
        conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'in', value: LATAM_COUNTRIES }],
        effect: { visible: true, required: true, patternMessage: 'Purpose of Payment is required' }
      },
      {
        priority: 1,
        conditions: [],
        effect: { visible: false, required: false }
      }
    ],

    taxPurposeCode: [
      {
        priority: 30,
        description: 'Tax Purpose Code is mandatory for LATAM region',
        conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'in', value: LATAM_COUNTRIES }],
        effect: { visible: true, required: true, patternMessage: 'Tax Purpose Code is required' }
      },
      {
        priority: 1,
        conditions: [],
        effect: { visible: false, required: false }
      }
    ],

    regulatoryReportingCode: [
      {
        priority: 30,
        description: 'Regulatory Reporting Code is mandatory for LATAM region',
        conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'in', value: LATAM_COUNTRIES }],
        effect: { visible: true, required: true, patternMessage: 'Regulatory Reporting Code is required' }
      },
      {
        priority: 1,
        conditions: [],
        effect: { visible: false, required: false }
      }
    ],

    invoiceReferenceNumber: [
      {
        priority: 30,
        description: 'Invoice / Reference Number is mandatory for LATAM region',
        conditions: [{ sourceField: 'debtorAgentBIC', derivation: 'bicCountry', operator: 'in', value: LATAM_COUNTRIES }],
        effect: { visible: true, required: true, patternMessage: 'Invoice / Reference Number is required' }
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
      id: 'debtor_address_cascade_rule',
      description: 'When debtorAddressLines1 is entered, debtorTownName and debtorCountryCode become mandatory',
      watchFields: ['debtorAddressLines1'],
      conditions: [{ sourceField: 'debtorAddressLines1', operator: 'notEmpty' }],
      effects: {
        debtorTownName: { required: true },
        debtorCountryCode: { required: true }
      }
    },
    {
      id: 'creditor_address_cascade_rule',
      description: 'When creditorAddressLines1 is entered, creditorTownName and creditorCountryCode become mandatory',
      watchFields: ['creditorAddressLines1'],
      conditions: [{ sourceField: 'creditorAddressLines1', operator: 'notEmpty' }],
      effects: {
        creditorTownName: { required: true },
        creditorCountryCode: { required: true }
      }
    },
    {
      id: 'first_intermediary_account_coupling',
      description: 'When 1st Intermediary SWIFT is entered, 1st Intermediary Account Number becomes mandatory',
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