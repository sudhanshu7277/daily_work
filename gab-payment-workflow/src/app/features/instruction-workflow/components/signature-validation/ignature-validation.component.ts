import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signature-validation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-4 shadow-sm border rounded">
      <fieldset class="custom-fieldset border-0 pb-0">
        <legend class="custom-legend border-bottom pb-2">Signature Validation</legend>
        
        <div class="row g-4 mt-1">
          <!-- Dropdowns matching Fig 4 -->
          <div class="col-md-4">
            <label class="form-label">Signature Validation Source *</label>
            <select class="form-select">
              <option value="">-- Select a value --</option>
              <option value="Email">Email</option>
              <option value="Physical">Physical</option>
            </select>
          </div>

          <div class="col-md-4 border-start border-end px-4">
             <div class="mb-3 d-flex justify-content-between border-bottom pb-2">
                <span class="text-muted">Signature Status:</span>
                <span class="fw-bold text-warning">Pending</span>
             </div>
             <div class="form-check mt-3">
               <input class="form-check-input" type="checkbox" id="adminRework">
               <label class="form-check-label text-danger" for="adminRework">Admin Rework Required</label>
             </div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Comment Type</label>
            <select class="form-select mb-2">
              <option>Signature Validation</option>
            </select>
            
            <label class="form-label">Comment *</label>
            <textarea class="form-control" rows="2"></textarea>
          </div>
        </div>
      </fieldset>
    </div>
  `
})
export class SignatureValidationComponent {}