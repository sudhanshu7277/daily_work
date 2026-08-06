// Option 2: Selective Styling via headerClass
//If you only want to shift specific headers (like Customer Lifecycle Status and eDiscovery Project Manager), define a utility class in SCSS and apply it in your column definitions.

// 1. Add class to customer-search-grid.component.scss:

::ng-deep .shift-header-left {
  .ag-header-cell-label {
    justify-content: flex-start !important;
    padding-left: 2px !important;
  }
  .ag-header-cell-text {
    margin-left: 0 !important;
    padding-left: 0 !important;
  }
}


// 2. Apply headerClass in customer-search-grid.component.ts:

// Line 432
{ 
  headerName: 'Customer Lifecycle Status', 
  field: 'lifecycle', 
  width: 220,
  headerClass: 'shift-header-left'
},

// Line 447
{ 
  headerName: 'eDiscovery Project Manager', 
  field: 'eDiscoveryProjectManager', 
  width: 250,
  headerClass: 'shift-header-left'
}


// Here is the updated function with an internal list of prefixes. You can add any additional words to the prefixesToRemove array in the future.

function cleanResponseText(text: string): string {
  if (!text) return text;

  // Add any words you want removed from the start of the text here
  const prefixesToRemove = ['Has', 'Is', 'With'];

  // Escape special regex characters in case prefixes contain symbols
  const escapedPrefixes = prefixesToRemove.map(prefix =>
    prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );

  // Matches any prefix from the array at the start of the string (^), case-insensitive ('i')
  const regex = new RegExp(`^(${escapedPrefixes.join('|')})\\s*`, 'i');

  return text.replace(regex, '').trim();
}

// Example Usage:
console.log(cleanResponseText('has POA General')); // Output: "POA General"
console.log(cleanResponseText('Has POA General')); // Output: "POA General"
console.log(cleanResponseText('is Active'));      // Output: "Active"
console.log(cleanResponseText('POA General'));     // Output: "POA General"