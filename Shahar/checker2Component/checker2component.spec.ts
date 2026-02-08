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
        { id: 1, issueName: 'Equity', dda: 'D1', account: 'A1', createdDate: new Date(), currency: 'USD', amount: 100, status: 'Open' }
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [Checker1Component, NoopAnimationsModule],
      providers: [ { provide: Checker1Service, useValue: mockSvc }, MessageService ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should select a record via the radio logic', () => {
    const record = component.gridData[0];
    component.selectedRecord = record;
    expect(component.selectedRecord.id).toBe(1);
  });
});