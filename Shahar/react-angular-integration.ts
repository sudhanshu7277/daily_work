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


// run to get full paths 

Get-ChildItem -Recurse -Path node_modules -Filter "absolutePath.js" | Select-Object -ExpandProperty FullName

// Run this exact block:

$files = @(
    "node_modules\.pnpm\schema-utils@3.3.0\node_modules\schema-utils\dist\keywords\absolutePath.js",
    "node_modules\.pnpm\schema-utils@4.3.3\node_modules\schema-utils\dist\keywords\absolutePath.js",
    "node_modules\schema-utils\dist\keywords\absolutePath.js",
    "node_modules\webpack\node_modules\schema-utils\dist\keywords\absolutePath.js"
  )
  
  foreach ($file in $files) {
    if (Test-Path $file) {
      (Get-Content $file) -replace 'shouldBeAbsolute \?', 'false ?' | Set-Content $file
      Write-Host "Patched: $file"
    }
  }

  // Share the output showing which files were patched, then run the build:

  .\node_modules\.bin\ng run payment-flow-ui-lib:build-element:production


  // Step 6 — Combine and copy to React project
//The build output is in dist-element/. We need to concatenate runtime.js + main.js into a single file and copy it to the React project's public/ folder.
// Run in PowerShell:

Get-Content "dist-element\runtime.js", "dist-element\main.js" | Set-Content "dist-element\ss-payment-flow-element.js"

Copy-Item "dist-element\ss-payment-flow-element.js" "C:\Users\SJ81534\Documents\GAB-UI-DEVELOPMENT\179025.shared-services.gab-ui\public\ss-payment-flow-element.js"


