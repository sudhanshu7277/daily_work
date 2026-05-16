submitActiveTasks() {
    if (this.tasksForm.dirty && this.tasksForm.touched) {
      console.log('this.tasksForm values : ', this.tasksForm.value);
      
      let hasTasks = false;
      const isNewCase = this.caseVersion !== null;
  
      // Determine the correct Enum set based on caseVersion rule
      const COMPLETE_STATE = isNewCase ? TaskStateNewCases.COMPLETE : TaskState.COMPLETE;
  
      const eCETaskBody = {
        name: this.categoryName,
        tasks: this.tasks
          .filter((task) => {
            // Find the interaction event by matching the task name key dynamically
            const taskEvent = this.tasksForm.value.taskArray?.find((t: any) => t && t[task.name] !== undefined);
            return taskEvent !== undefined;
          })
          .map((task) => {
            hasTasks = true;
  
            // Safely extract the dynamically set form state by task name matching
            const taskEvent = this.tasksForm.value.taskArray.find((t: any) => t && t[task.name] !== undefined);
            const formState = taskEvent[task.name];
  
            return {
              ...task,
              isIrregular:
                task.isIrregular === TaskIrregular.IRREGULAR &&
                formState !== task.state &&
                formState === COMPLETE_STATE
                  ? TaskIrregular.CORRECTED
                  : task.isIrregular,
              state: formState, // Resolves to 'na', 'uploaded', 'complete', etc. safely
            };
          })
      };
  
      if (hasTasks) {
        this.submitTasks.emit({
          eCETaskBody,
          isUpdate: true,
        });
      }
    }
  }


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