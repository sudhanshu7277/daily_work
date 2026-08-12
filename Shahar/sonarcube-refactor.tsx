// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// src/pages/documentViewer/DocumentViewerPage.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ---- Mock the useDocumentViewer hook ----
const mockLoadDocument = vi.fn();
const mockHighlightField = vi.fn();
const mockRefreshViewer = vi.fn();

const hookState = {
  viewerReady: false,
  docLoaded: null as { fileName: string; pageCount: number } | null,
  mfeUrl: 'https://viewer.example/',
};

vi.mock('../../hooks/useDocumentViewer', () => ({
  useDocumentViewer: () => ({
    iframeRef: { current: null },
    viewerReady: hookState.viewerReady,
    docLoaded: hookState.docLoaded,
    mfeUrl: hookState.mfeUrl,
    loadDocument: mockLoadDocument,
    highlightField: mockHighlightField,
    refreshViewer: mockRefreshViewer,
  }),
}));

// ---- Mock the design-system components as plain DOM ----
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style, ...props }: any) =>
      R.createElement('div', { className, style, ...props }, children),
    Card: ({ children, style, className }: any) =>
      R.createElement('div', { style, className, 'data-testid': 'card' }, children),
    Tag: ({ children, color, style }: any) =>
      R.createElement('span', { 'data-color': color, style }, children),
    Button: ({ children, onClick, title, disabled, 'aria-label': ariaLabel }: any) =>
      R.createElement('button', { onClick, title, disabled, 'aria-label': ariaLabel }, children),
    Input: ({ value, onChange, placeholder, disabled, style }: any) =>
      R.createElement('input', {
        placeholder,
        value: value ?? '',
        disabled,
        style,
        onChange,
        'data-testid': `input-${placeholder || 'default'}`,
      }),
    Alert: ({ children, type }: any) =>
      R.createElement('div', { 'data-testid': `alert-${type}` }, children),
    Loading: ({ tip }: any) => R.createElement('div', null, tip),
    Icon: ({ type, className }: any) =>
      R.createElement('i', { className: `icon-${type} ${className || ''}` }),
  };
});

import DocumentViewerPage from './DocumentViewerPage';
import {
  EXTRACTED_FIELDS,
  EXTRACTED_DATA_NO_BBOX,
  DOCUMENT_CATEGORIES,
  SAMPLE_PDF_FILENAME,
  fieldLabel,
} from '../../data/dummyDocumentFields';

const fakeBuffer = new ArrayBuffer(8);

function stubFetch(ok = true) {
  const res = {
    ok,
    status: ok ? 200 : 500,
    arrayBuffer: vi.fn().mockResolvedValue(fakeBuffer),
  };
  const fetchMock = vi.fn().mockResolvedValue(res);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('DocumentViewerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookState.viewerReady = false;
    hookState.docLoaded = null;
    hookState.mfeUrl = 'https://viewer.example/';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the "Connecting..." tag and fetches the sample PDF on mount', async () => {
    const fetchMock = stubFetch(true);

    render(<DocumentViewerPage />);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText('Connecting...').length).toBeGreaterThan(0);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading sample PDF...')).not.toBeInTheDocument();
    });
  });

  it('renders every extracted field with its label, value, page and confidence', async () => {
    stubFetch(true);

    render(<DocumentViewerPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading sample PDF...')).not.toBeInTheDocument();
    });

    expect(
      screen.getByText(`Fields with Coordinates (${EXTRACTED_FIELDS.length})`)
    ).toBeInTheDocument();

    const issuer = EXTRACTED_FIELDS.find((f) => f.id === 'issuer')!;
    expect(screen.getByText(fieldLabel('issuer'))).toBeInTheDocument();
    expect(screen.getByText(issuer.value)).toBeInTheDocument();
  });

  it('disables "Load Document" until the viewer is ready AND the PDF is loaded', async () => {
    stubFetch(true);

    render(<DocumentViewerPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading sample PDF...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Load Document').closest('button')).toBeDisabled();
  });

  it('calls loadDocument with the fetched buffer when "Load Document" is clicked (viewer ready)', async () => {
    hookState.viewerReady = true;
    stubFetch(true);

    render(<DocumentViewerPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading sample PDF...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Load Document').closest('button')!);

    expect(mockLoadDocument).toHaveBeenCalledWith(
      fakeBuffer,
      SAMPLE_PDF_FILENAME,
      EXTRACTED_FIELDS,
      undefined,
      DOCUMENT_CATEGORIES
    );
  });

  it('calls highlightField with the clicked field id when a field row is clicked', async () => {
    hookState.viewerReady = true;
    stubFetch(true);

    render(<DocumentViewerPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading sample PDF...')).not.toBeInTheDocument();
    });

    const issuer = EXTRACTED_FIELDS.find((f) => f.id === 'issuer')!;
    fireEvent.click(screen.getByText(issuer.value));

    expect(mockHighlightField).toHaveBeenCalledWith(
      fakeBuffer,
      SAMPLE_PDF_FILENAME,
      EXTRACTED_FIELDS,
      'issuer',
      undefined,
      DOCUMENT_CATEGORIES
    );
  });

  it('calls refreshViewer when "Refresh Viewer" is clicked', async () => {
    stubFetch(true);

    render(<DocumentViewerPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading sample PDF...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Refresh Viewer').closest('button')!);

    expect(mockRefreshViewer).toHaveBeenCalledTimes(1);
  });

  it('shows the "Viewer Ready"/"Connected" tags and the docLoaded alert when the hook reports ready', async () => {
    hookState.viewerReady = true;
    hookState.docLoaded = { fileName: 'demo.pdf', pageCount: 3 };

    stubFetch(true);

    render(<DocumentViewerPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading sample PDF...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Viewer Ready')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText(/Loaded: demo\.pdf \(3 pages\)/)).toBeInTheDocument();
  });

  it('surfaces a PDF fetch error in a danger alert and does NOT set a buffer', async () => {
    stubFetch(false);
    hookState.viewerReady = true;

    render(<DocumentViewerPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch PDF: 500/)).toBeInTheDocument();
    });

    expect(screen.getByText('Load Document').closest('button')).toBeDisabled();

    const issuer = EXTRACTED_FIELDS.find((f) => f.id === 'issuer')!;
    fireEvent.click(screen.getByText(issuer.value));

    expect(mockHighlightField).not.toHaveBeenCalled();
  });

  it('renders the iframe with the hook-provided mfeUrl', async () => {
    hookState.mfeUrl = 'https://viewer.example/mfe';
    stubFetch(true);

    const { container } = render(<DocumentViewerPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading sample PDF...')).not.toBeInTheDocument();
    });

    const iframe = container.querySelector('iframe')!;
    expect(iframe).toHaveAttribute('src', 'https://viewer.example/mfe');
    expect(iframe).toHaveAttribute('title', 'Document Viewer');
  });
});