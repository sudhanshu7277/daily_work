import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegalHoldShellComponent } from './legal-hold-shell.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LegalHoldShellComponent', () => {
  let component: LegalHoldShellComponent;
  let fixture: ComponentFixture<LegalHoldShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalHoldShellComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LegalHoldShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call performSearch on grid when onSearch is triggered', () => {
    const spy = spyOn(component.resultsGrid, 'performSearch');
    component.onSearch({ query: 'test' });
    expect(spy).toHaveBeenCalled();
  });
});