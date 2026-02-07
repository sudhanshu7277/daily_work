import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { Checker1Service } from './checker1.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockCheckerService: any;
  let mockMessageService: any;

  beforeEach(async () => {
    // 1. Create Jest Mocks for services
    mockCheckerService = {
      getIssueRecords: jest.fn().mockReturnValue(of([
        { 
          id: 101, 
          issueName: 'Test Equity', 
          amount: 5000, 
          currency: 'USD', 
          createdDate: new Date(), 
          status: 'Pending' 
        }
      ]))
    };

    mockMessageService = {
      add: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        Checker1Component,      // Import Standalone Component
        NoopAnimationsModule    // Required for Material and PrimeNG overlays
      ],
      providers: [
        { provide: Checker1Service, useValue: mockCheckerService },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger ngOnInit
  });

  it('should create and load initial grid data', () => {
    expect(component).toBeTruthy();
    expect(mockCheckerService.getIssueRecords).toHaveBeenCalled();
    expect(component.gridData.length).toBe(1);
    expect(component.gridData[0].issueName).toBe('Test Equity');
  });

  it('should authorize selected records and clear selection', () => {
    // Arrange: Simulate user checking a row
    component.selectedRecords = [component.gridData[0]];

    // Act
    component.onAuthorizeSelected();

    // Assert
    expect(component.gridData[0].status).toBe('Approved');
    expect(mockMessageService.add).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'success',
      summary: 'Authorized'
    }));
    expect(component.selectedRecords.length).toBe(0);
  });

  it('should open the edit modal with a cloned record', () => {
    const recordToEdit = component.gridData[0];
    
    component.onEditRow(recordToEdit);

    expect(component.editDialog).toBe(true);
    expect(component.clonedRecord.id).toBe(recordToEdit.id);
    
    // Ensure it is a DEEP CLONE (different memory reference)
    expect(component.clonedRecord).not.toBe(recordToEdit);
  });

  it('should update the table when saveEdit is called', () => {
    // Arrange: Open edit and modify cloned data
    component.clonedRecord = { ...component.gridData[0], amount: 9999 };
    
    // Act
    component.saveEdit();

    // Assert
    expect(component.gridData[0].amount).toBe(9999);
    expect(component.editDialog).toBe(false);
    expect(mockMessageService.add).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'info'
    }));
  });

  it('should reset filters when resetFilters is called', () => {
    component.filterDate = new Date();
    component.selectedCurrency = 'USD';
    
    component.resetFilters();

    expect(component.filterDate).toBeNull();
    expect(component.selectedCurrency).toBeNull();
  });
});