// Step 1: Ensure makerRaw Pulls from pdr First
// In PaymentParent.tsx around line 1130 (from image_32.png / 
// image_33.png), check pdr[field] for an actual truthy/non-empty value first:

const rawInitial = (initialData as any) || {};
const pdr = rawInitial.paymentDetailsRequest || {};
const act = rawInitial.actionDetails || {};

const failed: string[] = [];

DUAL_BLIND_REKEY_FIELDS.forEach((field) => {
  // 1. Read from maker's paymentDetailsRequest first, then actionDetails, then root
  const makerRaw =
    pdr[field] !== undefined && pdr[field] !== null && pdr[field] !== ''
      ? pdr[field]
      : act[field] !== undefined && act[field] !== null && act[field] !== ''
      ? act[field]
      : rawInitial[field] !== undefined && rawInitial[field] !== null && rawInitial[field] !== ''
      ? rawInitial[field]
      : '';

  // 2. Read what checker typed
  let checkerRaw = pData[field];
  if (field === 'instructedAmountCurrencyCode') {
    checkerRaw = pData.instructedAmountCurrencyCode || pData.currency || makerRaw;
  }

  const makerVal = normalizeValue(makerRaw);
  const checkerVal = normalizeValue(checkerRaw);

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


//Step 2: Render the Comparison Note on the UIAdd the UI message 
// directly above the action container buttons (around line 1895 in image_45.png): 


{activeTab === 'checker' && checkerFailedFields.length === 0 && (
  <div
    style={{
      marginBottom: '14px',
      padding: '10px 14px',
      backgroundColor: '#e6f4ea',
      border: '1px solid #34a853',
      borderRadius: '4px',
      color: '#137333',
      fontSize: '13px',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}
  >
    <span style={{ fontSize: '16px' }}>✓</span>
    <span>
      Comparison successful: Rekeyed details and instructed amount match maker record ({initialData?.paymentDetailsRequest?.instructedAmount ?? initialData?.instructedAmount}).
    </span>
  </div>
)}