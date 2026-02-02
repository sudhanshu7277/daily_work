// import { Component, Input, Output, EventEmitter } from '@angular/core';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-selection-panel',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './selection-panel.component.html',
//   styleUrls: ['./selection-panel.component.scss']
// })
// export class SelectionPanelComponent {
//   // Input name matches the shell's [selectedProfiles] binding
//   @Input() selectedProfiles: any[] = [];
  
//   @Output() removeProfile = new EventEmitter<any>();

//   onRemove(profile: any): void {
//     this.removeProfile.emit(profile);
//   }

//   onRelease(): void {
//     console.log('Release action triggered for:', this.selectedProfiles);
//   }

//   onApply(): void {
//     console.log('Apply action triggered for:', this.selectedProfiles);
//   }
// }

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-selection-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './selection-panel.component.html',
  styleUrls: ['./selection-panel.component.scss']
})
export class SelectionPanelComponent {
  @Input() selectedRows: any[] = [];
  @Output() removeRow = new EventEmitter<any>();
  @Output() applyAction = new EventEmitter<void>();
  @Output() releaseAction = new EventEmitter<void>();

  onRemove(row: any) {
    this.removeRow.emit(row);
  }

  onApply() {
    this.applyAction.emit();
  }

  onRelease() {
    this.releaseAction.emit();
  }
}