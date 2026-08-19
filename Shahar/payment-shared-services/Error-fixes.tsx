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


// Step 1: Update types in tsconfig.json
//Add "react", "react-dom", and "node" to the "types" array on line 21:

"types": [
  "vitest/globals",
  "@testing-library/jest-dom",
  "react",
  "react-dom",
  "node"
]



// Step 2: Update SSPaymentFlow.tsx
//In SSPaymentFlow.tsx (around line 35), drop : FC<SSPaymentFlowProps> and type the destructured props argument directly:


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
  // component body...


  // Step 3: Run the Build
// In your terminal:


ROLLUP_NO_NATIVE=true npm run build

