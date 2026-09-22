//1. In selection-panel.component.html
In selection-panel.component.html (around lines 27–32), configure the tooltip to strictly anchor to the right and disable the boundary auto-flip using


<span
  class="suspect-icon"
  matTooltipPosition="right"
  [matTooltipPositionAtOrigin]="true"
  matTooltipClass="suspect-tooltip"
  matTooltip="Suspect profile(s) found for this profile&#10;Search for the profile separately to make sure all associated profile(s) are selected."
>!</span>



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
    width: 260px !important;
    max-width: 260px !important;
    font-size: 13px !important;
    line-height: 1.45 !important;
    white-space: pre-line !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.16) !important;
    position: relative !important;
    overflow: visible !important;
    text-align: left !important;
    margin-left: 10px !important;
    margin-top: 18px !important; /* Moves the container down */

    /* Bold first heading line */
    &::first-line {
      font-weight: 700 !important;
      color: #000000 !important;
    }

    /* Left pointer notch aligned with the icon center */
    &::before {
      content: '';
      position: absolute;
      top: 10px; /* Aligns notch height with the icon */
      left: -9px;
      width: 0;
      height: 0;
      border-top: 7px solid transparent;
      border-bottom: 7px solid transparent;
      border-right: 9px solid #ffffff;
      filter: drop-shadow(-2px 0 1px rgba(0, 0, 0, 0.04));
    }
  }
}