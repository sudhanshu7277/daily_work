// Step 1 — Fix the @angular/elements version mismatch first

pnpm install @angular/elements@~17.3.5

// Step 2 — Add build-element target to angular.json
//In your angular.json, after the closing } of the lint block (line 38) and before }} 
// (line 39-40), add this new target. Here's exactly what the architect section should look like after your edit:

"architect": {
  "build": {
    ...existing build config...
  },
  "lint": {
    ...existing lint config...
  },
  "build-element": {
  "builder": "@angular-devkit/build-angular:application",
  "options": {
    "outputPath": "dist/element",
    "index": false,
    "browser": "projects/src/main-element.ts",
    "tsConfig": "tsconfig.app.json",
    "polyfills": ["zone.js"],
    "outputHashing": "none",
    "budgets": []
  },
  "configurations": {
    "production": {
      "outputHashing": "none",
      "optimization": true,
      "sourceMap": false,
      "namedChunks": false,
      "budgets": []
    }
  },
  "defaultConfiguration": "production"
}
}

// Step 3 — Create projects/src/main-element.ts

import 'zone.js';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { SSPaymentMakerComponent } from './lib/ss-payment-flow/ss-payment-flow.component';

(async () => {
  const app = await createApplication({
    providers: [provideHttpClient(withInterceptorsFromDi())],
  });

  const PaymentElement = createCustomElement(SSPaymentMakerComponent, {
    injector: app.injector,
  });

  customElements.define('ss-payment-flow', PaymentElement);
})();

//Step 4 — Add build script to package.json

// Add to scripts:

"build:element": "ng build build-element --configuration production",
"bundle:element": "node concat-element.mjs"

//Step 5 — Create concat-element.mjs at root

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist', 'element', 'browser');
const outputFile = path.join(__dirname, 'dist', 'ss-payment-flow-element.js');

const chunkOrder = ['polyfills.js', 'main.js'];
let combined = '';

const allJs = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
const extras = allJs.filter(f => !chunkOrder.includes(f));
for (const extra of extras) {
  combined += fs.readFileSync(path.join(distDir, extra), 'utf8') + '\n';
}
for (const chunk of chunkOrder) {
  const p = path.join(distDir, chunk);
  if (fs.existsSync(p)) {
    combined += fs.readFileSync(p, 'utf8') + '\n';
  }
}

fs.writeFileSync(outputFile, combined, 'utf8');
console.log('✅ dist/ss-payment-flow-element.js ready — copy to GAB UI public/');

