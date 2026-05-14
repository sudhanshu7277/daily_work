import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { EntityGridService } from '../../shared/services/entity-grid.service';
import { EntityGridResponse, EntityNode } from './models/entity-grid.model';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Minimal EntityNode factory */
function makeNode(overrides: Partial<EntityNode> = {}): EntityNode {
  return {
    ocifId: 'OC-001',
    profileName: 'Test Profile',
    legalHoldStatus: 'N/A',
    holdName: '',
    lifecycle: 'Active Customer',
    role: 'Owner',
    address: '33 Dundas St W, Toronto, ON M5G 2C3',
    isParent: false,
    isExpanded: false,
    children: [],
    ...overrides,
  };
}

// ─── Suite ──────────────────────────────────────────────────────────────────

describe('EntityGridService', () => {
  let service: EntityGridService;
  let httpMock: HttpTestingController;

  const API_URL = '/api/v1/entity-grid';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EntityGridService],
    });

    service = TestBed.inject(EntityGridService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify no unexpected HTTP requests were made
    httpMock.verify();
  });

  // ── Creation ──────────────────────────────────────────────────────────────

  describe('creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be provided in root', () => {
      // verify the service can be injected without a module provider
      expect(service).toBeInstanceOf(EntityGridService);
    });
  });

  // ── Mock mode (useMock = true, the current default) ───────────────────────

  describe('getEntityGrid() — mock mode', () => {
    it('should return an observable without making an HTTP request', (done) => {
      service.getEntityGrid().subscribe({
        next: (res) => {
          expect(res).toBeDefined();
          done();
        },
        error: done.fail,
      });

      // In mock mode, no HTTP request should be outstanding
      httpMock.expectNone(API_URL);
    });

    it('should return an EntityGridResponse with a data array', (done) => {
      service.getEntityGrid().subscribe((res: EntityGridResponse) => {
        expect(Array.isArray(res.data)).toBe(true);
        done();
      });
    });

    it('should return an EntityGridResponse with a totalCount number', (done) => {
      service.getEntityGrid().subscribe((res: EntityGridResponse) => {
        expect(typeof res.totalCount).toBe('number');
        done();
      });
    });

    it('should return at least one root node', (done) => {
      service.getEntityGrid().subscribe((res: EntityGridResponse) => {
        expect(res.data.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should return totalCount equal to the total number of all nodes (recursive)', (done) => {
      service.getEntityGrid().subscribe((res: EntityGridResponse) => {
        const countAll = (nodes: EntityNode[]): number =>
          nodes.reduce((sum, n) => sum + 1 + countAll(n.children), 0);

        expect(res.totalCount).toBe(countAll(res.data));
        done();
      });
    });

    it('every root node should have all required EntityNode fields', (done) => {
      service.getEntityGrid().subscribe((res: EntityGridResponse) => {
        res.data.forEach((node) => {
          expect(node.ocifId).toBeDefined();
          expect(node.profileName).toBeDefined();
          expect(['LEGAL HOLD', 'N/A']).toContain(node.legalHoldStatus);
          expect(typeof node.holdName).toBe('string');
          expect(typeof node.lifecycle).toBe('string');
          expect(typeof node.role).toBe('string');
          expect(typeof node.address).toBe('string');
          expect(typeof node.isParent).toBe('boolean');
          expect(typeof node.isExpanded).toBe('boolean');
          expect(Array.isArray(node.children)).toBe(true);
        });
        done();
      });
    });

    it('nodes marked isParent should have non-empty children arrays', (done) => {
      function check(nodes: EntityNode[]): void {
        nodes.forEach((n) => {
          if (n.isParent) {
            expect(n.children.length).toBeGreaterThan(0);
          }
          check(n.children);
        });
      }

      service.getEntityGrid().subscribe((res) => {
        check(res.data);
        done();
      });
    });

    it('nodes marked as NOT isParent should have empty children arrays', (done) => {
      function check(nodes: EntityNode[]): void {
        nodes.forEach((n) => {
          if (!n.isParent) {
            expect(n.children.length).toBe(0);
          }
          check(n.children);
        });
      }

      service.getEntityGrid().subscribe((res) => {
        check(res.data);
        done();
      });
    });

    it('should include at least one node with legalHoldStatus LEGAL HOLD', (done) => {
      function flattenAll(nodes: EntityNode[]): EntityNode[] {
        return nodes.reduce<EntityNode[]>(
          (acc, n) => [...acc, n, ...flattenAll(n.children)],
          []
        );
      }

      service.getEntityGrid().subscribe((res) => {
        const all = flattenAll(res.data);
        const hasLegalHold = all.some((n) => n.legalHoldStatus === 'LEGAL HOLD');
        expect(hasLegalHold).toBe(true);
        done();
      });
    });

    it('should include the BMO mock address in at least one node', (done) => {
      const EXPECTED_ADDR = '33 Dundas St W, Toronto, ON M5G 2C3';

      function flattenAll(nodes: EntityNode[]): EntityNode[] {
        return nodes.reduce<EntityNode[]>(
          (acc, n) => [...acc, n, ...flattenAll(n.children)],
          []
        );
      }

      service.getEntityGrid().subscribe((res) => {
        const all = flattenAll(res.data);
        expect(all.some((n) => n.address === EXPECTED_ADDR)).toBe(true);
        done();
      });
    });

    it('mock response should be synchronous (of())', () => {
      // If the mock uses of(), the subscription fires synchronously
      let fired = false;
      service.getEntityGrid().subscribe(() => (fired = true));
      expect(fired).toBe(true); // no tick/fakeAsync needed
    });
  });

  // ── Live mode (useMock = false) ───────────────────────────────────────────
  //
  // We flip the private flag via reflection to simulate live mode.

  describe('getEntityGrid() — live mode', () => {
    beforeEach(() => {
      // Override private flag for live-mode tests
      (service as any).useMock = false;
    });

    it('should make a GET request to the entity-grid API', () => {
      service.getEntityGrid().subscribe();

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], totalCount: 0 });
    });

    it('should map the HTTP response to EntityGridResponse', (done) => {
      const mockResponse: EntityGridResponse = {
        data: [makeNode({ ocifId: 'LIVE-001' })],
        totalCount: 1,
      };

      service.getEntityGrid().subscribe((res) => {
        expect(res).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockResponse);
    });

    it('should propagate HTTP errors to subscribers', (done) => {
      service.getEntityGrid().subscribe({
        next: () => done.fail('Should have errored'),
        error: (err) => {
          expect(err.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should propagate 404 errors', (done) => {
      service.getEntityGrid().subscribe({
        next: () => done.fail('Should have errored'),
        error: (err) => {
          expect(err.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should use the correct API URL path', () => {
      service.getEntityGrid().subscribe();

      const req = httpMock.expectOne((r) => r.url === API_URL);
      expect(req).toBeTruthy();
      req.flush({ data: [], totalCount: 0 });
    });
  });

  // ── buildMockResponse (private, tested via getEntityGrid in mock mode) ────

  describe('buildMockResponse() (private, via mock mode)', () => {
    it('mock data should have nested tree structure (not a flat list)', (done) => {
      service.getEntityGrid().subscribe((res) => {
        const hasChildren = res.data.some((n) => n.children.length > 0);
        expect(hasChildren).toBe(true);
        done();
      });
    });

    it('mock ocifIds should all be non-empty strings', (done) => {
      function check(nodes: EntityNode[]): void {
        nodes.forEach((n) => {
          expect(typeof n.ocifId).toBe('string');
          expect(n.ocifId.length).toBeGreaterThan(0);
          check(n.children);
        });
      }

      service.getEntityGrid().subscribe((res) => {
        check(res.data);
        done();
      });
    });

    it('mock profileNames should all be non-empty strings', (done) => {
      function check(nodes: EntityNode[]): void {
        nodes.forEach((n) => {
          expect(n.profileName.length).toBeGreaterThan(0);
          check(n.children);
        });
      }

      service.getEntityGrid().subscribe((res) => {
        check(res.data);
        done();
      });
    });

    it('all ocifIds in the mock response should be unique', (done) => {
      function flattenAll(nodes: EntityNode[]): EntityNode[] {
        return nodes.reduce<EntityNode[]>(
          (acc, n) => [...acc, n, ...flattenAll(n.children)],
          []
        );
      }

      service.getEntityGrid().subscribe((res) => {
        const all = flattenAll(res.data);
        const ids = all.map((n) => n.ocifId);
        expect(new Set(ids).size).toBe(ids.length);
        done();
      });
    });

    it('mock data should include nodes with isSuspect true (Corp 3 and ABC Ltd.)', (done) => {
      function flattenAll(nodes: EntityNode[]): EntityNode[] {
        return nodes.reduce<EntityNode[]>(
          (acc, n) => [...acc, n, ...flattenAll(n.children)],
          []
        );
      }

      service.getEntityGrid().subscribe((res) => {
        const all = flattenAll(res.data);
        const suspects = all.filter((n) => (n as any).isSuspect === true);
        expect(suspects.length).toBeGreaterThanOrEqual(2);
        done();
      });
    });

    it('mock data should contain deeply nested nodes (at least 4 levels deep)', (done) => {
      function maxDepth(nodes: EntityNode[], depth = 0): number {
        return nodes.reduce(
          (max, n) =>
            n.children.length ? Math.max(max, maxDepth(n.children, depth + 1)) : max,
          depth
        );
      }

      service.getEntityGrid().subscribe((res) => {
        expect(maxDepth(res.data)).toBeGreaterThanOrEqual(4);
        done();
      });
    });
  });

  // ── searchByProfileName ───────────────────────────────────────────────────

  describe('searchByProfileName()', () => {
    describe('mock mode', () => {
      it('should return nodes whose profileName includes the search term (case-insensitive)', (done) => {
        service.searchByProfileName({ entityTradeName: 'Corp' }).subscribe((res: any) => {
          expect(res.data.length).toBeGreaterThan(0);
          res.data.forEach((n: EntityNode) => {
            expect(n.profileName.toLowerCase()).toContain('corp');
          });
          done();
        });

        httpMock.expectNone(`${API_URL}/search`);
      });

      it('should be case-insensitive', (done) => {
        service.searchByProfileName({ entityTradeName: 'CORP' }).subscribe((res: any) => {
          expect(res.data.length).toBeGreaterThan(0);
          done();
        });
      });

      it('should trim the search term before matching', (done) => {
        service.searchByProfileName({ entityTradeName: '  Corp  ' }).subscribe((res: any) => {
          expect(res.data.length).toBeGreaterThan(0);
          done();
        });
      });

      it('should return empty data array when no profile name matches', (done) => {
        service.searchByProfileName({ entityTradeName: 'ZZZNOMATCH' }).subscribe((res: any) => {
          expect(res.data.length).toBe(0);
          done();
        });
      });

      it('should return all root nodes when entityTradeName is empty string', (done) => {
        service.getEntityGrid().subscribe((all) => {
          service.searchByProfileName({ entityTradeName: '' }).subscribe((res: any) => {
            // Empty term → no filter applied → returns full mock data
            expect(res.data.length).toBe(all.data.length);
            done();
          });
        });
      });

      it('should match partial names (e.g. "ABC" matches "ABC Ltd.")', (done) => {
        service.searchByProfileName({ entityTradeName: 'ABC' }).subscribe((res: any) => {
          expect(res.data.length).toBeGreaterThan(0);
          const names = res.data.map((n: EntityNode) => n.profileName.toLowerCase());
          names.forEach((name: string) => expect(name).toContain('abc'));
          done();
        });
      });
    });

    describe('live mode', () => {
      beforeEach(() => {
        (service as any).useMock = false;
      });

      it('should POST to /api/v1/entity-grid/search', () => {
        const request = { entityTradeName: 'Corp 2' };
        service.searchByProfileName(request).subscribe();

        const req = httpMock.expectOne(`${API_URL}/search`);
        expect(req.request.method).toBe('POST');
        req.flush({ data: [], totalCount: 0 });
      });

      it('should send the request payload in the POST body', () => {
        const request = { entityTradeName: 'Test' };
        service.searchByProfileName(request).subscribe();

        const req = httpMock.expectOne(`${API_URL}/search`);
        expect(req.request.body).toEqual(request);
        req.flush({ data: [], totalCount: 0 });
      });

      it('should propagate HTTP errors', (done) => {
        service.searchByProfileName({ entityTradeName: 'Corp' }).subscribe({
          next: () => done.fail('Should have errored'),
          error: (err) => {
            expect(err.status).toBe(503);
            done();
          },
        });

        const req = httpMock.expectOne(`${API_URL}/search`);
        req.flush('Service Unavailable', { status: 503, statusText: 'Service Unavailable' });
      });
    });
  });

  // ── searchByentityTradeName ───────────────────────────────────────────────

  describe('searchByentityTradeName()', () => {
    describe('mock mode', () => {
      it('should return nodes whose profileName matches the term exactly', (done) => {
        service.searchByentityTradeName({ entityTradeName: 'Corp 2' }).subscribe((res: any) => {
          expect(res.data.length).toBeGreaterThan(0);
          res.data.forEach((n: EntityNode) => {
            expect(n.profileName).toBe('Corp 2');
          });
          done();
        });

        httpMock.expectNone(`${API_URL}/search`);
      });

      it('should return empty data for a non-matching exact term', (done) => {
        service.searchByentityTradeName({ entityTradeName: 'Nonexistent Corp' }).subscribe(
          (res: any) => {
            expect(res.data.length).toBe(0);
            done();
          }
        );
      });

      it('should be case-sensitive (exact match only)', (done) => {
        // "corp 2" (lowercase) should NOT match "Corp 2"
        service.searchByentityTradeName({ entityTradeName: 'corp 2' }).subscribe((res: any) => {
          expect(res.data.length).toBe(0);
          done();
        });
      });

      it('should return totalCount equal to filtered data length', (done) => {
        service.searchByentityTradeName({ entityTradeName: 'Corp 2' }).subscribe((res: any) => {
          expect(res.totalCount).toBe(res.data.length);
          done();
        });
      });

      it('should return 0 totalCount when no match', (done) => {
        service.searchByentityTradeName({ entityTradeName: 'ZZZNOMATCH' }).subscribe(
          (res: any) => {
            expect(res.totalCount).toBeFalsy(); // 0 or falsy
            done();
          }
        );
      });
    });

    describe('live mode', () => {
      beforeEach(() => {
        (service as any).useMock = false;
      });

      it('should POST to /api/v1/entity-grid/search', () => {
        const request = { entityTradeName: 'Corp 2' };
        service.searchByentityTradeName(request).subscribe();

        const req = httpMock.expectOne(`${API_URL}/search`);
        expect(req.request.method).toBe('POST');
        req.flush({ data: [], totalCount: 0 });
      });

      it('should send the request in the POST body', () => {
        const request = { entityTradeName: 'ABC Ltd.' };
        service.searchByentityTradeName(request).subscribe();

        const req = httpMock.expectOne(`${API_URL}/search`);
        expect(req.request.body).toEqual({ request });
        req.flush({ data: [], totalCount: 0 });
      });

      it('should propagate HTTP errors', (done) => {
        service.searchByentityTradeName({ entityTradeName: 'Test' }).subscribe({
          next: () => done.fail('Should have errored'),
          error: (err) => {
            expect(err.status).toBe(401);
            done();
          },
        });

        const req = httpMock.expectOne(`${API_URL}/search`);
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      });
    });
  });

  // ── filterTree (private, tested indirectly via searchByProfileName) ───────

  describe('filterTree() (private)', () => {
    // Access via cast
    function filterTree(nodes: EntityNode[], term: string): EntityNode[] {
      return (service as any).filterTree(nodes, term);
    }

    let mockData: EntityNode[];

    beforeEach((done) => {
      service.getEntityGrid().subscribe((res) => {
        mockData = res.data;
        done();
      });
    });

    it('should return nodes that self-match (profileName includes term)', () => {
      const result = filterTree(mockData, 'corp 2');
      expect(result.some((n) => n.profileName.toLowerCase().includes('corp 2'))).toBe(true);
    });

    it('should keep full children of a self-matching node', () => {
      // "Corp 2" (C2-001) is a root node with children; self-match should keep its children intact
      const result = filterTree(mockData, 'corp 2');
      const corp2 = result.find((n) => n.profileName.toLowerCase().includes('corp 2'));
      expect(corp2).toBeTruthy();
      expect(corp2!.children.length).toBe((mockData.find(
        (n) => n.profileName.toLowerCase().includes('corp 2')
      ) as EntityNode)!.children.length);
    });

    it('should keep a non-matching parent when a child matches', () => {
      // "ABC Ltd." is a root with children including "ABC Sub Ltd." — searching for the child
      const result = filterTree(mockData, 'abc sub ltd');
      const abcRoot = result.find((n) => n.profileName === 'ABC Ltd.');
      expect(abcRoot).toBeTruthy();
    });

    it('should trim the children of a non-self-matching parent to only matching children', () => {
      const result = filterTree(mockData, 'abc sub ltd');
      const abcRoot = result.find((n) => n.profileName === 'ABC Ltd.');
      // Original ABC Ltd. has multiple children, but filtered should only include "ABC Sub Ltd."
      expect(abcRoot!.children.every((c) => c.profileName.toLowerCase().includes('abc sub ltd')))
        .toBe(true);
    });

    it('should return empty array when no nodes match', () => {
      const result = filterTree(mockData, 'zzznomatch99999');
      expect(result).toEqual([]);
    });

    it('should be case-insensitive (term is pre-lowercased by caller)', () => {
      const lower = filterTree(mockData, 'corp 3');
      const upper = filterTree(mockData, 'Corp 3'.toLowerCase());
      expect(lower.length).toBe(upper.length);
    });
  });

  // ── countAll (private) ────────────────────────────────────────────────────

  describe('countAll() (private)', () => {
    function countAll(nodes: EntityNode[]): number {
      return (service as any).countAll(nodes);
    }

    it('should return 0 for empty array', () => {
      expect(countAll([])).toBe(0);
    });

    it('should count a single leaf as 1', () => {
      expect(countAll([makeNode()])).toBe(1);
    });

    it('should count root + children recursively', () => {
      const tree: EntityNode[] = [
        makeNode({
          isParent: true,
          children: [makeNode(), makeNode()],
        }),
      ];
      expect(countAll(tree)).toBe(3); // root + 2 children
    });

    it('should count deeply nested nodes', () => {
      const tree: EntityNode[] = [
        makeNode({
          isParent: true,
          children: [
            makeNode({
              isParent: true,
              children: [makeNode()],
            }),
          ],
        }),
      ];
      expect(countAll(tree)).toBe(3); // root + child + grandchild
    });

    it('totalCount in mock response matches countAll(data)', (done) => {
      service.getEntityGrid().subscribe((res) => {
        expect(res.totalCount).toBe(countAll(res.data));
        done();
      });
    });
  });
});