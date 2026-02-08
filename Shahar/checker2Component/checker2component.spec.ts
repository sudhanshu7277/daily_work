import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Checker2Component } from './checker1.component';
import { Checker1Service, IssueRecord } from './checker1.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Checker2Component', () => {
  let component: Checker2Component;
  let fixture: ComponentFixture<Checker2Component>;
  let mockService: jest.Mocked<Checker1Service>;
  let mockMessageService: jest.Mocked<MessageService>;

  const mockData: IssueRecord[] = [
    { 
      id: 101, 
      issueName: 'Equity Settlement', 
      dda: 'DDA-77000', 
      account: '4455-000', 
      createdDate: new Date(), 
      currency: 'USD', 
      amount: 1500, 
      status: 'Open' 
    }
  ];

  beforeEach(async () => {
    // Create mocks for the Service and PrimeNG MessageService
    mockService = {
      getIssueRecords: jest.fn().mockReturnValue(of(mockData))
    } as any;

    mockMessageService = {
      add: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        Checker2Component, 
        NoopAnimationsModule // Necessary to handle PrimeNG overlays/dialogs in tests
      ],
      providers: [
        { provide: Checker1Service, useValue: mockService },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker2Component);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Triggers ngOnInit
  });

  it('should create and load grid data on init', () => {
    expect(component).toBeTruthy();
    expect(mockService.getIssueRecords).toHaveBeenCalled();
    expect(component.gridData.length).toBe(1);
    expect(component.gridData[0].issueName).toBe('Equity Settlement');
  });

  it('should handle single selection correctly', () => {
    // Simulate selecting a row
    component.selectedRecord = mockData[0];
    fixture.detectChanges();

    expect(component.selectedRecord).not.toBeNull();
    expect(component.selectedRecord?.id).toBe(101);
  });

  it('should authorize the selected record and clear selection', () => {
    component.selectedRecord = mockData[0];
    
    component.onAuthorizeSelected();
    
    expect(mockData[0].status).toBe('Approved');
    expect(mockMessageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' })
    );
    expect(component.selectedRecord).toBeNull(); // Verifies selection is cleared
  });

  it('should open edit dialog and clone the record', () => {
    const recordToEdit = mockData[0];
    component.onEditRow(recordToEdit);

    expect(component.editDialog).toBe(true);
    expect(component.clonedRecord.id).toBe(recordToEdit.id);
    // Ensure it's a clone, not the same reference
    expect(component.clonedRecord).not.toBe(recordToEdit);
  });

  it('should save edits and perform DOM cleanup', fakeAsync(() => {
    component.gridData = [...mockData];
    component.clonedRecord = { ...mockData[0], amount: 9999 };
    component.editDialog = true;

    component.saveEdit();
    tick(); // Wait for any async cleanup

    expect(component.gridData[0].amount).toBe(9999);
    expect(component.editDialog).toBe(false);
    
    // Check if the body overflow class was removed (prevents frozen screen)
    expect(document.body.classList.contains('p-overflow-hidden')).toBe(false);
  }));

  it('should reset all filters', () => {
    component.filterDate = new Date();
    component.selectedCurrency = 'EUR';
    
    // Spy on the table reset method
    const resetSpy = jest.spyOn(component.table!, 'reset');
    
    component.resetFilters();

    expect(component.filterDate).toBeNull();
    expect(component.selectedCurrency).toBeNull();
    expect(resetSpy).toHaveBeenCalled();
  });
});