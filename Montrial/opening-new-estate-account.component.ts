tasks$: Observable<ECETaskWithAnswers[]> = combineLatest([
    this.store.select(TasksSelectors.getTasksResult),
    this.taskConfig.currentStep$,
  ]).pipe(
    map(([questions, currentStep]) => {
      this.makeFormPristine();
      this.allQuestions = questions || [];
  
      if (this.allQuestions && this.allQuestions.length > 0) {
        // FIX: Match on either the step index OR pass qualifiers through safely on Step 1
        this.stepQuestions = this.allQuestions.filter(
          (q) => q.step === currentStep || (currentStep === 1 && q.type === 'qualifier')
        );
  
        this.stepQuestions.forEach((q) => {
          const matchingAnswer = this.answers?.find(
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