import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { Checker1Service } from './checker1.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockSvc: any;

  beforeEach(async () => {
    mockSvc = {
      getIssueRecords: jest.fn().mockReturnValue(of([
        { id: 1, issueName: 'Test Issue', amount: 100, currency: 'USD', createdDate: new Date(), status: 'Open' }
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [Checker1Component, NoopAnimationsModule],
      providers: [
        { provide: Checker1Service, useValue: mockSvc },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load data', () => {
    expect(component).toBeTruthy();
    expect(component.gridData.length).toBeGreaterThan(0);
  });

  it('should close dialog and clear data on closeDialog()', () => {
    component.editDialog = true;
    component.clonedRecord = { id: 1 };
    component.closeDialog();
    expect(component.editDialog).toBe(false);
    expect(component.clonedRecord).toEqual({});
  });

  it('should reset filters', () => {
    component.filterDate = new Date();
    component.selectedCurrency = 'USD';
    component.resetFilters();
    expect(component.filterDate).toBeNull();
    expect(component.selectedCurrency).toBeNull();
  });
});