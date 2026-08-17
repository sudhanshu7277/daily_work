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