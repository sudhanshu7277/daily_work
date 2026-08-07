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

// src/api/thresholds.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getActiveThresholds,
  createThreshold,
  updateThreshold,
  deactivateThreshold,
} from './thresholds';
import { get, post, put, del } from './client';

vi.mock('./client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

describe('thresholds API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveThresholds', () => {
    it('calls get with the correct thresholds endpoint', async () => {
      const mockThresholds = [{ id: 1, amount: 50000 }];
      vi.mocked(get).mockResolvedValueOnce(mockThresholds as any);

      const result = await getActiveThresholds();

      expect(get).toHaveBeenCalledWith('/thresholds');
      expect(result).toEqual(mockThresholds);
    });
  });

  describe('createThreshold', () => {
    it('calls post with the correct endpoint and payload', async () => {
      const mockPayload = { amount: 100000, currency: 'USD' } as any;
      const mockResponse = { id: 2, amount: 100000, currency: 'USD' };
      vi.mocked(post).mockResolvedValueOnce(mockResponse as any);

      const result = await createThreshold(mockPayload);

      expect(post).toHaveBeenCalledWith('/thresholds', mockPayload);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateThreshold', () => {
    it('calls put with the correct update endpoint and payload', async () => {
      const mockPayload = { amount: 200000, currency: 'USD' } as any;
      const mockResponse = { id: 5, amount: 200000, currency: 'USD' };
      vi.mocked(put).mockResolvedValueOnce(mockResponse as any);

      const result = await updateThreshold(5, mockPayload);

      expect(put).toHaveBeenCalledWith('/thresholds/5/update', mockPayload);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deactivateThreshold', () => {
    it('calls del with the correct deactivate endpoint', async () => {
      vi.mocked(del).mockResolvedValueOnce(undefined as any);

      await deactivateThreshold(5);

      expect(del).toHaveBeenCalledWith('/thresholds/5/deactivate');
    });
  });
});

// src/api/tickler.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createTask,
  getTasksByAssignee,
  getTasksByRegion,
  getTasksByInstruction,
  completeTask,
  getPendingCount,
} from './tickler';
import { get, post } from './client';

vi.mock('./client', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

describe('tickler API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTask', () => {
    it('calls post with correct endpoint and task data', async () => {
      const mockRequest = { title: 'Review document', assignedTo: 'user1' } as any;
      const mockTask = { id: 1, title: 'Review document', assignedTo: 'user1' };
      vi.mocked(post).mockResolvedValueOnce(mockTask as any);

      const result = await createTask(mockRequest);

      expect(post).toHaveBeenCalledWith('/tickler', mockRequest);
      expect(result).toEqual(mockTask);
    });
  });

  describe('getTasksByAssignee', () => {
    it('calls get with default page and size params when omitted', async () => {
      const mockResponse = { content: [{ id: 1 }], totalElements: 1, totalPages: 1 };
      vi.mocked(get).mockResolvedValueOnce(mockResponse as any);

      const result = await getTasksByAssignee('john.doe');

      expect(get).toHaveBeenCalledWith('/tickler/assignee/john.doe', {
        page: 0,
        size: 20,
      });
      expect(result).toEqual(mockResponse);
    });

    it('calls get with custom page and size params', async () => {
      const mockResponse = { content: [], totalElements: 0, totalPages: 0 };
      vi.mocked(get).mockResolvedValueOnce(mockResponse as any);

      await getTasksByAssignee('john.doe', 2, 50);

      expect(get).toHaveBeenCalledWith('/tickler/assignee/john.doe', {
        page: 2,
        size: 50,
      });
    });
  });

  describe('getTasksByRegion', () => {
    it('calls get with default page and size params when omitted', async () => {
      const mockResponse = { content: [{ id: 2 }], totalElements: 1, totalPages: 1 };
      vi.mocked(get).mockResolvedValueOnce(mockResponse as any);

      const result = await getTasksByRegion('APAC');

      expect(get).toHaveBeenCalledWith('/tickler/region/APAC', {
        page: 0,
        size: 20,
      });
      expect(result).toEqual(mockResponse);
    });

    it('calls get with custom page and size params', async () => {
      const mockResponse = { content: [], totalElements: 0, totalPages: 0 };
      vi.mocked(get).mockResolvedValueOnce(mockResponse as any);

      await getTasksByRegion('EMEA', 1, 10);

      expect(get).toHaveBeenCalledWith('/tickler/region/EMEA', {
        page: 1,
        size: 10,
      });
    });
  });

  describe('getTasksByInstruction', () => {
    it('calls get with correct instruction tickler endpoint', async () => {
      const mockTasks = [{ id: 1, instructionId: 100 }];
      vi.mocked(get).mockResolvedValueOnce(mockTasks as any);

      const result = await getTasksByInstruction(100);

      expect(get).toHaveBeenCalledWith('/tickler/instruction/100');
      expect(result).toEqual(mockTasks);
    });
  });

  describe('completeTask', () => {
    it('calls post with correct complete endpoint', async () => {
      const mockTask = { id: 5, status: 'COMPLETED' };
      vi.mocked(post).mockResolvedValueOnce(mockTask as any);

      const result = await completeTask(5);

      expect(post).toHaveBeenCalledWith('/tickler/5/complete');
      expect(result).toEqual(mockTask);
    });
  });

  describe('getPendingCount', () => {
    it('calls get with correct pending count endpoint', async () => {
      vi.mocked(get).mockResolvedValueOnce(12 as any);

      const count = await getPendingCount();

      expect(get).toHaveBeenCalledWith('/tickler/pending/count');
      expect(count).toBe(12);
    });
  });
});


// src/api/whitelist.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getActiveWhitelist,
  getAllWhitelist,
  checkDomain,
  addDomain,
  deactivateDomain,
  activateDomain,
  updateDomain,
} from './whitelist';
import { get, post, del } from './client';

vi.mock('./client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  del: vi.fn(),
}));

describe('whitelist API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveWhitelist', () => {
    it('calls get with correct whitelist endpoint', async () => {
      const mockList = [{ id: 1, domain: 'example.com' }];
      vi.mocked(get).mockResolvedValueOnce(mockList as any);

      const result = await getActiveWhitelist();

      expect(get).toHaveBeenCalledWith('/whitelist');
      expect(result).toEqual(mockList);
    });
  });

  describe('getAllWhitelist', () => {
    it('calls get with correct whitelist/all endpoint', async () => {
      const mockList = [{ id: 1, domain: 'example.com' }, { id: 2, domain: 'test.com' }];
      vi.mocked(get).mockResolvedValueOnce(mockList as any);

      const result = await getAllWhitelist();

      expect(get).toHaveBeenCalledWith('/whitelist/all');
      expect(result).toEqual(mockList);
    });
  });

  describe('checkDomain', () => {
    it('calls get with check endpoint and domain query parameter', async () => {
      vi.mocked(get).mockResolvedValueOnce(true as any);

      const result = await checkDomain('example.com');

      expect(get).toHaveBeenCalledWith('/whitelist/check', { domain: 'example.com' });
      expect(result).toBe(true);
    });
  });

  describe('addDomain', () => {
    it('calls post with correct endpoint and payload', async () => {
      const mockPayload = { domain: 'newdomain.com' } as any;
      const mockResponse = { id: 3, domain: 'newdomain.com' };
      vi.mocked(post).mockResolvedValueOnce(mockResponse as any);

      const result = await addDomain(mockPayload);

      expect(post).toHaveBeenCalledWith('/whitelist', mockPayload);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deactivateDomain', () => {
    it('calls del with correct deactivate endpoint', async () => {
      vi.mocked(del).mockResolvedValueOnce(undefined as any);

      await deactivateDomain(10);

      expect(del).toHaveBeenCalledWith('/whitelist/10/deactivate');
    });
  });

  describe('activateDomain', () => {
    it('calls post with correct activate endpoint', async () => {
      vi.mocked(post).mockResolvedValueOnce(undefined as any);

      await activateDomain(10);

      expect(post).toHaveBeenCalledWith('/whitelist/10/activate');
    });
  });

  describe('updateDomain', () => {
    it('calls post with correct update endpoint and payload', async () => {
      const mockPayload = { domain: 'updateddomain.com' } as any;
      const mockResponse = { id: 10, domain: 'updateddomain.com' };
      vi.mocked(post).mockResolvedValueOnce(mockResponse as any);

      const result = await updateDomain(10, mockPayload);

      expect(post).toHaveBeenCalledWith('/whitelist/10', mockPayload);
      expect(result).toEqual(mockResponse);
    });
  });
});

// emailIntake.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getRecentIntakes,
  getInbox,
  getAttachments,
  getAuditTrail,
  getAuditPage,
  getInboxPage,
} from './emailIntake';
import client from './client';

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('emailIntake API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getRecentIntakes calls client.get with correct endpoint', async () => {
    const mockResponse = [{ inboxId: 1, emailSubject: 'Test' }];
    vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

    const result = await getRecentIntakes();

    expect(client.get).toHaveBeenCalledWith('/email-intake/recent');
    expect(result).toEqual(mockResponse);
  });

  it('getInbox calls client.get with correct endpoint', async () => {
    const mockResponse = { inboxId: 10, emailSubject: 'Invoice' };
    vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

    const result = await getInbox(10);

    expect(client.get).toHaveBeenCalledWith('/email-intake/inbox/10');
    expect(result).toEqual(mockResponse);
  });

  it('getAttachments calls client.get with correct endpoint', async () => {
    const mockResponse = [{ attachmentId: 100, fileName: 'invoice.pdf' }];
    vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

    const result = await getAttachments(10);

    expect(client.get).toHaveBeenCalledWith('/email-intake/inbox/10/attachments');
    expect(result).toEqual(mockResponse);
  });

  it('getAuditTrail calls client.get with correct endpoint', async () => {
    const mockResponse = [{ auditId: 5, eventType: 'RECEIVED' }];
    vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

    const result = await getAuditTrail(10);

    expect(client.get).toHaveBeenCalledWith('/email-intake/inbox/10/audit');
    expect(result).toEqual(mockResponse);
  });

  describe('getAuditPage', () => {
    it('calls client.get without eventType param when omitted', async () => {
      const mockResponse = { content: [], totalElements: 0 };
      vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

      const result = await getAuditPage(0, 10);

      expect(client.get).toHaveBeenCalledWith('/email-intake/audit', {
        params: { page: 0, size: 10 },
      });
      expect(result).toEqual(mockResponse);
    });

    it('calls client.get with eventType param when provided', async () => {
      const mockResponse = { content: [], totalElements: 0 };
      vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

      const result = await getAuditPage(1, 20, 'PARSED');

      expect(client.get).toHaveBeenCalledWith('/email-intake/audit', {
        params: { page: 1, size: 20, eventType: 'PARSED' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getInboxPage', () => {
    it('calls client.get without status param when omitted', async () => {
      const mockResponse = { content: [], totalElements: 0 };
      vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

      const result = await getInboxPage(0, 10);

      expect(client.get).toHaveBeenCalledWith('/email-intake/inbox', {
        params: { page: 0, size: 10 },
      });
      expect(result).toEqual(mockResponse);
    });

    it('calls client.get with status param when provided', async () => {
      const mockResponse = { content: [], totalElements: 0 };
      vi.mocked(client.get).mockResolvedValueOnce(mockResponse as any);

      const result = await getInboxPage(2, 15, 'PROCESSED');

      expect(client.get).toHaveBeenCalledWith('/email-intake/inbox', {
        params: { page: 2, size: 15, status: 'PROCESSED' },
      });
      expect(result).toEqual(mockResponse);
    });
  });
});

// src/context/AuthContext.test.tsx

import { render, screen, act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { getCurrentUserRoles } from '../api/roles';
import {
  login,
  getToken,
  setUserRole,
  isTokenExpired,
  getTokenExpiry,
} from '../utils/auth';

vi.mock('../api/roles', () => ({
  getCurrentUserRoles: vi.fn(),
}));

vi.mock('../utils/auth', () => ({
  login: vi.fn(),
  getToken: vi.fn(),
  setUserRole: vi.fn(),
  isTokenExpired: vi.fn(),
  getTokenExpiry: vi.fn(),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useAuth', () => {
    it('throws error when used outside of AuthProvider', () => {
      // Suppress React error log for uncaught boundary error during test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => renderHook(() => useAuth())).toThrow(
        'useAuth must be used within an AuthProvider',
      );
      spy.mockRestore();
    });
  });

  describe('AuthProvider & fetchRoles', () => {
    it('renders loading state initially before roles are fetched', () => {
      vi.mocked(getToken).mockReturnValue('token');
      vi.mocked(isTokenExpired).mockReturnValue(false);
      vi.mocked(getCurrentUserRoles).mockImplementation(
        () => new Promise(() => {}), // Pending promise
      );

      render(
        <AuthProvider>
          <div>Protected Content</div>
        </AuthProvider>,
      );

      expect(screen.getByText('Authenticating...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('fetches roles using existing valid token and resolves activeRole/region', async () => {
      vi.mocked(getToken).mockReturnValue('valid-token');
      vi.mocked(isTokenExpired).mockReturnValue(false);
      vi.mocked(getTokenExpiry).mockReturnValue(Math.floor(Date.now() / 1000) + 3600);
      vi.mocked(getCurrentUserRoles).mockResolvedValueOnce({
        data: {
          soeid: 'AB12345',
          roles: ['ROLE_USERS_NAM' as any, 'ROLE_ADMIN' as any],
        },
      } as any);

      const TestComponent = () => {
        const auth = useAuth();
        return (
          <div>
            <span data-testid="soeid">{auth.soeid}</span>
            <span data-testid="activeRole">{auth.activeRole}</span>
            <span data-testid="region">{auth.region}</span>
            <span data-testid="error">{auth.error ?? 'none'}</span>
          </div>
        );
      };

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>,
        );
      });

      expect(getCurrentUserRoles).toHaveBeenCalled();
      expect(setUserRole).toHaveBeenCalledWith('ROLE_USERS_NAM');
      expect(screen.getByTestId('soeid')).toHaveTextContent('AB12345');
      expect(screen.getByTestId('activeRole')).toHaveTextContent('ROLE_USERS_NAM');
      expect(screen.getByTestId('region')).toHaveTextContent('NAM');
      expect(screen.getByTestId('error')).toHaveTextContent('none');
    });

    it('logs in when no valid existing token is present', async () => {
      vi.mocked(getToken).mockReturnValue(null);
      vi.mocked(login).mockResolvedValueOnce({
        soeid: 'CD67890',
        roles: ['ROLE_USERS_LATAM' as any],
        token: 'new-token',
      });
      vi.mocked(getTokenExpiry).mockReturnValue(Math.floor(Date.now() / 1000) + 3600);

      const TestComponent = () => {
        const auth = useAuth();
        return (
          <div>
            <span data-testid="soeid">{auth.soeid}</span>
            <span data-testid="region">{auth.region}</span>
          </div>
        );
      };

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>,
        );
      });

      expect(login).toHaveBeenCalled();
      expect(screen.getByTestId('soeid')).toHaveTextContent('CD67890');
      expect(screen.getByTestId('region')).toHaveTextContent('LATAM');
    });

    it('sets region priority correctly (LATAM > NAM > EMEA > APAC)', async () => {
      vi.mocked(getToken).mockReturnValue(null);
      vi.mocked(login).mockResolvedValueOnce({
        soeid: 'USER1',
        roles: ['ROLE_USERS_APAC' as any, 'ROLE_USERS_EMEA' as any],
        token: 'token',
      });

      const TestComponent = () => {
        const auth = useAuth();
        return <span data-testid="region">{auth.region}</span>;
      };

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>,
        );
      });

      // EMEA priority is higher than APAC
      expect(screen.getByTestId('region')).toHaveTextContent('EMEA');
    });

    it('sets error message when user has no region role assigned', async () => {
      vi.mocked(getToken).mockReturnValue(null);
      vi.mocked(login).mockResolvedValueOnce({
        soeid: 'USER_NO_REGION',
        roles: ['ROLE_GUEST' as any],
        token: 'token',
      });

      const TestComponent = () => {
        const auth = useAuth();
        return <span data-testid="error">{auth.error}</span>;
      };

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>,
        );
      });

      expect(screen.getByTestId('error')).toHaveTextContent(
        'Your account has no region assigned (LATAM / NAM / EMEA / APAC). Please contact support to be granted a region role.',
      );
    });

    it('handles fetch error when thrown as Error instance', async () => {
      vi.mocked(getToken).mockReturnValue(null);
      vi.mocked(login).mockRejectedValueOnce(new Error('Network error'));

      const TestComponent = () => {
        const auth = useAuth();
        return <span data-testid="error">{auth.error}</span>;
      };

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>,
        );
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
    });

    it('handles fetch error when thrown as non-Error value', async () => {
      vi.mocked(getToken).mockReturnValue(null);
      vi.mocked(login).mockRejectedValueOnce('String error');

      const TestComponent = () => {
        const auth = useAuth();
        return <span data-testid="error">{auth.error}</span>;
      };

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>,
        );
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load user roles');
    });
  });

  describe('Token refresh timer (scheduleRefresh)', () => {
    it('schedules refresh and triggers silent re-login on expiry timeout', async () => {
      const now = 100000;
      vi.spyOn(Date, 'now').mockReturnValue(now);

      vi.mocked(getToken).mockReturnValue('token');
      vi.mocked(isTokenExpired).mockReturnValue(false);
      // Expire in 5 minutes (300 seconds)
      vi.mocked(getTokenExpiry).mockReturnValue(now / 1000 + 300);

      vi.mocked(getCurrentUserRoles).mockResolvedValueOnce({
        data: { soeid: 'USER1', roles: ['ROLE_USERS_NAM' as any] },
      } as any);

      vi.mocked(login).mockResolvedValueOnce({
        soeid: 'USER1',
        roles: ['ROLE_USERS_NAM' as any],
        token: 'refreshed-token',
      });

      await act(async () => {
        render(
          <AuthProvider>
            <div>App</div>
          </AuthProvider>,
        );
      });

      // Advance timers by 3 minutes (refresh is scheduled 2 min before 5 min expiry)
      await act(async () => {
        vi.advanceTimersByTime(3 * 60 * 1000);
      });

      expect(login).toHaveBeenCalledTimes(1);
    });

    it('handles silent refresh error gracefully', async () => {
      const now = 100000;
      vi.spyOn(Date, 'now').mockReturnValue(now);

      vi.mocked(getToken).mockReturnValue('token');
      vi.mocked(isTokenExpired).mockReturnValue(false);
      vi.mocked(getTokenExpiry).mockReturnValue(now / 1000 + 300);

      vi.mocked(getCurrentUserRoles).mockResolvedValueOnce({
        data: { soeid: 'USER1', roles: ['ROLE_USERS_NAM' as any] },
      } as any);

      vi.mocked(login).mockRejectedValueOnce(new Error('Refresh 401'));

      await act(async () => {
        render(
          <AuthProvider>
            <div>App</div>
          </AuthProvider>,
        );
      });

      await act(async () => {
        vi.advanceTimersByTime(3 * 60 * 1000);
      });

      expect(login).toHaveBeenCalledTimes(1);
    });

    it('does not schedule timer if exp === 0', async () => {
      vi.mocked(getToken).mockReturnValue('token');
      vi.mocked(isTokenExpired).mockReturnValue(false);
      vi.mocked(getTokenExpiry).mockReturnValue(0);

      vi.mocked(getCurrentUserRoles).mockResolvedValueOnce({
        data: { soeid: 'USER1', roles: ['ROLE_USERS_NAM' as any] },
      } as any);

      await act(async () => {
        render(
          <AuthProvider>
            <div>App</div>
          </AuthProvider>,
        );
      });

      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('Context Helper Methods', () => {
    it('tests hasRole, hasAnyRole, hasPermission, setActiveRole, and refresh', async () => {
      vi.mocked(getToken).mockReturnValue(null);
      vi.mocked(login).mockResolvedValue({
        soeid: 'USER1',
        roles: ['ROLE_USERS_NAM' as any, 'ROLE_ADMIN' as any],
        token: 'token',
      });

      let authInstance: ReturnType<typeof useAuth> = null!;

      const TestComponent = () => {
        authInstance = useAuth();
        return <div>Ready</div>;
      };

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>,
        );
      });

      // hasRole
      expect(authInstance.hasRole('ROLE_ADMIN' as any)).toBe(true);
      expect(authInstance.hasRole('ROLE_GUEST' as any)).toBe(false);

      // hasAnyRole
      expect(authInstance.hasAnyRole(['ROLE_GUEST' as any, 'ROLE_ADMIN' as any])).toBe(true);
      expect(authInstance.hasAnyRole(['ROLE_GUEST' as any])).toBe(false);

      // hasPermission
      expect(authInstance.hasPermission('READ')).toBe(false);

      // setActiveRole
      act(() => {
        authInstance.setActiveRole('ROLE_ADMIN' as any);
      });
      expect(setUserRole).toHaveBeenCalledWith('ROLE_ADMIN');
      expect(authInstance.activeRole).toBe('ROLE_ADMIN');

      // refresh
      await act(async () => {
        await authInstance.refresh();
      });
      expect(login).toHaveBeenCalledTimes(2);
    });
  });
});


// src/utils/exportExcel.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as XLSX from 'xlsx';
import { exportToExcel } from './exportExcel';

vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(() => 'mock-worksheet'),
    book_new: vi.fn(() => 'mock-workbook'),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

describe('exportToExcel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps data columns and triggers XLSX file creation', () => {
    const data = [
      { id: 101, name: 'John Doe', status: 'Active' },
      { id: 102, name: 'Jane Smith' }, // status missing to test nullish fallback
    ];

    const columns = [
      { title: 'User ID', dataIndex: 'id' },
      { title: 'Full Name', dataIndex: 'name' },
      { title: 'Account Status', dataIndex: 'status' },
    ];

    exportToExcel(data, columns, 'users_export');

    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
      { 'User ID': 101, 'Full Name': 'John Doe', 'Account Status': 'Active' },
      { 'User ID': 102, 'Full Name': 'Jane Smith', 'Account Status': '' },
    ]);
    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
      'mock-workbook',
      'mock-worksheet',
      'Data'
    );
    expect(XLSX.writeFile).toHaveBeenCalledWith(
      'mock-workbook',
      'users_export.xlsx'
    );
  });
});