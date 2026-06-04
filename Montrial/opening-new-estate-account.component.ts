tasks$: Observable<ECETaskWithAnswers[]> = combineLatest([
    this.store.select(TasksSelectors.getTasksResult),
    this.taskConfig.currentStep$,
  ]).pipe(
    map(([questions, currentStep]) => {
      this.makeFormPristine();
      this.allQuestions = questions;
  
      // --- START DROP-IN FIX ---
      // Safely assign this.tasks for your step navigation checks using the existing jurisdiction logic
      const residenceStr = this.primaryResidenceOnDod || '';
      this.tasks = this.jurisdictionFilterService.filterTasksByJurisdiction(questions || [], residenceStr);
      // --- END DROP-IN FIX ---
  
      if (this.allQuestions && this.allQuestions.length > 0) {
        this.stepQuestions = this.allQuestions.filter(
          (q) => q.step === currentStep
        );
        
        // Keep your existing forms/questions matching loops below completely identical...
        this.stepQuestions.forEach((q) => {
          const matchingAnswer = this.answers.find(
            (a) => a.questionId === q.id
          );
          if (matchingAnswer) {
            q.answer = matchingAnswer.answer;
          }
        });
  
        this.createForm(this.stepQuestions);
        return this.stepQuestions;
      }
  
      return [];
    })
  );