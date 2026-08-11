// cmd to run tests locally

npx vitest run --coverage



// document.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import client, { get, post, del } from './client';
import {
  getDocuments,
  recordDocument,
  uploadDocument,
  downloadDocument,
  deleteDocument,
  updateDocument,
  getDocumentPreviewBlob,
} from './documents';

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
  get: vi.fn(),
  post: vi.fn(),
  del: vi.fn(),
}));

describe('documents API', () => {
  const createObjectURLMock = vi.fn();
  const revokeObjectURLMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    createObjectURLMock.mockReturnValue('blob:preview-url');
    revokeObjectURLMock.mockImplementation(() => {});

    vi.stubGlobal('URL', {
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getDocuments', () => {
    it('fetches documents for a given instructionId', async () => {
      const mockDocs = [{ id: 1, fileName: 'test.pdf' }];
      vi.mocked(get).mockResolvedValueOnce(mockDocs);

      const result = await getDocuments(101);

      expect(get).toHaveBeenCalledWith('/instructions/101/documents');
      expect(result).toEqual(mockDocs);
    });
  });

  describe('recordDocument', () => {
    it('records document with minimum required parameters', async () => {
      const mockDoc = { id: 1, fileName: 'doc.pdf' };
      vi.mocked(post).mockResolvedValueOnce(mockDoc);

      const result = await recordDocument(101, {
        fileName: 'doc.pdf',
        documentType: 'TAX_FORM',
      });

      expect(post).toHaveBeenCalledWith(
        '/instructions/101/documents?fileName=doc.pdf&documentType=TAX_FORM',
      );
      expect(result).toEqual(mockDoc);
    });

    it('records document with all optional parameters provided', async () => {
      const mockDoc = { id: 2, fileName: 'doc2.pdf' };
      vi.mocked(post).mockResolvedValueOnce(mockDoc);

      const result = await recordDocument(101, {
        fileName: 'doc2.pdf',
        documentType: 'INVOICE',
        dmcDocumentId: 'DMC-888',
        fileSize: 1024,
        contentType: 'application/pdf',
      });

      expect(post).toHaveBeenCalledWith(
        '/instructions/101/documents?fileName=doc2.pdf&documentType=INVOICE&dmcDocumentId=DMC-888&fileSize=1024&contentType=application%2Fpdf',
      );
      expect(result).toEqual(mockDoc);
    });
  });

  describe('uploadDocument', () => {
    it('uploads file with specified documentType and full metadata', async () => {
      const mockResponse = { data: { id: 1, fileName: 'upload.pdf' } };
      vi.mocked(client.post).mockResolvedValueOnce(mockResponse);

      const mockFile = new File(['file contents'], 'upload.pdf', { type: 'application/pdf' });

      const result = await uploadDocument(101, mockFile, 'PASSPORT', {
        classification: 'CONFIDENTIAL',
        documentRegion: 'US-EAST',
        documentDate: '2026-08-11',
        retentionCode: 'RET-7YR',
      });

      expect(client.post).toHaveBeenCalledWith(
        '/instructions/101/documents/upload',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      const formDataSent = vi.mocked(client.post).mock.calls[0][1] as FormData;
      expect(formDataSent.get('file')).toEqual(mockFile);
      expect(formDataSent.get('documentType')).toBe('PASSPORT');
      expect(formDataSent.get('classification')).toBe('CONFIDENTIAL');
      expect(formDataSent.get('documentRegion')).toBe('US-EAST');
      expect(formDataSent.get('documentDate')).toBe('2026-08-11');
      expect(formDataSent.get('retentionCode')).toBe('RET-7YR');
      expect(result).toEqual(mockResponse.data);
    });

    it('uses fallback documentType "OTHER" when documentType is empty and metadata is omitted', async () => {
      const mockResponse = { data: { id: 2, fileName: 'fallback.txt' } };
      vi.mocked(client.post).mockResolvedValueOnce(mockResponse);

      const mockFile = new File(['data'], 'fallback.txt', { type: 'text/plain' });

      const result = await uploadDocument(101, mockFile, '');

      const formDataSent = vi.mocked(client.post).mock.calls[0][1] as FormData;
      expect(formDataSent.get('documentType')).toBe('OTHER');
      expect(formDataSent.get('classification')).toBeNull();
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('downloadDocument', () => {
    it('triggers a browser file download via temporary anchor element', async () => {
      const mockBlob = new Blob(['binary file data'], { type: 'application/pdf' });
      vi.mocked(client.get).mockResolvedValueOnce({ data: mockBlob });

      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeSpy = vi.spyOn(HTMLAnchorElement.prototype, 'remove');

      await downloadDocument(101, 202, 'Report.pdf');

      expect(client.get).toHaveBeenCalledWith(
        '/instructions/101/documents/202/download',
        { responseType: 'blob' },
      );
      expect(createObjectURLMock).toHaveBeenCalledWith(expect.any(Blob));
      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:preview-url');

      clickSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });

  describe('deleteDocument', () => {
    it('sends delete request for specified instructionId and documentId', async () => {
      vi.mocked(del).mockResolvedValueOnce(undefined);

      await deleteDocument(101, 202);

      expect(del).toHaveBeenCalledWith('/instructions/101/documents/202/delete');
    });
  });

  describe('updateDocument', () => {
    it('updates document metadata with query parameters', async () => {
      const mockUpdatedDoc = { id: 202, fileName: 'updated.pdf' };
      vi.mocked(post).mockResolvedValueOnce(mockUpdatedDoc);

      const result = await updateDocument(101, 202, {
        documentType: 'CONTRACT',
        fileName: 'updated.pdf',
        classification: 'RESTRICTED',
        documentRegion: 'EU-WEST',
        documentDate: '2026-01-01',
        retentionCode: 'RET-3YR',
      });

      expect(post).toHaveBeenCalledWith(
        '/instructions/101/documents/202/update?documentType=CONTRACT&fileName=updated.pdf&classification=RESTRICTED&documentRegion=EU-WEST&documentDate=2026-01-01&retentionCode=RET-3YR',
      );
      expect(result).toEqual(mockUpdatedDoc);
    });

    it('sends empty query string when no fields are passed', async () => {
      const mockUpdatedDoc = { id: 202 };
      vi.mocked(post).mockResolvedValueOnce(mockUpdatedDoc);

      const result = await updateDocument(101, 202, {});

      expect(post).toHaveBeenCalledWith('/instructions/101/documents/202/update?');
      expect(result).toEqual(mockUpdatedDoc);
    });
  });

  describe('getDocumentPreviewBlob', () => {
    it('creates object URL directly when response data is an instance of Blob', async () => {
      const mockBlob = new Blob(['preview content'], { type: 'application/pdf' });
      vi.mocked(client.get).mockResolvedValueOnce({ data: mockBlob });

      const result = await getDocumentPreviewBlob(101, 202);

      expect(client.get).toHaveBeenCalledWith(
        '/instructions/101/documents/202/preview',
        { responseType: 'blob' },
      );
      expect(createObjectURLMock).toHaveBeenCalledWith(mockBlob);
      expect(result).toBe('blob:preview-url');
    });

    it('wraps non-Blob response data in a new Blob before creating object URL', async () => {
      const rawStringData = 'raw string data';
      vi.mocked(client.get).mockResolvedValueOnce({ data: rawStringData });

      const result = await getDocumentPreviewBlob(101, 202);

      expect(client.get).toHaveBeenCalledWith(
        '/instructions/101/documents/202/preview',
        { responseType: 'blob' },
      );
      expect(createObjectURLMock).toHaveBeenCalledWith(expect.any(Blob));
      expect(result).toBe('blob:preview-url');
    });
  });
});