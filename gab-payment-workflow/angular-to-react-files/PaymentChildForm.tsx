/**
 * PaymentChildForm.tsx
 *
 * Reusable Pain.001 payment form. Handles maker, checker, and repair modes.
 * Consumed by PaymentParent or used directly with a custom input object.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type {
  PaymentChildFormProps,
  PaymentComponentInput,
  PaymentComponentOutput,
  Pain001Model,
  InternalFormState,
  FieldValidationResult,
  ValidationCondition,
  VerifyHardCapRequest,
  VerifyHardCapResponse,
  DualBlindKeyResult,
} from './payment.types';
import { MANDATORY_FIELDS, PAYMENT_METHODS, CHARGE_BEARERS } from './paymentConstants';

/* ==========================================================
   INTERNAL FORM ↔ PAIN001 CONVERTERS
   ========================================================== */
function pain001ToForm(model: Pain001Model | null): InternalFormState {
  if (!model) {
    return {
      requestedExecutionDate: '', debtorName: '', debtorAccountNumber: '',
      debtorAgentBIC: '', chargeBearer: '', chargesAmount: '',
      chargesAgentBIC: '', debtorAddressLine1: '', debtorAddressLine2: '',
      debtorStreetName: '', debtorBuildingNumber: '', debtorPostalCode: '',
      debtorTownName: '', debtorCountrySubDivision: '', debtorCountryCode: '',
      debtorSortCodeUK: '', debtorSortCodeUS: '', instructedAmount: '',
      instructedAmountCurrencyCode: '', creditorName: '', creditorAccount: '',
      creditorAgentFinancialInstitutionBIC: '', creditorAgentFinancialInstitutionName: '',
      creditorAgentPostalAddress: '', creditorAddressLine1: '', creditorAddressLine2: '',
      creditorStreetName: '', creditorBuildingNumber: '', creditorPostalCode: '',
      creditorTownName: '', creditorCountrySubDivision: '', creditorCountryCode: '',
      creditorSortCodeUK: '', creditorSortCodeUS: '', ustrdPaymentDetails: '',
      painPaymentMethodType: '', firstIntermediaryBankBIC: '',
      firstIntermediaryBankRoutingCode: '', firstIntermediaryBankName: '',
      firstIntermediaryBankCountryCode: '', firstIntermediaryBankAccountId: '',
      secondIntermediaryBankBIC: '', secondIntermediaryBankRoutingCode: '',
      secondIntermediaryBankName: '', secondIntermediaryBankCountryCode: '',
      secondIntermediaryBankAccountId: '',
    };
  }
  const dLines = (model.debtorAddressLines ?? '').split('\n');
  const cLines = (model.creditorAddressLines ?? '').split('\n');
  return {
    requestedExecutionDate: model.requestedExecutionDate ?? '',
    debtorName: model.debtorName ?? '',
    debtorAccountNumber: model.debtorAccountNumber ?? '',
    debtorAgentBIC: model.debtorAgentBIC ?? '',
    chargeBearer: model.chargeBearer ?? '',
    chargesAmount: model.chargesAmount != null ? String(model.chargesAmount) : '',
    chargesAgentBIC: model.chargesAgentBIC ?? '',
    debtorAddressLine1: dLines[0] ?? '',
    debtorAddressLine2: dLines[1] ?? '',
    debtorStreetName: model.debtorStreetName ?? '',
    debtorBuildingNumber: model.debtorBuildingNumber ?? '',
    debtorPostalCode: model.debtorPostalCode ?? '',
    debtorTownName: model.debtorTownName ?? '',
    debtorCountrySubDivision: model.debtorCountrySubDivision ?? '',
    debtorCountryCode: model.debtorCountryCode ?? '',
    debtorSortCodeUK: model.debtorSortCodeUK ?? '',
    debtorSortCodeUS: model.debtorSortCodeUS ?? '',
    instructedAmount: model.instructedAmount != null ? String(model.instructedAmount) : '',
    instructedAmountCurrencyCode: model.instructedAmountCurrencyCode ?? '',
    creditorName: model.creditorName ?? '',
    creditorAccount: model.creditorAccount ?? '',
    creditorAgentFinancialInstitutionBIC: model.creditorAgentFinancialInstitutionBIC ?? '',
    creditorAgentFinancialInstitutionName: model.creditorAgentFinancialInstitutionName ?? '',
    creditorAgentPostalAddress: model.creditorAgentPostalAddress ?? '',
    creditorAddressLine1: cLines[0] ?? '',
    creditorAddressLine2: cLines[1] ?? '',
    creditorStreetName: model.creditorStreetName ?? '',
    creditorBuildingNumber: model.creditorBuildingNumber ?? '',
    creditorPostalCode: model.creditorPostalCode ?? '',
    creditorTownName: model.creditorTownName ?? '',
    creditorCountrySubDivision: model.creditorCountrySubDivision ?? '',
    creditorCountryCode: model.creditorCountryCode ?? '',
    creditorSortCodeUK: model.creditorSortCodeUK ?? '',
    creditorSortCodeUS: model.creditorSortCodeUS ?? '',
    ustrdPaymentDetails: model.ustrdPaymentDetails ?? '',
    painPaymentMethodType: model.painPaymentMethodType ?? '',
    firstIntermediaryBankBIC: model.firstIntermediaryBankBIC ?? '',
    firstIntermediaryBankRoutingCode: model.firstIntermediaryBankRoutingCode ?? '',
    firstIntermediaryBankName: model.firstIntermediaryBankName ?? '',
    firstIntermediaryBankCountryCode: model.firstIntermediaryBankCountryCode ?? '',
    firstIntermediaryBankAccountId: model.firstIntermediaryBankAccountId ?? '',
    secondIntermediaryBankBIC: model.secondIntermediaryBankBIC ?? '',
    secondIntermediaryBankRoutingCode: model.secondIntermediaryBankRoutingCode ?? '',
    secondIntermediaryBankName: model.secondIntermediaryBankName ?? '',
    secondIntermediaryBankCountryCode: model.secondIntermediaryBankCountryCode ?? '',
    secondIntermediaryBankAccountId: model.secondIntermediaryBankAccountId ?? '',
  };
}

function formToPain001(
  form: InternalFormState,
  ctx: { applicationName?: string; applicationModule?: string; region?: string } = {}
): Pain001Model {
  return {
    requestedExecutionDate: form.requestedExecutionDate,
    debtorName: form.debtorName,
    debtorAccountNumber: form.debtorAccountNumber,
    debtorAgentBIC: form.debtorAgentBIC,
    chargeBearer: form.chargeBearer,
    chargesAmount: parseFloat(form.chargesAmount) || 0,
    chargesAgentBIC: form.chargesAgentBIC,
    debtorAddressLines: [form.debtorAddressLine1, form.debtorAddressLine2].filter(Boolean).join('\n'),
    debtorStreetName: form.debtorStreetName,
    debtorBuildingNumber: form.debtorBuildingNumber,
    debtorPostalCode: form.debtorPostalCode,
    debtorTownName: form.debtorTownName,
    debtorCountrySubDivision: form.debtorCountrySubDivision,
    debtorCountryCode: form.debtorCountryCode,
    debtorSortCodeUK: form.debtorSortCodeUK,
    debtorSortCodeUS: form.debtorSortCodeUS,
    instructedAmount: parseFloat(form.instructedAmount) || 0,
    instructedAmountCurrencyCode: form.instructedAmountCurrencyCode,
    creditorName: form.creditorName,
    creditorAccount: form.creditorAccount,
    creditorAgentFinancialInstitutionBIC: form.creditorAgentFinancialInstitutionBIC,
    creditorAgentFinancialInstitutionName: form.creditorAgentFinancialInstitutionName,
    creditorAgentPostalAddress: form.creditorAgentPostalAddress,
    creditorAddressLines: [form.creditorAddressLine1, form.creditorAddressLine2].filter(Boolean).join('\n'),
    creditorStreetName: form.creditorStreetName,
    creditorBuildingNumber: form.creditorBuildingNumber,
    creditorPostalCode: form.creditorPostalCode,
    creditorTownName: form.creditorTownName,
    creditorCountrySubDivision: form.creditorCountrySubDivision,
    creditorCountryCode: form.creditorCountryCode,
    creditorSortCodeUK: form.creditorSortCodeUK,
    creditorSortCodeUS: form.creditorSortCodeUS,
    ustrdPaymentDetails: form.ustrdPaymentDetails,
    painPaymentMethodType: form.painPaymentMethodType,
    firstIntermediaryBankBIC: form.firstIntermediaryBankBIC,
    firstIntermediaryBankRoutingCode: form.firstIntermediaryBankRoutingCode,
    firstIntermediaryBankName: form.firstIntermediaryBankName,
    firstIntermediaryBankCountryCode: form.firstIntermediaryBankCountryCode,
    firstIntermediaryBankAccountId: form.firstIntermediaryBankAccountId,
    secondIntermediaryBankBIC: form.secondIntermediaryBankBIC,
    secondIntermediaryBankRoutingCode: form.secondIntermediaryBankRoutingCode,
    secondIntermediaryBankName: form.secondIntermediaryBankName,
    secondIntermediaryBankCountryCode: form.secondIntermediaryBankCountryCode,
    secondIntermediaryBankAccountId: form.secondIntermediaryBankAccountId,
    applicationName: ctx.applicationName ?? '',
    applicationModule: ctx.applicationModule ?? '',
    region: ctx.region ?? '',
  };
}

/* ==========================================================
   VALIDATION ENGINE
   ========================================================== */
function extractCountryFromBIC(bic: string): string {
  if (!bic || bic.length < 6) return '';
  return bic.substring(4, 6).toUpperCase();
}

function isValueEmpty(v: unknown): boolean {
  return v === null || v === undefined || String(v).trim() === '';
}

function conditionMatches(
  cond: ValidationCondition,
  formValues: Record<string, unknown>
): boolean {
  const fields = cond.sourceField.split(',');
  if (fields.length > 1) {
    if (cond.operator === 'notEmpty') return fields.some(f => !isValueEmpty(formValues[f.trim()]));
    if (cond.operator === 'empty') return fields.every(f => isValueEmpty(formValues[f.trim()]));
  }
  const raw = formValues[fields[0].trim()];
  let cv = isValueEmpty(raw) ? '' : String(raw).trim();
  if (cond.derivation === 'bicCountry') cv = extractCountryFromBIC(cv);
  switch (cond.operator) {
    case 'eq': return cv === cond.value;
    case 'neq': return cv !== cond.value;
    case 'in': return Array.isArray(cond.value) && cond.value.includes(cv);
    case 'notIn': return Array.isArray(cond.value) && !cond.value.includes(cv);
    case 'empty': return cv === '';
    case 'notEmpty': return cv !== '';
    default: return false;
  }
}

function evaluateFieldRules(
  input: PaymentComponentInput,
  fieldName: string,
  formValues: Record<string, unknown>
): FieldValidationResult {
  const isMandatory = (MANDATORY_FIELDS as readonly string[]).includes(fieldName);
  const defaultResult: FieldValidationResult = {
    fieldName,
    required: isMandatory,
    visible: true,
  };
  const rules = input.validationRules?.fields?.[fieldName];
  if (!rules?.length) return defaultResult;
  const sorted = [...rules].sort((a, b) => a.priority - b.priority);
  for (const rule of sorted) {
    if (rule.conditions.every(c => conditionMatches(c, formValues))) {
      return {
        fieldName,
        required: rule.effect.required ?? false,
        visible: rule.effect.visible ?? true,
        pattern: rule.effect.pattern,
        patternMessage: rule.effect.patternMessage,
        maxLength: rule.effect.maxLength,
        decimalPlaces: rule.effect.decimalPlaces,
      };
    }
  }
  return defaultResult;
}

/* ==========================================================
   HARDCAP SERVICE
   ========================================================== */
async function verifyHardCap(
  baseUrl: string,
  payload: VerifyHardCapRequest
): Promise<VerifyHardCapResponse> {
  const res = await fetch(`${baseUrl}/hard-cap/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Hard cap verification failed');
  return res.json() as Promise<VerifyHardCapResponse>;
}

/* ==========================================================
   FORM SECTION CONFIGURATION
   ========================================================== */
type FieldType = 'text' | 'date' | 'number' | 'select';

interface FieldConfig {
  key: keyof InternalFormState;
  label: string;
  type?: FieldType;
  placeholder?: string;
  mandatory?: boolean;
  cols: 4 | 6 | 12;
  options?: readonly string[];
}

interface SectionConfig {
  id: string;
  title: string;
  fields: FieldConfig[];
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'payment', title: 'Payment Information',
    fields: [
      { key: 'requestedExecutionDate', label: 'Value Date', type: 'date', mandatory: true, cols: 12 },
      { key: 'instructedAmountCurrencyCode', label: 'Currency', placeholder: 'e.g. USD, EUR', mandatory: true, cols: 6 },
      { key: 'instructedAmount', label: 'Transaction Amount', type: 'number', mandatory: true, cols: 6 },
    ],
  },
  {
    id: 'debtor', title: 'Debtor Information',
    fields: [
      { key: 'debtorName', label: 'Debtor Name', placeholder: 'Enter debtor name', mandatory: true, cols: 4 },
      { key: 'debtorAccountNumber', label: 'Debtor Account Number', placeholder: 'Enter account number', mandatory: true, cols: 4 },
      { key: 'debtorAgentBIC', label: 'Debtor Agent BIC', placeholder: 'Enter BIC code', mandatory: true, cols: 4 },
    ],
  },
  {
    id: 'debtorAddr', title: 'Debtor Address Details',
    fields: [
      { key: 'debtorAddressLine1', label: 'Debtor Address Line 1', placeholder: 'Address', cols: 6 },
      { key: 'debtorAddressLine2', label: 'Debtor Address Line 2', placeholder: 'Address', cols: 6 },
      { key: 'debtorStreetName', label: 'Debtor Street', placeholder: 'Enter street name', cols: 4 },
      { key: 'debtorBuildingNumber', label: 'Debtor Building Number', cols: 4 },
      { key: 'debtorPostalCode', label: 'Debtor Postal Code', cols: 4 },
      { key: 'debtorTownName', label: 'Debtor Town / City Name', cols: 6 },
      { key: 'debtorCountrySubDivision', label: 'Debtor State', cols: 6 },
      { key: 'debtorCountryCode', label: 'Debtor Country', placeholder: 'e.g. US, GB', cols: 6 },
      { key: 'debtorSortCodeUK', label: 'Debtor Sort Code', cols: 12 },
      { key: 'debtorSortCodeUS', label: 'Debtor Sort Code (US)', placeholder: '9-digit ABA routing number', cols: 12 },
    ],
  },
  {
    id: 'intermediary', title: 'Intermediary Bank Details',
    fields: [
      { key: 'firstIntermediaryBankBIC', label: '1st Intermediary Bank SWIFT Code', placeholder: 'Enter SWIFT/BIC', cols: 4 },
      { key: 'firstIntermediaryBankRoutingCode', label: '1st Intermediary Bank Routing Code', cols: 4 },
      { key: 'firstIntermediaryBankName', label: '1st Intermediary Bank Name', cols: 4 },
      { key: 'firstIntermediaryBankCountryCode', label: '1st Intermediary Bank Country Code', cols: 6 },
      { key: 'firstIntermediaryBankAccountId', label: '1st Intermediary Account Number', cols: 6 },
      { key: 'secondIntermediaryBankBIC', label: '2nd Intermediary Bank SWIFT Code', placeholder: 'Enter SWIFT/BIC', cols: 4 },
      { key: 'secondIntermediaryBankRoutingCode', label: '2nd Intermediary Bank Routing Code', cols: 4 },
      { key: 'secondIntermediaryBankName', label: '2nd Intermediary Bank Name', cols: 4 },
      { key: 'secondIntermediaryBankCountryCode', label: '2nd Intermediary Bank Country Code', cols: 6 },
      { key: 'secondIntermediaryBankAccountId', label: '2nd Intermediary Account Number', cols: 6 },
    ],
  },
  {
    id: 'creditor', title: 'Creditor Information',
    fields: [
      { key: 'creditorName', label: 'Creditor Name', placeholder: 'Enter creditor name', mandatory: true, cols: 4 },
      { key: 'creditorAccount', label: 'Creditor Account Number', placeholder: 'Enter account number', mandatory: true, cols: 4 },
      { key: 'creditorAgentFinancialInstitutionBIC', label: 'Creditor Agent BIC', placeholder: 'Enter BIC', mandatory: true, cols: 4 },
      { key: 'creditorAgentFinancialInstitutionName', label: 'Creditor Agent Bank Name', placeholder: 'Enter bank name', mandatory: true, cols: 6 },
      { key: 'creditorAgentPostalAddress', label: 'Creditor Address', placeholder: 'Enter address', mandatory: true, cols: 6 },
    ],
  },
  {
    id: 'creditorAddr', title: 'Creditor Address Details',
    fields: [
      { key: 'creditorAddressLine1', label: 'Creditor Address Line 1', placeholder: 'Address', cols: 6 },
      { key: 'creditorAddressLine2', label: 'Creditor Address Line 2', placeholder: 'Address', cols: 6 },
      { key: 'creditorStreetName', label: 'Creditor Street', placeholder: 'Enter street name', cols: 4 },
      { key: 'creditorBuildingNumber', label: 'Creditor Building Number', cols: 4 },
      { key: 'creditorPostalCode', label: 'Creditor Postal Code', cols: 4 },
      { key: 'creditorTownName', label: 'Creditor Town / City Name', cols: 6 },
      { key: 'creditorCountrySubDivision', label: 'Creditor State', cols: 6 },
      { key: 'creditorCountryCode', label: 'Creditor Country', placeholder: 'e.g. US, GB', cols: 6 },
      { key: 'creditorSortCodeUK', label: 'Creditor Sort Code', cols: 12 },
      { key: 'creditorSortCodeUS', label: 'Creditor Sort Code (US)', placeholder: '9-digit ABA routing number', cols: 12 },
    ],
  },
  {
    id: 'additional', title: 'Additional Details',
    fields: [
      { key: 'ustrdPaymentDetails', label: 'Remittance Information', placeholder: 'Enter remittance details', cols: 6 },
      { key: 'painPaymentMethodType', label: 'Payment Type (CBT, BKT, DFT)', type: 'select', mandatory: true, cols: 6, options: PAYMENT_METHODS },
    ],
  },
  {
    id: 'charges', title: 'Charge Details',
    fields: [
      { key: 'chargeBearer', label: 'Charge Information', type: 'select', cols: 4, options: CHARGE_BEARERS },
      { key: 'chargesAmount', label: 'Charges Amount', type: 'number', cols: 4 },
      { key: 'chargesAgentBIC', label: 'Charges Agent BIC', placeholder: 'Enter BIC', cols: 4 },
    ],
  },
];

/* ==========================================================
   STYLES
   ========================================================== */
const STYLES = `
  .pf-wrap{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:1100px;margin:0 auto;padding:16px}
  .pf-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;margin-bottom:16px}
  .pf-badge-maker{background:#dbeafe;color:#1e40af}
  .pf-badge-checker{background:#fef3c7;color:#92400e}
  .pf-badge-repair{background:#fee2e2;color:#991b1b}
  .pf-section{margin-bottom:18px;border:1px solid #dde1e7;border-radius:4px;overflow:hidden}
  .pf-section-hdr{background:#1a3a5c;color:#fff;padding:10px 16px;font-size:13px;font-weight:700;letter-spacing:.3px}
  .pf-section-body{padding:16px;background:#fff}
  .pf-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px 16px}
  .pf-col-4{grid-column:span 4}
  .pf-col-6{grid-column:span 6}
  .pf-col-12{grid-column:span 12}
  @media(max-width:768px){.pf-col-4,.pf-col-6{grid-column:span 12}}
  .pf-field{display:flex;flex-direction:column}
  .pf-label{font-size:13px;font-weight:500;color:#475569;margin-bottom:4px;line-height:1.4}
  .pf-label-rejected{color:#dc2626;font-weight:600}
  .pf-asterisk{color:#dc2626;font-weight:700}
  .pf-input{width:100%;height:36px;padding:5px 10px;font-size:13px;color:#1e293b;background:#fff;border:1px solid #cbd5e1;border-radius:6px;box-sizing:border-box;transition:border-color .12s ease,box-shadow .12s ease;outline:none}
  .pf-input:focus{border-color:#056dae;box-shadow:0 0 0 3px rgba(5,109,174,.12)}
  .pf-input[readonly]{background:#f8fafc;color:#64748b;cursor:default}
  .pf-input.pf-error{border-color:#dc2626;background:#fef2f2}
  .pf-input.pf-rejected{border-color:#dc2626;background:#fef2f2}
  select.pf-input{cursor:pointer;appearance:auto}
  select.pf-input:disabled{background:#f8fafc;color:#64748b;cursor:default}
  .pf-err-text{font-size:11px;color:#dc2626;margin-top:3px;font-weight:500}
  .pf-dbk-wrap{margin-top:8px;padding:8px 10px;background:#f0f9ff;border:1px dashed #7dd3fc;border-radius:6px}
  .pf-dbk-lbl{font-size:11px;font-weight:600;color:#0369a1;margin-bottom:5px}
  .pf-dbk-result{display:inline-flex;align-items:center;gap:4px;margin-top:5px;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:600}
  .pf-dbk-passed{background:#ecfdf5;border:1px solid #059669;color:#059669}
  .pf-dbk-failed{background:#fef2f2;border:1px solid #dc2626;color:#dc2626}
  .pf-hardcap-err{margin:8px 0;padding:10px 14px;background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;color:#dc2626;font-size:13px;font-weight:500}
  .pf-hardcap-ok{margin:8px 0;padding:10px 14px;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:6px;color:#059669;font-size:13px;font-weight:500}
  .pf-actions{display:flex;justify-content:center;gap:12px;padding:20px 0 8px}
  .pf-btn{padding:10px 28px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;border:none;transition:opacity .15s,transform .1s;letter-spacing:.2px}
  .pf-btn:active{transform:scale(.98)}
  .pf-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
  .pf-btn-submit{background:#1a3a5c;color:#fff}
  .pf-btn-submit:hover:not(:disabled){background:#1e4d8c}
  .pf-btn-approve{background:#059669;color:#fff}
  .pf-btn-approve:hover:not(:disabled){background:#047857}
  .pf-btn-reject{background:#dc2626;color:#fff}
  .pf-btn-reject:hover:not(:disabled){background:#b91c1c}
  .pf-btn-repair{background:#d97706;color:#fff}
  .pf-btn-repair:hover:not(:disabled){background:#b45309}
  .pf-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999}
  .pf-modal{background:#fff;border-radius:12px;padding:36px 32px;max-width:420px;width:90%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,.25)}
  .pf-modal-icon{width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 18px;font-weight:700}
  .pf-icon-success{background:#ecfdf5;color:#059669}
  .pf-icon-warning{background:#fef3c7;color:#d97706}
  .pf-icon-error{background:#fef2f2;color:#dc2626}
  .pf-modal h3{margin:0 0 10px;font-size:20px;font-weight:600;color:#0f172a}
  .pf-modal p{margin:0 0 18px;color:#64748b;font-size:14px;line-height:1.5}
  .pf-modal-txn{background:#f1f5f9;border-radius:6px;padding:8px 16px;font-size:13px;color:#334155;margin-bottom:20px;font-weight:600;font-family:monospace}
  .pf-modal-btn{padding:10px 28px;border-radius:6px;border:none;font-size:14px;font-weight:600;cursor:pointer;background:#1a3a5c;color:#fff}
  .pf-modal-btn:hover{background:#1e4d8c}
  .pf-repair-legend{display:flex;align-items:center;gap:8px;margin-bottom:14px;padding:10px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;font-size:12px;color:#92400e}
  .pf-repair-dot{width:10px;height:10px;border-radius:50%;background:#dc2626;flex-shrink:0}
`;

/* ==========================================================
   MODAL TYPES
   ========================================================== */
type ModalType = 'success' | 'warning' | 'error';

interface ModalState {
  type: ModalType;
  msg: string;
  txnId?: string;
}

interface HardcapMsg {
  type: 'ok' | 'error';
  text: string;
}

/* ==========================================================
   FORM FIELD COMPONENT
   ========================================================== */
interface FormFieldProps {
  fieldConfig: FieldConfig;
  value: string;
  onChange: (val: string) => void;
  readOnly: boolean;
  rejected: boolean;
  showError: boolean;
  dbkEnabled: boolean;
  dbkValue: string;
  onDbkChange: (val: string) => void;
  dbkResult: DualBlindKeyResult;
}

const FormField: React.FC<FormFieldProps> = ({
  fieldConfig,
  value,
  onChange,
  readOnly,
  rejected,
  showError,
  dbkEnabled,
  dbkValue,
  onDbkChange,
  dbkResult,
}) => {
  const isSelect = fieldConfig.type === 'select';
  const inputClass = [
    'pf-input',
    showError ? 'pf-error' : '',
    rejected ? 'pf-rejected' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="pf-field">
      <label className={`pf-label${rejected ? ' pf-label-rejected' : ''}`}>
        {fieldConfig.label}
        {fieldConfig.mandatory && <span className="pf-asterisk"> *</span>}
      </label>

      {isSelect ? (
        <select
          className={inputClass}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
        >
          <option value="">-- Select --</option>
          {(fieldConfig.options ?? []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          className={inputClass}
          type={fieldConfig.type ?? 'text'}
          value={value ?? ''}
          placeholder={readOnly ? '' : (fieldConfig.placeholder ?? '')}
          readOnly={readOnly}
          onChange={(e) => !readOnly && onChange(e.target.value)}
        />
      )}

      {showError && <span className="pf-err-text">This field is required</span>}

      {dbkEnabled && (
        <div className="pf-dbk-wrap">
          <div className="pf-dbk-lbl">🔑 Dual Blind Key — re-enter to verify</div>
          <input
            className={`pf-input${dbkResult === 'failed' ? ' pf-error' : ''}`}
            type="text"
            value={dbkValue ?? ''}
            placeholder="Re-enter value for verification"
            onChange={(e) => onDbkChange(e.target.value)}
          />
          {dbkResult && (
            <span className={`pf-dbk-result pf-dbk-${dbkResult}`}>
              {dbkResult === 'passed' ? '✓ DBK Passed' : '✗ DBK Failed — values do not match'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/* ==========================================================
   PAYMENT CHILD FORM
   ========================================================== */
export const PaymentChildForm: React.FC<PaymentChildFormProps> = ({
  mode = 'maker',
  input = {} as PaymentComponentInput,
  onOutput,
  onApprove,
  onReject,
}) => {
  const {
    paymentModel = null,
    rejectedFieldList = [],
    dualBlindKeyFields = [],
    dualBlindKeyFlag = 'N',
    hardcapLimitCheckBaseUrl = '',
    applicationName = '',
    applicationModule = '',
    hideFieldsList = [],
    currency = '',
  } = input;

  const [form, setForm] = useState<InternalFormState>(() => pain001ToForm(paymentModel));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dbkValues, setDbkValues] = useState<Record<string, string>>({});
  const [dbkResults, setDbkResults] = useState<Record<string, DualBlindKeyResult>>({});
  const [modal, setModal] = useState<ModalState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hardcapMsg, setHardcapMsg] = useState<HardcapMsg | null>(null);

  useEffect(() => {
    setForm(pain001ToForm(paymentModel));
    setTouched({});
    setDbkValues({});
    setDbkResults({});
  }, [paymentModel]);

  useEffect(() => {
    if (currency) {
      setForm((prev) => ({
        ...prev,
        instructedAmountCurrencyCode: prev.instructedAmountCurrencyCode || currency,
      }));
    }
  }, [currency]);

  /* ── Helpers ── */
  const canEdit = (key: string): boolean => {
    if (mode === 'maker') return true;
    if (mode === 'checker') return false;
    if (mode === 'repair') return rejectedFieldList.includes(key);
    return false;
  };

  const isRejected = (key: string): boolean => rejectedFieldList.includes(key);
  const isHidden = (key: string): boolean => hideFieldsList.includes(key);
  const isDbk = (key: string): boolean =>
    mode === 'checker' && dualBlindKeyFlag === 'Y' && dualBlindKeyFields.includes(key);

  const isMandatory = (key: string): boolean => {
    if (isHidden(key)) return false;
    return evaluateFieldRules(input, key, form as unknown as Record<string, unknown>).required;
  };

  const fieldHasError = (key: string): boolean => {
    if (!touched[key]) return false;
    if (!isMandatory(key)) return false;
    return !form[key as keyof InternalFormState];
  };

  const isFormValid = (): boolean => {
    const fieldsToCheck = mode === 'repair'
      ? (MANDATORY_FIELDS as readonly string[]).filter((k) => rejectedFieldList.includes(k))
      : (MANDATORY_FIELDS as readonly string[]);

    return fieldsToCheck.every((key) => {
      if (isHidden(key)) return true;
      const v = form[key as keyof InternalFormState];
      return v !== '' && v !== null && v !== undefined;
    });
  };

  const touchAll = (): void => {
    const t: Record<string, boolean> = {};
    (MANDATORY_FIELDS as readonly string[]).forEach((k) => { if (!isHidden(k)) t[k] = true; });
    setTouched(t);
  };

  /* ── Handlers ── */
  const handleChange = (key: keyof InternalFormState, val: string): void => {
    if (!canEdit(key)) return;
    setForm((prev) => ({ ...prev, [key]: val }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    setHardcapMsg(null);
  };

  const handleDbkChange = (key: string, val: string): void => {
    setDbkValues((prev) => ({ ...prev, [key]: val }));
    const original = String(form[key as keyof InternalFormState] ?? '');
    setDbkResults((prev) => ({
      ...prev,
      [key]: val === '' ? null : val === original ? 'passed' : 'failed',
    }));
  };

  const buildOutput = (
    msg: string,
    isValid: boolean,
    dbkResult: DualBlindKeyResult = null
  ): PaymentComponentOutput => ({
    paymentData: formToPain001(form, { applicationName, applicationModule }),
    isValid,
    outputMessage: msg,
    dualBlindKeyResult: dbkResult,
    isDualBlindKeyPassed: dbkResult === 'passed',
  });

  const handleSubmit = async (): Promise<void> => {
    touchAll();
    if (!isFormValid()) return;
    setLoading(true);
    setHardcapMsg(null);
    try {
      if (hardcapLimitCheckBaseUrl) {
        const hcReq: VerifyHardCapRequest = {
          currency: form.instructedAmountCurrencyCode,
          paymentAmount: parseFloat(form.instructedAmount) || 0,
          applicationName,
          applicationModule,
        };
        const hc = await verifyHardCap(hardcapLimitCheckBaseUrl, hcReq);
        if (!hc.amountWithinLimit) {
          setHardcapMsg({
            type: 'error',
            text: `Amount exceeds hard cap limit of ${hc.hardCapValue?.toLocaleString()} ${form.instructedAmountCurrencyCode}`,
          });
          return;
        }
        setHardcapMsg({
          type: 'ok',
          text: `Amount is within the hard cap limit of ${hc.hardCapValue?.toLocaleString()} ${form.instructedAmountCurrencyCode}`,
        });
      }
      const out = buildOutput('Payment submitted successfully', true);
      onOutput?.(out);
      setModal({ type: 'success', msg: 'Payment submitted successfully.', txnId: `TXN-${Date.now()}` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Submission failed. Please try again.';
      setModal({ type: 'error', msg });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (): void => {
    let dbkResult: DualBlindKeyResult = null;
    if (dualBlindKeyFlag === 'Y' && dualBlindKeyFields.length > 0) {
      const allPassed = dualBlindKeyFields.every((f) => dbkResults[f] === 'passed');
      dbkResult = allPassed ? 'passed' : 'failed';
      if (!allPassed) {
        setModal({ type: 'error', msg: 'Dual Blind Key verification failed. Re-enter the highlighted fields and ensure values match.' });
        onOutput?.(buildOutput('DBK verification failed', false, 'failed'));
        return;
      }
    }
    const out = buildOutput('Payment approved', true, dbkResult);
    onApprove?.(out);
    onOutput?.(out);
    setModal({ type: 'success', msg: 'Transaction approved successfully.', txnId: `TXN-${Date.now()}` });
  };

  const handleReject = (): void => {
    const out = buildOutput('Payment rejected by checker', false);
    onReject?.(out);
    onOutput?.(out);
    setModal({ type: 'warning', msg: 'Transaction has been rejected and sent back for review.' });
  };

  const handleRepair = async (): Promise<void> => {
    touchAll();
    if (!isFormValid()) return;
    setLoading(true);
    try {
      const out = buildOutput('Repaired payment submitted', true);
      onOutput?.(out);
      setModal({ type: 'success', msg: 'Repaired payment submitted successfully.', txnId: `TXN-${Date.now()}` });
    } catch (e) {
      setModal({ type: 'error', msg: 'Repair submission failed.' });
    } finally {
      setLoading(false);
    }
  };

  const modalMeta: Record<ModalType, { icon: string; cls: string; title: string }> = {
    success: { icon: '✓', cls: 'pf-icon-success', title: mode === 'repair' ? 'Repair Submitted' : mode === 'checker' ? 'Transaction Approved' : 'Payment Submitted' },
    warning: { icon: '!', cls: 'pf-icon-warning', title: 'Transaction Rejected' },
    error: { icon: '✕', cls: 'pf-icon-error', title: 'Error' },
  };

  /* ── Render ── */
  return (
    <div className="pf-wrap">
      <style>{STYLES}</style>

      <div className={`pf-badge pf-badge-${mode}`}>
        {mode === 'maker' && '✏ Maker Mode'}
        {mode === 'checker' && '👁 Checker Mode'}
        {mode === 'repair' && '🔧 Repair Mode'}
      </div>

      {mode === 'repair' && rejectedFieldList.length > 0 && (
        <div className="pf-repair-legend">
          <div className="pf-repair-dot" />
          Rejected fields are highlighted in red and editable. All other fields are read-only.
        </div>
      )}

      {SECTIONS.map((section) => {
        const visible = section.fields.filter((f) => !isHidden(f.key));
        if (!visible.length) return null;
        return (
          <div key={section.id} className="pf-section">
            <div className="pf-section-hdr">{section.title}</div>
            <div className="pf-section-body">
              <div className="pf-grid">
                {visible.map((fd) => {
                  const key = fd.key as string;
                  return (
                    <div key={key} className={`pf-col-${fd.cols}`}>
                      <FormField
                        fieldConfig={{ ...fd, mandatory: isMandatory(key) }}
                        value={String(form[fd.key] ?? '')}
                        onChange={(v) => handleChange(fd.key, v)}
                        readOnly={!canEdit(key)}
                        rejected={isRejected(key)}
                        showError={fieldHasError(key)}
                        dbkEnabled={isDbk(key)}
                        dbkValue={dbkValues[key] ?? ''}
                        onDbkChange={(v) => handleDbkChange(key, v)}
                        dbkResult={dbkResults[key] ?? null}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {hardcapMsg && (
        <div className={hardcapMsg.type === 'error' ? 'pf-hardcap-err' : 'pf-hardcap-ok'}>
          {hardcapMsg.type === 'error' ? '⚠ ' : '✓ '}{hardcapMsg.text}
        </div>
      )}

      <div className="pf-actions">
        {mode === 'maker' && (
          <button className="pf-btn pf-btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Payment'}
          </button>
        )}
        {mode === 'checker' && (
          <>
            <button className="pf-btn pf-btn-reject" onClick={handleReject} disabled={loading}>Reject</button>
            <button className="pf-btn pf-btn-approve" onClick={handleApprove} disabled={loading}>
              {loading ? 'Processing…' : 'Approve'}
            </button>
          </>
        )}
        {mode === 'repair' && (
          <button className="pf-btn pf-btn-repair" onClick={handleRepair} disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Repair'}
          </button>
        )}
      </div>

      {modal && (
        <div className="pf-overlay" onClick={() => setModal(null)}>
          <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`pf-modal-icon ${modalMeta[modal.type].cls}`}>
              {modalMeta[modal.type].icon}
            </div>
            <h3>{modalMeta[modal.type].title}</h3>
            <p>{modal.msg}</p>
            {modal.txnId && <div className="pf-modal-txn">{modal.txnId}</div>}
            <button className="pf-modal-btn" onClick={() => setModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentChildForm;
