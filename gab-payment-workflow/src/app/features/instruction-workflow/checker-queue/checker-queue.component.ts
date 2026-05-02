import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Shared UI Components
import { InstructionGridComponent } from '../../dashboard/components/instruction-grid/instruction-grid.component';

@Component({
  selector: 'app-checker-queue',
  standalone: true,
  imports: [CommonModule, InstructionGridComponent],
  template: `
    <div class="container-fluid p-0 pb-4">
      
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
        <div>
          <h4 class="fw-bold m-0 text-dark">Checker Queue</h4>
          <span class="text-muted small">Instructions pending Admin Verification</span>
        </div>
        
        <!-- Optional: Refresh button for a realistic UX -->
        <button class="btn btn-outline-primary btn-sm rounded-pill px-4" (click)="refreshQueue()">
          <i class="lucide-refresh-cw me-1"></i> Refresh Queue
        </button>
      </div>

      <!-- Queue Metrics/Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card bg-white border shadow-sm h-100 border-start border-warning border-4">
            <div class="card-body py-3">
              <h6 class="text-muted text-uppercase mb-1" style="font-size: 0.75rem; letter-spacing: 0.5px;">Pending Verification</h6>
              <h3 class="mb-0 fw-bold text-dark">{{ pendingInstructions.length }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-white border shadow-sm h-100 border-start border-danger border-4">
            <div class="card-body py-3">
              <h6 class="text-muted text-uppercase mb-1" style="font-size: 0.75rem; letter-spacing: 0.5px;">High Priority (Due Today)</h6>
              <h3 class="mb-0 fw-bold text-dark">1</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- AG Grid Data Table -->
      <div class="bg-white p-3 shadow-sm border rounded">
        <app-instruction-grid 
          [rowData]="pendingInstructions"
          (rowClicked)="openCheckerTask($event)">
        </app-instruction-grid>
      </div>

    </div>
  `
})
export class CheckerQueueComponent implements OnInit {
  private router = inject(Router);
  
  pendingInstructions: any[] = [];

  ngOnInit() {
    this.loadQueueData();
  }

  loadQueueData() {
    // In a real application, this would dispatch an NgRx action to fetch from the backend:
    // this.store.dispatch(InstructionActions.loadCheckerQueue());
    
    // Simulated API response for the Checker's queue
    this.pendingInstructions = [
      { 
        referenceId: 'GAB-4921', 
        client: 'MSU ENERGY SA', 
        region: 'LATAM', 
        status: 'Pending Checker', 
        currency: 'USD', 
        amount: 500000, 
        dueDate: '2026-05-10' // Assuming today is around this date
      },
      { 
        referenceId: 'GAB-8832', 
        client: 'CAMORIM SERVICOS', 
        region: 'LATAM', 
        status: 'Pending Checker', 
        currency: 'BRL', 
        amount: 1250000, 
        dueDate: '2026-05-15' 
      },
      { 
        referenceId: 'GAB-1092', 
        client: 'GLOBAL TECH LLC', 
        region: 'EMEA', 
        status: 'Pending Checker', 
        currency: 'EUR', 
        amount: 75000, 
        dueDate: '2026-05-20' 
      }
    ];
  }

  refreshQueue() {
    // Simulates a manual refresh of the queue
    this.pendingInstructions = []; // Clear array to show loading state in grid (if configured)
    setTimeout(() => {
      this.loadQueueData();
    }, 500);
  }

  openCheckerTask(instructionData: any) {
    // When the Checker clicks "Review / Edit" on a row, grab the ID and navigate
    const instructionId = instructionData.referenceId;
    this.router.navigate(['/instruction/checker', instructionId]);
  }
}