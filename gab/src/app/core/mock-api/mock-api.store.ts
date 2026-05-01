import { v4 as uuid } from 'uuid';
import {
  ApiResponse,
  CreatePaymentInstructionPayload,
  InstructionFilters,
  PaginationParams,
  PaymentInstruction,
  UpdateInstructionPayload,
} from '../models';
import { MOCK_INSTRUCTIONS } from './instructions.fixtures';
import {
  MOCK_CLIENTS,
  MOCK_COUNTRIES,
  MOCK_DEALS,
  MOCK_REGIONS,
  MOCK_USERS,
} from './lookup.fixtures';

/**
 * In-memory mock backend.
 * Stateful — supports CRUD and filtering. Resets on reload.
 *
 * The HTTP interceptor (mock-api.interceptor.ts) translates real HTTP
 * requests into calls against this class so the rest of the app talks
 * via Angular's HttpClient and is unaware of the mock.
 */
export class MockApiStore {
  private instructions: PaymentInstruction[] = [...MOCK_INSTRUCTIONS];

  // --------------------- Lookups (read-only) ----------------------

  getRegions() { return MOCK_REGIONS; }
  getCountries(regionId?: string) {
    return regionId
      ? MOCK_COUNTRIES.filter((c) => c.regionId === regionId)
      : MOCK_COUNTRIES;
  }
  getClients(countryId?: string) {
    return countryId
      ? MOCK_CLIENTS.filter((c) => c.countryId === countryId)
      : MOCK_CLIENTS;
  }
  getDeals(clientId?: string) {
    return clientId ? MOCK_DEALS.filter((d) => d.clientId === clientId) : MOCK_DEALS;
  }
  getUsers() { return MOCK_USERS; }

  // --------------------- Instructions -----------------------------

  listInstructions(
    filters: InstructionFilters = {},
    pagination: PaginationParams = {}
  ): ApiResponse<PaymentInstruction[]> {
    let results = [...this.instructions];

    if (filters.status?.length) {
      results = results.filter((i) => filters.status!.includes(i.status));
    }
    if (filters.regionId) {
      results = results.filter((i) => i.clientInformation.regionId === filters.regionId);
    }
    if (filters.clientId) {
      results = results.filter((i) => i.clientInformation.clientId === filters.clientId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (i) =>
          i.reference.toLowerCase().includes(q) ||
          (i.instructionDetails.description ?? '').toLowerCase().includes(q)
      );
    }

    const total = results.length;

    if (pagination.sortBy) {
      const dir = pagination.sortDir === 'desc' ? -1 : 1;
      results.sort((a, b) => {
        const ka = (a as unknown as Record<string, string>)[pagination.sortBy!] ?? '';
        const kb = (b as unknown as Record<string, string>)[pagination.sortBy!] ?? '';
        return ka < kb ? -1 * dir : ka > kb ? 1 * dir : 0;
      });
    } else {
      results.sort((a, b) => (a.updatedOn < b.updatedOn ? 1 : -1));
    }

    if (pagination.page && pagination.pageSize) {
      const start = (pagination.page - 1) * pagination.pageSize;
      results = results.slice(start, start + pagination.pageSize);
    }

    return {
      data: results,
      meta: {
        total,
        page: pagination.page ?? 1,
        pageSize: pagination.pageSize ?? total,
      },
    };
  }

  getInstruction(id: string): PaymentInstruction | null {
    return this.instructions.find((i) => i.id === id) ?? null;
  }

  createInstruction(payload: CreatePaymentInstructionPayload): PaymentInstruction {
    const country = MOCK_COUNTRIES.find((c) => c.id === payload.clientInformation.countryId);
    const code = country?.code ?? 'XX';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(Math.floor(1000 + Math.random() * 9000));
    const id = `${code}_${date}_${seq}`;

    const now = new Date().toISOString();
    const created: PaymentInstruction = {
      id,
      reference: id,
      status: 'admin-maker',
      clientInformation: payload.clientInformation,
      instructionDetails: payload.instructionDetails,
      additionalInformation: [],
      mppProcess: payload.mppProcess,
      attachments: [],
      signatureValidation: {
        validationSource: null,
        status: null,
        commentType: 'Signature Validation',
      },
      callbacks: [],
      comments: [],
      history: [{ step: 'admin-maker', enteredAt: now, by: 'current-user' }],
      createdBy: 'current-user',
      createdOn: now,
      updatedOn: now,
    };
    this.instructions = [created, ...this.instructions];
    return created;
  }

  updateInstruction(id: string, payload: UpdateInstructionPayload): PaymentInstruction | null {
    const idx = this.instructions.findIndex((i) => i.id === id);
    if (idx < 0) return null;
    const existing = this.instructions[idx];
    const next: PaymentInstruction = {
      ...existing,
      clientInformation: { ...existing.clientInformation, ...payload.clientInformation },
      instructionDetails: { ...existing.instructionDetails, ...payload.instructionDetails },
      mppProcess: { ...existing.mppProcess, ...payload.mppProcess },
      additionalInformation: payload.additionalInformation ?? existing.additionalInformation,
      signatureValidation: { ...existing.signatureValidation, ...payload.signatureValidation },
      updatedOn: new Date().toISOString(),
    };
    this.instructions[idx] = next;
    return next;
  }

  advanceInstruction(id: string): PaymentInstruction | null {
    const flow: PaymentInstruction['status'][] = [
      'draft',
      'admin-maker',
      'admin-checker',
      'signature-validation',
      'operations-callback',
      'payment-pending',
      'payment-in-progress',
      'payment-completed',
    ];
    const inst = this.getInstruction(id);
    if (!inst) return null;
    const i = flow.indexOf(inst.status);
    if (i < 0 || i >= flow.length - 1) return inst;
    return this.updateInstruction(id, {}) && this.transitionStatus(id, flow[i + 1]);
  }

  private transitionStatus(id: string, status: PaymentInstruction['status']): PaymentInstruction | null {
    const idx = this.instructions.findIndex((i) => i.id === id);
    if (idx < 0) return null;
    const now = new Date().toISOString();
    const inst = this.instructions[idx];
    inst.status = status;
    inst.updatedOn = now;
    inst.history.push({ step: status, enteredAt: now, by: 'current-user' });
    return inst;
  }

  // --------------------- Dashboard aggregations -------------------

  getDashboardSummary() {
    const counts = this.instructions.reduce<Record<string, number>>((acc, inst) => {
      acc[inst.status] = (acc[inst.status] ?? 0) + 1;
      return acc;
    }, {});
    const byCategory = this.instructions.reduce<Record<string, number>>((acc, inst) => {
      const c = inst.instructionDetails.category ?? 'Uncategorised';
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    }, {});
    const byRegion = this.instructions.reduce<Record<string, number>>((acc, inst) => {
      const r = inst.clientInformation.regionId ?? 'unknown';
      acc[r] = (acc[r] ?? 0) + 1;
      return acc;
    }, {});

    return {
      total: this.instructions.length,
      counts,
      byCategory,
      byRegion,
      // Match the “23 / 12” counters in Fig 6.
      missingByPriority: { high: 23, medium: 12 },
    };
  }

  // --------------------- Helpers ----------------------------------

  resetSeed(): void {
    this.instructions = [...MOCK_INSTRUCTIONS];
  }

  newId(): string { return uuid(); }
}

export const mockApiStore = new MockApiStore();
