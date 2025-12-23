@Component({...})
export class PpaEntryComponent implements OnInit {
  tabs = [
    { key: 'input', title: 'Input', disabled: false },
    { key: 'checker-1', title: 'Authorise - Checker 1', disabled: false },
    { key: 'checker-2', title: 'Authorise - Checker 2', disabled: false },
    // Add more as needed, e.g. { key: 'checker-3', title: 'Authorise - Checker 3' }
  ];

  activeTabKey: string = 'input';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Optional: sync active tab with current child route
    this.route.firstChild?.url.subscribe(segments => {
      const path = segments[0]?.path;
      if (path) {
        this.activeTabKey = path;
      }
    });
  }

  onTabChange(key: string) {
    if (key === this.activeTabKey) return; // avoid unnecessary navigation

    this.activeTabKey = key;
    this.router.navigate([key], { relativeTo: this.route });
  }
}