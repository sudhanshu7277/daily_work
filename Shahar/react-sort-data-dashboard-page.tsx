// 🧱 1. Component State & Sort Handler
//Place this block right at the very top of your ApprovalQueuePage() 
//component function, near your other state hooks (like searchTerm):

// 1. Add tracking hooks for column and direction
const [sortColumn, setSortColumn] = useState<string | null>(null);
const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

// 2. Add the state cycling function
const handleSort = (columnKey: string) => {
  if (sortColumn === columnKey) {
    if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else if (sortDirection === 'desc') {
      setSortDirection(null);
      setSortColumn(null);
    } else {
      setSortDirection('asc');
    }
  } else {
    setSortColumn(columnKey);
    setSortDirection('asc');
  }
};


//🔀 2. The Updated filteredData UseMemo Logic Block
///Locate your existing filteredData mapping loop (lines 111–133) 
//and update it to intercept the array data and perform the sorting computation before returning:

const filteredData = useMemo(() => {
    // ... KEEP ALL YOUR EXISTING SEARCH / FILTER CODE THAT CREATES THE 'result' ARRAY AS-IS ...
  
    // Create a copy to prevent direct array mutation errors
    const dataCopy = [...(result || [])];
  
    if (!sortColumn || !sortDirection) return dataCopy;
  
    return dataCopy.sort((a: any, b: any) => {
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];
  
      // Push null, blank, or undefined records down to the bottom
      if (valueA === undefined || valueA === null) return 1;
      if (valueB === undefined || valueB === null) return -1;
  
      // Standard lowercase alphabetical evaluation matching string properties
      valueA = String(valueA).toLowerCase().trim();
      valueB = String(valueB).toLowerCase().trim();
  
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  
    // CRITICAL: Append the sort tracking hooks to the useMemo dependency tracking matrix array below
  }, [data.content, searchTerm, valueDateRange, sortColumn, sortDirection]);

  //🎨 3. Wired Sequence No. Column Configuration
//Update the first element of your columns array configuration (lines 135–150) 
// to render the clickable text layout and track your icon display parameters:

const columns: any = [
    {
      title: (
        <El 
          className="lmn-d-flex lmn-align-items-center" 
          onClick={() => handleSort('instructionRef')} 
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <span>Sequence No.</span>
          <Icon 
            type={
              sortColumn === 'instructionRef' && sortDirection === 'asc' 
                ? 'arrow-up' 
                : sortColumn === 'instructionRef' && sortDirection === 'desc' 
                  ? 'arrow-down' 
                  : 'swap'
            } 
            style={{ 
              fontSize: '11px', 
              marginLeft: '6px', 
              // Highlights white when column matches active state; otherwise remains soft gray
              color: sortColumn === 'instructionRef' ? '#ffffff' : '#cccccc', 
              opacity: sortColumn === 'instructionRef' ? 1 : 0.6 
            }} 
          />
        </El>
      ),
      dataIndex: 'instructionRef',
      key: 'instructionRef',
      width: 130,
      onHeaderCell: () => ({
        style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
      }),
      render: (text: string, record: InstructionResponse) => (
        <a 
          onClick={() => navigate(`/instructions/${record.instructionId}`)} 
          className="lmn-text-link" 
          style={{ cursor: 'pointer', fontWeight: 500, fontSize: '12px' }}
        >
          {text}
        </a>
      ),
    },
    // ... Leave 'Source & Category', 'Client', and 'Deal' arrays exactly as they are ...
  ];



  //////////////////////////////////
  /////// LATEST CODE

  const filteredData = useMemo(() => {
    let result = data.content;

    // 1. Text Search Filter Block
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(i =>
        (i.instructionRef || '').toLowerCase().includes(term) ||
        (i.clientName || '').toLowerCase().includes(term) ||
        (i.dealName || '').toLowerCase().includes(term) ||
        (i.region || '').toLowerCase().includes(term) ||
        (i.country || '').toLowerCase().includes(term) ||
        (i.accountNumber || '').toLowerCase().includes(term) ||
        (i.primaryAssignee || '').toLowerCase().includes(term)
      );
    }

    // 2. Date Range Filter Block
    if (valueDateRange && valueDateRange[0] && valueDateRange[1]) {
      result = result.filter(i => {
        if (!i.dueDate) return false;
        const dueDate = new Date(i.dueDate);
        return dueDate >= valueDateRange[0] && dueDate <= valueDateRange[1];
      });
    }

    // 3. NEW: Multi-Directional Alphabetical Sort Block
    if (sortColumn && sortDirection) {
      result = [...result].sort((a: any, b: any) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];

        // Push null or undefined records to the bottom cleanly
        if (valueA === undefined || valueA === null) return 1;
        if (valueB === undefined || valueB === null) return -1;

        // Force to normalized lowercase strings for exact alphabetical sorting
        valueA = String(valueA).toLowerCase().trim();
        valueB = String(valueB).toLowerCase().trim();

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
    
    // 4. CRITICAL: Added sort states to the useMemo tracking matrix down here
  }, [data.content, searchTerm, valueDateRange, sortColumn, sortDirection]);

  //🧱 1. Update Component States for Default Sort
//Go to where you defined your state variables at the top of ApprovalQueuePage() and set default values inside your useState initializers:

// Sets the table to automatically render sorted by Sequence No. in descending order
const [sortColumn, setSortColumn] = useState<string | null>('instructionRef');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>('desc');

// 🎨 2. Update the Sequence No. Column Definition
// Update the title element logic within your columns array block. We'll modify the color property to a clean light gray (#b3c6ff or #cccccc) 
///for better contrast against the corporate blue background, and keep the opacity locked at 1:

{
    title: (
      <El 
        className="lmn-d-flex lmn-align-items-center" 
        onClick={() => handleSort('instructionRef')} 
        style={{ cursor: 'pointer', userSelect: 'none', width: '100%' }}
      >
        <span style={{ marginRight: 'auto' }}>Sequence No.</span>
        <Icon 
          type={
            sortColumn === 'instructionRef' && sortDirection === 'asc' 
              ? 'arrow-up' 
              : sortColumn === 'instructionRef' && sortDirection === 'desc' 
                ? 'arrow-down' 
                : 'swap' // Shows double-arrow icon when inactive
          } 
          style={{ 
            fontSize: '12px', 
            marginLeft: '6px', 
            // Highlight white if actively sorting this column, otherwise keep it a readable light gray
            color: sortColumn === 'instructionRef' ? '#ffffff' : '#b3c6ff',
            opacity: 1 // Force icon to be 100% visible at all times
          }} 
        />
      </El>
    ),
    dataIndex: 'instructionRef',
    key: 'instructionRef',
    width: 130,
    onHeaderCell: () => ({
      style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
    }),
    render: (text: string, record: InstructionResponse) => (
      <a 
        onClick={() => navigate(`/instructions/${record.instructionId}`)} 
        className="lmn-text-link" 
        style={{ cursor: 'pointer', fontWeight: 500, fontSize: '12px' }}
      >
        {text}
      </a>
    ),
  },

  