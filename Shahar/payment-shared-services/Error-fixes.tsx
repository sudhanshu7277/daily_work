git commit --allow-empty -m "chore: trigger CI build for IS-74377"
git push origin feature/IS-74377-Integration-maker-file-viewer




.chips-row {
  display: flex !important;
  align-items: flex-start !important;
  margin-bottom: 20px;
  padding-left: 0 !important;
  margin-left: 0 !important;

  .showing-label {
    /* Auto width snaps it flush with the container boundary ('Results') */
    width: auto !important;
    min-width: unset !important;
    max-width: unset !important;
    flex: 0 0 auto !important;

    /* Flush with Results & Search result filter */
    padding: 0 !important;
    /* 8px right margin brings 'Profile Name' tight and close */
    margin: 6px 8px 0 0 !important;

    font-size: 14px;
    font-weight: 400 !important; /* Regular font weight */
    color: #1a1a1a;
    line-height: 1.2;
    white-space: nowrap;
    text-align: left;
  }

  .chips-list {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center;
    gap: 10px 8px; /* 10px vertical row gap, 8px horizontal chip gap */
    flex: 1 1 auto !important;
    min-width: 0 !important;
  }
}