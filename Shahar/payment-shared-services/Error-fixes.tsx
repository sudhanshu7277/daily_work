// 1. Update lines 704–710
// Change lines 704–710 from:

.ag-body-vertical-scroll,
  .ag-body-vertical-scroll-viewport,
  .ag-body-vertical-scroll-container {
    width: 16px !important;
    min-width: 16px !important;
    max-width: 16px !important;
  }


  // to:

  .ag-body-vertical-scroll,
  .ag-body-vertical-scroll-viewport,
  .ag-body-vertical-scroll-container {
    width: 16px !important;
    min-width: 16px !important;
    max-width: 16px !important;
  }

  .ag-body-horizontal-scroll,
  .ag-body-horizontal-scroll-viewport,
  .ag-body-horizontal-scroll-container {
    height: 16px !important;
    min-height: 16px !important;
    max-height: 16px !important;
  }


  // 2. Update lines 712–730Extend the selector on line 712 to 
  // target .ag-body-horizontal-scroll-viewport 
  // and set both width and height on the scrollbar pseudo-element:   
  // Change lines 712–715 from:


  .ag-body-vertical-scroll-viewport {
    &::-webkit-scrollbar {
      width: 16px !important;
    }


    // to:

    .ag-body-vertical-scroll-viewport,
  .ag-body-horizontal-scroll-viewport {
    &::-webkit-scrollbar {
      width: 16px !important;
      height: 16px !important;
    }


    //3. Update line 731Include .ag-body-horizontal-scroll-viewport 
    // in the standard Firefox/CSS scrollbar rule on line 731:   
    // Change line 731 from:


    .ag-body-vertical-scroll-viewport {


      //to:


      .ag-body-vertical-scroll-viewport,
  .ag-body-horizontal-scroll-viewport {