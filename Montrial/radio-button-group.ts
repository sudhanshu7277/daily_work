
  capturingRadioButtonClick(event: any) {
    if (!this.tasksForm.value.taskArray) {
      this.tasksForm.value.taskArray = [];
    }
  
    // 1. Get the dynamic key name from the incoming event (e.g., 'declarationOfHeirship')
    const incomingKey = Object.keys(event)[0];
  
    // 2. Find if this task key already exists in your pre-populated array
    const existingIndex = this.tasksForm.value.taskArray.findIndex(
      (item: any) => item && item[incomingKey] !== undefined
    );
  
    if (existingIndex !== -1) {
      // 3. Update the existing object's value in place
      this.tasksForm.value.taskArray[existingIndex][incomingKey] = event[incomingKey];
    } else {
      // Fallback: If it wasn't pre-populated, push it
      this.tasksForm.value.taskArray.push(event);
    }
  
    // 4. Ensure Angular marks the form tree statuses properly
    this.tasksForm.markAsDirty();
    this.tasksForm.markAsTouched();
  }



  // updated submitActiveTasks function
  submitActiveTasks() {
    if (this.tasksForm.dirty && this.tasksForm.touched) {
      console.log('this.tasksForm values : ', this.tasksForm.value);
      
      let hasTasks = false;
  
      // 1. Evaluate the complete tracking state rule based on caseVersion
      const isNewCase = this.caseVersion !== null;
      const COMPLETE_STATE = isNewCase ? TaskStateNewCases.COMPLETE : TaskState.COMPLETE;
  
      // 2. Map using the stable originalIndex to prevent array element shifting
      const mappedTasks = this.tasks
        .map((task, originalIndex) => {
          const formControlValue = this.tasksForm.value.taskArray[originalIndex];
          
          // Skip if this row control is missing or hasn't been evaluated
          if (!formControlValue) {
            return null;
          }
  
          const formState = formControlValue[task.name];
          
          // Skip if the specific task key value inside the object is missing
          if (formState === undefined || formState === null) {
            return null;
          }
  
          hasTasks = true;
  
          return {
            ...task,
            isIrregular:
              task.isIrregular === TaskIrregular.IRREGULAR &&
              formState !== task.state &&
              formState === COMPLETE_STATE
                ? TaskIrregular.CORRECTED
                : task.isIrregular,
            state: formState, // Resolves seamlessly to 'na', 'uploaded', or 'complete'
          };
        })
        .filter(task => task !== null); // 3. Cleanly strip out untouched array rows last
  
      const eCETaskBody = {
        name: this.categoryName,
        tasks: mappedTasks
      };
  
      if (hasTasks) {
        this.submitTasks.emit({
          eCETaskBody,
          isUpdate: true,
        });
      }
    }
  }


  setNotApplicableTasks(_tasks: ECETask[]) {
    console.log('received tasks in setNotApplicableTasks function : ', _tasks);
    
    // Determine enum configuration dynamically based on caseVersion presence
    const isNewCase = this.caseVersion !== null && this.caseVersion !== undefined;
    const NA_STATE = isNewCase ? TaskStateNewCases.NA : TaskState.NA;

    this.notApplicableTasks = _tasks.filter(
      (task) => task.state === NA_STATE
    );
  }

  setCompletedTasks(_tasks: ECETask[]) {
    console.log('received tasks in setCompletedTasks function : ', _tasks);
    
    const isNewCase = this.caseVersion !== null && this.caseVersion !== undefined;
    const COMPLETE_STATE = isNewCase ? TaskStateNewCases.COMPLETE : TaskState.COMPLETE;

    this.completedTasks = _tasks.filter(
      (task) => task.state === COMPLETE_STATE
    );
  }

  setActiveTasks(_tasks: ECETask[]) {
    console.log('received tasks in setActiveTasks function : ', _tasks);
    
    const isNewCase = this.caseVersion !== null && this.caseVersion !== undefined;
    const ACTIVE_STATE = isNewCase ? TaskStateNewCases.ACTIVE : TaskState.ACTIVE;

    this.activeTasks = _tasks.filter(
      (task) => task.state === ACTIVE_STATE
    );
  }