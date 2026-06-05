tasks$: Observable<ECETaskWithAnswers[]> = combineLatest([
    this.store.select(TasksSelectors.getTasksResult),
    this.taskConfig.currentStep$,
    this.store.select(CaseSelectors.getCaseResidenceOnDOD),
    this.store.select(CaseSelectors.getCaseResult)
  ]).pipe(
    map(([questions, currentStep, residence, caseData]) => {
      this.makeFormPristine();
      
      // Filter out tasks by jurisdiction using the residence from the store selector
      const filteredQuestions = this.jurisdictionFilterService.filterTasksByJurisdiction(questions || [], residence || '');
      
      const allQuestions: ECETaskWithAnswers[] = filteredQuestions.map(