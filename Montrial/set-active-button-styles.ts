//1. The Template (open-tasks.component.html)
//Use the row index i to check the current control's configuration. We explicitly bind a brand new, isolated class [class.bmo-active-fill] only to the first radio button container.



<div formArrayName="taskArray">
  <div *ngFor="let control of tasksForm.get('taskArray')?.controls; let i = index">
    <fdc-radio-button-group [formControlName]="i">
      
      <fdc-radio-button 
        [value]="activeRadioButtonValueBasedOnCaseVersion(tasks[i].name)"
        [class.bmo-active-fill]="isFirstButtonActive(i, tasks[i].name)"
        [label]="settingLabelForOpenTasksRadioButtons(categoryName, 'active') | translate">
      </fdc-radio-button>

      <fdc-radio-button 
        [value]="completeRadioButtonValueBasedOnCaseVersion(tasks[i].name)"
        [label]="settingLabelForOpenTasksRadioButtons(categoryName, 'complete') | translate">
      </fdc-radio-button>

      <fdc-radio-button 
        [value]="naRadioButtonValueBasedOnCaseVersion(tasks[i].name)"
        [label]="settingLabelForOpenTasksRadioButtons(categoryName, 'na') | translate">
      </fdc-radio-button>

    </fdc-radio-button-group>
  </div>
</div>


// 2. The TypeScript Component (open-tasks.component.ts)
//Add this lightweight helper function to evaluate if the row's form control value matches the expected active state value on render:

isFirstButtonActive(index: number, taskName: string): boolean {
    const formArray = this.tasksForm.get('taskArray') as FormArray;
    const controlValue = formArray?.at(index)?.value;
    
    if (!controlValue) return false;
  
    // Expected active value string depends completely on the case version
    const expectedState = this.caseVersion ? TaskStateNewCases.ACTIVE : TaskState.ACTIVE;
  
    // True if the nested task object match equals the active state string
    return controlValue[taskName] === expectedState;
  }

  /// 3. The Isolated SCSS Overrides (open-tasks.component.scss)
// By targeting .bmo-active-fill via ::ng-deep, we force the host component and any internal structure it renders to display the dark blue theme immediately on layout initialization, completely ignoring whether the component thinks it is clicked or not.//

::ng-deep fdc-radio-button {
    /* Strict style enforcement for our targeted active button element on load */
    &.bmo-active-fill {
      background-color: #004c97 !important; /* BMO Dark Blue */
      border-color: #004c97 !important;
      color: #ffffff !important;
      font-weight: 600 !important;
  
      /* Penetrate deep into whatever container/button/wrapper the library spits out */
      div, button, .fdc-radio-inner, .box-layout, label span {
        background-color: #004c97 !important;
        border-color: #004c97 !important;
        color: #ffffff !important;
      }
    }
  }