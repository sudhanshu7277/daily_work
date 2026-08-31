git commit --allow-empty -m "chore: trigger CI build for IS-74377"
git push origin feature/IS-74377-Integration-maker-file-viewer




.showing-label {
  /* Fixed column width so chips never touch or cross it */
  width: 80px !important;
  min-width: 80px !important;
  max-width: 80px !important;
  flex: 0 0 80px !important; /* Locks width completely */

  /* Clear negative margins cutting off the letter 'S' */
  margin: 8px 12px 0 0 !important;
  padding: 0 !important;

  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.2;
  white-space: nowrap;
  text-align: left;
  box-sizing: border-box;
}