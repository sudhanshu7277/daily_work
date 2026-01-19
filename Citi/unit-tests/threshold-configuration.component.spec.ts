import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThresholdConfigurationComponent } from './threshold-configuration.component';
import { ThresholdService } from 'path/to/threshold.service';  // Adjust path

describe('ThresholdConfigurationComponent', () => {
  let component: ThresholdConfigurationComponent;
  let fixture: ComponentFixture<ThresholdConfigurationComponent>;
  let serviceSpy: jasmine.SpyObj<ThresholdService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ThresholdService', ['saveThreshold']);
    await TestBed.configureTestingModule({
      declarations: [ThresholdConfigurationComponent],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [{ provide: ThresholdService, useValue: serviceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ThresholdConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with defaults', () => {
    expect(component.thresholdForm).toBeDefined();
    expect(component.thresholdForm.value).toEqual(jasmine.objectContaining({ threshold: null }));  // Adjust to your form fields
  });

  it('should save threshold on valid form submit', () => {
    component.thresholdForm.setValue({ threshold: 100 });  // Mock valid value
    spyOn(component, 'showNotification');

    component.saveThreshold();

    expect(serviceSpy.saveThreshold).toHaveBeenCalledWith(100);
    expect(component.showNotification).toHaveBeenCalledWith('Threshold Saved!', 'success');
  });

  it('should not save on invalid form', () => {
    component.thresholdForm.setValue({ threshold: '' });  // Invalid

    component.saveThreshold();

    expect(serviceSpy.saveThreshold).not.toHaveBeenCalled();
  });
});