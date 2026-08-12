// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// Fix 1: src/api/client.test.ts
//In client.ts, handling a 401 status code triggers a page redirect or reload (window.location.reload() or window.location.href = '/login').

//Mock window.location in src/api/client.test.ts:


// Add this near the top of src/api/client.test.ts

const originalLocation = window.location;

beforeEach(() => {
  vi.clearAllMocks();

  // Mock window.location to prevent jsdom navigation error on 401
  delete (window as any).location;
  window.location = {
    ...originalLocation,
    href: 'http://localhost/',
    reload: vi.fn(),
    assign: vi.fn(),
    replace: vi.fn(),
  } as any;
});

afterEach(() => {
  window.location = originalLocation;
});


//Fix 2: src/pages/emailIntake/EmailIntakeAuditPage.test.tsx
//In EmailIntakeAuditPage.test.tsx, CSV exporting or tab navigation attempts to trigger DOM link navigation.

// Stub window.location for jsdom navigation safety
delete (window as any).location;
window.location = {
  href: '',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
} as any;