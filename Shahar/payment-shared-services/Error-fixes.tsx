// Step 1: Fix tsconfig.json
Open tsconfig.json and update the "include" array to target projects/payment-flow-ui-lib/**/* without the src/ path:

{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "declaration": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "resolveJsonModule": true
  },
  "include": [
    "projects/payment-flow-ui-lib/**/*",
    "vite.config.ts",
    "vitest.setup.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}

//Step 2: Component Definition in SSPaymentFlow.tsx
In projects/payment-flow-ui-lib/components/ss-payment-flow/SSPaymentFlow.tsx (around line 35):

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

  // Step 3: Restart VS Code TS Server
//In VS Code, press Ctrl + Shift + P (or Cmd + Shift + P).

//Type TypeScript: Restart TS Server and press Enter.

//TypeScript will now bind directly to projects/payment-flow-ui-lib/components/ 
///and all JSX errors (<div>, <label>, <select>, <option>) will clear.

//Step 4: Run the Build

ROLLUP_NO_NATIVE=true npm run build
  
  