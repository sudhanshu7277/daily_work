import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CheckerFormComponent } from './checker-form.component';
import { CheckerComponentInput } from '../../models/pain001.model';

const mockInput: CheckerComponentInput = {
  applicationName:   'ADR',
  applicationModule: 'ADR',
  region:            'US',
  checkerGetUrl:     '/api/v1/pain001/checker/get',
  checkerActionUrl:  '/api/v1/pain001/checker/action'
};

describe('CheckerFormComponent', () => {
  let component: CheckerFormComponent;
  let fixture: ComponentFixture<CheckerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckerFormComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckerFormComponent);
    component = fixture.componentInstance;
    component.checkerInput = mockInput;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in loading state', () => {
    expect(component.isLoading).toBe(true);
  });

  it('all form controls should be disabled', () => {
    const controls = component.form.controls;
    Object.keys(controls).forEach(key => {
      expect(controls[key].disabled).toBe(true);
    });
  });

  it('should not be actioning by default', () => {
    expect(component.isActioning).toBe(false);
    expect(component.pendingAction).toBeNull();
  });

  it('should emit actionCompleted after approve', (done) => {
    setTimeout(() => {
      component.actionCompleted.subscribe(res => {
        expect(res.action).toBe('APPROVED');
        expect(res.success).toBe(true);
        done();
      });
      component.onAction('APPROVED');
    }, 1000);
  });
});
