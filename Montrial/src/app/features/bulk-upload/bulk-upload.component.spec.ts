import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BulkUploadComponent } from './bulk-upload.component';

describe('BulkUploadComponent', () => {
  let component: BulkUploadComponent;
  let fixture: ComponentFixture<BulkUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkUploadComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BulkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not allow non-spreadsheet files', () => {
    const blob = new Blob([''], { type: 'text/plain' });
    const file = new File([blob], 'test.txt');
    
    spyOn(window, 'alert');
    (component as any).handleFile(file);
    
    expect(component.selectedFile).toBeNull();
    expect(window.alert).toHaveBeenCalledWith(jasmine.any(String));
  });

  it('should accept .csv files', () => {
    const blob = new Blob([''], { type: 'text/csv' });
    const file = new File([blob], 'data.csv');
    
    (component as any).handleFile(file);
    
    expect(component.selectedFile).toEqual(file);
  });
});