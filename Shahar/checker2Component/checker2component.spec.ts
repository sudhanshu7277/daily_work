import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { Checker1Service } from './checker1.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockService: any;
  let mockMessageService: any;

  beforeEach(async () => {
    mockService = {
      getIssueRecords: jest.fn().mockReturnValue(of([
        { id: 101, issueName: 'Test Issue', amount: 5000, currency: 'USD', createdDate: new Date(), status: 'Pending' }
      ]))
    };

    mockMessageService = {
      add: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        Checker1Component, // Import standalone component
        NoopAnimationsModule // Prevents animation timeout errors
      ],
      providers: [
        { provide: Checker1Service, useValue: mockService },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load data on init', () => {
    expect(component).toBeTruthy();
    expect(mockService.getIssueRecords).toHaveBeenCalled();
    expect(component.gridData.length).toBe(1);
  });

  it('should update status to Approved when onAuthorizeSelected is called', () => {
    // Select the first record
    component.selectedRecords = [component.gridData[0]];
    
    component.onAuthorizeSelected();
    
    expect(component.gridData[0].status).toBe('Approved');
    expect(mockMessageService.add).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'success'
    }));
    // Checkboxes should clear after action
    expect(component.selectedRecords.length).toBe(0);
  });

  it('should open edit dialog with a cloned record', () => {
    const record = component.gridData[0];
    component.onEditRow(record);
    
    expect(component.editDialog).toBe(true);
    expect(component.clonedRecord.id).toBe(record.id);
    // Ensure it is a clone, not the same reference
    expect(component.clonedRecord).not.toBe(record);
  });
});