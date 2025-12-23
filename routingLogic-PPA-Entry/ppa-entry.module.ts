@NgModule({
    declarations: [
      PpaEntryComponent,
      // Declare your child components here or in shared module
      InputComponent,
      Checker1Component,
      Checker2Component,
      // ...
    ],
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      PpaEntryRoutingModule,   // <-- this line
      // other imports like your tab component module
    ]
  })
  export class PpaEntryModule { }