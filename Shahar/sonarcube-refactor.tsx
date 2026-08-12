// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit


// @vitest-environment jsdom

// src/components/documentViewer/NativePdfViewer.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import type { CapturedField } from '../../types/documentViewer';

// ---- Mock Canvas 2D context for jsdom environment ----
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => []),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 0 }),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  }) as any;
}

// --- Mock pdfjs-dist: the module touches GlobalWorkerOptions at import time
//     and calls getDocument(pdfUrl).promise in a useEffect. ---
const mockGetPage = vi.fn();
const mockDestroy = vi.fn();
let getDocumentImpl: (url: string) => { promise: Promise<any>; destroy?: () => void };
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: (url: string) => getDocumentImpl(url),
}));

// --- Mock the design-system components ---
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style }: any) =>
      R.createElement('div', { className, style }, children),
    Button: ({ children, onClick, disabled }: any) =>
      R.createElement('button', { onClick, disabled }, children),
    Icon: ({ type }: any) =>
      R.createElement('span', { 'data-testid': 'icon', 'data-icon-type': type }),
    Tag: ({ children, color }: any) =>
      R.createElement('span', { 'data-testid': 'tag', 'data-color': color }, children),
  };
});

import NativePdfViewer from './NativePdfViewer';

const FIELDS: CapturedField[] = [
  { id: 'f1', value: 'A', page: 1, color: '#00aa00', x: 10, y: 20, width: 30, height: 40 },
];

/** Build a fake PDFDocumentProxy that resolves getDocument().promise. */
function makePdfDoc(numPages: number) {
  return {
    numPages,
    destroy: mockDestroy,
    getPage: mockGetPage,
  };
}

describe('NativePdfViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // default: getPage returns a page whose render succeeds
    mockGetPage.mockResolvedValue({
      getViewport: () => ({ width: 100, height: 200 }),
      render: () => ({ promise: Promise.resolve(), cancel: vi.fn() }),
    });

    // default happy path: a 2-page doc
    getDocumentImpl = () => ({ promise: Promise.resolve(makePdfDoc(2)) });
  });

  it('shows the loading state before the PDF resolves', () => {
    // never-resolving promise keeps loading=true
    getDocumentImpl = () => ({ promise: new Promise(() => {}) });
    render(<NativePdfViewer pdfUrl="/sample.pdf" fields={[]} activeFieldId={null} />);
    expect(screen.getByText('Loading PDF...')).toBeTruthy();
  });

  it('renders the toolbar with page count once the PDF loads', async () => {
    render(<NativePdfViewer pdfUrl="/sample.pdf" fields={FIELDS} activeFieldId={null} />);
    await waitFor(() => {
      expect(screen.getByText('Page 1 / 2')).toBeTruthy();
    });

    // default zoom is 150%
    expect(screen.getByText('150%')).toBeTruthy();
  });

  it('renders an error state when getDocument rejects', async () => {
    getDocumentImpl = () => ({ promise: Promise.reject(new Error('boom')) });
    render(<NativePdfViewer pdfUrl="/bad.pdf" fields={[]} activeFieldId={null} />);
    await waitFor(() => {
      expect(screen.getByText('boom')).toBeTruthy();
    });
  });

  it('disables the previous-page button on the first page', async () => {
    render(<NativePdfViewer pdfUrl="/sample.pdf" fields={[]} activeFieldId={null} />);
    await waitFor(() => expect(screen.getByText('Page 1 / 2')).toBeTruthy());
    const buttons = screen.getAllByRole('button');
    // buttons: [prev, next, zoom-out, zoom-in]
    expect((buttons[0] as HTMLButtonElement).disabled).toBe(true); // prev at page 1
    expect((buttons[1] as HTMLButtonElement).disabled).toBe(false); // next enabled (2 pages)
  });

  it('increments the zoom percentage when zoom-in is clicked', async () => {
    render(<NativePdfViewer pdfUrl="/sample.pdf" fields={[]} activeFieldId={null} />);
    await waitFor(() => expect(screen.getByText('150%')).toBeTruthy());
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[3]); // zoom-in
    await waitFor(() => expect(screen.getByText('175%')).toBeTruthy()); // +25% step
  });

  it('decrements the zoom percentage when zoom-out is clicked', async () => {
    render(<NativePdfViewer pdfUrl="/sample.pdf" fields={[]} activeFieldId={null} />);
    await waitFor(() => expect(screen.getByText('150%')).toBeTruthy());
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[2]); // zoom-out
    await waitFor(() => expect(screen.getByText('125%')).toBeTruthy());
  });

  it('destroys the PDF document on unmount', async () => {
    const { unmount } = render(<NativePdfViewer pdfUrl="/sample.pdf" fields={[]} activeFieldId={null} />);
    await waitFor(() => expect(screen.getByText('Page 1 / 2')).toBeTruthy());
    unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });
});