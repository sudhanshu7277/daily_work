import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputComponent],
      imports: [FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    inputEl = fixture.nativeElement.querySelector('input');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should bind value and emit changes', () => {
    spyOn(component.valueChange, 'emit');
    inputEl.value = 'test';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value).toBe('test');
    expect(component.valueChange.emit).toHaveBeenCalledWith('test');
  });

  it('should handle keydown for allowed keys', () => {
    const preventSpy = spyOn(KeyboardEvent.prototype, 'preventDefault');
    const event = new KeyboardEvent('keydown', { key: 'a' });  // Disallowed example

    component.onKeyDown(event);
    expect(preventSpy).toHaveBeenCalled();
  });

  it('should allow number keys on keydown', () => {
    const preventSpy = spyOn(KeyboardEvent.prototype, 'preventDefault');
    const event = new KeyboardEvent('keydown', { key: '5' });

    component.onKeyDown(event);
    expect(preventSpy).not.toHaveBeenCalled();
  });
});