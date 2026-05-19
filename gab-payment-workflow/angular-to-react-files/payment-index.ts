/**
 * index.ts — Barrel export for the Gab Payment Component package
 *
 * Import anything you need from a single entry point:
 *   import { PaymentParent, PaymentChildForm, usePaymentApi, PAYMENT_MODES } from './payment';
 */

// ── Components ──────────────────────────────────────────────
export { PaymentParent } from './PaymentParent';
export { PaymentChildForm } from './PaymentChildForm';

// ── Hooks ───────────────────────────────────────────────────
export { usePaymentApi } from './hooks/usePaymentApi';
export type { UsePaymentApiReturn } from './hooks/usePaymentApi';

// ── Constants & Factories ────────────────────────────────────
export {
  PAYMENT_MODES,
  DBK_FLAG,
  PAYMENT_METHODS,
  CHARGE_BEARERS,
  MANDATORY_FIELDS,
  NUMERIC_FIELDS,
  PAIN001_FIELD_DEFINITIONS,
  createEmptyPain001,
  createMakerInput,
  createCheckerInput,
  createRepairInput,
} from './paymentConstants';

// ── Types ────────────────────────────────────────────────────
export type {
  PaymentMode,
  DualBlindKeyFlag,
  DualBlindKeyResult,
  Pain001Model,
  PaymentComponentInput,
  PaymentComponentOutput,
  DualBlindKeyEntry,
  ValidationCondition,
  ValidationEffect,
  FieldValidationRule,
  FormRule,
  Pain001ValidationRules,
  FieldValidationResult,
  VerifyHardCapRequest,
  VerifyHardCapResponse,
  SubmitPaymentResponse,
  CheckerActionResponse,
  ApiError,
  FieldDefinition,
  PaymentParentProps,
  PaymentChildFormProps,
} from './payment.types';
