# payment-maker

> Reusable Angular maker form library for PPA payment workflows — Pain001 / ISO 20022.
> Version **1.0.0** | Angular 17 | ng-packagr | Bootstrap 5

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Project Setup — Library Developers](#3-project-setup--library-developers)
4. [.npmrc Setup](#4-npmrc-setup)
5. [Building the Library](#5-building-the-library)
6. [Publishing to Artifactory](#6-publishing-to-artifactory)
7. [Consuming the Library — Host App Teams](#7-consuming-the-library--host-app-teams)
8. [Integration Guide](#8-integration-guide)
9. [PaymentComponentInput Reference](#9-paymentcomponentinput-reference)
10. [Pain001Model — Full Field Reference](#10-pain001model--full-field-reference)
11. [Form Validation Rules](#11-form-validation-rules)
12. [Switching Mock API to Real API](#12-switching-mock-api-to-real-api)
13. [Running the Demo App](#13-running-the-demo-app)
14. [Running Tests](#14-running-tests)
15. [Form Layout — Section Reference](#15-form-layout--section-reference)
16. [Styling & Theming](#16-styling--theming)
17. [Project Structure](#17-project-structure)
18. [Peer Dependencies](#18-peer-dependencies)
19. [Troubleshooting](#19-troubleshooting)

---

## 1. Overview

`payment-maker` is a standalone Angular component library that renders a complete **Pain001 payment instruction maker form**. The form collects all fields from the Pain001 / ISO 20022 standard, validates required fields, and submits the payload to a configurable POST API endpoint.

**Key behaviours:**
- All fields from `Pain001Model` are rendered (debtor, debtor address, intermediary banks, creditor, creditor address, additional details, charge details)
- Multi-column responsive grid layout (3-col → 2-col → 1-col)
- Submit button stays **disabled** until all required fields pass validation
- On submit: POST API call → success modal displays the generated Transaction ID
- Mock API built-in — flip one flag to go live

---

## 2. Prerequisites

| Tool | Min Version | Check |
|------|-------------|-------|
| Node.js | 18.x or 20.x | `node -v` |
| npm | 9.x or 10.x | `npm -v` |
| Angular CLI | 17.x | `ng version` |

```bash
npm install -g @angular/cli@17
```

---

## 3. Project Setup — Library Developers

**Step 1 — Extract / clone**

```bash
unzip payment-maker.zip
cd payment-maker
```

**Step 2 — Install dependencies**

```bash
npm install
```

**Step 3 — Verify**

```bash
ng version
```

---

## 4. .npmrc Setup

The `.npmrc` file lives at the workspace root.

**Step 1 — Open it**
```bash
code .npmrc
```

**Step 2 — Uncomment and fill your Artifactory registry**
```ini
registry=https://your-org.jfrog.io/artifactory/api/npm/npm-local/
```

**Step 3 — Add auth token line**
```ini
//your-org.jfrog.io/artifactory/api/npm/npm-local/:_authToken=${NPM_AUTH_TOKEN}
```

**Step 4 — Set environment variable (never hardcode)**
```bash
# Mac / Linux
export NPM_AUTH_TOKEN=your-actual-token

# Windows PowerShell
$env:NPM_AUTH_TOKEN="your-actual-token"
```

**Step 5 — Verify connection**
```bash
npm whoami --registry=https://your-org.jfrog.io/artifactory/api/npm/npm-local/
```

---

## 5. Building the Library

**Step 1**
```bash
npm run build:lib
```

Output goes to `dist/payment-maker/`.

**Step 2 — Pack locally for testing (optional)**
```bash
npm run pack:lib
# Creates dist/payment-maker/payment-maker-1.0.0.tgz
```

Install locally in another project:
```bash
npm install ../payment-maker/dist/payment-maker/payment-maker-1.0.0.tgz
```

---

## 6. Publishing to Artifactory

Complete Section 4 first.

```bash
npm run build:lib
cd dist/payment-maker
npm publish
```

**Bump version for a new release** — edit `projects/payment-maker/package.json`:
```json
{ "version": "1.1.0" }
```
Then rebuild and publish.

---

## 7. Consuming the Library — Host App Teams

**Step 1 — Add `.npmrc`** to your project root (same as Section 4).

**Step 2 — Install**
```bash
npm install payment-maker
```

**Step 3 — Install Bootstrap** (peer dependency)
```bash
npm install bootstrap@^5.3.8
```

**Step 4 — Add Bootstrap CSS** to `angular.json` styles:
```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.scss"
]
```

**Step 5 — Provide HttpClient** in `main.ts`:
```typescript
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()]
});
```

**Step 6 — Import the component**
```typescript
import { MakerFormComponent } from 'payment-maker';

@Component({
  standalone: true,
  imports: [MakerFormComponent]
})
export class MyPageComponent {}
```

---

## 8. Integration Guide

### Step 1 — Add to template

```html
<pm-maker-form
  [paymentInput]="paymentInput"
  [initialData]="existingData"
  (submitted)="onMakerSubmit($event)"
  (formChange)="onFormChange($event)"
></pm-maker-form>
```

### Step 2 — Set up component class

```typescript
import {
  PaymentComponentInput,
  MakerSubmitResponse,
  Pain001Model
} from 'payment-maker';

export class MyComponent {

  // Build this exactly as the payment-parent component does:
  paymentInput: PaymentComponentInput = {
    applicationName:   'ADR',
    applicationModule: 'ADR',
    region:            'US',
    makerSubmitUrl:    'https://your-api.com/api/v1/pain001/maker/submit',
    headers: {
      'Authorization': 'Bearer your-token'
    }
  };

  // Optional: pre-populate form
  existingData: Partial<Pain001Model> = {};

  onMakerSubmit(response: MakerSubmitResponse): void {
    console.log('Transaction ID:', response.transactionId);
    // Store transactionId — needed for checker flow
  }

  onFormChange(partial: Partial<Pain001Model>): void {
    // React to field changes in real time
  }
}
```

### Inputs & Outputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `paymentInput` | `PaymentComponentInput` | ✅ | App context + API URL + headers |
| `initialData` | `Partial<Pain001Model>` | ❌ | Pre-populate form fields |

| Output | Type | When |
|--------|------|------|
| `submitted` | `MakerSubmitResponse` | POST API succeeds |
| `formChange` | `Partial<Pain001Model>` | Any field value changes |

---

## 9. PaymentComponentInput Reference

```typescript
interface PaymentComponentInput {
  applicationName:   string;   // e.g. 'ADR' — sent as X-Application-Name header
  applicationModule: string;   // e.g. 'ADR' — sent as X-Application-Module header
  region?:           string;   // e.g. 'US'  — sent as X-Region header
  makerSubmitUrl:    string;   // POST endpoint for Pain001 submission
  headers?:          Record<string, string>; // any additional custom headers
}
```

**POST request body** — the full `Pain001Model` object.

**POST response** expected shape:
```typescript
interface MakerSubmitResponse {
  success:       boolean;
  transactionId: string;           // e.g. "TXN-1712345678-4321"
  message:       string;
  timestamp:     string;           // ISO 8601
  status:        'PENDING_CHECKER' | 'ERROR';
}
```

---

## 10. Pain001Model — Full Field Reference

### Required fields (form invalid if empty)

| Field | Label in Form | Type |
|-------|--------------|------|
| `requestedExecutionDate` | Value Date | date string |
| `debtorName` | Debtor Name | string |
| `debtorAccountNumber` | Debtor Account Number | string |
| `debtorAgentBIC` | Debtor Agent BIC | string |
| `instructedAmount` | Transaction Amount | number (> 0) |
| `instructedAmountCurrencyCode` | Currency | string |
| `creditorName` | Creditor Name | string |
| `creditorAccount` | Creditor Account Number | string |
| `creditorAgentFinancialInstitutionBIC` | Creditor Agent BIC | string |
| `creditorAgentFinancialInstitutionName` | Creditor Agent Bank Name | string |
| `creditorAgentAccountNumber` | Creditor Agent Account Number | string |
| `painPaymentMethodType` | Payment Type (CBT/BKT/DFT) | string |

### Optional fields (all other Pain001Model fields)

Debtor address (street, building, postal, town, country, sort codes), intermediary banks (1st and 2nd: BIC, routing code, name, country, account), creditor address (mirrors debtor), remittance info, charge bearer, charges amount, charges agent BIC, context fields (applicationName, applicationModule, region).

---

## 11. Form Validation Rules

- **Submit button** stays disabled until all required fields pass validation
- Required field validation fires on field `blur` (touch) and on submit attempt
- Red error message appears below each invalid touched field
- `instructedAmount` must be > 0

---

## 12. Switching Mock API to Real API

**Step 1 — Open the service**
```
projects/payment-maker/src/lib/services/maker-api.service.ts
```

**Step 2 — Change the flag**
```typescript
export const USE_MOCK_API = false;  // was true
```

**Step 3 — Rebuild**
```bash
npm run build:lib
```

**Step 4 — Ensure real URL in `paymentInput`**
```typescript
paymentInput = {
  makerSubmitUrl: 'https://real-api.com/api/v1/pain001/maker/submit',
  // ...
};
```

**Alternative — override the service in your host app:**
```typescript
import { MakerApiService } from 'payment-maker';

@Injectable()
class RealMakerApiService extends MakerApiService {
  override submitMakerForm(payload, input) {
    // your real call
  }
}

// providers:
{ provide: MakerApiService, useClass: RealMakerApiService }
```

---

## 13. Running the Demo App

```bash
npm install
npm start
# Open http://localhost:4200
```

The demo renders the full maker form. Fill all required fields (marked `*`) to enable the Submit Payment button. On submit, a success modal displays the mock transaction ID.

---

## 14. Running Tests

```bash
npm test                     # run all tests
npx jest --watch             # watch mode
npx jest --coverage          # coverage report → coverage/
```

| Test file | Covers |
|-----------|--------|
| `maker-api.service.spec.ts` | Mock submit — response shape, transactionId format |
| `maker-form.component.spec.ts` | Form validity, submit button state, required validation |

---

## 15. Form Layout — Section Reference

| Section | Columns | Fields |
|---------|---------|--------|
| **Debtor Information** | 3-col | Name, Account Number, Agent BIC |
| **Debtor Address Details** | 2-col / 3-col / 1-col | Address lines, Street/Building/Postal, Town/State, Country/Subdivision, Sort Code |
| **Intermediary Bank Details** | 3-col / 2-col | 1st & 2nd bank: SWIFT/Routing/Name, Country/Account |
| **Creditor Information** | 3-col / 2-col | Name/Account/BIC, Bank Name/Agent Account |
| **Creditor Address Details** | 2-col / 3-col / 1-col | Mirrors debtor address layout |
| **Additional Details** | 2-col | Remittance Info, Payment Type dropdown |
| **Charge Details** | 3-col | Charge Information, Charges Amount, Agent BIC |

Responsive breakpoints: **≥ 900px** = full multi-column | **< 900px** = 2-col | **< 576px** = 1-col stack.

---

## 16. Styling & Theming

The library owns all its styles via `maker-form.scss`. No global styles are added to the host app.

Bootstrap 5 is a peer dependency — add to host app's `angular.json` styles array.

Override via CSS custom properties:
```css
:root {
  --pm-primary:        #1a5fa8;   /* submit button active, focus rings */
  --pm-section-bg:     #1a6db5;   /* blue section header bars */
  --pm-section-text:   #ffffff;
  --pm-page-start:     #cdd6e3;   /* page background gradient start */
  --pm-page-end:       #e2eaf4;   /* page background gradient end */
  --pm-body-bg:        #d8e0ec;   /* section body background */
  --pm-input-border:   #bcc6d4;   /* input borders */
  --pm-required:       #c0392b;   /* required * and error messages */
}
```

---

## 17. Project Structure

```
payment-maker/
├── .npmrc                                    # Artifactory config (Section 4)
├── .gitignore
├── angular.json
├── package.json                              # workspace scripts + devDeps
├── tsconfig.json                             # root TS config + path alias
├── tsconfig.app.json                         # demo app TS config
├── README.md
│
├── projects/payment-maker/                   # ◄ THE LIBRARY
│   ├── ng-package.json                       # ng-packagr config
│   ├── package.json                          # name: "payment-maker", version: "1.0.0"
│   ├── tsconfig.lib.json
│   ├── tsconfig.lib.prod.json                # partial Ivy compilation
│   ├── tsconfig.spec.json
│   └── src/
│       ├── public-api.ts                     # all public exports
│       ├── index.ts
│       └── lib/
│           ├── models/
│           │   └── pain001.model.ts          # Pain001Model, PaymentComponentInput, factory, options
│           ├── services/
│           │   ├── maker-api.service.ts      # POST API + mock mode
│           │   └── maker-api.service.spec.ts
│           ├── shared/
│           │   └── maker-form.scss           # all component styles
│           └── components/maker-form/
│               ├── maker-form.component.ts
│               ├── maker-form.component.html
│               └── maker-form.component.spec.ts
│
└── src/                                      # ◄ DEMO APP
    ├── index.html
    ├── main.ts
    ├── styles.scss
    ├── assets/
    └── app/
        ├── app.component.ts
        ├── app.component.html
        └── app.component.scss
```

---

## 18. Peer Dependencies

| Package | Required Version |
|---------|-----------------|
| `@angular/core` | `>=17.3.5` |
| `@angular/common` | `>=17.3.5` |
| `@angular/forms` | `>=17.3.5` |
| `bootstrap` | `>=5.3.8` |
| `rxjs` | `>=7.8.0` |

---

## 19. Troubleshooting

**Submit button stays disabled**
All required fields must be filled and valid. Open browser DevTools → Console for form errors. Required fields: requestedExecutionDate, debtorName, debtorAccountNumber, debtorAgentBIC, instructedAmount (> 0), instructedAmountCurrencyCode, creditorName, creditorAccount, creditorAgentFinancialInstitutionBIC, creditorAgentFinancialInstitutionName, creditorAgentAccountNumber, painPaymentMethodType.

**`NullInjectorError: No provider for HttpClient`**
Add `provideHttpClient()` to your app's bootstrap providers.

**Bootstrap styles not applying**
Add `node_modules/bootstrap/dist/css/bootstrap.min.css` to your `angular.json` styles array.

**`npm install payment-maker` returns 404**
Check `.npmrc` registry URL and confirm `NPM_AUTH_TOKEN` is set. Verify the package was published via Artifactory UI.

**`npm publish` returns 403 Forbidden**
Token may have expired or lacks deploy permissions on the Artifactory repository.

---

## License

Internal — © Your Organisation. Not for public distribution.


Maker package usage steps:

1) Add the scoped registry to the consuming project's .npmrc

@citi-icg-169779:registry=https://www.artifactrepository.citigroup.net/artifactory/api/npm/npm-icg-teamdev-local/

2) Install the package

pnpm install @citi-icg-169779/payment-maker

3) Add Bootstrap to angular.json

"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.scss"
]

4) Add provideHttpClient to main.ts

import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()]
});

5) Use in your component

import {
  MakerFormComponent,
  PaymentComponentInput,
  MakerSubmitResponse,
  FormFieldConfig,
  DEFAULT_FIELD_CONFIG
} from '@citi-icg-169779/payment-maker';

@Component({ standalone: true, imports: [MakerFormComponent] })
export class YourComponent {

  paymentInput: PaymentComponentInput = {
    applicationName:   'YOUR_APP',
    applicationModule: 'YOUR_MODULE',
    region:            'US',
    useMockApi:        true,   // false when real APIs ready
    makerSubmitUrl:    'https://your-api.com/api/v1/pain001/maker/submit',
    hardcapCheckUrl:   'https://your-api.com/api/v1/pain001/hardcap/check',
  };

  fieldConfig: FormFieldConfig[] = DEFAULT_FIELD_CONFIG;

  onSubmitted(res: MakerSubmitResponse): void {
    console.log('TXN:', res.transactionId);
    // trigger checker here when ready
  }
}

6) Add to template

<pm-maker-form
  [paymentInput]="paymentInput"
  [fieldConfig]="fieldConfig"
  (submitted)="onSubmitted($event)">
</pm-maker-form>

End to end maker npm package setup steps
============================================================================================

Part 1 — Package & Publish

Step 1 — Update projects/payment-maker/package.json

{
  "name": "@citi-icg-169779/payment-maker",
  "version": "1.0.2",
  "publishConfig": {
    "registry": "https://www.artifactrepository.citigroup.net/artifactory/api/npm/npm-icg-teamdev-local/"
  }
}

Step 2 — Update ppa-maker/.npmrc

@citi-icg-169779:registry=https://www.artifactrepository.citigroup.net/artifactory/api/npm/npm-icg-teamdev-local/
//www.artifactrepository.citigroup.net/artifactory/api/npm/npm-icg-teamdev-local/:_authToken=${NPM_AUTH_TOKEN}

strict-ssl=false
email=sj81534@citi.com
always-auth=true
cafile=C:\Users\sj81534\cacerts.jks
save-exact=true
legacy-peer-deps=true

Step 3 — Set auth token

$env:NPM_AUTH_TOKEN = "eyJ..."

login into registry: 

pnpm login -- registry=https://www.artifactrepository.citigroup.net/artifactory/api/npm/npm-teamdev/


Step 4 — Build the library

cd ~/Documents/Maker-Checker-NPM-Packages/ppa-maker
pnpm run build:lib

Step 5 — Verify built output

cat dist/payment-maker/package.json
# Must show @citi-icg-169779/payment-maker and publishConfig

Step 6 — Publish

cd dist/payment-maker
pnpm publish --no-git-checks


Step 7 — Verify published

pnpm info @citi-icg-169779/payment-maker --registry=https://www.artifactrepository.citigroup.net/artifactory/api/npm/npm-icg-teamdev-local/

Part 2 — Consumer Usage

Step 1 — Add registry to consuming project .npmrc

@citi-icg-169779:registry=https://www.artifactrepository.citigroup.net/artifactory/api/npm/npm-icg-teamdev-local/

Step 2 — Install

pnpm install @citi-icg-169779/payment-maker

Step 3 — Add Bootstrap to angular.json

"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.scss"
]


Step 4 — Add provideHttpClient to main.ts

import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()]
});


Step 5 — Component class

import {
  MakerFormComponent,
  PaymentComponentInput,
  MakerSubmitResponse,
  FormFieldConfig,
  DEFAULT_FIELD_CONFIG
} from '@citi-icg-169779/payment-maker';

@Component({ standalone: true, imports: [MakerFormComponent] })
export class YourComponent {

  paymentInput: PaymentComponentInput = {
    applicationName:   'YOUR_APP',
    applicationModule: 'YOUR_MODULE',
    region:            'US',
    useMockApi:        true,   // false when real APIs ready
    makerSubmitUrl:    'https://your-api.com/api/v1/pain001/maker/submit',
    hardcapCheckUrl:   'https://your-api.com/api/v1/pain001/hardcap/check',
    headers: { 'Authorization': 'Bearer your-token' }
  };

  fieldConfig: FormFieldConfig[] = DEFAULT_FIELD_CONFIG;

  onSubmitted(res: MakerSubmitResponse): void {
    console.log('TXN:', res.transactionId);
    console.log('Message:', res.message);
    // trigger checker here
    this.showChecker = true;
  }
}

Step 6 — Template

<pm-maker-form
  [paymentInput]="paymentInput"
  [fieldConfig]="fieldConfig"
  (submitted)="onSubmitted($event)"
  (formChange)="onFormChange($event)">
</pm-maker-form>


Step 7 — When real APIs ready (one change only)

paymentInput: PaymentComponentInput = {
  useMockApi:      false,   // ← only change
  makerSubmitUrl:  'https://your-real-api.com/api/v1/pain001/maker/submit',
  hardcapCheckUrl: 'https://your-real-api.com/api/v1/pain001/hardcap/check',
  // everything else stays the same
};

// CHECK IF THIS VERSION IS PUBLISHED

pnpm info @citi-icg-169779/payment-maker@1.0.3 --registry=https://www.artifactrepository.citigroup.net/artifactory/api/npm/npm-icg-teamdev-local/

