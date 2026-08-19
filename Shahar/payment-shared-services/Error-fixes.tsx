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


import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ChangeEvent,
  MouseEvent
} from 'react';

export function SSPaymentFlow(props: SSPaymentFlowProps) {
  const {
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
  } = props;

  // ... rest of component stays identical


  ROLLUP_NO_NATIVE=true npm run build