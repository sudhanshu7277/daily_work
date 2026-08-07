// npx vitest run --coverage
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getUserId,
  setUserId,
  getUserRole,
  setUserRole,
  getToken,
  setToken,
  clearAuth,
  bootstrapUserId,
  login,
  getTokenExpiry,
  isTokenExpired,
} from './auth';

vi.mock('axios');

describe('auth utility functions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('User ID and Role helpers', () => {
    it('returns fallback default when localStorage is empty', () => {
      expect(getUserId()).toBe('SYSTEM');
      expect(getUserRole()).toBe('ROLE_VIEW_ONLY');
      expect(getToken()).toBeNull();
    });

    it('sets and retrieves user ID, role, and token correctly', () => {
      setUserId('AB12345');
      setUserRole('ROLE_ADMIN_MAKER');
      setToken('mock-jwt-token');

      expect(getUserId()).toBe('AB12345');
      expect(getUserRole()).toBe('ROLE_ADMIN_MAKER');
      expect(getToken()).toBe('mock-jwt-token');
    });

    it('clears all authentication items from localStorage', () => {
      setUserId('AB12345');
      setUserRole('ROLE_ADMIN_MAKER');
      setToken('mock-jwt-token');

      clearAuth();

      expect(localStorage.getItem('gab-user-id')).toBeNull();
      expect(localStorage.getItem('gab-user-role')).toBeNull();
      expect(localStorage.getItem('gab-jwt-token')).toBeNull();
    });
  });

  describe('bootstrapUserId', () => {
    it('fetches and sets user ID when API returns a valid soeid', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: { data: { soeid: 'XY98765' } },
      });

      await bootstrapUserId();

      expect(getUserId()).toBe('XY98765');
    });

    it('does not update user ID if soeid is missing in API response', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: { data: {} },
      });

      await bootstrapUserId();

      expect(getUserId()).toBe('SYSTEM');
    });

    it('handles network/API errors gracefully without throwing', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(bootstrapUserId()).resolves.not.toThrow();
      expect(getUserId()).toBe('SYSTEM');
    });
  });

  describe('login', () => {
    it('calls login API, sets local storage values, and returns user data', async () => {
      const mockAuthData = {
        token: 'sample.jwt.token',
        soeid: 'LOGIN123',
        roles: ['ROLE_PAYMENT_MAKER'],
      };

      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { data: mockAuthData },
      });

      const result = await login();

      expect(result).toEqual(mockAuthData);
      expect(getToken()).toBe('sample.jwt.token');
      expect(getUserId()).toBe('LOGIN123');
    });
  });

  describe('JWT token expiry helpers', () => {
    // Utility helper to construct a Base64-encoded JWT token
    const createMockToken = (payloadObj: object) => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify(payloadObj))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
      return `${header}.${payload}.signature`;
    };

    it('correctly extracts exp from a valid JWT token', () => {
      const mockToken = createMockToken({ exp: 1800000000 });
      expect(getTokenExpiry(mockToken)).toBe(1800000000);
    });

    it('returns 0 for invalid or unparseable JWT tokens', () => {
      expect(getTokenExpiry('invalid-token-string')).toBe(0);
      
      const noExpToken = createMockToken({ user: 'test' });
      expect(getTokenExpiry(noExpToken)).toBe(0);
    });

    it('correctly checks whether a token is expired', () => {
      const nowInSeconds = Math.floor(Date.now() / 1000);

      // 1. Missing token
      expect(isTokenExpired(null)).toBe(true);

      // 2. Unparseable token
      expect(isTokenExpired('garbage-token')).toBe(true);

      // 3. Expired token (past time)
      const expiredToken = createMockToken({ exp: nowInSeconds - 100 });
      expect(isTokenExpired(expiredToken)).toBe(true);

      // 4. Token expiring within default buffer (60s)
      const nearExpiryToken = createMockToken({ exp: nowInSeconds + 30 });
      expect(isTokenExpired(nearExpiryToken, 60_000)).toBe(true);

      // 5. Valid active token far in future
      const validToken = createMockToken({ exp: nowInSeconds + 3600 });
      expect(isTokenExpired(validToken)).toBe(false);
    });
  });
});

// npx vitest run src/utils/auth.test.ts --coverage
npx vitest run --coverage


// 1. src/utils/auth.test.ts

import { /* import your auth functions here, e.g., getUserRoles, isAuthenticated */ } from './auth';

describe('auth utilities', () => {
  test('executes auth functions correctly', () => {
    // Add tests for functions exported in src/utils/auth.ts
  });
});

// 2. Run Jest with coverage to confirm:

npm test -- --coverage --watchAll=false




Phase 1: Pure API Layer Batch (Quick Coverage Spike)
Why: API files contain pure functions calling Axios. They require zero DOM rendering, can be tested in batches using simple vi.mock('axios') patterns, and will instantly cover 1,500+ lines of code.

Target Files (0% -> 100%):

src/api/audit.ts

src/api/comments.ts

src/api/citiSftIntake.ts

src/api/documents.ts (111 lines)

src/api/roles.ts

src/api/thresholds.ts

src/api/tickler.ts

src/api/whitelist.ts

src/api/emailIntake.ts & src/api/emails.ts

Phase 2: Context & Utility Cleanup
Why: Contexts wrap large sections of the app, and utilities are straightforward logic branches with high line density.

Target Files:

src/context/AuthContext.tsx (183 lines — test login, logout, role check hooks, and provider state)

src/utils/exportExcel.ts

src/utils/arrayUtils.ts

Phase 3: Lightweight Common Components
Why: Reusable common UI elements render quickly with minimal prop mocking and cover significant UI branch logic.

Target Files:

src/components/common/Breadcrumb.tsx (45 lines)

src/components/common/PresetBar.tsx (101 lines)

src/components/common/PriorityTag.tsx (15 lines)

src/components/common/RadioGroup.tsx (27 lines)

src/components/common/StatusTag.tsx (27 lines)

src/components/common/FilterPanel.tsx (219 lines)

Phase 4: Small & Medium Leaf Pages
Why: Smaller, dedicated sub-pages have simpler logic than the main Dashboard/Instruction List pages, giving high line returns without getting bogged down in complex AG-Grid or table state mocks.

Target Files:

src/pages/auth/AccessDeniedPage.tsx (23 lines)

src/pages/intakeChannels/IntakeChannelsPage.tsx (89 lines)

src/pages/refdata/ReferenceDataPage.tsx (169 lines)

src/pages/tickler/TicklerTaskPage.tsx (250 lines)

src/pages/whitelist/WhitelistManagementPage.tsx (329 lines)

src/pages/thresholds/ThresholdManagementPage.tsx (431 lines)

Recommended Execution Path
Starting with Phase 1 (The API Layer) will immediately jump your overall statement coverage from 34% to over 55% in a single batch.





// audit.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getInstructionHistory, getFieldHistory } from './audit';
import { get } from './client';

vi.mock('./client', () => ({
  get: vi.fn(),
}));

describe('audit API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInstructionHistory', () => {
    it('calls get with the correct history endpoint', async () => {
      const mockData = [{ id: 1, action: 'CREATE' }];
      vi.mocked(get).mockResolvedValueOnce(mockData as any);

      const result = await getInstructionHistory(123);

      expect(get).toHaveBeenCalledWith('/audit/instructions/123/history');
      expect(result).toEqual(mockData);
    });
  });

  describe('getFieldHistory', () => {
    it('calls get with the correct fields endpoint', async () => {
      const mockData = [{ fieldName: 'amount', oldValue: '100', newValue: '200' }];
      vi.mocked(get).mockResolvedValueOnce(mockData as any);

      const result = await getFieldHistory(456);

      expect(get).toHaveBeenCalledWith('/audit/instructions/456/fields');
      expect(result).toEqual(mockData);
    });
  });
});
// comments.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getComments, addComment } from './comments';
import { get, post } from './client';

vi.mock('./client', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

describe('comments API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getComments', () => {
    it('calls get with the correct comments endpoint', async () => {
      const mockComments = [{ id: 1, text: 'Test comment' }];
      vi.mocked(get).mockResolvedValueOnce(mockComments as any);

      const result = await getComments(101);

      expect(get).toHaveBeenCalledWith('/instructions/101/comments');
      expect(result).toEqual(mockComments);
    });
  });

  describe('addComment', () => {
    it('calls post with the correct endpoint and payload', async () => {
      const mockPayload = { commentText: 'New comment' } as any;
      const mockResponse = { id: 2, text: 'New comment' };
      vi.mocked(post).mockResolvedValueOnce(mockResponse as any);

      const result = await addComment(101, mockPayload);

      expect(post).toHaveBeenCalledWith('/instructions/101/comments', mockPayload);
      expect(result).toEqual(mockResponse);
    });
  });
});


// citiSftIntake.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getRecentIntakes,
  getCitiSft,
  getAttachments,
  getAuditTrail,
  getAuditPage,
  getCitiSftPage,
} from './citiSftIntake';
import client from './client';

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('citiSftIntake API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getRecentIntakes calls client.get with correct path', async () => {
    const mockResponse = [{ citiSftId: 1 }];
    vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

    const result = await getRecentIntakes();

    expect(client.get).toHaveBeenCalledWith('/citisft-intake/recent');
    expect(result).toEqual(mockResponse);
  });

  it('getCitiSft calls client.get with correct path', async () => {
    const mockResponse = { citiSftId: 10 };
    vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

    const result = await getCitiSft(10);

    expect(client.get).toHaveBeenCalledWith('/citisft-intake/citisft/10');
    expect(result).toEqual(mockResponse);
  });

  it('getAttachments calls client.get with correct path', async () => {
    const mockResponse = [{ attachmentId: 100 }];
    vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

    const result = await getAttachments(10);

    expect(client.get).toHaveBeenCalledWith('/citisft-intake/citisft/10/attachments');
    expect(result).toEqual(mockResponse);
  });

  it('getAuditTrail calls client.get with correct path', async () => {
    const mockResponse = [{ auditId: 5 }];
    vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

    const result = await getAuditTrail(10);

    expect(client.get).toHaveBeenCalledWith('/citisft-intake/citisft/10/audit');
    expect(result).toEqual(mockResponse);
  });

  describe('getAuditPage', () => {
    it('calls client.get without eventType param when omitted', async () => {
      const mockResponse = { content: [], totalElements: 0 };
      vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

      const result = await getAuditPage(0, 10);

      expect(client.get).toHaveBeenCalledWith('/citisft-intake/audit', {
        params: { page: 0, size: 10 },
      });
      expect(result).toEqual(mockResponse);
    });

    it('calls client.get with eventType param when provided', async () => {
      const mockResponse = { content: [], totalElements: 0 };
      vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

      const result = await getAuditPage(1, 20, 'INGESTION');

      expect(client.get).toHaveBeenCalledWith('/citisft-intake/audit', {
        params: { page: 1, size: 20, eventType: 'INGESTION' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCitiSftPage', () => {
    it('calls client.get without status param when omitted', async () => {
      const mockResponse = { content: [], totalElements: 0 };
      vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

      const result = await getCitiSftPage(0, 10);

      expect(client.get).toHaveBeenCalledWith('/citisft-intake/citisft', {
        params: { page: 0, size: 10 },
      });
      expect(result).toEqual(mockResponse);
    });

    it('calls client.get with status param when provided', async () => {
      const mockResponse = { content: [], totalElements: 0 };
      vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

      const result = await getCitiSftPage(2, 15, 'PROCESSED');

      expect(client.get).toHaveBeenCalledWith('/citisft-intake/citisft', {
        params: { page: 2, size: 15, status: 'PROCESSED' },
      });
      expect(result).toEqual(mockResponse);
    });
  });
});


// src/api/documents.test.ts

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getDocuments,
  recordDocument,
  uploadDocument,
  downloadDocument,
  deleteDocument,
  updateDocument,
  getDocumentPreviewBlob,
} from './documents';
import client, { get, post, del } from './client';

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDocuments', () => {
    it('calls get with correct instruction documents path', async () => {
      const mockDocs = [{ id: 1, fileName: 'test.pdf' }];
      vi.mocked(get).mockResolvedValueOnce(mockDocs as any);

      const result = await getDocuments(100);

      expect(get).toHaveBeenCalledWith('/instructions/100/documents');
      expect(result).toEqual(mockDocs);
    });
  });

  describe('recordDocument', () => {
    it('constructs query params with all optional properties present', async () => {
      const mockDoc = { id: 1, fileName: 'doc.pdf' };
      vi.mocked(post).mockResolvedValueOnce(mockDoc as any);

      const params = {
        fileName: 'doc.pdf',
        documentType: 'INVOICE',
        dmcDocumentId: 'DMC123',
        fileSize: 2048,
        contentType: 'application/pdf',
      };

      const result = await recordDocument(100, params);

      expect(post).toHaveBeenCalledWith(
        expect.stringMatching(
          /\/instructions\/100\/documents\?fileName=doc\.pdf&documentType=INVOICE&dmcDocumentId=DMC123&fileSize=2048&contentType=application%2Fpdf/,
        ),
      );
      expect(result).toEqual(mockDoc);
    });

    it('constructs query params with minimal required properties', async () => {
      const mockDoc = { id: 2, fileName: 'doc2.pdf' };
      vi.mocked(post).mockResolvedValueOnce(mockDoc as any);

      const params = {
        fileName: 'doc2.pdf',
        documentType: 'RECEIPT',
      };

      await recordDocument(100, params);

      expect(post).toHaveBeenCalledWith(
        '/instructions/100/documents?fileName=doc2.pdf&documentType=RECEIPT',
      );
    });
  });

  describe('uploadDocument', () => {
    it('appends file, documentType, and metadata into FormData', async () => {
      const mockFile = new File(['content'], 'sample.txt', { type: 'text/plain' });
      const mockResponse = { data: { success: true, data: { id: 10 } } };
      vi.mocked(client.post).mockResolvedValueOnce(mockResponse as any);

      const metadata = {
        classification: 'CONFIDENTIAL',
        documentRegion: 'US',
        documentDate: '2026-08-07',
        retentionCode: 'RET-7Y',
      };

      const result = await uploadDocument(100, mockFile, 'PASSPORT', metadata);

      expect(client.post).toHaveBeenCalledWith(
        '/instructions/100/documents/upload',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      expect(result).toEqual({ success: true, data: { id: 10 } });
    });

    it('defaults documentType to OTHER when falsy and handles omitted metadata', async () => {
      const mockFile = new File(['content'], 'sample.txt', { type: 'text/plain' });
      const mockResponse = { data: { success: true } };
      vi.mocked(client.post).mockResolvedValueOnce(mockResponse as any);

      await uploadDocument(100, mockFile, '');

      expect(client.post).toHaveBeenCalledWith(
        '/instructions/100/documents/upload',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
    });
  });

  describe('downloadDocument', () => {
    it('requests blob, creates object URL, triggers download link click, and cleans up', async () => {
      const mockBlobData = new Blob(['pdf data'], { type: 'application/pdf' });
      vi.mocked(client.get).mockResolvedValueOnce({ data: mockBlobData } as any);

      const createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/mock-url');
      const revokeObjectURLMock = vi.fn();
      window.URL.createObjectURL = createObjectURLMock;
      window.URL.revokeObjectURL = revokeObjectURLMock;

      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      await downloadDocument(100, 50, 'statement.pdf');

      expect(client.get).toHaveBeenCalledWith('/instructions/100/documents/50/download', {
        responseType: 'blob',
      });
      expect(createObjectURLMock).toHaveBeenCalledWith(expect.any(Blob));
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:http://localhost/mock-url');

      clickSpy.mockRestore();
    });
  });

  describe('deleteDocument', () => {
    it('calls del with correct endpoint', async () => {
      vi.mocked(del).mockResolvedValueOnce(undefined as any);

      await deleteDocument(100, 50);

      expect(del).toHaveBeenCalledWith('/instructions/100/documents/50/delete');
    });
  });

  describe('updateDocument', () => {
    it('constructs query string with all updated fields', async () => {
      const mockDoc = { id: 50 };
      vi.mocked(post).mockResolvedValueOnce(mockDoc as any);

      const fields = {
        documentType: 'TAX',
        fileName: 'new-name.pdf',
        classification: 'INTERNAL',
        documentRegion: 'EMEA',
        documentDate: '2026-01-01',
        retentionCode: 'RET-3Y',
      };

      const result = await updateDocument(100, 50, fields);

      expect(post).toHaveBeenCalledWith(
        expect.stringMatching(
          /\/instructions\/100\/documents\/50\/update\?documentType=TAX&fileName=new-name\.pdf&classification=INTERNAL&documentRegion=EMEA&documentDate=2026-01-01&retentionCode=RET-3Y/,
        ),
      );
      expect(result).toEqual(mockDoc);
    });

    it('handles empty fields object gracefully', async () => {
      const mockDoc = { id: 50 };
      vi.mocked(post).mockResolvedValueOnce(mockDoc as any);

      await updateDocument(100, 50, {});

      expect(post).toHaveBeenCalledWith('/instructions/100/documents/50/update?');
    });
  });

  describe('getDocumentPreviewBlob', () => {
    it('creates object URL directly when response data is already a Blob', async () => {
      const mockBlob = new Blob(['preview content']);
      vi.mocked(client.get).mockResolvedValueOnce({ data: mockBlob } as any);

      const createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/preview-url');
      window.URL.createObjectURL = createObjectURLMock;

      const url = await getDocumentPreviewBlob(100, 50);

      expect(client.get).toHaveBeenCalledWith('/instructions/100/documents/50/preview', {
        responseType: 'blob',
      });
      expect(createObjectURLMock).toHaveBeenCalledWith(mockBlob);
      expect(url).toBe('blob:http://localhost/preview-url');
    });

    it('wraps non-Blob response data in a new Blob before creating object URL', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      vi.mocked(client.get).mockResolvedValueOnce({ data: mockArrayBuffer } as any);

      const createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/arraybuffer-url');
      window.URL.createObjectURL = createObjectURLMock;

      const url = await getDocumentPreviewBlob(100, 50);

      expect(createObjectURLMock).toHaveBeenCalledWith(expect.any(Blob));
      expect(url).toBe('blob:http://localhost/arraybuffer-url');
    });
  });
});

/// src/api/roles.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAvailableRoles, getCurrentUserRoles } from './roles';
import { get } from './client';

vi.mock('./client', () => ({
  get: vi.fn(),
}));

describe('roles API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailableRoles', () => {
    it('calls get with the correct roles endpoint', async () => {
      const mockRoles = [{ id: 'ROLE_ADMIN', name: 'Admin' }];
      vi.mocked(get).mockResolvedValueOnce(mockRoles as any);

      const result = await getAvailableRoles();

      expect(get).toHaveBeenCalledWith('/roles');
      expect(result).toEqual(mockRoles);
    });
  });

  describe('getCurrentUserRoles', () => {
    it('calls get with the correct auth/me endpoint', async () => {
      const mockUserResponse = { soeid: 'AB12345', roles: ['ROLE_ADMIN'] };
      vi.mocked(get).mockResolvedValueOnce(mockUserResponse as any);

      const result = await getCurrentUserRoles();

      expect(get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUserResponse);
    });
  });
});