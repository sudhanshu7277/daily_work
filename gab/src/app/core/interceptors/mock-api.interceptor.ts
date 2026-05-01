import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { mockApiStore } from '../mock-api/mock-api.store';
import {
  CreatePaymentInstructionPayload,
  InstructionFilters,
  PaginationParams,
  UpdateInstructionPayload,
} from '../models';
import { LoggerService } from '../services/logger.service';

/**
 * Translates HTTP requests to /api/* into calls against the in-memory
 * mock store. Bypassed entirely in production (environment.useMockApi=false).
 *
 * Adds a small artificial delay so loading states are visible during dev.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);

  if (!environment.useMockApi || !req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const url = req.url.replace(environment.apiBaseUrl, '');
  const method = req.method.toUpperCase();

  logger.debug('[mock-api]', method, url);

  const respond = <T>(body: T, status = 200, latencyMs = 250): Observable<HttpResponse<T>> =>
    of(new HttpResponse({ status, body })).pipe(delay(latencyMs));

  const notFound = () => throwError(() => ({ status: 404, message: 'Not found' }));

  // ----------------------------- Lookups -----------------------------------
  if (method === 'GET' && url === '/lookups/regions') {
    return respond({ data: mockApiStore.getRegions() });
  }
  if (method === 'GET' && url.startsWith('/lookups/countries')) {
    const regionId = req.params.get('regionId') ?? undefined;
    return respond({ data: mockApiStore.getCountries(regionId) });
  }
  if (method === 'GET' && url.startsWith('/lookups/clients')) {
    const countryId = req.params.get('countryId') ?? undefined;
    return respond({ data: mockApiStore.getClients(countryId) });
  }
  if (method === 'GET' && url.startsWith('/lookups/deals')) {
    const clientId = req.params.get('clientId') ?? undefined;
    return respond({ data: mockApiStore.getDeals(clientId) });
  }
  if (method === 'GET' && url === '/lookups/users') {
    return respond({ data: mockApiStore.getUsers() });
  }

  // ----------------------------- Instructions ------------------------------
  if (method === 'GET' && url === '/instructions') {
    const filters: InstructionFilters = {
      status: req.params.getAll('status') ?? undefined,
      regionId: req.params.get('regionId') ?? undefined,
      clientId: req.params.get('clientId') ?? undefined,
      search: req.params.get('search') ?? undefined,
    };
    const pagination: PaginationParams = {
      page: Number(req.params.get('page') ?? 1),
      pageSize: Number(req.params.get('pageSize') ?? 25),
      sortBy: req.params.get('sortBy') ?? undefined,
      sortDir: (req.params.get('sortDir') as 'asc' | 'desc') ?? undefined,
    };
    return respond(mockApiStore.listInstructions(filters, pagination));
  }
  const instructionByIdMatch = /^\/instructions\/([^/]+)$/.exec(url);
  if (method === 'GET' && instructionByIdMatch) {
    const inst = mockApiStore.getInstruction(instructionByIdMatch[1]);
    return inst ? respond({ data: inst }) : notFound();
  }
  if (method === 'POST' && url === '/instructions') {
    const created = mockApiStore.createInstruction(req.body as CreatePaymentInstructionPayload);
    return respond({ data: created }, 201, 400);
  }
  if (method === 'PUT' && instructionByIdMatch) {
    const updated = mockApiStore.updateInstruction(
      instructionByIdMatch[1],
      req.body as UpdateInstructionPayload
    );
    return updated ? respond({ data: updated }) : notFound();
  }
  const advanceMatch = /^\/instructions\/([^/]+)\/advance$/.exec(url);
  if (method === 'POST' && advanceMatch) {
    const advanced = mockApiStore.advanceInstruction(advanceMatch[1]);
    return advanced ? respond({ data: advanced }) : notFound();
  }

  // ----------------------------- Dashboard ---------------------------------
  if (method === 'GET' && url === '/dashboard/summary') {
    return respond({ data: mockApiStore.getDashboardSummary() });
  }

  // Anything not handled — let it fall through (will likely 404 in real API).
  return next(req);
};
