/** * Defines the configuration for dynamic API calls triggered by field events.
 */
export interface FieldAPIConfig {
  /** The endpoint to be called */
  url: string;
  /** The HTTP verb for the request */
  method: 'GET' | 'POST' | 'PUT';
  /** The DOM event that triggers the API call */
  triggerEvent: 'change' | 'blur';
  /** A unique string used by the parent component to identify which logic to execute */
  identifier: string;
}

/** * Defines the metadata for an individual form field, similar to ag-Grid's column definitions.
 */
export interface FieldDef {
  /** The property name in the final JSON payload */
  key: string;
  /** The display label for the UI */
  label: string;
  /** The type of input control to render */
  type: 'text' | 'number' | 'select' | 'date' | 'textarea';
  /** Boolean to toggle Validators.required and the red asterisk UI */
  required: boolean;
  /** Optional placeholder text */
  placeholder?: string;
  /** Optional regex pattern for validation (e.g., for numeric formats) */
  pattern?: string;
  /** Bootstrap grid classes for layout (e.g., 'col-md-6') */
  gridClass?: string;
  /** Static options for 'select' types */
  options?: { label: string; value: any }[];
  /** Configuration for event-driven API calls */
  apiConfig?: FieldAPIConfig;
}

/** * The data structure for the Payment Form, used for initial values and output payloads.
 */
export interface PaymentFormValues {
  amount: string;
  swiftCode: string;
  intermediarySwiftCode: string;
  intermediaryAccountNumber: string;
  benfBank: string;
  benfAccountNumber: string;
  eventType: string;
  entitlement: string;
  // Optional fields
  benfSwiftCode?: string;
  benfAddress?: string;
  remittanceDetails?: string;
  additionalInfo?: string;
}