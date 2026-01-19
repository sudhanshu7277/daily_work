import 'jest-preset-angular/setup-jest';

// Global mock for Ag-Grid (if needed)
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop: string) => {
      return '';
    }
  })
});