//Step 1: Import MatTooltipModule in name-renderers.component.ts
// In name-renderers.component.ts


import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip'; // <-- Add this import

@Component({
  selector: 'app-cs-name-cell',
  standalone: true,
  imports: [CommonModule, MatTooltipModule], // <-- Add here
  changeDetection: ChangeDetectionStrategy.Default,
  ...


  //Step 2: Replace Native title with matTooltip in Template
// Replace lines 31–32 in image_24.png with matTooltip


<span
  *ngIf="isSuspect"
  class="suspect-icon"
  matTooltipPosition="right"
  [matTooltipPositionAtOrigin]="true"
  matTooltipClass="suspect-tooltip"
  matTooltip="Suspect profile(s) found for this profile&#10;Search for the profile separately to make sure all associated profile(s) are selected."
>!</span>



// Step 3: Verify the Tooltip SCSS
// Because you applied matTooltipClass="suspect-tooltip", 
// this will automatically pick up the white card style, 
// bold title, and top-left arrow pointer you already defined for .suspect-tooltip


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
    margin-top: 18px !important;

    /* Bold first heading line */
    &::first-line {
      font-weight: 700 !important;
      color: #000000 !important;
    }

    /* Arrow on top-left edge pointing to the suspect icon */
    &::before {
      content: '';
      position: absolute;
      top: 5px;
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