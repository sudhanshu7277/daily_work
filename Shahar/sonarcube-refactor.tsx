// cmd to run tests locally

npx vitest run --coverage

// src/App.test.tsx

describe('App route wiring', () => {
  it('guards /whitelist with only ROLE_MAINTENANCE_SET_UP', () => {
    // Fix: Call renderAt('/whitelist') before inspecting protectedRoles
    renderAt('/whitelist');

    expect(protectedRoles[0]).toEqual(['ROLE_MAINTENANCE_SET_UP']);
  });

  it('guards /thresholds with the maintenance/checker roles', () => {
    renderAt('/thresholds');

    expect(protectedRoles[0]).toEqual([
      'ROLE_MAINTENANCE_SET_UP',
      'ROLE_PAYMENT_CHECKER',
      'ROLE_SUPER_CHECKER',
    ]);
  });

  it('matches the dynamic :id param route for instruction detail', () => {
    renderAt('/instructions/12345');

    expect(screen.getByTestId('instruction-detail')).toBeTruthy();
  });
});