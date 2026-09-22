// The Permanent Clean Fix
// 1. Fix the Icon Layout (SCSS)
// Stop .profile-name-wrap from stretching across t
// he row so the icon stays anchored right next to the name where it belongs:

/* In selection-panel.component.scss */
.profile-row {
  display: flex;
  align-items: center;
}

.profile-name-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;       /* Prevents expanding across into the OCIF ID column */
  width: fit-content;
}

.suspect-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #d97706;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}


//2. Position the Tooltip (HTML)
// Tell Angular Material to place the tooltip at 'right'


<span
  class="suspect-icon"
  matTooltipPosition="right"
  matTooltipClass="suspect-tooltip-panel"
  matTooltip="Suspect profile(s) found for this profile&#10;Search for the profile separately to make sure all associated profile(s) are selected."
>!</span>


//3. Styling & Speech Notch (SCSS)

::ng-deep {
  .mat-mdc-tooltip.suspect-tooltip-panel {
    overflow: visible !important;
  }

  .mat-mdc-tooltip.suspect-tooltip-panel .mdc-tooltip__surface,
  .mat-tooltip.suspect-tooltip-panel {
    background-color: #ffffff !important;
    color: #2b2b2b !important;
    border-radius: 6px !important;
    
    /* Dimensions matching Figma card */
    width: 250px !important;
    max-width: 250px !important;
    padding: 16px 18px !important;
    
    font-size: 13.5px !important;
    line-height: 1.5 !important;
    white-space: pre-line !important;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16) !important;
    overflow: visible !important;
    position: relative !important;
    text-align: left !important;

    /* Bold first line (Title) */
    &::first-line {
      font-weight: 700 !important;
      color: #000000 !important;
    }

    /* Arrow on the left edge pointing back to the suspect icon */
    &::before {
      content: '';
      position: absolute;
      top: 14px;
      left: -11px;
      width: 0;
      height: 0;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-right: 11px solid #ffffff;
      filter: drop-shadow(-2px 0 1px rgba(0, 0, 0, 0.05));
    }
  }
}

