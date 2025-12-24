import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';  // Required for programmatic navigation if needed

// @Component({
//   selector: 'app-tab',
//   templateUrl: './tab.component.html',
//   styleUrls: ['./tab.component.scss']
// })

@Component({
    selector: 'app-tab',
    standalone: true,  // This is missing in your code
    imports: [RouterModule, /* other dependencies like CommonModule if needed */],
    templateUrl: './tab.component.html',
    styleUrls: ['./tab.component.scss']
  })
export class TabComponent {
    // New property
    @Input() activeTabKey: string = '';



  @Input() tabs: { key: string, title: string, disabled: boolean }[] = [];
  @Input() activeTabKey: string = '';

  constructor(private router: Router, private tabStateService: TabStateService) {}  // Inject Router if you need to navigate programmatically

  selectTab(key: string, disabled: boolean) {
    if (disabled) {
      // Prevent navigation if disabled
      return;
    }

    // Notify the service
    this.tabStateService.setCurrentTab({ key: tab.key, title: tab.title });
    // Optional: If you need extra logic beyond routerLink, navigate here
    // this.router.navigate([key]);
  }
}

// ADD BELOW IN GLOBAL-HEADER COMPONENT

constructor(private tabStateService: TabStateService) {}

ngOnInit() {
    this.tabStateService.currentTab$.subscribe(tab => {
      this.currentTab = tab;
    });
  }