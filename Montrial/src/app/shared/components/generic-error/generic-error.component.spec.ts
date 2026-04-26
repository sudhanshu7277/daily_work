import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenericErrorComponent } from './generic-error.component';

describe('GenericErrorComponent', () => {
  let component: GenericErrorComponent;
  let fixture: ComponentFixture<GenericErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericErrorComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the passed error message', () => {
    component.message = 'Test Error Message';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-message')?.textContent).toContain('Test Error Message');
  });
});