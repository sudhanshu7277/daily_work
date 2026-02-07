import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker2Component } from './checker2.component';
import { Checker2Service } from './checker2.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Checker2Component', () => {
  let component: Checker2Component;
  let fixture: ComponentFixture<Checker2Component>;

  beforeEach(async () => {
    const mockService = {
      getIssueRecords: jest.fn().mockReturnValue(of([])),
      updateRecord: jest.fn().mockReturnValue(of(true))
    };

    await TestBed.configureTestingModule({
      imports: [Checker2Component, NoopAnimationsModule],
      providers: [
        { provide: Checker2Service, useValue: mockService },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
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