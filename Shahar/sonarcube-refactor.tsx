// cmd to run tests locally

npx vitest run --coverage




// document.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getDocumentPreviewBlob,
  downloadDocument,
  uploadDocument,
  deleteDocument,
  getDocumentList,
} from './documents';
import apiClient from './apiClient';

// --- Mocks ---

vi.mock('./apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('documents API', () => {
  const createObjectURLMock = vi.fn();
  const revokeObjectURLMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    createObjectURLMock.mockReturnValue('blob:preview-2');

    // Safely stub global URL methods for Vitest
    vi.stubGlobal('URL', {
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getDocumentList', () => {
    it('fetches list of documents successfully', async () => {
      const mockDocs = [{ id: '1', name: 'Invoice.pdf' }];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockDocs });

      const result = await getDocumentList('DEAL-123');

      expect(apiClient.get).toHaveBeenCalledWith('/documents', {
        params: { dealKey: 'DEAL-123' },
      });
      expect(result).toEqual(mockDocs);
    });
  });

  describe('getDocumentPreviewBlob', () => {
    it('returns object URL directly when response is already a Blob', async () => {
      const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockBlob });

      const result = await getDocumentPreviewBlob('doc-101');

      expect(apiClient.get).toHaveBeenCalledWith('/documents/doc-101/preview', {
        responseType: 'blob',
      });
      expect(createObjectURLMock).toHaveBeenCalledWith(mockBlob);
      expect(result).toBe('blob:preview-2');
    });

    it('wraps non-Blob response data in a Blob before creating preview URL', async () => {
      const mockNonBlobData = { content: 'sample-document-text' };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockNonBlobData });

      const result = await getDocumentPreviewBlob('doc-102');

      expect(apiClient.get).toHaveBeenCalledWith('/documents/doc-102/preview', {
        responseType: 'blob',
      });
      expect(createObjectURLMock).toHaveBeenCalledTimes(1);

      // Extract raw argument passed to createObjectURL and unwrap if array-wrapped
      const rawArg = createObjectURLMock.mock.calls[0][0];
      const targetBlob = Array.isArray(rawArg) ? rawArg[0] : rawArg;

      // Verify Blob constructor name safely across Vitest/JSDOM realm boundaries
      expect(targetBlob?.constructor?.name).toBe('Blob');
      expect(result).toBe('blob:preview-2');
    });
  });

  describe('downloadDocument', () => {
    it('triggers document download via anchor element click', async () => {
      const mockBlob = new Blob(['file binary content'], { type: 'application/pdf' });
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockBlob });

      const linkClickSpy = vi
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => {});

      await downloadDocument('doc-103', 'Contract.pdf');

      expect(apiClient.get).toHaveBeenCalledWith('/documents/doc-103/download', {
        responseType: 'blob',
      });
      expect(createObjectURLMock).toHaveBeenCalledWith(mockBlob);
      expect(linkClickSpy).toHaveBeenCalled();

      linkClickSpy.mockRestore();
    });
  });

  describe('uploadDocument', () => {
    it('sends FormData to upload document', async () => {
      const mockFile = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true } });

      const result = await uploadDocument(mockFile, 'DEAL-999');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/documents/upload',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('deleteDocument', () => {
    it('deletes document by ID', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { status: 200 } });

      const result = await deleteDocument('doc-104');

      expect(apiClient.delete).toHaveBeenCalledWith('/documents/doc-104');
      expect(result).toEqual({ status: 200 });
    });
  });
});


// TicklerTaskPage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import TicklerTaskPage from './TicklerTaskPage';

// --- Hoisted Mock Declarations ---
// Using vi.hoisted ensures these variables are initialized BEFORE vi.mock factory functions execute.

const {
  mockNotification,
  mockGetRefDataByType,
  mockGetTicklerTasks,
  mockCreateTicklerTask,
  mockUpdateTicklerTask,
  mockNavigate,
} = vi.hoisted(() => ({
  mockNotification: {
    success: vi.fn(),
    danger: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  mockGetRefDataByType: vi.fn(),
  mockGetTicklerTasks: vi.fn(),
  mockCreateTicklerTask: vi.fn(),
  mockUpdateTicklerTask: vi.fn(),
  mockNavigate: vi.fn(),
}));

// --- Mocks ---

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../api/refdata', () => ({
  getRefDataByType: (...a: unknown[]) => mockGetRefDataByType(...a),
}));

vi.mock('../../services/ticklerService', () => ({
  getTicklerTasks: (...a: unknown[]) => mockGetTicklerTasks(...a),
  createTicklerTask: (...a: unknown[]) => mockCreateTicklerTask(...a),
  updateTicklerTask: (...a: unknown[]) => mockUpdateTicklerTask(...a),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuthContext: () => ({
    userPermissions: ['ROLE_TICKLER_MAINTENANCE'],
  }),
}));

// Mock custom UI component library
vi.mock('@citi-icg-1728/components', () => ({
  El: ({ children, className, style, ...props }: any) => (
    <div className={className} style={style} {...props}>
      {children}
    </div>
  ),
  Button: ({ children, onClick, title, disabled, 'aria-label': ariaLabel }: any) => (
    <button onClick={onClick} title={title} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  ),
  Input: ({ value, onChange, placeholder, disabled, style }: any) => (
    <input
      placeholder={placeholder}
      value={value ?? ''}
      disabled={disabled}
      style={style}
      onChange={onChange}
      data-testid={`lmn-input-${placeholder || 'default'}`}
    />
  ),
  TextArea: ({ value, onChange, placeholder, style }: any) => (
    <textarea
      placeholder={placeholder}
      value={value ?? ''}
      style={style}
      onChange={onChange}
      data-testid="lmn-textarea"
    />
  ),
  Modal: ({ visible, onCancel, onApply, title, children, applyText, cancelText }: any) =>
    visible ? (
      <div data-testid="lmn-modal">
        <h2>{title}</h2>
        {children}
        <button onClick={onCancel}>{cancelText || 'Cancel'}</button>
        <button onClick={onApply}>{applyText || 'Apply'}</button>
      </div>
    ) : null,
  Dropdown: Object.assign(
    ({ value, onChange, children, disabled, placeholder, style }: any) => (
      <select
        value={value ?? ''}
        disabled={disabled}
        style={style}
        onChange={(e) => onChange(e.target.value)}
        data-testid="lmn-dropdown"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
    ),
    {
      Item: ({ value, children }: any) => <option value={value}>{children}</option>,
    }
  ),
  Alert: ({ children, type }: any) => <div data-testid={`alert-${type}`}>{children}</div>,
  Loading: ({ tip }: any) => <div>{tip}</div>,
  Icon: ({ type, className }: any) => <i className={`icon-${type} ${className || ''}`} />,
  notification: mockNotification,
}));

// Mock AG Grid component
vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData, columnDefs }: any) => (
    <div data-testid="ag-grid">
      <div data-testid="grid-row-count">{rowData?.length ?? 0}</div>
      {rowData?.map((row: any, rowIndex: number) => (
        <div key={row.taskId || rowIndex} data-testid={`grid-row-${rowIndex}`}>
          {columnDefs?.map((col: any, colIndex: number) => {
            const cellParams = {
              data: row,
              value: row[col.field],
              node: { data: row },
            };
            return (
              <div key={colIndex} data-testid={`cell-${col.field || col.headerName || colIndex}-${rowIndex}`}>
                {col.cellRenderer ? col.cellRenderer(cellParams) : String(row[col.field] ?? '')}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  ),
}));

// --- Test Data Fixtures ---

const mockTasks = [
  {
    taskId: 'TASK-101',
    taskName: 'Review Credit Line',
    category: 'CREDIT',
    status: 'OPEN',
    dueDate: '2026-09-01',
    assignedTo: 'John Doe',
    description: 'Annual credit assessment',
  },
  {
    taskId: 'TASK-102',
    taskName: 'Verify Compliance Docs',
    category: 'LEGAL',
    status: 'COMPLETED',
    dueDate: '2026-08-15',
    assignedTo: 'Jane Smith',
    description: 'Check KYC documentation',
  },
];

const mockCategories = [
  { key: 'CREDIT', value: 'Credit Review' },
  { key: 'LEGAL', value: 'Legal Documentation' },
];

describe('TicklerTaskPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTicklerTasks.mockResolvedValue(mockTasks);
    mockGetRefDataByType.mockResolvedValue(mockCategories);
    mockCreateTicklerTask.mockResolvedValue({ status: 200 });
    mockUpdateTicklerTask.mockResolvedValue({ status: 200 });
  });

  it('fetches tickler tasks and reference data on mount', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(mockGetTicklerTasks).toHaveBeenCalledTimes(1);
      expect(mockGetRefDataByType).toHaveBeenCalledWith('TICKLER_CATEGORY');
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });
  });

  it('displays danger alert if fetching tickler tasks fails', async () => {
    mockGetTicklerTasks.mockRejectedValueOnce(new Error('Network error'));

    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-danger')).toBeInTheDocument();
    });
  });

  it('filters task list based on search keyword input', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    const searchInput = screen.getByPlaceholderText('Search task / category / assigned...');
    fireEvent.change(searchInput, { target: { value: 'Credit' } });

    expect(screen.getByTestId('grid-row-count')).toHaveTextContent('1');
  });

  it('opens Create Task modal and submits new task details', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    fireEvent.click(screen.getByText('Add Task'));
    expect(screen.getByTestId('lmn-modal')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('Enter task name');
    fireEvent.change(nameInput, { target: { value: 'New Financial Audit' } });

    const categorySelect = screen.getByTestId('lmn-dropdown');
    fireEvent.change(categorySelect, { target: { value: 'CREDIT' } });

    const descArea = screen.getByTestId('lmn-textarea');
    fireEvent.change(descArea, { target: { value: 'Quarterly review notes' } });

    fireEvent.click(screen.getByText('Apply'));

    await waitFor(() => {
      expect(mockCreateTicklerTask).toHaveBeenCalled();
      expect(mockNotification.success).toHaveBeenCalledWith('Tickler task created successfully');
    });
  });

  it('opens Edit Task modal via cell renderer action and updates task', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    const editButtons = screen.getAllByTitle('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('lmn-modal')).toBeInTheDocument();
    });

    const descArea = screen.getByTestId('lmn-textarea');
    fireEvent.change(descArea, { target: { value: 'Updated task description' } });

    fireEvent.click(screen.getByText('Apply'));

    await waitFor(() => {
      expect(mockUpdateTicklerTask).toHaveBeenCalled();
      expect(mockNotification.success).toHaveBeenCalledWith('Tickler task updated successfully');
    });
  });

  it('reloads task list when Refresh button is clicked', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(mockGetTicklerTasks).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByTitle('Refresh'));

    await waitFor(() => {
      expect(mockGetTicklerTasks).toHaveBeenCalledTimes(2);
    });
  });
});