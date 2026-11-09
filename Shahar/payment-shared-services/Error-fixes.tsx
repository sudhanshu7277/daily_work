//Add the following rules to purge-pause.component.scss (or into your global styles.scss):

// Target the Angular Material MDC Dialog Panel for the Edit Modal
::ng-deep .bmo-edit-dialog-panel {
  // 1. Remove background, border, and box-shadow from the outer MDC surfaces
  .mat-mdc-dialog-container,
  .mat-mdc-dialog-inner-container,
  .mat-mdc-dialog-surface {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
    overflow: visible !important;
  }

  // 2. Expand width to match the Figma 3-column layout
  .mat-mdc-dialog-surface {
    width: 780px !important;
    max-width: 90vw !important;
    display: block !important;
  }
}

// Ensure the inner card handles the clean white background and rounded corners
.edit-modal-wrapper {
  background-color: #ffffff !important;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 24px 28px 24px 28px;
  width: 100%;
  box-sizing: border-box;
  font-family: 'BMO Sans', Arial, sans-serif;

  .edit-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .edit-modal-title {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
    }

    .edit-modal-close-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      color: #666666;
      padding: 0;
      display: inline-flex;
      align-items: center;

      &:hover {
        color: #1a1a1a;
      }
    }
  }

  // 3-Column horizontal row matching Figma
  .edit-modal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 24px;

    .edit-col {
      display: flex;
      flex-direction: column;
      position: relative;
      padding-bottom: 20px;

      .edit-label {
        font-size: 13px;
        font-weight: 600;
        color: #333333;
        margin-bottom: 6px;
        white-space: nowrap; // Keeps labels on a single line
      }

      .edit-input {
        background-color: #ffffff !important;
        border: 1px solid #767676;
        border-radius: 4px;
        height: 38px;
        padding: 6px 12px;
        font-size: 13px;
        color: #1a1a1a;
        box-sizing: border-box;
        width: 100%;
        outline: none;

        &:focus {
          border-color: #0079c1;
          box-shadow: 0 0 0 1px #0079c1;
        }

        &.edit-input-readonly {
          background-color: #f4f4f4 !important;
          color: #555555;
          border-color: #d3d3d3;
          cursor: not-allowed;
        }

        &.input-error {
          border-color: #a12000 !important;
          box-shadow: 0 0 0 1px #a12000;
        }
      }

      .edit-field-error {
        position: absolute;
        top: calc(100% - 16px);
        left: 0;
        color: #a12000;
        font-size: 11px;
        font-weight: 500;
        line-height: 1.2;
        white-space: nowrap;
      }
    }
  }

  .edit-modal-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;

    .btn-cancel {
      background: transparent;
      border: none;
      color: #0079c1;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      padding: 8px 14px;
      letter-spacing: 0.3px;
      text-transform: uppercase;

      &:hover {
        text-decoration: underline;
      }
    }

    .btn-save {
      background-color: #0079c1;
      color: #ffffff;
      border: none;
      border-radius: 20px;
      padding: 8px 24px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover {
        background-color: #005a91;
      }
    }
  }
}


//Verify in purge-pause.component.ts that panelClass: 'bmo-edit-dialog-panel' is passed during dialog.open:

this.dialogRef = this.dialog.open(this.editClassActionDialog, {
  width: '780px',
  maxWidth: '90vw',
  panelClass: 'bmo-edit-dialog-panel'
});