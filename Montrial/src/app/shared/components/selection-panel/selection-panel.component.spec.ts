import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionPanelComponent } from './selection-panel.component';

describe('SelectionPanelComponent', () => {
  let component: SelectionPanelComponent;
  let fixture: ComponentFixture<SelectionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render selected row count', () => {
    component.selectedRows = [
      { id: 'row-1', legalName: 'Jane Doe', ocifId: '123' },
      { id: 'row-2', legalName: 'John Smith', ocifId: '456' },
    ];
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('2 profile(s) selected');
  });

  it('should emit removeProfile from onRemove', () => {
    const row = { id: 'row-1', legalName: 'Jane Doe', ocifId: '123' };
    spyOn(component.removeProfile, 'emit');

    component.onRemove(row);

    expect(component.removeProfile.emit).toHaveBeenCalledWith(row);
  });
});
