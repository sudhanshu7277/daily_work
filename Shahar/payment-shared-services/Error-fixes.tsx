//1. In search-legal-hold.component.scss
//Update .email-error-message-wrapper and .email-error-message (lines 1–20 in image_47.png):

.email-error-message-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  width: 100%;
  margin-top: 6px;
  /* Removed fixed height: 18px so it expands dynamically when both errors appear */
}

.email-error-message {
  color: #a12000;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
  position: static; /* Removed position: absolute to allow natural vertical stacking */
  width: 100%;
  pointer-events: none;
}

.email-error-text {
  position: static !important;
  display: block !important;
  line-height: 1.3 !important;
  background-position: left 2px !important;
  background-repeat: no-repeat !important;
  padding-left: 20px !important;
}


//2. In search-legal-hold.component.html
//Ensure both errors inside .email-error-message-wrapper use position: static so flexbox stacks them cleanly:

<div class="email-error-message-wrapper">
  @if (searchForm.get('lawyerEmail')?.touched && searchForm.get('lawyerEmail')?.hasError('email')) {
    <span id="legal-hold-lawyer-email-error" class="email-error-message error-text email-error-text">
      Enter a valid email address
    </span>
  }
  @if (isLawyerEmailMaxExceeded || searchForm.get('lawyerEmail')?.hasError('maxlength')) {
    <small class="error-text email-error-text">
      {{ (searchLegalHoldVerbiage.lawyerEmailError || 'Responsible Lawyer Email exceeds maximum allowed length') | translate }}
    </small>
  }
</div>