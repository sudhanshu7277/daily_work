import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { animate, style, transition, trigger } from '@angular/animations';

// NgRx Imports
import { selectActiveNotifications } from '../../../store/ui/ui.selectors';
import { UiActions } from '../../../store/ui/ui.actions';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  // Adding simple enter/leave animations for a professional feel
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('300ms cubic-bezier(0.2, 1, 0.2, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(-20px)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-4" style="z-index: 1060;">
      
      <div *ngFor="let toast of notifications$ | async" 
           @toastAnimation
           class="gab-toast bg-white shadow-lg rounded mb-3 d-flex align-items-center justify-content-between p-3"
           [ngClass]="{
             'border-success text-success': toast.toastType === 'success',
             'border-danger text-danger': toast.toastType === 'error',
             'border-primary text-primary': toast.toastType === 'info'
           }">
        
        <div class="d-flex align-items-center pe-4">
          <!-- Dynamic Icons based on type -->
          <i *ngIf="toast.toastType === 'success'" class="lucide-check-circle me-2 fs-5"></i>
          <i *ngIf="toast.toastType === 'error'" class="lucide-alert-triangle me-2 fs-5"></i>
          <i *ngIf="toast.toastType === 'info'" class="lucide-info me-2 fs-5"></i>
          
          <span class="fw-bold fs-6">{{ toast.message }}</span>
        </div>

        <!-- Black Cross Button -->
        <button class="btn border-0 p-0 ms-2 text-dark opacity-75 hover-opacity-100" 
                (click)="dismiss(toast.id)"
                aria-label="Close">
          <i class="lucide-x fs-5 fw-bold"></i>
        </button>

      </div>

    </div>
  `,
  styles: [`
    .gab-toast {
      /* Base border setup */
      border: 1px solid; 
      /* Add a thicker left border for an enterprise "flag" look */
      border-left-width: 5px !important; 
      min-width: 300px;
      max-width: 450px;
    }

    /* Map our custom Gab Navy to the info toast */
    .border-primary { border-color: #0b2265 !important; }
    .text-primary { color: #0b2265 !important; }

    /* Map Gab Green to the success toast */
    .border-success { border-color: #2E7D32 !important; }
    .text-success { color: #2E7D32 !important; }

    .hover-opacity-100:hover {
      opacity: 1 !important;
      transform: scale(1.1);
      transition: all 0.2s;
    }
  `]
})
export class NotificationComponent implements OnInit {
  private store = inject(Store);
  
  // Observable of all active notifications from the Store
  notifications$ = this.store.select(selectActiveNotifications);
  
  // Keep track of which notifications already have a timer running
  private activeTimers = new Set<string>();

  ngOnInit() {
    this.notifications$.subscribe(notifications => {
      notifications.forEach(notification => {
        // If this is a new notification, start its 3-second countdown
        if (!this.activeTimers.has(notification.id)) {
          this.activeTimers.add(notification.id);
          
          setTimeout(() => {
            this.dismiss(notification.id);
          }, 3000); // 3 seconds
        }
      });
    });
  }

  // Allow the user to manually close it via the black cross button
  dismiss(id: string) {
    if (this.activeTimers.has(id)) {
      this.store.dispatch(UiActions.dismissNotification({ id }));
      this.activeTimers.delete(id);
    }
  }
}