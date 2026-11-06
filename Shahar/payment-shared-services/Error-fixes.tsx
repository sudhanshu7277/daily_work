//In history.component.scss
//Add word-break: break-all; and overflow-wrap: anywhere; to both 
// .modal-title and .modal-subtitle (around lines 428–457):

.modal-title {
  margin: 0;
  padding-right: 24px;
  word-break: break-all;
  overflow-wrap: anywhere;
}

.modal-close {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;

  mat-icon {
    font-size: 22px;
    width: 22px;
    height: 22px;
  }
}

.modal-subtitle {
  font-size: 14px;
  color: #333;
  margin: 8px 36px 20px;
  line-height: 1.5;
  word-break: break-all;
  overflow-wrap: anywhere;
}



//In selection-panel.component.scss
//Locate .confirmation-message (around lines 549–553 in image 46) and add
//  word-break: break-all; and overflow-wrap: anywhere; to both 
// .confirmation-message and .title:


//In selection-panel.component.scss
Update .title (around line 364) to include:


.title {
  margin: 0;
  color: #08253a;
  font-size: 24px;
  line-height: 1.15;
  font-weight: 700;
  text-align: center;
  word-break: break-all;
  overflow-wrap: anywhere;
  flex: 1;
  min-width: 0;
}


/////


// In search-legal-hold.component.html, add a dedicated class (hold-name-error-text) directly to the <small> element for the maxlength error (line 31):   

@if (searchForm.get('holdName')?.hasError('maxlength')) {
  <small class="error-text hold-name-error-text" style="position: static;">
    {{ (searchLegalHoldVerbiage.legalHoldNameError || 'Legal Hold Name exceeds maximum allowed length') | translate }}
  </small>
}


//In search-legal-hold.component.scss, add the custom class styling.Inspect the parent .error-text in search-legal-hold.component.scss (lines 61–73) to see how the icon is positioned.   If .error-text reserves padding on the left (e.g. padding-left: 20px) and positions ::before with position: absolute; top: 50%; transform: translateY(-50%);, multi-line wrapping centers that icon vertically against the entire 2-line box.   Resetting top to align with the first text line fixes the alignment:

.error-text.hold-name-error-text {
  position: relative !important;
  line-height: 1.3 !important;

  &::before {
    top: 2px !important;
    transform: none !important;
    vertical-align: top !important;
  }
}