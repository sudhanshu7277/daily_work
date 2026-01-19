// checker1.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Checker1Service } from './checker1.service';

describe('Checker1Service', () => {
  let service: Checker1Service;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Checker1Service]
    });
    service = TestBed.inject(Checker1Service);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensures no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch data via GET', () => {
    const mockData = [{ id: 1, name: 'Test' }];
    
    service.getCheckerData('some-param').subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(request => request.url.includes('/api/checker'));
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});


// checker1.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { Checker1Service } from 'src/app/shared/services/checker1.service';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      getCheckerData: jest.fn().mockReturnValue(of([])),
      saveData: jest.fn().mockReturnValue(of({ success: true }))
    };

    await TestBed.configureTestingModule({
      // STANDALONE component goes in imports
      imports: [
        Checker1Component, 
        ReactiveFormsModule, 
        AgGridModule
      ],
      providers: [
        { provide: Checker1Service, useValue: mockService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;

    // Manually mock the grid API that Ag-Grid usually provides
    component.gridApi = {
      setRowData: jest.fn(),
      getSelectedRows: jest.fn().mockReturnValue([]),
      sizeColumnsToFit: jest.fn()
    } as any;

    fixture.detectChanges(); 
  });

  it('should create and initialize forms', () => {
    expect(component).toBeTruthy();
    expect(component.filterForm).toBeDefined();
    expect(component.editForm).toBeDefined();
  });

  it('should call service on search', () => {
    component.onSearch();
    expect(mockService.getCheckerData).toHaveBeenCalled();
  });
});