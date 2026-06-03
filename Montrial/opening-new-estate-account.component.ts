// 1. Fix the Task Filter Stream (opening-new-estate-account.component.ts)
//Locate your tasksManager$ selector pipeline (around line 127). We need to explicitly allow both 'task' and 'qualifier' types to pass through into your view loop. 
// This prevents Step 1's dynamic questions from being dropped from the DOM array:

this.tasksManager$ = combineLatest([
    this.store.select(TasksSelectors.getTasksResult),
    this.store.select(CaseSelectors.getCaseResidenceOnDOD)
  ]).pipe(
    map(([tasks, residence]) => {
      // 1. Run the base geographic jurisdiction mapping sweep
      const filtered = this.jurisdictionFilterService.filterTasksByJurisdiction(tasks, residence || '');
      
      // 2. THE FIX: Keep both 'task' and 'qualifier' entries so the UI can render your step questions
      return filtered.filter(
        (item) => item.type === TaskType.TASK || item.type === 'qualifier'
      );
    })
  );


  // 2. Update Step 2 Continuation Check (opening-new-estate-account.component.ts)
//Scroll down to your step2Events() configuration method (around line 423). Instead of a standalone file, we will check the enums 
// natively inside the filter. Since caseVersion is null, it will cleanly default to your core TaskState constants:

step2Events() {
    const stepEvents = this.taskConfig.taskFunctions[CategoryNames.openingNewEstateAccount];
    
    stepEvents.continue = of(true).pipe(
      switchMap(() => {
        this.subscriptions.add(
          this.allTasks$.subscribe((tasks) => {
            
            // 1. Safe inline check handling the null case version structure cleanly
            const isNewVersion = this.caseVersion !== null && this.caseVersion !== undefined && this.caseVersion !== '' && this.caseVersion !== false;
            
            const activeTarget = isNewVersion ? TaskStateNewCases.ACTIVE : TaskState.ACTIVE;
            const completeTarget = isNewVersion ? TaskStateNewCases.COMPLETE : TaskState.COMPLETE;
  
            // 2. Verify all workflow tasks/qualifiers across the matrix array collection
            this.canContinueActive = tasks.filter(
              (task) => task.state === activeTarget && (task.type === TaskType.TASK || task.type === 'qualifier')
            ).length === 0;
  
            this.canContinueComplete = tasks.filter(
              (task) => task.state === completeTarget && (task.type === TaskType.TASK || task.type === 'qualifier')
            ).length !== 0;
            
          })
        );
  
        return !this.canContinueActive || !this.canContinueComplete
          ? throwError(() => "error, can't progress to next step")
          : of(true);
      })
    );
  }

  // 3. Update Individual Row Checking (open-tasks.component.ts)
//In your task matrix sub-component, 
//handle the inline evaluation directly against the native enums inside your existing isButtonActiveState method:

isButtonActiveState(index: number, taskName: string): boolean {
    const formArray = this.tasksForm.get('taskArray') as FormArray;
    const controlValue = formArray?.at(index)?.value;
    
    if (!controlValue) return false;
  
    // Handles caseVersion: null fallback inline instantly
    const isNewVersion = this.caseVersion !== null && this.caseVersion !== undefined && this.caseVersion !== '' && this.caseVersion !== false;
    const expectedActiveString = isNewVersion ? TaskStateNewCases.ACTIVE : TaskState.ACTIVE;
  
    return controlValue[taskName] === expectedActiveString;
  }