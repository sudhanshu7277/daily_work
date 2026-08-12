// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// // src/pages/intakeChannels/IntakeChannelsPage.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ---- Child Component Mocks ----
vi.mock('../aws-sync/AwsTicklerSyncPage', () => ({
  default: () => React.createElement('div', { 'data-testid': 'aws-tickler-sync-page' }, 'AWS Tickler Sync Page Mock'),
}));

vi.mock('../emailIntake/EmailIntakeAuditPage', () => ({
  default: () => React.createElement('div', { 'data-testid': 'email-intake-audit-page' }, 'Email Intake Audit Page Mock'),
}));

vi.mock('../citiSftIntake/CitiSftIntakeAuditPage', () => ({
  default: () => React.createElement('div', { 'data-testid': 'citisft-intake-audit-page' }, 'CitiSFT Intake Audit Page Mock'),
}));

vi.mock('../tickler/TicklerTaskPage', () => ({
  default: () => React.createElement('div', { 'data-testid': 'tickler-task-page' }, 'Tickler Task Page Mock'),
}));

// ---- Design System Mock ----
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style, ...props }: any) =>
      R.createElement('div', { className, style, ...props }, children),
    Icon: ({ type, className, style }: any) =>
      R.createElement('i', { className, style, 'data-icon-type': type }),
    Card: Object.assign(
      ({ children, onClick, className, style, layer }: any) =>
        R.createElement('div', { onClick, className, style, 'data-layer': layer, 'data-testid': 'card' }, children),
      {
        body: ({ children, style }: any) => R.createElement('div', { style }, children),
      }
    ),
  };
});

import IntakeChannelsPage from './IntakeChannelsPage';

describe('IntakeChannelsPage', () => {
  it('renders title and all four channel cards initially with no active component', () => {
    render(<IntakeChannelsPage />);

    expect(screen.getByText('Intake Channels')).toBeTruthy();
    expect(screen.getByText('AWS Tickler Sync')).toBeTruthy();
    expect(screen.getByText('Email Intake')).toBeTruthy();
    expect(screen.getByText('CitiSFT Intake')).toBeTruthy();
    expect(screen.getByText('Tickler Tasks')).toBeTruthy();

    expect(screen.queryByTestId('aws-tickler-sync-page')).toBeNull();
    expect(screen.queryByTestId('email-intake-audit-page')).toBeNull();
    expect(screen.queryByTestId('citisft-intake-audit-page')).toBeNull();
    expect(screen.queryByTestId('tickler-task-page')).toBeNull();
  });

  it('activates AWS Tickler Sync channel on click and toggles off on re-click', () => {
    render(<IntakeChannelsPage />);

    const awsCard = screen.getByText('AWS Tickler Sync');
    fireEvent.click(awsCard);

    expect(screen.getByTestId('aws-tickler-sync-page')).toBeTruthy();

    // Click again to deselect
    fireEvent.click(awsCard);
    expect(screen.queryByTestId('aws-tickler-sync-page')).toBeNull();
  });

  it('switches active component when different channel cards are clicked', () => {
    render(<IntakeChannelsPage />);

    // Click Email Intake
    fireEvent.click(screen.getByText('Email Intake'));
    expect(screen.getByTestId('email-intake-audit-page')).toBeTruthy();

    // Click CitiSFT Intake
    fireEvent.click(screen.getByText('CitiSFT Intake'));
    expect(screen.queryByTestId('email-intake-audit-page')).toBeNull();
    expect(screen.getByTestId('citisft-intake-audit-page')).toBeTruthy();

    // Click Tickler Tasks
    fireEvent.click(screen.getByText('Tickler Tasks'));
    expect(screen.queryByTestId('citisft-intake-audit-page')).toBeNull();
    expect(screen.getByTestId('tickler-task-page')).toBeTruthy();
  });
});