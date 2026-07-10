// Step 1: Add the Page State
//At the top of your AppLayout component, you only need to add the currentPage state. Ensure you have deleted those extra unused variables (allReworkInstructions and ITEMS_PER_PAGE) from your previous screenshot.

//Add this around line 35:

const [currentPage, setCurrentPage] = useState(1);


// Update handleBellClick
//Instead of slicing the first 10 items, we want to save the entire API response into your existing reworkInstructions state and reset the page back to 1.

//Replace the .then block inside getReworkInstructions() (around line 60) with this:

.then(res => {
    const completeArrayResponse = (res.data && res.data.length) ? res.data : [];
    setReworkInstructions(completeArrayResponse);
    setCurrentPage(1); 
  })

  // Step 3: Update the Table and Add Buttons
//Find where your table renders (around line 367). 
// Replace the entire <table> block right down to just above 
// {/* Team Alerts */} with this updated code. This handles slicing t
// he data dynamically and includes the Previous/Next buttons.


<El tag="table" style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
  <El tag="tbody">
    {/* 🚀 Slice the array dynamically based on the page */}
    {reworkInstructions
      .slice((currentPage - 1) * 10, currentPage * 10)
      .map(instr => (
      <El 
        tag="tr" 
        key={instr.instructionId} 
        style={{ borderBottom: '1px solid var(--lmn-border-color, #eee)', cursor: 'pointer' }}
        onClick={() => navigate(`/instructions/${instr.instructionId}`)}
      >
        <El tag="td" style={{ padding: '6px 4px' }}>
          <El style={{ fontWeight: 600, color: 'var(--lmn-color-primary, #002D72)' }}>
            {instr.instructionRef}
          </El>
          <El style={{ fontSize: 10, color: 'var(--lmn-text-weak, #888)' }}>
            {instr.status.replace(/_/g, ' ')}
          </El>
        </El>
      </El>
    ))}
  </El>
</El>

{/* 🚀 Pagination Controls */}
{reworkInstructions.length > 10 && (
  <El className="lmn-d-flex lmn-justify-content-between lmn-align-items-center" style={{ padding: '12px 4px 4px 4px', marginTop: '4px' }}>
    <button
      disabled={currentPage === 1}
      onClick={(e) => { 
        e.stopPropagation(); 
        setCurrentPage(prev => Math.max(prev - 1, 1)); 
      }}
      style={{
        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
        opacity: currentPage === 1 ? 0.5 : 1,
        fontSize: '11px',
        padding: '4px 8px',
        border: '1px solid #ccc',
        borderRadius: '3px',
        background: '#fff',
        color: '#333'
      }}
    >
      Previous
    </button>
    
    <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--lmn-text-weak, #666)' }}>
      Page {currentPage} of {Math.ceil(reworkInstructions.length / 10)}
    </span>
    
    <button
      disabled={currentPage === Math.ceil(reworkInstructions.length / 10)}
      onClick={(e) => { 
        e.stopPropagation(); 
        setCurrentPage(prev => Math.min(prev + 1, Math.ceil(reworkInstructions.length / 10))); 
      }}
      style={{
        cursor: currentPage === Math.ceil(reworkInstructions.length / 10) ? 'not-allowed' : 'pointer',
        opacity: currentPage === Math.ceil(reworkInstructions.length / 10) ? 0.5 : 1,
        fontSize: '11px',
        padding: '4px 8px',
        border: '1px solid #ccc',
        borderRadius: '3px',
        background: '#fff',
        color: '#333'
      }}
    >
      Next
    </button>
  </El>
)}