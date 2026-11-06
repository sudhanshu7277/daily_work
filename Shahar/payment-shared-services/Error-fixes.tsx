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


.confirmation-modal {
  .title {
    word-break: break-all;
    overflow-wrap: anywhere;
    white-space: normal;
  }
}

.confirmation-message {
  margin: 10px 0 14px;
  font-size: 14px;
  color: #333;
  word-break: break-all;
  overflow-wrap: anywhere;
  white-space: normal;

  p {
    margin: 0;
    word-break: break-all;
    overflow-wrap: anywhere;
  }
}