tasks$: Observable<ECETaskWithAnswers[]> = combineLatest([
    this.store.select(TasksSelectors.getTasksResult),
    this.taskConfig.currentStep$,
    this.store.select(CaseSelectors.getCaseResidenceOnDOD),
    this.store.select(CaseSelectors.getCaseResult)
  ]).pipe(
    map(([questions, currentStep, residence, caseData]) => {