activeRadioButtonValueBasedOnCaseVersion(taskName: any) {
    // If caseVersion is truthy (handles null, undefined, false, "")
    if (this.caseVersion) {
      return Object.fromEntries([[taskName, TaskStateNewCases.ACTIVE]]);
    } else {
      return Object.fromEntries([[taskName, TaskState.ACTIVE]]);
    }
  }
  
  completeRadioButtonValueBasedOnCaseVersion(taskName: any) {
    if (this.caseVersion) {
      return Object.fromEntries([[taskName, TaskStateNewCases.COMPLETE]]);
    } else {
      return Object.fromEntries([[taskName, TaskState.COMPLETE]]);
    }
  }
  
  naRadioButtonValueBasedOnCaseVersion(taskName: any) {
    if (this.caseVersion) {
      return Object.fromEntries([[taskName, TaskStateNewCases.NA]]);
    } else {
      return Object.fromEntries([[taskName, TaskState.NA]]);
    }
  }


  // The SCSS Style Enforcement (radio-button-group.component.scss)

  /* Base Styling for the Radio Box Item */
.fdc-radio-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    padding: 0 16px;
    border: 1px solid #999999;
    border-radius: 4px;
    background-color: #ffffff;
    color: #333333;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  
    /* Target the active/selected state rendered by the parent group attribute */
    &.is-selected,
    &[aria-checked="true"],
    &.active {
      background-color: #004c97 !important; /* Dark Blue BMO Fill */
      border-color: #004c97 !important;
      color: #ffffff !important;            /* White Text Font */
      font-weight: 600;
    }
  }


  ///// LATEST TASK STATE LOGIC (CASE VERSION) — INSTRUCTIONS LIST COMPONENT

  <div class="radio-group-wrapper">
  
  <fdc-radio-button 
    [value]="activeRadioButtonValueBasedOnCaseVersion(task.taskName)"
    [class.active-state]="isButtonActiveState(task.taskName)"
    [formControlName]="task.taskName">
    {{ caseVersion ? 'Waiting for Documentation' : 'Active' }}
  </fdc-radio-button>

  <fdc-radio-button 
    [value]="completeRadioButtonValueBasedOnCaseVersion(task.taskName)"
    [formControlName]="task.taskName">
    Complete
  </fdc-radio-button>

  <fdc-radio-button 
    [value]="naRadioButtonValueBasedOnCaseVersion(task.taskName)"
    [formControlName]="task.taskName">
    N/A
  </fdc-radio-button>

</div>


// 2. The TypeScript Evaluation (open-tasks.component.ts)


/**
 * Evaluates whether the current row's task control is in an 'Active' state on load
 */
isButtonActiveState(taskName: string): boolean {
    const currentControlValue = this.tasksFormGroup.get(taskName)?.value;
    
    if (!currentControlValue) {
      return false;
    }
  
    // Determine what the target active value string is based on version
    const expectedActiveValue = this.caseVersion 
      ? TaskStateNewCases.ACTIVE       // Equals 'Waiting for Documentation'
      : TaskState.ACTIVE;              // Equals 'Active'
  
    // Match against the nested object structure: { [taskName]: stateValue }
    return currentControlValue[taskName] === expectedActiveValue;
  }


  // 3. The Isolated SCSS Overrides (open-tasks.component.scss)


  /* Use ::ng-deep to break encapsulation and apply style to the rendered host directly */
::ng-deep {
    fdc-radio-button {
      /* Base styles for unselected sibling buttons */
      background-color: #ffffff;
      color: #333333;
      border: 1px solid #999999;
  
      /* STRICT TARGET: Only the element containing our custom active-state class */
      &.active-state {
        background-color: #004c97 !important; /* Dark Blue BMO Fill */
        border-color: #004c97 !important;
        color: #ffffff !important;            /* White Text Font */
        font-weight: 600 !important;
  
        /* If fdc-radio-button renders an internal native element like a button or div wrapper */
        div, button, .fdc-radio-inner {
          background-color: #004c97 !important;
          border-color: #004c97 !important;
          color: #ffffff !important;
        }
      }
    }
  }