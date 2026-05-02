import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Reusing the same grid we built for the Checker Queue
import { InstructionGridComponent } from '../../dashboard/components/instruction-grid/instruction-grid.component';

@Component({
  selector: 'app-maker-queue',
  standalone: true,
  imports: [CommonModule, InstructionGridComponent],
  template: `
    <div class="container-fluid p-0 pb-4">
      
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
        <div>
          <h4 class="fw-bold m-0 text-dark">Maker Queue</h4>
          <span class="text-danger small fw-bold"><i class="lucide-alert-circle me-1" style="width: 14px;"></i> Instructions requiring Admin Rework</span>
        </div>
        
        <button class="btn btn-outline-primary btn-sm rounded-pill px-4" (click)="refreshQueue()">
          <i class="lucide-refresh-cw me-1"></i> Refresh
        </button>
      </div>

      <!-- Queue Metrics -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card bg-danger text-white border-0 shadow-sm h-100">
            <div class="card-body py-3">
              <h6 class="text-white opacity-75 text-uppercase mb-1" style="font-size: 0.75rem; letter-spacing: 0.5px;">Pending Rework</h6>
              <h3 class="mb-0 fw-bold">{{ rejectedInstructions.length }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Reusable AG Grid Data Table -->
      <div class="bg-white p-3 shadow-sm border rounded">
        <!-- Notice we bind to rejectedInstructions here -->
        <app-instruction-grid 
          [rowData]="rejectedInstructions"
          (rowClicked)="openReworkTask($event)">
        </app-instruction-grid>
      </div>

    </div>
  `
})
export class MakerQueueComponent implements OnInit {
  private router = inject(Router);
  
  rejectedInstructions: any[] = [];

  ngOnInit() {
    this.loadQueueData();
  }

  loadQueueData() {
    // Simulated API response for items rejected by the Checker
    this.rejectedInstructions = [
      { 
        referenceId: 'GAB-1105', 
        client: 'ALPHA HOLDINGS', 
        region: 'APAC', 
        status: 'Admin Rework', // Note the status
        currency: 'USD', 
        amount: 300000, 
        dueDate: '2026-05-09' 
      },
      { 
        referenceId: 'GAB-9922', 
        client: 'MSU ENERGY SA', 
        region: 'LATAM', 
        status: 'Admin Rework', 
        currency: 'EUR', 
        amount: 85000, 
        dueDate: '2026-05-10' 
      }
    ];
  }

  refreshQueue() {
    this.rejectedInstructions = []; 
    setTimeout(() => {
      this.loadQueueData();
    }, 500);
  }

  openReworkTask(instructionData: any) {
    // When the Maker clicks an item, route them back to the Ad Hoc Setup form
    // In a real app, you would pass the ID so the setup form populates with existing data.
    const instructionId = instructionData.referenceId;
    this.router.navigate(['/instruction/new'], { queryParams: { edit: instructionId } });
  }
}