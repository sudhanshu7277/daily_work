//1. The Page Refresh Issue (Modal Re-opening on Refresh)
If refreshing the browser causes the modal to remain open or auto-open on page load, check where isOpen / isSplitPaymentModalOpen is initialized in InstructionDetailPage.tsx:

Case A: State persisted in URL query params or sessionStorage/localStorage
If InstructionDetailPage.tsx syncs modal visibility to URL search params (e.g., ?modal=review or ?paymentId=...) or reads from sessionStorage, ensure that on initial component mount the modal state is reset to closed:



// In InstructionDetailPage.tsx:
useEffect(() => {
    // Ensure modal never auto-opens on a fresh page reload
    setIsSplitPaymentModalOpen(false);
    // If URL query parameters are used:
    const params = new URLSearchParams(window.location.search);
    if (params.has('modal') || params.has('action')) {
      params.delete('modal');
      params.delete('action');
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }
  }, []);



  //Case B: Default state initialization
Ensure the state variable is strictly initialized to false and not derived from a lingering selectedRow:


const [isSplitPaymentModalOpen, setIsSplitPaymentModalOpen] = useState<boolean>(false);





//The Fix in PaymentParent.tsxNormalize and alias both field names in the dual-blind comparison loop (handlePaymentOutput, lines 560–575) so they reference the same underlying value:   

// Inside handlePaymentOutput comparison loop:
rekeyFieldsToCheck.forEach((field) => {
    let makerRaw =
      pdr[field] !== undefined && pdr[field] !== null && pdr[field] !== ''
        ? pdr[field]
        : act[field] !== undefined && act[field] !== null && act[field] !== ''
        ? act[field]
        : rawInitial[field] !== undefined && rawInitial[field] !== null && rawInitial[field] !== ''
        ? rawInitial[field]
        : '';
  
    // Fix alias between creditorAgentAccountNumber and creditorAgentPostalAddress
    if (field === 'creditorAgentPostalAddress' || field === 'creditorAgentAccountNumber') {
      makerRaw =
        pdr.creditorAgentPostalAddress ||
        pdr.creditorAgentAccountNumber ||
        act.creditorAgentPostalAddress ||
        act.creditorAgentAccountNumber ||
        rawInitial.creditorAgentPostalAddress ||
        rawInitial.creditorAgentAccountNumber ||
        '';
    }
  
    let checkerRaw = pData[field];
    if (field === 'creditorAgentPostalAddress' || field === 'creditorAgentAccountNumber') {
      checkerRaw = pData.creditorAgentAccountNumber || pData.creditorAgentPostalAddress || '';
    }
  
    if (field === 'instructedAmountCurrencyCode') {
      checkerRaw = pData.instructedAmountCurrencyCode || pData.currency || makerRaw;
    }
  
    const makerVal = normalizeValue(makerRaw);
    const checkerVal = normalizeValue(checkerRaw);
  
    // If Maker had no value and Checker left it empty, treat as match
    if (!makerVal && !checkerVal) {
      return;
    }
  
    if (field === 'instructedAmount') {
      const mNum = parseFloat(makerVal);
      const cNum = parseFloat(checkerVal);
      if (!checkerVal || isNaN(cNum) || mNum !== cNum) {
        failed.push(field);
      }
    } else {
      if (!checkerVal || makerVal !== checkerVal) {
        failed.push(field);
      }
    }
  });