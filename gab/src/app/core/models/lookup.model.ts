/**
 * Reference / lookup data shared across features.
 * Backed by mock JSON in development; will swap to real API later.
 */

export interface Region {
  id: string;
  name: string;        // LATAM, NAM, EMEA, APAC
  code: string;
}

export interface Country {
  id: string;
  name: string;        // ARGENTINA, BRAZIL, MEXICO, ...
  code: string;        // ISO-3
  regionId: string;    // FK -> Region.id
}

export interface Client {
  id: string;
  name: string;
  countryId: string;
}

export interface Deal {
  id: string;
  name: string;       // e.g. "MSU Bono Privado Fideicomiso (ARG3000018)"
  clientId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type UserRole =
  | 'maker'
  | 'checker'
  | 'signature-validator'
  | 'operations'
  | 'admin'
  | 'viewer';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

// -- Enumerations seen across the screenshots ---------------------------------

export const REQUEST_TYPES = [
  'Administrative Transactional',
  'Payment Instruction',
  'Account Maintenance',
  'Documentation',
] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

export const SOURCES = ['Email', 'CitiDirect', 'Manual', 'Phone'] as const;
export type Source = (typeof SOURCES)[number];

export const CATEGORIES = [
  'Tax',
  'Fee',
  'Coupon',
  'Principal',
  'Maintenance',
  'Other',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const MPP_REQUIRED = ['Yes', 'No'] as const;
export type MppRequired = (typeof MPP_REQUIRED)[number];

export const EXCEPTIONS = ['Internal', 'External', 'None'] as const;
export type ExceptionType = (typeof EXCEPTIONS)[number];

export const SIGNATURE_STATUSES = [
  'Signature Approved',
  'Pending',
  'Admin Rework',
  'Rejected',
] as const;
export type SignatureStatus = (typeof SIGNATURE_STATUSES)[number];

export const TRANSACTION_SYSTEMS = ['Flexcube', 'Globus', 'Pega', 'Manual'] as const;
export type TransactionSystem = (typeof TRANSACTION_SYSTEMS)[number];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'ARS', 'BRL', 'MXN', 'JPY', 'CAD'] as const;
export type Currency = (typeof CURRENCIES)[number];
