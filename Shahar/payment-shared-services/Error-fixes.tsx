//1. src/app/components/additional-details-section/additional-details-section.component.tsExpose the four imported constants as readonly properties inside AdditionalDetailsSectionComponent:   

export class AdditionalDetailsSectionComponent implements OnInit {
    readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;
    readonly siteCompartmentMaxLength = SITE_COMPARTMENT_MAX_LENGTH;
    readonly buildingMaxLength = BUILDING_MAX_LENGTH;
    readonly floorMaxLength = FLOOR_MAX_LENGTH;
  
    @Input() parentForm!: FormGroup;
    ...


    //2. src/app/components/additional-details-section/additional-details-section.component.htmlReplace the hardcoded maxlength="..." attributes with property bindings ([maxlength]="..." or [attr.maxlength]="...") on all 4 inputs:   

    <!-- 1. Site / Compartment, Lot / Concession -->
<input
  type="text"
  class="input text"
  name="siteCompartment"
  id="siteCompartment"
  formControlName="siteCompartment"
  [maxlength]="siteCompartmentMaxLength"
  (keydown)="onAlphaNumericSlashKeydown($event)"
  (input)="onAlphaNumericSlashInput($event, 'siteCompartment')"
  aria-describedby="helper-siteCompartment"
/>

<!-- 2. Building -->
<input
  type="text"
  class="input text"
  name="building"
  id="building"
  formControlName="building"
  [maxlength]="buildingMaxLength"
  (keydown)="onAlphaNumericSlashKeydown($event)"
  (input)="onAlphaNumericSlashInput($event, 'building')"
  aria-describedby="helper-building"
/>

<!-- 3. Floor -->
<input
  type="text"
  class="input text"
  name="floor"
  id="floor"
  formControlName="floor"
  [maxlength]="floorMaxLength"
  (keydown)="onAlphaNumericSlashKeydown($event)"
  (input)="onAlphaNumericSlashInput($event, 'floor')"
  aria-describedby="helper-floor"
/>

<!-- 4. Care of / Attention (description) -->
<input
  type="text"
  class="input text"
  name="description"
  id="description"
  formControlName="description"
  [maxlength]="descriptionMaxLength"
  (keydown)="onAlphaNumericSlashKeydown($event)"
  (input)="onAlphaNumericSlashInput($event, 'description')"
  aria-describedby="helper-description"
/>