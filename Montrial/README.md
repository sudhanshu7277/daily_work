# BmoLegal

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.21.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


Entity Grid description:
------------------------

Entity Grid — Feature Description
The Entity Grid is a hierarchical AG Grid component within a Legal Hold management application. It displays corporate entity profiles in clustered, multi-level tree structures with search, expand/collapse, selection and pagination capabilities.

Acceptance Criteria:
--------------------

Grid loads all entity clusters on landing via GET /api/v1/entity-grid
User searches by profileName via POST /api/v1/entity-grid/search — only matching clusters returned
Parent rows show light blue #dce9ec background when expanded, white when collapsed
Leaf rows always white, indented 20px per nesting level
Chevron indicates expanded ∧ / collapsed ∨ state
Selecting a parent cascades selection to all children
Selecting all children auto-selects the parent
Selected records emitted to parent component and displayed in Selected Profiles panel
Pagination shows range (1-10 of 100), items per page (10/25/50/100) and dynamic page buttons with ellipsis


UI Flow:
--------

Land — User arrives on the page. Grid loads all clusters fully expanded.
Search — User types Corp 4 and clicks Search. Grid reloads showing only the Corp 4 cluster via POST API.
Browse — User sees Corp 4 → Corp 5 → Corp 6 → Role Players. User can collapse/expand any parent by clicking its row.
Select single record — User checks Role Player H. That record appears in the Selected Profiles panel.
Select entire cluster — User checks Corp 4. All children auto-select and the full cluster appears in Selected Profiles panel.
Deselect — User unchecks Role Player H. Corp 4 auto-deselects since not all children are selected.
Paginate — User clicks page 2 or changes items per page to 25. Range label updates to 11-25 of 100. User can navigate Previous/Next or jump directly to any page number.




Jira 1: Implement Dynamic Customer Search Form
Summary: Develop a responsive search interface to retrieve individual customer profiles and their associated hierarchical structures.

Description:
Implementation of the Customer Search module using Angular Reactive Forms. The form must handle real-time validation and state synchronization with the Legal Hold Dashboard results grid.

Features:

Flexible Identifiers: Supports searching via OCIF ID, Primary Phone, or Name.

Smart Validation: Submit button state is programmatically tied to form validity (Minimum 1 valid identifier required).

Grid Sync: On submit, the form triggers a filtered refresh of the AG Grid using the recursive flattening engine.

User Flow:

User enters data into an identifier field.

Form evaluates Validators; the Search button enables and turns "BMO Blue" once criteria are met.

Clicking Search emits the criteria to the LegalHoldDataService.

Acceptance Criteria:

[ ] Submit button is disabled if the form is empty or invalid.

[ ] "Clear" button resets all form fields and empties the AG Grid.

[ ] Pressing "Enter" while focused on an input triggers the search action.



Jira 2: Implement Dynamic Entity Search Form
Summary: Develop a specialized search module for corporate entities, subsidiaries, and complex organizational hierarchies.

Description:
Implementation of the Entity Search module to support high-density corporate data lookup. This form must account for specific entity identifiers that differ from individual customer searches.

Features:

Corporate Identifiers: Fields for Legal Entity Name, Incorporation/Registration Number, and Proxy ID.

Hierarchical Awareness: Integrated logic to ensure search results pull not just the entity, but its parent/child relationship tree.

Masking & Patterns: Regex validation for specific corporate registration number formats.

User Flow:

User enters a Corporate Name or Registration Number.

The form validates the pattern; the Search button enables upon meeting minimum character thresholds.

Search results populate the grid with "Blue Sandwich" visual clustering for expanded hierarchies.

Acceptance Criteria:

[ ] Form supports multi-level recursive unrolling in the results grid upon search.

[ ] Validation prevents submission of incomplete registration numbers.

[ ] Loading spinner displays within the grid container during the API call.



Jira 3: Implement Legal Hold Search & Monitoring FormSummary: Develop the administrative search interface for managing, monitoring, and filtering existing Legal Holds.Description:Implementation of the Legal Hold Search module to retrieve records based on specific hold metadata rather than customer identifiers.Features:Hold Metadata: Searchable by Legal Hold Name, Case Number, or internal Hold ID.Status Toggles: Dynamic filtering for "Active," "Pending," and "Released" hold statuses.Cascade Highlighting: Results must show all entities currently impacted by the searched Legal Hold across all $n$-levels.User Flow:User inputs a Hold Name or selects a status filter.The UI enables the Search button once a valid case or hold identifier is recognized.Clicking Search updates the grid to show rows mapped to that specific legal action.

Acceptance Criteria:

[ ] Search filters accurately through $n$-level nested data.

[ ] Results maintain correct indentation and vertical guide lines in the grid.

[ ] Search results persist even after expanding/collapsing nodes in the hierarchy.

