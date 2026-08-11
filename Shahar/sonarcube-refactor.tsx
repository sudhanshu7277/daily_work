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
} from './document'; // Updated to singular './document' matching src/api/document.ts
import apiClient from './apiClient';

// --- Mocks ---

vi.mock('./apiClient', () => ({ // Fixed case sensitivity: './apiClient'
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