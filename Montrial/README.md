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


ENGLISH AND FRENCH

Implementation of Bilingual (EN/FR) Localization Framework
Summary
Integrate a robust Internationalization (i18n) framework to support English and French locales across the Legal Hold Dashboard, ensuring regulatory compliance for multi-language banking environments.

Technical Features
State-Linked Translation: Implemented @ngx-translate to allow instant language toggling without session loss or page refreshes.

Externalized Verbiage: Moved all UI strings to centralized JSON assets (en.json, fr.json) to eliminate hardcoded values.

Dynamic Grid Headers: Utilized AG Grid headerValueGetter to reactively update column titles upon language change.

Adaptive Layout: CSS logic implemented to handle text expansion (French strings often being 20-30% longer) without breaking the "Blue Sandwich" visual clusters.

Implementation Flow
Selection: User toggles EN/FR in the header.

Broadcast: TranslationService updates the global locale state.

UI Refresh: * Forms: Input labels and validation error messages update via the translate pipe.

Data Grid: Headers and status pills (e.g., "Legal Hold" ↔ "Saisie-arrêt") re-render dynamically.

Footers: Dynamic counts (e.g., "Showing 10 results") update to reflect the new locale.

Acceptance Criteria
[ ] Zero Hardcoding: All labels, placeholders, and tooltips must be driven by i18n keys.

[ ] Seamless Toggle: Switching languages must not reset search results or form inputs.

[ ] Grid Localization: AG Grid headers, pinned columns, and custom cell renderers must respect the active language.

[ ] Validation Messages: Error messages for mandatory fields must display in the selected language.

[ ] Contextual Accuracy: Use approved banking terminology for specific French translations (e.g., "Proxy OCIF ID").




Customer Search — AG Grid Implementation

Description
Implement a Customer Search AG Grid that allows users to search for customer profiles by filling out a search form, view results in a clustered hierarchical grid, interact with records via expand/collapse and selection, and pass selected profiles to the Selected Profiles panel.

Acceptance Criteria

Search form has required fields; Search button is disabled until at least one field has a value
On Search click, grid populates via POST /api/v1/customer-search with form payload
Grid displays results in clusters — each cluster has a parent row sandwiched between a light blue top and bottom border
Parent row is expandable/collapsible via chevron ∧ / ∨
Selecting a parent auto-selects all its children; selecting all children auto-selects the parent
Selected records are emitted to the Selected Profiles panel on the top right
Pagination bar shows range, items per page dropdown and dynamic page buttons


User Journey
1. Land on Search Page
User navigates to the Customer Search page. The search form is visible. The grid is empty. The Search button is disabled.
2. Fill Search Form
User fills in one or more fields — e.g. Legal Name: Jane Doe, OCIF ID: 1000-12345. As soon as any field has a value the Search button becomes enabled.
3. Click Search
User clicks Search. The form payload is sent via POST /api/v1/customer-search. The grid populates with matching results grouped into clusters.
4. Browse Grid
Each cluster shows a parent row (e.g. Jane Doe) sandwiched between light blue top and bottom borders. Children (related records) are nested below. By default all clusters are expanded.
5. Expand / Collapse
User clicks the ∨ chevron on a parent row to collapse it — hiding all children. Clicks ∧ to expand and reveal children again.
6. Select a Single Record
User checks the checkbox on an individual child record. That record is added to the Selected Profiles panel on the top right.
7. Select Entire Cluster
User checks the parent row checkbox. All children auto-select. The full cluster appears in the Selected Profiles panel.
8. Deselect
User unchecks a child record. The parent auto-deselects since not all children are selected. That record is removed from the Selected Profiles panel.
9. Paginate
Grid shows 1-10 of 100 on the bottom left. User changes items per page to 25 or clicks page 2 / Next. Range label updates dynamically. User can jump to any page via the page number buttons with ellipsis for large datasets.




mplementation of Bilingual (EN/FR) Localization Framework
==========================================================
Summary
Integrate a robust Internationalization (i18n) framework to support English and French locales across the Legal Hold Dashboard, ensuring regulatory compliance for multi-language banking environments.

Technical Features
State-Linked Translation: Implemented @ngx-translate to allow instant language toggling without session loss or page refreshes.

Externalized Verbiage: Moved all UI strings to centralized JSON assets (en.json, fr.json) to eliminate hardcoded values.

Dynamic Grid Headers: Utilized AG Grid headerValueGetter to reactively update column titles upon language change.

Adaptive Layout: CSS logic implemented to handle text expansion (French strings often being 20-30% longer) without breaking the "Blue Sandwich" visual clusters.

Implementation Flow
Selection: User toggles EN/FR in the header.

Broadcast: TranslationService updates the global locale state.

UI Refresh: * Forms: Input labels and validation error messages update via the translate pipe.

Data Grid: Headers and status pills (e.g., "Legal Hold" ↔ "Saisie-arrêt") re-render dynamically.

Footers: Dynamic counts (e.g., "Showing 10 results") update to reflect the new locale.

Acceptance Criteria: 
[ ] Zero Hardcoding: All labels, placeholders, and tooltips must be driven by i18n keys.

[ ] Seamless Toggle: Switching languages must not reset search results or form inputs.

[ ] Grid Localization: AG Grid headers, pinned columns, and custom cell renderers must respect the active language.

[ ] Validation Messages: Error messages for mandatory fields must display in the selected language.

[ ] Contextual Accuracy: Use approved banking terminology for specific French translations (e.g., "Proxy OCIF ID").




Customer Search Grid — AG Grid Implementation
----------------------------------------------

Description
Implement a Customer Search AG Grid component that mirrors the Entity Grid look and feel. Users search for customer profiles, results are displayed in a clustered grid with parent/child rows, expand/collapse, checkbox selection and pagination. Selected records are passed to the Selected Profiles panel.

Acceptance Criteria

Grid loads on search trigger via POST /api/v1/customer-search with { profileName } payload
Results displayed in clusters — parent row (teal #dce9ec when expanded, white when collapsed) with child rows (white background) sandwiched between light blue cluster borders
No deep nesting — one level of children only, no indentation
Parent row has chevron ∧ / ∨ for expand/collapse
Selecting parent cascades to all children; selecting all children auto-selects parent
Deselecting any child auto-deselects the parent
Selected records emitted via selectionChanged Output to Selected Profiles panel
Pagination bar shows range (1-10 of 100), items per page (10/25/50/100) and dynamic page buttons with ellipsis
Look and feel identical to Entity Grid — same colours, borders, checkboxes, LEGAL HOLD pill, typography


User Journey
1. Land
User navigates to the Customer Search page. Grid is empty. Search input is visible.
2. Search
User types a customer name e.g. Jane Doe into the search input. Clicks Search. POST /api/v1/customer-search fires with { profileName: 'Jane Doe' }. Grid populates with matching clusters.
3. Browse Results
Each cluster shows a parent row (Jane Doe) with a light blue top and bottom cluster border. Child records are listed directly below — no indentation. All clusters expanded by default.
4. Expand / Collapse
User clicks ∨ on a parent row to collapse and hide children. Clicks ∧ to expand and reveal children.
5. Select Single Record
User checks a child row checkbox. That record is added to the Selected Profiles panel.
6. Select Entire Cluster
User checks the parent row checkbox. All children auto-select. Full cluster appears in Selected Profiles panel.
7. Deselect
User unchecks a child. Parent auto-deselects. Record removed from Selected Profiles panel.
8. Paginate
User changes items per page to 25 or navigates to page 2. Range label updates to 11-25 of 100. Previous/Next and direct page number navigation available with ellipsis for large datasets.



ADVANCED SEARCH JIRA:

JIRA Ticket: LH-102 | Implement Advanced Search & Results Filter UI
Description
Implementation of the advanced search criteria and results grid filtering to align with Figma UX requirements. This includes custom-styled form controls, hierarchical data filtering, and grid column management.

User Flow
Initiate Search: User navigates to the "Manage Legal Hold" screen and selects "Individual" or "Entity."

Advanced Criteria: User toggles "ADVANCED SEARCH OPTIONS" to reveal extended fields (Country, Address, DOB, etc.).

Execute Search: User enters criteria (e.g., "Corp 4") and clicks "Search."

View Results: The system filters the nested data source, flattens the tree, and renders matching parent nodes and their children in the AG Grid.

Refine View: User opens the "Display Column" dropdown to toggle specific column visibility.

Implementation Steps Covered
1. Advanced Search Form
Created a collapsible advanced search section using standard HTML5/SCSS.

Implemented custom-styled select and input fields to match BMO design (removing default browser appearance).

Built a custom Date of Birth input with an anchored calendar icon and showPicker() functionality.

2. Search & Filtering Logic
Developed a filterByParentProfileName service function to search the master nested data.

Implemented a recursive tree-flattening utility to ensure AG Grid correctly displays parent-child relationships after filtering.

Applied assignLevels logic to maintain hierarchical indentation and expansion states.

3. Grid Column Management ("Display Column")
Built a custom dropdown (non-Material) for toggling AG Grid column visibility.

Select All Logic:

Implemented a "Master Toggle" with three states: Unchecked, Checked (Blue background + Tick), and Indeterminate (Blue background + White horizontal line).

Syncing: Integrated gridApi.setColumnVisible to show/hide columns dynamically based on selection.

4. Styling & UX Improvements
Standardized colors: BMO Blue (#004C97) and Checkbox Blue (#0079C1).

Implemented custom SVG-based chevrons for all dropdowns to ensure stability across window resizes.

Optimized layout for Developer Tools visibility using box-sizing: border-box and relative positioning.