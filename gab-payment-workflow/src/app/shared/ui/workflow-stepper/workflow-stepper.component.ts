import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface WorkflowStep {
  label: string;
  status: 'completed' | 'active' | 'pending';
}

@Component({
  selector: 'app-workflow-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stepper-container d-flex justify-content-between align-items-center mb-4 p-3 bg-white border rounded shadow-sm">
      <div *ngFor="let step of steps; let i = index; let last = last" class="step-item d-flex flex-column align-items-center w-100 position-relative">
        
        <!-- Connecting Line -->
        <div *ngIf="!last" class="position-absolute top-50 start-50 w-100 translate-middle-y" style="height: 2px; z-index: 1;"
             [ngClass]="step.status === 'completed' ? 'bg-success' : 'bg-light'">
        </div>

        <!-- Visual Indicator -->
        <div class="indicator rounded-circle d-flex justify-content-center align-items-center position-relative" 
             style="z-index: 2;"
             [ngClass]="{
               'bg-success text-white': step.status === 'completed',
               'bg-warning text-dark': step.status === 'active',
               'bg-light border text-muted': step.status === 'pending'
             }">
          <i class="lucide-check small" *ngIf="step.status === 'completed'"></i>
          <span *ngIf="step.status !== 'completed'" style="font-size: 0.75rem; font-weight: bold;">{{ i + 1 }}</span>
        </div>
        
        <small class="mt-2 text-center" 
               [ngClass]="step.status === 'active' ? 'fw-bold text-dark' : 'text-muted'"
               style="font-size: 0.75rem;">
          {{ step.label }}
        </small>
      </div>
    </div>
  `,
  styles: [`
    .indicator {
      width: 24px;
      height: 24px;
      box-shadow: 0 0 0 4px #fff;
    }
  `]
})
export class WorkflowStepperComponent {
  @Input() steps: WorkflowStep[] = [
    { label: 'Admin Maker', status: 'completed' },
    { label: 'Admin Checker', status: 'completed' },
    { label: 'Signature Validation', status: 'active' },
    { label: 'Callback', status: 'pending' }
  ];
}