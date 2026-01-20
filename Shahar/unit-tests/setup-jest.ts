// import 'jest-preset-angular/setup-jest';

// // Global mock for Ag-Grid (if needed)
// Object.defineProperty(window, 'getComputedStyle', {
//   value: () => ({
//     getPropertyValue: (prop: string) => {
//       return '';
//     }
//   })
// });


import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// This initializes the environment for all 18 of your test suites
TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);