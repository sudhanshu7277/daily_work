// cmd to run tests locally

npx vitest run --coverage


// --- src/api/documents.test.ts

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
  const mockCreateObjectURL = vi.fn();
  const mockRevokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock global URL methods cleanly in Vitest
    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });

    mockCreateObjectURL.mockReturnValue('blob:preview-2');
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
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(result).toBe('blob:preview-2');
    });

    it('wraps non-Blob response data in a Blob before creating URL', async () => {
      const mockData = { content: 'raw non-blob response string' };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getDocumentPreviewBlob('doc-102');

      expect(apiClient.get).toHaveBeenCalledWith('/documents/doc-102/preview', {
        responseType: 'blob',
      });
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);

      // Un-wrap argument if passed as an array [Blob] or inspect constructor name directly
      const createdArg = mockCreateObjectURL.mock.calls[0][0];
      const actualBlob = Array.isArray(createdArg) ? createdArg[0] : createdArg;

      expect(actualBlob.constructor.name).toBe('Blob');
      expect(result).toBe('blob:preview-2');
    });
  });

  describe('downloadDocument', () => {
    it('triggers document download via anchor click', async () => {
      const mockBlob = new Blob(['file binary content'], { type: 'application/pdf' });
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockBlob });

      const linkClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      await downloadDocument('doc-103', 'Contract.pdf');

      expect(apiClient.get).toHaveBeenCalledWith('/documents/doc-103/download', {
        responseType: 'blob',
      });
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
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