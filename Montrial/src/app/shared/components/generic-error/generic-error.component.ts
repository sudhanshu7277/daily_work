import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-generic-error',
  templateUrl: './generic-error.component.html',
  styleUrls: ['./generic-error.component.scss']
})
export class GenericErrorComponent {
  @Input() title: string = 'System error';
  @Input() message: string = 'Sorry, something went wrong on our end. Please try again later.';
}