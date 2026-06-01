// Step 1 — Update package.json
//Add these to your existing GAB UI package.json:
//In dependencies:

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
"@citi-icg-179025/payment-flow-ui-lib": "1.0.9",
"ag-grid-angular": "^32.3.9",
"ag-grid-community": "^32.3.9",
"bootstrap": "^5.3.8",
"zone.js": "~0.14.0"


// In devDependencies:

"@angular/cli": "~17.3.0",
"@angular-devkit/build-angular": "~17.3.0",
"vitest": "^2.1.9"

// In scripts:

"build:angular-element": "node scripts/build-angular-element.mjs"


// Step 2 — Create scripts/build-angular-element.mjs
//Create folder scripts/ at the 
//root of GAB UI and put the build-angular-element.mjs file there (the one already generated for you above).

npm install

// Step 4 — Build the Angular Elements bundle

npm run build:angular-element


// complete package json



