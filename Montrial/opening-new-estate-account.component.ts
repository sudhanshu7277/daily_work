allTasks$ = combineLatest([
    this.store.select(TasksSelectors.getTasksResult),
    this.store.select(CaseSelectors.getCaseResidenceOnDOD)
  ]).pipe(
    tap(([rawTasks, residence]) => {
      console.log('DIAGNOSTIC 1: Raw Tasks from Store Selector:', rawTasks);
      console.log('DIAGNOSTIC 2: Residence value from Store Selector:', residence);
    }),
    map(([tasks, residence]) => {
      const filtered = this.jurisdictionFilterService.filterTasksByJurisdiction(tasks, residence || '');
      return filtered;
    }),
    tap((tasks) => {
      console.log('DIAGNOSTIC 3: Final Filtered Tasks hitting component:', tasks);
      this.tasks = tasks;
    })
  );