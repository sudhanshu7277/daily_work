// history tab scrollbar style


::ng-deep {
    * {
      scrollbar-width: thin;
      scrollbar-color: #0079c1 #f1f5f8;
    }
  
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
  
    ::-webkit-scrollbar-track {
      background: #f1f5f8;
    }
  
    ::-webkit-scrollbar-thumb {
      background-color: #0079c1;
      border-radius: 4px;
  
      &:hover {
        background-color: #005a91;
      }
    }
  }