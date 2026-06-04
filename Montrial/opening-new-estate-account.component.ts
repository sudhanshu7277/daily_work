// Final fixes for opening-new-estate-account.component.ts:
//Fix 1 — Replace tasks$ and allTasks$ with direct store subscription like the working component. Around lines 75-128:

// REMOVE tasks$ Observable declaration
// REMOVE allTasks$ Observable declaration  
// REMOVE tasksManager$ Observable declaration

// ADD this.tasks as plain array (line ~69 area, after canContinueComplete)
tasks: ECETask[] = [];

// In setupTasks(), ADD after the caseResult$ subscription (after line 108):
this.store
  .select(TasksSelectors.getTasksResult)
  .pipe(takeUntil(this.complete$))
  .subscribe((arr) => {
    const jurisdictionFiltered =
      this.jurisdictionFilterService.filterTasksByJurisdiction(
        arr, 
        this.primaryResidenceOnDod || ''  // need to add this property too
      );
    this.tasks = jurisdictionFiltered; // ✅ no type filtering
  });


  // Fix 2 — step1Events() — remove caseVersion ternary, use this.tasks directly:


  // BEFORE (broken)
this.canContinueActive =
tasks.filter((task) =>
  this.caseVersion
    ? task.state === TaskStateNewCases.ACTIVE
    : task.state === TaskState.ACTIVE
).length === 0;

this.canContinueComplete =
tasks.filter((task) =>
  this.caseVersion
    ? task.state === TaskStateNewCases.COMPLETE
    : task.state === TaskState.COMPLETE
).length !== 0;

// AFTER — match working component pattern
this.canContinueActive =
this.tasks.filter((task) => task.state === TaskState.ACTIVE)
  .length === 0;

this.canContinueComplete =
this.tasks.filter((task) => task.state === TaskState.COMPLETE)
  .length !== 0;


  // Fix 3 — HTML template, replace all async pipe bindings with plain tasks:

  <!-- Step 1 — line 32, BEFORE -->
<div *ngFor="let task of tasks$ | async; index as i">

<!-- AFTER -->
<div *ngFor="let task of tasks; index as i">

<!-- Step 2 — line 63, BEFORE -->
[tasks]="tasksManager$ | async"

<!-- AFTER -->
[tasks]="tasks"

<!-- Step 3 — line 74, BEFORE -->
[tasks]="allTasks$ | async"

<!-- AFTER -->
[tasks]="tasks"