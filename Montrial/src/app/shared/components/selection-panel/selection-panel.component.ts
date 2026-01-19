import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-selection-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selection-panel.component.html',
  styleUrls: ['./selection-panel.component.scss']
})
export class SelectionPanelComponent {
  // Input name matches the shell's [selectedProfiles] binding
  @Input() selectedProfiles: any[] = [];
  
  @Output() removeProfile = new EventEmitter<any>();

  onRemove(profile: any): void {
    this.removeProfile.emit(profile);
  }

  onRelease(): void {
    console.log('Release action triggered for:', this.selectedProfiles);
  }

  onApply(): void {
    console.log('Apply action triggered for:', this.selectedProfiles);
  }
}