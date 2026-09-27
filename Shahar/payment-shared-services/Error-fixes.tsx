// In selection-panel.component.scss (or your modal dialog SCSS file)
// Locate the .bmo-apply-hold-dialog .bmo-modal-container 
// .table-scroll-viewport ruleset and apply the standard 8px 
// scrollbar styles matching the rest of the app:


.bmo-apply-hold-dialog .bmo-modal-container .table-scroll-viewport {
  max-height: 210px;
  overflow-y: auto;
  overflow-x: hidden;

  /* Firefox standard width */
  scrollbar-width: auto;
  scrollbar-color: #888888 #f1f1f1;

  /* WebKit / Chromium (Chrome, Edge) */
  &::-webkit-scrollbar {
    width: 8px; /* Increases thickness from thin hairline to standard visible bar */
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888888;
    border-radius: 4px;

    &:hover {
      background: #555555;
    }
  }
}



// If the dialog is rendered inside an overlay outside the 
// component's encapsulated scope, wrap it in ::ng-deep:


::ng-deep .bmo-apply-hold-dialog .bmo-modal-container .table-scroll-viewport {
  scrollbar-width: auto;
  scrollbar-color: #888888 #f1f1f1;

  &::-webkit-scrollbar {
    width: 8px !important;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1 !important;
    border-radius: 4px !important;
  }

  &::-webkit-scrollbar-thumb {
    background: #888888 !important;
    border-radius: 4px !important;

    &:hover {
      background: #555555 !important;
    }
  }
}