//1. The Partial Typing & Numeric Currency IssueAt lines 641–644:   

if (field === 'instructedAmount') {
    const mNum = parseFloat(makerVal);
    const cNum = parseFloat(checkerVal);
    if (!checkerVal || isNaN(cNum) || mNum !== cNum) {
      failed.push(field);
    }
  }


  //normalizeValue

  return String(val).replace(/\/V/g, '').replace(/,/g, '').trim().toLowerCase();

  //2. Live Debugging Feedback While TypingTo see in your browser 
  // console exactly which fields match or fail as you type in Checker
  //  mode, add a debug log right before setCheckerDualBlindPassed (around line 653):   

  if (activeTab === 'checker') {
    console.log('[DualBlind Rekey Check]', {
      failedCount: failed.length,
      failedFields: failed,
      isPassed: failed.length === 0,
    });
  }
