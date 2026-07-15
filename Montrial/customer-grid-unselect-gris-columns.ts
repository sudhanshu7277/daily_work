// 1. Fix the ID Typos in Your Code First

filterOptions = [
    { id: 'profileName', label: 'Profile Name' },
    { id: 'ocifId', label: 'Proxy OCIF ID' },
    { id: 'status', label: 'Legal Hold Status' },
    { id: 'holdName', label: 'Legal Hold Name' },
    { id: 'lifecycle', label: 'Customer Lifecycle Status' },
    { id: 'role', label: 'Role Type' },
    { id: 'address', label: 'Address' },
    // 🟢 FIXED SPACING & TYPOS HERE:
    { id: 'eDiscoveryProjectManager', label: 'eDiscovery Project Manager' },
    { id: 'responsibleLawyerEmail', label: 'Responsible Lawyer Email' },
    { id: 'legalHoldAppliedDate', label: 'Legal Hold Applied Date' },
    { id: 'legalHoldReleaseDate', label: 'Legal Hold Release Date' }
  ];

  // 2. The Clean disableOptionsAndChips Function

  disableOptionsAndChips(id: string): boolean {
    // Columns that are mandatory/permanent and CANNOT be unselected (remain gray)
    const mandatoryColumns = [
      'profileName', 
      'ocifId', 
      'status', 
      'holdName', 
      'lifecycle', 
      'role', 
      'address'
    ];
  
    // Return true (disabled/gray) if it's a mandatory column, false (interactive/blue) otherwise
    return mandatoryColumns.includes(id);
  }

  // 3. Ensure the Grid Columns Show/Hide on Toggle

  syncColumns(): void {
    const selectedIds = this.selectedFilterIds;
  
    this.columnDefs = this.columnDefs.map(col => {
      // 1. Identify your toggleable columns
      const dynamicColumnsMap: { [key: string]: string } = {
        'eDiscoveryProjectManager': 'eDiscoveryProjectManager',
        'responsibleLawyerEmail': 'responsibleLawyerEmail',
        'holdApplyDate': 'legalHoldAppliedDate',     // Maps col field to filter ID
        'holdReleaseDate': 'legalHoldReleaseDate'    // Maps col field to filter ID
      };
  
      const filterId = dynamicColumnsMap[col.field];
  
      if (filterId) {
        // If the filter ID is not in the selection array, hide it
        return {
          ...col,
          hide: !selectedIds.includes(filterId)
        };
      }
  
      return col;
    });
  
    // 2. Notify AG-Grid of the column definition change
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.columnDefs);
    }
  }

  // line 442

  // 🟢 Safely read the field name, defaulting to an empty string if undefined
const fieldName = col.field || '';
const filterId = dynamicColumnsMap[fieldName];


// Step 1: Define the Mandatory Column IDs
// Columns that are always selected, always visible, and can never be unchecked
readonly mandatoryColumnIds = [
    'profileName',
    'ocifId',
    'status',
    'holdName',
    'lifecycle',
    'role',
    'address'
  ];

  // Step 2: Update the Constructor Setup
//Currently, on line 315 of image_38.png, you have:

this.selectedFilterIds = this.filterOptions.map(opt => opt.id);

// This is what automatically selects all 11 columns on load.

//Replace that line with:

// 🟢 Set only the 7 mandatory columns as selected on load
this.selectedFilterIds = [...this.mandatoryColumnIds];

// Step 3: Run syncColumns() inside ngOnChanges

ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerGridData'] && this.customerGridData && this.customerGridData.length) {
      this.isLoading = true;
      this.loadError = false;
      console.log('CHECKING OLD RESPONSE : ');
      console.log(this.customerGridData);
      
      this.handleResponse(this.mapApiResponse(this.customerGridData));
      
      // 🟢 Force AG-Grid to apply the default column visibility immediately
      this.syncColumns();
    }
  }

  // Step 4: Keep disableOptionsAndChips Clean
// Use the class property array to keep your layout disabling logic completely aligned:

disableOptionsAndChips(id: string): boolean {
    // Returns true (disabled/gray) if it belongs to the 7 mandatory items
    return this.mandatoryColumnIds.includes(id);
  }