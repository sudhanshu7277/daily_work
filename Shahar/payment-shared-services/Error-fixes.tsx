//In selection-panel.component.html (lines 28–29 in image_58.png), 
// the culprit shifting the tooltip is:

[matTooltipPositionAtOrigin]="true"

//The Exact Fix
//1. In selection-panel.component.html
//Look at lines 26–32 in selection-panel.component.html

<span
            class="suspect-icon"
            matTooltipPosition="right"
            [matTooltipPositionAtOrigin]="true"
            matTooltipClass="suspect-tooltip-selection-panel"
            matTooltip="Suspect profile(s) found for this profile&#10;Search for the profile separately to make sure all associated profile(s) are selected.">
            !
          </span>


//Change it to:
// Remove [matTooltipPositionAtOrigin]="true" and 
// add display: inline-block to .suspect-icon (or inline style) 
// so CDK has a solid layout rect to anchor to:   

<span
            class="suspect-icon"
            style="display: inline-block; vertical-align: middle;"
            matTooltipPosition="right"
            matTooltipClass="suspect-tooltip-selection-panel"
            matTooltip="Suspect profile(s) found for this profile&#10;Search for the profile separately to make sure all associated profile(s) are selected.">
            !
          </span>


//2. In selection-panel.component.scssIn image_59.png, look at lines 183–184:   

margin-left: 10px !important;
  margin-top: 110px !important;


  //And lines 194–195:   

  top: -1px;
  left: -9px;


  //Because margin-top: 110px is forcing the whole overlay down, 
  // the overlay bounding box is artificially stretched, which
  //  causes CDK's collision detection to think the tooltip won't 
  // fit on the right for lower or longer rows.


  // In .mat-mdc-tooltip.suspect-tooltip-selection-panel...
  margin-left: 10px !important;
  margin-top: 0 !important; // <-- change from 110px to 0

  &::before {
    // keep content, width, height, borders exactly as you have them
    top: 50% !important; // <-- centers arrow vertically with the orange icon
    transform: translateY(-50%) !important; // <-- keeps arrow pointing to center of icon
    left: -9px !important;
  }
