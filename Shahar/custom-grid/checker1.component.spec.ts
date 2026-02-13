import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Checker3Component } from './checker3.component';
import { Checker1Service } from './checker1.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('Checker3Component Final Suite', () => {
  let component: Checker3Component;
  let fixture: ComponentFixture<Checker3Component>;
  const mockData = [{ id: 'TXN-1', ddaAccount: 'DDA1', valueDate: '2026-02-13', ccy: 'USD', amount: 100 }];

  beforeEach(async () => {
    const mockService = { getLargeDataset: () => of(mockData) };
    await TestBed.configureTestingModule({
      imports: [Checker3Component, FormsModule],
      providers: [{ provide: Checker1Service, useValue: mockService }]
    }).compileComponents();
    fixture = TestBed.createComponent(Checker3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should debounce search and update pagination', fakeAsync(() => {
    component.onSearchChange('TXN-1');
    tick(300); // Wait for debounce
    expect(component.filteredRecords.length).toBe(1);
    expect(component.currentPage).toBe(1);
  }));

  it('should block non-numeric input for amount', () => {
    const event = new KeyboardEvent('keydown', { key: 'a' });
    const spy = jest.spyOn(event, 'preventDefault');
    component.validateAmountInput(event);
    expect(spy).toHaveBeenCalled();
  });
});

