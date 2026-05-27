/// Step 1: Initialize the Page States
//Scroll to the very top of your ApprovalQueuePage component function. 
// Right around line 48 (where useNavigate is called), add your tracking state hooks:

// Add these at the top of your component function
const [sortColumn, setSortColumn] = useState<string | null>('instructionRef');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>('desc');

// The cycle state toggle handler: Ascending -> Descending -> Unsorted
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


//🔀 Step 2: Update the filteredData Logic Block
// Locate your data filtering loop (const filteredData = useMemo(...)). 
//We want to insert the array sorting routine right after your valueDateRange filtering block processes but before the component hits return result;.

// // Update that entire useMemo block to look like this:
const filteredData = useMemo(() => {
    let result = data.content;

    // 1. Existing Search Term Filter Block
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

    // 2. Existing Value Date Range Filter Block
    if (valueDateRange && valueDateRange[0] && valueDateRange[1]) {
      result = result.filter(i => {
        if (!i.dueDate) return false;
        const dueDate = new Date(i.dueDate);
        return dueDate >= valueDateRange[0] && dueDate <= valueDateRange[1];
      });
    }

    // 3. NEW: Pure Inline Copy Sorting Loop
    if (sortColumn && sortDirection) {
      result = [...result].sort((a: any, b: any) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];

        // Push null, blank, or missing rows elegantly to the bottom
        if (valueA === undefined || valueA === null) return 1;
        if (valueB === undefined || valueB === null) return -1;

        // Normalize data values into standardized lowercase comparison strings
        valueA = String(valueA).toLowerCase().trim();
        valueB = String(valueB).toLowerCase().trim();

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;

    // Hook our reactive state dependencies down to the monitor layout array below
  }, [data.content, searchTerm, valueDateRange, sortColumn, sortDirection]);


  //🎨 Step 3: Wire Up the Component columns Definition Array
///Let's rebuild your columns config block. We will pass a styled layout button frame to our header titles. By forcing opacity: 1 and mapping the color token to #b3c6ff (a light pastel slate-blue), 
//the buttons remain fully visible on the background all the time without blending into the canvas text.

const columns: any = [
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
                  : 'swap'
            } 
            style={{ 
              fontSize: '12px', 
              marginLeft: '6px', 
              color: sortColumn === 'instructionRef' ? '#ffffff' : '#b3c6ff', 
              opacity: 1 
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
    {
      title: (
        <El 
          className="lmn-d-flex lmn-align-items-center" 
          onClick={() => handleSort('source')} 
          style={{ cursor: 'pointer', userSelect: 'none', width: '100%' }}
        >
          <span style={{ marginRight: 'auto' }}>Source & Category</span>
          <Icon 
            type={
              sortColumn === 'source' && sortDirection === 'asc' 
                ? 'arrow-up' 
                : sortColumn === 'source' && sortDirection === 'desc' 
                  ? 'arrow-down' 
                  : 'swap'
            } 
            style={{ 
              fontSize: '12px', 
              marginLeft: '6px', 
              color: sortColumn === 'source' ? '#ffffff' : '#b3c6ff', 
              opacity: 1 
            }} 
          />
        </El>
      ),
      dataIndex: 'source',
      key: 'source',
      width: 140,
      onHeaderCell: () => ({
        style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
      }),
      render: (source: string) => {
        if (!source) return '-';
        if (source.includes(' - ')) {
          const parts = source.split(' - ');
          return (
            <El style={{ fontSize: '12px', lineHeight: '14px' }}>
              <El className="lmn-d-flex lmn-flex-column">
                <span style={{ fontWeight: 700, color: '#000000' }}>{parts[0]}</span>
                <span style={{ color: '#666666', marginTop: '2px', fontSize: '11px' }}>{parts.slice(1).join(' - ')}</span>
              </El>
            </El>
          );
        }
        return (
          <El style={{ fontSize: '12px', lineHeight: '14px' }}>
            <span style={{ fontWeight: 700, color: '#000000' }}>{source}</span>
          </El>
        );
      }
    },
    {
      title: (
        <El 
          className="lmn-d-flex lmn-align-items-center" 
          onClick={() => handleSort('clientName')} 
          style={{ cursor: 'pointer', userSelect: 'none', width: '100%' }}
        >
          <span style={{ marginRight: 'auto' }}>Client, GFC & Country</span>
          <Icon 
            type={
              sortColumn === 'clientName' && sortDirection === 'asc' 
                ? 'arrow-up' 
                : sortColumn === 'clientName' && sortDirection === 'desc' 
                  ? 'arrow-down' 
                  : 'swap'
            } 
            style={{ 
              fontSize: '12px', 
              marginLeft: '6px', 
              color: sortColumn === 'clientName' ? '#ffffff' : '#b3c6ff', 
              opacity: 1 
            }} 
          />
        </El>
      ),
      dataIndex: 'clientName',
      key: 'clientName',
      width: 165,
      onHeaderCell: () => ({
        style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
      }),
      render: (name: string, record: InstructionResponse) => (
        <El style={{ fontSize: '12px', lineHeight: '14px' }}>
          <El className="lmn-d-flex lmn-flex-column">
            <span style={{ fontWeight: 700, color: '#000000' }}>{name || '-'}</span>
            {record.accountNumber && <span style={{ color: '#666666', marginTop: '2px', fontSize: '11px' }}>{record.accountNumber}</span>}
            {record.country && <span style={{ color: '#666666', marginTop: '2px', fontSize: '11px' }}>{record.country}</span>}
          </El>
        </El>
      )
    },
    {
      title: (
        <El 
          className="lmn-d-flex lmn-align-items-center" 
          onClick={() => handleSort('dealName')} 
          style={{ cursor: 'pointer', userSelect: 'none', width: '100%' }}
        >
          <span style={{ marginRight: 'auto' }}>Deal & Deal Key</span>
          <Icon 
            type={
              sortColumn === 'dealName' && sortDirection === 'asc' 
                ? 'arrow-up' 
                : sortColumn === 'dealName' && sortDirection === 'desc' 
                  ? 'arrow-down' 
                  : 'swap'
            } 
            style={{ 
              fontSize: '12px', 
              marginLeft: '6px', 
              color: sortColumn === 'dealName' ? '#ffffff' : '#b3c6ff', 
              opacity: 1 
            }} 
          />
        </El>
      ),
      dataIndex: 'dealName',
      key: 'dealName',
      width: 130,
      onHeaderCell: () => ({
        style: { backgroundColor: '#003DA5', color: '#ffffff', fontSize: '12px' }
      }),
      render: (deal: string, record: InstructionResponse) => {
        const subValue = record.instructionRef || record.purposeOfPayment;
        return (
          <El style={{ fontSize: '12px', lineHeight: '14px' }}>
            <El className="lmn-d-flex lmn-flex-column">
              <span style={{ fontWeight: 700, color: '#000000' }}>{deal || '-'}</span>
              {subValue && <span style={{ color: '#666666', marginTop: '2px', fontSize: '11px' }}>{subValue}</span>}
            </El>
          </El>
        );
      }
    }
  ];


  // 🎚️ Step 4: Verify the Table Data Map Prop
//Look at line 333 in your component file code template block. 
////Your raw dataset mapping variable tableData is already tracking our filteredData utility hook:

const tableData = filteredData.map((item) => ({ ...item, key: item.instructionId }));