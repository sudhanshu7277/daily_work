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
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "strict": true,
    "resolveJsonModule": true
  },
  "include": [
    "projects/payment-flow-ui-lib/src/**/*",
    "vite.config.ts",
    "vitest.setup.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
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


ROLLUP_NO_NATIVE=true npm run build