// cmd to run tests locally

npx vitest run --coverage

// MappingDetailPage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

// Adjust import paths based on your project structure
jest.mock('../../services/mappingService', () => mockServices);
jest.mock('../../context/AuthContext', () => ({
  useAuthContext: () => ({
    userPermissions: ['ROLE_MAINTENANCE_SET_UP'], // enables canEdit
  }),
}));

// Mock UI library components if custom/external
jest.mock('@lmn/components', () => ({
  Button: ({ children, onClick, title, 'aria-label': ariaLabel, disabled }: any) => (
    <button onClick={onClick} title={title} aria-label={ariaLabel} disabled={disabled}>
      {children}
    </button>
  ),
  Input: ({ value, onChange, placeholder, disabled }: any) => (
    <input
      placeholder={placeholder}
      value={value ?? ''}
      disabled={disabled}
      onChange={onChange}
      data-testid="lmn-input"
    />
  ),
  TextArea: ({ value, onChange, placeholder }: any) => (
    <textarea
      placeholder={placeholder}
      value={value ?? ''}
      onChange={onChange}
      data-testid="lmn-textarea"
    />
  ),
  Modal: ({ visible, onCancel, onApply, title, children }: any) =>
    visible ? (
      <div data-testid="lmn-modal">
        <h2>{title}</h2>
        {children}
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onApply}>Apply</button>
      </div>
    ) : null,
  Dropdown: Object.assign(
    ({ value, onChange, children, disabled }: any) => (
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        data-testid="lmn-dropdown"
      >
        {children}
      </select>
    ),
    {
      Item: ({ value, children }: any) => <option value={value}>{children}</option>,
    }
  ),
  SearchableDropdown: ({ value, onChange, options, disabled, placeholder }: any) => (
    <select
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      data-testid={`searchable-dropdown-${placeholder}`}
    >
      <option value="">{placeholder}</option>
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  Alert: ({ children, type }: any) => <div data-testid={`alert-${type}`}>{children}</div>,
  Loading: ({ tip }: any) => <div>{tip}</div>,
  Icon: ({ type }: any) => <i className={`icon-${type}`} />,
  notification: mockNotification,
}));

// Mock AG Grid to expose row data & custom cell renderers for test assertions
jest.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData, columnDefs }: any) => (
    <div data-testid="ag-grid">
      <div data-testid="grid-row-count">{rowData?.length ?? 0}</div>
      {rowData?.map((row: any, rowIndex: number) => (
        <div key={row.key ?? rowIndex} data-testid={`grid-row-${rowIndex}`}>
          {columnDefs?.map((col: any, colIndex: number) => {
            if (col.cellRenderer) {
              const Renderer = col.cellRenderer;
              return (
                <div key={colIndex} data-testid={`cell-${col.field ?? col.headerName}-${rowIndex}`}>
                  {typeof Renderer === 'function' ? (
                    <Renderer data={row} value={row[col.field]} />
                  ) : null}
                </div>
              );
            }
            return (
              <div key={colIndex} data-testid={`cell-${col.field}-${rowIndex}`}>
                {String(row[col.field] ?? '')}
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

  // --- 1. Initial Load & Grid Render Tests ---

  test('fetches and renders mapping list in AG Grid on mount', async () => {
    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(mockServices.getAllDocumentMappings).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    expect(screen.getByText('Document and Client Mapping')).toBeInTheDocument();
  });

  test('displays danger alert if fetching mappings fails', async () => {
    mockServices.getAllDocumentMappings.mockRejectedValueOnce(new Error('Network Error'));

    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-danger')).toBeInTheDocument();
    });
  });

  // --- 2. Search / Filtering Tests ---

  test('filters grid rowData based on search input string', async () => {
    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    const searchInput = screen.getByPlaceholderText('Search keyword / client / deal...');
    fireEvent.change(searchInput, { target: { value: 'INVOICE' } });

    expect(screen.getByTestId('grid-row-count')).toHaveTextContent('1');
  });

  // --- 3. Cell Renderers Tests ---

  test('renders custom cell contents (Country, Client, Deal, Users, Active status)', async () => {
    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    // Country cell renderer
    expect(screen.getByTestId('cell-dealCountry-0')).toHaveTextContent('US');

    // Client & GFCID renderer
    expect(screen.getByTestId('cell-clientGFCID-0')).toHaveTextContent('Acme Corp');

    // Active status renderer (check-circle icon for true, close-circle for false)
    expect(screen.getByTestId('cell-isActiveDisplay-0').querySelector('.icon-check-circle')).toBeInTheDocument();
    expect(screen.getByTestId('cell-isActiveDisplay-1').querySelector('.icon-close-circle')).toBeInTheDocument();
  });

  // --- 4. Add Mapping Modal & Form Flow ---

  test('opens Add Mapping modal, validates mandatory fields, and submits successfully', async () => {
    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    // Open Add Modal
    const addButton = screen.getByText('Add Mapping Details');
    fireEvent.click(addButton);

    expect(screen.getByTestId('lmn-modal')).toBeInTheDocument();

    // Trigger validation error on empty apply
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    expect(mockNotification.danger).toHaveBeenCalledWith('Please fill all mandatory fields');

    // Fill form fields
    const inputs = screen.getAllByTestId('lmn-input');
    const docKeywordInput = inputs[1]; // First input is search, second is keyword
    fireEvent.change(docKeywordInput, { target: { value: 'PURCHASE_ORDER' } });

    // Select Country
    const countryDropdown = screen.getByTestId('lmn-dropdown');
    fireEvent.change(countryDropdown, { target: { value: 'US' } });

    await waitFor(() => {
      expect(mockServices.getClientListByCountry).toHaveBeenCalledWith('US');
    });

    // Select Client
    const clientDropdown = screen.getByTestId('searchable-dropdown-Select client');
    fireEvent.change(clientDropdown, { target: { value: '1' } });

    await waitFor(() => {
      expect(mockServices.getAllDealList).toHaveBeenCalledWith('1');
    });

    // Select Deal
    const dealDropdown = screen.getByTestId('searchable-dropdown-Select deal');
    fireEvent.change(dealDropdown, { target: { value: '10' } });

    // Fill Comments
    const commentInput = screen.getByTestId('lmn-textarea');
    fireEvent.change(commentInput, { target: { value: 'New mapping note' } });

    // Select Activation Radio Button
    const deactivateRadio = screen.getByLabelText('De-Activate');
    fireEvent.click(deactivateRadio);

    // Submit Add Form
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockServices.createDocumentMapping).toHaveBeenCalled();
      expect(mockNotification.success).toHaveBeenCalledWith('Document mapping created successfully');
    });
  });

  test('closes Add Mapping modal on cancel click', async () => {
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

  test('opens Edit Mapping modal via actions cell button, updates fields, and saves', async () => {
    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    // Click Edit button inside grid cell renderer
    const editBtn = screen.getAllByTitle('Edit')[0];
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByText('Edit Mapping Details')).toBeInTheDocument();
    });

    // Edit comments
    const commentTextArea = screen.getByTestId('lmn-textarea');
    fireEvent.change(commentTextArea, { target: { value: 'Updated comment text' } });

    // Click Save Changes
    const saveButton = screen.getByText('Apply');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockServices.updateDocumentMapping).toHaveBeenCalled();
      expect(mockNotification.success).toHaveBeenCalledWith('Document mapping updated successfully');
    });
  });

  test('resets client and deal fields when changing country in Edit Form', async () => {
    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    const editBtn = screen.getAllByTitle('Edit')[0];
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByText('Edit Mapping Details')).toBeInTheDocument();
    });

    const countryDropdown = screen.getByTestId('lmn-dropdown');
    fireEvent.change(countryDropdown, { target: { value: 'CA' } });

    await waitFor(() => {
      expect(mockServices.getClientListByCountry).toHaveBeenCalledWith('CA');
    });
  });

  // --- 6. Refresh Action ---

  test('reloads mappings when refresh button is clicked', async () => {
    render(<MappingDetailPage />);

    await waitFor(() => {
      expect(mockServices.getAllDocumentMappings).toHaveBeenCalledTimes(1);
    });

    const refreshButton = screen.getByTitle('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockServices.getAllDocumentMappings).toHaveBeenCalledTimes(2);
    });
  });
});