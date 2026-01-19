import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectionPanelComponent } from './selection-panel.component';
import { By } from '@angular/platform-browser';

describe('SelectionPanelComponent', () => {
  let component: SelectionPanelComponent;
  let fixture: ComponentFixture<SelectionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionPanelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show "No profiles selected" when the list is empty', () => {
    component.selectedProfiles = [];
    fixture.detectChanges();
    
    const placeholder = fixture.debugElement.query(By.css('.placeholder-text'));
    expect(placeholder.nativeElement.textContent).toContain('No profiles selected');
  });

  it('should show the correct count when profiles are selected', () => {
    component.selectedProfiles = [
      { legalName: 'Jane Doe', ocifId: '123' },
      { legalName: 'John Smith', ocifId: '456' }
    ];
    fixture.detectChanges();

    const countText = fixture.debugElement.query(By.css('.count-text')).nativeElement.textContent;
    expect(countText).toContain('2 profile(s) selected');
  });

  it('should render a card for each selected profile', () => {
    component.selectedProfiles = [
      { legalName: 'Jane Doe', ocifId: '123' },
      { legalName: 'John Smith', ocifId: '456' }
    ];
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('.profile-card'));
    expect(cards.length).toBe(2);
    expect(cards[0].nativeElement.textContent).toContain('Jane Doe');
    expect(cards[1].nativeElement.textContent).toContain('John Smith');
  });

  it('should emit removeProfile event when "X" is clicked', () => {
    const mockProfile = { legalName: 'Jane Doe', ocifId: '123' };
    component.selectedProfiles = [mockProfile];
    fixture.detectChanges();

    spyOn(component.removeProfile, 'emit');

    const removeBtn = fixture.debugElement.query(By.css('.remove-icon'));
    removeBtn.nativeElement.click();

    expect(component.removeProfile.emit).toHaveBeenCalledWith(mockProfile);
  });

  it('should disable footer buttons when no profiles are selected', () => {
    component.selectedProfiles = [];
    fixture.detectChanges();

    const releaseBtn = fixture.debugElement.query(By.css('.btn-release')).nativeElement;
    const applyBtn = fixture.debugElement.query(By.css('.btn-apply')).nativeElement;

    expect(releaseBtn.disabled).toBeTrue();
    expect(applyBtn.disabled).toBeTrue();
  });

  it('should enable footer buttons when profiles are present', () => {
    component.selectedProfiles = [{ legalName: 'Jane Doe', ocifId: '123' }];
    fixture.detectChanges();

    const releaseBtn = fixture.debugElement.query(By.css('.btn-release')).nativeElement;
    const applyBtn = fixture.debugElement.query(By.css('.btn-apply')).nativeElement;

    expect(releaseBtn.disabled).toBeFalse();
    expect(applyBtn.disabled).toBeFalse();
  });
});