"optionalDependencies": {
    "@rollup/rollup-win32-x64-msvc": "^4.28.1"
  }

  // Solution 1: Use the WebAssembly Fallback (1-Shot Local Fix)
//Force Rollup to bypass the native C++ Windows binary and run the WASM v
// ersion directly by setting the environment variable in your terminal:

ROLLUP_NO_NATIVE=true npm run build

// To make this permanent in your library's package.json, update the "build" script:

"scripts": {
  "build": "cross-env ROLLUP_NO_NATIVE=true vite build",
  "typecheck": "tsc --noEmit",
  ...
}

//Solution 2: Pin @rollup/rollup-win32-x64-msvc and vite to Node 22 Supported Versions
//Update package.json with the patched Rollup binaries:

//Update your dependencies in package.json:


"devDependencies": {
    ...
    "vite": "^6.1.1",
    "@rollup/rollup-win32-x64-msvc": "^4.34.8"
  },
  "optionalDependencies": {
    "@rollup/rollup-win32-x64-msvc": "^4.34.8"
  }


  npm install
npm run build


// Quick Verification
Execute in your Git Bash terminal:


ROLLUP_NO_NATIVE=true npx vite build



// 1. Update tsconfig.json (Remove test types from main compiler config)
//Remove the "types" property completely from compilerOptions. Without it, TypeScript automatically discovers 
//@types/react, @types/react-dom, and @types/node from node_modules.//

{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "declaration": true,
    "declarationDir": "./dist",
    "emitDeclarationOnly": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noEmit": false,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "strict": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "src/**/__tests__/*"
  ]
}


// 2. Configure Test Types in vitest.setup.ts
//To provide types for jest-dom matchers and Vitest without 
// polluting the library compilation, add type references 
// directly at the very top of vitest.setup.ts:


/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';


// 3. Update SSPaymentFlow.tsx Component Signature
//Avoid React.FC for library components. Type the props 
// interface directly on the component parameters. 
// This ensures accurate .d.ts generation and eliminates ReactNode /
//  Element assignment mismatch:

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ChangeEvent,
  MouseEvent
} from 'react';
import { FormFieldConfig, PaymentComponentInput, PaymentComponentOutput, FormValidityPayload } from '../models/models';

export interface SSPaymentFlowProps {
  paymentInput: PaymentComponentInput;
  fieldConfig?: FormFieldConfig[];
  initialData?: Record<string, unknown>;
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

export const SSPaymentFlow = ({
  paymentInput,
  fieldConfig = [],
  initialData,
  pacsFormVerbiages = {},
  isMakerMode,
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
}: SSPaymentFlowProps) => {
  // Component implementation...

  // 4. Build the Package
//Run your build command in the terminal:

ROLLUP_NO_NATIVE=true npm run build