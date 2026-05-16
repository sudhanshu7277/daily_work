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