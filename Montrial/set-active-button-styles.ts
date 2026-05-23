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