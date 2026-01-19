import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display the app title', () => {
    const title = fixture.nativeElement.querySelector('.app-title').textContent;
    expect(title).toContain('Legal Hold Management');
  });

  it('should have navigation links for Legal Hold and Bulk Upload', () => {
    const navItems = fixture.nativeElement.querySelectorAll('.nav-item');
    expect(navItems[0].textContent).toContain('LEGAL HOLD');
    expect(navItems[1].textContent).toContain('BULK UPLOAD');
  });
});