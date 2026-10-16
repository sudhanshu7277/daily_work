//Here are the exact changes across both files.

//1. selection-panel.component.scss
//In selection-panel.component.scss, replace lines 168 through 203 with this exact block:


.mat-mdc-tooltip.suspect-tooltip-selection-panel.mdc-tooltip__surface,
.mat-tooltip.suspect-tooltip-selection-panel {
  background-color: #ffffff !important;
  color: #2b2b2b !important;
  border-radius: 6px !important;
  padding: 12px 16px !important;
  width: 285px !important;
  max-width: 285px !important;
  font-size: 12px !important;
  line-height: 1.45 !important;
  white-space: pre-line !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.16) !important;
  position: relative !important;
  overflow: visible !important;
  text-align: left !important;
  margin-left: 10px !important;
  margin-top: 0 !important;

  &::first-line {
    font-weight: 700 !important;
    color: #000000 !important;
  }

  &::before {
    content: '' !important;
    position: absolute !important;
    top: 50% !important;
    left: -8px !important;
    transform: translateY(-50%) !important;
    width: 0 !important;
    height: 0 !important;
    border-top: 7px solid transparent !important;
    border-bottom: 7px solid transparent !important;
    border-right: 8px solid #ffffff !important;
    filter: drop-shadow(-2px 0 1px rgba(0, 0, 0, 0.05)) !important;
  }
}


// 2. selection-panel.component.htmlIn selection-panel.component.html,
//  update the .suspect-icon span (lines 26–33) to remove 
// [matTooltipPositionAtOrigin]="true".   CDK tooltip works best when 
// anchoring to the element's actual layout box with standard matTooltipPosition="right"


<span
            class="suspect-icon"
            style="display: inline-flex; align-items: center; vertical-align: middle; cursor: pointer;"
            matTooltipPosition="right"
            matTooltipClass="suspect-tooltip-selection-panel"
            matTooltip="Suspect profile(s) found for this profile&#10;Search for the profile separately to make sure all associated profile(s) are selected.">
            !
          </span>