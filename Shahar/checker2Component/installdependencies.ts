pnpm add primeng primeicons

"styles": [
  "./node_modules/primeicons/primeicons.css",
  "./node_modules/primeng/resources/themes/lara-light-blue/theme.css",
  "./node_modules/primeng/resources/primeng.min.css",
  "src/styles.scss"
]


add to .npmrc

public-hoist-pattern[]=*primeng*

run : pnpm add primeng primeicons @primeng/themes

run: pnpm install --shamefully-flatten

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Required
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { AppComponent } from './app.component';
import { Checker1Component } from './checker1/checker1.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ToastModule,
    Checker1Component // Since Checker1 is standalone, import it here
  ],
  providers: [MessageService], // Global provider for Toast
  bootstrap: [AppComponent]
})
export class AppModule { }

"compilerOptions": {
  "moduleResolution": "node",
  "paths": {
    "@angular/material/*": ["node_modules/@angular/material/*"],
    "@angular/cdk/*": ["node_modules/@angular/cdk/*"],
    "primeng/*": ["node_modules/primeng/*"]
  }
}