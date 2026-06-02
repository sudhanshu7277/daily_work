// Line 169-171 - BROKEN
this.canContinueActive =
  tasks.filter((task) =>
    this.caseVersion ? task.state === TaskStateNewCases.ACTIVE :
    TaskState.ACTIVE).length === 0;

// FIXED
this.canContinueActive =
  tasks.filter((task) =>
    this.caseVersion 
      ? task.state === TaskStateNewCases.ACTIVE 
      : task.state === TaskState.ACTIVE
  ).length === 0;

// Line 173-176 - same fix
this.canContinueComplete =
  tasks.filter((task) =>
    this.caseVersion 
      ? task.state === TaskStateNewCases.COMPLETE 
      : task.state === TaskState.COMPLETE
  ).length !== 0;