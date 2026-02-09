pnpm add primeng primeicons

angular.json
=============

"styles": [
  "node_modules/primeng/resources/themes/lara-light-blue/theme.css",
  "node_modules/primeng/resources/primeng.min.css",
  "node_modules/primeicons/primeicons.css",
  "src/styles.scss"
],

tsconfig
=========

{
  "compilerOptions": {
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "primeng/*": ["node_modules/primeng/*"]
    },
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true
  }
}

ppa-entry.module.ts
====================

@NgModule({
  declarations: [
    // REMOVE Checker2Component from here
  ],
  imports: [
    CommonModule,
    Checker2Component, // ADD it here
    // ... rest of your imports
  ]
})

checker2.component.ts
=========================
imports: [
  // ...
  MatDatepickerModule,
  MatInputModule,
  MatFormFieldModule,
  MatNativeDateModule // Required for Datepicker providers
]


@import "@ag-grid-community/styles/ag-grid.css";
@import "@ag-grid-community/styles/ag-theme-alpine.css";

