import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Checker3Component } from './checker3.component';
import { Checker1Service } from '../../services/checker1.service'; // Verify this path
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('Checker3Component', () => {
  let component: Checker3Component;
  let fixture: ComponentFixture<Checker3Component>;
  
  // Define mockService so it's available for the provider
  const mockService = {
    getLargeDataset: jest.fn().mockReturnValue(of([
      { id: 'TXN-0', ddaAccount: 'DDA-000', amount: 1000 },
      { id: 'TXN-1', ddaAccount: 'DDA-111', amount: 2000 }
    ]))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Checker3 is likely a standalone component
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
      const mockRow = { id: 'TXN-1', ddaAccount: 'DDA-111' };
      
      // FIX: Pass both the row object AND the id string
      component.toggleSelection(mockRow, 'TXN-1');
      
      expect(component.selectedRecordId).toBe('TXN-1');
    });

    it('should toggle selection off if the same row is clicked again', () => {
      const mockRow = { id: 'TXN-1', ddaAccount: 'DDA-111' };
      
      component.toggleSelection(mockRow, 'TXN-1'); // Select
      expect(component.selectedRecordId).toBe('TXN-1');
      
      component.toggleSelection(mockRow, 'TXN-1'); // Deselect
      expect(component.selectedRecordId).toBeNull();
    });

    it('should switch selection to a different record', () => {
      const row1 = { id: 'TXN-0', ddaAccount: 'DDA-000' };
      const row2 = { id: 'TXN-1', ddaAccount: 'DDA-111' };

      component.toggleSelection(row1, 'TXN-0');
      component.toggleSelection(row2, 'TXN-1');
      
      expect(component.selectedRecordId).toBe('TXN-1');
    });
  });

  describe('Authorization Flow', () => {
    it('should handle authorization simulation', fakeAsync(() => {
      const mockRow = { id: 'TXN-0', ddaAccount: 'DDA-000' };
      component.toggleSelection(mockRow, 'TXN-0');
      
      component.onAuthorize();
      expect(component.isAuthorizing).toBe(true);
      
      tick(1200); // Fast-forward simulated API delay
      
      expect(component.isAuthorizing).toBe(false);
      expect(component.selectedRecordId).toBeNull();
    }));
  });
});