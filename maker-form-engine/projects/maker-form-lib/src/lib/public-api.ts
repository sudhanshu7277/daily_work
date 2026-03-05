/*
 * Public API Surface of maker-form-engine
 */

// 1. Export the main Form Engine Component
export * from './lib/components/form-engine.component';

// 2. Export the Dynamic CRUD Service
export * from './lib/services/dynamic-crud.service';

// 3. Export the Input Directives (e.g., Numbers Only)
export * from './lib/directives/numbers-only.directive';

// 4. Export the Data Models and Interfaces
// This allows users to import 'FieldDef' and 'PaymentFormValues' for their manifests
export * from './lib/models/form-schema.model';