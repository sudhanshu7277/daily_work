/// src/types/paymentFlow.types.ts

/**
 * ISO 20022 Pain.001 Payment Model
 */
export interface Pain001Model {
    // Payment Details & Method
    painPaymentMethodType?: string;
    requestedExecutionDate?: string;
    instructedAmountCurrencyCode?: string;
    instructedAmount?: number;
    chargesAmount?: number;
    chargeBearerType?: string;
  
    // Debtor (Ordering Customer)
    debtorName?: string;
    debtorAccountNumber?: string;
    debtorAgentBIC?: string;
    debtorAddressLines1?: string;
    debtorTownName?: string;
    debtorCountryCode?: string;
  
    // Creditor (Beneficiary)
    creditorName?: string;
    creditorAccountNumber?: string;
    creditorAgentBIC?: string;
    creditorAgentName?: string;
    creditorAddressLines1?: string;
    creditorTownName?: string;
    creditorCountryCode?: string;
  
    // Intermediary & Remittance
    intermediaryAgentBIC?: string;
    intermediaryAgentName?: string;
    paymentReference?: string;
    remittanceInformation?: string;
  
    // Dynamic extensible bag
    [key: string]: unknown;
  }
  
  /**
   * Form field configuration consumed by dynamic form engines
   */
  export interface FormFieldConfig {
    fieldName: string;
    label: string;
    required?: boolean;
    type?: 'text' | 'number' | 'date' | 'textarea' | 'select';
    options?: string[];
    placeholder?: string;
    disabled?: boolean;
    defaultValue?: unknown;
  }
  
  /**
   * Input payload injected into SSPaymentFlow
   */
  export interface PaymentComponentInput {
    applicationName: string;
    applicationModule: string;
    paymentMode: 'maker' | 'checker' | 'repair';
    dualBlindKeyFlag?: 'Y' | 'N';
    dualBlindKeyFields?: string[];
    paymentModel: Partial<Pain001Model> | null;
  }
  
  /**
   * Output payload emitted by SSPaymentFlow on modification/submit
   */
  export interface PaymentComponentOutput {
    action?: string;
    paymentModel: Pain001Model;
    rawFormValues?: Record<string, unknown>;
    isValid?: boolean;
    userComments?: string;
  }
  
  /**
   * Form validity emitter payload
   */
  export interface FormValidityPayload {
    validForm: boolean;
    errors?: Record<string, string>;
    touchedFields?: string[];
  }
  
  /**
   * Factory helper function to instantiate a clean Pain001 model
   */
  export const createEmptyPain001 = (): Pain001Model => ({
    painPaymentMethodType: 'CBT',
    requestedExecutionDate: new Date().toISOString().split('T')[0],
    instructedAmountCurrencyCode: 'USD',
    instructedAmount: 0,
    chargesAmount: 0,
    chargeBearerType: 'SHAR',
    debtorName: '',
    debtorAccountNumber: '',
    debtorAgentBIC: '',
    debtorAddressLines1: '',
    debtorTownName: '',
    debtorCountryCode: '',
    creditorName: '',
    creditorAccountNumber: '',
    creditorAgentBIC: '',
    creditorAgentName: '',
    creditorAddressLines1: '',
    creditorTownName: '',
    creditorCountryCode: '',
    intermediaryAgentBIC: '',
    intermediaryAgentName: '',
    paymentReference: '',
    remittanceInformation: ''
  });