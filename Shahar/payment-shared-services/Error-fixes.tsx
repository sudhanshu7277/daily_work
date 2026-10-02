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

  //
  // 
  const isManualPassed = failed.length === 0;
  const isPassed = isManualPassed || Boolean(newDualBlind);
  setCheckerDualBlindPassed(isPassed);
  setCheckerFailedFields(failed);

  if (activeTab === 'checker') {
    console.log('[DualBlind Rekey Check]', {
      failedCount: failed.length,
      failedFields: failed,
      isPassed: failed.length === 0,
    });
    return;
  }
