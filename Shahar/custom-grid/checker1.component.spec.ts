import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Checker3Component } from './checker3.component';
import { Checker1Service } from '../../services/checker1.service';
import { of } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('Checker3Component', () => {
  let component: Checker3Component;
  let fixture: ComponentFixture<Checker3Component>;
  let mockService: any;

  // Mock data needed to provide the "row" object to the method
  const mockData = [
    { id: 'TXN-1', ddaAccount: 'DDA-77000', amount: 55600 },
    { id: 'TXN-2', ddaAccount: 'DDA-88021', amount: 1200 },
    { id: 'TXN-0', ddaAccount: 'DDA-99100', amount: 8900 }
  ];

  beforeEach(async () => {
    mockService = {
      getLargeDataset: jest.fn().mockReturnValue(of(mockData))
    };

    await TestBed.configureTestingModule({
      imports: [
        Checker3Component, 
        CommonModule, 
        FormsModule, 
        ReactiveFormsModule
      ],
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
      const row = mockData[0]; // TXN-1
      
      // FIX: Providing both required arguments
      component.toggleSelection(row, 'TXN-1');
      
      expect(component.selectedRecordId).toBe('TXN-1');
    });

    it('should toggle selection off when the same row is clicked', () => {
      const row = mockData[0];
      
      component.toggleSelection(row, 'TXN-1'); // Select
      component.toggleSelection(row, 'TXN-1'); // Deselect
      
      expect(component.selectedRecordId).toBeNull();
    });

    it('should change selection when a different row is clicked', () => {
      const row1 = mockData[0];
      const row2 = mockData[1];

      component.toggleSelection(row1, 'TXN-1');
      component.toggleSelection(row2, 'TXN-2');
      
      expect(component.selectedRecordId).toBe('TXN-2');
    });
  });

  describe('Action Flow', () => {
    it('should handle authorization simulation', fakeAsync(() => {
      const row = mockData[2]; // TXN-0
      component.toggleSelection(row, 'TXN-0');
      
      component.onAuthorize();
      expect(component.isAuthorizing).toBe(true);
      
      tick(1200); // Fast-forward the simulated API delay
      
      expect(component.isAuthorizing).toBe(false);
      expect(component.selectedRecordId).toBeNull();
    }));
  });
});