//🧱 1. Declare the Base States & Sorting Handler
//Scroll to the very top of your ApprovalQueuePage component function 
// (Image 90). Right beneath your useNavigate() declaration, insert your state tracking hooks:

// 1. Set Sequence No. and Descending as the default state on initial page mount
const [sortColumn, setSortColumn] = useState<string | null>('instructionRef');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>('desc');

// 2. Clear two-way state toggle matrix loop handler
const handleSort = (columnKey: string) => {
  if (sortColumn === columnKey) {
    // If clicking the active column, strictly toggle between up and down arrow directions
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  } else {
    // If switching to a new column, instantly highlight it and start with ascending order
    setSortColumn(columnKey);
    setSortDirection('asc');
  }
};


//🔀 2. Replace the filteredData UseMemo Logic Block
//Locate your data filtering hook loop (Image 91 / Lines 159 to 181). Replace the entire 
// function block with this code, which handles the string mapping calculations, filters, and safe array cloning:

const filteredData = useMemo(() => {
    let result = data.content;

    // A. Text Search Term Filtering Block
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

    // B. Value Date Range Filtering Block
    if (valueDateRange && valueDateRange[0] && valueDateRange[1]) {
      result = result.filter(i => {
        if (!i.dueDate) return false;
        const dueDate = new Date(i.dueDate);
        return dueDate >= valueDateRange[0] && dueDate <= valueDateRange[1];
      });
    }

    // C. NEW: Automatic Data Sort Processing Logic Layer
    if (sortColumn && sortDirection) {
      result = [...result].sort((a: any, b: any) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];

        // Gracefully isolate empty or missing rows at the very bottom
        if (valueA === undefined || valueA === null) return 1;
        if (valueB === undefined || valueB === null) return -1;

        // Force data variables to clean lowercase strings for flawless alphabetical tracking
        valueA = String(valueA).toLowerCase().trim();
        valueB = String(valueB).toLowerCase().trim();

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;

    // Reactively watch for sorting toggles inside the dependency array setup below
  }, [data.content, searchTerm, valueDateRange, sortColumn, sortDirection]);


  // 🎨 3. Update the Complete columns Array Definition
//Scroll down to your table column mapping array configuration block (Images 92–95 / Lines 135 to 331). Replace the structural setup for y
// our first four columns with this layout, which renders the persistent sorting indicators:

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
              sortColumn === 'instructionRef' 
                ? (sortDirection === 'asc' ? 'arrow-up' : 'arrow-down') 
                : 'swap' // Shows double-arrow indicator by default on page load!
            } 
            style={{ 
              fontSize: '12px', 
              marginLeft: '6px', 
              color: sortColumn === 'instructionRef' ? '#ffffff' : '#b3c6ff', 
              opacity: 1 // Completely visible at all times
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
              sortColumn === 'source' 
                ? (sortDirection === 'asc' ? 'arrow-up' : 'arrow-down') 
                : 'swap' // Shows double-arrow indicator by default on page load!
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
              sortColumn === 'clientName' 
                ? (sortDirection === 'asc' ? 'arrow-up' : 'arrow-down') 
                : 'swap' // Shows double-arrow indicator by default on page load!
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
              sortColumn === 'dealName' 
                ? (sortDirection === 'asc' ? 'arrow-up' : 'arrow-down') 
                : 'swap' // Shows double-arrow indicator by default on page load!
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
    },
    // ... Keep your remaining columns (Tickler Task Id, Value Date, Status, etc.) exactly as they are configured
  ];

  