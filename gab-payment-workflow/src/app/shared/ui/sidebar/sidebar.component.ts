import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="gab-sidebar d-flex flex-column p-3 bg-white h-100">
      
      <span class="text-uppercase text-muted fw-bold mb-3 ms-2" style="font-size: 0.75rem; letter-spacing: 0.5px;">
        Main Menu
      </span>

      <ul class="nav nav-pills flex-column mb-auto">
        
        <li class="nav-item mb-1">
          <a routerLink="/dashboard" routerLinkActive="active-nav-link" class="nav-link text-dark d-flex align-items-center py-2 px-3 rounded">
            <i class="lucide-layout-dashboard me-3" style="width: 20px;"></i> 
            <span class="fw-medium">Dashboard</span>
          </a>
        </li>
        
        <li class="nav-item mb-1">
          <a routerLink="/instruction/new" routerLinkActive="active-nav-link" class="nav-link text-dark d-flex align-items-center py-2 px-3 rounded">
            <i class="lucide-file-plus me-3" style="width: 20px;"></i> 
            <span class="fw-medium">Ad Hoc Setup</span>
          </a>
        </li>

        <!-- NEW: Maker Queue for Rejected Items -->
        <li class="nav-item mb-1">
          <a routerLink="/instruction/maker-queue" routerLinkActive="active-nav-link" class="nav-link text-dark d-flex align-items-center py-2 px-3 rounded">
            <div class="position-relative">
              <i class="lucide-file-warning me-3" style="width: 20px;"></i>
              <!-- Indicator for rejected items -->
              <span class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style="margin-left: -12px; margin-top: 2px;"></span>
            </div>
            <span class="fw-medium">Maker Queue <span class="badge bg-danger ms-2 rounded-pill px-2">2</span></span>
          </a>
        </li>
        
        <li class="nav-item mb-1 mt-3 pt-3 border-top">
          <a routerLink="/instruction/queue" routerLinkActive="active-nav-link" class="nav-link text-dark d-flex align-items-center py-2 px-3 rounded">
            <i class="lucide-list-checks me-3" style="width: 20px;"></i>
            <span class="fw-medium">Checker Queue</span>
          </a>
        </li>

      </ul>

      <div class="mt-auto border-top pt-3">
        <ul class="nav flex-column">
          <li class="nav-item mb-1">
            <a href="#" class="nav-link text-muted d-flex align-items-center py-2 px-3 rounded help-link">
              <i class="lucide-help-circle me-3" style="width: 20px;"></i> 
              <span class="fw-medium">Help & Support</span>
            </a>
          </li>
        </ul>
      </div>

    </nav>
  `,
  styles: [`
    .gab-sidebar { min-height: calc(100vh - 75px); }
    .nav-link { transition: all 0.2s ease-in-out; color: #495057 !important; }
    .nav-link:hover:not(.active-nav-link) { background-color: #f4f6f9; color: #0b2265 !important; }
    
    .active-nav-link {
      background-color: #0b2265 !important; 
      color: #ffffff !important;
      box-shadow: 0 2px 4px rgba(11, 34, 101, 0.2);
    }
    .active-nav-link i, .active-nav-link .badge { color: #ffffff !important; }
    .help-link:hover { background-color: #f8f9fa; color: #212529 !important; }
  `]
})
export class SidebarComponent {}
