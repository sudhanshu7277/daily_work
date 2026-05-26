

//🛠️ Step 1: Add Sort State to DashboardPage.tsx
//Scroll to the top of your DashboardPage component 
//(right around where your useState hooks are initialized) and add these two states along with a custom sorting handler:

// 1. Core Sort Tracking States
const [sortColumn, setSortColumn] = useState<string | null>(null);
const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

// 2. Dynamic Sorting Toggle Handler
const handleSort = (columnKey: string) => {
  if (sortColumn === columnKey) {
    if (sortDirection === 'asc') setSortDirection('desc');
    else if (sortDirection === 'desc') {
      setSortDirection(null);
      setSortColumn(null);
    } else setSortDirection('asc');
  } else {
    setSortColumn(columnKey);
    setSortDirection('asc');
  }
};

// 🗄️ Step 2: Apply the Sort Logic to Your Data Array
//Right before you map your array data to the <Table> component (where pagedOverdue or your dataset array is computed), 
// intercept it with a dynamic .sort() function:

const sortedOverdueData = useMemo(() => {
    // Replace 'overdueData' with your actual raw array variable name from your state/API context
    const dataCopy = [...(overdueData || [])]; 
    
    if (!sortColumn || !sortDirection) return dataCopy;
  
    return dataCopy.sort((a: any, b: any) => {
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];
  
      // Handle Edge Case: Missing or null values down at the bottom
      if (valueA === undefined || valueA === null) return 1;
      if (valueB === undefined || valueB === null) return -1;
  
      // Convert strings to lowercase to prevent uppercase sorting quirks
      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();
  
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [overdueData, sortColumn, sortDirection]);


  // ⚠️ Dependency Sync Note: Pass sortedOverdueData into your <Table data={...} /> component instead of your raw unsorted state array variable so the view hooks up to the sort changes.

//🎨 Step 3: Wire Up the overdueColumns Configuration Array
//To make the headers clickable and visually indicate the sort state, update the onHeaderCell mappings within your overdueColumns array (images 77-80).

//Replace your overdueColumns definitions with this enhanced layout configuration:

const overdueColumns = [
    {
      title: 'Sequence No.',
      dataIndex: 'instructionRef',
      key: 'ref',
      width: 130,
      onHeaderCell: () => ({
        className: `table-header clickable-header ${sortColumn === 'instructionRef' ? 'active-sort' : ''}`,
        onClick: () => handleSort('instructionRef'),
      }),
      render: (text: string, record: InstructionResponse) => (
        <a className="lmn-text-link" onClick={() => navigate(`/instructions/${record.instructionId}`)}>
          {text}
        </a>
      ),
    },
    {
      title: 'Source & Category',
      dataIndex: 'instructionSource',
      key: 'sourceCategory',
      width: 130,
      onHeaderCell: () => ({
        className: `table-header clickable-header ${sortColumn === 'instructionSource' ? 'active-sort' : ''}`,
        onClick: () => handleSort('instructionSource'),
      }),
      render: (_: any, record: InstructionResponse) => {
        const src = record.instructionSource || record.source || '';
        const isEmail = src.toLowerCase().includes('email');
        return (
          <El>
            <El className="lmn-d-flex lmn-align-items-center" style={{ fontWeight: 600, fontSize: '12px' }}>
              {isEmail && <Icon type="envelope" style={{ fontSize: '12px', marginRight: 4, color: '#002D72' }} />}
              {isEmail ? 'Email' : (src || '-')}
            </El>
            {record.senderEmail && <El style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>{record.senderEmail}</El>}
            <El style={{ color: '#666', marginTop: 2, fontSize: '12px' }}>{record.category || '-'}</El>
          </El>
        );
      }
    },
    {
      title: 'Client & GFC',
      dataIndex: 'clientName',
      key: 'clientInfo',
      width: 130,
      onHeaderCell: () => ({
        className: `table-header clickable-header ${sortColumn === 'clientName' ? 'active-sort' : ''}`,
        onClick: () => handleSort('clientName'),
      }),
      render: (_: any, record: InstructionResponse) => (
        <El>
          <El style={{ fontWeight: 600, fontSize: '12px' }}>{record.clientName || '-'}</El>
          <El style={{ color: '#666', fontSize: '12px', marginTop: 2 }}>{record.buildingCode || '-'}</El>
        </El>
      )
    },
    {
      title: 'Value Date',
      dataIndex: 'valueDate',
      key: 'valueDate',
      width: 130,
      onHeaderCell: () => ({
        className: `table-header clickable-header ${sortColumn === 'valueDate' ? 'active-sort' : ''}`,
        onClick: () => handleSort('valueDate'),
      }),
      render: (text: string) => text ? (
        <El className="lmn-d-flex lmn-align-items-center">
          <Icon type="calendar-dots" style={{ fontSize: '12px', marginRight: 4, color: '#002D72' }} />
          {formatDate(text)}
        </El>
      ) : '-'
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 130,
      onHeaderCell: () => ({
        className: `table-header clickable-header ${sortColumn === 'dueDate' ? 'active-sort' : ''}`,
        onClick: () => handleSort('dueDate'),
      }),
      render: (text: string) => text ? (
        <El className="lmn-d-flex lmn-align-items-center">
          <Icon type="calendar-dots" style={{ fontSize: '12px', marginRight: 4, color: '#002D72' }} />
          {formatDate(text)}
        </El>
      ) : '-'
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      width: 130,
      onHeaderCell: () => ({
        className: `table-header clickable-header ${sortColumn === 'country' ? 'active-sort' : ''}`,
        onClick: () => handleSort('country'),
      }),
      render: (text: string) => (
        <El className="lmn-d-flex lmn-align-items-center">
          <Icon type="location-pin" style={{ fontSize: '12px', marginRight: 4, color: '#002D72' }} />
          {text || '-'}
        </El>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      onHeaderCell: () => ({
        className: `table-header clickable-header ${sortColumn === 'status' ? 'active-sort' : ''}`,
        onClick: () => handleSort('status'),
      }),
      render: (text: string) => (
        <El style={{ fontSize: '12px' }}>{(text || '').replace(/_/g, ' ')}</El>
      )
    }
  ];

  // 💅 Step 4: Add Visual UI Indicators (Optional CSS)
// Open your custom styling sheet file (DashboardPage.css) and add 
// a couple of style lines to make the columns clear to click, adding an arrow asset state dynamically:

.clickable-header {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;
  }
  
  .clickable-header:hover {
    background-color: #002254 !important; /* Slightly darker than corporate blue on hover */
  }
  
  /* Add clear indicator tracking to the active column */
  .active-sort::after {
    content: ' ▲';
    font-size: 10px;
  }
  
  /* If tracking a descending toggle switch direction */
  /* You can map this dynamically using custom template strings in your className wrapper if needed */


  // 🛠️ Step 1: Create the Sorted Slice
//Scroll right above line 1126 (above the filteredOverdue.length === 0 check) and add this calculation block. 
//This ensures your active filters, sorting preferences, and pagination pages all play nicely together:

// 1. Sort the filtered data pool first using our sortedOverdueData logic wrapper
const activeSortedPool = useMemo(() => {
    const dataCopy = [...(filteredOverdue || [])];
    if (!sortColumn || !sortDirection) return dataCopy;
  
    return dataCopy.sort((a: any, b: any) => {
      // Dynamic lookups using your custom keys (handles keys like 'instructionRef')
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];
  
      if (valueA === undefined || valueA === null) return 1;
      if (valueB === undefined || valueB === null) return -1;
  
      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();
  
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredOverdue, sortColumn, sortDirection]);
  
  // 2. Slice the sorted pool down to the specific current active page view window
  const startIdx = (overduePage - 1) * overduePageSize;
  const endIdx = startIdx + overduePageSize;
  const pagedSortedOverdue = activeSortedPool.slice(startIdx, endIdx);


  // 🔀 Step 2: Swap the Table Data Prop Source//
//Now, let's update your <Table> data input on line 1131 to read from this new sorted page collection.

//Change lines 1130 to 1136 on your screen to match this:

<Table
  // CHANGED: Swapped pagedOverdue for pagedSortedOverdue
  data={pagedSortedOverdue.map(i => ({ ...i, key: i.instructionId }))}
  columns={overdueColumns}
  className="lmn-table-bordered"
  scroll={{ x: '100%' }}
  style={{ fontSize: 12 }}
/>

// 🔢 Step 3: Align Your Pagination Component Counter
//To make sure your page number listings don't break when you sort, look right under the table at the <Pagination> component (lines 1138–1143). 
// Ensure its total calculation points accurately to your data pool length:

<Pagination
  current={overduePage}
  total={filteredOverdue.length} // Keeps the row count accurate to the active filters
  pageSize={overduePageSize}
  onChange={(page: number) => setOverduePage(page)}
  size="sm"
/>

