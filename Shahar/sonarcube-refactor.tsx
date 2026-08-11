// cmd to run tests locally

npx vitest run --coverage

// MappingDetailPage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MappingDetailPage from './MappingDetailPage';

// --- Mocks ---

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockNotification = {
  success: jest.fn(),
  danger: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
};

const mockServices = {
  getAllDocumentMappings: jest.fn(),
  createDocumentMapping: jest.fn(),
  updateDocumentMapping: jest.fn(),
  getAllCountryList: jest.fn(),
  getClientListByCountry: jest.fn(),
  getAllDealList: jest.fn(),
  getUserDetails: jest.fn(),
};

// Adjust import paths to match your project's service/context locations
jest.mock('../../services/mappingService', () => mockServices);
jest.mock('../../context/AuthContext', () => ({
  useAuthContext: () => ({
    userPermissions: ['ROLE_MAINTENANCE_SET_UP'], // Grants canEdit permission
  }),
}));

// Mock complete @lmn/components library including custom <El /> layout container
jest.mock('@lmn/components', () => ({
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
  SearchableDropdown: ({ value, onChange, options, disabled, placeholder, label }: any) => (
    <div data-testid={`searchable-dropdown-${label || placeholder}`}>
      <label>{label}</label>
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        data-testid={`select-${label || placeholder}`}
      >
        <option value="">{placeholder}</option>
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
  Alert: ({ children, type }: any) => <div data-testid={`alert-${type}`}>{children}</div>,
  Loading: ({ tip }: any) => <div>{tip}</div>,
  Icon: ({ type, className }: any) => <i className={`icon-${type} ${className || ''}`} />,
  notification: mockNotification,
}));

// Mock AG Grid to expose row data & execute custom cell renderers
jest.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData, columnDefs }: any) => (
    <div data-testid="ag-grid">
      <div data-testid="grid-row-count">{rowData?.length ?? 0}</div>
      {rowData?.map((row: any, rowIndex: number) => (
        <div key={row.key || row.mappingId || rowIndex} data-testid={`grid-row-${rowIndex}`}>
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

const mockMappings = [
  {
    mappingId: 101,
    docKeyword: 'INVOICE',
    dealKey: 'DEAL-999',
    dealName: 'Alpha Trade',
    clientGFCID: 'GFC123',
    clientName: 'Acme Corp',
    dealCountry: 'US',
    comments: 'Standard invoice mapping',
    isActive: true,
    createdBy: 'user1',
    createdOn: '2026-01-15T10:00:00Z',
    updatedBy: 'user2',
    updatedOn: '2026-02-01T12:00:00Z',
  },
  {
    mappingId: 102,
    docKeyword: 'CONTRACT',
    dealKey: 'DEAL-888',
    dealName: 'Beta Finance',
    clientGFCID: 'GFC456',
    clientName: 'Globex Inc',
    dealCountry: 'CA',
    comments: 'Legal contract',
    isActive: false,
    createdBy: 'user3',
    createdOn: '2026-03-10T08:30:00Z',
  },
];

const mockCountries = [
  { key: 'US', value: 'United States' },
  { key: 'CA', value: 'Canada' },
];

const mockClients = [
  { clientId: '1', clientName: 'Acme Corp', clientGFCID: 'GFC123' },
  { clientId: '2', clientName: 'Globex Inc', clientGFCID: 'GFC456' },
];

const mockDeals = [
  { dealId: '10', dealShortName: 'Alpha', dealLongName: 'Alpha Trade', dealKey: 'DEAL-999' },
  { dealId: '20', dealShortName: 'Beta', dealLongName: 'Beta Finance', dealKey: 'DEAL-888' },
];

describe('MappingDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockServices.getAllDocumentMappings.mockResolvedValue(mockMappings);
    mockServices.getAllCountryList.mockResolvedValue(mockCountries);
    mockServices.getClientListByCountry.mockResolvedValue(mockClients);
    mockServices.getAllDealList.mockResolvedValue(mockDeals);
    mockServices.createDocumentMapping.mockResolvedValue({ status: 200 });
    mockServices.updateDocumentMapping.mockResolvedValue({ status: 200 });
  });

  // --- 1. Initial Render & Grid Loading ---

  test('fetches and renders document mapping list on mount', async () => {
    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(mockServices.getAllDocumentMappings).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    expect(screen.getByText('Document and Client Mapping')).toBeInTheDocument();
  });

  test('renders error alert when mapping fetch API fails', async () => {
    mockServices.getAllDocumentMappings.mockRejectedValueOnce(new Error('API Failure'));

    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-danger')).toBeInTheDocument();
    });
  });

  // --- 2. Grid Search / Filtering ---

  test('filters grid rows dynamically when typing into search input', async () => {
    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    const searchInput = screen.getByPlaceholderText('Search keyword / client / deal...');
    fireEvent.change(searchInput, { target: { value: 'INVOICE' } });

    expect(screen.getByTestId('grid-row-count')).toHaveTextContent('1');
  });

  // --- 3. Custom Cell Renderer Validation ---

  test('renders icons and metadata correctly inside custom grid cell renderers', async () => {
    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    // Check Active Status Renderers (check-circle vs close-circle icons)
    expect(screen.getByTestId('cell-isActiveDisplay-0').querySelector('.icon-check-circle')).toBeInTheDocument();
    expect(screen.getByTestId('cell-isActiveDisplay-1').querySelector('.icon-close-circle')).toBeInTheDocument();
  });

  // --- 4. Add Mapping Details Modal & Submit Flow ---

  test('opens Add Modal, triggers validation error on empty submit, and submits complete form successfully', async () => {
    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    // Open Modal
    fireEvent.click(screen.getByText('Add Mapping Details'));
    expect(screen.getByTestId('lmn-modal')).toBeInTheDocument();

    // Fill Keyword
    const keywordInput = screen.getByPlaceholderText('Enter document keyword');
    fireEvent.change(keywordInput, { target: { value: 'PURCHASE_ORDER' } });

    // Select Country -> triggers client loading
    const countrySelect = screen.getByTestId('lmn-dropdown');
    fireEvent.change(countrySelect, { target: { value: 'US' } });

    await waitFor(() => {
      expect(mockServices.getClientListByCountry).toHaveBeenCalledWith('US');
    });

    // Select Client -> triggers deal loading
    const clientSelect = screen.getByTestId('select-Client');
    fireEvent.change(clientSelect, { target: { value: '1' } });

    await waitFor(() => {
      expect(mockServices.getAllDealList).toHaveBeenCalledWith('1');
    });

    // Select Deal
    const dealSelect = screen.getByTestId('select-Deal');
    fireEvent.change(dealSelect, { target: { value: '10' } });

    // Enter Comments
    const commentArea = screen.getByTestId('lmn-textarea');
    fireEvent.change(commentArea, { target: { value: 'Test mapping note' } });

    // Select Radio option
    const deactivateRadio = screen.getByLabelText('De-Activate');
    fireEvent.click(deactivateRadio);

    // Submit Form
    fireEvent.click(screen.getByText('Add Mapping'));

    await waitFor(() => {
      expect(mockServices.createDocumentMapping).toHaveBeenCalled();
      expect(mockNotification.success).toHaveBeenCalledWith('Document mapping created successfully');
    });
  });

  test('closes Add Modal when Cancel is clicked', async () => {
    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    fireEvent.click(screen.getByText('Add Mapping Details'));
    expect(screen.getByTestId('lmn-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByTestId('lmn-modal')).not.toBeInTheDocument();
  });

  // --- 5. Edit Mapping Modal Flow ---

  test('opens Edit Modal, modifies fields, and saves updated mapping details', async () => {
    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    // Click Edit button inside grid action cell
    const editButtons = screen.getAllByTitle('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit Mapping Details')).toBeInTheDocument();
    });

    // Update comments in Edit Modal
    const commentArea = screen.getByTestId('lmn-textarea');
    fireEvent.change(commentArea, { target: { value: 'Updated comment details' } });

    // Save changes
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockServices.updateDocumentMapping).toHaveBeenCalled();
      expect(mockNotification.success).toHaveBeenCalledWith('Document mapping updated successfully');
    });
  });

  // --- 6. Refresh Button Action ---

  test('re-fetches mapping list when Refresh button is clicked', async () => {
    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(mockServices.getAllDocumentMappings).toHaveBeenCalledTimes(1);
    });

    const refreshBtn = screen.getByTitle('Refresh');
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(mockServices.getAllDocumentMappings).toHaveBeenCalledTimes(2);
    });
  });
});