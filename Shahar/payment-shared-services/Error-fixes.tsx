// File 1: selection-panel.component.html
// In image_19.png, update lines 27–32:

<span
  class="suspect-icon"
  matTooltipPosition="right"
  matTooltip="Suspect profile(s) found for this profile&#10;Search for the profile separately to make sure all associated profile(s) are selected."
  matTooltipClass="suspect-tooltip"
>!</span>


//File 2: selection-panel.component.scss
// 1. Fix .profile-name-wrap (Line 75–81


.profile-name-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  width: fit-content;
}


//2. Replace lines 138–142 in


::ng-deep {
  .mat-mdc-tooltip.suspect-tooltip {
    overflow: visible !important;
  }

  .mat-mdc-tooltip.suspect-tooltip .mdc-tooltip__surface,
  .mat-tooltip.suspect-tooltip {
    background-color: #ffffff !important;
    color: #2b2b2b !important;
    border-radius: 6px !important;
    padding: 14px 18px !important;
    max-width: 300px !important;
    font-size: 13.5px !important;
    line-height: 1.45 !important;
    white-space: pre-line !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.16) !important;
    overflow: visible !important;
    position: relative !important;
    text-align: left !important;

    /* Bold first heading line */
    &::first-line {
      font-weight: 700 !important;
      color: #000000 !important;
    }

    /* Left pointer notch pointing back toward the orange icon */
    &::before {
      content: '';
      position: absolute;
      top: 14px;
      left: -10px;
      width: 0;
      height: 0;
      border-top: 7px solid transparent;
      border-bottom: 7px solid transparent;
      border-right: 10px solid #ffffff;
      filter: drop-shadow(-2px 0 1px rgba(0, 0, 0, 0.05));
    }
  }
}