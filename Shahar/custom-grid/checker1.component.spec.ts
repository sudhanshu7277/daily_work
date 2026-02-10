import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checker1Component, CommonModule, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with master data', () => {
    expect(component.filteredData.length).toBe(3);
  });

  it('should select only one record at a time', () => {
    // Select first record
    component.toggleSelection('REC-001');
    expect(component.selectedRecordId).toBe('REC-001');

    // Select second record - should replace first
    component.toggleSelection('REC-002');
    expect(component.selectedRecordId).toBe('REC-002');

    // Toggle same record - should deselect
    component.toggleSelection('REC-002');
    expect(component.selectedRecordId).toBeNull();
  });

  it('should filter data based on DDA search query', () => {
    component.searchDDA = '77000';
    component.applyFilters();
    expect(component.filteredData.length).toBe(1);
    expect(component.filteredData[0].id).toBe('REC-001');
  });

  it('should filter data based on Currency', () => {
    component.filterCCY = 'EUR';
    component.applyFilters();
    expect(component.filteredData.every(item => item.ccy === 'EUR')).toBeTrue();
  });

  it('should show a toast message and auto-remove it', fakeAsync(() => {
    component.showToast('Test Success', 'success');
    expect(component.toasts.length).toBe(1);
    expect(component.toasts[0].message).toBe('Test Success');

    // Move time forward by 4 seconds (matching our setTimeout)
    tick(4000);
    expect(component.toasts.length).toBe(0);
  }));

  it('should authorize and remove record from list', () => {
    component.toggleSelection('REC-001');
    component.onAuthorize();
    
    // Check if toast was created
    expect(component.toasts.some(t => t.type === 'success')).toBeTrue();
    // Check if record was removed from master data
    expect(component.masterData.find(r => r.id === 'REC-001')).toBeUndefined();
    // Check if selection was reset
    expect(component.selectedRecordId).toBeNull();
  });
});