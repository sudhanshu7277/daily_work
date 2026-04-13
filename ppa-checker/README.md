# payment-checker

> Reusable Angular checker form library for PPA payment workflows — Pain001 / ISO 20022.
> Version **1.0.0** | Angular 17 | ng-packagr | Bootstrap 5

---

## Overview

`payment-checker` renders the same form as `payment-maker` but in a fully **read-only/disabled** state. On load it calls a GET API to fetch maker-submitted data (including the `transactionId`) and pre-populates all fields. The checker user can then **Reject** or **Approve** — both trigger a POST API call with the full payload and action status.

| Action | API call | Modal shown |
|--------|----------|-------------|
| Approve | POST `{ transactionId, action: 'APPROVED', formData }` | Green approved modal |
| Reject  | POST `{ transactionId, action: 'REJECTED', formData }` | Red rejected modal |

---

## Quick Start

```bash
unzip payment-checker.zip
cd payment-checker
npm install
npm start   # → http://localhost:4200
```

---

## Integration

### 1. Install

```bash
npm install payment-checker
```

### 2. Add Bootstrap

```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.scss"
]
```

### 3. Provide HttpClient

```typescript
// main.ts
import { provideHttpClient } from '@angular/common/http';
bootstrapApplication(AppComponent, { providers: [provideHttpClient()] });
```

### 4. Use in template

```html
<pc-checker-form
  [checkerInput]="checkerInput"
  (actionCompleted)="onActionCompleted($event)"
></pc-checker-form>
```

### 5. Component class

```typescript
import {
  CheckerComponentInput,
  CheckerActionResponse
} from 'payment-checker';

checkerInput: CheckerComponentInput = {
  applicationName:   'ADR',
  applicationModule: 'ADR',
  region:            'US',
  checkerGetUrl:     'https://your-api.com/api/v1/pain001/checker/get',
  checkerActionUrl:  'https://your-api.com/api/v1/pain001/checker/action',
  headers: { 'Authorization': 'Bearer your-token' }
};

onActionCompleted(response: CheckerActionResponse): void {
  console.log(response.action);        // 'APPROVED' | 'REJECTED'
  console.log(response.transactionId); // same TXN ID from maker
}
```

---

## API Reference

### GET — load checker data

`GET {checkerGetUrl}`

Response shape (`CheckerGetResponse`):
```typescript
{
  transactionId: string;       // bundled from maker submit
  submittedBy:   string;
  submittedAt:   string;       // ISO 8601
  status:        string;       // 'PENDING_CHECKER'
  formData:      Pain001Model; // pre-populates all form fields
}
```

### POST — approve or reject

`POST {checkerActionUrl}`

Request body (`CheckerActionRequest`):
```typescript
{
  transactionId: string;
  action:        'APPROVED' | 'REJECTED';
  formData:      Pain001Model;  // full form payload
}
```

Response (`CheckerActionResponse`):
```typescript
{
  success:       boolean;
  transactionId: string;
  action:        'APPROVED' | 'REJECTED';
  message:       string;
  timestamp:     string;
}
```

---

## Mock API

`USE_MOCK_API = true` by default in `checker-api.service.ts`.

- GET: returns realistic mock Pain001 data with a generated `transactionId` after 800ms
- POST: returns approve/reject response after 1000ms, logs full payload to console

To go live: set `USE_MOCK_API = false` and provide real URLs in `checkerInput`.

---

## CheckerComponentInput

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `applicationName` | string | ✅ | Sent as `X-Application-Name` header |
| `applicationModule` | string | ✅ | Sent as `X-Application-Module` header |
| `region` | string | ❌ | Sent as `X-Region` header |
| `checkerGetUrl` | string | ✅ | GET endpoint to load maker data |
| `checkerActionUrl` | string | ✅ | POST endpoint for approve/reject |
| `headers` | object | ❌ | Any additional custom headers |

---

## Inputs & Outputs

| Input | Type | Description |
|-------|------|-------------|
| `[checkerInput]` | `CheckerComponentInput` | API config + app context |

| Output | Type | When |
|--------|------|------|
| `(actionCompleted)` | `CheckerActionResponse` | After approve or reject POST succeeds |

---

## Project Structure

```
payment-checker/
├── .npmrc
├── .gitignore
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── README.md
│
├── projects/payment-checker/
│   ├── ng-package.json
│   ├── package.json               # name: "payment-checker", version: "1.0.0"
│   ├── tsconfig.lib.json
│   ├── tsconfig.lib.prod.json
│   ├── tsconfig.spec.json
│   └── src/
│       ├── public-api.ts
│       ├── index.ts
│       └── lib/
│           ├── models/
│           │   └── pain001.model.ts        # Pain001Model + all checker interfaces
│           ├── services/
│           │   ├── checker-api.service.ts  # GET + POST with mock mode
│           │   └── checker-api.service.spec.ts
│           ├── shared/
│           │   └── checker-form.scss       # Identical design to maker
│           └── components/checker-form/
│               ├── checker-form.component.ts
│               ├── checker-form.component.html
│               └── checker-form.component.spec.ts
│
└── src/                           # Demo app
    ├── index.html
    ├── main.ts
    ├── styles.scss
    └── app/app.component.ts
```

---

## Peer Dependencies

| Package | Required Version |
|---------|-----------------|
| `@angular/core` | `>=17.3.5` |
| `@angular/common` | `>=17.3.5` |
| `@angular/forms` | `>=17.3.5` |
| `bootstrap` | `>=5.3.8` |
| `rxjs` | `>=7.8.0` |

---

## License

Internal — © Your Organisation. Not for public distribution.

STEPS TO PACKAGE CHECKER NPM PACKAGE:
=====================================

1) projects/payment-checker/package.json
-----------------------------------------

{
  "name": "@citi-icg-169779/payment-checker",
  "version": "1.0.0",
  "publishConfig": {
    "registry": "https://www.artifactrepository.citigroup.net/artifactory/api/npm/npm-icg-teamdev-local/"
  }
}


2) Build the library
--------------------
cd ~/Documents/Maker-Checker-NPM-Packages/ppa-checker
pnpm run build:lib


3) Verify if checker npm package is published:
pnpm info @citi-icg-169779/payment-checker --registry=https://www.artifactrepository.citigroup.net/artifactory/api/npm/npm-icg-teamdev-local/
# Should print version 1.0.0 and package details



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
