//

const [allReworkInstructions, setAllReworkInstructions] = useState<any[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 10;

// Replace lines 60 to 68 with this:

getReworkInstructions()
  .then(res => {
    const completeArrayResponse = (res.data && res.data.length) ? res.data : [];
    
    // Store the complete array of 262 records
    setAllReworkInstructions(completeArrayResponse);
    
    // Always reset to page 1 when opening the panel
    setCurrentPage(1); 
  })
  .catch(() => setAllReworkInstructions([]))
  .finally(() => setAlertsLoading(false));


  // Step 3: Calculate the Current Slice
// Right above your return statement in the component, 
// //calculate exactly which 10 items should be shown based on the current page.

// Calculate total pages (e.g., 262 records / 10 = 27 pages)
const totalPages = Math.ceil(allReworkInstructions.length / ITEMS_PER_PAGE);

// Dynamically slice the full array for the current page
const paginatedInstructions = allReworkInstructions.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);


/// Step 4: Add the Next/Previous Controls


{/* 🚀 PAGINATION CONTROLS: Only show if there is more than 1 page */}
{totalPages > 1 && (
    <El 
      className="lmn-d-flex lmn-justify-content-between lmn-align-items-center" 
      style={{ padding: '12px 16px', borderTop: '1px solid #e0e0e0', marginTop: 'auto' }}
    >
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        style={{ 
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer', 
          opacity: currentPage === 1 ? 0.5 : 1,
          fontSize: '11px', 
          padding: '4px 8px',
          border: '1px solid #ccc',
          borderRadius: '3px',
          background: '#fff'
        }}
      >
        Previous
      </button>
      
      <span style={{ fontSize: '11px', fontWeight: 600 }}>
        Page {currentPage} of {totalPages}
      </span>
      
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        style={{ 
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', 
          opacity: currentPage === totalPages ? 0.5 : 1,
          fontSize: '11px', 
          padding: '4px 8px',
          border: '1px solid #ccc',
          borderRadius: '3px',
          background: '#fff'
        }}
      >
        Next
      </button>
    </El>
  )}

  