// cmd to run tests locally

npx vitest run --coverage


// Updated File: src/utils/exportExcel.test.ts

// src/utils/exportExcel.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the entire xlsx module so no real file I/O happens.
const mockJsonToSheet = vi.fn(() => ({ __sheet: true }));
const mockBookNew = vi.fn(() => ({ __wb: true }));
const mockBookAppendSheet = vi.fn();
const mockWriteFile = vi.fn();

vi.mock('xlsx', () => {
  const utils = {
    json_to_sheet: (...a: unknown[]) => mockJsonToSheet(...a),
    book_new: (...a: unknown[]) => mockBookNew(...a),
    book_append_sheet: (...a: unknown[]) => mockBookAppendSheet(...a),
  };
  const writeFile = (...a: unknown[]) => mockWriteFile(...a);

  return {
    __esModule: true,
    default: { utils, writeFile },
    utils,
    writeFile,
  };
});

import { exportToExcel } from './exportExcel';

describe('exportToExcel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('remaps rows using column titles as keys and dataIndex as source', () => {
    const data = [
      { id: 1, name: 'Alice', country: 'US' },
      { id: 2, name: 'Bob', country: 'UK' },
    ];
    const columns = [
      { title: 'Name', dataIndex: 'name' },
      { title: 'Country', dataIndex: 'country' },
    ];

    exportToExcel(data, columns, 'clients');

    expect(mockJsonToSheet).toHaveBeenCalledTimes(1);
    expect(mockJsonToSheet).toHaveBeenCalledWith([
      { Name: 'Alice', Country: 'US' },
      { Name: 'Bob', Country: 'UK' },
    ]);
  });

  it('substitutes an empty string for null/undefined/missing values', () => {
    const data = [
      { name: 'Alice', country: null },
      { name: undefined },
    ];
    const columns = [
      { title: 'Name', dataIndex: 'name' },
      { title: 'Country', dataIndex: 'country' },
    ];

    exportToExcel(data, columns, 'clients');

    expect(mockJsonToSheet).toHaveBeenCalledWith([
      { Name: 'Alice', Country: '' },
      { Name: '', Country: '' },
    ]);
  });

  it('keeps falsy-but-defined values like 0 and empty string (only ?? applies)', () => {
    const data = [{ amount: 0, note: '' }];
    const columns = [
      { title: 'Amount', dataIndex: 'amount' },
      { title: 'Note', dataIndex: 'note' },
    ];

    exportToExcel(data, columns, 'amounts');

    // 0 and '' are not null/undefined, so ?? does not replace them.
    expect(mockJsonToSheet).toHaveBeenCalledWith([{ Amount: 0, Note: '' }]);
  });

  it('creates a workbook, appends the sheet under the name "Data", and writes the file', () => {
    exportToExcel([{ name: 'Alice' }], [{ title: 'Name', dataIndex: 'name' }], 'report');

    expect(mockBookNew).toHaveBeenCalledTimes(1);
    expect(mockBookAppendSheet).toHaveBeenCalledTimes(1);
    expect(mockBookAppendSheet).toHaveBeenCalledWith(
      { __wb: true },
      { __sheet: true },
      'Data'
    );
  });

  it('appends ".xlsx" to the provided file name', () => {
    exportToExcel([{ name: 'Alice' }], [{ title: 'Name', dataIndex: 'name' }], 'my-report');

    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    expect(mockWriteFile).toHaveBeenCalledWith({ __wb: true }, 'my-report.xlsx');
  });

  it('produces an empty rows array when data is empty', () => {
    exportToExcel([], [{ title: 'Name', dataIndex: 'name' }], 'empty');

    expect(mockJsonToSheet).toHaveBeenCalledWith([]);
    expect(mockWriteFile).toHaveBeenCalledWith({ __wb: true }, 'empty.xlsx');
  });
});