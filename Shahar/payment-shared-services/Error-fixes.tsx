::ng-deep {
  .ag-root-wrapper {
    --ag-scrollbar-size: 8px !important;
  }

  .ag-body-vertical-scroll {
    width: 8px !important;
    min-width: 8px !important;
    max-width: 8px !important;
  }

  .ag-body-vertical-scroll-viewport {
    width: 8px !important;
    
    &::-webkit-scrollbar {
      width: 8px !important;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #c1c1c1 !important;
      border-radius: 4px;
    }
  }
}