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




// Step 1: Update tsconfig.json
//Add "jsxImportSource": "react" under compilerOptions, and add /**/* 
// to the include path so TypeScript recursively binds all types across components:

{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "declaration": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "strict": true,
    "resolveJsonModule": true
  },
  "include": [
    "projects/payment-flow-ui-lib/src/**/*",
    "vite.config.ts",
    "vitest.setup.ts"
  ]
}


// Step 2: Verify import React from 'react' at the top of SSPaymentFlow.tsx
//Ensure the top of SSPaymentFlow.tsx imports React and declares the component 
// signature with props typing:


import React, {
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
  PaymentComponentInput,
  PaymentComponentOutput,
  FormFieldConfig,
  FormValidityPayload
} from '../models/models';

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


  ROLLUP_NO_NATIVE=true npm run build