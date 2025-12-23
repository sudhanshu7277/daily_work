import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-ppa-entry',
  templateUrl: './ppa-entry.component.html',
  styleUrls: ['./ppa-entry.component.scss']
})
export class PpaEntryComponent implements OnInit {
  tabs = [
    { key: 'input', title: 'Input' },
    { key: 'checker1', title: 'Authorise - Checker 1' },
    { key: 'checker2', title: 'Authorise - Checker 2' },
    { key: 'checker3', title: 'Authorise - Checker 3' },
    { key: 'checker4', title: 'Authorise - Checker 4' },
    { key: 'resubmit', title: 'Authorise - Resubmit/Unsubmitted Deleted Payment' }
  ];

  activeTabKey: string = 'input';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Sync active tab with current URL on load
    this.route.firstChild?.url.subscribe(segments => {
      const path = segments[0]?.path;
      if (path && this.tabs.some(tab => tab.key === path)) {
        this.activeTabKey = path;
      }
    });
  }

  // Optional: If you still want to handle tab clicks programmatically
  onTabChange(key: string) {
    if (key === this.activeTabKey) return;
    this.activeTabKey = key;
    this.router.navigate([key], { relativeTo: this.route });
  }
}








// @Component({...})
// export class PpaEntryComponent implements OnInit {
//   tabs = [
//     { key: 'input', title: 'Input', disabled: false },
//     { key: 'checker-1', title: 'Authorise - Checker 1', disabled: false },
//     { key: 'checker-2', title: 'Authorise - Checker 2', disabled: false },
//     // Add more as needed, e.g. { key: 'checker-3', title: 'Authorise - Checker 3' }
//   ];

//   activeTabKey: string = 'input';

//   constructor(
//     private router: Router,
//     private route: ActivatedRoute
//   ) {}

//   ngOnInit() {
//     // Optional: sync active tab with current child route
//     this.route.firstChild?.url.subscribe(segments => {
//       const path = segments[0]?.path;
//       if (path) {
//         this.activeTabKey = path;
//       }
//     });
//   }

//   onTabChange(key: string) {
//     if (key === this.activeTabKey) return; // avoid unnecessary navigation

//     this.activeTabKey = key;
//     this.router.navigate([key], { relativeTo: this.route });
//   }
// }