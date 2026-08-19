// 1. Create projects/payment-flow-ui-lib/src/vite-env.d.ts

/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />


//2. Verify tsconfig.json
Open tsconfig.json and ensure "jsx": "react-jsx" and the include glob are configured without syntax errors:

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
    "projects/payment-flow-ui-lib/src/**/*",
    "vite.config.ts",
    "vitest.setup.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}




//3. Switch VS Code to Use Workspace TypeScript Version
Open SSPaymentFlow.tsx.

Press Ctrl + Shift + P (or Cmd + Shift + P).

Type: TypeScript: Select TypeScript Version... and press Enter.

Choose Use Workspace Version (pointing to node_modules/typescript).

Press Ctrl + Shift + P again -> type TypeScript: Restart TS Server -> press Enter.


// 4. Verify Local Build
Run the library build:

ROLLUP_NO_NATIVE=true npm run build