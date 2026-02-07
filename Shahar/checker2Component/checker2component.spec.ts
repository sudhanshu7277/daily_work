import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker2Component } from './checker2.component';
import { Checker2Service } from './checker2.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Checker2Component', () => {
  let component: Checker2Component;
  let fixture: ComponentFixture<Checker2Component>;

  const mockDataService = {
  // Use .mockReturnValue instead of .and.returnValue
  fetchThresholdData: jest.fn().mockReturnValue(of([])),
  getIssueRecords: jest.fn().mockReturnValue(of([]))
};

  beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [Checker1Component, NoopAnimationsModule],
    providers: [
      { provide: Checker1Service, useValue: mockService },
      MessageService,
      providePrimeNG({ theme: { preset: Aura } }) // Matches your app.config
    ]
  }).compileComponents();
});

  it('should create and load data', () => {
    expect(component).toBeTruthy();
  });

  it('should open edit dialog when a record is selected', () => {
    component.selectedRecord = { id: 1 } as any;
    component.openEditModal();
    expect(component.editDialog).toBe(true);
    expect(component.clonedRecord.id).toBe(1);
  });
});