git commit --allow-empty -m "chore: trigger CI build for IS-74377"
git push origin feature/IS-74377-Integration-maker-file-viewer




.chips-row {
  display: flex !important;
  align-items: flex-start !important;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;

  .showing-label {
    /* Fixed track for Showing: text matching the checkbox column */
    flex: 0 0 auto !important;
    width: 76px !important;
    min-width: 76px !important;

    /* Margin reset to avoid cutting off 'S' and align with first chip row */
    margin: 6px 12px 0 0 !important;
    padding: 0 !important;

    font-size: 14px;
    font-weight: normal !important; /* Regular font weight as requested */
    color: #1a1a1a;
    line-height: 1.2;
    white-space: nowrap;
    text-align: left;
  }

  .chips-list {
    /* Independent flex column next to Showing: */
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center;
    gap: 12px 8px; /* 12px vertical spacing between chip lines, 8px horizontal */
    flex: 1 1 0% !important;
    min-width: 0 !important; /* Forces wrapped rows to stay inside this column */
  }
}