//Step 1: Fix the sourceObjectRef Export & Filename CasingThe generator created SourceObjectRef.ts with PascalCase, but index.ts exported it using camelCase.   


//Open src/generated/party-arrangement-contact-point/index.ts.   Locate line 35:   

export type { sourceObjectRef } from './models/sourceObjectRef';

//Change it to match the PascalCase export and file name:   

export type { SourceObjectRef } from './models/SourceObjectRef';

Verification: Run npx tsc --noEmit and check that both TS2724 and TS1149 errors disappear.

//Step 2: Fix the Model Mismatches in account-contact-address.to.api.tsOpen src/app/core/mappers/account-contact-address.to.api.ts.   

//1. Fix addressValidationOption (Line 89)

// Current line 89:
requestControl: { addressValidationOption: 'BYPASS' },


//If your application requires bypassing validation and the generator schema doesn't yet define the field, use a type assertion:

requestControl: { addressValidationOption: 'BYPASS' } as any,


//2. Fix floorNumber (Line 119)

// Current line 119:
floorNumber: address.floor,


//Check src/generated/party-arrangement-contact-point/models/AddressRequest.ts for how floor or unit numbers are modeled:

({ ...mappedAddress, floorNumber: address.floor } as any)


//Step 3: Start the Application
// Once the mapper file and index export are aligned:

npm start

