import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Checker3Component } from './checker3.component';
import { Checker3Service } from './checker3.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('Checker3Component', () => {
  let component: Checker3Component;
  let fixture: ComponentFixture<Checker3Component>;
  const mockRow = { id: 'TXN-1093', ddaAccount: 'DDA-58479', amount: 750489.56 };

  beforeEach(async () => {
    const mockService = {
      getLargeDataset: jest.fn().mockReturnValue(of([mockRow]))
    };

    await TestBed.configureTestingModule({
      imports: [Checker3Component, CommonModule, FormsModule],
      providers: [
        { provide: Checker3Service, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should toggle selection correctly with two arguments', () => {
    component.toggleSelection(mockRow, 'TXN-1093');
    expect(component.selectedRecordId).toBe('TXN-1093');

    component.toggleSelection(mockRow, 'TXN-1093');
    expect(component.selectedRecordId).toBeNull();
  });

  it('should handle authorization and clear timers', fakeAsync(() => {
    component.toggleSelection(mockRow, 'TXN-1093');
    component.onAuthorize();
    
    tick(1200);
    flush(); 
    
    expect(component.isAuthorizing).toBe(false);
    expect(component.selectedRecordId).toBeNull();
  }));
});