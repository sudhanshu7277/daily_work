@Component({
    selector: 'app-example',
    standalone: true, // ← Required
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, AgGridModule /* other needed modules or standalone components */],
    templateUrl: './example.component.html',
    styleUrls: ['./example.component.scss']
  })
  export class ExampleComponent { /* ... */ }