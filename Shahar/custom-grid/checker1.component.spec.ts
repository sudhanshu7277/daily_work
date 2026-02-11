import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Checker3Component } from './checker3.component';
import { Checker1Service } from '../../services/checker1.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('Checker3Component', () => {
  let component: Checker3Component;
  let fixture: ComponentFixture<Checker3Component>;

  const mockData = [
    { id: 'TXN-0', ddaAccount: 'DDA-000', amount: 1000 },
    { id: 'TXN-1', ddaAccount: 'DDA-111', amount: 2000 }
  ];

  const mockService = {
    getLargeDataset: jest.fn().mockReturnValue(of(mockData))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checker3Component, CommonModule, FormsModule],
      providers: [
        { provide: Checker1Service, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Selection Logic', () => {
    it('should select a record when row and id are provided', () => {
      const row = mockData[1];
      component.toggleSelection(row, 'TXN-1');
      expect(component.selectedRecordId).toBe('TXN-1');
    });

    it('should toggle off if clicked again', () => {
      const row = mockData[1];
      component.toggleSelection(row, 'TXN-1');
      component.toggleSelection(row, 'TXN-1');
      expect(component.selectedRecordId).toBeNull();
    });
  });

  describe('Authorization Flow', () => {
    it('should handle authorization simulation and clear timers', fakeAsync(() => {
      const row = mockData[0];
      component.toggleSelection(row, 'TXN-0');
      
      component.onAuthorize();
      
      tick(1200); 
      
      tick(3000);

      flush(); 

      expect(component.isAuthorizing).toBe(false);
      expect(component.selectedRecordId).toBeNull();
    }));
  });
});