allTasks$ = combineLatest([
    this.store.select(TasksSelectors.getTasksResult),
    this.store.select(CaseSelectors.getCaseResidenceOnDOD)
  ]).pipe(
    map(([tasks, residence]) => {
      // FIX 1: Provide a fallback string so the jurisdiction filter doesn't discard everything if residence is missing
      const filtered = this.jurisdictionFilterService.filterTasksByJurisdiction(tasks, residence || '');
      return filtered;
    }),
    tap((tasks) => {
      this.tasks = tasks;
    })
  );
  
  tasksManager$ = combineLatest([
    this.store.select(TasksSelectors.getTasksResult),
    this.store.select(CaseSelectors.getCaseResidenceOnDOD)
  ]).pipe(
    map(([tasks, residence]) => {
      // FIX 2: Mirror the safe string fallback here
      const filtered = this.jurisdictionFilterService.filterTasksByJurisdiction(tasks, residence || '');
      
      // FIX 3: Keep BOTH 'task' and 'qualifier' records so your Step 1 HTML form controls have data to loop over
      return filtered.filter((question) => question.type === TaskType.TASK || question.type === 'qualifier');
    })
  );