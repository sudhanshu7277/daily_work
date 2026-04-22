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

