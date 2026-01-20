import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarNavComponent } from './sidebar-nav.component';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';

describe('SidebarNavComponent', () => {
  let component: SidebarNavComponent;
  let fixture: ComponentFixture<SidebarNavComponent>;
  let router: Router;
  // Create a Subject to simulate Router events
  const routerEventsSubject = new Subject<any>();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone components go in imports
      imports: [
        SidebarNavComponent,
        RouterTestingModule
      ],
      providers: [
        {
          provide: Router,
          useValue: {
            url: '/ppa-entry/create',
            events: routerEventsSubject.asObservable()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarNavComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle sidebar state', () => {
    expect(component.isCollapsed).toBe(false);
    component.toggleSidebar();
    expect(component.isCollapsed).toBe(true);
  });

  it('should expand the correct nav item based on the URL on init', () => {
    // Manually trigger the state update for the constructor URL
    component.ngOnInit();
    
    // Check if 'PPA Entry' item is expanded because URL is '/ppa-entry/create'
    const ppaEntryItem = component.navItems.find(item => item.label === 'PPA Entry');
    expect(ppaEntryItem?.expanded).toBe(true);
  });

  it('should update expanded state when a NavigationEnd event occurs', () => {
    // Simulate navigating to Threshold Configuration
    const navEvent = new NavigationEnd(1, '/threshold-configuration/view', '/threshold-configuration/view');
    routerEventsSubject.next(navEvent);

    const thresholdItem = component.navItems.find(item => item.label === 'Threshold Configuration');
    expect(thresholdItem?.expanded).toBe(true);
  });

  it('should toggle item expansion when toggleExpand is called', () => {
    const mockItem = component.navItems[1]; // PPA Entry
    const initialstate = mockItem.expanded;
    
    component.toggleExpand(mockItem);
    expect(mockItem.expanded).toBe(!initialstate);
  });
});