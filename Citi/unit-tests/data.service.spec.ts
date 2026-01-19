import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';
import { firstValueFrom } from 'rxjs';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataService]
    });
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should return mock data as an observable', async () => {
    const data = await firstValueFrom(service.getData());
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('id');
  });

  it('should update a row and return updated record', async () => {
    const mockUpdate = { id: 1, issueName: 'Updated' } as any;
    const result = await firstValueFrom(service.updateRow(mockUpdate));
    expect(result.issueName).toBe('Updated');
  });
});