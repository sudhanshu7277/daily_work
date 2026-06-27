// Step 1 — Add @angular/elements to the Angular lib's package.json
//In 179025.shared-services.payment-flow-ui-lib/package.json, add one line to dependencies:

"@angular/elements": "~17.3.5",

// It should sit alongside the other @angular/* packages (lines 19–25 in your file). The full dependencies block becomes:

"dependencies": {
  "@angular/animations": "~17.3.5",
  "@angular/common": "~17.3.5",
  "@angular/compiler": "~17.3.5",
  "@angular/core": "~17.3.5",
  "@angular/elements": "~17.3.5",
  "@angular/forms": "~17.3.5",
  "@angular/platform-browser": "~17.3.5",
  "@angular/platform-browser-dynamic": "~17.3.5",
  "@angular/router": "~17.3.5",
  "@citi-icg-172888/icgds": "~6.1.4",
  "@citi-icg-172888/icgds-design-tokens": "~6.1.3",
  "@citi-icg-172888/icgds-icons": "~6.1.0",
  "ag-grid-angular": "^32.3.9",
  "ag-grid-community": "^32.3.9",
  "bootstrap": "^5.3.8",
  "rxjs": "~7.8.0",
  "tslib": "^2.3.0",
  "typescript": "~5.4.5",
  "zone.js": "~0.14.6"
}

// After editing, run in the Angular lib project root:

npm install

// Step 2 — Create main-element.ts
//Create this file at:

projects/payment-flow-ui-lib/src/main-element.ts

// Full content:

import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { SSPaymentFlowComponent } from './lib/components/ss-payment-flow/ss-payment-flow.component';
import 'zone.js';

(async () => {
  const app = await createApplication({
    providers: [],
  });

  const SSPaymentFlowElement = createCustomElement(SSPaymentFlowComponent, {
    injector: app.injector,
  });

  customElements.define('ss-payment-flow', SSPaymentFlowElement);
})();

// Step 3 — Create tsconfig.element.json
//Create at the Angular lib project root (same level as angular.json):

{
    "extends": "./tsconfig.json",
    "compilerOptions": {
      "outDir": "./dist-element",
      "declaration": false,
      "inlineSources": false,
      "types": ["node"]
    },
    "files": [
      "projects/payment-flow-ui-lib/src/main-element.ts"
    ],
    "exclude": [
      "node_modules",
      "dist"
    ]
  }


  // Step 4 — Add build-element target to angular.json
//In angular.json, inside "projects" > "payment-flow-ui-lib" > "architect", add a new target after the existing "lint" block:

"build-element": {
  "builder": "@angular-devkit/build-angular:browser",
  "options": {
    "outputPath": "dist-element",
    "index": "",
    "main": "projects/payment-flow-ui-lib/src/main-element.ts",
    "tsConfig": "tsconfig.element.json",
    "scripts": [],
    "styles": [],
    "allowedCommonJsDependencies": [
      "zone.js"
    ]
  },
  "configurations": {
    "production": {
      "optimization": true,
      "outputHashing": "none",
      "sourceMap": false,
      "namedChunks": false,
      "aot": true,
      "budgets": []
    }
  }
}


// The full architect block in angular.json will now be:

architect: {
    build: { ... },      ← existing
    lint: { ... },       ← existing
    build-element: { ... } ← NEW
  }

// Step 5 — Patch schema-utils
//Run this in PowerShell inside the Angular lib project root:

Get-ChildItem -Recurse -Path node_modules -Filter "absolutePath.js" | Select-Object FullName

// step 6

// Go ahead and run it, then immediately after run:

.\node_modules\.bin\ng run payment-flow-ui-lib:build-element:production
